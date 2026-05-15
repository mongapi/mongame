import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Loader, Radio } from 'lucide-react';
import { sessionAPI } from '@/api/api';
import { getSessionModeMeta } from '@/components/organisms/SessionModeSelector';

const routeByGameType = {
  memory: '/jugar/memory',
  quiz: '/jugar/quiz',
  timeline: '/jugar/cronologias',
  filling_blanks: '/jugar/completar',
  guess_who: '/jugar/adivina',
  shooting: '/jugar/shooter',
};

export default function JoinView() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState(localStorage.getItem('player_name') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const normalizedPin = pin.trim();
    const result = await sessionAPI.joinByPin(normalizedPin);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    const targetRoute = routeByGameType[result.meta.game_type_code];

    if (!targetRoute) {
      setError('La sesión existe, pero su tipo de juego aún no está conectado en el front.');
      setIsLoading(false);
      return;
    }

    const modeMeta = getSessionModeMeta(result.data.game_mode || 'individual');
    const existingDeviceId = localStorage.getItem('device_id') || `web-${Math.random().toString(36).slice(2, 10)}`;
    const resolvedPlayerName = playerName.trim() || (modeMeta.value === 'table' ? 'Mesa web' : modeMeta.value === 'shared' ? 'Puesto web' : 'Alumno web');
    localStorage.setItem('device_id', existingDeviceId);
    localStorage.setItem('player_name', resolvedPlayerName);

    navigate(`${targetRoute}?sessionId=${result.data.id}&pin=${encodeURIComponent(normalizedPin)}`, {
      state: {
        session: result.data,
        playerName: resolvedPlayerName,
        deviceId: existingDeviceId,
      },
    });
  };

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
              disabled={isLoading}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center font-['Orbitron'] text-3xl tracking-[0.4em] text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Nombre o mesa</label>
            <input
              type="text"
              maxLength={50}
              disabled={isLoading}
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Ejemplo: Mesa 3"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-2 text-xs text-zinc-500">Si la sesión es por mesa, escribe la mesa. Si es individual, usa el nombre o alias del alumno.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || pin.trim().length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-4 font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
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