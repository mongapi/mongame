import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, FastForward, Play, ShieldAlert } from 'lucide-react';

const TIMELINES = [
    {
        id: 'timeline-1',
        title: 'Evolución de la Computación',
        items: [
            { id: 't1-1', text: 'Invención del Ábaco', date: 'Antigüedad', info: 'Considerado el primer instrumento de cálculo en la prehistoria, permitía realizar operaciones matemáticas básicas desplazando cuentas a lo largo de varillas.', question: '¿Qué operación mecánica principal facilita el ábaco?', options: ['Desplazar cuentas manuales', 'Rotar engranajes de metal', 'Leer tarjetas perforadas'], correct: 0 },
            { id: 't1-2', text: 'Máquina Analítica', date: '1837', info: 'Diseñada por Charles Babbage, fue el primer concepto de un computador moderno de propósito general, programable mediante tarjetas perforadas.', question: '¿Quién es reconocida como la primera programadora por su trabajo en esto?', options: ['Marie Curie', 'Ada Lovelace', 'Grace Hopper'], correct: 1 },
            { id: 't1-3', text: 'Máquina de Turing', date: '1936', info: 'Un modelo matemático propuesto por Alan Turing que unificó y sentó las bases lógicas y teóricas indudables de la computación y los algoritmos.', question: 'La máquina de Turing demostró teóricamente que...', options: ['Cualquier problema matemático se puede resolver', 'Existen límites a lo que puede ser computado', 'El código binario es la única forma de procesar'], correct: 1 },
            { id: 't1-4', text: 'ENIAC', date: '1945', info: 'La primera computadora electrónica real de propósito general. Ocupaba una habitación enorme entera y consumía una cantidad inmensa de energía.', question: '¿Qué tecnología de hardware usaba predominantemente la ENIAC?', options: ['Microchips de silicio', 'Tubos de vacío (Válvulas)', 'Transistores cuánticos'], correct: 1 },
            { id: 't1-5', text: 'Microprocesador', date: '1971', info: 'El primer microprocesador comercial (Intel 4004). Integraba las funciones principales de toda una computadora en un solo chip muy pequeño.', question: 'La invención del microprocesador fue directamente responsable de...', options: ['La computación en la nube', 'Las redes sociales', 'Las computadoras personales (PC)'], correct: 2 },
            { id: 't1-6', text: 'World Wide Web', date: '1989', info: 'Tim Berners-Lee propuso un complejo sistema de gestión de información descentralizada por hipertexto, creando la web.', question: '¿Qué protocolo subyacente se utiliza principalmente para navegar por la web?', options: ['HTTP / HTTPS', 'SMTP', 'FTP'], correct: 0 },
        ]
    },
    {
        id: 'timeline-2',
        title: 'Desarrollo de Lenguajes',
        items: [
            { id: 't2-1', text: 'Lenguaje Assembly', date: 'Años 40s', info: 'El lenguaje ensamblador permitió escribir instrucciones en mnemónicos legibles en vez del puro e intratable código máquina binario.', question: '¿Qué característica define al lenguaje Assembly en relación al hardware?', options: ['Es independiente de la arquitectura', 'Es un lenguaje de alto nivel', 'Está ligado a la arquitectura específica del procesador'], correct: 2 },
            { id: 't2-2', text: 'Creación de FORTRAN', date: '1957', info: 'Desarrollado en la emblemática IBM, fue uno de los primerísimos lenguajes de programación de alto nivel que alcanzó éxito comercial masivo.', question: '¿Para qué ámbito aplicativo fue especializado principalmente FORTRAN?', options: ['Diseño gráfico web', 'Cálculos científicos y de pura ingeniería', 'Bases de datos comerciales'], correct: 1 },
            { id: 't2-3', text: 'Lenguaje C', date: '1972', info: 'Lenguaje base, monumental y fundamental que permitió construir el mismísimo sistema operativo UNIX.', question: '¿Quién es el legendario creador del lenguaje C?', options: ['Dennis Ritchie', 'Bjarne Stroustrup', 'James Gosling'], correct: 0 },
            { id: 't2-4', text: 'C++ y la Programación Orientada a Objetos', date: '1985', info: 'Una extensión revolucionaria del lenguaje C que añadió soporte robusto a la programación orientada a objetos (POO).', question: '¿Qué concepto clave introduce la POO fuertemente en C++?', options: ['Clases y Herencia', 'Variables Globales Inmutables', 'Punteros Aritméticos'], correct: 0 },
            { id: 't2-5', text: 'Lanzamiento de Java', date: '1995', info: 'Prometía "Escribir una vez, ejecutar en cualquier lugar", marcando a toda una industria global de software.', question: '¿Qué componente es totalmente esencial para la portabilidad única de Java?', options: ['El compilador GCC', 'Java Virtual Machine (JVM)', 'Navegador Web Dedicado'], correct: 1 },
            { id: 't2-6', text: 'Nacimiento de JavaScript (JS)', date: '1995', info: 'Creado frenéticamente en 10 días por Brendan Eich para Netscape. Inicialmente simple, hoy domina absolutamente la web mundial.', question: '¿Dónde se ejecuta nativamente y por defecto el JavaScript clásico?', options: ['En el servidor de base de datos', 'En el navegador web', 'En la tarjeta gráfica (GPU)'], correct: 1 }
        ]
    }
];

