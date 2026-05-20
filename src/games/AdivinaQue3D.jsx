import { useEffect, useMemo, useState, useRef } from 'react';
import { Text, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { BrainCircuit, CheckCircle2, Eye, Lightbulb, MessageSquare, MonitorPlay, RotateCcw, Search, XCircle, DoorOpen, HelpCircle } from 'lucide-react';
import RoomCanvas from '../components/canvas3D/scenes/RoomCanvas';
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { GameExitButton, GameSessionFinishedOverlay, useGameSessionUi } from '@/games/shared/GameSessionActions';
import { useSessionGame } from '@/hooks/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';
import questionMarkGlbUrl from '@/components/canvas3D/meshes/characters/questionMark.glb';
import { NeonBg } from '@/components/canvas3D/meshes/environments/NeonBg';

const INTER_FONT = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf';
const INTER_BOLD_FONT = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf';
const ORBITRON_BOLD_FONT = 'https://fonts.gstatic.com/s/orbitron/v25/y7I0EpNxZ2Fr-U15fSqmUoES.ttf';

function buildCharacterDeck(answer, options) {
  const allCharacters = [answer, ...options];
  const sortedCharacters = [...allCharacters].sort((a, b) => a.localeCompare(b));

  const columns = sortedCharacters.length <= 4 ? 2 : sortedCharacters.length <= 9 ? 3 : 4;
  const horizontalSpacing = columns >= 4 ? 3.1 : 3.5;
  const verticalSpacing = 4.5;
  const rowCount = Math.ceil(sortedCharacters.length / columns);

  return sortedCharacters.map((character, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      id: `char-${index}`,
      character,
      isAnswer: character === answer,
      position: [
        (column - (columns - 1) / 2) * horizontalSpacing,
        (((rowCount - 1) / 2) - row) * verticalSpacing,
        0,
      ],
    };
  });
}

function QuestionMarkModel({ isFlipped, ...props }) {
  const { nodes } = useGLTF(questionMarkGlbUrl);

  // Center the huge off-origin geometry to [0, 0, 0] once loaded
  useMemo(() => {
    if (nodes.Object_2?.geometry) {
      nodes.Object_2.geometry.center();
    }
  }, [nodes]);

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_2.geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#00d2ff"
          emissive="#005f73"
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(questionMarkGlbUrl);

// Custom 3D volumetric glowing Cross (X) component
function Cross3D(props) {
  return (
    <group {...props}>
      {/* Diagonal bar 1 */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.32, 1.8, 0.32]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#b91c1c"
          emissiveIntensity={1.5}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>
      {/* Diagonal bar 2 */}
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.32, 1.8, 0.32]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#b91c1c"
          emissiveIntensity={1.5}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

function InteractiveQuestionMark({ character, isFlipped, onClick, isGameOver }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (!isGameOver) {
      document.body.style.cursor = 'pointer';
      setHovered(true);
    }
  };

  const handlePointerOut = (e) => {
    document.body.style.cursor = 'auto';
    setHovered(false);
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetRotationY = isFlipped ? Math.PI : hovered ? 0.35 : 0;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotationY,
      8,
      delta
    );

    const targetScale = hovered ? 1.15 : 1.0;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta)
    );
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Swapping 3D models with smooth 180deg flip rotation */}
      {isFlipped ? (
        <Cross3D position={[0, 0.4, 0]} />
      ) : (
        <QuestionMarkModel scale={[-0.0035, 0.0035, 0.0035]} position={[0, 0.4, 0]} />
      )}


      {/* Character label text */}
      <Text
        position={[0, -1.2, 0]}
        font={INTER_BOLD_FONT}
        fontSize={0.34}
        maxWidth={3.0}
        lineHeight={1.2}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        strokeWidth={0.012}
        strokeColor="#000000"
      >
        {character}
        <meshStandardMaterial
          color={isFlipped ? "#ef4444" : "#22d3ee"}
          emissive={isFlipped ? "#b91c1c" : "#0891b2"}
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.3}
        />
      </Text>
    </group>
  );
}

