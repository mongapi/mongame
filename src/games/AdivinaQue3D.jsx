import { useEffect, useMemo, useState } from 'react';
import { Text } from '@react-three/drei';
import { motion } from 'motion/react';
import { BrainCircuit, CheckCircle2, Eye, Lightbulb, MessageSquare, MonitorPlay, RotateCcw, Search, XCircle } from 'lucide-react';
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
        <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.05, 0.02]}>
        <planeGeometry args={[1.55, 0.42]} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.22} />
      </mesh>
      <Text
        position={[0, 1.05, 0.05]}
        font={INTER_FONT}
        fontSize={0.18}
        color="#67e8f9"
        anchorX="center"
        anchorY="middle"
      >
        {`PISTA ${index + 1}`}
      </Text>
      <Text
        position={[0, -0.05, 0.05]}
        font={INTER_FONT}
        fontSize={0.2}
        maxWidth={1.75}
        lineHeight={1.4}
        textAlign="center"
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
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
        <meshStandardMaterial color="#111827" roughness={0.55} metalness={0.1} />
      </mesh>
      <Text
        position={[0, 0.25, 0.05]}
        font={INTER_FONT}
        fontSize={0.8}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
      >
        ?
      </Text>
      <Text
        position={[0, -0.82, 0.05]}
        font={INTER_FONT}
        fontSize={0.16}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
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
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-white font-sans">
      <GameExitButton onExit={handleExit} label={exitLabel} />
      <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/80 px-8 py-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.18)]">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="bg-linear-to-r from-cyan-300 to-indigo-400 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              {isPreview ? previewTitle : 'Quién es quién 3D'}
            </h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
              Protocolo de deducción
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPreview ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
              <Eye className="h-4 w-4" />
              Vista previa docente
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
        </div>
      </header>

      <main className="relative flex-1 bg-linear-to-b from-zinc-900 to-zinc-950">
        <RoomCanvas cameraPosition={[0, 6, 18]} fov={42}>
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
                cardColor="#111827"
              />
            ))}
          </group>
        </RoomCanvas>
      </main>

      <footer className="relative z-10 flex h-85 shrink-0 items-stretch border-t border-white/5 bg-zinc-900/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-1 flex-col border-r border-white/5 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold tracking-wide text-white">Panel de deducción</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Tu respuesta</span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  disabled={isSolved || sessionFinished}
                  placeholder="Escribe quién crees que es"
                  className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!guess.trim() || isSolved || sessionFinished}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                  Comprobar
                </button>
              </div>
            </label>
          </form>

          <div className="mt-5 grid flex-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-cyan-200">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Pistas activas</span>
              </div>
              <div className="space-y-2 overflow-y-auto pr-1">
                {visibleClues.map((clue, index) => (
                  <div key={`${clue}-${index}`} className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-sm text-zinc-100">
                    <span className="mr-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">P{index + 1}</span>
                    {clue}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Estado</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Intentos</p>
                  <p className="mt-2 text-3xl font-black text-white">{attempts.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Pistas pendientes</p>
                  <p className="mt-2 text-3xl font-black text-cyan-200">{Math.max(content.clues.length - revealedCount, 0)}</p>
                </div>
              </div>
              {isSolved ? (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-bold">Respuesta correcta: {content.answer}</span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-100/80">
                    Has resuelto el tablero en {attempts.length + 1} intento{attempts.length === 0 ? '' : 's'}.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative flex w-107.5 flex-col overflow-hidden bg-black/40 p-6">
          <div className="absolute left-0 top-0 h-0.5 w-full bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-30" />

          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <MonitorPlay className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold tracking-wide text-white">Terminal central</h2>
          </div>

          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative mb-5 overflow-hidden rounded-xl border p-4 shadow-lg ${
              isSolved
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

          <div className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
            {sessionFinished ? 'Sesión cerrada' : 'Tablero operativo'}
          </div>
        </div>
      </footer>
    </div>
  );
}
