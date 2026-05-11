import { AuroraBackground } from "@/components/organisms/AuroraBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, Type, PlayCircle, Clock, Target, Box, Layers, Shuffle } from "lucide-react";
import { motion } from "motion/react";

// Mini componentes visuales (Previsualización)
const GamePreview = ({ type }) => {
    if (type === 'memory') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-blue-500/20 border border-blue-500/30 rounded-sm"></div>)}
        </div>
    );
    if (type === 'blank') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex flex-col items-center justify-center gap-2">
            <div className="text-2xl font-mono text-green-500 tracking-[0.5em]">_ E _ C T</div>
        </div>
    );
    if (type === 'timeline') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex flex-col justify-between">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-yellow-500/20 border border-yellow-500/30 rounded-sm"></div>)}
        </div>
    );
    if (type === 'shooter') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex items-center justify-center relative">
            <Target className="w-12 h-12 text-red-500/50" />
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-400"></div>
        </div>
    );
    if (type === 'guess') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex items-center justify-center">
            <Box className="w-16 h-16 text-cyan-500/50" />
        </div>
    );
    if (type === 'memory3d') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 grid grid-cols-2 gap-2 transform perspective-1000 rotate-x-12 cursor-pointer">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-blue-600 border border-blue-400 rounded-sm shadow-xl"></div>)}
        </div>
    );
    if (type === 'orbital') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute w-28 h-10 border-2 border-emerald-500/40 rounded-[100%]"></div>
            <div className="absolute w-16 h-6 border-2 border-blue-500/40 rounded-[100%]"></div>
            <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-[0_0_20px_var(--tw-shadow-color)] shadow-yellow-500 z-10"></div>
            <div className="absolute w-3 h-3 bg-emerald-400 rounded-full left-[20%] top-[40%] animate-pulse"></div>
        </div>
    );
    return null;
}

// AHORA CADA JUEGO TIENE UNA RUTA ASOCIADA (viewTarget)
const templates = [
    { id: 'memory', viewTarget: "GameMemory", name: "Memory", icon: Search, desc: "Encuentra las parejas corruptas.", color: "text-blue-400" },
    { id: 'memory3d', viewTarget: "GameMemory3D", name: "Memory 3D", icon: Layers, desc: "Encuentra las parejas en un espacio 3D.", color: "text-blue-300" },
    { id: 'blank', viewTarget: "GameCompletarEnunciado", name: "Completa el Enunciado", icon: Type, desc: "Adivina y completa la frase.", color: "text-green-400" },
    { id: 'timeline', viewTarget: "GameOrdenarCronologias", name: "Cronología", icon: Clock, desc: "Ordena los eventos históricos.", color: "text-yellow-400" },
    { id: 'shooter', viewTarget: "GameShooter3D", name: "Shooter 3D", icon: Target, desc: "Dispara a los objetivos.", color: "text-red-400" },
    { id: 'guess', viewTarget: "GameAdivinaQue3D", name: "Adivina qué 3D", icon: Box, desc: "Identifica el modelo 3D.", color: "text-cyan-400" },
    { id: 'orbital', viewTarget: "GameOrbitalOrder", name: "Orbital Order", icon: Target, desc: "Clasificación jerárquica en órbitas 3D.", color: "text-emerald-400" },
];

// RECIBIMOS setView COMO PROP
export default function GameTemplates({ setView }) {
    return (
        <AuroraBackground className="pl-20">
            <div className="h-screen p-12 overflow-y-auto">
                <h2 className="text-4xl font-bold text-white mb-2 font-cyber">LIBRERÍA DE JUEGOS</h2>
                <p className="text-zinc-400 mb-12">Selecciona la estructura base del juego para iniciar simulación.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.map((t) => (
                        <motion.div
                            key={t.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                onClick={() => setView(t.viewTarget)} // <--- LA MAGIA ESTÁ AQUÍ
                                className="bg-black/40 backdrop-blur-xl border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer group h-full"
                            >
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-white/5 ${t.color}`}><t.icon /></div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{t.name}</h3>
                                        </div>
                                        <Badge variant="outline" className="border-white/10 text-zinc-400 group-hover:border-purple-500 group-hover:text-purple-300">JUGAR</Badge>
                                    </div>

                                    {/* Preview con overlay de "Play" al hacer hover */}
                                    <div className="relative group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-shadow rounded-lg overflow-hidden">
                                        <GamePreview type={t.id} />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayCircle className="w-12 h-12 text-white" />
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-400">{t.desc}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AuroraBackground>
    );
}