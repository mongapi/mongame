import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';

/**
 * RoomCanvas
 * Un componente envolvedor que proporciona el mundo tridimensional,
 * luces configuradas, una cámara responsiva y suelo para que
 * tus componentes 3D (como las Cartas) vivan dentro de él.
 */
export default function RoomCanvas({
  children,
  cameraPosition = [0, 2, 8],
  fov = 45,
  orbitTarget = [0, 0, 0],
  showGrid = true,
  transparentBg = false
}) {
  return (
    // Es vital que este div tenga tamaño (w-full h-full) para que el Canvas ocupe espacio
    <div className={`w-full h-full relative ${transparentBg ? 'bg-transparent' : 'bg-zinc-950'}`} style={{ minHeight: '60vh' }}>
      <Canvas shadows camera={{ position: cameraPosition, fov }}>
        {/* Color de fondo para que fluya bien con el bg de la web */}
        {!transparentBg && <color attach="background" args={['#09090b']} />}

        {/* Añadimos un poco de 'fog' (niebla) para que el fondo se desvanezca elegantemente */}
        {!transparentBg && <fog attach="fog" args={['#09090b', 5, 30]} />}

        {/* Iluminación base y direccional */}
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]}
        />
        {/* Luces decorativas (morado y azul) para una estética moderna/premium */}
        <pointLight position={[-5, 5, -5]} intensity={1} color="#8b5cf6" />
        <pointLight position={[5, 5, -5]} intensity={1} color="#3b82f6" />

        {/* Entorno HDRI suave para que los materiales metálicos o pulidos reaccionen bien */}
        <Environment preset="city" />

        {/* El Suelo y la Cuadrícula */}
        <group position={[0, -2, 0]}>
          {showGrid && (
            <Grid
              infiniteGrid
              fadeDistance={25}
              sectionColor="#3f3f46"
              cellColor="#18181b"
              cellSize={0.5}
              sectionSize={2}
            />
          )}
          {/* Sombras de contacto para anclar los objetos al suelo de forma realista */}
          <ContactShadows position={[0, 0.01, 0]} resolution={1024} scale={20} blur={2} opacity={0.6} />
        </group>

        {/* Aquí va el contenido del minijuego (las Cartas, tableros, etc) */}
        <group position={[0, -0.5, 0]}>
          {children}
        </group>

        {/* Controles para mover la cámara (limita el ángulo para no mirar debajo del suelo) */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.05}
          dampingFactor={0.05}
          target={orbitTarget}
        />
      </Canvas>
    </div>
  );
}
