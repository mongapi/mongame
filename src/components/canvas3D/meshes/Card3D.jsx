import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Card3D: A versatile 3D card component for React Three Fiber.
 * Designed to be reusable across different minigames (Memory, Sorting/Drag, etc).
 */
export function Card3D({
  // Content Props
  front,
  back,
  cardColor = "#ffffff", // Color applied to the card edges/body
  width = 2,
  height = 3,
  thickness = 0.05,
  
  // State Props
  isFlipped,           // Si está definido, la carta es controlada (controlled state)
  defaultFlipped = false, // Estado inicial si la carta es uncontrolled

  // Interaction Props
  canFlipOnClick = true,
  onFlip,              // Callback on flip logic change
  onClick,             // Generic click callback (for selecting, dragging context, etc)
  onPointerOver,
  onPointerOut,
  hoverEffect = true,  // Hace un pequeño escalado al pasar el ratón (hover)
  
  // Animation Props
  flipSpeed = 6,       // Velocidad de interpolación del giro
  
  // ...props capturará posiciones, rotaciones externas o handlers como los de useGesture (onDrag)
  ...props 
}) {
  const cardGroupRef = useRef(null);
  
  // Internal (uncontrolled) state tracking
  const [internalFlipped, setInternalFlipped] = useState(defaultFlipped);
  
  // Hover local state for scale animations and cursor changes
  const [hovered, setHovered] = useState(false);
  
  // Determine actual flipped state based on whether parent manages it or not
  const isControlled = isFlipped !== undefined;
  const flipped = isControlled ? isFlipped : internalFlipped;
  
  // Handle click to flip or notify parent
  const handleClick = (e) => {
    e.stopPropagation(); // Evitar que el clic se propague a otros objetos en 3D
    
    // Si el padre quiere gestionar su propio click (por ejemplo para seleccionar la carta)
    if (onClick) onClick(e);
    
    // Lógica del volteo
    if (canFlipOnClick) {
      const newState = !flipped;
      // Si la carta NO está siendo controlada por el padre, actualizamos su estado interno.
      // Si sí es controlada, esperamos que el padre cambie la prop 'isFlipped' en respuesta al onFlip.
      if (!isControlled) {
        setInternalFlipped(newState);
      }
      // Avisamos al padre del nuevo estado
      if (onFlip) {
        onFlip(newState);
      }
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (hoverEffect && canFlipOnClick) {
      document.body.style.cursor = 'pointer';
      setHovered(true);
    }
    if (onPointerOver) onPointerOver(e);
  };

  const handlePointerOut = (e) => {
    if (hoverEffect && canFlipOnClick) {
      document.body.style.cursor = 'auto';
      setHovered(false);
    }
    if (onPointerOut) onPointerOut(e);
  };

  // Limpieza del cursor por si se desmonta estando hovered
  useEffect(() => {
    return () => { document.body.style.cursor = 'auto' };
  }, []);

  // Bucle de animación 3D
  useFrame((state, delta) => {
    if (!cardGroupRef.current) return;
    
    // Rotar 180° (Math.PI) sobre el eje Y si está volteada
    const targetRotationY = flipped ? Math.PI : 0;
    
    // Rotación suave con inercia
    cardGroupRef.current.rotation.y = THREE.MathUtils.damp(
      cardGroupRef.current.rotation.y,
      targetRotationY,
      flipSpeed,
      delta
    );
    
    // Efecto de escala al hacer hover
    if (hoverEffect) {
      const targetScale = hovered && canFlipOnClick ? 1.05 : 1.0;
      cardGroupRef.current.scale.setScalar(
        THREE.MathUtils.damp(cardGroupRef.current.scale.x, targetScale, 4, delta)
      );
    }
  });

  return (
    // Outer group: Se usa para el posicionamiento general, scale genérico o event listeners extra (ej. onDrag) pasados por ...props
    <group {...props}>
      {/* Inner group: Aquí ocurren las animaciones locales como el flip o el hover */}
      <group
        ref={cardGroupRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Cuerpo / Borde / Grosor de la carta */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, thickness]} />
          <meshStandardMaterial color={cardColor} />
        </mesh>

        {/* CARA DELANTERA (offset Z positivo para que no intercepte con el cuerpo) */}
        <group position={[0, 0, thickness / 2 + 0.001]}>
          {front || (
            // Placeholder por defecto
            <mesh>
              <planeGeometry args={[width, height]} />
              <meshStandardMaterial color="#4f46e5" />
            </mesh>
          )}
        </group>

        {/* CARA TRASERA (offset Z negativo y rotada para que apunte hacia el lado contrario) */}
        <group position={[0, 0, -(thickness / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
          {back || (
            // Placeholder por defecto
            <mesh>
              <planeGeometry args={[width, height]} />
              <meshStandardMaterial color="#f43f5e" />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}

export default Card3D;
