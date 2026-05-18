import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Clock3, Mail, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { useConfigView } from "@/hooks/useConfigView";
import { SessionModeCards } from "@/components/organisms/SessionModeSelector";
import blurBg from '../public/images/as02.jpg';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, ease: "easeOut", duration: 0.4 },
});

export default function ConfigView() {
    const {
        currentUser,
        isLoading,
        error,
        games,
        lessonPlans,
        activeSessions,
        recentSessions,
        preferredModeMeta,
        defaultSessionMode,
        defaultStartSection,
        joinNamePreference,
        setDefaultSessionMode,
        setDefaultStartSection,
        setJoinNamePreference,
        quickActions,
        lastActivityLabel,
        goToQuickSession,
        goToFavoriteSection,
    } = useConfigView();

    if (isLoading) return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            {/* Background image with subtle animation and gradient overlay */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <img
                    src={blurBg}
                    alt="Background Blur"
                    className="w-full h-full object-cover opacity-25 scale-105"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#09090b_90%)]" />
                <div className="absolute inset-0 bg-zinc-950/20" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl space-y-4">
                <div className="h-48 animate-pulse rounded-[2rem] bg-white/4" />
                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="h-96 animate-pulse rounded-[2rem] bg-white/4" />
                    <div className="space-y-4">
                        <div className="h-44 animate-pulse rounded-[2rem] bg-white/4" />
                        <div className="h-44 animate-pulse rounded-[2rem] bg-white/4" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            {/* Background image with subtle animation and gradient overlay */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <img
                    src={blurBg}
                    alt="Background Blur"
                    className="w-full h-full object-cover opacity-25 scale-105"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#09090b_90%)]" />
                <div className="absolute inset-0 bg-zinc-950/20" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">

                {/* ── Error ── */}
                {error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── Hero ── */}
                <motion.section
                    {...fadeUp(0)}
                    className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-6 lg:p-8"
                >
                    <div className="pointer-events-none absolute -left-12 top-6 h-36 w-36 rounded-full bg-cyan-300/10 blur-[70px]" />
                    <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-amber-300/8 blur-[80px]" />

                    <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        {/* Left */}
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100">
                                <Settings2 className="h-3.5 w-3.5" />
                                Configuración
                            </div>
                            <h1 className="font-['Orbitron'] text-3xl font-black text-white md:text-4xl">
                                {currentUser?.name ? `Hola, ${currentUser.name.split(' ')[0]}` : 'Tu espacio'}
                            </h1>
                            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                <button
                                    type="button"
                                    onClick={goToQuickSession}
                                    className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 sm:w-auto"
                                >
                                    Crear sesión rápida
                                </button>
                                <button
                                    type="button"
                                    onClick={goToFavoriteSection}
                                    className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
                                >
                                    Acceso favorito
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: 'Modo habitual', value: preferredModeMeta.label },
                                { label: 'Juegos', value: games.length },
                                { label: 'Lesson plans', value: lessonPlans.length },
                                { label: 'Activas ahora', value: activeSessions.length },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                                    <p className="mt-1.5 text-xl font-black text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* ── Cuerpo ── */}
                <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

                    {/* ── Preferencias ── */}
                    <motion.div {...fadeUp(0.06)} className="rounded-[2rem] border border-white/10 bg-zinc-950/55 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="font-['Orbitron'] text-xl font-black text-white">Preferencias</h2>
                            <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/8 p-2 text-cyan-200">
                                <UserRound className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Sección de inicio */}
                            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                                    Sección de inicio
                                </p>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {[
                                        { value: 'dashboard', label: 'Dashboard' },
                                        { value: 'library', label: 'Biblioteca' },
                                        { value: 'create', label: 'Crear sesión' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setDefaultStartSection(opt.value)}
                                            className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${defaultStartSection === opt.value
                                                ? 'border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                                                : 'border-white/8 bg-white/4 text-zinc-400 hover:bg-white/8 hover:text-white'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modo de sesión */}
                            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                                    Modo de sesión habitual
                                </p>
                                <SessionModeCards
                                    value={defaultSessionMode}
                                    onChange={setDefaultSessionMode}
                                    compact
                                />
                            </div>

                            {/* Nombre de acceso */}
                            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                                    Nombre al entrar desde navegador
                                </p>
                                <input
                                    type="text"
                                    maxLength={50}
                                    value={joinNamePreference}
                                    onChange={(e) => setJoinNamePreference(e.target.value)}
                                    placeholder="Ej. Mesa 3 · Aula A"
                                    className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Columna derecha ── */}
                    <div className="space-y-5">

                        {/* Accesos rápidos */}
                        <motion.div {...fadeUp(0.1)} className="rounded-[2rem] border border-white/10 bg-zinc-950/55 p-5 backdrop-blur-xl sm:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="font-['Orbitron'] text-lg font-black text-white">Accesos rápidos</h2>
                                <Clock3 className="h-4 w-4 text-zinc-600" />
                            </div>
                            <div className="space-y-2">
                                {quickActions.map((item) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={item.action}
                                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-left transition hover:border-white/14 hover:bg-white/7"
                                    >
                                        <span className="text-sm font-semibold text-white">{item.label}</span>
                                        <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Cuenta */}
                        <motion.div {...fadeUp(0.14)} className="rounded-[2rem] border border-white/10 bg-zinc-950/55 p-5 backdrop-blur-xl sm:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="font-['Orbitron'] text-lg font-black text-white">Cuenta</h2>
                                <Mail className="h-4 w-4 text-zinc-600" />
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Correo', value: currentUser?.email || '—' },
                                    { label: 'Actividad', value: lastActivityLabel },
                                    { label: 'Material', value: `${games.length} juegos · ${lessonPlans.length} lesson plans` },
                                    {
                                        label: 'Sesiones',
                                        value: recentSessions.length > 0
                                            ? `${recentSessions.length} recientes`
                                            : 'Sin historial aún',
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex flex-col gap-2 rounded-xl border border-white/6 bg-white/3 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</span>
                                        <span className="truncate text-left text-sm font-semibold text-white sm:text-right">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </div>
    );
}