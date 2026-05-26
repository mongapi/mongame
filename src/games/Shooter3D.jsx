import React, { useMemo, useState, useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import RoomCanvas from '../components/canvas3D/scenes/RoomCanvas';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, ShieldAlert, Zap, Award, RotateCcw, AlertTriangle } from 'lucide-react';
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { GameExitButton, GameSessionFinishedOverlay, useGameSessionUi } from '@/games/shared/GameSessionActions';
import { useSessionGame } from '@/hooks/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';
import { EnemyBot } from '@/components/canvas3D/meshes/characters/EnemyBot';
import { Room } from '@/components/canvas3D/meshes/environments/room';

function resolveShootingContent(gameContent) {
  const questions = Array.isArray(gameContent?.questions)
    ? gameContent.questions.map((question, questionIndex) => ({
      id: question.id ?? `shooting-${questionIndex + 1}`,
      q: question.text,
      answers: (question.options ?? []).map((option, optionIndex) => ({
        text: option,
        correct: Number(question.correct) === optionIndex,
        value: optionIndex,
        id: `${question.id ?? questionIndex}-${optionIndex}`,
      })),
    }))
    : [];

  return { questions };
}

const INTER_FONT = "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf";

// The Computer Enemy (Boss)
const EnemyBoss = ({ health, maxHealth, isComputing, tookDamage, isEntering, isDying }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Bobbing/hover effect & Hit shake
    if (isDying) {
      // Boss is dead/dying: keep it completely still so the death animation plays cleanly
      meshRef.current.position.y = -2.4;
      meshRef.current.position.x = 0;
    } else if (!tookDamage) {
      // Normal floating bobbing effect
      meshRef.current.position.y = -2.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      meshRef.current.position.x = 0;
    } else {
      // Rapid horizontal hit shake (X axis) when taking damage (even the final blow!)
      meshRef.current.position.y = -2.4;
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.15;
    }

    // Scale physics
    const baseScale = 1.3;
    const targetScale = tookDamage ? baseScale * 1.3 : (isComputing ? baseScale * 1.1 + Math.sin(state.clock.elapsedTime * 10) * 0.05 : baseScale);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const healthPercent = health / maxHealth;

  return (
    <group position={[-3.0, 1.5, -7]}>
      <group ref={meshRef} position={[0, -2.0, 0]} rotation={[0, 0, 0]} scale={1.25}>
        <Suspense fallback={null}>
          <EnemyBot
            tookDamage={tookDamage}
            animationState={
              isDying
                ? 'death'
                : isEntering
                  ? 'entrance'
                  : isComputing
                    ? 'attack'
                    : 'idle'
            }
          />
        </Suspense>
      </group>
      <Text position={[0, 4.6, 0.5]} fontSize={0.42} color="#cbd5e1" font={INTER_FONT} anchorX="center" anchorY="bottom">
        SISTEMA CENTRAL
      </Text>
      {/* Enemy Health Bar */}
      <mesh position={[0, 4.2, 0.5]}>
        <planeGeometry args={[4.0, 0.28]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-2.0 + (4.0 * healthPercent) / 2, 4.2, 0.51]}>
        <planeGeometry args={[4.0 * healthPercent, 0.28]} />
        <meshBasicMaterial color={tookDamage ? "#ef4444" : "#10b981"} />
      </mesh>
      {/* HP Numeric Text */}
      <Text position={[0, 2.5, 0.5]} fontSize={0.24} color="#94a3b8" font={INTER_FONT} anchorX="center" anchorY="bottom">
        {`${health} / ${maxHealth} HP`}
      </Text>

      {/* Cyber particles when computing/attacking */}
      {isComputing && !tookDamage && <Sparkles count={100} scale={5} size={4} speed={2} opacity={0.5} color="#ec4899" />}
    </group>
  );
};

// A floating answer target
const AnswerTarget = ({ answer, position, onClick, disabled }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const color = hovered ? '#ec4899' : '#3b82f6';

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.5;
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={(e) => {
        if (!disabled) {
          e.stopPropagation();
          onClick(answer);
        }
      }}
      onPointerOver={() => !disabled && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh castShadow>
          <boxGeometry args={[2.8, 1.1, 0.35]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.7 : 0.25}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, 0, 0.25]}
          fontSize={0.28}
          maxWidth={2.6}
          textAlign="center"
          color="white"
          anchorX="center"
          anchorY="middle"
          font={INTER_FONT}
        >
          {answer.text}
        </Text>
      </Float>
    </group>
  );
};

