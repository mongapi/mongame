import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, CheckCircle2, Lightbulb, RotateCcw, Search, Sparkles, XCircle } from 'lucide-react';
import { sessionAPI } from '@/api/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { GameExitButton, GameSessionFinishedOverlay, useGameSessionUi } from '@/games/shared/GameSessionActions';
import { useSessionGame } from '@/hooks/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';

function normalizeGuessContent(gameContent) {
  return {
    answer: String(gameContent?.answer ?? '').trim(),
    clues: Array.isArray(gameContent?.clues)
      ? gameContent.clues.map((clue) => String(clue).trim()).filter(Boolean)
      : [],
  };
}

export default function AdivinaQue3D() {
  const { session, content, sessionId, participant, isLoading, error, setError } = useSessionGame({
    resolveContent: normalizeGuessContent,
    validateContent: (resolvedContent) => validateGameContent('guess_who', resolvedContent),
  });

  const [revealedCount, setRevealedCount] = useState(1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sessionFinished, handleExit, exitLabel, finishActionLabel } = useGameSessionUi({ session, sessionId, isPreview: false });

  const normalizedAnswer = useMemo(() => content.answer.toLowerCase(), [content.answer]);
  const visibleClues = content.clues.slice(0, revealedCount);

  useEffect(() => {
    setRevealedCount(1);
    setGuess('');
    setAttempts([]);
    setIsSolved(false);
    setStartedAt(Date.now());
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
      return;
    }

    if (revealedCount < content.clues.length) {
      setRevealedCount((current) => current + 1);
    }

    setGuess('');
  };

  const handleReset = () => {
    setRevealedCount(1);
    setGuess('');
    setAttempts([]);
    setIsSolved(false);
    setStartedAt(Date.now());
    setError('');
  };

  if (isLoading) {
    return <GameLoadingState title="Cargando quién es quién..." />;
  }

  if (error) {
    return <GameErrorState message={error} />;
  }

  return (
    <div className="min-h-screen px-6 py-10 text-white">
      <GameExitButton onExit={handleExit} label={exitLabel} />
      <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-black/35 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black tracking-tight">Quién es quién</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Lee las pistas y deduce el concepto oculto antes de agotar toda la secuencia.
                  </CardDescription>
                </div>
              </div>
              <Badge className="border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                Pistas {revealedCount}/{content.clues.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {visibleClues.map((clue, index) => (
                <motion.div
                  key={`${clue}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="mb-3 flex items-center gap-3 text-cyan-200">
                    <Lightbulb className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Pista {index + 1}</span>
                  </div>
                  <p className="text-lg font-medium leading-relaxed text-zinc-100">{clue}</p>
                </motion.div>
              ))}
            </div>

            <Separator className="bg-white/10" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Tu respuesta</span>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={guess}
                    onChange={(event) => setGuess(event.target.value)}
                    disabled={isSolved || sessionFinished}
                    placeholder="Escribe tu deducción"
                    className="h-12 border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                  />
                  <Button type="submit" disabled={!guess.trim() || isSolved || sessionFinished} className="h-12 bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
                    <Search className="h-4 w-4" />
                    Comprobar
                  </Button>
                </div>
              </label>
            </form>

            <AnimatePresence>
              {isSolved ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-6 text-emerald-100"
                >
                  <div className="flex items-center gap-3 text-emerald-200">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-bold">Respuesta correcta: {content.answer}</span>
                  </div>
                  <p className="mt-3 text-sm text-emerald-100/80">
                    Has resuelto el reto en {attempts.length + 1} intento{attempts.length === 0 ? '' : 's'}.
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                Estado de la partida
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Cada fallo desbloquea una pista adicional hasta completar la secuencia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Intentos realizados</p>
                <p className="mt-2 text-3xl font-black text-white">{attempts.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Pistas pendientes</p>
                <p className="mt-2 text-3xl font-black text-cyan-200">{Math.max(content.clues.length - revealedCount, 0)}</p>
              </div>
              <Button type="button" variant="outline" onClick={handleReset} disabled={sessionFinished} className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                <RotateCcw className="h-4 w-4" />
                Reiniciar reto
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/35 text-white backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Historial de intentos</CardTitle>
              <CardDescription className="text-zinc-400">
                Resumen rápido para que el alumnado vea su progreso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-zinc-500">
                    Aún no hay intentos registrados.
                  </div>
                ) : (
                  attempts.map((attempt, index) => (
                    <div key={`${attempt.value}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="truncate pr-4 text-sm font-medium text-zinc-100">{attempt.value}</span>
                      <Badge className={attempt.isCorrect ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-red-400/20 bg-red-400/10 text-red-200'}>
                        {attempt.isCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {attempt.isCorrect ? 'Correcto' : 'No era esa'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
