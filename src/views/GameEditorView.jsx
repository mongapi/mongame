import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Code2, Loader, Save } from 'lucide-react';
import { gameAPI, gameTypeAPI, sessionAPI } from '@/api/api';
import GameContentForm, { getTemplateForGameType } from '@/components/gameForms/GameContentForm';
import { validateGameContent } from '@/games/shared/gameContentValidation';

export default function GameEditorView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { type, id } = useParams();
    const isEditing = Boolean(id);
    const isSessionCreationFlow = location.pathname.startsWith('/sessions/create');

    const [gameTypes, setGameTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAdvancedJson, setShowAdvancedJson] = useState(false);
    const [jsonDraft, setJsonDraft] = useState('');
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

            if (!mounted) return;

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

                if (!mounted) return;

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        await saveGame({ createSessionFlow: false });
    };

    const buildPayload = () => {
        return {
            payload: {
                name: form.name.trim(),
                description: form.description.trim(),
                game_type_id: Number(form.game_type_id),
                game_content: form.game_content,
            },
            parsedContent: form.game_content,
        };
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
        const { payload } = buildPayload();

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
            navigate(`/games/${result.data.id}/edit`, {
                replace: true,
                state: {
                    templateSaved: true,
                },
            });
        }

        return result.data;
    };

    const handleCreateSession = async () => {
        const savedGame = await saveGame({ createSessionFlow: true });
        if (!savedGame) {
            return;
        }

        const sessionResult = await sessionAPI.create({
            game_id: savedGame.id,
            game_content: form.game_content,
        });

        if (!sessionResult.success) {
            setError(sessionResult.error);
            return;
        }

        navigate(`/dashboard/${sessionResult.data.id}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white font-['Orbitron']">
                CARGANDO EDITOR...
            </div>
        );
    }

    return (
        <div className="min-h-screen px-8 py-10 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black font-['Orbitron']">{isEditing ? 'EDITAR JUEGO' : 'CREAR JUEGO'}</h1>
                        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                            Este editor convierte cada plantilla en un formulario guiado para docentes. El JSON queda como modo avanzado, no como flujo principal.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(isEditing ? '/games' : '/sessions/create')}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                    >
                        {isEditing ? 'Volver a biblioteca' : 'Volver a crear sesión'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {showTemplateNotice ? (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100"
                        >
                            Este juego ya está guardado y reutilizable. Para usarlo en clase necesitas abrir una sesión con este juego.
                        </motion.div>
                    ) : null}

                    {!isEditing && isSessionCreationFlow ? (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"
                        >
                            Estás en el flujo de creación de sesión. Aquí defines el contenido y al final abrirás una sesión activa para el aula.
                        </motion.div>
                    ) : null}

                    {(error || success) && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-3 rounded-2xl border p-4 ${error ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}
                        >
                            {error ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                            <span className="text-sm">{error || success}</span>
                        </motion.div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <label className="mb-2 block text-sm font-medium text-zinc-300">Nombre</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                className="mb-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                placeholder="Ejemplo: Quiz redes y protocolos"
                            />

                            <label className="mb-2 block text-sm font-medium text-zinc-300">Tipo de juego</label>
                            <select
                                required
                                value={form.game_type_id}
                                onChange={(event) => {
                                    const selected = gameTypes.find((item) => String(item.id) === event.target.value);
                                    setForm((current) => ({
                                        ...current,
                                        game_type_id: event.target.value,
                                        game_content: selected ? getTemplateForGameType(selected.code) : current.game_content,
                                    }));
                                }}
                                className="mb-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                            >
                                <option value="" className="bg-white text-zinc-950">Selecciona un tipo</option>
                                {gameTypes.map((gameType) => (
                                    <option key={gameType.id} value={gameType.id} className="bg-white text-zinc-950">
                                        {gameType.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mb-5 text-xs text-zinc-500">
                                {selectedGameType?.description
                                    ? `${selectedGameTypeLabel}: ${selectedGameType.description}`
                                    : 'Aqui deberian aparecer los tipos activos que devuelve el backend, por ejemplo Quiz, Memory o Timeline.'}
                            </p>

                            <label className="mb-2 block text-sm font-medium text-zinc-300">Descripcion</label>
                            <textarea
                                rows={6}
                                value={form.description}
                                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                placeholder="Describe la actividad, objetivos o reglas del juego."
                            />
                        </div>

                        <div className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-medium text-zinc-300">Contenido del juego</h2>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {selectedGameTypeCode ? `Formulario para ${selectedGameTypeLabel} (${selectedGameTypeCode})` : 'Selecciona un tipo para empezar.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedJson((current) => !current)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/10"
                                >
                                    <Code2 className="h-4 w-4" />
                                    {showAdvancedJson ? 'Ocultar JSON' : 'Modo JSON'}
                                </button>
                            </div>

                            <GameContentForm
                                typeCode={selectedGameTypeCode}
                                value={form.game_content}
                                onChange={(gameContent) => setForm((current) => ({ ...current, game_content: gameContent }))}
                            />

                            {showAdvancedJson ? (
                                <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">game_content JSON</span>
                                        <span className="text-xs text-zinc-500">Solo para ajustes avanzados</span>
                                    </div>
                                    <textarea
                                        rows={18}
                                        value={jsonDraft}
                                        onChange={(event) => {
                                            const nextJson = event.target.value;
                                            setJsonDraft(nextJson);

                                            try {
                                                const parsed = JSON.parse(nextJson);
                                                setForm((current) => ({ ...current, game_content: parsed }));
                                                setError('');
                                            } catch {
                                                setError('El JSON avanzado no es valido todavia.');
                                            }
                                        }}
                                        className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 font-mono text-sm text-cyan-100 outline-none transition focus:border-cyan-400"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCreateSession}
                            disabled={isSaving}
                            className="rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isEditing ? 'Crear sesión con este juego' : 'Guardar y crear sesión'}
                        </button>
                        {isEditing ? (
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Guardar cambios
                            </button>
                        ) : null}
                    </div>
                </form>
            </div>
        </div>
    );
}