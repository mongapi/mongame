import { useEffect, useMemo, useState } from 'react';
import { Text } from '@react-three/drei';
import { motion } from 'motion/react';
import { BrainCircuit, CheckCircle2, Eye, Lightbulb, MessageSquare, MonitorPlay, RotateCcw, Search, XCircle, DoorOpen } from 'lucide-react';
import Card3D from '../components/canvas3D/meshes/Card3D';
import RoomCanvas from '../components/canvas3D/scenes/RoomCanvas';
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { GameExitButton, GameSessionFinishedOverlay, useGameSessionUi } from '@/games/shared/GameSessionActions';
import { useSessionGame } from '@/hooks/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';

const INTER_FONT = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf';

function buildClueDeck(clues) {
  const columns = clues.length <= 4 ? 2 : clues.length <= 9 ? 3 : 4;
  const horizontalSpacing = columns >= 4 ? 3.1 : 3.5;
  const verticalSpacing = 4.5;
  const rowCount = Math.ceil(clues.length / columns);

  return clues.map((clue, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      id: `clue-${index + 1}`,
      clue,
      position: [
        (column - (columns - 1) / 2) * horizontalSpacing,
        (((rowCount - 1) / 2) - row) * verticalSpacing,
        0,
      ],
    };
  });
}

function ClueCardFront({ clue, index }) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[2.25, 3.25]} />
        <meshStandardMaterial color="#1e3a8a" emissive="#102b5c" emissiveIntensity={0.65} roughness={0.15} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.05, 0.02]}>
        <planeGeometry args={[1.55, 0.42]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.6} transparent opacity={0.4} />
      </mesh>
      <Text
        position={[0, 1.05, 0.05]}
        font={INTER_FONT}
        fontSize={0.21}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        strokeWidth={0.012}
        strokeColor="#000000"
      >
        {`PISTA ${index + 1}`}
      </Text>
      <Text
        position={[0, -0.05, 0.05]}
        font={INTER_FONT}
        fontSize={0.24}
        maxWidth={1.95}
        lineHeight={1.3}
        textAlign="center"
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        strokeWidth={0.014}
        strokeColor="#000000"
      >
        {clue}
      </Text>
    </group>
  );
}

function ClueCardBack({ index }) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[2.25, 3.25]} />
        <meshStandardMaterial color="#0f172a" emissive="#0d2e5c" emissiveIntensity={0.5} roughness={0.2} metalness={0.75} />
      </mesh>
      <Text
        position={[0, 0.25, 0.05]}
        font={INTER_FONT}
        fontSize={0.92}
        color="#22d3ee"
        anchorX="center"
        anchorY="middle"
        strokeWidth={0.02}
        strokeColor="#000000"
      >
        ?
      </Text>
      <Text
        position={[0, -0.82, 0.05]}
        font={INTER_FONT}
        fontSize={0.19}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        strokeWidth={0.012}
        strokeColor="#000000"
      >
        {`ARCHIVO ${index + 1}`}
      </Text>
    </group>
  );
}

function normalizeGuessContent(gameContent) {
  return {
    answer: String(gameContent?.answer ?? '').trim(),
    clues: Array.isArray(gameContent?.clues)
      ? gameContent.clues.map((clue) => String(clue).trim()).filter(Boolean)
      : [],
  };
}

