import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '@/api/api';
import { getSessionModeMeta } from '@/components/organisms/SessionModeSelector';
import { PLAY_ROUTE_BY_GAME_TYPE } from '@/router/paths';

function resolvePlayerName(gameMode, providedName) {
    const modeMeta = getSessionModeMeta(gameMode || 'individual');
    const preferredJoinName = localStorage.getItem('preferred_join_name')?.trim() || '';
    const storedPlayerName = localStorage.getItem('player_name')?.trim() || '';
    const fallbackName = modeMeta.value === 'table'
        ? 'Mesa web'
        : modeMeta.value === 'shared'
            ? 'Puesto web'
            : 'Alumno web';

    return String(providedName ?? '').trim() || storedPlayerName || preferredJoinName || fallbackName;
}

export function useJoinByPin() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const join = async ({ pin, playerName } = {}) => {
        const normalizedPin = String(pin ?? '').trim();
        if (normalizedPin.length !== 6) {
            return { success: false, error: 'El PIN debe tener 6 dígitos.' };
        }

        setError('');
        setLoading(true);

        const result = await sessionAPI.joinByPin(normalizedPin);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
            return result;
        }

        const targetRoute = PLAY_ROUTE_BY_GAME_TYPE[result.meta.game_type_code];

        if (!targetRoute) {
            const routeError = 'Tipo de juego no reconocido. Contacta con tu docente.';
            setError(routeError);
            setLoading(false);
            return { success: false, error: routeError };
        }

        const deviceId = localStorage.getItem('device_id') || `web-${Math.random().toString(36).slice(2, 10)}`;
        const resolvedPlayerName = resolvePlayerName(result.data.game_mode, playerName);

        localStorage.setItem('device_id', deviceId);
        localStorage.setItem('player_name', resolvedPlayerName);

        navigate(`${targetRoute}?sessionId=${result.data.id}&pin=${encodeURIComponent(normalizedPin)}`, {
            state: {
                session: result.data,
                playerName: resolvedPlayerName,
                deviceId,
            },
        });

        setLoading(false);
        return { success: true, data: result.data };
    };

    return {
        join,
        loading,
        error,
        clearError: () => setError(''),
    };
}