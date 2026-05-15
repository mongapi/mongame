import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Loader, Radio } from 'lucide-react';
import { useJoinView } from '@/hooks/useJoinView';

export default function JoinView() {
  const { pin, playerName, loading, error, handleSubmit, handlePinChange, handlePlayerNameChange } = useJoinView();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[12%] left-[18%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[14%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <Radio className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black font-['Orbitron'] tracking-wide">UNIRSE A SESION</h1>
          <p className="mt-2 text-sm text-zinc-400">Introduce el PIN que te ha dado el profesor para entrar en la partida activa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">PIN de la sesión</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              disabled={loading}
              value={pin}
              onChange={(event) => handlePinChange(event.target.value)}
              placeholder="000000"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center font-['Orbitron'] text-3xl tracking-[0.4em] text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Nombre o mesa</label>
            <input
              type="text"
              maxLength={50}
              disabled={loading}
              value={playerName}
              onChange={(event) => handlePlayerNameChange(event.target.value)}
              placeholder="Ejemplo: Mesa 3"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-2 text-xs text-zinc-500">Si la sesión es por mesa, escribe la mesa. Si es individual, usa el nombre o alias del alumno.</p>
          </div>

          <button
            type="submit"
            disabled={loading || pin.trim().length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-4 font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <ArrowRight className="h-5 w-5" />
                Entrar a la sesión
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}