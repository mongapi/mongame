import { AnimatePresence, motion } from 'motion/react';
import { MonitorPlay, Rows3, UserRound, X } from 'lucide-react';

export const SESSION_MODE_OPTIONS = [
    {
        value: 'shared',
        label: 'Partida compartida',
        shortLabel: 'Compartida',
        icon: MonitorPlay,
        description: 'Toda la clase sigue la misma partida y el mismo ritmo. Útil para pantalla común o dinámica grupal sincronizada.',
        identityLabel: 'Dispositivo o puesto',
    },
    {
        value: 'table',
        label: 'Una por mesa',
        shortLabel: 'Por mesa',
        icon: Rows3,
        description: 'Cada mesa actúa como un equipo. El identificador principal debe ser la mesa, no cada alumno por separado.',
        identityLabel: 'Mesa',
    },
    {
        value: 'individual',
        label: 'Una por persona',
        shortLabel: 'Individual',
        icon: UserRound,
        description: 'Cada alumno entra con su propio navegador y queda registrado como participante individual.',
        identityLabel: 'Alumno',
    },
];

export function getSessionModeMeta(mode) {
    return SESSION_MODE_OPTIONS.find((option) => option.value === mode) ?? SESSION_MODE_OPTIONS[2];
}

export function SessionModeCards({ value, onChange, compact = false }) {
    return (
        <div className={`grid gap-4 ${compact ? 'md:grid-cols-3' : ''}`}>
            {SESSION_MODE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`rounded-3xl border p-5 text-left transition flex flex-col justify-start w-full ${isActive
                                ? 'border-cyan-400/30 bg-cyan-400/10 text-white shadow-[0_0_30px_rgba(34,211,238,0.12)]'
                                : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                    >
                        <div className="mb-4 flex items-center justify-between gap-3 w-full">
                            <div className={`rounded-2xl border p-3 ${isActive ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-black/20 text-zinc-400'}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${isActive ? 'bg-cyan-400/15 text-cyan-200' : 'bg-black/20 text-zinc-500'}`}>
                                {option.shortLabel}
                            </span>
                        </div>
                        <p className="font-bold text-white">{option.label}</p>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">{option.description}</p>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Identificador principal: {option.identityLabel}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}

export function SessionModeDialog({ isOpen, value, onChange, onClose, onConfirm, isConfirming = false, title = 'Elegir modo de sesión' }) {
    return (
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        className="w-full max-w-5xl rounded-3xl border border-white/10 bg-zinc-950/95 p-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Modo de sesión</p>
                                <h2 className="mt-2 font-['Orbitron'] text-3xl font-black">{title}</h2>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                                    Define cómo se va a identificar cada participante antes de abrir la sesión.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isConfirming}
                                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <SessionModeCards value={value} onChange={onChange} compact />

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isConfirming}
                                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isConfirming}
                                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isConfirming ? 'Creando...' : 'Crear sesión'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