// Custom 3D physical, glassmorphic interactive clue card component
function ClueCard3D({ clue, index, isAsked, attemptsLeft, isGameOver, onClick }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const targetScale = hovered && !isAsked && !isGameOver && attemptsLeft > 0 ? 1.04 : 1.0;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.damp(meshRef.current.scale.x, targetScale, 8, delta)
    );
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (!isAsked && !isGameOver && attemptsLeft > 0) {
      document.body.style.cursor = 'pointer';
      setHovered(true);
    }
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    setHovered(false);
  };

  // Color logic
  let cardColor = "#0d111d"; // Sleek dark slate glass
  let cardEmissive = "#111827";
  let textColor = "#94a3b8"; // Subdued text

  if (isAsked) {
    if (clue.isTrue) {
      cardColor = "#064e3b"; // Emerald green
      cardEmissive = "#059669";
      textColor = "#a7f3d0";
    } else {
      cardColor = "#7f1d1d"; // Ruby red
      cardEmissive = "#dc2626";
      textColor = "#fecaca";
    }
  } else if (hovered) {
    cardColor = "#082f49"; // Cyan focus
    cardEmissive = "#0284c7";
    textColor = "#e0f2fe";
  }

  return (
    <group 
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        if (!isAsked && !isGameOver && attemptsLeft > 0) {
          onClick();
        }
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Physical glass block */}
      <mesh>
        <boxGeometry args={[4.8, 0.85, 0.08]} />
        <meshStandardMaterial 
          color={cardColor} 
          emissive={cardEmissive}
          emissiveIntensity={isAsked ? 0.9 : hovered ? 0.6 : 0.1}
          roughness={0.2}
          metalness={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Clue text label */}
      <Text
        position={[-2.1, 0, 0.05]}
        font={INTER_BOLD_FONT}
        fontSize={0.17}
        maxWidth={3.2}
        anchorX="left"
        anchorY="middle"
        color={textColor}
      >
        {clue.text}
      </Text>

      {/* "Preguntar" or "SÍ/NO" tag */}
      {isAsked ? (
        <Text
          position={[1.8, 0, 0.05]}
          font={INTER_BOLD_FONT}
          fontSize={0.24}
          anchorX="center"
          anchorY="middle"
          color={clue.isTrue ? "#6ee7b7" : "#fda4af"}
        >
          {clue.isTrue ? "SÍ" : "NO"}
        </Text>
      ) : (
        <Text
          position={[1.8, 0, 0.05]}
          font={INTER_BOLD_FONT}
          fontSize={0.15}
          anchorX="center"
          anchorY="middle"
          color={hovered ? "#38bdf8" : "#0284c7"}
        >
          PREGUNTAR
        </Text>
      )}
    </group>
  );
}

// Custom 3D physical volumetric glow button component
function Button3D({ text, onClick, disabled, color = "#00d2ff", emissive = "#005f73", width = 3.6, height = 0.7, fontSize = 0.18 }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetScale = hovered && !disabled ? 1.04 : 1.0;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 8, delta)
    );
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (!disabled) {
      document.body.style.cursor = 'pointer';
      setHovered(true);
    }
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    setHovered(false);
  };

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial 
          color={disabled ? "#27272a" : hovered ? "#38bdf8" : color}
          emissive={disabled ? "#09090b" : hovered ? color : emissive}
          emissiveIntensity={disabled ? 0.05 : hovered ? 1.3 : 0.8}
          roughness={0.2}
          metalness={0.4}
          transparent
          opacity={disabled ? 0.35 : 0.9}
        />
      </mesh>
      <Text
        position={[0, 0, 0.06]}
        font={INTER_BOLD_FONT}
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        color={disabled ? "#52525b" : "#ffffff"}
      >
        {text}
      </Text>
    </group>
  );
}



function normalizeGuessContent(gameContent) {
  return {
    answer: String(gameContent?.answer ?? '').trim(),
    options: Array.isArray(gameContent?.options)
      ? gameContent.options.map(o => String(o).trim()).filter(Boolean)
      : [],
    clues: Array.isArray(gameContent?.clues)
      ? gameContent.clues.map((clue) => {
        if (typeof clue === 'string') {
          return { text: clue.trim(), isTrue: true };
        }
        return { text: String(clue?.text ?? '').trim(), isTrue: Boolean(clue?.isTrue) };
      }).filter(c => c.text)
      : [],
    maxAttempts: Number(gameContent?.maxAttempts) || 5,
  };
}

