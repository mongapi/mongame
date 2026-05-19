import { useEffect, useState } from 'react';
import { adminAPI } from '@/api/api';

const EMPTY_METRICS = {
    total: 0,
    active: 0,
    inactive: 0,
    games_total: 0,
};

export function useAdminGameTypesView() {
    const [types, setTypes] = useState([]);
    const [metrics, setMetrics] = useState(EMPTY_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        async function load() {
            const result = await adminAPI.gameTypes();

            if (!mounted) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setLoading(false);
                return;
            }

            setTypes(result.data.types ?? []);
            setMetrics(result.data.metrics ?? EMPTY_METRICS);
            setLoading(false);
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        types,
        metrics,
        loading,
        error,
    };
}