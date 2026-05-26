import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Float, Sphere, Torus, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, RotateCcw, XCircle, AlertCircle, Info } from 'lucide-react';
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { GameExitButton, GameSessionFinishedOverlay, useGameSessionUi } from '@/games/shared/GameSessionActions';
import { useSessionGame } from '@/hooks/useSessionGame';

import { Planet01 } from '@/components/canvas3D/meshes/planets/Planet01';
import { Planet02 } from '@/components/canvas3D/meshes/planets/Planet02';
import { Planet03 } from '@/components/canvas3D/meshes/planets/Planet03';
import { Planet04 } from '@/components/canvas3D/meshes/planets/Planet04';
import { Planet05 } from '@/components/canvas3D/meshes/planets/Planet05';
import { Planet06 } from '@/components/canvas3D/meshes/planets/Planet06';
import { Planet07 } from '@/components/canvas3D/meshes/planets/Planet07';
import { Planet08 } from '@/components/canvas3D/meshes/planets/Planet08';
import { Planet09 } from '@/components/canvas3D/meshes/planets/Planet09';
import { Sun } from '@/components/canvas3D/meshes/environments/Sun';
import { BackgroundNebula } from '@/components/canvas3D/meshes/environments/BackgroundNebula';

const PLANET_MODELS = [
    Planet01, Planet02, Planet03, Planet04, Planet05, Planet06, Planet07, Planet08, Planet09
];

const DEFAULT_LEVEL_DATA = {
    title: "Sistema Solar de la Nutrición",
    core: "Nutrientes Esenciales",
    orbits: [
        { id: 0, name: "Macronutrientes", radius: 4.0, color: "#4ade80", speed: 0.5 },
        { id: 1, name: "Micronutrientes", radius: 7.0, color: "#60a5fa", speed: 0.3 },
        { id: 2, name: "Hidratación", radius: 10.0, color: "#c084fc", speed: 0.2 }
    ],
    items: [
        { id: "i1", text: "Proteínas", correctOrbit: 0 },
        { id: "i2", text: "Grasas", correctOrbit: 0 },
        { id: "i3", text: "Carbohidratos", correctOrbit: 0 },
        { id: "i4", text: "Vitaminas", correctOrbit: 1 },
        { id: "i5", text: "Minerales", correctOrbit: 1 },
        { id: "i6", text: "Agua", correctOrbit: 2 }
    ]
};

function resolveOrbitalContent(gameContent) {
    const fallbackOrbits = DEFAULT_LEVEL_DATA.orbits;
    const fallbackItems = DEFAULT_LEVEL_DATA.items;

    const orbits = Array.isArray(gameContent?.orbits) && gameContent.orbits.length > 0
        ? gameContent.orbits.map((orbit, index) => {
            let orbitId = orbit?.id;
            if (orbitId === undefined || orbitId === null) {
                orbitId = index;
            } else if (typeof orbitId === 'string' && orbitId.trim() === '') {
                orbitId = index;
            }
            return {
                id: orbitId,
                name: String(orbit?.name ?? `Órbita ${index + 1}`).trim() || `Órbita ${index + 1}`,
                radius: 10.0 + (index * 15.0),
                color: String(orbit?.color ?? fallbackOrbits[index]?.color ?? '#60a5fa'),
                speed: Number(orbit?.speed) > 0 ? Number(orbit.speed) : fallbackOrbits[index]?.speed ?? 0.25,
            };
        })
        : fallbackOrbits;

    const items = Array.isArray(gameContent?.items) && gameContent.items.length > 0
        ? gameContent.items.map((item, index) => {
            let correct = item?.correctOrbit;
            if (correct === undefined || correct === null) {
                correct = item?.correct_orbit;
            }
            if (correct === undefined || correct === null) {
                correct = 0;
            }
            return {
                id: String(item?.id ?? `item-${index + 1}`),
                text: String(item?.text ?? item?.name ?? `Concepto ${index + 1}`).trim() || `Concepto ${index + 1}`,
                correctOrbit: correct,
            };
        })
        : fallbackItems;

    return {
        title: String(gameContent?.title ?? DEFAULT_LEVEL_DATA.title),
        core: String(gameContent?.core ?? DEFAULT_LEVEL_DATA.core),
        orbits,
        items,
    };
}