// Reutilizamos Particles y GridTunnel en la escena principal
function Particles({ speedMulti }) {
    const count = 1200;
    const { camera } = useThree();
    const meshRef = useRef();

    const particles = useMemo(() => {
        const p = new Float32Array(count * 3);
        const zArr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100;
            p[i * 3 + 1] = (Math.random() - 0.5) * 100;
            const startZ = Math.random() * -450;
            p[i * 3 + 2] = startZ;
            zArr[i] = startZ;
        }
        return { positions: p, zArr };
    }, [count]);

    useFrame(() => {
        if (!meshRef.current) return;
        const camZ = camera.position.z;
        const positions = meshRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            let relativeZ = (particles.zArr[i] - camZ) % 450;
            if (relativeZ > 0) relativeZ -= 450;
            positions[i * 3 + 2] = camZ + relativeZ;
        }
        meshRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#a5b4fc" size={0.65} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    );
}

function GridTunnel({ isFail }) {
    const { camera } = useThree();
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            const camZ = camera.position.z;
            const offset = camZ % 50;
            groupRef.current.position.z = camZ - offset;
            groupRef.current.rotation.z += delta * 0.15;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[30, 30, 300, 24, 60, true]} />
                <meshBasicMaterial
                    color={isFail ? "#f87171" : "#4f46e5"}
                    wireframe={true}
                    transparent
                    opacity={isFail ? 0.3 : 0.15}
                />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[22, 22, 300, 16, 40, true]} />
                <meshBasicMaterial
                    color={isFail ? "#ef4444" : "#818cf8"}
                    wireframe={true}
                    transparent
                    opacity={0.08}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

