import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import { DeskSetup } from './DeskSetup'
import { MonitorScreen } from './MonitorScreen'

interface Scene3DProps {
  children: React.ReactNode
}

export function Scene3D({ children }: Scene3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#1a1a2e']} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-3, 3, -3]} intensity={0.3} color="#4a9eff" />
          
          <DeskSetup />
          <MonitorScreen>{children}</MonitorScreen>
          
          <ContactShadows
            position={[0, -0.99, 0]}
            opacity={0.6}
            scale={10}
            blur={2}
            far={4}
          />
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </div>
  )
}
