import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gameAPI, gameTypeAPI, sessionAPI } from '@/api/api';
import GameContentForm, { getTemplateForGameType } from '@/components/gameForms/GameContentForm';
import { validateGameContent } from '@/games/shared/gameContentValidation';
import { ROUTE_PATHS, buildDashboardSessionPath, buildGameEditPath } from '@/router/paths';

export function useGameEditor() {
    const navigate = useNavigate();
    const location = useLocation();
    const { type, id } = useParams();
    const isEditing = Boolean(id);
    const isSessionCreationFlow = location.pathname.startsWith(ROUTE_PATHS.sessionsCreate);

    const [gameTypes, setGameTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAdvancedJson, setShowAdvancedJson] = useState(false);
    const [jsonDraft, setJsonDraft] = useState('');
    const [sessionMode, setSessionMode] = useState('individual');
    const [form, setForm] = useState({
        name: '',
        description: '',
        game_type_id: '',
        game_content: getTemplateForGameType(type),
    });

    const selectedGameType = gameTypes.find((item) => String(item.id) === String(form.game_type_id));
    const selectedGameTypeCode = selectedGameType?.code ?? type;
    const selectedGameTypeLabel = selectedGameType?.name ?? 'Sin seleccionar';
    const showTemplateNotice = Boolean(location.state?.templateSaved);

    useEffect(() => {
        let mounted = true;

        async function loadEditor() {
            setIsLoading(true);
            setError('');

            const typesResult = await gameTypeAPI.list();
            if (!typesResult.success) {
                if (mounted) {
                    setError(typesResult.error);
                    setIsLoading(false);
                }
                return;
            }

            if (!mounted) {
                return;
            }

            setGameTypes(typesResult.data);

            if (isEditing) {
                const gameResult = await gameAPI.get(id);
                if (!gameResult.success) {
                    if (mounted) {
                        setError(gameResult.error);
                        setIsLoading(false);
                    }
                    return;
                }

                if (!mounted) {
                    return;
                }

                setForm({
                    name: gameResult.data.name ?? '',
                    description: gameResult.data.description ?? '',
                    game_type_id: String(gameResult.data.game_type_id ?? ''),
                    game_content: gameResult.data.game_content ?? {},
                });
                setIsLoading(false);
                return;
            }

            const selectedType = typesResult.data.find((item) => item.code === type);

            if (!selectedType) {
                setError('Ese tipo de juego no esta disponible todavia en el backend.');
                setIsLoading(false);
                return;
            }

            setForm((current) => ({
                ...current,
                game_type_id: String(selectedType.id),
                game_content: getTemplateForGameType(selectedType.code),
            }));
            setIsLoading(false);
        }

        loadEditor();

        return () => {
            mounted = false;
        };
    }, [id, isEditing, type]);

    useEffect(() => {
        setJsonDraft(JSON.stringify(form.game_content ?? {}, null, 2));
    }, [form.game_content]);

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const updateGameType = (nextGameTypeId) => {
        const selected = gameTypes.find((item) => String(item.id) === nextGameTypeId);
        setForm((current) => ({
            ...current,
            game_type_id: nextGameTypeId,
            game_content: selected ? getTemplateForGameType(selected.code) : current.game_content,
        }));
    };

    const updateGameContent = (gameContent) => {
        setForm((current) => ({ ...current, game_content: gameContent }));
    };

    const updateJson = (nextJson) => {
        setJsonDraft(nextJson);

        try {
            const parsed = JSON.parse(nextJson);
            setForm((current) => ({ ...current, game_content: parsed }));
            setError('');
        } catch {
            setError('El JSON avanzado no es valido todavia.');
        }
    };

    const saveGame = async ({ createSessionFlow = false } = {}) => {
        setError('');
        setSuccess('');

        const validationMessage = validateGameContent(selectedGameTypeCode, form.game_content);
        if (validationMessage) {
            setError(validationMessage);
            return null;
        }

        setIsSaving(true);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            game_type_id: Number(form.game_type_id),
            game_content: form.game_content,
        };

        const result = isEditing
            ? await gameAPI.update(id, payload)
            : await gameAPI.create(payload);

        setIsSaving(false);

        if (!result.success) {
            setError(result.error);
            return null;
        }

        setSuccess(
            isEditing
                ? 'Juego actualizado.'
                : createSessionFlow
                    ? 'Juego guardado y listo para abrir la sesión.'
                    : 'Juego guardado como plantilla.'
        );

        if (!isEditing && !createSessionFlow) {
            navigate(buildGameEditPath(result.data.id), {
                replace: true,
                state: {
                    templateSaved: true,
                },
            });
        }

        return result.data;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await saveGame({ createSessionFlow: false });
    };

    const handleCreateSession = async () => {
        const savedGame = await saveGame({ createSessionFlow: true });
        if (!savedGame) {
            return;
        }

        const sessionResult = await sessionAPI.create({
            game_id: savedGame.id,
            game_content: form.game_content,
            game_mode: sessionMode,
        });

        if (!sessionResult.success) {
            setError(sessionResult.error);
            return;
        }

        navigate(buildDashboardSessionPath(sessionResult.data.id), {
            state: {
                justCreated: true,
                createdSession: sessionResult.data,
            },
        });
    };

    return {
        GameContentForm,
        isEditing,
        isSessionCreationFlow,
        gameTypes,
        isLoading,
        isSaving,
        error,
        success,
        showAdvancedJson,
        jsonDraft,
        sessionMode,
        setSessionMode,
        form,
        selectedGameType,
        selectedGameTypeCode,
        selectedGameTypeLabel,
        showTemplateNotice,
        setShowAdvancedJson,
        updateField,
        updateGameType,
        updateGameContent,
        updateJson,
        handleSubmit,
        handleCreateSession,
        goBack: () => navigate(isEditing ? ROUTE_PATHS.games : ROUTE_PATHS.sessionsCreate),
    };
}