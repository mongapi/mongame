import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Zap, ShieldCheck } from "lucide-react";
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from "@/games/shared/GameScreenShell";
import { GameExitButton, GameSessionFinishedOverlay, useGameSessionUi } from '@/games/shared/GameSessionActions';
import { useSessionGame } from "@/hooks/useSessionGame";
import { validateGameContent } from "@/games/shared/gameContentValidation";

function shuffleCards(cards) {
    return [...cards].sort(() => Math.random() - 0.5);
}

function resolveMemoryContent(gameContent) {
    return {
        pairs: Array.isArray(gameContent?.pairs) ? gameContent.pairs : [],
    };
}

export default function MemoryGame() {
    const { session, content, sessionId, participant, isLoading, error, setError } = useSessionGame({
        resolveContent: resolveMemoryContent,
        validateContent: (resolvedContent) => validateGameContent('memory', resolvedContent),
    });

    const [cards, setCards] = useState([]);
    const [flippedIndexes, setFlippedIndexes] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [startedAt, setStartedAt] = useState(() => Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { sessionFinished, handleExit, exitLabel, finishActionLabel } = useGameSessionUi({ session, sessionId, isPreview: false });

    const totalPairs = useMemo(() => {
        const pairIds = new Set((content.pairs ?? []).map((card) => card.pairId));
        return pairIds.size;
    }, [content.pairs]);

    useEffect(() => {
        if (!content.pairs?.length) {
            setCards([]);
            return;
        }

        setCards(shuffleCards(content.pairs));
        setFlippedIndexes([]);
        setMatchedPairs([]);
        setMoves(0);
        setIsLocked(false);
        setGameWon(false);
        setStartedAt(Date.now());
        setError('');
    }, [content.pairs]);

    const submitCompletedGame = async (resolvedPairs) => {
        if (!sessionId || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        const result = await sessionAPI.submitAnswer(sessionId, {
            question_id: 'memory-complete',
            answer: resolvedPairs,
            device_id: participant.deviceId,
            player_name: participant.playerName,
            player_number: 1,
            elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
            completed: true,
        });

        if (!result.success) {
            setError(result.error);
        }

        setIsSubmitting(false);
    };

    // Lógica de emparejamiento
    const handleCardClick = (index) => {
        // Evitar clics si está bloqueado, si ya está volteada o si ya está emparejada
        if (sessionFinished || isLocked || flippedIndexes.includes(index) || matchedPairs.includes(cards[index].pairId)) return;

        const newFlipped = [...flippedIndexes, index];
        setFlippedIndexes(newFlipped);

        if (newFlipped.length === 2) {
            setIsLocked(true);
            setMoves((m) => m + 1);

            const card1 = cards[newFlipped[0]];
            const card2 = cards[newFlipped[1]];

            if (card1.pairId === card2.pairId) {
                // MATCH!
                setMatchedPairs((prev) => [...prev, card1.pairId]);
                setFlippedIndexes([]);
                setIsLocked(false);

                // Comprobar si ganó
                if (matchedPairs.length + 1 === totalPairs) {
                    void submitCompletedGame([...matchedPairs, card1.pairId]);
                    setTimeout(() => setGameWon(true), 500);
                }
            } else {
                // NO MATCH -> Voltear de nuevo después de 1 segundo
                setTimeout(() => {
                    setFlippedIndexes([]);
                    setIsLocked(false);
                }, 1000);
            }
        }
    };

    if (isLoading) {
        return <GameLoadingState title="Cargando memory..." />;
    }

    if (error) {
        return <GameErrorState message={error} />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <GameExitButton onExit={handleExit} label={exitLabel} />
            <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />
            {/* Fondo Aurora Cyberpunk */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                <motion.div animate={{ x: [0, -30, 0], y: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 z-10">

                {/* HEADER DEL JUEGO */}
                <div className="flex justify-between items-center bg-zinc-950/50 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/30">
                            <Cpu className="w-5 h-5 animate-pulse" />
                            <span className="font-['Orbitron'] font-bold tracking-widest text-sm">NODOS DE DATOS</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-500 font-bold tracking-wider">MOVIMIENTOS</span>
                            <span className="text-xl font-black font-['Orbitron'] text-white">{moves}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-500 font-bold tracking-wider">EMPAREJADOS</span>
                            <span className="text-xl font-black font-['Orbitron'] text-green-400">
                                {matchedPairs.length} / {totalPairs}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TABLERO DE CARTAS (GRID) */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 perspective-[1000px]">
                    {cards.map((card, index) => {
                        const isFlipped = flippedIndexes.includes(index) || matchedPairs.includes(card.pairId);
                        const isMatched = matchedPairs.includes(card.pairId);

                        return (
                            <motion.div
                                key={index}
                                className="relative h-32 md:h-40 cursor-pointer"
                                style={{ transformStyle: "preserve-3d" }}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                onClick={() => handleCardClick(index)}
                            >
                                {/* LADO TRASERO (Oculto inicialmente, es la cara principal) */}
                                <div
                                    className={`absolute inset-0 backface-hidden rounded-2xl border flex items-center justify-center p-4 transition-all duration-300 ${isMatched
                                        ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                        : 'bg-white/10 border-white/20 hover:border-cyan-400/50 backdrop-blur-md'
                                        }`}
                                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                                >
                                    <p className={`text-center font-bold tracking-wide ${isMatched ? 'text-green-400' : 'text-white md:text-lg'}`}>
                                        {card.text}
                                    </p>
                                    {isMatched && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                                            <ShieldCheck className="w-4 h-4 text-zinc-950" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* LADO DELANTERO (Logo del juego, visible al inicio) */}
                                <div
                                    className="absolute inset-0 backface-hidden rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-lg overflow-hidden group"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Zap className="w-10 h-10 text-zinc-700 group-hover:text-cyan-500 transition-colors duration-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />

                                    {/* Patrón de circuito de fondo */}
                                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:10px_10px]" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* MENSAJE DE VICTORIA */}
                <AnimatePresence>
                    {gameWon && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
                        >
                            <div className="bg-zinc-900 border border-green-500/50 p-10 rounded-3xl text-center shadow-[0_0_50px_rgba(34,197,94,0.2)] max-w-md w-full">
                                <motion.div
                                    animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-dashed border-green-500 flex items-center justify-center"
                                >
                                    <ShieldCheck className="w-12 h-12 text-green-400" />
                                </motion.div>
                                <h2 className="text-3xl font-black font-['Orbitron'] text-white mb-2 tracking-widest">SISTEMA VULNERADO</h2>
                                <p className="text-zinc-400 mb-8 font-bold tracking-wider">Todos los nodos de datos han sido enlazados con éxito en {moves} movimientos.</p>
                                <button className="w-full py-4 bg-green-500 hover:bg-green-400 text-zinc-950 font-black font-['Orbitron'] tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                                    CONTINUAR AL SIGUIENTE NIVEL
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}