import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Clock3, Mail, MonitorPlay, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { useConfigView } from "@/hooks/useConfigView";
import { SessionModeCards } from "@/components/organisms/SessionModeSelector";

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

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center px-8 text-center font-['Orbitron'] text-xl text-white">
                CARGANDO TU CONFIGURACIÓN...
            </div>
        );
    }

    return (
        <div className="min-h-screen px-8 py-10 text-white lg:px-10">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 p-8 shadow-[0_25px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:p-10">
                    <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-cyan-300/10 blur-[80px]" />
                    <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-amber-300/10 blur-[90px]" />

                    <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100">
                                <Settings2 className="h-4 w-4" />
                                Tu configuración
                            </div>
                            <h1 className="font-['Orbitron'] text-4xl font-black text-white md:text-5xl">
                                Ajusta tu espacio para trabajar como te resulte más cómodo.
                            </h1>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                                {currentUser?.name ? `${currentUser.name}, ` : ""}esta vista está pensada para ti: tu cuenta, tus preferencias y los accesos que más sentido tienen en tu día a día.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={goToQuickSession}
                                    className="rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-zinc-950 transition hover:bg-cyan-200"
                                >
                                    Crear sesión rápida
                                </button>
                                <button
                                    type="button"
                                    onClick={goToFavoriteSection}
                                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                                >
                                    Ir a mi acceso favorito
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Cuenta</p>
                                <p className="mt-3 text-xl font-black text-white">{currentUser?.name || 'Docente'}</p>
                                <p className="mt-2 text-sm text-zinc-400">Tu espacio personal dentro de la plataforma.</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Modo habitual</p>
                                <p className="mt-3 text-xl font-black text-white">{preferredModeMeta.label}</p>
                                <p className="mt-2 text-sm text-zinc-400">La referencia que prefieres al abrir sesiones.</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Tu biblioteca</p>
                                <p className="mt-3 text-4xl font-black text-white">{games.length}</p>
                                <p className="mt-2 text-sm text-zinc-400">Juegos preparados para reutilizar.</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Sesiones activas</p>
                                <p className="mt-3 text-4xl font-black text-white">{activeSessions.length}</p>
                                <p className="mt-2 text-sm text-zinc-400">Lo que tienes en marcha ahora mismo.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {error ? (
                    <div className="flex items-center gap-3 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                ) : null}

                <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-zinc-950/55 p-7 backdrop-blur-xl">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Preferencias personales</p>
                                <h2 className="mt-3 font-['Orbitron'] text-3xl font-black text-white">Haz que MonGame se adapte a tu forma de trabajar</h2>
                            </div>
                            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                                <UserRound className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Sección de inicio favorita</p>
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    {[
                                        { value: 'dashboard', label: 'Dashboard' },
                                        { value: 'library', label: 'Biblioteca' },
                                        { value: 'create', label: 'Crear sesión' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setDefaultStartSection(option.value)}
                                            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${defaultStartSection === option.value ? 'border-cyan-300/30 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Modo de sesión que sueles usar</p>
                                <div className="mt-4">
                                    <SessionModeCards value={defaultSessionMode} onChange={setDefaultSessionMode} compact />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Nombre sugerido para entrar desde navegador</p>
                                <input
                                    type="text"
                                    maxLength={50}
                                    value={joinNamePreference}
                                    onChange={(event) => setJoinNamePreference(event.target.value)}
                                    placeholder="Ejemplo: Mesa 3 o Aula A"
                                    className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                                />
                                <p className="mt-2 text-sm leading-6 text-zinc-400">
                                    Si alguna vez entras tú mismo desde otro navegador, tendrás un nombre base ya guardado.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-amber-200" />
                                <div>
                                    <p className="font-semibold text-white">Aquí no estás configurando el sistema entero.</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                                        Estás ajustando tu experiencia personal para que cada vez que vuelvas a la plataforma te resulte más natural empezar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/55 p-7 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Accesos rápidos</p>
                                    <h2 className="mt-2 font-['Orbitron'] text-2xl font-black text-white">Entra a lo que más usas</h2>
                                </div>
                                <Clock3 className="h-5 w-5 text-zinc-500" />
                            </div>

                            <div className="space-y-3">
                                {quickActions.map((item) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={item.action}
                                        className="w-full rounded-3xl border border-white/10 bg-white/3 p-4 text-left transition hover:bg-white/6"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-white">{item.label}</p>
                                                <p className="mt-1 text-sm text-zinc-400">{item.helper}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-cyan-200" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/55 p-7 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Resumen personal</p>
                                    <h2 className="mt-2 font-['Orbitron'] text-2xl font-black text-white">Tu cuenta y tu contexto</h2>
                                </div>
                                <Mail className="h-5 w-5 text-zinc-500" />
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-3xl border border-white/10 bg-white/3 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Correo de acceso</p>
                                    <p className="mt-2 font-semibold text-white">{currentUser?.email || 'Sin correo disponible'}</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                                        Este es el correo con el que estás utilizando ahora mismo la plataforma.
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-white/3 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Actividad reciente</p>
                                    <p className="mt-2 font-semibold text-white">{recentSessions.length > 0 ? `${recentSessions.length} sesiones recientes` : 'Todavía sin historial'}</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                                        {lastActivityLabel}
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-white/3 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Material guardado</p>
                                    <p className="mt-2 font-semibold text-white">{games.length} juegos y {lessonPlans.length} lesson plans</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                                        Tu configuración personal también debería ayudarte a recordar lo que ya tienes preparado para clase.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
