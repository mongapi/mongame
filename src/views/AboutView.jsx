import { AuroraBackground } from '@/components/organisms/AuroraBackground';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlayCircle, ShieldCheck, Sparkles, Users, Waypoints } from 'lucide-react';
import { CalloutBanner, EntryCard, FeatureGrid, Reveal, SectionIntro, StepListCard } from '@/components/organisms/PublicExperience';

const PLATFORM_PILLARS = [
    {
        icon: ClipboardList,
        title: 'Planifica sin fricción técnica',
        description: 'El profesorado crea juegos y lesson plans con formularios guiados, sin tener que editar estructuras complejas para empezar a usar la plataforma.',
    },
    {
        icon: Waypoints,
        title: 'Una sesión, varias fases',
        description: 'La clase entra una vez por PIN y permanece dentro aunque el docente cambie la fase o el juego activo durante la sesión.',
    },
    {
        icon: ShieldCheck,
        title: 'Resultados que siguen disponibles',
        description: 'La sesión guarda progreso, puntuación, tiempos y estado para que el profesor lo vea en vivo y pueda recuperarlo más tarde.',
    },
];

const SESSION_FLOW = [
    { step: '01', title: 'El profesor prepara el contenido', description: 'Puede lanzar un juego suelto o construir un lesson plan con varias fases.' },
    { step: '02', title: 'Se abre una sesión real', description: 'El backend genera la sesión activa y asigna un PIN único para esa clase.' },
    { step: '03', title: 'El alumnado entra con PIN', description: 'Cada alumno, mesa o puesto se identifica desde el navegador sin instalaciones.' },
    { step: '04', title: 'La sesión se dirige en vivo', description: 'El profesor controla fases, presencia, ranking y exportación desde el dashboard.' },
    { step: '05', title: 'Los resultados no se pierden', description: 'La información queda guardada para seguimiento y análisis posterior.' },
];

export default function AboutView() {
    const navigate = useNavigate();

    return (
        <AuroraBackground className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
            <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_28%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[34px_34px]" />
            </div>

            <section className="relative mx-auto grid min-h-screen max-w-7xl gap-14 px-8 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:pt-16">
                <div className="relative z-10 flex flex-col justify-center">
                    <Reveal>
                        <div className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-100">
                            <Sparkles className="h-4 w-4" />
                            Sobre MonGame
                        </div>
                        <h1 className="max-w-4xl font-['Orbitron'] text-5xl font-black leading-[1.02] text-white md:text-7xl">
                            ¿Qué es MonGame?
                           
                        </h1>
                        <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                            MonGame es una plataforma para preparar sesiones de juego educativas, abrirlas con PIN, hacer que la clase entre y dirigir toda la actividad desde un único panel.
                        </p>
                    </Reveal>

                </div>

                <div className="relative flex items-center">
                    <div className="absolute inset-x-10 inset-y-16 rounded-full bg-cyan-400/12 blur-[120px]" />
                    <StepListCard eyebrow="Flujo real" title="De la preparación al juego" badge="Sesión viva" steps={SESSION_FLOW} />
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-8 py-12 lg:px-16">
                <Reveal className="mb-10">
                    <SectionIntro
                        eyebrow="Lo importante"
                        title="La plataforma está pensada alrededor de la sesión"
                        description="Eso significa que el profesor controla el ritmo, el alumnado se une con un PIN y el estado de la actividad se mantiene mientras la clase avanza por las distintas fases."
                    />
                </Reveal>
                <FeatureGrid items={PLATFORM_PILLARS} />
            </section>

        </AuroraBackground>
    );
}