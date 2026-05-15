import { DoorOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS, buildDashboardSessionPath } from '@/router/paths';

export function useGameSessionUi({ session, sessionId, isPreview }) {
    const navigate = useNavigate();
    const sessionFinished = Boolean(sessionId && session?.status === 'finished');

    const handleExit = () => {
        if (sessionId && !isPreview) {
            navigate(buildDashboardSessionPath(sessionId));
            return;
        }

        navigate(ROUTE_PATHS.games);
    };

    return {
        sessionFinished,
        handleExit,
        exitLabel: sessionId && !isPreview ? 'Volver al dashboard' : 'Salir',
        finishActionLabel: sessionId && !isPreview ? 'Volver al dashboard' : 'Salir',
    };
}

export function GameExitButton({ onExit, label = 'Salir' }) {
    return (
        <button
            type="button"
            onClick={onExit}
            className="fixed right-4 top-4 z-[70] inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-black/75"
        >
            <DoorOpen className="h-4 w-4" />
            {label}
        </button>
    );
}

export function GameSessionFinishedOverlay({ visible, onExit, actionLabel = 'Salir' }) {
    if (!visible) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-8 text-center text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                    <DoorOpen className="h-10 w-10" />
                </div>
                <h2 className="mt-6 text-4xl font-black text-white">Sesión finalizada</h2>
                <p className="mt-4 text-lg leading-7 text-zinc-300">
                    La sesión del aula ya ha terminado. Puedes salir de esta pantalla y volver al panel del profesor.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onExit}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                    >
                        <DoorOpen className="h-4 w-4" />
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}