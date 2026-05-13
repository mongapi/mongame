import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { sessionAPI } from '@/api/api';

export function useSessionGame({ resolveContent, validateContent }) {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    const [session, setSession] = useState(location.state?.session ?? null);
    const [isLoading, setIsLoading] = useState(Boolean(sessionId) && !location.state?.session);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sessionId || session) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function loadSession() {
            const result = await sessionAPI.get(sessionId);
            if (cancelled) return;

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

    const content = useMemo(() => resolveContent(session?.game_content ?? null), [resolveContent, session?.game_content]);
    const validationError = useMemo(() => validateContent(content), [content, validateContent]);

    return {
        session,
        sessionId,
        content,
        isLoading,
        error: error || validationError,
        setError,
    };
}