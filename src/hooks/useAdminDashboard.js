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
        { title: 'Gestionar usuarios', description: 'Próximo módulo para altas, roles y bloqueos.', path: '/admin/users' },
        { title: 'Tipos de juego', description: 'Alta y mantenimiento de mecánicas activas.', path: '/admin/game-types' },
        { title: 'Media', description: 'Biblioteca de recursos multimedia compartidos.', path: '/admin/media' },
        { title: 'Auditoría', description: 'Seguimiento de actividad y cambios del sistema.', path: '/admin/audit' },
    ]), []);

    return {
        dashboard,
        loading,
        error,
        quickActions,
    };
}