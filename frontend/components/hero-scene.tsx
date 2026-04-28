'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleNetwork({ count = 2000, mouse }: { count?: number; mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Points>(null)
  
  const [positions, connections] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const connections: number[] = []
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 2 + Math.random() * 1.5
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    
    // Create connections between nearby points
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < Math.min(i + 20, count); j++) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (dist < 0.8) {
          connections.push(i, j)
        }
      }
    }
    
    return [positions, connections]
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.getElapsedTime()
    
    // Smooth rotation with mouse parallax
    ref.current.rotation.y = time * 0.05 + mouse.current.x * 0.3
    ref.current.rotation.x = Math.sin(time * 0.03) * 0.1 + mouse.current.y * 0.2
  })

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#2d7a4f"
          size={0.025}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
      <NetworkLines positions={positions} connections={connections} mouse={mouse} />
    </group>
  )
}

function NetworkLines({ 
  positions, 
  connections, 
  mouse 
}: { 
  positions: Float32Array
  connections: number[]
  mouse: React.MutableRefObject<{ x: number; y: number }>
}) {
  const lineRef = useRef<THREE.LineSegments>(null)
  
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const linePositions = new Float32Array(connections.length * 3)
    
    for (let i = 0; i < connections.length; i += 2) {
      const idx1 = connections[i]
      const idx2 = connections[i + 1]
      
      linePositions[i * 3] = positions[idx1 * 3]
      linePositions[i * 3 + 1] = positions[idx1 * 3 + 1]
      linePositions[i * 3 + 2] = positions[idx1 * 3 + 2]
      
      linePositions[(i + 1) * 3] = positions[idx2 * 3]
      linePositions[(i + 1) * 3 + 1] = positions[idx2 * 3 + 1]
      linePositions[(i + 1) * 3 + 2] = positions[idx2 * 3 + 2]
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    return geometry
  }, [positions, connections])

  useFrame((state) => {
    if (!lineRef.current) return
    const time = state.clock.getElapsedTime()
    
    lineRef.current.rotation.y = time * 0.05 + mouse.current.x * 0.3
    lineRef.current.rotation.x = Math.sin(time * 0.03) * 0.1 + mouse.current.y * 0.2
  })

  return (
    <lineSegments ref={lineRef} geometry={lineGeometry}>
      <lineBasicMaterial color="#2d7a4f" transparent opacity={0.15} />
    </lineSegments>
  )
}

function Scene({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree()
  
  useFrame(() => {
    camera.position.z = 5 + mouse.current.y * 0.5
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <ParticleNetwork mouse={mouse} />
    </>
  )
}

export function HeroScene() {
  const mouseRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    mouseRef.current = {
      x: (clientX / innerWidth - 0.5) * 2,
      y: (clientY / innerHeight - 0.5) * 2,
    }
  }

  return (
    <div 
      className="absolute inset-0 z-0"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Scene mouse={mouseRef} />
      </Canvas>
    </div>
  )
}
