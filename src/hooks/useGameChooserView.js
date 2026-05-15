import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gameTypeAPI } from '@/api/api';
import { getGameTypeVisualMeta } from '@/components/gameTypes/GameTypeVisual';
import { ROUTE_PATHS, buildGameCreateTypePath, buildSessionCreateTypePath } from '@/router/paths';

function normalizeGameType(gameType) {
    const meta = getGameTypeVisualMeta(gameType.code);

    return {
        id: gameType.id,
        code: gameType.code,
        name: gameType.name,
        description: gameType.description || 'Configura esta mecánica y ajústala a tu clase.',
        icon: meta.icon,
        color: meta.color,
        previewType: meta.previewType,
        isAvailable: gameType.is_active !== false,
    };
}

export function useGameChooserView() {
    const navigate = useNavigate();
    const location = useLocation();
    const isSessionCreationFlow = location.pathname.startsWith(ROUTE_PATHS.sessionsCreate);

    const [gameTypes, setGameTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        async function loadGameTypes() {
            setIsLoading(true);
            setError('');

            const result = await gameTypeAPI.list();
            if (!mounted) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            const nextGameTypes = (result.data ?? [])
                .map(normalizeGameType)
                .sort((left, right) => left.name.localeCompare(right.name, 'es'));

            setGameTypes(nextGameTypes);
            setIsLoading(false);
        }

        loadGameTypes();

        return () => {
            mounted = false;
        };
    }, []);

    const availableGameTypes = useMemo(
        () => gameTypes.filter((gameType) => gameType.isAvailable),
        [gameTypes],
    );

    const emptyMessage = isSessionCreationFlow
        ? 'Ahora mismo no hay tipos de juego activos para crear sesiones rápidas.'
        : 'Ahora mismo no hay tipos de juego activos para crear plantillas.';

    const openGameType = (typeCode) => {
        const targetPath = isSessionCreationFlow
            ? buildSessionCreateTypePath(typeCode)
            : buildGameCreateTypePath(typeCode);

        navigate(targetPath);
    };

    return {
        isSessionCreationFlow,
        gameTypes: availableGameTypes,
        isLoading,
        error,
        emptyMessage,
        openGameType,
        goToLessonPlanCreate: () => navigate(ROUTE_PATHS.lessonPlansCreate),
    };
}