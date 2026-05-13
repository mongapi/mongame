import { AuroraBackground } from "@/components/organisms/AuroraBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, Type, PlayCircle, Clock, Target, Box, Gamepad2, Layers, Shuffle } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const GamePreview = ({ type }) => {
    if (type === 'quiz') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex flex-col gap-2">
            <div className="h-2 w-full bg-purple-900/30 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-purple-500"></div></div>
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">¿Pregunta?</div>
            <div className="grid grid-cols-2 gap-2"><div className="h-6 bg-zinc-800 rounded" /><div className="h-6 bg-zinc-800 rounded" /></div>
        </div>
    );
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
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-blue-600 border border-blue-400 rounded-sm shadow-xl"></div>)}
        </div>
    );
    if (type === 'sorting3d') return (
        <div className="h-32 bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex gap-2 items-end justify-center">
            <div className="w-6 h-12 bg-orange-600 rounded"></div>
            <div className="w-6 h-16 bg-orange-500 rounded"></div>
            <div className="w-6 h-20 bg-yellow-500 rounded"></div>
        </div>
    );
    return null;
}

const gamesList = [
    { id: 'quiz', code: 'quiz', name: "FastQuiz", icon: Brain, color: "text-purple-400", cta: 'CREAR' },
    { id: 'memory', code: 'memory', name: "Memory", icon: Search, color: "text-blue-400", cta: 'CREAR' },
    { id: 'blank', code: 'filling_blanks', name: "Completa el Enunciado", icon: Type, color: "text-green-400", cta: 'CREAR' },
    { id: 'timeline', code: 'timeline', name: "Cronología", icon: Clock, color: "text-yellow-400", cta: 'CREAR' },
    { id: 'shooter', code: 'shooting', name: "Shooter 3D", icon: Target, color: "text-red-400", cta: 'CREAR' },
    { id: 'guess', code: 'guess_who', name: "Adivina qué 3D", icon: Box, color: "text-cyan-400", cta: 'CREAR' },
    { id: 'memory3d', name: "Memory 3D", icon: Layers, color: "text-blue-300", cta: 'PRONTO' },
    { id: 'orbital', name: "Orbital Order", icon: Shuffle, color: "text-orange-400", cta: 'PRONTO' },
];

export default function GameChooserView() {
    const navigate = useNavigate();

    return (
        <AuroraBackground className="pl-20">
            <div className="min-h-screen p-12 overflow-y-auto w-full">
                <div className="flex flex-col items-center justify-center mb-12 text-center mt-10">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/10 p-5 rounded-full mb-6 border border-white/20">
                        <Gamepad2 className="w-16 h-16 text-white" />
                    </motion.div>
                    <h1 className="text-5xl font-black font-['Orbitron'] text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-cyan-400 mb-4 tracking-wider drop-shadow-lg">
                        SELECCIONA TU DESAFÍO
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl">
                        Elige el tipo de juego que quieres crear y personalízalo con tu contenido.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
                    {gamesList.map((game, idx) => (
                        <motion.div key={game.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }}>
                            <Card onClick={() => game.code && navigate(`/games/create/${game.code}`)}
                                className={`bg-black/40 backdrop-blur-xl border-zinc-800 transition-all group h-full overflow-hidden relative ${game.code ? 'cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'cursor-not-allowed opacity-60'}`}>
                                <div className="absolute inset-0 bg-linear-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-colors duration-500" />
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${game.color} group-hover:bg-white/10 transition-colors`}>
                                            <game.icon className="w-6 h-6" />
                                        </div>
                                        <Badge className={`border px-4 py-1 font-bold tracking-widest ${game.code ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-black transition-colors' : 'bg-white/10 text-zinc-400 border-white/10'}`}>
                                            {game.cta}
                                        </Badge>
                                    </div>
                                    <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors mb-4">{game.name}</h3>
                                    <div className="relative rounded-lg overflow-hidden border border-zinc-700/50 group-hover:border-cyan-500/30 transition-colors">
                                        <GamePreview type={game.id} />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                                            <PlayCircle className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AuroraBackground>
    );
}
