import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import RoomCanvas from '../components/canvas3D/scenes/RoomCanvas';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, ShieldAlert, Zap, Award, RotateCcw, AlertTriangle } from 'lucide-react';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { useSessionGame } from '@/games/shared/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';

function resolveShootingContent(gameContent) {
  const questions = Array.isArray(gameContent?.questions)
    ? gameContent.questions.map((question, questionIndex) => ({
        q: question.text,
        answers: (question.options ?? []).map((option, optionIndex) => ({
          text: option,
          correct: Number(question.correct) === optionIndex,
          id: `${question.id ?? questionIndex}-${optionIndex}`,
        })),
      }))
    : [];

  return { questions };
}

const INTER_FONT = "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf";

// The Computer Enemy (Boss)
const EnemyBoss = ({ health, maxHealth, isComputing, tookDamage }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Constant rotation
    meshRef.current.rotation.y += delta * 0.5;
    meshRef.current.rotation.x += delta * 0.2;

    // Pulsating effect based on computing state and damage
    const targetScale = tookDamage ? 1.5 : (isComputing ? 1.2 + Math.sin(state.clock.elapsedTime * 10) * 0.1 : 1);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const healthPercent = health / maxHealth;
  const color = tookDamage ? '#ef4444' : (healthPercent > 0.5 ? '#8b5cf6' : '#eab308');

  return (
    <group position={[0, 4, -8]}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={tookDamage ? 1 : 0.5}
          wireframe={healthPercent <= 0.3 && !tookDamage}
        />
      </mesh>
      <Text position={[0, 3, 0]} fontSize={0.5} color="#cbd5e1" font={INTER_FONT} anchorX="center" anchorY="bottom">
        SISTEMA CENTRAL
      </Text>
      {/* Enemy Health Bar */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[4, 0.2]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-2 + (4 * healthPercent) / 2, 2.5, 0.01]}>
        <planeGeometry args={[4 * healthPercent, 0.2]} />
        <meshBasicMaterial color={tookDamage ? "#ef4444" : "#10b981"} />
      </mesh>

      {isComputing && <Sparkles count={100} scale={5} size={4} speed={2} opacity={0.5} color="#ec4899" />}
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
          <boxGeometry args={[3.2, 1.2, 0.4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.6 : 0.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Frontera de neón simulada */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[3.3, 1.3, 0.38]} />
          <meshBasicMaterial color={hovered ? "#fbcfe8" : "#93c5fd"} wireframe transparent opacity={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.21]}
          fontSize={0.28}
          maxWidth={3}
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
  const { content, isLoading, error } = useSessionGame({
    resolveContent: resolveShootingContent,
    validateContent: (resolvedContent) => validateGameContent('shooting', {
      questions: resolvedContent.questions.map((question) => ({
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

  useEffect(() => {
    setEnemyHealth(maxEnemyHealth);
    setQIndex(0);
    setScore(0);
    setGameState('playing');
    setFeedback(null);
    setIsComputing(false);
    setTookDamage(false);
  }, [maxEnemyHealth]);

  const handleShoot = (answer) => {
    if (gameState !== 'playing' || isComputing) return;

    setIsComputing(true);

    if (answer.correct) {
      setFeedback({ text: "¡IMPACTO CRÍTICO!", type: "success" });
      setTookDamage(true);
      setScore(prev => prev + 100);
      setEnemyHealth(prev => Math.max(0, prev - 100));
    } else {
      setFeedback({ text: "¡FALLASTE! El sistema ha contraatacado.", type: "error" });
      setScore(prev => Math.max(0, prev - 50));
    }

    setTimeout(() => {
      setTookDamage(false);
      setFeedback(null);
      setIsComputing(false);

      if (qIndex < questions.length - 1) {
        setQIndex(prev => prev + 1);
      } else {
        // En of game
        if (score > 0 || enemyHealth === 0) {
          setGameState('won');
        } else {
          setGameState('lost');
        }
      }
    }, 2000);
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
  };

  // Posiciones de los "objetivos" (las 4 respuestas) en la escena
  const targetPositions = [
    [-4, 3, -4],
    [4, 3, -4],
    [-2, 1, -2],
    [2, 1, -2]
  ];

  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden relative cursor-crosshair">
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

        <div className="bg-zinc-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 border-t-rose-500/50 shadow-lg shadow-rose-500/10 pointer-events-auto min-w-50 text-right">
          <h2 className="text-sm font-bold text-rose-400 flex items-center justify-end gap-2 mb-2 uppercase tracking-widest">
            Sistema Enemigo <ShieldAlert className="w-4 h-4" />
          </h2>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-linear-to-r from-rose-600 to-orange-500 h-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(enemyHealth / maxEnemyHealth) * 100}%` }}
              transition={{ type: 'spring', bounce: 0.2 }}
            />
          </div>
          <p className="text-zinc-500 text-xs font-mono mt-1 pr-1">{enemyHealth} / {maxEnemyHealth} HP</p>
        </div>
      </header>

      {/* Main Game Interface (Overlaid Question) */}
      {gameState === 'playing' && (
        <div className="absolute inset-x-0 top-170 z-10 flex justify-center pointer-events-none">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/80 backdrop-blur-xl border border-indigo-500/40 shadow-[0_10px_40px_rgba(99,102,241,0.2)] max-w-2xl w-full mx-4 rounded-3xl p-6 text-center pointer-events-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            <h3 className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Cargando Pregunta {qIndex + 1} de {questions.length}
            </h3>
            <p className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-br from-white to-zinc-400 leading-tight">
              {currentQ.q}
            </p>
            <p className="text-sm font-medium text-zinc-500 mt-4 bg-zinc-900 inline-block px-4 py-1.5 rounded-full border border-zinc-800">
              Apunta y dispara a la respuesta correcta
            </p>
          </motion.div>
        </div>
      )}

      {/* 3D Canvas */}
      <main className="flex-1 w-full h-full">
        {/* We reuse RoomCanvas but adjust styling or pass children directly */}
        <RoomCanvas cameraPosition={[0, 4, 12]}>
          {/* Escena dinámica */}
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 10, 0]} intensity={1.5} color="#4f46e5" />

          <EnemyBoss
            health={enemyHealth}
            maxHealth={maxEnemyHealth}
            isComputing={isComputing}
            tookDamage={tookDamage}
          />

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

              <h2 className="text-3xl font-extrabold text-white mb-2">
                {gameState === 'won' ? '¡SISTEMA DERROTADO!' : '¡MISIÓN FALLIDA!'}
              </h2>
              <p className="text-zinc-400 mb-8 font-medium">
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
