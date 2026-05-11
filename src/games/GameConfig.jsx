import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Monitor, Users, User, Plus, Trash2, Play,
    Settings2, Library, GripVertical, Rocket
} from "lucide-react";

// Mock de Plantillas disponibles que el profe ha creado previamente
const availableTemplates = [
    { id: "t1", name: "Quiz: Redes IP", type: "Quiz Rápido", color: "text-purple-400 border-purple-500/50", bg: "bg-purple-500/10" },
    { id: "t2", name: "Conceptos: Hardware", type: "Completar", color: "text-cyan-400 border-cyan-500/50", bg: "bg-cyan-500/10" },
    { id: "t3", name: "Línea temporal CPU", type: "Clasificar", color: "text-green-400 border-green-500/50", bg: "bg-green-500/10" },
    { id: "t4", name: "Glosario Hacker", type: "Memoria", color: "text-yellow-400 border-yellow-500/50", bg: "bg-yellow-500/10" },
    { id: "t5", name: "Boss: Virus Final", type: "The Boss", color: "text-red-400 border-red-500/50", bg: "bg-red-500/10" }
];

// Las 4 mesas físicas
const defaultTables = [
    { id: "m1", name: "MESA ALPHA", active: true },
    { id: "m2", name: "MESA BETA", active: true },
    { id: "m3", name: "MESA GAMMA", active: true },
    { id: "m4", name: "MESA DELTA", active: false } // Ejemplo de mesa apagada/sin usar
];