function Hito({ data, idx, isCurrent, isSolved, onSelect }) {
    const zPos = -idx * 150;
    // Intercalar entre izquierda y derecha del túnel (e.g. x = -10 o x = 10)
    const xPos = idx % 2 === 0 ? -12 : 12;
    // Rotar el texto/hitos ligeramente hacia el centro
    const yRotation = idx % 2 === 0 ? 0.3 : -0.3;

    const groupRef = useRef();

    useFrame(() => {
        if (groupRef.current) groupRef.current.rotation.y += 0.005;
    });

    return (
        <group position={[xPos, 0, zPos]} rotation={[0, yRotation, 0]}>
            <Float floatIntensity={1.5} speed={2} rotationIntensity={0.2}>
                <mesh 
                    ref={groupRef} 
                    position={[0, 1, 0]} 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isSolved) onSelect(idx); 
                    }}
                    onPointerOver={() => document.body.style.cursor = isSolved ? 'default' : 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'default'}
                >
                    {/* Cristal Exterior */}
                    <octahedronGeometry args={[3.5, 0]} />
                    <meshStandardMaterial
                        color={isSolved ? "#3f3f46" : isCurrent ? "#10b981" : "#8b5cf6"}
                        wireframe={true}
                        emissive={isSolved ? "#18181b" : isCurrent ? "#10b981" : "#c084fc"}
                        emissiveIntensity={isSolved ? 0.1 : 0.6}
                    />
                    {/* Núcleo Interior */}
                    <mesh>
                        <icosahedronGeometry args={[1.5, 1]} />
                        <meshBasicMaterial color={isSolved ? "#52525b" : "#ffffff"} />
                    </mesh>
                </mesh>
            </Float>
            <Text
                position={[0, -4.5, 0]}
                fontSize={3}
                color={isSolved ? "#52525b" : isCurrent ? "#34d399" : "#e4e4e7"}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.2}
                outlineColor="#000000"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf"
            >
                {data.date}
            </Text>
            {isSolved && (
                <Text position={[0, 4.5, 0]} fontSize={2} color="#10b981">
                    [COMPLETADO]
                </Text>
            )}
        </group>
    );
}

const MainScene = ({ gameState, setGameState, isFail, timeline, solvedHitos, currentHito, movementZ, setMovementZ, handleSelectNode }) => {
    const { camera } = useThree();

    // Ref to hold keyboard state
    const keys = useRef({ forward: false, backward: false, left: false, right: false });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.current.forward = true;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.current.backward = true;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = true;
        };
        const handleKeyUp = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.current.forward = false;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.current.backward = false;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (gameState === 'START') {
            camera.position.set(0, 0, 80); // Reiniciar al inicio de la línea
            setMovementZ(80);
        }
    }, [gameState, camera, setMovementZ]);

    useFrame((state, delta) => {
        const dt = Math.min(delta, 0.1);

        // Si estamos explorando, usamos los controles de movimiento
        if (gameState === 'EXPLORING') {
            const speed = 80; // Velocidad de movimiento normal
            const sideSpeed = 50;

            if (keys.current.forward) {
                setMovementZ(prev => prev - speed * dt);
            }
            if (keys.current.backward) {
                setMovementZ(prev => Math.min(prev + speed * dt, 80)); // Limit backwards movement
            }
            
            // Side movement
            if (keys.current.left) {
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, -8, dt * 5);
            } else if (keys.current.right) {
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, 8, dt * 5);
            } else {
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, dt * 5);
            }
            
            camera.position.z = movementZ;
        }

        // Tremor / Jitter effects based on state
        if (gameState === 'BOOST') {
            // Un pequeño efecto de boost al fallar o acertar si se desea
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, (Math.random() - 0.5) * 2.0, 0.2);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, (Math.random() - 0.5) * 2.0, 0.2);
            camera.fov = THREE.MathUtils.lerp(camera.fov, 110, 0.05);
        } else {
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(state.clock.elapsedTime * 2.5) * 0.8 + (keys.current.left ? -8 : keys.current.right ? 8 : 0), 0.1);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, Math.cos(state.clock.elapsedTime * 1.8) * 0.8, 0.1);
            camera.fov = THREE.MathUtils.lerp(camera.fov, 65, 0.1);
        }
        camera.updateProjectionMatrix();
    });

    return (
        <>
            <fogExp2 attach="fog" args={[isFail ? '#450a0a' : '#09090b', isFail ? 0.03 : 0.012]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 0, camera.position.z]} intensity={3} distance={250} color={isFail ? '#ef4444' : '#818cf8'} />

            <GridTunnel isFail={isFail} />
            <Particles speedMulti={gameState === 'BOOST' ? 5 : 1} />

            {timeline.items.map((item, idx) => (
                <Hito
                    key={item.id}
                    data={item}
                    idx={idx}
                    isCurrent={currentHito === idx}
                    isSolved={solvedHitos.includes(item.id)}
                    onSelect={() => handleSelectNode(idx)}
                />
            ))}
        </>
    );
}

