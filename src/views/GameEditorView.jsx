import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Code2, Eye, Loader, Save } from 'lucide-react';
import { SessionModeCards } from '@/components/organisms/SessionModeSelector';
import { validateGameContent } from '@/games/shared/gameContentValidation';
import { useGameEditor } from '@/hooks/useGameEditor';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function GameEditorView() {
    const {
        GameContentForm,
        isEditing,
        isSessionCreationFlow,
        gameTypes,
        isLoading,
        isSaving,
        isLaunching,
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
        handlePreview,
        goBack,
    } = useGameEditor();

    if (isLoading) {
        return <LoadingScreen title="Cargando Editor..." />;
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
                        onClick={goBack}
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
                                onChange={(event) => updateField('name', event.target.value)}
                                className="mb-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                placeholder="Ejemplo: Quiz redes y protocolos"
                            />

                            <label className="mb-2 block text-sm font-medium text-zinc-300">Tipo de juego</label>
                            {isSessionCreationFlow ? (
                                <div className="mb-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
                                    <p className="font-semibold text-cyan-100">{selectedGameTypeLabel}</p>
                                </div>
                            ) : (
                                <select
                                    required
                                    value={form.game_type_id}
                                    onChange={(event) => updateGameType(event.target.value)}
                                    className="mb-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                >
                                    <option value="" className="bg-white text-zinc-950">Selecciona un tipo</option>
                                    {gameTypes.map((gameType) => (
                                        <option key={gameType.id} value={gameType.id} className="bg-white text-zinc-950">
                                            {gameType.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="mb-5 text-xs text-zinc-500">
                                {selectedGameType?.description
                                    ? `${selectedGameTypeLabel}: ${selectedGameType.description}`
                                    : 'Aqui deberian aparecer los tipos activos que devuelve el backend, por ejemplo Quiz, Memory o Timeline.'}
                            </p>

                            <label className="mb-2 block text-sm font-medium text-zinc-300">Descripcion</label>
                            <textarea
                                rows={6}
                                value={form.description}
                                onChange={(event) => updateField('description', event.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                placeholder="Describe la actividad, objetivos o reglas del juego."
                            />

                            {isSessionCreationFlow ? (
                                <div className="mt-6 space-y-3">
                                    <div>
                                        <h2 className="text-sm font-medium text-zinc-300">Modo de sesión</h2>
                                        <p className="mt-1 text-xs text-zinc-500">Elige si esta sesión será compartida, por mesa o individual.</p>
                                    </div>
                                    <SessionModeCards value={sessionMode} onChange={setSessionMode} />
                                </div>
                            ) : null}
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
                                onChange={updateGameContent}
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
                                        onChange={(event) => updateJson(event.target.value)}
                                        className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 font-mono text-sm text-cyan-100 outline-none transition focus:border-cyan-400"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handlePreview}
                            className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/15 px-5 py-3 font-bold text-sky-200 transition hover:bg-sky-400/25"
                        >
                            <Eye className="h-5 w-5" />
                            Ver preview
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateSession}
                            disabled={isSaving || isLaunching}
                            className="rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLaunching ? 'Creando sesión...' : isEditing ? 'Crear sesión con este juego' : 'Guardar y crear sesión'}
                        </button>
                        {isEditing ? (
                            <button
                                type="submit"
                                disabled={isSaving || isLaunching}
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