import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import echo from '@/lib/echo';
import { sessionAPI } from '@/api/api';
import { getSessionModeMeta } from '@/components/organisms/SessionModeSelector';
import { formatElapsed } from '@/lib/formatters';
import { ROUTE_PATHS, buildDashboardSessionPath } from '@/router/paths';

const API_URL = import.meta.env.VITE_API_URL;
const RECENT_SESSIONS_PER_PAGE = 6;

function buildInitialResultsData(createdSession) {
    if (!createdSession) {
        return null;
    }

    return {
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
    };
}

export function useTeacherDashboard() {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const headers = useMemo(() => ({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    }), [token]);
    const createdSession = location.state?.createdSession ?? null;
    const justCreated = Boolean(location.state?.justCreated);

    const [session, setSession] = useState(() => {
        if (!sessionId || !createdSession || String(createdSession.id) !== String(sessionId)) {
            return null;
        }

        return createdSession;
    });
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(Boolean(sessionId) && !createdSession);
    const [recentSessions, setRecentSessions] = useState([]);
    const [emptyStateError, setEmptyStateError] = useState('');
    const [recentSessionsPage, setRecentSessionsPage] = useState(1);
    const [showPinModal, setShowPinModal] = useState(justCreated && Boolean(createdSession?.pin));
    const [activeParticipants, setActiveParticipants] = useState(createdSession?.active_participants ?? []);
    const [isExportingResults, setIsExportingResults] = useState(false);
    const [resultsData, setResultsData] = useState(buildInitialResultsData(createdSession));

    const pushAlert = useCallback((type, message) => {
        setAlerts((prev) => [{ id: Date.now(), type, message, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    }, []);

    const refreshResults = useCallback(async (targetSessionId = session?.id) => {
        if (!targetSessionId) {
            return;
        }

        const result = await sessionAPI.results(targetSessionId);
        if (!result.success) {
            return;
        }

        setResultsData(result.data);
    }, [session?.id]);

    const refreshSession = useCallback(async () => {
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
    }, [refreshResults, session?.id]);

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
            .then((response) => response.json())
            .then(({ data }) => {
                setSession(data);
                setActiveParticipants(data?.active_participants ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [headers, sessionId]);

    const totalRecentSessionsPages = Math.max(1, Math.ceil(recentSessions.length / RECENT_SESSIONS_PER_PAGE));
    const paginatedRecentSessions = useMemo(() => recentSessions.slice(
        (recentSessionsPage - 1) * RECENT_SESSIONS_PER_PAGE,
        recentSessionsPage * RECENT_SESSIONS_PER_PAGE,
    ), [recentSessions, recentSessionsPage]);

    useEffect(() => {
        if (recentSessionsPage > totalRecentSessionsPages) {
            setRecentSessionsPage(totalRecentSessionsPages);
        }
    }, [recentSessionsPage, totalRecentSessionsPages]);

    useEffect(() => {
        if (!session) {
            return;
        }

        const channel = echo.channel(`session.${session.id}`);
        channel.listen('.session.state', ({ state }) => {
            setSession((prev) => prev ? ({ ...prev, status: state }) : prev);
            refreshResults(session.id);
            pushAlert('info', state === 'phase_changed' ? 'Fase actualizada' : `Sesión ${state}`);
        });
        channel.listen('.session.presence', (data) => {
            setActiveParticipants(data.participants ?? []);
        });
        channel.listen('.player.answered', (data) => {
            refreshSession();
            pushAlert(data.is_correct ? 'success' : 'warning', `${data.player_name || data.device_id}: ${data.is_correct ? '✓ Correcto' : '✗ Incorrecto'} — ${data.score} pts`);
        });

        return () => echo.leaveChannel(`session.${session.id}`);
    }, [pushAlert, refreshResults, refreshSession, session]);

    const sessionLabel = useMemo(() => {
        if (!session) {
            return '';
        }

        return session.lesson_plan?.name || session.game?.name || `Sesión #${session.id}`;
    }, [session]);

    const sessionModeMeta = useMemo(() => getSessionModeMeta(session?.game_mode || 'individual'), [session?.game_mode]);

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

    useEffect(() => {
        if (!session?.id) {
            return;
        }

        refreshResults(session.id);
    }, [refreshResults, session?.id]);

    const handleCopyPin = async () => {
        if (!session?.pin) {
            return;
        }

        try {
            await navigator.clipboard.writeText(String(session.pin));
            pushAlert('info', `PIN ${session.pin} copiado`);
        } catch {
            pushAlert('warning', 'No se pudo copiar el PIN automáticamente.');
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
            pushAlert('error', result.error);
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

        pushAlert('info', `Resultados exportados: ${result.filename}`);
    };

    const executeSessionAction = async (endpoint) => {
        const response = await fetch(`${API_URL}/api/sessions/${sessionId}/${endpoint}`, { method: 'POST', headers });
        const { data } = await response.json();
        setSession((prev) => ({ ...prev, ...data }));
    };

    const nextPhase = async () => {
        const result = await sessionAPI.nextPhase(sessionId);
        if (!result.success) {
            pushAlert('error', result.error);
            return;
        }

        setSession(result.data);
        pushAlert('info', `Fase ${result.data.current_phase_index + 1} cargada`);
    };

    return {
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
        isPaused: session?.status === 'paused',
        isFinished: session?.status === 'finished',
        setShowPinModal,
        setRecentSessionsPage,
        refreshResults,
        handleCopyPin,
        handleExportResults,
        handlePauseResume: () => executeSessionAction(session?.status === 'paused' ? 'resume' : 'pause'),
        handleFinish: () => executeSessionAction('finish'),
        handleForceFinish: () => executeSessionAction('finish'),
        nextPhase,
        goToSessionCreate: () => navigate(ROUTE_PATHS.sessionsCreate),
        goToGames: () => navigate(ROUTE_PATHS.games),
        openRecentSession: (id) => navigate(buildDashboardSessionPath(id)),
    };
}