export default function OrdenarCronologias() {
    const [currentLevel, setCurrentLevel] = useState(0);
    // START, EXPLORING, QUESTION, END
    const [gameState, setGameState] = useState('START'); 
    const [currentHito, setCurrentHito] = useState(null);
    const [solvedHitos, setSolvedHitos] = useState([]);
    const [isFail, setIsFail] = useState(false);
    const [movementZ, setMovementZ] = useState(80); // Start position

    const timeline = TIMELINES[currentLevel];
    const currentHitoData = currentHito !== null ? timeline.items[currentHito] : null;

    const handleAnswer = (optionIdx) => {
        if (!currentHitoData) return;

        if (optionIdx === currentHitoData.correct) {
            setIsFail(false);
            const newSolved = [...solvedHitos, currentHitoData.id];
            setSolvedHitos(newSolved);
            
            if (newSolved.length === timeline.items.length) {
                setGameState('END');
            } else {
                setGameState('EXPLORING');
            }
            setCurrentHito(null);
        } else {
            setIsFail(true);
            setTimeout(() => setIsFail(false), 2000);
        }
    };

    const handleSelectNode = (idx) => {
        // Only allow selecting if we are exploring and it's not already solved
        if (gameState === 'EXPLORING' && !solvedHitos.includes(timeline.items[idx].id)) {
            setCurrentHito(idx);
            setGameState('QUESTION');
        }
    };

    const resetGame = () => {
        if (currentLevel < TIMELINES.length - 1) {
            setCurrentLevel(prev => prev + 1);
        } else {
            setCurrentLevel(0);
        }
        setCurrentHito(null);
        setSolvedHitos([]);
        setGameState('START');
        setMovementZ(80);
    };

    return (
        <div className="w-full h-screen relative bg-zinc-950 font-sans overflow-hidden fade-in select-none">
            {/* Lienzo WebGL / Three.js */}
            <Canvas camera={{ position: [0, 0, 80], fov: 65 }} className="absolute inset-0">
                <color attach="background" args={['#09090b']} />
                <MainScene
                    gameState={gameState}
                    currentHito={currentHito}
                    setGameState={setGameState}
                    isFail={isFail}
                    timeline={timeline}
                    solvedHitos={solvedHitos}
                    movementZ={movementZ}
                    setMovementZ={setMovementZ}
                    handleSelectNode={handleSelectNode}
                />
            </Canvas>

            {/* Capa de Interfaz y HUD HTML (Superpuesta) */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-center overflow-auto mix-blend-normal">

                {/* Indicador de Nivel Superior (HUD) */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none opacity-80">
                    <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1">Módulo Temporal</p>
                        <h1 className="text-xl font-bold text-white tracking-tight">{timeline.title}</h1>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Pantalla Inicial */}
                    {gameState === 'START' && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                            className="bg-black/70 p-10 md:p-14 rounded-[2.5rem] backdrop-blur-xl border border-white/10 text-center pointer-events-auto shadow-[0_0_80px_rgba(79,70,229,0.2)] max-w-2xl mx-4"
                        >
                            <ShieldAlert className="w-24 h-24 text-indigo-500 mx-auto mb-8 animate-pulse drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase line-clamp-2 md:line-clamp-none">
                                Anomalía Temporal
                            </h1>
                            <p className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed font-medium">
                                Usando las teclas <strong>W/S</strong> o las <strong>Flechas Arriba/Abajo</strong> y navega por el túnel cuántico. Haz clic en los hitos flotantes que encuentres a los lados y responde correctamente a los desafíos para estabilizar el flujo de <strong>{timeline.title}</strong>.
                            </p>
                            <button
                                onClick={() => setGameState('EXPLORING')}
                                className="group flex items-center justify-center gap-3 mx-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-full font-extrabold text-xl md:text-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] cursor-pointer"
                            >
                                <Play className="fill-current w-7 h-7 group-hover:translate-x-1 transition-transform" /> Iniciar Salto
                            </button>
                        </motion.div>
                    )}

                    {/* Checkpoint / Pregunta */}
                    {gameState === 'QUESTION' && currentHitoData && (
                        <motion.div
                            key={`hito-${currentHitoData.id}`}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                            className="pointer-events-auto w-full max-w-4xl p-4 md:p-8 flex flex-col justify-center items-center mt-20"
                        >
                            <div className={`w-full bg-zinc-900/90 border-t-[6px] ${isFail ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.3)]' : 'border-indigo-500 shadow-[0_0_60px_rgba(79,70,229,0.3)]'} p-8 md:p-12 rounded-[2.5rem] backdrop-blur-3xl transition-all duration-300 relative`}>
                                
                                <button 
                                    onClick={() => { setGameState('EXPLORING'); setCurrentHito(null); }}
                                    className="absolute top-6 right-6 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                                >
                                    ✕
                                </button>

                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                                    <div className="inline-block px-5 py-2 rounded-full bg-indigo-500/10 text-indigo-400 font-bold font-mono tracking-widest text-sm border border-indigo-500/20 shadow-inner w-max">
                                        ÉPOCA: {currentHitoData.date}
                                    </div>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                                    {currentHitoData.text}
                                </h2>

                                <p className="text-zinc-300 text-xl mb-10 leading-relaxed font-medium">
                                    {currentHitoData.info}
                                </p>

                                <div className="bg-black/50 rounded-3xl p-6 md:p-8 border border-white/5 space-y-6 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent left-0"></div>
                                    <h3 className="text-2xl font-extrabold text-emerald-400 flex items-center gap-3">
                                        <CheckCircle2 className="w-7 h-7" /> Protocolo de Paso:
                                    </h3>
                                    <p className="text-white text-xl font-semibold mb-2">{currentHitoData.question}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-6">
                                        {currentHitoData.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                className={`w-full text-left p-5 rounded-2xl font-bold text-lg md:text-xl transition-all duration-200 outline-none
                                                   bg-zinc-800/80 hover:bg-indigo-600 text-zinc-100 hover:text-white
                                                   border border-white/5 hover:border-indigo-400 focus:ring-4 focus:ring-indigo-500/50 hover:-translate-y-1 hover:shadow-xl current
                                               `}
                                            >
                                                <span className="opacity-50 mr-4 font-mono text-base bg-black/30 px-3 py-1 rounded-lg">[{i + 1}]</span>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isFail && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-center flex items-center justify-center gap-3 font-mono text-lg animate-pulse">
                                                <AlertTriangle className="w-6 h-6" /> ¡Paradoja Detectada! Acceso denegado.
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* Victoria Final */}
                    {gameState === 'END' && (
                        <motion.div
                            key="end"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-black/80 w-full h-full flex flex-col justify-center items-center pointer-events-auto backdrop-blur-xl absolute inset-0"
                        >
                            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-600 mb-8 drop-shadow-[0_0_50px_rgba(52,211,153,0.5)] text-center px-4 leading-tight">
                                ¡Flujo Restaurado!
                            </h1>
                            <p className="text-2xl md:text-3xl text-zinc-200 mb-14 max-w-3xl text-center px-6 leading-relaxed font-medium">
                                Has navegado la historia de manera estelar. Toda anomalía ha sido erradicada con éxito.
                            </p>
                            <button
                                onClick={resetGame}
                                className="group flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-emerald-500 to-cyan-600 text-2xl font-black rounded-full transition-all duration-300 hover:scale-105 text-white shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.8)] cursor-pointer"
                            >
                                Siguiente Línea <FastForward className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Efectos Visuales Post-Screen Overlays */}
                <AnimatePresence>
                    {gameState === 'BOOST' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none mix-blend-screen z-0 bg-blue-400/20 shadow-[inset_0_0_200px_rgba(96,165,250,0.5)] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-blue-500/30"
                        />
                    )}
                    {isFail && gameState !== 'QUESTION' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none bg-red-600/30 mix-blend-multiply z-0 animate-pulse shadow-[inset_0_0_300px_rgba(220,38,38,0.8)]"
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
