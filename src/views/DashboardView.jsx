import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    Users, Play, Pause, SkipForward,
    AlertTriangle, ShieldAlert, CheckCircle2,
    WifiOff, BrainCircuit, Activity, PlusCircle, Copy, X, Trophy, Medal, BarChart3, Download
} from "lucide-react";
import echo from "@/lib/echo";
import { sessionAPI } from "@/api/api";
import { getSessionModeMeta } from '@/components/organisms/SessionModeSelector';

const API_URL = import.meta.env.VITE_API_URL;
const RECENT_SESSIONS_PER_PAGE = 6;

function formatDateTime(value) {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatElapsed(seconds) {
    if (seconds === null || seconds === undefined) {
        return 'Sin tiempo';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

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
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` };
    const createdSession = location.state?.createdSession ?? null;
    const justCreated = Boolean(location.state?.justCreated);

    const [session, setSession] = useState(() => {
        if (!sessionId || !createdSession || String(createdSession.id) !== String(sessionId)) {
            return null;
        }

        return createdSession;
    });
    const [alerts, setAlerts]   = useState([]);
    const [loading, setLoading] = useState(Boolean(sessionId) && !createdSession);
    const [recentSessions, setRecentSessions] = useState([]);
    const [emptyStateError, setEmptyStateError] = useState('');
    const [recentSessionsPage, setRecentSessionsPage] = useState(1);
    const [showPinModal, setShowPinModal] = useState(justCreated && Boolean(createdSession?.pin));
    const [activeParticipants, setActiveParticipants] = useState(createdSession?.active_participants ?? []);
    const [isExportingResults, setIsExportingResults] = useState(false);
    const [resultsData, setResultsData] = useState(createdSession ? {
        session_id: createdSession.id,
        session_status: createdSession.status,
        game_mode: createdSession.game_mode,
        session_label: createdSession.lesson_plan?.name || createdSession.game?.name || `Sesión #${createdSession.id}`,
        results_summary: createdSession.results_summary ?? [],
        stats: {
            participants_with_results: createdSession.results_summary?.length ?? 0,
            completed_count: (createdSession.results_summary ?? []).filter((entry) => entry.completed).length,
            total_score: (createdSession.results_summary ?? []).reduce((total, entry) => total + (entry.score ?? 0), 0),
            average_score: 0,
        },
        best_result: (createdSession.results_summary ?? [])[0] ?? null,
    } : null);

    useEffect(() => {
        if (!sessionId) {
            sessionAPI.list()
                .then((result) => {
                    if (!result.success) {
                        setEmptyStateError(result.error);
                        setLoading(false);
                        return;
                    }

                    setRecentSessions(result.data ?? []);
                    setRecentSessionsPage(1);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
            return;
        }

        fetch(`${API_URL}/api/sessions/${sessionId}`, { headers })
            .then(r => r.json())
            .then(({ data }) => {
                setSession(data);
                setActiveParticipants(data?.active_participants ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [createdSession, headers, sessionId]);

    const totalRecentSessionsPages = Math.max(1, Math.ceil(recentSessions.length / RECENT_SESSIONS_PER_PAGE));
    const paginatedRecentSessions = recentSessions.slice(
        (recentSessionsPage - 1) * RECENT_SESSIONS_PER_PAGE,
        recentSessionsPage * RECENT_SESSIONS_PER_PAGE,
    );

    useEffect(() => {
        if (recentSessionsPage > totalRecentSessionsPages) {
            setRecentSessionsPage(totalRecentSessionsPages);
        }
    }, [recentSessionsPage, totalRecentSessionsPages]);

    useEffect(() => {
        if (!session) return;
        const channel = echo.channel(`session.${session.id}`);
        channel.listen(".session.state", ({ state }) => {
            setSession(prev => prev ? ({ ...prev, status: state }) : prev);
            refreshResults(session.id);
            setAlerts(prev => [{ id: Date.now(), type: "info", message: state === 'phase_changed' ? 'Fase actualizada' : `Sesión ${state}`, time: new Date().toLocaleTimeString() }, ...prev]);
        });
        channel.listen(".session.presence", (data) => {
            setActiveParticipants(data.participants ?? []);
        });
        channel.listen(".player.answered", (data) => {
            refreshSession();
            setAlerts(prev => [{ id: Date.now(), type: data.is_correct ? "success" : "warning", message: `${data.player_name || data.device_id}: ${data.is_correct ? "✓ Correcto" : "✗ Incorrecto"} — ${data.score} pts`, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        });
        return () => echo.leaveChannel(`session.${session.id}`);
    }, [session?.id]);

    const sessionLabel = useMemo(() => {
        if (!session) {
            return '';
        }

        return session.lesson_plan?.name || session.game?.name || `Sesión #${session.id}`;
    }, [session]);

    const sessionModeMeta = useMemo(() => getSessionModeMeta(session?.game_mode || 'individual'), [session?.game_mode]);
    const refreshResults = async (targetSessionId = session?.id) => {
        if (!targetSessionId) {
            return;
        }

        const result = await sessionAPI.results(targetSessionId);
        if (!result.success) {
            return;
        }

        setResultsData(result.data);
    };

    const scoreRows = useMemo(() => {
        const activeKeys = new Set((activeParticipants ?? []).map((participant) => participant.participant_key || participant.device_id));
        const sourceResults = resultsData?.results_summary ?? session?.results_summary ?? [];
        const scoredRows = sourceResults.map((entry) => ({
            key: entry.participant_key,
            name: entry.label,
            status: activeKeys.has(entry.participant_key) ? 'active' : 'waiting',
            score: entry.score,
            timeLabel: formatElapsed(entry.time_seconds),
        }));

        const missingActiveRows = (activeParticipants ?? [])
            .filter((participant) => !scoredRows.some((entry) => entry.key === (participant.participant_key || participant.device_id)))
            .map((participant) => ({
                key: participant.participant_key || participant.device_id,
                name: participant.player_name || participant.device_id,
                status: 'active',
                score: 0,
                timeLabel: 'Sin tiempo',
            }));

        return [...scoredRows, ...missingActiveRows];
    }, [activeParticipants, resultsData?.results_summary, session?.results_summary]);

    const refreshSession = async () => {
        if (!session?.id) {
            return;
        }

        const result = await sessionAPI.get(session.id);
        if (!result.success) {
            return;
        }

        setSession(result.data);
        setActiveParticipants(result.data?.active_participants ?? []);
        refreshResults(result.data.id);
    };

    useEffect(() => {
        if (!session?.id) {
            return;
        }

        refreshResults(session.id);
    }, [session?.id]);

    const handleCopyPin = async () => {
        if (!session?.pin) {
            return;
        }

        try {
            await navigator.clipboard.writeText(String(session.pin));
            setAlerts((prev) => [{ id: Date.now(), type: 'info', message: `PIN ${session.pin} copiado`, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        } catch {
            setAlerts((prev) => [{ id: Date.now(), type: 'warning', message: 'No se pudo copiar el PIN automáticamente.', time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        }
    };

    const handleExportResults = async () => {
        if (!session?.id || isExportingResults) {
            return;
        }

        setIsExportingResults(true);
        const result = await sessionAPI.exportResults(session.id);
        setIsExportingResults(false);

        if (!result.success) {
            setAlerts((prev) => [{ id: Date.now(), type: 'error', message: result.error, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
            return;
        }

        const blobUrl = window.URL.createObjectURL(result.data);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = result.filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(blobUrl);

        setAlerts((prev) => [{ id: Date.now(), type: 'info', message: `Resultados exportados: ${result.filename}`, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    };

    const action = async (endpoint) => {
        const res = await fetch(`${API_URL}/api/sessions/${sessionId}/${endpoint}`, { method: "POST", headers });
        const { data } = await res.json();
        setSession(prev => ({ ...prev, ...data }));
    };

    const nextPhase = async () => {
        const result = await sessionAPI.nextPhase(sessionId);
        if (!result.success) {
            setAlerts(prev => [{ id: Date.now(), type: 'error', message: result.error, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
            return;
        }

        setSession(result.data);
        setAlerts(prev => [{ id: Date.now(), type: 'info', message: `Fase ${result.data.current_phase_index + 1} cargada`, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    };

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
                                onClick={() => navigate('/sessions/create')}
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
                            onClick={() => navigate('/sessions/create')}
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
                                onClick={() => navigate(`/dashboard/${recentSession.id}`)}
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
                onClick={() => navigate('/games')}
                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25"
            >
                Volver a juegos
            </button>
        </div>
    );

    const isPaused = session.status === "paused";
    const isFinished = session.status === 'finished';

    return (
        <div className="min-h-screen pl-24 pr-8 py-8 relative flex flex-col gap-6">
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
                <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[10%] left-[20%] h-150 w-150 rounded-full bg-purple-600/10 blur-[120px]" />
                <motion.div animate={{ x: [0, -50, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-[10%] right-[10%] h-125 w-125 rounded-full bg-cyan-600/10 blur-[100px]" />
            </div>

            <header className="flex justify-between items-end bg-zinc-950/50 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-black font-['Orbitron'] text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-cyan-400 mb-2">CONTROL DE SESIÓN</h1>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 font-bold tracking-wider">
                        <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-green-400" /> ID: {session.id}</span>
                        <span className="text-white/20">|</span>
                        <span>{sessionModeMeta.label}</span>
                        <span className="text-white/20">|</span>
                        <span>FASE {Number(session.current_phase_index ?? 0) + 1}/{session.total_phases ?? 1}</span>
                        <span className="text-white/20">|</span>
                        <span className={`uppercase font-bold ${session.status === 'playing' ? 'text-green-400' : session.status === 'paused' ? 'text-yellow-400' : 'text-zinc-400'}`}>{session.status}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-zinc-500 font-bold text-xs tracking-widest block mb-1">SESIÓN</span>
                    <span className="text-4xl font-black font-['Orbitron'] tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">#{session.id}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center">
                            <span className="text-zinc-400 text-xs font-bold tracking-wider mb-2">ESTADO</span>
                            <div className={`text-2xl font-['Orbitron'] font-black uppercase ${session.status === 'playing' ? 'text-green-400' : 'text-yellow-400'}`}>{session.status}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center">
                            <span className="text-zinc-400 text-xs font-bold tracking-wider mb-2">PIN ACTIVO</span>
                            <button type="button" onClick={handleCopyPin} className="font-['Orbitron'] text-2xl font-black tracking-[0.18em] text-cyan-300 transition hover:text-cyan-200">
                                {session.pin}
                            </button>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center">
                            <span className="text-zinc-400 text-xs font-bold tracking-wider mb-2">{sessionModeMeta.value === 'table' ? 'MESAS CONECTADAS' : sessionModeMeta.value === 'shared' ? 'PUESTOS CONECTADOS' : 'ALUMNOS CONECTADOS'}</span>
                            <div className="text-2xl font-['Orbitron'] font-black text-white">{activeParticipants.length}</div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center justify-end gap-2">
                            <button onClick={() => action(isPaused ? "resume" : "pause")}
                                disabled={isFinished}
                                className={`p-3 rounded-xl transition-all ${isPaused ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/5 hover:bg-white/10 text-white border border-transparent'}`}>
                                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </button>
                            <button onClick={() => action("finish")}
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
                        <button onClick={() => action("finish")} className="w-full py-4 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-xl transition-all font-['Orbitron'] tracking-widest">
                            FORZAR FIN DE FASE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
