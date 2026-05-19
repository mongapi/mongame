import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '@/api/api';

export function useAdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        async function loadDashboard() {
            const result = await adminAPI.dashboard();
            if (!mounted) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setLoading(false);
                return;
            }

            setDashboard(result.data);
            setLoading(false);
        }

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, []);

    const quickActions = useMemo(() => ([
        { title: 'Usuarios', description: 'Cuentas y roles.', path: '/admin/users' },
        { title: 'Tipos de juego', description: 'Catálogo y uso.', path: '/admin/game-types' },
        { title: 'Auditoría', description: 'Actividad reciente.', path: '/admin/audit' },
    ]), []);

    return {
        dashboard,
        loading,
        error,
        quickActions,
    };
}