export default function GameConfig({ setView }) {
    const [gameMode, setGameMode] = useState("collaborative"); // 'collaborative' (mesa) | 'individual'
    const [tables, setTables] = useState(defaultTables);
    const [sessionPlaylist, setSessionPlaylist] = useState([]);

    // Añadir un juego a la secuencia de la sesión
    const addGameToSession = (template) => {
        setSessionPlaylist([...sessionPlaylist, { ...template, uniqueId: Math.random().toString() }]);
    };

    // Quitar un juego de la secuencia
    const removeGame = (uniqueId) => {
        setSessionPlaylist(sessionPlaylist.filter(game => game.uniqueId !== uniqueId));
    };

    // Activar/Desactivar mesas físicas
    const toggleTable = (tableId) => {
        setTables(tables.map(t => t.id === tableId ? { ...t, active: !t.active } : t));
    };

    return (
        <div className="min-h-screen pl-24 pr-8 py-8 relative flex flex-col gap-8">
            {/* Background Cyberpunk */}
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px]" />
            </div>

            {/* HEADER */}
            <header className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black font-['Orbitron'] text-white tracking-widest mb-2 flex items-center gap-3">
                        <Settings2 className="w-8 h-8 text-cyan-400" />
                        CONFIGURACIÓN DE SESIÓN
                    </h1>
                    <p className="text-zinc-400 font-bold tracking-wider text-sm">
                        Fase 02: Define el modo de juego, mesas activas y secuencia de retos.
                    </p>
                </div>

                <button
                    onClick={() => setView("Lobby")}
                    disabled={sessionPlaylist.length === 0}
                    className={`px-8 py-4 rounded-xl font-black font-['Orbitron'] tracking-widest flex items-center gap-3 transition-all ${sessionPlaylist.length > 0
                            ? 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-100'
                            : 'bg-white/5 text-zinc-600 cursor-not-allowed scale-95'
                        }`}
                >
                    <Rocket className="w-6 h-6" />
                    ABRIR SALA (LOBBY)
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">

                {/* COLUMNA 1: HARDWARE Y MODO DE JUEGO */}
                <div className="space-y-8 flex flex-col">

                    {/* MODO DE JUEGO */}
                    <div className="bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-bold font-['Orbitron'] tracking-wider mb-4 flex items-center gap-2 text-white">
                            <Users className="w-5 h-5 text-purple-400" />
                            DINÁMICA DE CLASE
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setGameMode('collaborative')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${gameMode === 'collaborative'
                                        ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white'
                                        : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'
                                    }`}
                            >
                                <Users className="w-8 h-8" />
                                <span className="font-bold tracking-wider text-sm">COOPERATIVO (MESA)</span>
                            </button>
                            <button
                                onClick={() => setGameMode('individual')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${gameMode === 'individual'
                                        ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)] text-white'
                                        : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'
                                    }`}
                            >
                                <User className="w-8 h-8" />
                                <span className="font-bold tracking-wider text-sm">INDIVIDUAL (TODOS VS TODOS)</span>
                            </button>
                        </div>
                    </div>

                    {/* ESTADO DE LAS 4 MESAS FÍSICAS */}
                    <div className="bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold font-['Orbitron'] tracking-wider flex items-center gap-2 text-white">
                                <Monitor className="w-5 h-5 text-cyan-400" />
                                HARDWARE (4 MESAS)
                            </h2>
                            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-zinc-300 font-bold">
                                {tables.filter(t => t.active).length}/4 ACTIVAS
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {tables.map((table) => (
                                <motion.div
                                    key={table.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => toggleTable(table.id)}
                                    className={`cursor-pointer p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center h-32 ${table.active
                                            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]'
                                            : 'bg-red-500/5 border-red-500/20 grayscale opacity-60'
                                        }`}
                                >
                                    <Monitor className={`w-8 h-8 mb-2 ${table.active ? 'text-cyan-400' : 'text-red-500'}`} />
                                    <span className={`font-black font-['Orbitron'] tracking-widest ${table.active ? 'text-white' : 'text-zinc-500'}`}>
                                        {table.name}
                                    </span>

                                    {/* Luz de estado neon */}
                                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${table.active ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]'
                                        }`} />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* COLUMNA 2: PLAYLIST DE LA SESIÓN */}
                <div className="bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h2 className="text-lg font-bold font-['Orbitron'] tracking-wider mb-2 flex items-center gap-2 text-white">
                        <Play className="w-5 h-5 text-green-400" />
                        SECUENCIA DE LA SESIÓN (PLAYLIST)
                    </h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider mb-6">Arrastra o añade plantillas para crear el flujo del juego.</p>

                    {/* Zona de Juegos Seleccionados */}
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 overflow-y-auto mb-6 min-h-[250px] custom-scrollbar">
                        <AnimatePresence>
                            {sessionPlaylist.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center text-zinc-600 font-bold tracking-wider border-2 border-dashed border-white/10 rounded-xl">
                                    AÑADE JUEGOS DESDE LA LIBRERÍA DE ABAJO
                                </motion.div>
                            ) : (
                                sessionPlaylist.map((game, index) => (
                                    <motion.div
                                        key={game.uniqueId}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: 50 }}
                                        className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-xl mb-3 group"
                                    >
                                        <div className="p-2 text-zinc-600 cursor-grab active:cursor-grabbing hover:text-white">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className={`px-3 py-1 rounded-md text-xs font-bold border ${game.color} ${game.bg} w-28 text-center`}>
                                            {game.type}
                                        </div>
                                        <div className="flex-1 font-bold text-white tracking-wide">
                                            {game.name}
                                        </div>
                                        <button
                                            onClick={() => removeGame(game.uniqueId)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Librería de Plantillas (Para añadir) */}
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-sm font-bold font-['Orbitron'] tracking-wider mb-4 flex items-center gap-2 text-zinc-400">
                            <Library className="w-4 h-4" /> MIS PLANTILLAS
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                            {availableTemplates.map((template) => (
                                <motion.button
                                    key={template.id}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addGameToSession(template)}
                                    className={`min-w-[160px] p-4 rounded-xl border flex flex-col items-start gap-3 bg-white/5 hover:bg-white/10 transition-colors border-white/10 group`}
                                >
                                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded border ${template.color} ${template.bg}`}>
                                        {template.type}
                                    </span>
                                    <span className="font-bold text-sm text-left text-zinc-300 group-hover:text-white">
                                        {template.name}
                                    </span>
                                    <div className="mt-auto w-full pt-2 flex justify-end">
                                        <Plus className="w-5 h-5 text-white/30 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}