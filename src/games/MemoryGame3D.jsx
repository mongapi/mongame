import React, { useEffect, useMemo, useState } from 'react';
import Card3D from '../components/canvas3D/meshes/Card3D';
import RoomCanvas from '../components/canvas3D/scenes/RoomCanvas';
import { Text } from '@react-three/drei';
import { Eye, RefreshCcw } from 'lucide-react';
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { GameExitButton, GameSessionFinishedOverlay, useGameSessionUi } from '@/games/shared/GameSessionActions';
import { useSessionGame } from '@/hooks/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';

const FALLBACK_PAIRS = [
    { id: 'mem3d-a-1', pairId: 'A', text: 'CPU' },
    { id: 'mem3d-a-2', pairId: 'A', text: 'Procesador' },
    { id: 'mem3d-b-1', pairId: 'B', text: 'RAM' },
    { id: 'mem3d-b-2', pairId: 'B', text: 'Memoria temporal' },
    { id: 'mem3d-c-1', pairId: 'C', text: 'Router' },
    { id: 'mem3d-c-2', pairId: 'C', text: 'Enruta paquetes' },
];

function resolveMemory3DContent(gameContent) {
    const pairs = Array.isArray(gameContent?.pairs) && gameContent.pairs.length > 0
        ? gameContent.pairs
        : FALLBACK_PAIRS;

    return {
        pairs,
    };
}

function buildDeck(pairs) {
    const deck = [...pairs].sort(() => Math.random() - 0.5);
    const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(deck.length))));
    const horizontalSpacing = deck.length <= 6 ? 3 : 2.6;
    const verticalSpacing = deck.length <= 6 ? 4.2 : 3.8;

    return deck.map((card, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const rowCount = Math.ceil(deck.length / columns);

        return {
            ...card,
            position: [
                (col - (columns - 1) / 2) * horizontalSpacing,
                (((rowCount - 1) / 2) - row) * verticalSpacing,
                0,
            ],
        };
    });
}

export default function MemoryGame3D() {
    const { session, content, sessionId, participant, isLoading, error, setError, isPreview, previewTitle } = useSessionGame({
        resolveContent: resolveMemory3DContent,
        validateContent: (resolvedContent) => validateGameContent('memory', resolvedContent),
    });

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const [startedAt, setStartedAt] = useState(() => Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { sessionFinished, handleExit, exitLabel, finishActionLabel } = useGameSessionUi({ session, sessionId, isPreview });

    const totalPairs = useMemo(() => new Set((content.pairs ?? []).map((card) => card.pairId)).size, [content.pairs]);

    useEffect(() => {
        setCards(buildDeck(content.pairs ?? []));
        setFlippedIndices([]);
        setIsChecking(false);
        setStartedAt(Date.now());
        setError('');
    }, [content.pairs, setError]);

    const hasWon = cards.length > 0 && cards.every((card) => card.matched);

    useEffect(() => {
        if (hasWon) {
            void submitCompletedGame();
        }
    }, [hasWon]);

    const submitCompletedGame = async () => {
        if (!sessionId || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        const result = await sessionAPI.submitAnswer(sessionId, {
            question_id: 'memory-3d-complete',
            answer: cards.map((card) => card.pairId),
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

    const resetGame = () => {
        setFlippedIndices([]);
        setIsChecking(false);
        setStartedAt(Date.now());
        setError('');
        setTimeout(() => setCards(buildDeck(content.pairs ?? [])), 300);
    };

    const handleCardClick = (cardIndex) => {
        if (sessionFinished) return;
        if (isChecking) return;
        const clickedCard = cards[cardIndex];

        if (clickedCard.matched || flippedIndices.includes(cardIndex)) return;

        const newFlipped = [...flippedIndices, cardIndex];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setIsChecking(true);
            const firstCard = cards[newFlipped[0]];
            const secondCard = cards[newFlipped[1]];

            if (firstCard.pairId === secondCard.pairId) {
                setTimeout(() => {
                    setCards((prev) => prev.map((card, index) => newFlipped.includes(index) ? { ...card, matched: true } : card));
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 500);
            } else {
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1200);
            }
        }
    };

    if (isLoading) {
        return <GameLoadingState title="Cargando memory 3D..." />;
    }

    if (error) {
        return <GameErrorState message={error} />;
    }

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white">
            <GameExitButton onExit={handleExit} label={exitLabel} />
            <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />
            <header className="p-6 text-center z-10 absolute w-full top-0 pointer-events-none flex flex-col items-center">
                {isPreview ? (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-200 pointer-events-auto">
                        <Eye className="w-4 h-4" />
                        Vista previa docente
                    </div>
                ) : null}
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-green-500">
                    {isPreview ? previewTitle : 'Memory 3D'}
                </h1>

                {hasWon ? (
                    <div className="mt-4 bg-purple-600/20 border border-purple-500/50 p-6 rounded-2xl backdrop-blur-md pointer-events-auto shadow-2xl animate-in flip-in-y duration-500">
                        <h2 className="text-3xl font-black mb-4">🏆 ¡Resuelto!</h2>
                        <button
                            onClick={resetGame}
                            className="flex items-center gap-2 mx-auto bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-transform hover:scale-105"
                        >
                            <RefreshCcw className="w-5 h-5" /> Jugar de nuevo
                        </button>
                    </div>
                ) : (
                    <p className="opacity-70 mt-2 bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">
                        Encuentra las parejas 3D y enlaza {totalPairs} conjuntos.
                    </p>
                )}
            </header>

            <main className="flex-1 relative cursor-pointer">
                {/* Cámara retrocedida a Z=17 para que el 3x2 encaje bien centrado */}
                <RoomCanvas cameraPosition={[0, 4.5, 17]} fov={45}>
                    <group position={[0, 4.5, 0]}>

                        {cards.map((card, index) => (
                            <Card3D
                                key={card.id}
                                position={card.position}
                                isFlipped={card.matched || flippedIndices.includes(index)}
                                canFlipOnClick={false}
                                onClick={() => handleCardClick(index)}
                                hoverEffect={!card.matched}
                                // Eliminamos la capa Html (que causaba fallos de render en tu pantalla)
                                // y usamos puros primitivos de WebGL
                                front={
                                    <group>
                                        <mesh>
                                            <planeGeometry args={[2, 3]} />
                                            <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
                                        </mesh>
                                        <Text
                                            position={[0, 0, 0.05]}
                                            fontSize={1.5}
                                            color="#0f172a"
                                            fontWeight="600"
                                            anchorX="center"
                                            anchorY="middle"
                                        >
                                            {card.text}
                                        </Text>
                                    </group>
                                }
                                back={
                                    <mesh>
                                        <planeGeometry args={[2, 3]} />
                                        {/* Reverso de color plano vibrante (Azul Eléctrico) */}
                                        <meshStandardMaterial color="#4f46e5" roughness={0.5} />
                                    </mesh>
                                }
                            />
                        ))}

                    </group>
                </RoomCanvas>
            </main>
        </div>
    );
}
