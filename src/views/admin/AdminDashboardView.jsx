import { Activity, ArrowRight, Boxes, Database, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { formatDateTime } from '@/lib/formatters';
import LoadingScreen from '@/components/ui/LoadingScreen';

function MetricCard({ icon: Icon, label, value, tone = 'cyan' }) {
    const tones = {
        cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
        amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
        emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
        purple: 'border-purple-400/20 bg-purple-400/10 text-purple-200',
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
                <div className={`rounded-2xl border p-3 ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="font-['Orbitron'] text-3xl font-black text-white sm:text-4xl">{value}</p>
        </div>
    );
}

export default function AdminDashboardView() {
    const { dashboard, loading, error, quickActions } = useAdminDashboard();

    if (loading) {
        return <LoadingScreen title="Cargando Dashboard Admin..." />;
    }

    if (error || !dashboard) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-8">
                <div className="max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-100">
                    <h1 className="font-['Orbitron'] text-2xl font-black">No se pudo cargar el dashboard admin</h1>
                    <p className="mt-4 text-sm text-red-100/80">{error || 'Falta información para construir el panel.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="font-['Orbitron'] text-3xl font-black sm:text-4xl">PANEL DE ADMINISTRACIÓN</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Resumen general del sistema.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={Users} label="Usuarios totales" value={dashboard.metrics.users_total} tone="cyan" />
                    <MetricCard icon={Boxes} label="Juegos" value={dashboard.metrics.games_total} tone="purple" />
                    <MetricCard icon={Database} label="Lesson plans" value={dashboard.metrics.lesson_plans_total} tone="amber" />
                    <MetricCard icon={Activity} label="Sesiones" value={dashboard.metrics.sessions_total} tone="emerald" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="font-['Orbitron'] text-xl font-black text-white">Usuarios por rol</h2>
                                <p className="mt-2 text-sm text-zinc-500">Distribución actual de cuentas dadas de alta.</p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Admin</p>
                                <p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{dashboard.metrics.users_by_role.admin}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Teacher</p>
                                <p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{dashboard.metrics.users_by_role.teacher}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Student</p>
                                <p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{dashboard.metrics.users_by_role.student}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <div className="mb-5">
                            <h2 className="font-['Orbitron'] text-xl font-black text-white">Salud del sistema</h2>
                            <p className="mt-2 text-sm text-zinc-500">Estado general.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/80">Servicio</p>
                                <p className="mt-2 font-semibold text-white">{dashboard.health.api.label}</p>
                            </div>
                            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/80">Tiempo real</p>
                                <p className="mt-2 font-semibold text-white">{dashboard.health.websocket.driver}</p>
                                <p className="mt-1 text-sm text-zinc-300">{dashboard.health.websocket.configured ? `${dashboard.health.websocket.host}:${dashboard.health.websocket.port}` : 'Sin configurar.'}</p>
                            </div>
                            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200/80">Procesos</p>
                                <p className="mt-2 font-semibold text-white">{dashboard.health.queue.driver}</p>
                                <p className="mt-1 text-sm text-zinc-300">{dashboard.health.queue.in_use ? 'Activos.' : 'Modo simple.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <h2 className="font-['Orbitron'] text-xl font-black text-white">Últimas sesiones</h2>
                        <div className="mt-5 space-y-3">
                            {dashboard.recent_activity.sessions.map((session) => (
                                <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-white">{session.lesson_plan?.name || session.game?.name || `Sesión #${session.id}`}</p>
                                            <p className="mt-1 text-sm text-zinc-500">{session.teacher?.name || 'Sin profesor'} · {formatDateTime(session.created_at)}</p>
                                        </div>
                                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase text-zinc-300">{session.status}</span>
                                    </div>
                                    <p className="mt-3 text-sm text-zinc-400">PIN {session.pin}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <h2 className="font-['Orbitron'] text-xl font-black text-white">Últimos usuarios</h2>
                        <div className="mt-5 space-y-3">
                            {dashboard.recent_activity.users.map((user) => (
                                <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="font-bold text-white">{user.name}</p>
                                    <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
                                    <div className="mt-3 flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                        <span>{user.role}</span>
                                        <span>{formatDateTime(user.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <h2 className="font-['Orbitron'] text-xl font-black text-white">Últimos recursos</h2>
                        <div className="mt-5 space-y-3">
                            {dashboard.recent_activity.resources.map((resource) => (
                                <div key={`${resource.type}-${resource.id}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                                        <p className="font-bold text-white">{resource.name}</p>
                                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase text-zinc-300">{resource.type === 'game' ? 'Juego' : 'Lesson plan'}</span>
                                    </div>
                                    <p className="mt-3 text-sm text-zinc-500">{formatDateTime(resource.created_at)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                    <div className="mb-5">
                        <h2 className="font-['Orbitron'] text-xl font-black text-white">Accesos rápidos</h2>
                        <p className="mt-2 text-sm text-zinc-500">Acceso directo a las secciones activas.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.title}
                                to={action.path}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/10"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-bold text-white">{action.title}</p>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                        Abrir
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-zinc-500">{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}