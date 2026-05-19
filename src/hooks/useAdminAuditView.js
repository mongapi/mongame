import { useEffect, useState } from 'react';
import { adminAPI } from '@/api/api';

const EMPTY_METRICS = {
    events_total: 0,
    users_last_7_days: 0,
    games_last_7_days: 0,
    sessions_last_7_days: 0,
};

export function useAdminAuditView() {
    const [events, setEvents] = useState([]);
    const [metrics, setMetrics] = useState(EMPTY_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        async function load() {
            const result = await adminAPI.audit();

            if (!mounted) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setLoading(false);
                return;
            }

            setEvents(result.data.events ?? []);
            setMetrics(result.data.metrics ?? EMPTY_METRICS);
            setLoading(false);
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        events,
        metrics,
        loading,
        error,
    };
}