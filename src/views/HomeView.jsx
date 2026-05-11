import { AuroraBackground } from "@/components/organisms/AuroraBackground";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, BarChart2, Layers, Play, Image as ImageIcon } from "lucide-react";

function FadeUp({ children, delay = 0, className = "", direction = "up" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });
    const yOffset = direction === "up" ? 36 : direction === "down" ? -36 : 0;
    const xOffset = direction === "left" ? 36 : direction === "right" ? -36 : 0;
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: yOffset, x: xOffset }}
            animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
            transition={{ duration: 0.8, delay, type: "spring", bounce: 0.3 }} className={className}>
            {children}
        </motion.div>
    );
}

const FEATURES = [
    { icon: Zap, title: "Sin fricción", desc: "Alumnos juegan al instante. Sin logins, sin apps, sin esperas." },
    { icon: Layers, title: "Plantillas propias", desc: "Edita cada juego con tu contenido curricular en minutos." },
    { icon: BarChart2, title: "Resultados en vivo", desc: "Ve qué mesa avanza y dónde se estanca, en tiempo real." },
    { icon: Play, title: "6 juegos 3D", desc: "Mecánicas variadas sobre mesas inmersivas para máxima motivación." },
];

const STEPS = [
    { n: "01", label: "Elige juego", desc: "Mecánica a medida" },
    { n: "02", label: "Edita base", desc: "Sube tu contenido" },
    { n: "03", label: "Lanza sesión", desc: "Emisión en directo" },
    { n: "04", label: "Analiza", desc: "Métricas en vivo" },
];

function HeroSection() {
    const navigate = useNavigate();
    return (
        <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 max-w-7xl mx-auto pt-20 pb-12">
            <div className="flex-1 w-full lg:pr-12 z-10 flex flex-col justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="flex items-center gap-3 text-break font-medium text-xs tracking-wider border border-break/30 w-fit px-4 py-2 rounded-full glass-card mb-8 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-terra animate-pulse" />
                    SISTEMA ACTIVO // V.0.0.1
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6 text-paper">
                    Transforma<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-break to-sky-400 text-glow">
                        la educación.
                    </span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10 font-light">
                    Diseña juegos educativos 3D con tu contenido y emítelos a mesas inmersivas. Dinamismo y energía en estado puro.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap gap-4 mb-16">
                    <button onClick={() => navigate('/register')} className="btn-primary flex items-center gap-2 group cursor-pointer">
                        Empezar gratis
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <ArrowRight size={18} />
                        </motion.span>
                    </button>
                    <button onClick={() => navigate('/login')} className="btn-secondary flex items-center gap-2 cursor-pointer">
                        Iniciar sesión
                    </button>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                    className="flex flex-wrap gap-10">
                    {[["1.2k+", "Profesores"], ["18k+", "Sesiones"], ["92k+", "Alumnos"]].map(([v, l], i) => (
                        <div key={l} className="relative">
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-paper to-muted-foreground">{v}</div>
                            <div className="text-xs text-break uppercase tracking-widest font-medium mt-1">{l}</div>
                            {i < 2 && <div className="absolute right-[-1.25rem] top-2 bottom-2 w-px bg-white/10 hidden sm:block" />}
                        </div>
                    ))}
                </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.3, type: "spring" }}
                className="flex-1 w-full mt-16 lg:mt-0 lg:ml-8 relative group">
                <div className="absolute inset-0 bg-break/20 blur-[100px] rounded-full translate-y-10 scale-90" />
                <div className="glass-card aspect-square max-w-[500px] w-full mx-auto rounded-3xl flex flex-col items-center justify-center relative overflow-hidden border-break/20">
                    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="text-break/50 flex flex-col items-center">
                        <ImageIcon size={64} className="mb-4" />
                        <span className="font-medium text-sm tracking-widest uppercase">Asset Placeholder</span>
                        <span className="text-xs opacity-70 mt-2">Coloca aquí tu render 3D o UI Mockup</span>
                    </motion.div>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-break/30 blur-[40px] rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-terra/20 blur-[40px] rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}

