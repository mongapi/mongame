import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, gameAPI, lessonPlanAPI, sessionAPI } from '@/api/api';
import { ROUTE_PATHS, buildDashboardSessionPath, buildGameEditPath, buildLessonPlanEditPath, resolvePlayRouteByGameType } from '@/router/paths';

const GAMES_PER_PAGE = 6;
const LESSON_PLANS_PER_PAGE = 8;

export function useGameLibraryView() {
    const navigate = useNavigate();
    const currentUser = authAPI.getCurrentUser();
    const [games, setGames] = useState([]);
    const [lessonPlans, setLessonPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [startingGameId, setStartingGameId] = useState(null);
    const [startingLessonPlanId, setStartingLessonPlanId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('games');
    const [activeScope, setActiveScope] = useState('mine');
    const [activeGameTypeFilter, setActiveGameTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [gameSort, setGameSort] = useState('recent');
    const [lessonPlanPhaseFilter, setLessonPlanPhaseFilter] = useState('all');
    const [lessonPlanSort, setLessonPlanSort] = useState('recent');
    const [gamesPage, setGamesPage] = useState(1);
    const [lessonPlansPage, setLessonPlansPage] = useState(1);
    const [sessionMode, setSessionMode] = useState('individual');
    const [pendingLaunch, setPendingLaunch] = useState(null);

    const loadLibrary = useCallback(async () => {
        setIsLoading(true);
        setError('');

        const [gamesResult, lessonPlansResult] = await Promise.all([
            gameAPI.list(),
            lessonPlanAPI.list(),
        ]);

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
    }, []);

    useEffect(() => {
        let mounted = true;

        async function loadLibraryData() {
            await loadLibrary();
        }

        if (mounted) {
            loadLibraryData();
        }

        return () => {
            mounted = false;
        };
    }, [loadLibrary]);

    const ownGames = useMemo(
        () => games.filter((game) => (currentUser?.id ? game.user_id === currentUser.id : true)),
        [currentUser?.id, games],
    );

    const sharedGames = useMemo(
        () => games.filter((game) => (currentUser?.id ? game.user_id !== currentUser.id : false)),
        [currentUser?.id, games],
    );

    const ownLessonPlans = useMemo(
        () => lessonPlans.filter((lessonPlan) => (currentUser?.id ? lessonPlan.user_id === currentUser.id : true)),
        [currentUser?.id, lessonPlans],
    );

    const sharedLessonPlans = useMemo(
        () => lessonPlans.filter((lessonPlan) => (currentUser?.id ? lessonPlan.user_id !== currentUser.id : false)),
        [currentUser?.id, lessonPlans],
    );

    const visibleGames = activeScope === 'shared' ? sharedGames : ownGames;
    const visibleLessonPlans = activeScope === 'shared' ? sharedLessonPlans : ownLessonPlans;

    const gameTypeFilters = useMemo(() => {
        const types = visibleGames
            .map((game) => ({
                code: game?.game_type?.code ?? 'unknown',
                label: game?.game_type?.name ?? 'Sin tipo',
            }))
            .filter((item, index, list) => list.findIndex((entry) => entry.code === item.code) === index)
            .sort((left, right) => left.label.localeCompare(right.label));

        return [{ code: 'all', label: 'Todos' }, ...types];
    }, [visibleGames]);

    const gamesById = useMemo(() => {
        return games.reduce((accumulator, game) => {
            accumulator[game.id] = game;
            return accumulator;
        }, {});
    }, [games]);

    const filteredGames = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const byType = activeGameTypeFilter === 'all'
            ? visibleGames
            : visibleGames.filter((game) => game?.game_type?.code === activeGameTypeFilter);

        const searchedGames = !normalizedQuery
            ? byType
            : byType.filter((game) => [game.name, game.description, game?.game_type?.name, game?.user?.name]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery)));

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
    }, [activeGameTypeFilter, gameSort, searchQuery, visibleGames]);

    const filteredLessonPlans = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const searchedLessonPlans = normalizedQuery
            ? visibleLessonPlans.filter((lessonPlan) => [lessonPlan.name, lessonPlan.description, lessonPlan?.user?.name]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery)))
            : visibleLessonPlans;

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

        return [...phaseFilteredLessonPlans].sort((left, right) => {
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
    }, [lessonPlanPhaseFilter, lessonPlanSort, searchQuery, visibleLessonPlans]);

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
    }, [activeGameTypeFilter, activeScope, gameSort, searchQuery]);

    useEffect(() => {
        setLessonPlansPage(1);
    }, [activeScope, lessonPlanPhaseFilter, lessonPlanSort, searchQuery]);

    useEffect(() => {
        setError('');
        setSuccess('');
    }, [activeCategory, activeScope]);

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

    const handleConfirmLaunch = async () => {
        if (!pendingLaunch) {
            return;
        }

        if (pendingLaunch.type === 'game') {
            const game = pendingLaunch.item;
            setStartingGameId(game.id);
            setError('');

            const result = await sessionAPI.create({
                game_id: game.id,
                game_content: game.game_content ?? {},
                game_mode: sessionMode,
            });

            setStartingGameId(null);

            if (!result.success) {
                setError(result.error);
                return;
            }

            setPendingLaunch(null);
            navigate(buildDashboardSessionPath(result.data.id), {
                state: {
                    justCreated: true,
                    createdSession: result.data,
                },
            });
            return;
        }

        const lessonPlan = pendingLaunch.item;
        setStartingLessonPlanId(lessonPlan.id);
        setError('');

        const result = await sessionAPI.create({
            lesson_plan_id: lessonPlan.id,
            game_mode: sessionMode,
        });

        setStartingLessonPlanId(null);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setPendingLaunch(null);
        navigate(buildDashboardSessionPath(result.data.id), {
            state: {
                justCreated: true,
                createdSession: result.data,
            },
        });
    };

    const duplicateGame = async (game) => {
        setError('');
        setSuccess('');
        setStartingGameId(game.id);

        const result = await gameAPI.create({
            name: `${game.name} (copia)`,
            description: game.description ?? '',
            game_type_id: game.game_type_id,
            game_content: game.game_content ?? {},
            is_active: game.is_active ?? true,
        });

        setStartingGameId(null);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setSuccess(`Has guardado una copia de ${game.name} en tu biblioteca.`);
        setActiveScope('mine');
        await loadLibrary();
    };

    const duplicateLessonPlan = async (lessonPlan) => {
        setError('');
        setSuccess('');
        setStartingLessonPlanId(lessonPlan.id);

        const result = await lessonPlanAPI.create({
            name: `${lessonPlan.name} (copia)`,
            description: lessonPlan.description ?? '',
            game_ids: Array.isArray(lessonPlan.game_ids) ? lessonPlan.game_ids : [],
            is_active: lessonPlan.is_active ?? true,
        });

        setStartingLessonPlanId(null);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setSuccess(`Has guardado una copia de ${lessonPlan.name} en tu biblioteca.`);
        setActiveScope('mine');
        await loadLibrary();
    };

    const previewGame = (game) => {
        const route = resolvePlayRouteByGameType(game?.game_type?.code);

        if (!route) {
            setError('Este tipo de juego todavía no tiene runtime de preview disponible.');
            return;
        }

        navigate(route, {
            state: {
                preview: {
                    title: game.name,
                    gameContent: game.game_content ?? {},
                    game: {
                        id: game.id,
                        name: game.name,
                        gameType: game.game_type ?? null,
                    },
                },
            },
        });
    };

    return {
        currentUser,
        games,
        lessonPlans,
        isLoading,
        error,
        success,
        startingGameId,
        startingLessonPlanId,
        activeCategory,
        activeScope,
        activeGameTypeFilter,
        searchQuery,
        gameSort,
        lessonPlanPhaseFilter,
        lessonPlanSort,
        gamesPage,
        lessonPlansPage,
        sessionMode,
        pendingLaunch,
        gameTypeFilters,
        gamesById,
        filteredGames,
        filteredLessonPlans,
        totalGamesPages,
        totalLessonPlanPages,
        paginatedGames,
        paginatedLessonPlans,
        ownGames,
        sharedGames,
        ownLessonPlans,
        sharedLessonPlans,
        setActiveCategory,
        setActiveScope,
        setActiveGameTypeFilter,
        setSearchQuery,
        setGameSort,
        setLessonPlanPhaseFilter,
        setLessonPlanSort,
        setGamesPage,
        setLessonPlansPage,
        setSessionMode,
        closeLaunchDialog: () => setPendingLaunch(null),
        handleStartSession: (game) => setPendingLaunch({ type: 'game', item: game }),
        handleStartLessonPlanSession: (lessonPlan) => setPendingLaunch({ type: 'lessonPlan', item: lessonPlan }),
        handleConfirmLaunch,
        goToCreateSession: () => navigate(ROUTE_PATHS.sessionsCreate),
        goToCreateLessonPlan: () => navigate(ROUTE_PATHS.lessonPlansCreate),
        editGame: (gameId) => navigate(buildGameEditPath(gameId)),
        editLessonPlan: (lessonPlanId) => navigate(buildLessonPlanEditPath(lessonPlanId)),
        duplicateGame,
        duplicateLessonPlan,
        previewGame,
    };
}