function validateOrbitalContent(content) {
    if (!Array.isArray(content?.orbits) || content.orbits.length === 0) {
        return 'Orbital Order necesita al menos una órbita.';
    }

    if (!Array.isArray(content?.items) || content.items.length === 0) {
        return 'Orbital Order necesita al menos un concepto para ordenar.';
    }

    const invalidOrbit = content.orbits.find((orbit) => !orbit?.name || orbit?.id === undefined || orbit?.id === null || !Number.isFinite(Number(orbit?.radius)));
    if (invalidOrbit) {
        return 'Cada órbita debe tener nombre, ID y radio válido.';
    }

    const validOrbitIds = new Set(content.orbits.map((orbit) => String(orbit.id).trim()));
    const invalidItem = content.items.find((item) => !item?.text || !validOrbitIds.has(String(item.correctOrbit).trim()));
    if (invalidItem) {
        return 'Cada concepto debe tener texto y apuntar a una órbita existente.';
    }

    return '';
}

// Item Component
function ConceptNode({ item, status, targetOrbit, isSelected, onClick, onEjected }) {
    const meshRef = useRef();
    const trailRef = useRef();
    const auraRef = useRef();

    // Random initial offsets for chaotic movement
    const rOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const rSpeed = useMemo(() => (Math.random() - 0.5) * 2, []);
    const heightOffset = useMemo(() => (Math.random() - 0.5) * 4, []);
    // Distancia errante ajustada para que orbiten por fuera del último anillo
    const baseDistance = useMemo(() => 45 + Math.random() * 10, []);

    // Random planet model assignment
    const PlanetComponent = useMemo(() => {
        const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return PLANET_MODELS[hash % PLANET_MODELS.length];
    }, [item.id]);

    // Color logic
    const themeColor = useMemo(() => new THREE.Color(), []);
    const currentColor = useRef(new THREE.Color("#e4e4e7")); // default zinc

    // Track physics values
    const velocity = useRef(new THREE.Vector3());
    const ejectionTimer = useRef(0);

    useEffect(() => {
        if (status === 'chaotic') {
            velocity.current.set(0, 0, 0);
        }
    }, [status]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;
        const pos = meshRef.current.position;

        // Determine target position based on state
        let targetX = pos.x;
        let targetY = pos.y;
        let targetZ = pos.z;
        let targetScale = 1;
        let targetCol = "#e4e4e7";

        if (status === 'chaotic') {
            // Roaming far outside
            const t = time * 0.2 * rSpeed + rOffset;
            targetX = Math.cos(t) * baseDistance;
            targetZ = Math.sin(t) * baseDistance;
            targetY = Math.sin(time + rOffset) * 2 + heightOffset;
            targetCol = isSelected ? "#facc15" : "#a1a1aa";
            targetScale = isSelected ? 1.4 : 1;

            if (isSelected) {
                // Posicionar a la derecha relativa a donde mira la cámara
                const rightVec = new THREE.Vector3(1, 0, 0);
                rightVec.applyQuaternion(state.camera.quaternion);
                rightVec.y = 0; // mantener en plano XZ
                rightVec.normalize();

                // Asegurar que el planeta se acerque pero quede fuera de los anillos
                const distToRight = 50;
                targetX = rightVec.x * distToRight;
                targetY = 0;
                targetZ = rightVec.z * distToRight;
            }

            // Smooth lerp
            pos.x = THREE.MathUtils.lerp(pos.x, targetX, 0.05);
            pos.y = THREE.MathUtils.lerp(pos.y, targetY, 0.05);
            pos.z = THREE.MathUtils.lerp(pos.z, targetZ, 0.05);

        } else if (status === 'testing' && targetOrbit) {
            // Flying towards the orbit to test fit
            const angle = time * targetOrbit.speed + rOffset;
            targetX = Math.cos(angle) * targetOrbit.radius;
            targetY = 0;
            targetZ = Math.sin(angle) * targetOrbit.radius;

            pos.x = THREE.MathUtils.lerp(pos.x, targetX, 0.1);
            pos.y = THREE.MathUtils.lerp(pos.y, targetY, 0.1);
            pos.z = THREE.MathUtils.lerp(pos.z, targetZ, 0.1);
            targetCol = "#facc15"; // yellow testing

            // Distance check
            const dist = pos.distanceTo(new THREE.Vector3(targetX, targetY, targetZ));
            if (dist < 2.5) {
                onEjected(item.id, 'placed', targetOrbit);
            }

        } else if (status === 'rejected') {
            ejectionTimer.current += delta;

            // Set initial outward push velocity on the first frame of rejection
            if (velocity.current.lengthSq() === 0) {
                // Direction pointing away from the center of the solar system
                const dir = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
                // Apply a strong outward velocity
                velocity.current.copy(dir).multiplyScalar(22);
            }

            // Decaying bounce velocity
            velocity.current.multiplyScalar(0.92);

            // Move position by velocity
            pos.addScaledVector(velocity.current, delta);

            // Gently pull the planet back to its chaotic target over time
            const t = time * 0.2 * rSpeed + rOffset;
            targetX = Math.cos(t) * baseDistance;
            targetZ = Math.sin(t) * baseDistance;
            targetY = Math.sin(time + rOffset) * 2 + heightOffset;

            const lerpFactor = Math.min(1, ejectionTimer.current / 2.0);
            pos.x = THREE.MathUtils.lerp(pos.x, targetX, 0.03 * lerpFactor);
            pos.y = THREE.MathUtils.lerp(pos.y, targetY, 0.03 * lerpFactor);
            pos.z = THREE.MathUtils.lerp(pos.z, targetZ, 0.03 * lerpFactor);
            
            targetCol = "#ef4444"; // keep red to indicate failure

            if (ejectionTimer.current > 2.2) {
                ejectionTimer.current = 0;
                velocity.current.set(0, 0, 0);
                onEjected(item.id, 'reset', null);
            }

        } else if (status === 'orbiting' && targetOrbit) {
            // Harmonious Orbit!
            const t = time * targetOrbit.speed + rOffset;
            targetX = Math.cos(t) * targetOrbit.radius;
            targetZ = Math.sin(t) * targetOrbit.radius;
            targetY = Math.sin(t * 3) * 0.5; // slight bobbing in orbit

            pos.x = THREE.MathUtils.lerp(pos.x, targetX, 0.1);
            pos.y = THREE.MathUtils.lerp(pos.y, targetY, 0.1);
            pos.z = THREE.MathUtils.lerp(pos.z, targetZ, 0.1);
            targetCol = targetOrbit.color;
            targetScale = 1.2;
        }

        // Apply scale
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Apply color transition smoothly
        themeColor.set(targetCol);
        currentColor.current.lerp(themeColor, 0.1);

        if (auraRef.current) {
            auraRef.current.material.color.copy(currentColor.current);
            auraRef.current.material.emissive.copy(currentColor.current);
            const emissiveIntensity = (status === 'orbiting' || isSelected || status === 'testing') ? 0.8 : 0.1;
            auraRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(auraRef.current.material.emissiveIntensity, emissiveIntensity, 0.1);
        }
    });

    return (
        <group>

            <Trail
                width={isSelected || status === 'testing' ? 2 : status === 'rejected' ? 5 : 0.5}
                color={currentColor.current}
                length={status === 'rejected' ? 20 : 10}
                decay={1}
                target={meshRef}
            />

            <group
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    if (status === 'chaotic') onClick(item.id);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (status === 'orbiting') {
                        onEjected(item.id, 'reset', null);
                    }
                }}
                onPointerOver={() => {
                    if (status === 'chaotic' || status === 'orbiting') document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                }}
            >
                {/* 3D Pixel Planet Component */}
                <group scale={0.7}>
                    <PlanetComponent />
                </group>

                {/* Energy Aura / Shield representing the item's state */}
                <Sphere ref={auraRef} args={[0.75, 32, 32]}>
                    <meshStandardMaterial
                        transparent
                        opacity={0.35}
                        roughness={0.2}
                        metalness={0.8}
                        depthWrite={false}
                    />
                </Sphere>

                {/* Always floating labels */}
                {status !== 'rejected' && (
                    <Html position={[0, 4.0, 0]} center zIndexRange={[100, 0]}>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap transition-all duration-300 backdrop-blur-md
                            ${status === 'orbiting' ? 'border-white/20 bg-black/40 text-white shadow-lg shadow-black/50' :
                                isSelected ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 scale-125' :
                                    status === 'testing' ? 'bg-orange-500/20 border-orange-400 text-orange-200' :
                                        'bg-zinc-900/60 border-zinc-500 text-zinc-300'}
                        `}>
                            {item.text}
                        </div>
                    </Html>
                )}
            </group>


        </group>
    );
}

// Orbit Ring Component
function OrbitRing({ orbit, isTargeted, isHovered, onSelect }) {
    const ringRef = useRef();

    useFrame((state) => {
        if (!ringRef.current) return;
        ringRef.current.rotation.x = Math.PI / 2;
        // Slowly spin orbit ring visually
        ringRef.current.rotation.z -= 0.001 * orbit.speed;
    });

    return (
        <group>
            {/* Visual Torus */}
            <Torus
                ref={ringRef}
                args={[orbit.radius, 0.25, 16, 100]}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isHovered) onSelect(orbit);
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    if (isTargeted) document.body.style.cursor = 'crosshair';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                }}
            >
                <meshStandardMaterial
                    color={isHovered ? "#facc15" : orbit.color}
                    emissive={isHovered ? "#facc15" : orbit.color}
                    emissiveIntensity={isHovered ? 1.5 : 0.4}
                    transparent
                    opacity={isHovered ? 0.8 : 0.3}
                />
            </Torus>

            {/* Orbit Label */}
            <Html position={[orbit.radius, 0, 0]} center>
                <div
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors duration-300 whitespace-nowrap cursor-pointer hover:scale-110`}
                    style={{
                        borderColor: orbit.color,
                        color: orbit.color,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        opacity: isTargeted ? 1 : 0.6
                    }}
                    onClick={(e) => {
                        if (isTargeted) onSelect(orbit);
                    }}
                >
                    Órbita: {orbit.name}
                </div>
            </Html>
        </group>
    );
}