function FeaturesAndStepsSection() {
    return (
        <section className="py-24 px-8 md:px-16 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16">
                <div className="flex-1">
                    <FadeUp className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-px w-8 bg-break" />
                            <p className="text-break text-xs font-semibold tracking-[0.2em] uppercase">Rendimiento</p>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Ingeniería educativa</h2>
                        <p className="text-muted-foreground text-sm max-w-md">Plataforma robusta diseñada para que la tecnología desaparezca y el aprendizaje tome el control del aula.</p>
                    </FadeUp>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <FadeUp key={f.title} delay={i * 0.1}>
                                    <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 h-full border-t border-t-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-deep-blue/40 border border-break/20 flex items-center justify-center mb-5">
                                            <Icon size={20} className="text-break" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                                    </motion.div>
                                </FadeUp>
                            );
                        })}
                    </div>
                </div>
                <div className="flex-1 flex flex-col">
                    <FadeUp className="mb-8" delay={0.2}>
                        <div className="glass-card p-1">
                            {STEPS.map((s) => (
                                <motion.div key={s.n} whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                                    className="flex items-center gap-6 px-6 py-5 cursor-default border-b border-white/5 last:border-0">
                                    <span className="text-3xl font-bold text-white/5 w-12 shrink-0">{s.n}</span>
                                    <div>
                                        <div className="font-semibold text-paper mb-0.5">{s.label}</div>
                                        <div className="text-muted-foreground text-sm">{s.desc}</div>
                                    </div>
                                    <div className="ml-auto w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                                        <ArrowRight size={14} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </FadeUp>
                    <FadeUp delay={0.4} className="flex-1 min-h-[300px]">
                        <div className="glass-card w-full h-full rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-surface via-deep-blue/20 to-break/10" />
                            <motion.div whileHover={{ scale: 1.05 }} className="relative z-10 flex flex-col items-center text-paper/40">
                                <BarChart2 size={48} className="mb-3 opacity-50" />
                                <span className="text-sm font-medium tracking-wide uppercase">Dashboard Asset</span>
                            </motion.div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(transparent_0%,rgba(59,130,246,0.05)_100%)] pointer-events-none flex items-end px-8 pb-8 gap-4">
                                <div className="w-full h-24 border-t border-white/5 relative">
                                    <div className="absolute bottom-0 left-[10%] w-8 h-[40%] bg-break/20 rounded-t-sm" />
                                    <div className="absolute bottom-0 left-[30%] w-8 h-[70%] bg-break/40 rounded-t-sm" />
                                    <div className="absolute bottom-0 left-[50%] w-8 h-[30%] bg-terra/30 rounded-t-sm" />
                                    <div className="absolute bottom-0 left-[70%] w-8 h-[90%] bg-break/60 rounded-t-sm relative">
                                        <div className="absolute -top-3 -right-2 w-4 h-4 rounded-full bg-terra shadow-[0_0_10px_#f59e0b]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    const navigate = useNavigate();
    return (
        <section className="py-24 px-8 pb-32">
            <FadeUp>
                <div className="relative max-w-4xl mx-auto rounded-3xl glass-panel p-12 md:p-20 text-center overflow-hidden border-t border-t-break/30 border-b border-b-terra/20">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-break/20 blur-[80px] rounded-full" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-terra/10 blur-[80px] rounded-full" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-terra text-sm font-semibold tracking-[0.2em] uppercase mb-6 drop-shadow-md">Únete a la vanguardia</p>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Eleva el nivel de<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-paper to-muted-foreground">tu clase hoy.</span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg mx-auto">
                            Tus alumnos están listos para una experiencia inmersiva. Crea tu primera sesión en menos de 5 minutos.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={() => navigate('/register')} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center text-lg px-8 py-4 cursor-pointer">
                                Alta gratuita
                            </button>
                            <button onClick={() => navigate('/login')} className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center text-lg px-8 py-4 border-white/20 cursor-pointer">
                                Iniciar sesión
                            </button>
                        </div>
                    </div>
                </div>
            </FadeUp>
        </section>
    );
}

export default function HomePage() {
    return (
        <AuroraBackground className="pl-0 lg:pl-20 min-h-screen bg-void text-paper overflow-x-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+Cgo8ZyBvcGFjaXR5PSIwLjAzIj4KPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAwaDF2NDBIMHptMzkgMGgxdjQwSDM5ek0wIDBoNDB2MUgwek0wIDM5aDQwdjFIMHpNMjAgMjBWMGgxdjIwaDIwdjFIMjF2MjBoLTFWMjFIMFYyMHoiIGZpbGw9IiNmZmYiLz4KPC9nPgo8L3N2Zz4=')] pointer-events-none opacity-20" />
            <HeroSection />
            <FeaturesAndStepsSection />
            <CTASection />
        </AuroraBackground>
    );
}