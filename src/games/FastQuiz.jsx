import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Timer, Zap, CheckCircle2, XCircle } from "lucide-react";

// Mock Data de la pregunta (Esto vendría del Template del Profesor)
const currentQuestion = {
    id: "q1",
    text: "¿Cuál es el protocolo principal utilizado para enviar correos electrónicos en internet?",
    timeLimit: 15,
    options: [
        { id: "a", text: "FTP (File Transfer Protocol)" },
        { id: "b", text: "SMTP (Simple Mail Transfer Protocol)" },
        { id: "c", text: "HTTP (Hypertext Transfer Protocol)" },
        { id: "d", text: "SSH (Secure Shell)" }
    ],
    correctAnswer: "b"
};

export default function QuizGame() {
    const [timeLeft, setTimeLeft] = useState(currentQuestion.timeLimit);
    const [selectedOption, setSelectedOption] = useState(null);
    const [gameState, setGameState] = useState("playing"); // 'playing', 'answered', 'timeout'

    // Lógica del Temporizador
    useEffect(() => {
        if (timeLeft > 0 && gameState === "playing") {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && gameState === "playing") {
            setGameState("timeout");
        }
    }, [timeLeft, gameState]);

    // Manejador de selección
    const handleSelect = (optionId) => {
        if (gameState !== "playing") return;
        setSelectedOption(optionId);
        setGameState("answered");

        // Aquí emitiríamos el evento al servidor por WebSockets para que el profe lo vea en tiempo real
        // socket.emit('answer_submitted', { studentId: 'me', questionId: currentQuestion.id, answer: optionId });
    };

    // Función para determinar estilos de los botones según el estado
    const getOptionStyles = (optionId) => {
        const baseStyle = "relative w-full p-6 rounded-2xl border backdrop-blur-md text-left transition-all duration-300 flex items-center justify-between group overflow-hidden ";

        if (gameState === "playing") {
            return baseStyle + "bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer";
        }

        if (gameState === "answered" || gameState === "timeout") {
            if (optionId === currentQuestion.correctAnswer) {
                // Respuesta correcta brilla en verde
                return baseStyle + "bg-green-500/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] text-white scale-[1.02] z-10";
            }
            if (optionId === selectedOption && optionId !== currentQuestion.correctAnswer) {
                // Respuesta incorrecta seleccionada brilla en rojo
                return baseStyle + "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white opacity-90";
            }
            // Opciones no seleccionadas se apagan
            return baseStyle + "bg-white/5 border-white/5 opacity-40 grayscale pointer-events-none";
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
            {/* Fondo Aurora para el juego */}
            <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-600/20 rounded-full blur-[120px]"
                />
            </div>

            <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">

                {/* Header: Temporizador y Progreso */}
                <div className="flex justify-between items-center bg-zinc-950/50 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-cyan-400">
                        <Zap className="w-6 h-6 animate-pulse" />
                        <span className="font-['Orbitron'] font-bold tracking-widest">PREGUNTA 1/10</span>
                    </div>
                    <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border ${timeLeft <= 5 ? 'border-red-500/50 text-red-400 bg-red-500/10 animate-pulse' : 'border-white/10 text-white bg-white/5'}`}>
                        <Timer className="w-6 h-6" />
                        <span className="font-['Orbitron'] text-2xl font-black">{timeLeft}s</span>
                    </div>
                </div>

                {/* Tarjeta de la Pregunta */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500" />
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight text-center text-white drop-shadow-md">
                        {currentQuestion.text}
                    </h2>
                </motion.div>

                {/* Grid de Opciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            onClick={() => handleSelect(option.id)}
                            disabled={gameState !== "playing"}
                            className={getOptionStyles(option.id)}
                        >
                            <span className="text-xl font-medium z-10">{option.text}</span>

                            {/* Iconos de Feedback (Solo visibles tras responder) */}
                            <div className="z-10">
                                {(gameState === "answered" || gameState === "timeout") && option.id === currentQuestion.correctAnswer && (
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                )}
                                {gameState === "answered" && option.id === selectedOption && option.id !== currentQuestion.correctAnswer && (
                                    <XCircle className="w-8 h-8 text-red-400" />
                                )}
                            </div>

                            {/* Resplandor de hover interno */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        </motion.button>
                    ))}
                </div>

                {/* Mensaje de Timeout */}
                {gameState === "timeout" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-bold font-['Orbitron'] tracking-widest"
                    >
                        ¡TIEMPO AGOTADO!
                    </motion.div>
                )}

            </div>
        </div>
    );
}