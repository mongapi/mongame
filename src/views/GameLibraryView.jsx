import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowDownUp, BookOpen, Filter, Pencil, PlayCircle, PlusCircle, Rows3, Search, Shapes } from 'lucide-react';
import { gameAPI, lessonPlanAPI, sessionAPI } from '@/api/api';

const GAMES_PER_PAGE = 6;
const LESSON_PLANS_PER_PAGE = 8;

function formatDate(value) {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function PaginationControls({ page, totalPages, onPageChange, label }) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-sm text-zinc-400">{label} · Página {page} de {totalPages}</p>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Anterior
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}

function TypeBadge({ game }) {
    const label = game?.game_type?.name ?? 'Sin tipo';

    return (
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {label}
        </span>
    );
}

function CategoryTab({ icon: Icon, label, isActive, onClick, count }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                isActive
                    ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            <span className="rounded-full bg-black/30 px-2 py-1 text-xs text-zinc-300">{count}</span>
        </button>
    );
}

function FilterChip({ label, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isActive
                    ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
}

function LessonPlanBadge({ lessonPlan }) {
    const totalPhases = Array.isArray(lessonPlan?.game_ids) ? lessonPlan.game_ids.length : 0;

    return (
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            {totalPhases} fase{totalPhases === 1 ? '' : 's'}
        </span>
    );
}

function LessonPlanPhaseFilterChip({ label, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isActive
                    ? 'border-amber-400/30 bg-amber-400/15 text-amber-200'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
}

export default function GameLibraryView() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [lessonPlans, setLessonPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [startingGameId, setStartingGameId] = useState(null);
    const [startingLessonPlanId, setStartingLessonPlanId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('games');
    const [activeGameTypeFilter, setActiveGameTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [gameSort, setGameSort] = useState('recent');
    const [lessonPlanPhaseFilter, setLessonPlanPhaseFilter] = useState('all');
    const [lessonPlanSort, setLessonPlanSort] = useState('recent');
    const [gamesPage, setGamesPage] = useState(1);
    const [lessonPlansPage, setLessonPlansPage] = useState(1);

    useEffect(() => {
        let mounted = true;

        async function loadLibrary() {
            setIsLoading(true);
            setError('');

            const [gamesResult, lessonPlansResult] = await Promise.all([
                gameAPI.list(),
                lessonPlanAPI.list(),
            ]);

            if (!mounted) {
                return;
            }

            if (!gamesResult.success) {
                setError(gamesResult.error);
                setIsLoading(false);
                return;
            }

            if (!lessonPlansResult.success) {
                setError(lessonPlansResult.error);
                setIsLoading(false);
                return;
            }

            setGames(gamesResult.data);
            setLessonPlans(lessonPlansResult.data);
            setIsLoading(false);
        }

        loadLibrary();

        return () => {
            mounted = false;
        };
    }, []);

    const gameTypeFilters = useMemo(() => {
        const types = games
            .map((game) => ({
                code: game?.game_type?.code ?? 'unknown',
                label: game?.game_type?.name ?? 'Sin tipo',
            }))
            .filter((item, index, list) => list.findIndex((entry) => entry.code === item.code) === index)
            .sort((left, right) => left.label.localeCompare(right.label));

        return [{ code: 'all', label: 'Todos' }, ...types];
    }, [games]);

    const gamesById = useMemo(() => {
        return games.reduce((accumulator, game) => {
            accumulator[game.id] = game;
            return accumulator;
        }, {});
    }, [games]);

    const filteredGames = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const byType = activeGameTypeFilter === 'all'
            ? games
            : games.filter((game) => game?.game_type?.code === activeGameTypeFilter);

        const searchedGames = !normalizedQuery
            ? byType
            : byType.filter((game) => {
                return [game.name, game.description, game?.game_type?.name]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
            });

        return [...searchedGames].sort((left, right) => {
            if (gameSort === 'oldest') {
                return new Date(left.created_at ?? 0).getTime() - new Date(right.created_at ?? 0).getTime();
            }

            if (gameSort === 'updated') {
                return new Date(right.updated_at ?? 0).getTime() - new Date(left.updated_at ?? 0).getTime();
            }

            if (gameSort === 'name') {
                return String(left.name ?? '').localeCompare(String(right.name ?? ''), 'es');
            }

            return new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime();
        });
    }, [activeGameTypeFilter, gameSort, games, searchQuery]);

    const filteredLessonPlans = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const searchedLessonPlans = normalizedQuery
            ? lessonPlans.filter((lessonPlan) => {
                return [lessonPlan.name, lessonPlan.description]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
            })
            : lessonPlans;

        const phaseFilteredLessonPlans = searchedLessonPlans.filter((lessonPlan) => {
            const totalPhases = Array.isArray(lessonPlan.game_ids) ? lessonPlan.game_ids.length : 0;

            if (lessonPlanPhaseFilter === 'single') {
                return totalPhases === 1;
            }

            if (lessonPlanPhaseFilter === 'medium') {
                return totalPhases >= 2 && totalPhases <= 3;
            }

            if (lessonPlanPhaseFilter === 'large') {
                return totalPhases >= 4;
            }

            return true;
        });

        const sortedLessonPlans = [...phaseFilteredLessonPlans].sort((left, right) => {
            if (lessonPlanSort === 'oldest') {
                return new Date(left.created_at ?? 0).getTime() - new Date(right.created_at ?? 0).getTime();
            }

            if (lessonPlanSort === 'name') {
                return String(left.name ?? '').localeCompare(String(right.name ?? ''), 'es');
            }

            if (lessonPlanSort === 'updated') {
                return new Date(right.updated_at ?? 0).getTime() - new Date(left.updated_at ?? 0).getTime();
            }

            return new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime();
        });

        return sortedLessonPlans;
    }, [lessonPlanPhaseFilter, lessonPlanSort, lessonPlans, searchQuery]);

    const totalGamesPages = Math.max(1, Math.ceil(filteredGames.length / GAMES_PER_PAGE));
    const totalLessonPlanPages = Math.max(1, Math.ceil(filteredLessonPlans.length / LESSON_PLANS_PER_PAGE));

    const paginatedGames = useMemo(() => {
        const startIndex = (gamesPage - 1) * GAMES_PER_PAGE;
        return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
    }, [filteredGames, gamesPage]);

    const paginatedLessonPlans = useMemo(() => {
        const startIndex = (lessonPlansPage - 1) * LESSON_PLANS_PER_PAGE;
        return filteredLessonPlans.slice(startIndex, startIndex + LESSON_PLANS_PER_PAGE);
    }, [filteredLessonPlans, lessonPlansPage]);

    useEffect(() => {
        setGamesPage(1);
    }, [activeGameTypeFilter, gameSort, searchQuery]);

    useEffect(() => {
        setLessonPlansPage(1);
    }, [lessonPlanPhaseFilter, lessonPlanSort, searchQuery]);

    useEffect(() => {
        if (gamesPage > totalGamesPages) {
            setGamesPage(totalGamesPages);
        }
    }, [gamesPage, totalGamesPages]);

    useEffect(() => {
        if (lessonPlansPage > totalLessonPlanPages) {
            setLessonPlansPage(totalLessonPlanPages);
        }
    }, [lessonPlansPage, totalLessonPlanPages]);

    const handleStartSession = async (game) => {
        setStartingGameId(game.id);
        setError('');

        const result = await sessionAPI.create({
            game_id: game.id,
            game_content: game.game_content ?? {},
        });

        setStartingGameId(null);

        if (!result.success) {
            setError(result.error);
            return;
        }

        navigate(`/dashboard/${result.data.id}`);
    };

    const handleStartLessonPlanSession = async (lessonPlan) => {
        setStartingLessonPlanId(lessonPlan.id);
        setError('');

        const result = await sessionAPI.create({
            lesson_plan_id: lessonPlan.id,
        });

        setStartingLessonPlanId(null);

        if (!result.success) {
            setError(result.error);
            return;
        }

        navigate(`/dashboard/${result.data.id}`);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-white font-['Orbitron']">CARGANDO BIBLIOTECA...</div>;
    }

    return (
        <div className="min-h-screen px-8 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black font-['Orbitron']">BIBLIOTECA DE JUEGOS</h1>
                        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                            Aquí tienes las plantillas y juegos reutilizables. Desde esta biblioteca puedes editarlos o lanzar una sesión nueva con cualquiera de ellos.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/sessions/create')}
                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Crear sesión nueva
                    </button>
                </div>

                <div className="mb-6 rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder={activeCategory === 'games' ? 'Buscar juegos por nombre, descripción o tipo...' : 'Buscar lesson plans por nombre o descripción...'}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-400"
                        />
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <CategoryTab
                        icon={Rows3}
                        label="Juegos"
                        count={games.length}
                        isActive={activeCategory === 'games'}
                        onClick={() => setActiveCategory('games')}
                    />
                    <CategoryTab
                        icon={Shapes}
                        label="Lesson plans"
                        count={lessonPlans.length}
                        isActive={activeCategory === 'lessonPlans'}
                        onClick={() => setActiveCategory('lessonPlans')}
                    />
                </div>

                {activeCategory === 'games' ? (
                    <div className="mb-8 rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">
                                <Filter className="h-4 w-4" />
                                Filtrar por tipo de juego
                            </div>
                            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                                <ArrowDownUp className="h-4 w-4 text-zinc-500" />
                                <span>Ordenar</span>
                                <select
                                    value={gameSort}
                                    onChange={(event) => setGameSort(event.target.value)}
                                    className="bg-transparent text-sm text-white outline-none"
                                >
                                    <option value="recent" className="bg-zinc-950 text-white">Más recientes</option>
                                    <option value="oldest" className="bg-zinc-950 text-white">Más antiguos</option>
                                    <option value="updated" className="bg-zinc-950 text-white">Última edición</option>
                                    <option value="name" className="bg-zinc-950 text-white">Nombre A-Z</option>
                                </select>
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {gameTypeFilters.map((filter) => (
                                <FilterChip
                                    key={filter.code}
                                    label={filter.label}
                                    isActive={activeGameTypeFilter === filter.code}
                                    onClick={() => setActiveGameTypeFilter(filter.code)}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}

                {activeCategory === 'lessonPlans' ? (
                    <div className="mb-8 rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">
                                <Filter className="h-4 w-4" />
                                Filtrar lesson plans
                            </div>
                            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                                <ArrowDownUp className="h-4 w-4 text-zinc-500" />
                                <span>Ordenar</span>
                                <select
                                    value={lessonPlanSort}
                                    onChange={(event) => setLessonPlanSort(event.target.value)}
                                    className="bg-transparent text-sm text-white outline-none"
                                >
                                    <option value="recent" className="bg-zinc-950 text-white">Más recientes</option>
                                    <option value="oldest" className="bg-zinc-950 text-white">Más antiguos</option>
                                    <option value="name" className="bg-zinc-950 text-white">Nombre A-Z</option>
                                </select>
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <LessonPlanPhaseFilterChip label="Todos" isActive={lessonPlanPhaseFilter === 'all'} onClick={() => setLessonPlanPhaseFilter('all')} />
                            <LessonPlanPhaseFilterChip label="1 fase" isActive={lessonPlanPhaseFilter === 'single'} onClick={() => setLessonPlanPhaseFilter('single')} />
                            <LessonPlanPhaseFilterChip label="2-3 fases" isActive={lessonPlanPhaseFilter === 'medium'} onClick={() => setLessonPlanPhaseFilter('medium')} />
                            <LessonPlanPhaseFilterChip label="4+ fases" isActive={lessonPlanPhaseFilter === 'large'} onClick={() => setLessonPlanPhaseFilter('large')} />
                        </div>
                    </div>
                ) : null}

                {error ? (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : null}

                {activeCategory === 'games' && filteredGames.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-12 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black font-['Orbitron'] text-white">No hay juegos en esta categoría</h2>
                        <p className="mt-3 text-sm text-zinc-500">
                            Ajusta el filtro o crea una sesión nueva para empezar a llenar la biblioteca.
                        </p>
                    </div>
                ) : null}

                {activeCategory === 'lessonPlans' && filteredLessonPlans.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-12 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400">
                            <Shapes className="h-8 w-8" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black font-['Orbitron'] text-white">No hay lesson plans en esta búsqueda</h2>
                        <p className="mt-3 text-sm text-zinc-500">
                            Crea uno nuevo o ajusta el texto de búsqueda para encontrar otra secuencia.
                        </p>
                    </div>
                ) : null}

                {activeCategory === 'games' && filteredGames.length > 0 ? (
                    <div>
                        <div className="mb-4 flex items-center justify-between gap-4 text-sm text-zinc-400">
                            <p>Mostrando {paginatedGames.length} de {filteredGames.length} juegos</p>
                            <p>Orden actual: {gameSort === 'recent' ? 'más recientes' : gameSort === 'oldest' ? 'más antiguos' : gameSort === 'updated' ? 'última edición' : 'nombre A-Z'}</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {paginatedGames.map((game, index) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{game.name}</h2>
                                        <p className="mt-2 text-sm text-zinc-400">{game.description || 'Sin descripción todavía.'}</p>
                                    </div>
                                    <TypeBadge game={game} />
                                </div>

                                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-500">
                                    <div className="font-semibold uppercase tracking-[0.16em] text-zinc-400">Juego #{game.id}</div>
                                    <div className="mt-3 space-y-1 text-sm text-zinc-300">
                                        <p>Creado: {formatDate(game.created_at)}</p>
                                        <p>Última edición: {formatDate(game.updated_at)}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleStartSession(game)}
                                        disabled={startingGameId === game.id}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <PlayCircle className="h-5 w-5" />
                                        {startingGameId === game.id ? 'Creando...' : 'Crear sesión'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/games/${game.id}/edit`)}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-zinc-200 transition hover:bg-white/10"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Editar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        </div>
                        <PaginationControls
                            page={gamesPage}
                            totalPages={totalGamesPages}
                            onPageChange={setGamesPage}
                            label="Paginación de juegos"
                        />
                    </div>
                ) : null}

                {activeCategory === 'lessonPlans' ? (
                    <div>
                        {filteredLessonPlans.length > 0 ? (
                            <div className="mb-4 flex items-center justify-between gap-4 text-sm text-zinc-400">
                                <p>Mostrando {paginatedLessonPlans.length} de {filteredLessonPlans.length} lesson plans</p>
                                <p>Orden actual: {lessonPlanSort === 'recent' ? 'más recientes' : lessonPlanSort === 'oldest' ? 'más antiguos' : lessonPlanSort === 'updated' ? 'última edición' : 'nombre A-Z'}</p>
                            </div>
                        ) : null}
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl">
                        <div className="grid grid-cols-[minmax(0,1.4fr)_120px_220px_220px] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            <span>Lesson plan</span>
                            <span>Fases</span>
                            <span>Fechas</span>
                            <span>Acciones</span>
                        </div>
                        {paginatedLessonPlans.map((lessonPlan, index) => {
                            const gamesInPlan = Array.isArray(lessonPlan.game_ids)
                                ? lessonPlan.game_ids.map((gameId) => gamesById[gameId]).filter(Boolean)
                                : [];
                            const createdAtLabel = formatDate(lessonPlan.created_at);
                            const updatedAtLabel = formatDate(lessonPlan.updated_at);

                            return (
                                <motion.div
                                    key={lessonPlan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className="grid grid-cols-[minmax(0,1.4fr)_120px_220px_220px] gap-4 border-b border-white/10 px-6 py-5 last:border-b-0"
                                >
                                    <div className="min-w-0">
                                        <div>
                                            <h2 className="truncate text-lg font-black text-white">{lessonPlan.name}</h2>
                                            <p className="mt-2 text-sm text-zinc-400">{lessonPlan.description || 'Sin descripción todavía.'}</p>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {gamesInPlan.length > 0 ? gamesInPlan.map((game) => (
                                                <span key={game.id} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">
                                                    {game.name}
                                                </span>
                                            )) : (
                                                <span className="text-sm text-zinc-500">Los juegos de este lesson plan no están cargados en la biblioteca actual.</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <LessonPlanBadge lessonPlan={lessonPlan} />
                                    </div>
                                    <div className="space-y-1 pt-1 text-sm text-zinc-300">
                                        <p>Creado: {createdAtLabel}</p>
                                        <p>Última edición: {updatedAtLabel}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleStartLessonPlanSession(lessonPlan)}
                                            disabled={startingLessonPlanId === lessonPlan.id}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <PlayCircle className="h-5 w-5" />
                                            {startingLessonPlanId === lessonPlan.id ? 'Creando...' : 'Crear sesión'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/lesson-plans/${lessonPlan.id}/edit`)}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-zinc-200 transition hover:bg-white/10"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                        <PaginationControls
                            page={lessonPlansPage}
                            totalPages={totalLessonPlanPages}
                            onPageChange={setLessonPlansPage}
                            label="Paginación de lesson plans"
                        />
                    </div>
                ) : null}

                <div className="mt-8 flex justify-end">
                    {activeCategory === 'lessonPlans' ? (
                        <button
                            type="button"
                            onClick={() => navigate('/lesson-plans/create')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/15 px-5 py-3 font-bold text-amber-200 transition hover:bg-amber-400/25"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Crear lesson plan
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}