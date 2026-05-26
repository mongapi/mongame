import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, gameAPI, lessonPlanAPI, sessionAPI } from '@/api/api';
import { ROUTE_PATHS, buildDashboardSessionPath, buildLessonPlanEditPath } from '@/router/paths';

export function useLessonPlanEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const currentUser = authAPI.getCurrentUser();

    const [games, setGames] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        game_ids: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sessionMode, setSessionMode] = useState(() => localStorage.getItem('preferred_session_mode') || 'individual');

    useEffect(() => {
        let mounted = true;

        async function loadEditor() {
            setIsLoading(true);
            setError('');

            const gamesResult = await gameAPI.list();
            if (!mounted) {
                return;
            }

            if (!gamesResult.success) {
                setError(gamesResult.error);
                setIsLoading(false);
                return;
            }

            setGames(gamesResult.data);

            if (!isEditing) {
                setIsLoading(false);
                return;
            }

            const lessonPlanResult = await lessonPlanAPI.get(id);
            if (!mounted) {
                return;
            }

            if (!lessonPlanResult.success) {
                setError(lessonPlanResult.error);
                setIsLoading(false);
                return;
            }

            setForm({
                name: lessonPlanResult.data.name ?? '',
                description: lessonPlanResult.data.description ?? '',
                game_ids: Array.isArray(lessonPlanResult.data.game_ids) ? lessonPlanResult.data.game_ids : [],
            });
            setIsLoading(false);
        }

        loadEditor();

        return () => {
            mounted = false;
        };
    }, [id, isEditing]);

    const gamesById = useMemo(() => {
        return games.reduce((accumulator, game) => {
            accumulator[game.id] = game;
            return accumulator;
        }, {});
    }, [games]);

    const selectedGames = useMemo(
        () => form.game_ids.map((gameId) => gamesById[gameId]).filter(Boolean),
        [form.game_ids, gamesById],
    );

    const availableGames = useMemo(() => {
        return games
            .filter((game) => !form.game_ids.includes(game.id))
            .filter((game) => game.is_active !== false)
            .sort((left, right) => {
                const leftIsOwn = currentUser?.id ? left.user_id === currentUser.id : false;
                const rightIsOwn = currentUser?.id ? right.user_id === currentUser.id : false;

                if (leftIsOwn !== rightIsOwn) {
                    return leftIsOwn ? -1 : 1;
                }

                return new Date(right.updated_at ?? right.created_at ?? 0).getTime()
                    - new Date(left.updated_at ?? left.created_at ?? 0).getTime();
            });
    }, [currentUser?.id, form.game_ids, games]);

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const addGame = (gameId) => {
        setForm((current) => {
            if (current.game_ids.includes(gameId)) {
                return current;
            }

            return { ...current, game_ids: [...current.game_ids, gameId] };
        });
    };

    const removeGame = (gameId) => {
        setForm((current) => ({
            ...current,
            game_ids: current.game_ids.filter((currentGameId) => currentGameId !== gameId),
        }));
    };

    const moveGame = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= form.game_ids.length) {
            return;
        }

        const nextGameIds = [...form.game_ids];
        const [movedGameId] = nextGameIds.splice(fromIndex, 1);
        nextGameIds.splice(toIndex, 0, movedGameId);
        setForm((current) => ({ ...current, game_ids: nextGameIds }));
    };

    const saveLessonPlan = async () => {
        if (isSaving) {
            return null;
        }

        setError('');
        setSuccess('');

        if (!form.name.trim()) {
            setError('Ponle un nombre al lesson plan.');
            return null;
        }

        if (form.game_ids.length === 0) {
            setError('Añade al menos un juego al lesson plan.');
            return null;
        }

        setIsSaving(true);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            game_ids: form.game_ids,
        };

        const result = isEditing
            ? await lessonPlanAPI.update(id, payload)
            : await lessonPlanAPI.create(payload);

        setIsSaving(false);

        if (!result.success) {
            setError(result.error);
            return null;
        }

        setSuccess(isEditing ? 'Lesson plan actualizado.' : 'Lesson plan creado.');

        if (!isEditing) {
            navigate(buildLessonPlanEditPath(result.data.id), { replace: true });
        }

        return result.data;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await saveLessonPlan();
    };

    const handleLaunchSession = async () => {
        if (isLaunching) {
            return;
        }

        const savedLessonPlan = await saveLessonPlan();
        if (!savedLessonPlan) {
            return;
        }

        setIsLaunching(true);
        const result = await sessionAPI.create({ lesson_plan_id: savedLessonPlan.id, game_mode: sessionMode });
        setIsLaunching(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        navigate(buildDashboardSessionPath(result.data.id), {
            state: {
                justCreated: true,
                createdSession: result.data,
            },
        });
    };

    return {
        isEditing,
        form,
        isLoading,
        isSaving,
        isLaunching,
        error,
        success,
        sessionMode,
        setSessionMode,
        selectedGames,
        availableGames,
        updateField,
        addGame,
        removeGame,
        moveGame,
        handleSubmit,
        handleLaunchSession,
        goBack: () => navigate(ROUTE_PATHS.games),
    };
}