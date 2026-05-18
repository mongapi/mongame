import React from 'react'

export function Planet08(props) {
  return (
    <group {...props} dispose={null}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial color="#a855f7" roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  )
}