export default function AdivinaQue3D() {
  const { session, content, sessionId, participant, isLoading, error, setError, isPreview, previewTitle } = useSessionGame({
    resolveContent: normalizeGuessContent,
    validateContent: (resolvedContent) => validateGameContent('guess_who', resolvedContent),
  });

  const [revealedCount, setRevealedCount] = useState(1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('Iniciando conexión con el tablero de deducción...');
  const { sessionFinished, handleExit, exitLabel, finishActionLabel } = useGameSessionUi({ session, sessionId, isPreview });

  const normalizedAnswer = useMemo(() => content.answer.toLowerCase(), [content.answer]);
  const visibleClues = content.clues.slice(0, revealedCount);
  const clueDeck = useMemo(() => buildClueDeck(content.clues), [content.clues]);

  useEffect(() => {
    setRevealedCount(Math.min(content.clues.length, 1));
    setGuess('');
    setAttempts([]);
    setIsSolved(false);
    setStartedAt(Date.now());
    setMessage('Sistema listo. El tablero 3D ha cargado la primera pista.');
    setError('');
  }, [content.answer, content.clues, setError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedGuess = guess.trim().toLowerCase();
    if (!normalizedGuess || isSolved || sessionFinished) {
      return;
    }

    const isCorrect = normalizedGuess === normalizedAnswer;

    if (sessionId && !isSubmitting) {
      setIsSubmitting(true);
      const result = await sessionAPI.submitAnswer(sessionId, {
        question_id: 'guess-who',
        answer: guess.trim(),
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

    setAttempts((current) => [
      {
        value: guess.trim(),
        isCorrect,
      },
      ...current,
    ]);

    if (isCorrect) {
      setIsSolved(true);
      setMessage(`¡Deducción exitosa! El personaje o concepto oculto es ${content.answer}.`);
      return;
    }

    if (revealedCount < content.clues.length) {
      setRevealedCount((current) => current + 1);
      setMessage('Respuesta descartada. El tablero ha desbloqueado una nueva pista.');
    } else {
      setMessage('Respuesta descartada. Ya no quedan más pistas por revelar.');
    }

    setGuess('');
  };

  const handleReset = () => {
    setRevealedCount(Math.min(content.clues.length, 1));
    setGuess('');
    setAttempts([]);
    setIsSolved(false);
    setStartedAt(Date.now());
    setMessage('Tablero reiniciado. La primera pista vuelve a estar activa.');
    setError('');
  };

  if (isLoading) {
    return <GameLoadingState title="Cargando quién es quién..." />;
  }

  if (error) {
    return <GameErrorState message={error} />;
  }

  return (
    <div className="flex min-h-screen lg:h-screen flex-col lg:overflow-hidden bg-zinc-950 text-white font-sans">
      <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />
      <header className="relative z-10 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center justify-between border-b border-white/5 bg-zinc-900/80 px-6 py-4 md:px-8 md:py-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.18)]">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="bg-linear-to-r from-cyan-300 to-indigo-400 bg-clip-text text-xl sm:text-2xl font-black tracking-tight text-transparent">
              {isPreview ? previewTitle : 'Quién es quién 3D'}
            </h1>
            <p className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
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
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
            Pistas {revealedCount}/{content.clues.length}
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
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/75 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <DoorOpen className="h-4 w-4" />
            {exitLabel}
          </button>
        </div>
      </header>

      <main className="relative h-[320px] sm:h-[400px] lg:h-auto lg:flex-1 bg-linear-to-b from-zinc-900 to-zinc-950 shrink-0">
        <RoomCanvas cameraPosition={[0, 5.2, 17.5]} fov={42} orbitTarget={[0, 5.2, 0]} showGrid={false}>
          {/* Luz frontal intensa y brillante para iluminar las caras de las cartas de forma espectacular */}
          <directionalLight position={[0, 5.2, 15]} intensity={2.8} />
          <pointLight position={[0, 5.2, 10]} intensity={2.5} distance={30} color="#e0f2fe" />

          <group position={[0, 4.6, 0]}>
            <Text
              position={[0, 6.1, 0]}
              font={INTER_FONT}
              fontSize={0.55}
              color="#67e8f9"
              anchorX="center"
              anchorY="middle"
            >
              TABLERO DE PISTAS
            </Text>

            {clueDeck.map((card, index) => (
              <Card3D
                key={`${card.id}-${content.answer}`}
                position={card.position}
                front={<ClueCardFront clue={card.clue} index={index} />}
                back={<ClueCardBack index={index} />}
                width={2.35}
                height={3.35}
                thickness={0.08}
                isFlipped={index < revealedCount || isSolved}
                canFlipOnClick={false}
                hoverEffect={false}
                cardColor="#06b6d4"
              />
            ))}
          </group>
        </RoomCanvas>
      </main>

      <footer className="relative z-10 flex flex-col lg:flex-row lg:h-[190px] shrink-0 items-stretch border-t border-white/5 bg-zinc-900/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-1 flex-col lg:border-r border-white/5 p-4 overflow-y-auto">
          <div className="mb-3 flex items-center gap-3 shrink-0">
            <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-wide text-white">Panel de deducción</h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4 w-full flex-1 min-h-0">
            {/* Form/Input Column */}
            <form onSubmit={handleSubmit} className="flex-1 w-full lg:min-w-[240px] flex items-center">
              <div className="flex flex-col gap-2 sm:flex-row w-full items-center">
                <input
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  disabled={isSolved || sessionFinished}
                  placeholder="Escribe quién crees que es"
                  className="h-10 flex-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!guess.trim() || isSolved || sessionFinished}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-sm font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                >
                  <Search className="h-4 w-4" />
                  Comprobar
                </button>
              </div>
            </form>

            {/* Pistas Activas Column */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col w-full lg:w-[280px] shrink-0 min-h-0">
              <div className="mb-1.5 flex items-center gap-2 text-cyan-200 shrink-0">
                <Lightbulb className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Pistas activas</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[85px] lg:max-h-none">
                {visibleClues.map((clue, index) => (
                  <div key={`${clue}-${index}`} className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-2.5 py-1.5 text-xs text-zinc-100">
                    <span className="mr-2 font-bold uppercase tracking-[0.16em] text-cyan-300">P{index + 1}</span>
                    {clue}
                  </div>
                ))}
              </div>
            </div>

            {/* Estado Column */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col w-full lg:w-[220px] shrink-0 min-h-0">
              <div className="mb-1.5 flex items-center gap-2 text-zinc-300 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Estado</span>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] lg:max-h-none">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">Intentos</span>
                  <span className="text-xs font-black text-white">{attempts.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-1 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">Pendientes</span>
                  <span className="text-xs font-black text-cyan-300">{Math.max(content.clues.length - revealedCount, 0)}</span>
                </div>
                {isSolved ? (
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-1 mt-1.5 text-emerald-100">
                    <div className="flex items-center gap-1 text-emerald-200 text-[10px]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-bold truncate">Correcto: {content.answer}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex w-full lg:w-[430px] flex-col overflow-hidden bg-black/40 p-4 border-t lg:border-t-0 lg:border-l border-white/5">
          <div className="absolute left-0 top-0 h-0.5 w-full bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-30" />

          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative mt-2 mb-4 overflow-hidden rounded-xl border p-4 shadow-lg ${isSolved
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
              }`}
          >
            <p className="relative z-10 font-mono text-sm font-medium leading-relaxed">{message}</p>
          </motion.div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-2">
              {attempts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-zinc-800/30 px-4 py-3 text-sm text-zinc-500">
                  Aún no hay intentos registrados.
                </div>
              ) : (
                attempts.map((attempt, index) => (
                  <motion.div
                    key={`${attempt.value}-${index}`}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-800/40 px-4 py-3 shadow-sm"
                  >
                    <span className="truncate pr-4 text-sm font-medium text-zinc-300">{attempt.value}</span>
                    <span className={`rounded-md border px-3 py-1.5 text-xs font-bold tracking-wider ${attempt.isCorrect ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`}>
                      {attempt.isCorrect ? 'AFIRMATIVO' : 'NEGATIVO'}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