export default function Shooter3D() {
  const { session, content, sessionId, participant, isLoading, error, setError } = useSessionGame({
    resolveContent: resolveShootingContent,
    validateContent: (resolvedContent) => validateGameContent('shooting', {
      questions: resolvedContent.questions.map((question) => ({
        id: question.id,
        text: question.q,
        options: question.answers.map((answer) => answer.text),
        correct: question.answers.findIndex((answer) => answer.correct),
      })),
    }),
  });

  const questions = useMemo(() => content.questions ?? [], [content.questions]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const maxEnemyHealth = questions.length * 100;
  const [enemyHealth, setEnemyHealth] = useState(maxEnemyHealth);

  const [isComputing, setIsComputing] = useState(false);
  const [tookDamage, setTookDamage] = useState(false);
  const [feedback, setFeedback] = useState(null); // { text, type }
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const { sessionFinished, handleExit, exitLabel, finishActionLabel } = useGameSessionUi({ session, sessionId, isPreview: false });

  // Controlar la animación de entrada al iniciar o reiniciar
  const [isEntering, setIsEntering] = useState(true);
  useEffect(() => {
    if (gameState === 'playing' && qIndex === 0) {
      setIsEntering(true);
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsEntering(false);
    }
  }, [gameState, qIndex]);

  // Estado para la muerte retrasada y dramática
  const [isDying, setIsDying] = useState(false);

  useEffect(() => {
    setEnemyHealth(maxEnemyHealth);
    setQIndex(0);
    setScore(0);
    setGameState('playing');
    setFeedback(null);
    setIsComputing(false);
    setTookDamage(false);
    setIsDying(false);
    setStartedAt(Date.now());
    setError('');
  }, [maxEnemyHealth]);

  const handleShoot = async (answer) => {
    if (sessionFinished || gameState !== 'playing' || isComputing) return;

    setIsComputing(true);
    setError('');

    if (sessionId) {
      const result = await sessionAPI.submitAnswer(sessionId, {
        question_id: currentQ.id,
        answer: answer.value,
        device_id: participant.deviceId,
        player_name: participant.playerName,
        player_number: 1,
        elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
        completed: qIndex === questions.length - 1,
      });

      if (!result.success) {
        setError(result.error);
      }
    }

    const nextScore = score + (answer.correct ? 100 : -50);
    const nextHealth = answer.correct ? Math.max(0, enemyHealth - 100) : enemyHealth;

    if (answer.correct) {
      setFeedback({ text: "¡IMPACTO CRÍTICO!", type: "success" });
      setTookDamage(true);
      setScore(nextScore);
      setEnemyHealth(nextHealth);
    } else {
      setFeedback({ text: "¡FALLASTE! El sistema ha contraatacado.", type: "error" });
      setScore(Math.max(0, nextScore));
      setEnemyHealth(nextHealth);
    }

    const isLastQuestion = qIndex === questions.length - 1;
    const isDefeated = nextHealth === 0;

    if (isDefeated) {
      // El robot ha perdido toda su vida: 
      // 1. Durante los primeros 2 segundos, se muestra el temblor (tookDamage es true) y mantiene su animación activa.
      // 2. Después de 2 segundos, deja de temblar y activa la animación de muerte (isDying es true).
      // 3. Después de 6 segundos en total, se muestra la pantalla de victoria (gameState = won).

      // Timer para transicionar del temblor a la muerte a los 2 segundos
      setTimeout(() => {
        setTookDamage(false);
        setIsDying(true);
      }, 2000);

      // Timer para terminar la partida a los 6 segundos
      setTimeout(() => {
        setFeedback(null);
        setIsComputing(false);
        setIsDying(false);
        setGameState('won');
      }, 6000);
    } else {
      setTimeout(() => {
        setTookDamage(false);
        setFeedback(null);
        setIsComputing(false);

        if (isLastQuestion) {
          setGameState(isDefeated ? 'won' : 'lost');
        } else {
          setQIndex(prev => prev + 1);
        }
      }, 2000);
    }
  };

  if (isLoading) {
    return <GameLoadingState title="Cargando shooter..." />;
  }

  if (error || questions.length === 0) {
    return <GameErrorState message={error || 'Este shooter no tiene preguntas configuradas todavía.'} />;
  }

  const restartGame = () => {
    setQIndex(0);
    setScore(0);
    setEnemyHealth(maxEnemyHealth);
    setGameState('playing');
    setFeedback(null);
    setIsComputing(false);
    setTookDamage(false);
    setIsEntering(true);
    setIsDying(false);
  };

  // Posiciones de los "objetivos" (las 4 respuestas) en la escena
  const targetPositions = [
    [-7, 3, -4],
    [1, 3, -4],
    [-5, 1, -2],
    [-1, 1, -2]
  ];

  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden relative cursor-crosshair">
      <GameExitButton onExit={handleExit} label={exitLabel} />
      <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />
      {/* UI Overlay - Top HUD */}
      <header className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg pointer-events-auto">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <Crosshair className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                Cyber Target 3D
              </h1>
              <div className="flex items-center gap-2 text-sm text-zinc-400 font-semibold tracking-wider mt-0.5">
                <Award className="w-4 h-4 text-amber-400" />
                PUNTUACIÓN: <span className="text-white">{score}</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-3 rounded-xl border pointer-events-auto backdrop-blur-md font-bold text-sm flex items-center gap-2 ${feedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  }`}
              >
                {feedback.type === 'success' ? <Zap className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5 animate-bounce" />}
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </header>

      {/* Main Game Interface (Overlaid Question) */}
      {gameState === 'playing' && (
        <div className="absolute inset-x-0 bottom-12 z-10 flex justify-center pointer-events-none">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/80 backdrop-blur-xl border border-indigo-500/40 shadow-[0_8px_30px_rgba(99,102,241,0.2)] max-w-3xl w-full mx-4 rounded-3xl px-5 py-4 md:px-6 md:py-5 text-center pointer-events-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            <h3 className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Cargando Pregunta {qIndex + 1} de {questions.length}
            </h3>
            <p className="text-lg md:text-xl font-bold text-white leading-snug">
              {currentQ.q}
            </p>
            <p className="text-xs md:text-sm font-medium text-zinc-500 mt-3 bg-zinc-900 inline-block px-4 py-1.5 rounded-full border border-zinc-800">
              Apunta y dispara a la respuesta correcta
            </p>
          </motion.div>
        </div>
      )}

      {/* 3D Canvas */}
      <main className="flex-1 w-full h-full">
        {/* We reuse RoomCanvas but adjust styling or pass children directly */}
        <RoomCanvas cameraPosition={[-3.0, 1.5, 8.5]} orbitTarget={[-3.0, 1.5, 0]}>
          {/* Escena dinámica */}
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 10, 0]} intensity={1.5} color="#4f46e5" />

          <EnemyBoss
            health={enemyHealth}
            maxHealth={maxEnemyHealth}
            isComputing={isComputing}
            tookDamage={tookDamage}
            isEntering={isEntering}
            isDying={isDying}
          />

          {/* Fondo 3D de la sala/garaje que envuelve toda la escena */}
          <Suspense fallback={null}>
            <Room position={[-3.4, -1.5, 1.6]} scale={[2.2, 2.2, 2.2]} rotation={[0, Math.PI / 2, 0]} />
          </Suspense>

          {gameState === 'playing' && !isComputing && currentQ.answers.map((ans, idx) => (
            <AnswerTarget
              key={ans.id}
              answer={ans}
              position={targetPositions[idx]}
              onClick={handleShoot}
              disabled={isComputing}
            />
          ))}
        </RoomCanvas>
      </main>

      {/* End Game Modal */}
      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 p-10 rounded-3xl max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${gameState === 'won' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${gameState === 'won' ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' : 'bg-rose-500/20 text-rose-400 shadow-rose-500/20'
                }`}>
                {gameState === 'won' ? <Award className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
              </div>

              <h2 className="text-3xl font-semibold text-white mb-3">
                {gameState === 'won' ? '¡SISTEMA DERROTADO!' : '¡MISIÓN FALLIDA!'}
              </h2>
              <p className="text-zinc-400 mb-8 text-base leading-7 font-normal">
                {gameState === 'won'
                  ? 'Has neutralizado al sistema enemigo respondiendo correctamente sus acertijos cibernéticos.'
                  : 'El sistema enemigo ha evadido tus respuestas. Tus conocimientos no fueron suficientes esta vez.'}
              </p>

              <div className="bg-black/50 rounded-2xl p-6 mb-8 border border-white/5 flex justify-center gap-12">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Puntuación Final</p>
                  <p className="text-4xl font-black text-amber-400">{score}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">HP Enemigo</p>
                  <p className="text-4xl font-black text-rose-400">{enemyHealth}</p>
                </div>
              </div>

              <button
                onClick={restartGame}
                disabled={sessionFinished}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all group bg-white text-black hover:bg-zinc-200"
              >
                <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                Volver a intentar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
