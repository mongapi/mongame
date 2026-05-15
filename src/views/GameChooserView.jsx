import { AuroraBackground } from "@/components/organisms/AuroraBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Gamepad2, Loader, PlayCircle, Route, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GameTypeIconBadge, GameTypePreview } from '@/components/gameTypes/GameTypeVisual';
import { useGameChooserView } from '@/hooks/useGameChooserView';

/* ─────────────────────────────────────────────────────────────────
   GameChooserView
   ───────────────────────────────────────────────────────────────── */
export default function GameChooserView() {
    const {
        isSessionCreationFlow,
        gameTypes,
        isLoading,
        error,
        emptyMessage,
        openGameType,
        goToLessonPlanCreate,
    } = useGameChooserView();

    return (
        <AuroraBackground className="pl-20">
            <div className="min-h-screen w-full overflow-y-auto">
                <div className="mx-auto max-w-7xl px-8 pb-20 pt-10">

                    {/* ── Header compacto ───────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center gap-4"
                    >
                        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3">
                            <Gamepad2 className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="font-['Orbitron'] text-2xl font-black tracking-wide text-white">
                                {isSessionCreationFlow ? 'Crea una sesión' : 'Crea un juego'}
                            </h1>
                            <p className="mt-0.5 text-sm text-zinc-400">
                                {isSessionCreationFlow
                                    ? 'Elige cómo quieres lanzar la sesión.'
                                    : 'Elige una mecánica para crear una plantilla reutilizable.'}
                            </p>
                        </div>
                    </motion.div>

                    {/* ── Banner lesson plan (solo en session flow) ─────────── */}
                    <AnimatePresence>
                        {isSessionCreationFlow && (
                            <motion.button
                                type="button"
                                key="lesson-plan-banner"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={goToLessonPlanCreate}
                                className="mb-4 w-full cursor-pointer rounded-2xl border border-amber-400/25 bg-amber-400/8 px-5 py-4 text-left backdrop-blur-xl transition-colors hover:bg-amber-400/14 group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-2 text-amber-200 group-hover:bg-amber-300/20 transition-colors">
                                            <Route className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/60">
                                                Recomendado · Varias fases
                                            </p>
                                            <p className="text-sm font-bold text-white">
                                                Crear un lesson plan para encadenar varios juegos
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className="shrink-0 border-amber-300/25 bg-amber-300/10 px-3 py-1 font-bold tracking-widest text-amber-100 group-hover:bg-amber-300/25 transition-colors">
                                        CREAR →
                                    </Badge>
                                </div>
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* ── Separador "o un solo juego" (solo en session flow) ── */}
                    {isSessionCreationFlow && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8 flex items-center gap-3"
                        >
                            <div className="h-px flex-1 bg-white/8" />
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                <Sparkles className="h-3 w-3" />
                                O lanza un solo juego
                            </span>
                            <div className="h-px flex-1 bg-white/8" />
                        </motion.div>
                    )}

                    {/* ── States: loading / error / vacío ───────────────────── */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl border border-white/8 bg-black/30 p-8 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3 text-zinc-300">
                                <Loader className="h-5 w-5 animate-spin text-cyan-400" />
                                <span className="text-sm">Cargando tipos de juego desde el backend…</span>
                            </div>
                            {/* Skeletons */}
                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {!isLoading && error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl border border-red-500/20 bg-red-500/8 p-6 backdrop-blur-xl"
                        >
                            <div className="flex items-start gap-3 text-red-100">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="font-semibold">No se pudieron cargar los tipos de juego.</p>
                                    <p className="mt-1 text-sm text-red-100/70">{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {!isLoading && !error && gameTypes.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl border border-white/8 bg-black/30 p-8 text-sm text-zinc-400 backdrop-blur-xl"
                        >
                            {emptyMessage}
                        </motion.div>
                    )}

                    {/* ── Grid de juegos ────────────────────────────────────── */}
                    {!isLoading && !error && gameTypes.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {gameTypes.map((gameType, idx) => (
                                <motion.div
                                    key={gameType.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.07, ease: 'easeOut' }}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group cursor-pointer"
                                    onClick={() => openGameType(gameType.code)}
                                >
                                    <Card className="relative h-full overflow-hidden border-zinc-800/80 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_28px_rgba(34,211,238,0.14)]">

                                        {/* Hover gradient wash */}
                                        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-500/0 to-purple-500/0 transition-all duration-500 group-hover:from-cyan-500/8 group-hover:to-purple-500/8" />

                                        <CardContent className="relative z-10 p-6">

                                            {/* Top row: icon + badge */}
                                            <div className="mb-5 flex items-start justify-between gap-3">
                                                <GameTypeIconBadge icon={gameType.icon} color={gameType.color} />
                                                <Badge className="shrink-0 border border-zinc-700 bg-zinc-800/80 px-3 py-1 font-bold tracking-widest text-zinc-300 transition-all duration-300 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/20 group-hover:text-cyan-200">
                                                    {isSessionCreationFlow ? 'LANZAR' : 'CREAR'}
                                                </Badge>
                                            </div>

                                            {/* Name + description */}
                                            <h3 className="mb-2 text-xl font-black text-white transition-colors duration-200 group-hover:text-cyan-300">
                                                {gameType.name}
                                            </h3>
                                            <p className="mb-4 min-h-10 text-sm leading-6 text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200">
                                                {gameType.description}
                                            </p>

                                            {/* Preview */}
                                            <div className="relative overflow-hidden rounded-lg border border-zinc-800/60 transition-colors duration-300 group-hover:border-cyan-700/40">
                                                <GameTypePreview type={gameType.previewType} />

                                                {/* Play overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/65 opacity-0 backdrop-blur-[2px] transition-opacity duration-250 group-hover:opacity-100">
                                                    <PlayCircle className="h-14 w-14 text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.7)]" />
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuroraBackground>
    );
}