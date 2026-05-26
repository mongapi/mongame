import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, RoundedBox, Sphere, Stars, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Eye, RotateCcw, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { useSessionGame } from '@/hooks/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';
import { ROUTE_PATHS, buildDashboardSessionPath } from '@/router/paths';

const INTER_FONT = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf';
const MAX_ERRORS = 6;
const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

function resolveHangmanContent(gameContent) {
    return {
        word: String(gameContent?.word ?? '').trim().toUpperCase(),
        clue: String(gameContent?.clue ?? '').trim(),
    };
}

function Gallows() {
    return (
        <group position={[-4.8, -0.5, 0]}>
            <mesh position={[0, -2.4, 0]}>
                <boxGeometry args={[3.6, 0.25, 1]} />
                <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.25, 5.2, 0.25]} />
                <meshStandardMaterial color="#71717a" metalness={0.45} roughness={0.45} />
            </mesh>
            <mesh position={[1.25, 2.55, 0]}>
                <boxGeometry args={[2.8, 0.22, 0.22]} />
                <meshStandardMaterial color="#71717a" metalness={0.45} roughness={0.45} />
            </mesh>
            <mesh position={[2.5, 1.65, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 1.8, 24]} />
                <meshStandardMaterial color="#a1a1aa" />
            </mesh>
        </group>
    );
}

