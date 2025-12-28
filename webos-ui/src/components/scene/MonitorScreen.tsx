import { useRef, useState, useEffect } from 'react'
import { Mesh } from 'three'
import { Html, RoundedBox } from '@react-three/drei'

interface MonitorScreenProps {
  children: React.ReactNode
}

export function MonitorScreen({ children }: MonitorScreenProps) {
  const monitorRef = useRef<Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    return () => { document.body.style.cursor = 'auto' }
  }, [isHovered])

  const monitorWidth = 2.4
  const monitorHeight = 1.4
  const monitorDepth = 0.08
  const bezelSize = 0.04

  return (
    <group position={[0, 0.95, -0.3]}>
      {/* Monitor frame/bezel */}
      <RoundedBox
        ref={monitorRef}
        args={[monitorWidth + bezelSize * 2, monitorHeight + bezelSize * 2, monitorDepth]}
        radius={0.02}
        smoothness={4}
        castShadow
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <meshStandardMaterial 
          color="#1a1a24" 
          roughness={0.2} 
          metalness={0.8}
        />
      </RoundedBox>

      {/* Screen surface (slightly in front of bezel) */}
      <mesh position={[0, 0, monitorDepth / 2 + 0.001]}>
        <planeGeometry args={[monitorWidth, monitorHeight]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* HTML content rendered on screen */}
      <Html
        transform
        occlude
        position={[0, 0, monitorDepth / 2 + 0.01]}
        style={{
          width: '960px',
          height: '560px',
          overflow: 'hidden',
          borderRadius: '4px',
          pointerEvents: 'auto',
        }}
        distanceFactor={0.5}
      >
        <div 
          className="w-full h-full"
          style={{ 
            transform: 'scale(1)',
            transformOrigin: 'center center',
          }}
        >
          {children}
        </div>
      </Html>

      {/* Monitor power LED */}
      <mesh position={[0, -monitorHeight / 2 - bezelSize + 0.02, monitorDepth / 2 + 0.01]}>
        <circleGeometry args={[0.008, 16]} />
        <meshBasicMaterial color="#00ff88" />
      </mesh>

      {/* Monitor back panel detail */}
      <RoundedBox
        args={[1.5, 0.8, 0.02]}
        position={[0, 0, -monitorDepth / 2 - 0.01]}
        radius={0.01}
        smoothness={4}
      >
        <meshStandardMaterial color="#0d0d14" roughness={0.4} metalness={0.5} />
      </RoundedBox>
    </group>
  )
}
