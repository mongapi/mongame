import { Activity, History, Search, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAdminAuditView } from '@/hooks/useAdminAuditView';
import { formatDateTime } from '@/lib/formatters';

export default function AdminAuditView() {
    const { events, metrics, loading, error } = useAdminAuditView();
    const [query, setQuery] = useState('');

    const filteredEvents = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return events;
        }

        return events.filter((event) => `${event.title} ${event.subtitle} ${event.detail} ${event.kind} ${event.action}`.toLowerCase().includes(normalized));
    }, [events, query]);

    if (loading) {
        return <LoadingScreen title="Cargando actividad admin..." />;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center px-4 text-red-100"><div className="max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/10 p-8">{error}</div></div>;
    }

    return (
        <div className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-8">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200">Admin / Auditoría</div>
                            <h1 className="mt-5 font-['Orbitron'] text-3xl font-black text-white sm:text-4xl">Actividad del sistema</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Timeline consolidado del admin.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link to="/admin/dashboard" className="rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20">Volver al dashboard</Link>
                            <Link to="/admin/users" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Ver usuarios</Link>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Eventos</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.events_total}</p></div>
                        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Usuarios 7d</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.users_last_7_days}</p></div>
                        <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Juegos 7d</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.games_last_7_days}</p></div>
                        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Sesiones 7d</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.sessions_last_7_days}</p></div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-['Orbitron'] text-xl font-black text-white">Timeline</h2>
                                <p className="mt-2 text-sm text-zinc-500">Historial reciente de actividad consolidada.</p>
                            </div>
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar evento" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/30" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate font-semibold text-white">{event.title}</p>
                                                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${event.kind === 'user' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : event.kind === 'session' ? 'border-amber-400/20 bg-amber-400/10 text-amber-200' : event.kind === 'game' ? 'border-purple-400/20 bg-purple-400/10 text-purple-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>{event.kind}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-zinc-500">{event.subtitle}</p>
                                            <p className="mt-3 text-sm leading-6 text-zinc-400">{event.detail}</p>
                                        </div>
                                        <div className="text-sm text-zinc-500 sm:text-right">
                                            <p className="uppercase tracking-[0.18em]">{event.action}</p>
                                            <p className="mt-1">{formatDateTime(event.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredEvents.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-zinc-500">No hay eventos que coincidan con el filtro.</div> : null}
                        </div>
                    </section>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-['Orbitron'] text-xl font-black text-white">Lectura rápida</h2><p className="mt-2 text-sm text-zinc-500">Qué está generando más movimiento en el sistema.</p></div><div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-200"><Activity className="h-5 w-5" /></div></div>
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Usuarios</p><p className="mt-2 text-sm text-zinc-400">{metrics.users_last_7_days} altas en siete días.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Juegos</p><p className="mt-2 text-sm text-zinc-400">{metrics.games_last_7_days} nuevos en siete días.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Sesiones</p><p className="mt-2 text-sm text-zinc-400">{metrics.sessions_last_7_days} creadas en siete días.</p></div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-['Orbitron'] text-xl font-black text-white">Señales</h2><p className="mt-2 text-sm text-zinc-500">Resumen operativo.</p></div><div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-200"><ShieldAlert className="h-5 w-5" /></div></div>
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Feed</p><p className="mt-2 text-sm text-zinc-400">Usuarios, juegos, lesson plans y sesiones.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Orden</p><p className="mt-2 text-sm text-zinc-400">Eventos ordenados por fecha.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Acceso</p><p className="mt-2 text-sm text-zinc-400">Enlace rápido a usuarios y dashboard.</p></div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}