function HangmanBody({ errors }) {
    return (
        <group position={[-2.3, 0.6, 0]}>
            {errors >= 1 ? (
                <mesh position={[0, 1.8, 0]}>
                    <sphereGeometry args={[0.55, 32, 32]} />
                    <meshStandardMaterial color="#f8fafc" emissive="#94a3b8" emissiveIntensity={0.2} />
                </mesh>
            ) : null}
            {errors >= 2 ? (
                <mesh position={[0, 0.35, 0]}>
                    <capsuleGeometry args={[0.22, 1.8, 8, 16]} />
                    <meshStandardMaterial color="#cbd5e1" />
                </mesh>
            ) : null}
            {errors >= 3 ? (
                <mesh position={[-0.7, 0.85, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <capsuleGeometry args={[0.12, 0.95, 8, 16]} />
                    <meshStandardMaterial color="#cbd5e1" />
                </mesh>
            ) : null}
            {errors >= 4 ? (
                <mesh position={[0.7, 0.85, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <capsuleGeometry args={[0.12, 0.95, 8, 16]} />
                    <meshStandardMaterial color="#cbd5e1" />
                </mesh>
            ) : null}
            {errors >= 5 ? (
                <mesh position={[-0.45, -1.05, 0]} rotation={[0, 0, -Math.PI / 5]}>
                    <capsuleGeometry args={[0.12, 1.05, 8, 16]} />
                    <meshStandardMaterial color="#cbd5e1" />
                </mesh>
            ) : null}
            {errors >= 6 ? (
                <mesh position={[0.45, -1.05, 0]} rotation={[0, 0, Math.PI / 5]}>
                    <capsuleGeometry args={[0.12, 1.05, 8, 16]} />
                    <meshStandardMaterial color="#cbd5e1" />
                </mesh>
            ) : null}
        </group>
    );
}

function WordSlots({ word, guessedLetters }) {
    const characters = word.split('');
    const totalWidth = Math.max(characters.length - 1, 0) * 0.9;

    return (
        <group position={[0.6, -2.9, 0]}>
            {characters.map((character, index) => {
                const visibleCharacter = guessedLetters.includes(character) || character === ' ' ? character : '_';
                return (
                    <group key={`${character}-${index}`} position={[index * 0.9 - totalWidth / 2, 0, 0]}>
                        <Text
                            position={[0, 0.35, 0]}
                            font={INTER_FONT}
                            fontSize={0.52}
                            color={visibleCharacter === '_' ? '#fbbf24' : '#f8fafc'}
                            anchorX="center"
                            anchorY="middle"
                        >
                            {visibleCharacter}
                        </Text>
                        <mesh position={[0, -0.06, 0]}>
                            <boxGeometry args={[0.56, 0.06, 0.06]} />
                            <meshStandardMaterial color="#fbbf24" />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
}

function LetterOrb({ letter, position, disabled, used, correct, onSelect }) {
    const baseColor = correct ? '#34d399' : used ? '#ef4444' : '#38bdf8';

    return (
        <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.45}>
            <group
                position={position}
                onClick={(event) => {
                    event.stopPropagation();
                    if (!disabled) {
                        onSelect(letter);
                    }
                }}
                onPointerOver={() => {
                    if (!disabled) {
                        document.body.style.cursor = 'pointer';
                    }
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                }}
            >
                <Sphere args={[0.42, 28, 28]}>
                    <meshStandardMaterial
                        color={baseColor}
                        emissive={baseColor}
                        emissiveIntensity={disabled ? 0.15 : 0.45}
                        transparent
                        opacity={disabled ? 0.35 : 0.92}
                    />
                </Sphere>
                <Text
                    position={[0, 0, 0.44]}
                    font={INTER_FONT}
                    fontSize={0.25}
                    color="#020617"
                    anchorX="center"
                    anchorY="middle"
                >
                    {letter}
                </Text>
            </group>
        </Float>
    );
}

function HangmanScene({ word, guessedLetters, wrongLetters, onGuess, isLocked }) {
    const controlPanelPosition = [6.15, -0.35, 0.5];

    const letterNodes = useMemo(() => {
        return LETTERS.map((letter, index) => {
            const columns = 4;
            const col = index % columns;
            const row = Math.floor(index / columns);
            return {
                letter,
                position: [-1.35 + col * 0.92, 2.9 - row * 1.1, 0.08],
            };
        });
    }, []);

    return (
        <Canvas camera={{ position: [0, 0.4, 12], fov: 48 }}>
            <color attach="background" args={['#020617']} />
            <fog attach="fog" args={['#020617', 12, 26]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 6]} intensity={1.2} color="#e2e8f0" />
            <pointLight position={[-2, 4, 2]} intensity={0.9} color="#38bdf8" />
            <pointLight position={[4, -2, 4]} intensity={0.8} color="#f59e0b" />
            <Stars radius={60} depth={30} count={1800} factor={3} saturation={0} fade speed={0.6} />
            <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={1.15} maxPolarAngle={1.9} />

            <Gallows />
            <HangmanBody errors={wrongLetters.length} />
            <WordSlots word={word} guessedLetters={guessedLetters} />

            <RoundedBox args={[6.6, 0.22, 1.8]} radius={0.12} position={[0.8, -4.98, -0.6]}>
                <meshStandardMaterial color="#0f172a" metalness={0.35} roughness={0.65} />
            </RoundedBox>

            <group position={controlPanelPosition} rotation={[0, -0.22, 0]}>
                <RoundedBox args={[4.2, 8.4, 0.35]} radius={0.18} position={[0, 0, -0.95]}>
                    <meshStandardMaterial color="#081120" metalness={0.2} roughness={0.78} transparent opacity={0.92} />
                </RoundedBox>

                {letterNodes.map(({ letter, position }) => {
                    const used = guessedLetters.includes(letter) || wrongLetters.includes(letter);
                    const correct = guessedLetters.includes(letter);
                    return (
                        <LetterOrb
                            key={letter}
                            letter={letter}
                            position={position}
                            disabled={isLocked || used}
                            used={used}
                            correct={correct}
                            onSelect={onGuess}
                        />
                    );
                })}
            </group>
        </Canvas>
    );
}

export default function Hangman3D() {
    const navigate = useNavigate();
    const { session, content, sessionId, participant, isLoading, error, setError, isPreview, previewTitle } = useSessionGame({
        resolveContent: resolveHangmanContent,
        validateContent: (resolvedContent) => validateGameContent('hangman', resolvedContent),
    });

    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongLetters, setWrongLetters] = useState([]);
    const [gameState, setGameState] = useState('playing');
    const [startedAt, setStartedAt] = useState(() => Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const normalizedWordLetters = useMemo(
        () => [...new Set(content.word.split('').filter((character) => character.trim()))],
        [content.word],
    );
    const hiddenWordLength = useMemo(
        () => content.word.split('').filter((character) => character.trim()).length,
        [content.word],
    );
    const sessionFinished = Boolean(sessionId && session?.status === 'finished');

    useEffect(() => {
        setGuessedLetters([]);
        setWrongLetters([]);
        setGameState('playing');
        setStartedAt(Date.now());
        setError('');
    }, [content.clue, content.word, setError]);

    const handleGuess = async (letter) => {
        if (gameState !== 'playing' || sessionFinished || isSubmitting) {
            return;
        }

        const alreadyUsed = guessedLetters.includes(letter) || wrongLetters.includes(letter);
        if (alreadyUsed) {
            return;
        }

        setError('');
        const isCorrect = content.word.includes(letter);
        const nextCorrectLetters = isCorrect ? [...guessedLetters, letter] : guessedLetters;
        const nextWrongLetters = isCorrect ? wrongLetters : [...wrongLetters, letter];
        const isSolved = normalizedWordLetters.every((character) => nextCorrectLetters.includes(character));
        const isLost = nextWrongLetters.length >= MAX_ERRORS;

        if (sessionId) {
            setIsSubmitting(true);
            const result = await sessionAPI.submitAnswer(sessionId, {
                question_id: 'hangman-word',
                answer: letter,
                device_id: participant.deviceId,
                player_name: participant.playerName,
                player_number: 1,
                elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
                completed: isSolved,
            });

            if (!result.success) {
                setError(result.error);
            }

            setIsSubmitting(false);
        }

        if (isCorrect) {
            setGuessedLetters(nextCorrectLetters);
            if (isSolved) {
                setGameState('won');
            }
            return;
        }

        setWrongLetters(nextWrongLetters);
        if (isLost) {
            setGameState('lost');
        }
    };

    const handleReset = () => {
        setGuessedLetters([]);
        setWrongLetters([]);
        setGameState('playing');
        setStartedAt(Date.now());
        setError('');
    };

    const handleExit = () => {
        if (sessionId && !isPreview) {
            navigate(buildDashboardSessionPath(sessionId));
            return;
        }

        navigate(ROUTE_PATHS.games);
    };

    if (isLoading) {
        return <GameLoadingState title="Cargando ahorcado..." />;
    }

    if (error) {
        return <GameErrorState message={error} />;
    }

    return (
        <div className="relative h-screen overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0">
                <HangmanScene
                    word={content.word}
                    guessedLetters={guessedLetters}
                    wrongLetters={wrongLetters}
                    onGuess={handleGuess}
                    isLocked={gameState !== 'playing' || sessionFinished || isSubmitting}
                />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6">
                <div className="flex flex-wrap items-start gap-4">
                    <div className="pointer-events-auto max-w-xs rounded-3xl border border-white/10 bg-black/45 p-3 backdrop-blur-xl">
                        {isPreview ? (
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                                <Eye className="h-3.5 w-3.5" />
                                Vista previa docente
                            </div>
                        ) : null}
                        <p className="text-xs font-semibold text-cyan-300">Reto 3D</p>
                        <h1 className="mt-1 text-2xl font-semibold text-white">{isPreview ? previewTitle : 'Ahorcado'}</h1>
                        <div className="mt-3 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100">Pista</p>
                            <p className="mt-2 text-sm leading-5 text-slate-100">{content.clue || 'Sin pista configurada todavía.'}</p>
                        </div>
                        <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">Palabra oculta</p>
                            <p className="mt-1 font-semibold text-white">{hiddenWordLength} letra{hiddenWordLength === 1 ? '' : 's'} para descubrir.</p>
                        </div>
                        {error ? (
                            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-200">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        <div className="mt-3 rounded-3xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
                            <p className="text-sm font-semibold text-zinc-400">Estado</p>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300/80">Aciertos</p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-200">{guessedLetters.length}</p>
                                </div>
                                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300/80">Fallos</p>
                                    <p className="mt-1 text-2xl font-bold text-red-200">{wrongLetters.length}/{MAX_ERRORS}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div className="pointer-events-auto rounded-3xl border border-white/10 bg-black/45 px-5 py-4 backdrop-blur-xl">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Letras falladas</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {wrongLetters.length > 0 ? wrongLetters.join(' · ') : 'Ninguna todavía'}
                        </p>
                    </div>

                    <div className="pointer-events-auto flex gap-3">
                        <button
                            type="button"
                            onClick={handleExit}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                        >
                            Salir
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={sessionFinished}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reiniciar
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {gameState !== 'playing' || sessionFinished ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                            <div className={`mx-auto flex h-18 w-18 items-center justify-center rounded-full ${gameState === 'won' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                                {gameState === 'won' ? <CheckCircle2 className="h-10 w-10" /> : <Skull className="h-10 w-10" />}
                            </div>
                            <h2 className="mt-6 text-4xl font-black text-white">
                                {sessionFinished ? 'Sesión finalizada' : gameState === 'won' ? 'Palabra resuelta' : 'Se cerró la partida'}
                            </h2>
                            <p className="mt-4 text-lg leading-7 text-zinc-300">
                                {sessionFinished
                                    ? 'La sesión del aula ya ha terminado. Puedes volver al dashboard o salir de esta pantalla.'
                                    : gameState === 'won'
                                    ? `Has descubierto la palabra ${content.word}.`
                                    : `La palabra correcta era ${content.word}.`}
                            </p>
                            <div className="mt-8 flex justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleExit}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                                >
                                    {sessionFinished ? 'Volver al dashboard' : 'Salir'}
                                </button>
                                {!sessionFinished ? (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/15 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Jugar otra vez
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}