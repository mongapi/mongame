import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    Users, Play, Pause, SkipForward,
    AlertTriangle, ShieldAlert, CheckCircle2,
    WifiOff, BrainCircuit, Activity, PlusCircle
} from "lucide-react";
import echo from "@/lib/echo";
import { sessionAPI } from "@/api/api";

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
                <span className="text-xs text-zinc-500 font-bold tracking-wider">COMBO</span>
                <span className="text-cyan-400 font-black font-['Orbitron']">x{student.combo ?? 0}</span>
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
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` };

    const [session, setSession] = useState(null);
    const [alerts, setAlerts]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentSessions, setRecentSessions] = useState([]);
    const [emptyStateError, setEmptyStateError] = useState('');
    const [recentSessionsPage, setRecentSessionsPage] = useState(1);

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
            .then(({ data }) => { setSession(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [sessionId]);

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
            setAlerts(prev => [{ id: Date.now(), type: "info", message: state === 'phase_changed' ? 'Fase actualizada' : `Sesión ${state}`, time: new Date().toLocaleTimeString() }, ...prev]);
        });
        channel.listen(".player.answered", (data) => {
            setAlerts(prev => [{ id: Date.now(), type: data.is_correct ? "success" : "warning", message: `Mesa ${data.device_id}: ${data.is_correct ? "✓ Correcto" : "✗ Incorrecto"} — ${data.score} pts`, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        });
        return () => echo.leaveChannel(`session.${session.id}`);
    }, [session?.id]);

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

    return (
        <div className="min-h-screen pl-24 pr-8 py-8 relative flex flex-col gap-6">
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
                        <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center justify-end gap-2">
                            <button onClick={() => action(isPaused ? "resume" : "pause")}
                                className={`p-3 rounded-xl transition-all ${isPaused ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/5 hover:bg-white/10 text-white border border-transparent'}`}>
                                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </button>
                            <button onClick={() => action("finish")}
                                className="p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/50 transition-all flex items-center gap-2 font-bold text-sm">
                                FINALIZAR <SkipForward className="w-4 h-4" />
                            </button>
                            <button onClick={nextPhase}
                                disabled={(session.total_phases ?? 1) <= Number(session.current_phase_index ?? 0) + 1}
                                className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-300 border border-cyan-500/50 transition-all flex items-center gap-2 font-bold text-sm">
                                SIGUIENTE FASE <SkipForward className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                            <h2 className="text-lg font-bold font-['Orbitron'] tracking-wider flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-400" />MAPA DE ALUMNOS
                            </h2>
                        </div>
                        <div className="text-center text-zinc-500 font-bold text-sm py-10">
                            Los alumnos aparecerán aquí cuando se conecten.
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
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
