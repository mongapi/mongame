import { motion } from 'motion/react';
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Loader, PlusCircle, Save, Trash2 } from 'lucide-react';
import { SessionModeCards } from '@/components/organisms/SessionModeSelector';
import { useLessonPlanEditor } from '@/hooks/useLessonPlanEditor';
import LoadingScreen from '@/components/ui/LoadingScreen';

function SelectedGameCard({ game, index, total, onMoveUp, onMoveDown, onRemove }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Fase {index + 1}</p>
                    <h3 className="mt-2 text-lg font-bold text-white">{game.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{game.description || 'Sin descripción.'}</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={onMoveUp} disabled={index === 0} className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition hover:bg-white/10 disabled:opacity-40">
                        <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={onMoveDown} disabled={index === total - 1} className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition hover:bg-white/10 disabled:opacity-40">
                        <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={onRemove} className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 transition hover:bg-red-500/20">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LessonPlanEditorView() {
    const {
        isEditing,
        form,
        isLoading,
        isSaving,
        isLaunching,
        error,
        success,
        sessionMode,
        setSessionMode,
        selectedGames,
        availableGames,
        updateField,
        addGame,
        removeGame,
        moveGame,
        handleSubmit,
        handleLaunchSession,
        goBack,
    } = useLessonPlanEditor();

    if (isLoading) {
        return <LoadingScreen title="Cargando Lesson Plan..." />;
    }

    return (
        <div className="min-h-screen px-8 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black font-['Orbitron']">{isEditing ? 'EDITAR LESSON PLAN' : 'CREAR LESSON PLAN'}</h1>
                        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                            Construye una secuencia de fases arrastrando juegos ya creados en el orden en que quieres lanzarlos dentro de la sesión.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={goBack}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                    >
                        Volver a biblioteca
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {(error || success) ? (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-3 rounded-2xl border p-4 ${error ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}
                        >
                            {error ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                            <span className="text-sm">{error || success}</span>
                        </motion.div>
                    ) : null}

                    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <label className="mb-2 block text-sm font-medium text-zinc-300">Nombre</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(event) => updateField('name', event.target.value)}
                                className="mb-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                placeholder="Ejemplo: Unidad 2 · Redes y protocolos"
                            />

                            <label className="mb-2 block text-sm font-medium text-zinc-300">Descripción</label>
                            <textarea
                                rows={5}
                                value={form.description}
                                onChange={(event) => updateField('description', event.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                placeholder="Describe la secuencia didáctica o el objetivo del lesson plan."
                            />

                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                                Este lesson plan tendrá {form.game_ids.length} fase{form.game_ids.length === 1 ? '' : 's'}.
                            </div>

                            <div className="mt-6 space-y-3">
                                <div>
                                    <h2 className="text-sm font-medium text-zinc-300">Modo de sesión</h2>
                                    <p className="mt-1 text-xs text-zinc-500">Define si los participantes entrarán como grupo, por mesa o individualmente.</p>
                                </div>
                                <SessionModeCards value={sessionMode} onChange={setSessionMode} />
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Biblioteca de juegos</h2>
                                        <p className="mt-1 text-xs text-zinc-500">Selecciona juegos de tu biblioteca y del catálogo compartido para montar las fases.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {availableGames.length > 0 ? availableGames.map((game) => (
                                        <div key={game.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-white">{game.name}</h3>
                                                    <p className="mt-1 text-sm text-zinc-400">{game.description || 'Sin descripción.'}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addGame(game.id)}
                                                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200 transition hover:bg-cyan-400/20"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-zinc-500">
                                            No quedan más juegos de biblioteca para añadir.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                                <div className="mb-4">
                                    <h2 className="text-lg font-bold text-white">Secuencia del lesson plan</h2>
                                    <p className="mt-1 text-xs text-zinc-500">Ordena las fases tal como quieres que avance la sesión.</p>
                                </div>

                                <div className="space-y-3">
                                    {selectedGames.length > 0 ? selectedGames.map((game, index) => (
                                        <SelectedGameCard
                                            key={`${game.id}-${index}`}
                                            game={game}
                                            index={index}
                                            total={selectedGames.length}
                                            onMoveUp={() => moveGame(index, index - 1)}
                                            onMoveDown={() => moveGame(index, index + 1)}
                                            onRemove={() => removeGame(game.id)}
                                        />
                                    )) : (
                                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-zinc-500">
                                            Añade juegos desde la columna izquierda para construir el lesson plan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleLaunchSession}
                            disabled={isSaving || isLaunching}
                            className="rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLaunching ? 'Creando sesión...' : 'Guardar y crear sesión'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isLaunching}
                            className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {isEditing ? 'Guardar cambios' : 'Guardar lesson plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}