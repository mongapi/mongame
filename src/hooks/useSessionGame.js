import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { sessionAPI } from '@/api/api';
import echo from '@/lib/echo';
import { resolvePlayRouteByGameType } from '@/router/paths';

function getDefaultParticipantName(gameMode) {
    if (gameMode === 'table') {
        return 'Mesa web';
    }

    if (gameMode === 'shared') {
        return 'Puesto web';
    }

    return 'Alumno web';
}

export function useSessionGame({ resolveContent, validateContent }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const pin = searchParams.get('pin') || location.state?.session?.pin || null;
    const preview = !sessionId && location.state?.preview ? location.state.preview : null;
    const initialSession = location.state?.session ?? (preview
        ? {
            id: null,
            pin: null,
            game_mode: 'preview',
            game_content: preview.gameContent ?? {},
            game: preview.game ?? null,
            lesson_plan: preview.lessonPlan ?? null,
        }
        : null);

    const [session, setSession] = useState(initialSession);
    const [isLoading, setIsLoading] = useState(Boolean(sessionId) && !location.state?.session);
    const [error, setError] = useState('');

    const participant = useMemo(() => {
        const deviceId = localStorage.getItem('device_id') || `web-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('device_id', deviceId);

        const storedPlayerName = location.state?.playerName || localStorage.getItem('player_name');
        const playerName = preview
            ? 'Vista previa docente'
            : storedPlayerName || getDefaultParticipantName(session?.game_mode);

        if (!preview) {
            localStorage.setItem('player_name', playerName);
        }

        return { deviceId, playerName };
    }, [location.state?.playerName, preview, session?.game_mode]);

    useEffect(() => {
        if (!sessionId || session) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function loadSession() {
            const result = await sessionAPI.get(sessionId);
            if (cancelled) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            setSession(result.data);
            setIsLoading(false);
        }

        loadSession();

        return () => {
            cancelled = true;
        };
    }, [session, sessionId]);

    useEffect(() => {
        if (!sessionId) {
            return;
        }

        let cancelled = false;

        const refreshSession = async () => {
            const result = await sessionAPI.get(sessionId);
            if (cancelled || !result.success) {
                return;
            }

            setSession((current) => {
                if (!current) {
                    return result.data;
                }

                return current.updated_at === result.data.updated_at && current.status === result.data.status
                    ? current
                    : result.data;
            });
        };

        const intervalId = window.setInterval(refreshSession, 10000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId || Boolean(preview)) {
            return;
        }

        const channel = echo.channel(`session.${sessionId}`);

        const syncSessionFromServer = async ({ shouldRedirect = false } = {}) => {
            await new Promise((resolve) => window.setTimeout(resolve, 500));
            const result = await sessionAPI.get(sessionId);

            if (!result.success) {
                setError((current) => current || result.error);
                return;
            }

            const nextSession = result.data;
            setSession(nextSession);

            if (!shouldRedirect) {
                return;
            }

            const nextRoute = resolvePlayRouteByGameType(nextSession?.game?.game_type?.code);

            if (!nextRoute) {
                return;
            }

            const nextSearch = new URLSearchParams();
            nextSearch.set('sessionId', String(sessionId));

            if (pin) {
                nextSearch.set('pin', pin);
            }

            const nextUrl = `${nextRoute}?${nextSearch.toString()}`;

            navigate(nextUrl, {
                replace: true,
                state: {
                    session: nextSession,
                    playerName: participant.playerName,
                    deviceId: participant.deviceId,
                },
            });
        };

        channel.listen('.session.state', ({ state, current_phase_index: nextPhaseIndex }) => {
            const phaseChanged = state === 'phase_changed'
                || Number(nextPhaseIndex ?? session?.current_phase_index ?? 0) !== Number(session?.current_phase_index ?? 0);

            if (phaseChanged) {
                void syncSessionFromServer({ shouldRedirect: true });
                return;
            }

            setSession((current) => current ? ({
                ...current,
                status: state ?? current.status,
                current_phase_index: nextPhaseIndex ?? current.current_phase_index,
            }) : current);
        });

        return () => {
            echo.leaveChannel(`session.${sessionId}`);
        };
    }, [navigate, participant.deviceId, participant.playerName, pin, preview, session?.current_phase_index, sessionId]);

    useEffect(() => {
        if (!sessionId || !pin) {
            return;
        }

        let cancelled = false;

        const touchPresence = async () => {
            const result = await sessionAPI.touchPresence(sessionId, {
                pin,
                device_id: participant.deviceId,
                player_name: participant.playerName,
            });

            if (!cancelled && !result.success) {
                setError((current) => current || result.error);
            }
        };

        touchPresence();
        const intervalId = window.setInterval(touchPresence, 20000);

        const handleBeforeUnload = () => {
            navigator.sendBeacon?.(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/sessions/${sessionId}/presence/leave`,
                new URLSearchParams({ pin, device_id: participant.deviceId }),
            );
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            sessionAPI.leavePresence(sessionId, { pin, device_id: participant.deviceId });
        };
    }, [participant.deviceId, participant.playerName, pin, sessionId]);

    const content = useMemo(() => resolveContent((preview?.gameContent ?? session?.game_content) ?? null), [preview?.gameContent, resolveContent, session?.game_content]);
    const validationError = useMemo(() => validateContent(content), [content, validateContent]);

    return {
        session,
        sessionId,
        content,
        participant,
        isPreview: Boolean(preview),
        previewTitle: preview?.title ?? session?.game?.name ?? session?.lesson_plan?.name ?? 'Vista previa',
        isLoading,
        error: error || validationError,
        setError,
    };
}