export default function AdivinaQue3D() {
  const { session, content, sessionId, participant, isLoading, error, setError, isPreview, previewTitle } = useSessionGame({
    resolveContent: normalizeGuessContent,
    validateContent: (resolvedContent) => validateGameContent('guess_who', resolvedContent),
  });

  const [eliminatedCards, setEliminatedCards] = useState([]);
  const [askedClues, setAskedClues] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('Tablero listo. Pregunta pistas y elimina a los sospechosos incorrectos.');

  const { sessionFinished, handleExit, exitLabel, finishActionLabel } = useGameSessionUi({ session, sessionId, isPreview });

  const characterDeck = useMemo(() => {
    if (!content) return [];
    return buildCharacterDeck(content.answer, content.options);
  }, [content]);

  useEffect(() => {
    setEliminatedCards([]);
    setAskedClues([]);
    setIsSolved(false);
    setIsFailed(false);
    setStartedAt(Date.now());
    setMessage('Tablero listo. Pregunta pistas y elimina a los sospechosos incorrectos.');
    setError('');
  }, [content, setError]);

  const attemptsLeft = Math.max(0, content?.maxAttempts - askedClues.length);
  const isGameOver = isSolved || isFailed || sessionFinished;
  const remainingCount = characterDeck.length - eliminatedCards.length;

  const handleToggleCard = (character) => {
    if (isGameOver) return;

    setEliminatedCards((prev) =>
      prev.includes(character)
        ? prev.filter(c => c !== character)
        : [...prev, character]
    );
  };

  const handleAskClue = (clueIndex) => {
    if (isGameOver || attemptsLeft <= 0 || askedClues.includes(clueIndex)) return;

    setAskedClues(prev => [...prev, clueIndex]);
    const clue = content.clues[clueIndex];
    setMessage(`Pista solicitada: "${clue.text}". La respuesta es ${clue.isTrue ? 'SÍ' : 'NO'}.`);
  };

  const handleSolve = async () => {
    if (isGameOver || remainingCount !== 1) return;

    const remainingCard = characterDeck.find(card => !eliminatedCards.includes(card.character));
    if (!remainingCard) return;

    const isCorrect = remainingCard.isAnswer;

    if (sessionId && !isSubmitting) {
      setIsSubmitting(true);
      const result = await sessionAPI.submitAnswer(sessionId, {
        question_id: 'guess-who',
        answer: remainingCard.character,
        device_id: participant.deviceId,
        player_name: participant.playerName,
        player_number: 1,
        elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
        completed: isCorrect,
      });

      if (!result.success) {
        setError(result.error);
      }
      setIsSubmitting(false);
    }

    if (isCorrect) {
      setIsSolved(true);
      setMessage(`¡Deducción correcta! El sospechoso era ${content.answer}.`);
    } else {
      setIsFailed(true);
      setMessage(`¡Deducción incorrecta! Has acusado a ${remainingCard.character}, pero el verdadero era ${content.answer}.`);
    }
  };

  const handleReset = () => {
    setEliminatedCards([]);
    setAskedClues([]);
    setIsSolved(false);
    setIsFailed(false);
    setStartedAt(Date.now());
    setMessage('Tablero reiniciado. Volvemos a empezar.');
    setError('');
  };

  if (isLoading) {
    return <GameLoadingState title="Cargando quién es quién..." />;
  }

  if (error) {
    return <GameErrorState message={error} />;
  }

  return (
    <div className="flex min-h-screen lg:h-screen flex-col lg:overflow-hidden text-white font-sans bg-[#0c0e17]">
      <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />
      <header className="relative z-10 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center justify-between border-b border-white/5 bg-zinc-900/80 px-6 py-4 md:px-8 md:py-5 backdrop-blur-md shadow-lg font-['Orbitron']">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.18)] font-sans">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="bg-linear-to-r from-cyan-300 to-indigo-400 bg-clip-text text-xl sm:text-2xl font-black tracking-widest text-transparent">
              {isPreview ? previewTitle : 'Quién es quién 3D'}
            </h1>
            <p className="mt-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.24em] text-cyan-200/70">
              Protocolo de deducción
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPreview ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
              <Eye className="h-4 w-4" />
              Docente
            </div>
          ) : null}
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-200 tracking-wider">
            Intentos {attemptsLeft}
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={sessionFinished}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </button>
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-bold text-white transition hover:bg-black/75 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <DoorOpen className="h-4 w-4" />
            {exitLabel}
          </button>
        </div>
      </header>

      <main className="relative flex-1 bg-transparent shrink-0">
        <RoomCanvas cameraPosition={[0, 5.2, 20.2]} fov={42} orbitTarget={[0, 5.2, 0]} showGrid={false} transparentBg={true}>
          {/* Foco direccional frontal de gran intensidad */}
          <directionalLight position={[0, 5.2, 21]} intensity={3.2} />
          {/* Foco superior cenital directo */}
          <pointLight position={[0, 12, 4]} intensity={3.5} distance={25} color="#ffffff" />
          {/* Foco frontal directo para caras e iluminación suave */}
          <pointLight position={[0, 5.2, 16]} intensity={2.8} distance={20} color="#e0f2fe" />

          {/* 3D Sci-Fi Tron Studio Background Environment (Expanded and pushed back) */}
          <NeonBg position={[0, -3.2, -8]} scale={[1.4, 1.4, 1.4]} />

          {/* Frosted visual separation shield to softly dim the background studio and pop the foreground neons */}
          <mesh position={[0, 5.2, -1.8]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#0c0e17" transparent opacity={0.6} />
          </mesh>

          <group position={[0, 4.6, 0]}>
            {/* Board Title */}
            <Text
              position={[0, 6.1, 0]}
              font={INTER_BOLD_FONT}
              fontSize={0.65}
              anchorX="center"
              anchorY="middle"
              strokeWidth={0.02}
              strokeColor="#000000"
            >
              ¡Adivina quien es!
              <meshStandardMaterial
                color="#67e8f9"
                emissive="#0891b2"
                emissiveIntensity={1.2}
                roughness={0.1}
                metalness={0.4}
              />
            </Text>

            {/* Character Suspects Grid */}
            {characterDeck.map((card) => (
              <group key={card.id} position={card.position}>
                <InteractiveQuestionMark
                  character={card.character}
                  isFlipped={eliminatedCards.includes(card.character)}
                  onClick={() => handleToggleCard(card.character)}
                  isGameOver={isGameOver}
                />
              </group>
            ))}

            {/* 3D Physical Clues Column (Left side - Positioned further left) */}
            <group position={[-8.6, 0, 0.2]}>
              {/* Volumetric Title */}
              <Text
                position={[0, (((content.clues.length - 1) / 2) * 1.05) + 0.9, 0]}
                font={INTER_BOLD_FONT}
                fontSize={0.22}
                anchorX="center"
                anchorY="middle"
                color="#00f2ff"
              >
                PISTAS
              </Text>
              
              {content.clues.map((clue, index) => {
                const clueY = (((content.clues.length - 1) / 2) - index) * 1.05;
                return (
                  <group key={`clue-3d-${index}`} position={[0, clueY, 0]}>
                    <ClueCard3D 
                      clue={clue}
                      index={index}
                      isAsked={askedClues.includes(index)}
                      attemptsLeft={attemptsLeft}
                      isGameOver={isGameOver}
                      onClick={() => handleAskClue(index)}
                    />
                  </group>
                );
              })}
            </group>

            {/* 3D Physical Control Center Console (Right side - Positioned further right & simplified) */}
            <group position={[8.6, 0, 0.2]}>
              {/* Attempts Counter 3D Box (Centered) */}
              <group position={[0, 1.15, 0]}>
                <mesh>
                  <boxGeometry args={[4.4, 0.95, 0.08]} />
                  <meshStandardMaterial color="#0b0f19" emissive="#0c4a6e" emissiveIntensity={0.25} transparent opacity={0.85} />
                </mesh>
                <Text position={[0, 0.25, 0.05]} font={INTER_BOLD_FONT} fontSize={0.12} color="#94a3b8">INTENTOS PROTOCOLO</Text>
                <Text position={[0, -0.15, 0.05]} font={INTER_BOLD_FONT} fontSize={0.28} color="#00d2ff">
                  {askedClues.length} / {content.maxAttempts}
                </Text>
              </group>

              {/* Console Digital Log Terminal Screen */}
              <group position={[0, 0.0, 0]}>
                <mesh>
                  <boxGeometry args={[4.4, 1.15, 0.08]} />
                  <meshStandardMaterial 
                    color={isSolved ? "#022c22" : isFailed ? "#450a0a" : "#020617"} 
                    emissive={isSolved ? "#059669" : isFailed ? "#dc2626" : "#0c4a6e"}
                    emissiveIntensity={0.4} 
                    transparent 
                    opacity={0.85} 
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.05]}
                  font={INTER_BOLD_FONT}
                  fontSize={0.15}
                  maxWidth={4.0}
                  lineHeight={1.4}
                  textAlign="center"
                  color={isSolved ? "#a7f3d0" : isFailed ? "#fecaca" : "#22d3ee"}
                >
                  {message}
                </Text>
              </group>

              {/* Volumetric Glowing Solve Button */}
              <group position={[0, -1.15, 0]}>
                <Button3D
                  text={isSolved ? "¡ACERTADO!" : isFailed ? "¡ERROR!" : remainingCount === 1 ? "COMPROBAR TABLERO" : "DEJA UN SOSPECHOSO"}
                  disabled={isGameOver || remainingCount !== 1 || isSubmitting}
                  onClick={handleSolve}
                  color={remainingCount === 1 ? "#22d3ee" : "#3f3f46"}
                  emissive={remainingCount === 1 ? "#0891b2" : "#18181b"}
                  width={4.4}
                  height={0.8}
                  fontSize={0.18}
                />
              </group>
            </group>

          </group>
        </RoomCanvas>
      </main>
    </div>
  );
}
