'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface IGradientSphereInnerProps {
  color1?: string;
  color2?: string;
  distort?: number;
  speed?: number;
}

const GradientSphereInner = ({
  color1 = '#8b5cf6',
  color2 = '#ec4899',
  distort = 0.4,
  speed = 2,
}: IGradientSphereInnerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Slow rotation
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    
    // Subtle floating
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
      <MeshDistortMaterial
        color={color1}
        attach="material"
        distort={distort}
        speed={speed}
        roughness={0.2}
        metalness={0.1}
      />
    </Sphere>
  );
};

interface IGradientSphereProps {
  /** Primary color */
  color1?: string;
  /** Secondary color */
  color2?: string;
  /** Distortion amount (0-1) */
  distort?: number;
  /** Animation speed */
  speed?: number;
  /** Additional className */
  className?: string;
}

/**
 * Animated gradient distorted sphere
 * Creates a beautiful morphing 3D sphere effect
 */
export const GradientSphere = ({
  color1 = '#8b5cf6',
  color2 = '#ec4899',
  distort = 0.4,
  speed = 2,
  className = '',
}: IGradientSphereProps) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={color2} />
        <GradientSphereInner
          color1={color1}
          color2={color2}
          distort={distort}
          speed={speed}
        />
      </Canvas>
    </div>
  );
};

export default GradientSphere;