export default function OrbitalOrder() {
    const {
        session,
        sessionId,
        content,
        participant,
        isLoading,
        error,
        setError,
    } = useSessionGame({
        resolveContent: resolveOrbitalContent,
        validateContent: validateOrbitalContent,
    });
    const { sessionFinished, handleExit, exitLabel, finishActionLabel } = useGameSessionUi({ session, sessionId, isPreview: false });
        const [gameState, setGameState] = useState('playing'); // playing, won
    const [itemsState, setItemsState] = useState(
        content.items.map(item => ({
            ...item,
            status: 'chaotic', // chaotic, testing, rejected, orbiting
            targetOrbit: null
        }))
    );
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [startedAt, setStartedAt] = useState(() => Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const resolvingItemsRef = useRef(new Set());

    useEffect(() => {
        setItemsState(content.items.map((item) => ({
            ...item,
            status: 'chaotic',
            targetOrbit: null,
        })));
        setSelectedItemId(null);
        setGameState('playing');
        setStartedAt(Date.now());
        setError('');
        resolvingItemsRef.current.clear();
    }, [content, setError]);

    if (isLoading) {
        return <GameLoadingState title="Cargando Orbital Order..." />;
    }

    if (error) {
        return <GameErrorState title="No se pudo cargar Orbital Order" message={error} />;
    }

    const handleItemClick = (id) => {
        if (sessionFinished || gameState !== 'playing') return;
        // Select an item to stage for orbit assignment
        if (selectedItemId === id) {
            setSelectedItemId(null); // deselect
        } else {
            setSelectedItemId(id);
        }
    };

    const handleOrbitSelect = (orbit) => {
        if (sessionFinished) return;
        if (!selectedItemId) return;
        setError('');

        // Send item to test the orbit
        setItemsState(prev => prev.map(item => {
            if (item.id === selectedItemId) {
                return { ...item, status: 'testing', targetOrbit: orbit };
            }
            return item;
        }));
        setSelectedItemId(null);
    };

    const handleItemPhysicsResult = async (itemId, success, orbitObj) => {
        if (success === 'reset') {
            // Ejection animation finished
            setItemsState(prev => prev.map(item =>
                item.id === itemId ? { ...item, status: 'chaotic', targetOrbit: null } : item
            ));
            resolvingItemsRef.current.delete(itemId);
            return;
        }

        if (success === 'placed') {
            // Placed into orbit (before verification)
            setItemsState(prev => prev.map(item =>
                item.id === itemId ? { ...item, status: 'orbiting', targetOrbit: orbitObj } : item
            ));
            resolvingItemsRef.current.delete(itemId);
            return;
        }
    };

    const handleVerify = () => {
        if (sessionFinished || gameState !== 'playing') return;
        setError('');

        const orbitingItems = itemsState.filter(item => item.status === 'orbiting');
        if (orbitingItems.length === 0) {
            return;
        }

        // We check all orbiting items
        const results = orbitingItems.map(item => {
            const isCorrect = String(item.targetOrbit.id).trim() === String(item.correctOrbit).trim();
            return {
                itemId: item.id,
                isCorrect,
                orbitObj: item.targetOrbit
            };
        });

        // Determine if game is fully won (i.e. all level items are in their correct orbits)
        const totalItemsCount = content.items.length;
        const correctCount = results.filter(r => r.isCorrect).length;
        const isFullyWon = correctCount === totalItemsCount;

        // Submit verified answers to the backend in background
        if (sessionId) {
            Promise.all(results.map(r => 
                sessionAPI.submitAnswer(sessionId, {
                    question_id: r.itemId,
                    answer: r.isCorrect ? r.orbitObj.id : null,
                    device_id: participant.deviceId,
                    player_name: participant.playerName,
                    player_number: 1,
                    elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
                    completed: isFullyWon,
                })
            )).catch(err => {
                console.error("Error submitting answer in background:", err);
            });
        }

        // Apply physical changes to state
        setItemsState(prev => {
            const newState = prev.map(item => {
                const verificationResult = results.find(r => r.itemId === item.id);
                if (verificationResult) {
                    if (verificationResult.isCorrect) {
                        // Stays orbiting
                        return item;
                    } else {
                        // Bounces off!
                        return { ...item, status: 'rejected', targetOrbit: null };
                    }
                }
                return item;
            });

            // Check if game is won (all items orbiting and correct)
            if (newState.every(i => i.status === 'orbiting')) {
                setGameState('won');
            }
            return newState;
        });
    };

    const handleReset = () => {
        setItemsState(content.items.map(item => ({
            ...item,
            status: 'chaotic',
            targetOrbit: null
        })));
        setSelectedItemId(null);
        setGameState('playing');
        setStartedAt(Date.now());
        setError('');
        resolvingItemsRef.current.clear();
    };

    return (
        <div className="w-full h-screen relative bg-zinc-950 overflow-hidden font-sans">
            <GameExitButton onExit={handleExit} label={exitLabel} />
            <GameSessionFinishedOverlay visible={sessionFinished} onExit={handleExit} actionLabel={finishActionLabel} />

            {/* Main 3D Canvas */}
            <div className="absolute inset-0 z-0 cursor-default">
                <Canvas camera={{ position: [0, 8, 20], fov: 60 }}>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[0, 0, 0]} intensity={3} color="#fcd34d" distance={60} />

                    {/* Background */}
                    <Suspense fallback={null}>
                        <group scale={80}>
                            <BackgroundNebula />
                        </group>
                    </Suspense>

                    <OrbitControls
                        enablePan={false}
                        minDistance={10}
                        maxDistance={100}
                        maxPolarAngle={Math.PI / 2 - 0.1}
                        autoRotate={!selectedItemId && gameState === 'playing'}
                        autoRotateSpeed={0.5}
                    />

                    <Suspense fallback={null}>
                        {/* THE CORE */}
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                            <group scale={0.0030}>
                                <Sun />
                            </group>

                            {/* Corona / Glow effects */}
                            <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
                                <meshBasicMaterial
                                    color="#fbbf24"
                                    transparent
                                    opacity={0.6}
                                    blending={THREE.AdditiveBlending}
                                    depthWrite={false}
                                />
                            </Sphere>
                            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
                                <meshBasicMaterial
                                    color="#f59e0b"
                                    transparent
                                    opacity={0.3}
                                    blending={THREE.AdditiveBlending}
                                    depthWrite={false}
                                />
                            </Sphere>
                            <Sphere args={[2.0, 32, 32]} position={[0, 0, 0]}>
                                <meshBasicMaterial
                                    color="#ea580c"
                                    transparent
                                    opacity={0.25}
                                    blending={THREE.AdditiveBlending}
                                    depthWrite={false}
                                />
                            </Sphere>
                            <Html position={[0, 5, 0]} center>
                                <div className="px-5 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-yellow-500/50 text-yellow-300 font-extrabold text-lg whitespace-nowrap shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                    {content.core}
                                </div>
                            </Html>
                        </Float>

                        {/* RINGS */}
                        {content.orbits.map(orbit => (
                            <OrbitRing
                                key={orbit.id}
                                orbit={orbit}
                                isTargeted={!!selectedItemId}
                                isHovered={!!selectedItemId} // Since we can't easily hover raycasts without messy state, we make them all look 'ready' when an item is selected
                                onSelect={handleOrbitSelect}
                            />
                        ))}

                        {/* CONCEPTS */}
                        {itemsState.map(item => (
                            <ConceptNode
                                key={item.id}
                                item={item}
                                status={item.status}
                                targetOrbit={item.targetOrbit}
                                isSelected={selectedItemId === item.id}
                                onClick={handleItemClick}
                                onEjected={handleItemPhysicsResult}
                            />
                        ))}

                    </Suspense>
                </Canvas>
            </div>

            {/* 2D UI Overlay */}
            <div className="absolute top-0 left-0 w-full p-8 p-pointer-events-none z-10 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl max-w-sm">
                    <h1 className="text-3xl font-black font-['Orbitron'] text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400 mb-2">
                        Orbital Order
                    </h1>
                    <p className="text-zinc-300 text-sm mb-4 leading-relaxed font-medium">
                        {content.title}
                    </p>
                    <button
                        onClick={handleVerify}
                        className="w-full py-4 mt-2 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 border shadow-lg font-['Orbitron'] bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400 cursor-pointer hover:shadow-cyan-500/25 hover:scale-[1.02]"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Verificar Sistema
                    </button>

                    {error ? (
                        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                            {error}
                        </div>
                    ) : null}
                </div>

                <div className="pointer-events-auto bg-indigo-900/40 backdrop-blur-xl border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3">
                    <Info className="w-6 h-6 text-indigo-400" />
                    <p className="text-sm text-indigo-200 font-medium max-w-50">
                        {isSubmitting
                            ? 'Guardando resultado en la sesion...'
                            : !selectedItemId
                                ? 'Haz clic en un concepto flotante para seleccionarlo.'
                                : 'Ahora haz clic en la orbita donde crees que pertenece.'}
                    </p>
                </div>
            </div>

            {/* Win Display */}
            <AnimatePresence>
                {gameState === 'won' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-zinc-900 border border-emerald-500/50 p-10 rounded-3xl shadow-2xl text-center max-w-md">
                            <div className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                            </div>
                            <h2 className="text-4xl font-black font-['Orbitron'] text-white mb-4">¡Sistema Estable!</h2>
                            <p className="text-zinc-400 mb-8 font-medium">Has ordenado correctamente todos los conceptos en sus jerarquías. El núcleo funciona perfectamente.</p>
                            <button
                                onClick={handleReset}
                                disabled={sessionFinished}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" /> Restaurar Sistema
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
