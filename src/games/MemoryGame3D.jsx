import React, { useState, useEffect } from 'react';
import Card3D from '../components/canvas3D/meshes/Card3D';
import RoomCanvas from '../components/canvas3D/scenes/RoomCanvas';
import { Text } from '@react-three/drei';
import { RefreshCcw } from 'lucide-react';

// Seis cartas: 3 columnas x 2 filas = 3 pares de letras.
const LETTERS = ['A', 'B', 'C'];

function generateDeck() {
    let deck = [];
    LETTERS.forEach((letter, i) => {
        deck.push({ id: `a_${i}`, type: letter, content: letter, matched: false });
        deck.push({ id: `b_${i}`, type: letter, content: letter, matched: false });
    });

    // Barajamos aleatoriamente
    deck.sort(() => Math.random() - 0.5);

    // Asignamos coordenadas físicas para un layout 3x2
    return deck.map((card, index) => {
        const col = index % 3; // 0, 1, 2
        const row = Math.floor(index / 3); // 0, 1
        return {
            ...card,
            // X: -3.0 (izq), 0 (centro), 3.0 (der)
            // Y: 2.25 (fila superior), -2.25 (fila inferior) para separarlas un buen trecho
            position: [(col - 1) * 3.0, (0.5 - row) * 4.5, 0]
        };
    });
}

export default function MemoryGame3D() {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        setCards(generateDeck());
    }, []);

    const resetGame = () => {
        setFlippedIndices([]);
        setIsChecking(false);
        setTimeout(() => setCards(generateDeck()), 300);
    };

    const handleCardClick = (cardIndex) => {
        if (isChecking) return;
        const clickedCard = cards[cardIndex];

        if (clickedCard.matched || flippedIndices.includes(cardIndex)) return;

        const newFlipped = [...flippedIndices, cardIndex];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setIsChecking(true);
            const firstCard = cards[newFlipped[0]];
            const secondCard = cards[newFlipped[1]];

            if (firstCard.type === secondCard.type) {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) => newFlipped.includes(i) ? { ...c, matched: true } : c));
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

    const hasWon = cards.length > 0 && cards.every(c => c.matched);

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white">
            <header className="p-6 text-center z-10 absolute w-full top-0 pointer-events-none flex flex-col items-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                    Memory 3D
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
                        Encuentra las parejas de Letras
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
                                            {card.content}
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
