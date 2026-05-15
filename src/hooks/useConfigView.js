import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, gameAPI, lessonPlanAPI, sessionAPI } from '@/api/api';
import { getSessionModeMeta } from '@/components/organisms/SessionModeSelector';
import { ROUTE_PATHS } from '@/router/paths';
import { formatDateTime } from '@/lib/formatters';

export function useConfigView() {
    const navigate = useNavigate();
    const currentUser = authAPI.getCurrentUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessions, setSessions] = useState([]);
    const [games, setGames] = useState([]);
    const [lessonPlans, setLessonPlans] = useState([]);
    const [defaultSessionMode, setDefaultSessionMode] = useState(() => localStorage.getItem('preferred_session_mode') || 'individual');
    const [defaultStartSection, setDefaultStartSection] = useState(() => localStorage.getItem('preferred_start_section') || 'dashboard');
    const [joinNamePreference, setJoinNamePreference] = useState(() => localStorage.getItem('preferred_join_name') || '');

    useEffect(() => {
        let mounted = true;

        async function loadConfigData() {
            setIsLoading(true);
            setError('');

            const [sessionsResult, gamesResult, lessonPlansResult] = await Promise.all([
                sessionAPI.list(),
                gameAPI.list(),
                lessonPlanAPI.list(),
            ]);

            if (!mounted) {
                return;
            }

            if (!sessionsResult.success) {
                setError(sessionsResult.error);
                setIsLoading(false);
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

            setSessions(sessionsResult.data);
            setGames(gamesResult.data);
            setLessonPlans(lessonPlansResult.data);
            setIsLoading(false);
        }

        loadConfigData();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('preferred_session_mode', defaultSessionMode);
    }, [defaultSessionMode]);

    useEffect(() => {
        localStorage.setItem('preferred_start_section', defaultStartSection);
    }, [defaultStartSection]);

    useEffect(() => {
        localStorage.setItem('preferred_join_name', joinNamePreference);
    }, [joinNamePreference]);

    const activeSessions = useMemo(
        () => sessions.filter((session) => ['waiting', 'playing', 'paused'].includes(session.status)),
        [sessions],
    );
    const recentSessions = useMemo(() => [...sessions].slice(0, 3), [sessions]);
    const preferredModeMeta = useMemo(() => getSessionModeMeta(defaultSessionMode), [defaultSessionMode]);

    const favoriteRoute = defaultStartSection === 'library'
        ? ROUTE_PATHS.games
        : defaultStartSection === 'create'
            ? ROUTE_PATHS.sessionsCreate
            : ROUTE_PATHS.dashboard;

    const quickActions = useMemo(() => ([
        { label: 'Ir al dashboard', helper: 'Control general de tus sesiones', action: () => navigate(ROUTE_PATHS.dashboard) },
        { label: 'Abrir biblioteca', helper: 'Revisar o editar actividades guardadas', action: () => navigate(ROUTE_PATHS.games) },
        { label: 'Crear sesión', helper: 'Empezar una actividad nueva', action: () => navigate(ROUTE_PATHS.sessionsCreate) },
    ]), [navigate]);

    const lastActivityLabel = recentSessions.length > 0
        ? `La última actualización fue ${formatDateTime(recentSessions[0].updated_at || recentSessions[0].created_at)}.`
        : 'Cuando empieces a usar sesiones y lesson plans, aquí aparecerá un resumen simple para darte contexto.';

    return {
        currentUser,
        isLoading,
        error,
        games,
        lessonPlans,
        activeSessions,
        recentSessions,
        preferredModeMeta,
        defaultSessionMode,
        defaultStartSection,
        joinNamePreference,
        setDefaultSessionMode,
        setDefaultStartSection,
        setJoinNamePreference,
        quickActions,
        lastActivityLabel,
        goToQuickSession: () => navigate(ROUTE_PATHS.sessionsCreate),
        goToFavoriteSection: () => navigate(favoriteRoute),
    };
}