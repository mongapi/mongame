import { Boxes, Puzzle, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PaginationControls from '@/components/ui/PaginationControls';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAdminGameTypesView } from '@/hooks/useAdminGameTypesView';

const GAME_TYPES_PER_PAGE = 6;

export default function AdminGameTypesView() {
    const { types, metrics, loading, error } = useAdminGameTypesView();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);

    const filteredTypes = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return types;
        }

        return types.filter((type) => `${type.name} ${type.code} ${type.description || ''}`.toLowerCase().includes(normalized));
    }, [types, query]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTypes.length / GAME_TYPES_PER_PAGE)), [filteredTypes.length]);

    const paginatedTypes = useMemo(() => {
        const startIndex = (page - 1) * GAME_TYPES_PER_PAGE;
        return filteredTypes.slice(startIndex, startIndex + GAME_TYPES_PER_PAGE);
    }, [filteredTypes, page]);

    useEffect(() => {
        setPage(1);
    }, [query]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    if (loading) {
        return <LoadingScreen title="Cargando tipos de juego..." />;
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
                            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-purple-200">Admin / Tipos de juego</div>
                            <h1 className="mt-5 font-['Orbitron'] text-3xl font-black text-white sm:text-4xl">Catálogo operativo</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Vista general del catálogo.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link to="/admin/dashboard" className="rounded-2xl border border-purple-400/30 bg-purple-400/15 px-5 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-400/20">Volver al dashboard</Link>
                            <Link to="/admin/audit" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Ver auditoría</Link>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Tipos</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.total}</p></div>
                        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Activos</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.active}</p></div>
                        <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Inactivos</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.inactive}</p></div>
                        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Juegos</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.games_total}</p></div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-['Orbitron'] text-xl font-black text-white">Mecánicas registradas</h2>
                                <p className="mt-2 text-sm text-zinc-500">Busca por nombre, código o descripción.</p>
                            </div>
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tipo" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/30" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {paginatedTypes.map((type) => (
                                <div key={type.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-white">{type.name}</p>
                                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{type.code}</p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${type.is_active ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-red-400/20 bg-red-400/10 text-red-200'}`}>{type.is_active ? 'Activo' : 'Inactivo'}</span>
                                    </div>

                                    <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-400">{type.description || 'Sin descripción registrada.'}</p>

                                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Juegos asociados</p>
                                        <p className="font-['Orbitron'] text-2xl font-black text-cyan-200">{type.games_total}</p>
                                    </div>
                                </div>
                            ))}

                            {filteredTypes.length === 0 ? (
                                <div className="md:col-span-2 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-zinc-500">No hay tipos que coincidan con la búsqueda.</div>
                            ) : null}
                        </div>

                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            totalItems={filteredTypes.length}
                            pageSize={GAME_TYPES_PER_PAGE}
                            onPageChange={setPage}
                            itemLabel="tipos"
                        />
                    </section>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-['Orbitron'] text-xl font-black text-white">Estado del catálogo</h2><p className="mt-2 text-sm text-zinc-500">Resumen rápido.</p></div><div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-3 text-purple-200"><Puzzle className="h-5 w-5" /></div></div>
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Activos</p><p className="mt-2 text-sm text-zinc-400">{metrics.active} disponibles.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Juegos</p><p className="mt-2 text-sm text-zinc-400">{metrics.games_total} asociados.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">Sin uso</p><p className="mt-2 text-sm text-zinc-400">{types.filter((type) => type.games_total === 0).length} tipos.</p></div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-['Orbitron'] text-xl font-black text-white">Top en uso</h2><p className="mt-2 text-sm text-zinc-500">Más usados.</p></div><div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200"><Sparkles className="h-5 w-5" /></div></div>
                            <div className="space-y-3">
                                {[...types].sort((left, right) => right.games_total - left.games_total).slice(0, 4).map((type) => (
                                    <div key={type.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                        <div className="min-w-0"><p className="truncate font-semibold text-white">{type.name}</p><p className="text-sm text-zinc-500">{type.code}</p></div>
                                        <span className="font-['Orbitron'] text-2xl font-black text-cyan-200">{type.games_total}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}