import { motion, AnimatePresence } from "motion/react";
import {
    Users, Play, Pause, SkipForward,
    AlertTriangle, ShieldAlert, CheckCircle2,
    WifiOff, BrainCircuit, Activity, PlusCircle, Copy, X, Trophy, Medal, BarChart3, Download, RadioTower, PanelTop
} from "lucide-react";
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import { formatDateTime, formatElapsed } from '@/lib/formatters';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        responding:   { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: BrainCircuit, label: "PENSANDO",  animate: "animate-pulse" },
        waiting:      { color: "text-green-400 bg-green-400/10 border-green-400/30",    icon: CheckCircle2, label: "LISTO",     animate: "" },
        active:       { color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",       icon: Activity,     label: "ACTIVO",    animate: "" },
        disconnected: { color: "text-red-400 bg-red-400/10 border-red-400/30",          icon: WifiOff,      label: "OFFLINE",   animate: "" },
    };
    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;
    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wider ${config.color} ${config.animate}`}>
            <Icon className="w-3 h-3" />{config.label}
        </div>
    );
};

const StudentRow = ({ student, index }) => (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-4 w-1/3">
            <span className="font-bold text-lg">{student.name}</span>
        </div>
        <div className="flex items-center justify-center w-1/3">
            <StatusBadge status={student.status} />
        </div>
        <div className="flex items-center justify-end gap-6 w-1/3">
            <div className="flex flex-col items-end">
                <span className="text-xs text-zinc-500 font-bold tracking-wider">TIEMPO</span>
                <span className="text-cyan-400 font-black font-['Orbitron']">{student.timeLabel ?? 'Sin tiempo'}</span>
            </div>
            <div className="flex flex-col items-end w-20">
                <span className="text-xs text-zinc-500 font-bold tracking-wider">PUNTOS</span>
                <span className="text-purple-400 font-black font-['Orbitron'] text-xl">{student.score ?? 0}</span>
            </div>
        </div>
    </motion.div>
);

export default function TeacherDashboard() {
    const {
        sessionId,
        session,
        alerts,
        loading,
        recentSessions,
        emptyStateError,
        recentSessionsPage,
        showPinModal,
        activeParticipants,
        isExportingResults,
        resultsData,
        totalRecentSessionsPages,
        paginatedRecentSessions,
        sessionLabel,
        sessionModeMeta,
        scoreRows,
        isPaused,
        isFinished,
        setShowPinModal,
        setRecentSessionsPage,
        refreshResults,
        handleCopyPin,
        handleExportResults,
        handlePauseResume,
        handleFinish,
        handleForceFinish,
        nextPhase,
        goToSessionCreate,
        goToGames,
        openRecentSession,
    } = useTeacherDashboard();

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-['Orbitron']">CARGANDO SESIÓN...</div>;
    if (!sessionId) {
        if (recentSessions.length === 0) {
            return (
                <div className="min-h-screen flex items-center justify-center px-6">
                    <div className="max-w-2xl rounded-3xl border border-white/10 bg-zinc-950/60 p-8 text-center text-white backdrop-blur-xl">
                        <h1 className="font-['Orbitron'] text-2xl font-black text-cyan-300">TODAVÍA NO TIENES SESIONES</h1>
                        <p className="mt-4 text-sm leading-6 text-zinc-400">
                            {emptyStateError || 'Cuando crees una sesión desde un juego o un lesson plan aparecerá aquí para poder controlarla desde el dashboard.'}
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={goToSessionCreate}
                                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                            >
                                <PlusCircle className="h-5 w-5" />
                                Iniciar una sesión
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-zinc-950/60 p-8 text-white backdrop-blur-xl">
                    <div className="mb-6 flex items-end justify-between gap-6">
                        <div>
                            <h1 className="font-['Orbitron'] text-2xl font-black text-cyan-300">SESIONES RECIENTES</h1>
                            <p className="mt-4 text-sm leading-6 text-zinc-400">
                                Elige una sesión ya creada para retomarla o inicia una nueva.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={goToSessionCreate}
                            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Iniciar una sesión
                        </button>
                    </div>

                    <div className="space-y-3">
                        {paginatedRecentSessions.map((recentSession) => {
                            const sessionTypeLabel = recentSession.lesson_plan
                                ? `Lesson plan · ${recentSession.total_phases ?? 1} fase${(recentSession.total_phases ?? 1) === 1 ? '' : 's'}`
                                : recentSession.game?.game_type?.name || 'Juego';

                            return (
                            <button
                                key={recentSession.id}
                                type="button"
                                onClick={() => openRecentSession(recentSession.id)}
                                className="grid w-full grid-cols-[110px_minmax(0,1.2fr)_160px_210px_140px] items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
                            >
                                <span className="font-['Orbitron'] text-lg font-black text-white">#{recentSession.id}</span>
                                <div className="min-w-0">
                                    <p className="truncate font-bold text-white">{recentSession.lesson_plan?.name || recentSession.game?.name || 'Sesión sin título'}</p>
                                    <p className="truncate text-sm text-zinc-500">{sessionTypeLabel}</p>
                                </div>
                                <span className="text-sm uppercase text-zinc-400">{recentSession.status}</span>
                                <div className="text-sm text-zinc-500">
                                    <p>Creada: {formatDateTime(recentSession.created_at)}</p>
                                    <p>Actualizada: {formatDateTime(recentSession.updated_at)}</p>
                                </div>
                                <div className="text-right text-sm text-zinc-400">
                                    <p className="font-semibold text-white">PIN {recentSession.pin}</p>
                                    <p>Fase {Number(recentSession.current_phase_index ?? 0) + 1}/{recentSession.total_phases ?? 1}</p>
                                    <p>{getSessionModeMeta(recentSession.game_mode || 'individual').shortLabel}</p>
                                </div>
                            </button>
                        );})}
                    </div>

                    {totalRecentSessionsPages > 1 ? (
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <p className="text-sm text-zinc-400">Paginación de sesiones · Página {recentSessionsPage} de {totalRecentSessionsPages}</p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRecentSessionsPage((page) => Math.max(1, page - 1))}
                                    disabled={recentSessionsPage === 1}
                                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRecentSessionsPage((page) => Math.min(totalRecentSessionsPages, page + 1))}
                                    disabled={recentSessionsPage === totalRecentSessionsPages}
                                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    if (!session) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-6 text-center">
            <div className="text-red-400 font-['Orbitron'] text-xl">NO SE ENCONTRÓ ESA SESIÓN</div>
            <div className="max-w-xl text-sm text-zinc-500">El dashboard solo puede abrir sesiones activas o existentes. Si acabas de guardar un juego, vuelve al editor y crea una sesión con ese juego.</div>
            <button
                type="button"
                onClick={goToGames}
                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25"
            >
                Volver a juegos
            </button>
        </div>
    );

    return (
        <div className="min-h-screen pl-24 pr-8 py-8 relative flex flex-col gap-6 bg-zinc-950 text-white">
            <AnimatePresence>
                {showPinModal && session?.pin ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            className="w-full max-w-xl rounded-3xl border border-cyan-400/20 bg-zinc-950/95 p-8 text-white shadow-[0_20px_90px_rgba(0,0,0,0.45)]"
                        >
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Sesión creada</p>
                                    <h2 className="mt-2 text-3xl font-black font-['Orbitron'] text-white">Comparte este PIN</h2>
                                    <p className="mt-3 text-sm leading-6 text-zinc-400">Tu sesión ya está lista. El alumnado tiene que entrar con este PIN antes de empezar: {sessionLabel}.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300 transition hover:bg-white/10"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 text-center">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">PIN de acceso</p>
                                <p className="mt-3 font-['Orbitron'] text-5xl font-black tracking-[0.28em] text-cyan-200">{session.pin}</p>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCopyPin}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copiar PIN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                                >
                                    Ir al dashboard
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[28px_28px] opacity-30" />
                <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute top-[8%] left-[12%] h-160 w-160 rounded-full bg-cyan-500/8 blur-[130px]" />
                <motion.div animate={{ x: [0, -35, 0], y: [0, 22, 0] }} transition={{ duration: 16, repeat: Infinity }} className="absolute bottom-[8%] right-[8%] h-140 w-140 rounded-full bg-emerald-500/8 blur-[120px]" />
            </div>

            <header className="rounded-[1.75rem] border border-white/10 bg-black/35 p-6 backdrop-blur-md">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                            <PanelTop className="h-4 w-4" />
                            Sala de control
                        </div>
                        <h1 className="font-['Orbitron'] text-3xl font-black text-white">Operación en vivo</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                            {sessionLabel}. Desde aquí diriges la sesión, vigilas participantes, mueves fases y exportas resultados.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-105">
                        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Sesión</p>
                            <p className="mt-2 font-['Orbitron'] text-2xl font-black text-white">#{session.id}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{sessionModeMeta.label}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Estado actual</p>
                            <p className={`mt-2 font-['Orbitron'] text-2xl font-black uppercase ${session.status === 'playing' ? 'text-emerald-300' : session.status === 'paused' ? 'text-amber-300' : session.status === 'finished' ? 'text-zinc-300' : 'text-cyan-300'}`}>{session.status}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">Fase {Number(session.current_phase_index ?? 0) + 1}/{session.total_phases ?? 1}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-2 text-zinc-300"><Activity className="h-4 w-4 text-cyan-300" /> ID {session.id}</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-2 text-zinc-300"><RadioTower className="h-4 w-4 text-emerald-300" /> Presencia en directo</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-2 text-zinc-300"><BarChart3 className="h-4 w-4 text-amber-300" /> Resultados persistidos</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
                            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.22em] uppercase">Estado operativo</span>
                            <div className={`mt-3 text-2xl font-['Orbitron'] font-black uppercase ${session.status === 'playing' ? 'text-emerald-300' : session.status === 'paused' ? 'text-amber-300' : session.status === 'finished' ? 'text-zinc-300' : 'text-cyan-300'}`}>{session.status}</div>
                            <p className="mt-2 text-sm text-zinc-400">Controla la sesión actual y sus transiciones.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
                            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.22em] uppercase">PIN activo</span>
                            <button type="button" onClick={handleCopyPin} className="mt-3 block font-['Orbitron'] text-2xl font-black tracking-[0.18em] text-cyan-300 transition hover:text-cyan-200">
                                {session.pin}
                            </button>
                            <p className="mt-2 text-sm text-zinc-400">Cópialo y compártelo con la clase.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
                            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.22em] uppercase">Conectados</span>
                            <div className="mt-3 text-2xl font-['Orbitron'] font-black text-white">{activeParticipants.length}</div>
                            <p className="mt-2 text-sm text-zinc-400">{sessionModeMeta.value === 'table' ? 'Mesas' : sessionModeMeta.value === 'shared' ? 'Puestos' : 'Alumnos'} detectados ahora mismo.</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Comandos de sesión</p>
                                <p className="mt-1 text-sm text-zinc-400">Acciones directas sobre el estado de la partida actual.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={handlePauseResume}
                                disabled={isFinished}
                                className={`p-3 rounded-xl transition-all ${isPaused ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/5 hover:bg-white/10 text-white border border-transparent'}`}>
                                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </button>
                            <button onClick={handleFinish}
                                disabled={isFinished}
                                className="p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/50 transition-all flex items-center gap-2 font-bold text-sm">
                                FINALIZAR <SkipForward className="w-4 h-4" />
                            </button>
                            <button onClick={nextPhase}
                                disabled={isFinished || (session.total_phases ?? 1) <= Number(session.current_phase_index ?? 0) + 1}
                                className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-300 border border-cyan-500/50 transition-all flex items-center gap-2 font-bold text-sm">
                                SIGUIENTE FASE <SkipForward className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                            <h2 className="text-lg font-bold font-['Orbitron'] tracking-wider flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-400" />MAPA DE {sessionModeMeta.value === 'table' ? 'MESAS' : sessionModeMeta.value === 'shared' ? 'PUESTOS' : 'ALUMNOS'}
                            </h2>
                        </div>
                        {scoreRows.length > 0 ? (
                            <div className="space-y-3">
                                {scoreRows.map((participant, index) => (
                                    <StudentRow
                                        key={participant.key}
                                        index={index}
                                        student={participant}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-zinc-500 font-bold text-sm py-10">
                                {sessionModeMeta.value === 'table'
                                    ? 'Las mesas aparecerán aquí cuando se conecten a la sesión por PIN.'
                                    : sessionModeMeta.value === 'shared'
                                        ? 'Los puestos conectados aparecerán aquí cuando entren por PIN.'
                                        : 'Los alumnos aparecerán aquí cuando se conecten a la sesión por PIN.'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                            <div>
                                <h2 className="text-lg font-bold font-['Orbitron'] tracking-wider flex items-center gap-2 text-amber-300">
                                    <Trophy className="w-5 h-5" />RESULTADOS GUARDADOS
                                </h2>
                                <p className="mt-2 text-sm text-zinc-400">Se actualizan en vivo mientras juegan y siguen accesibles cuando la sesión termina.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => refreshResults()}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-200 transition hover:bg-white/10"
                                >
                                    Recargar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportResults}
                                    disabled={isExportingResults}
                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Download className="h-4 w-4" />
                                    {isExportingResults ? 'Exportando' : 'Exportar CSV'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Con resultados</p>
                                <p className="mt-2 font-['Orbitron'] text-2xl font-black text-white">{resultsData?.stats?.participants_with_results ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Completados</p>
                                <p className="mt-2 font-['Orbitron'] text-2xl font-black text-emerald-300">{resultsData?.stats?.completed_count ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Media</p>
                                <p className="mt-2 font-['Orbitron'] text-2xl font-black text-cyan-300">{resultsData?.stats?.average_score ?? 0}</p>
                            </div>
                        </div>

                        {resultsData?.best_result ? (
                            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/80">Mejor resultado guardado</p>
                                <div className="mt-3 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-lg font-bold text-white">{resultsData.best_result.label}</p>
                                        <p className="mt-1 text-sm text-amber-100/80">{formatElapsed(resultsData.best_result.time_seconds)} · {resultsData.best_result.answers_count} respuestas</p>
                                    </div>
                                    <div className="rounded-2xl bg-black/20 px-4 py-3 text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Puntos</p>
                                        <p className="font-['Orbitron'] text-2xl font-black text-amber-200">{resultsData.best_result.score}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-zinc-500">
                                Todavía no hay resultados guardados en esta sesión.
                            </div>
                        )}

                        <div className="space-y-3">
                            {(resultsData?.results_summary ?? []).slice(0, 5).map((entry, index) => (
                                <div key={entry.participant_key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${index === 0 ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-black/20 text-zinc-300'}`}>
                                            {index === 0 ? <Trophy className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-white">{entry.label}</p>
                                            <p className="text-xs text-zinc-500">{formatElapsed(entry.time_seconds)} · {entry.completed ? 'Completado' : 'En curso'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-['Orbitron'] text-xl font-black text-cyan-200">{entry.score}</p>
                                        <p className="text-xs text-zinc-500">{entry.correct_answers}/{entry.answers_count} aciertos</p>
                                    </div>
                                </div>
                            ))}
                            {(resultsData?.results_summary ?? []).length === 0 ? null : (
                                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    <BarChart3 className="h-4 w-4" />Persistido y disponible para reabrir esta sesión más tarde.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
                        <h2 className="text-lg font-bold font-['Orbitron'] tracking-wider flex items-center gap-2 mb-4 text-red-400">
                            <ShieldAlert className="w-5 h-5" />NOTIFICACIONES EN VIVO
                        </h2>
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            <AnimatePresence>
                                {alerts.map((alert) => (
                                    <motion.div key={alert.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 rounded-xl border text-sm flex gap-3 ${alert.type === 'warning' || alert.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'}`}>
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <div><span className="font-bold block mb-1">{alert.message}</span><span className="text-xs opacity-50">{alert.time}</span></div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {alerts.length === 0 && <div className="text-center text-zinc-600 font-bold text-sm py-10">Sin notificaciones aún.</div>}
                        </div>
                    </div>

                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                        <button onClick={handleForceFinish} className="w-full py-4 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-xl transition-all font-['Orbitron'] tracking-widest">
                            FORZAR FIN DE FASE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
