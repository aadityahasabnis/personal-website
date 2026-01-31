'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface IParticleFieldInnerProps {
  count?: number;
  color?: string;
}

const ParticleFieldInner = ({ count = 2000, color = '#8b5cf6' }: IParticleFieldInnerProps) => {
  const ref = useRef<THREE.Points>(null);

  // Generate random positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  // Animate particles
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    ref.current.rotation.x -= delta * 0.015;
    ref.current.rotation.y -= delta * 0.02;

    // Subtle floating motion
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <Points
      ref={ref}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color={color}
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
};

interface IParticleFieldProps {
  /** Number of particles */
  count?: number;
  /** Additional className */
  className?: string;
}

/**
 * Three.js particle field background
 * Creates floating particles that slowly rotate
 * Auto-detects theme and adjusts particle color
 */
export const ParticleField = ({
  count = 2000,
  className = '',
}: IParticleFieldProps) => {
  const [particleColor, setParticleColor] = useState('#8b5cf6');

  // Detect theme and set particle color
  useEffect(() => {
    const updateColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      // Purple/violet particles - brighter for dark, more saturated for light
      setParticleColor(isDark ? '#a78bfa' : '#7c3aed');
    };

    updateColor();

    // Watch for theme changes
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ParticleFieldInner count={count} color={particleColor} />
      </Canvas>
    </div>
  );
};

export default ParticleField;
