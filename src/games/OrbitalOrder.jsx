import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Stars, Float, Sphere, Torus, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, RotateCcw, XCircle, AlertCircle, Info } from 'lucide-react';

const LEVEL_DATA = {
    title: "Sistema Solar de la Nutrición",
    core: "Nutrientes Esenciales",
    orbits: [
        { id: 0, name: "Macronutrientes", radius: 4.5, color: "#4ade80", speed: 0.5 },
        { id: 1, name: "Micronutrientes", radius: 7.5, color: "#60a5fa", speed: 0.3 },
        { id: 2, name: "Hidratación", radius: 10.5, color: "#c084fc", speed: 0.2 }
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

// Item Component
function ConceptNode({ item, status, targetOrbit, isSelected, onClick, onEjected }) {
    const meshRef = useRef();
    const trailRef = useRef();
    
    // Random initial offsets for chaotic movement
    const rOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const rSpeed = useMemo(() => (Math.random() - 0.5) * 2, []);
    const heightOffset = useMemo(() => (Math.random() - 0.5) * 4, []);
    const baseDistance = useMemo(() => 14 + Math.random() * 4, []);
    
    // Color logic
    const themeColor = useMemo(() => new THREE.Color(), []);
    const currentColor = useRef(new THREE.Color("#e4e4e7")); // default zinc
    
    // Track physics values
    const velocity = useRef(new THREE.Vector3());
    const ejectionTimer = useRef(0);

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
                // Move towards center-top waiting to be assigned
                targetX = 0;
                targetY = 5;
                targetZ = 0;
            }
            
            // Smooth lerp
            pos.x = THREE.MathUtils.lerp(pos.x, targetX, 0.05);
            pos.y = THREE.MathUtils.lerp(pos.y, targetY, 0.05);
            pos.z = THREE.MathUtils.lerp(pos.z, targetZ, 0.05);

        } else if (status === 'testing' && targetOrbit) {
            // Flying towards the orbit to test fit
            // Angle based on time so it hits the ring somewhere dynamically
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
            if (dist < 0.5) {
                if (targetOrbit.id === item.correctOrbit) {
                    onEjected(item.id, true, targetOrbit); // success
                } else {
                    // Set bounce direction (away from center)
                    const dir = new THREE.Vector3(pos.x, 0, pos.z).normalize();
                    velocity.current.copy(dir.multiplyScalar(0.8)); // explosive force outwards
                    velocity.current.y = 0.5 + Math.random() * 0.5; // fly upwards too
                    onEjected(item.id, false, null); // fail
                }
            }
            
        } else if (status === 'rejected') {
            // Physics bounce away from the system
            pos.add(velocity.current);
            velocity.current.y -= 0.02; // gravity effect
            velocity.current.multiplyScalar(0.98); // drag
            targetCol = "#ef4444"; // red
            
            ejectionTimer.current += delta;
            
            if (ejectionTimer.current > 2) {
                ejectionTimer.current = 0;
                onEjected(item.id, 'reset', null); // back to chaotic
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
        meshRef.current.material.color.copy(currentColor.current);
        // Emissive power
        meshRef.current.material.emissive.copy(currentColor.current);
        const emissiveIntensity = (status === 'orbiting' || isSelected || status === 'testing') ? 0.8 : 0.2;
        meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(meshRef.current.material.emissiveIntensity, emissiveIntensity, 0.1);
    });

    return (
        <group>
            {status !== 'orbiting' && status !== 'rejected' && (
                <Html position={[meshRef.current?.position.x || 0, (meshRef.current?.position.y || 0) + 1.2, meshRef.current?.position.z || 0]} center zIndexRange={[100, 0]}>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap transition-all duration-300 backdrop-blur-md
                        ${isSelected ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 scale-125' : 
                         status === 'testing' ? 'bg-orange-500/20 border-orange-400 text-orange-200' :
                        'bg-zinc-900/60 border-zinc-500 text-zinc-300'}
                    `}>
                        {item.text}
                    </div>
                </Html>
            )}
            
            {status === 'orbiting' && targetOrbit && (
                <Html position={[meshRef.current?.position.x || 0, (meshRef.current?.position.y || 0) + 1.2, meshRef.current?.position.z || 0]} center>
                     <div className="px-3 py-1 rounded-full text-xs font-bold border border-white/20 bg-black/40 text-white whitespace-nowrap backdrop-blur-md shadow-lg shadow-black/50">
                        {item.text}
                    </div>
                </Html>
            )}

            <Trail
                width={isSelected || status === 'testing' ? 2 : status === 'rejected' ? 5 : 0.5}
                color={currentColor.current}
                length={status === 'rejected' ? 20 : 10}
                decay={1}
                target={meshRef}
            />

            <Sphere
                ref={meshRef}
                args={[0.6, 32, 32]}
                onClick={(e) => {
                    e.stopPropagation();
                    if (status === 'chaotic') onClick(item.id);
                }}
                onPointerOver={() => {
                    if (status === 'chaotic') document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                }}
            >
                <meshStandardMaterial 
                    roughness={0.2} 
                    metalness={0.8} 
                    emissiveIntensity={0.5}
                />
            </Sphere>
            
            {status === 'orbiting' && (
                <Sparkles 
                    position={[meshRef.current?.position.x||0, meshRef.current?.position.y||0, meshRef.current?.position.z||0]} 
                    count={15} 
                    scale={2} 
                    color={targetOrbit?.color} 
                    speed={0.5} 
                    opacity={0.5} 
                />
            )}
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
                args={[orbit.radius, 0.05, 16, 100]}
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
    const [gameState, setGameState] = useState('playing'); // playing, won
    const [itemsState, setItemsState] = useState(
        LEVEL_DATA.items.map(item => ({
            ...item,
            status: 'chaotic', // chaotic, testing, rejected, orbiting
            targetOrbit: null
        }))
    );
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [score, setScore] = useState(0);
    const [errors, setErrors] = useState(0);

    const handleItemClick = (id) => {
        if (gameState !== 'playing') return;
        // Select an item to stage for orbit assignment
        if (selectedItemId === id) {
            setSelectedItemId(null); // deselect
        } else {
            setSelectedItemId(id);
        }
    };

    const handleOrbitSelect = (orbit) => {
        if (!selectedItemId) return;

        // Send item to test the orbit
        setItemsState(prev => prev.map(item => {
            if (item.id === selectedItemId) {
                return { ...item, status: 'testing', targetOrbit: orbit };
            }
            return item;
        }));
        setSelectedItemId(null);
    };

    const handleItemPhysicsResult = (itemId, success, orbitObj) => {
        if (success === 'reset') {
            // Ejection animation finished
            setItemsState(prev => prev.map(item => 
                item.id === itemId ? { ...item, status: 'chaotic', targetOrbit: null } : item
            ));
            return;
        }

        if (success) {
            setScore(s => s + 100);
            setItemsState(prev => {
                const newState = prev.map(item => 
                    item.id === itemId ? { ...item, status: 'orbiting', targetOrbit: orbitObj } : item
                );
                // Check if all are orbiting
                if (newState.every(i => i.status === 'orbiting')) {
                    setGameState('won');
                }
                return newState;
            });
        } else {
            setErrors(e => e + 1);
            setItemsState(prev => prev.map(item => 
                item.id === itemId ? { ...item, status: 'rejected', targetOrbit: null } : item
            ));
        }
    };

    const handleReset = () => {
        setItemsState(LEVEL_DATA.items.map(item => ({
            ...item,
            status: 'chaotic',
            targetOrbit: null
        })));
        setSelectedItemId(null);
        setScore(0);
        setErrors(0);
        setGameState('playing');
    };

    return (
        <div className="w-full h-screen relative bg-zinc-950 overflow-hidden font-sans">
            
            {/* Main 3D Canvas */}
            <div className="absolute inset-0 z-0 cursor-default">
                <Canvas camera={{ position: [0, 8, 20], fov: 60 }}>
                    <ambientLight intensity={0.2} />
                    <pointLight position={[0, 0, 0]} intensity={2} color="#fcd34d" distance={40} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <OrbitControls 
                        enablePan={false} 
                        minDistance={10} 
                        maxDistance={35} 
                        maxPolarAngle={Math.PI / 2 - 0.1} 
                        autoRotate={!selectedItemId && gameState === 'playing'}
                        autoRotateSpeed={0.5}
                    />

                    <Suspense fallback={null}>
                        {/* THE CORE */}
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                            <Sphere args={[2, 64, 64]} position={[0, 0, 0]}>
                                <meshStandardMaterial 
                                    color="#fbbf24" 
                                    emissive="#f59e0b" 
                                    emissiveIntensity={1.5} 
                                    roughness={0.1}
                                    metalness={0.5}
                                />
                            </Sphere>
                            <Sparkles count={50} scale={4} size={4} speed={0.4} color="#fde68a" />
                            <Html position={[0, 3, 0]} center>
                                <div className="px-5 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-yellow-500/50 text-yellow-300 font-extrabold text-lg whitespace-nowrap shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                    {LEVEL_DATA.core}
                                </div>
                            </Html>
                        </Float>

                        {/* RINGS */}
                        {LEVEL_DATA.orbits.map(orbit => (
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
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                        Orbital Order
                    </h1>
                    <p className="text-zinc-300 text-sm mb-4 leading-relaxed font-medium">
                        {LEVEL_DATA.title}
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 flex-1 text-center">
                            <p className="text-xs text-emerald-400 font-bold mb-1 uppercase tracking-wider">Aciertos</p>
                            <p className="text-xl font-bold text-emerald-300">{score}</p>
                        </div>
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex-1 text-center">
                            <p className="text-xs text-red-400 font-bold mb-1 uppercase tracking-wider">Fallos</p>
                            <p className="text-xl font-bold text-red-300">{errors}</p>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto bg-indigo-900/40 backdrop-blur-xl border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3">
                    <Info className="w-6 h-6 text-indigo-400" />
                    <p className="text-sm text-indigo-200 font-medium max-w-[200px]">
                        {!selectedItemId 
                            ? "Haz clic en un concepto flotante para seleccionarlo." 
                            : "Ahora haz clic en la órbita donde crees que pertenece."}
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
                            <h2 className="text-4xl font-black text-white mb-4">¡Sistema Estable!</h2>
                            <p className="text-zinc-400 mb-8 font-medium">Has ordenado correctamente todos los conceptos en sus jerarquías. El núcleo funciona perfectamente.</p>
                            <button
                                onClick={handleReset}
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
