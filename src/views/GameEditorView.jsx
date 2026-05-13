import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader, Save } from 'lucide-react';
import { gameAPI, gameTypeAPI, sessionAPI } from '@/api/api';

const templatesByCode = {
    quiz: {
        questions: [
            {
                id: 'q1',
                text: 'Pregunta de ejemplo',
                timeLimit: 15,
                options: [
                    { id: 'a', text: 'Opcion A' },
                    { id: 'b', text: 'Opcion B' },
                    { id: 'c', text: 'Opcion C' },
                    { id: 'd', text: 'Opcion D' }
                ],
                correctAnswer: 'a'
            }
        ]
    },
    memory: {
        pairs: [
            { id: 1, pairId: 'A', text: 'Concepto' },
            { id: 2, pairId: 'A', text: 'Definicion' }
        ]
    },
    timeline: {
        items: [
            { id: 't1', text: 'Evento 1', date: '1900', question: 'Pregunta', options: ['A', 'B', 'C'], correct: 0 }
        ]
    },
    filling_blanks: {
        prompt: 'Completa la frase',
        answer: 'respuesta',
        hint: 'Pista corta'
    },
    guess_who: {
        answer: 'Elemento secreto',
        clues: ['Pista 1', 'Pista 2']
    },
    shooting: {
        questions: [
            {
                id: 's1',
                text: 'Pregunta de ejemplo',
                options: ['A', 'B', 'C'],
                correct: 0
            }
        ]
    },
    hangman: {
        word: 'codigo',
        clue: 'Pista del ahorcado'
    }
};

function formatContent(content) {
    return JSON.stringify(content, null, 2);
}

export default function GameEditorView() {
    const navigate = useNavigate();
    const { type, id } = useParams();
    const isEditing = Boolean(id);

    const [gameTypes, setGameTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        name: '',
        description: '',
        game_type_id: '',
        game_content: formatContent(templatesByCode[type] ?? { items: [] }),
    });

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
                    game_content: formatContent(gameResult.data.game_content ?? {}),
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
                game_content: formatContent(templatesByCode[selectedType.code] ?? { items: [] }),
            }));
            setIsLoading(false);
        }

        loadEditor();

        return () => {
            mounted = false;
        };
    }, [id, isEditing, type]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await saveGame();
    };

    const buildPayload = () => {
        const parsedContent = JSON.parse(form.game_content);

        return {
            payload: {
                name: form.name.trim(),
                description: form.description.trim(),
                game_type_id: Number(form.game_type_id),
                game_content: parsedContent,
            },
            parsedContent,
        };
    };

    const saveGame = async () => {
        setError('');
        setSuccess('');

        try {
            buildPayload();
        } catch {
            setError('El contenido del juego debe ser un JSON valido.');
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

        setSuccess(isEditing ? 'Juego actualizado.' : 'Juego creado.');

        if (!isEditing) {
            navigate(`/games/${result.data.id}/edit`, { replace: true });
        }

        return result.data;
    };

    const handleCreateSession = async () => {
        const savedGame = await saveGame();
        if (!savedGame) {
            return;
        }

        const parsedContent = JSON.parse(form.game_content);
        const sessionResult = await sessionAPI.create({
            game_id: savedGame.id,
            game_content: parsedContent,
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
                            Este editor ya guarda nombre, tipo, descripcion y contenido estructurado del juego en backend.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/games/create')}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                    >
                        Volver a plantillas
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                        game_content: selected ? formatContent(templatesByCode[selected.code] ?? { items: [] }) : current.game_content,
                                    }));
                                }}
                                className="mb-5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                            >
                                <option value="">Selecciona un tipo</option>
                                {gameTypes.map((gameType) => (
                                    <option key={gameType.id} value={gameType.id}>{gameType.name}</option>
                                ))}
                            </select>

                            <label className="mb-2 block text-sm font-medium text-zinc-300">Descripcion</label>
                            <textarea
                                rows={6}
                                value={form.description}
                                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                placeholder="Describe la actividad, objetivos o reglas del juego."
                            />
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-2 flex items-center justify-between gap-4">
                                <label className="block text-sm font-medium text-zinc-300">Contenido del juego (JSON)</label>
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">game_content</span>
                            </div>
                            <textarea
                                rows={22}
                                value={form.game_content}
                                onChange={(event) => setForm((current) => ({ ...current, game_content: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 font-mono text-sm text-cyan-100 outline-none transition focus:border-cyan-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCreateSession}
                            disabled={isSaving}
                            className="rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Guardar y abrir sesión
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {isEditing ? 'Guardar cambios' : 'Crear juego'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}