import { useRef } from 'react'
import { Mesh } from 'three'
import { RoundedBox } from '@react-three/drei'

export function DeskSetup() {
  const deskRef = useRef<Mesh>(null)

  return (
    <group position={[0, 0, 0]}>
      {/* Desk surface */}
      <RoundedBox
        ref={deskRef}
        args={[4, 0.1, 2]}
        position={[0, 0, 0]}
        radius={0.02}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#2d2d3a" roughness={0.3} metalness={0.1} />
      </RoundedBox>

      {/* Desk legs */}
      <DeskLeg position={[-1.8, -0.5, 0.8]} />
      <DeskLeg position={[1.8, -0.5, 0.8]} />
      <DeskLeg position={[-1.8, -0.5, -0.8]} />
      <DeskLeg position={[1.8, -0.5, -0.8]} />

      {/* Monitor stand base */}
      <RoundedBox
        args={[0.6, 0.02, 0.4]}
        position={[0, 0.06, -0.3]}
        radius={0.01}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#1a1a24" roughness={0.2} metalness={0.8} />
      </RoundedBox>

      {/* Monitor stand pole */}
      <mesh position={[0, 0.35, -0.3]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.5, 16]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Keyboard */}
      <RoundedBox
        args={[1.2, 0.04, 0.4]}
        position={[0, 0.07, 0.5]}
        radius={0.01}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#1a1a24" roughness={0.4} metalness={0.3} />
      </RoundedBox>

      {/* Mouse */}
      <RoundedBox
        args={[0.08, 0.03, 0.12]}
        position={[0.8, 0.065, 0.5]}
        radius={0.01}
        smoothness={4}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.4} />
      </RoundedBox>

      {/* Coffee mug */}
      <CoffeeMug position={[-1.4, 0.12, 0.3]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#12121a" roughness={0.8} />
      </mesh>
    </group>
  )
}

function DeskLeg({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.04, 0.04, 1, 16]} />
      <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.6} />
    </mesh>
  )
}

function CoffeeMug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.12, 16]} />
        <meshStandardMaterial color="#3d3d4a" roughness={0.6} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.03, 0.01, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#3d3d4a" roughness={0.6} />
      </mesh>
    </group>
  )
}
