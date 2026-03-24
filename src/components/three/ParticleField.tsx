'use client';

import { THREE_VISUAL_CONFIG } from '@/constants/homeConstants';
import { PointMaterial, Points } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface IParticleFieldInnerProps {
    count?: number;
    color?: string;
}

const getParticleThemeColor = (): string => {
    if (typeof document === 'undefined') {
        return THREE_VISUAL_CONFIG.particle.themeColors.light;
    }

    const isDarkTheme = document.documentElement.classList.contains('dark');
    return isDarkTheme ? THREE_VISUAL_CONFIG.particle.themeColors.dark : THREE_VISUAL_CONFIG.particle.themeColors.light;
};

const ParticleFieldInner = ({ count = THREE_VISUAL_CONFIG.particle.defaultCount, color = THREE_VISUAL_CONFIG.particle.themeColors.light }: IParticleFieldInnerProps) => {
    const ref = useRef<THREE.Points>(null);
    const elapsedTimeRef = useRef(0);

    // eslint-disable-next-line react-hooks/purity
    const positions = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * THREE_VISUAL_CONFIG.particle.spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * THREE_VISUAL_CONFIG.particle.spread;
            positions[i * 3 + 2] = (Math.random() - 0.5) * THREE_VISUAL_CONFIG.particle.spread;
        }
        return positions;
    }, [count]);

    useFrame((_, delta) => {
        if (!ref.current) return;

        elapsedTimeRef.current += delta;

        ref.current.rotation.x -= delta * THREE_VISUAL_CONFIG.particle.rotationXSpeed;
        ref.current.rotation.y -= delta * THREE_VISUAL_CONFIG.particle.rotationYSpeed;

        ref.current.position.y = Math.sin(elapsedTimeRef.current * THREE_VISUAL_CONFIG.particle.floatSpeed) * THREE_VISUAL_CONFIG.particle.floatAmplitude;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial transparent color={color} size={THREE_VISUAL_CONFIG.particle.pointSize} sizeAttenuation depthWrite={false} opacity={THREE_VISUAL_CONFIG.particle.pointOpacity} />
        </Points>
    );
};

interface IParticleFieldProps {
    count?: number;
    className?: string;
}

export const ParticleField = ({ count = THREE_VISUAL_CONFIG.particle.defaultCount, className = '' }: IParticleFieldProps) => {
    const [particleColor, setParticleColor] = useState<string>(THREE_VISUAL_CONFIG.particle.themeColors.light);

    useEffect(() => {
        const updateColor = () => {
            const nextColor = getParticleThemeColor();
            setParticleColor((previous) => (previous === nextColor ? previous : nextColor));
        };

        updateColor();

        const observer = new MutationObserver(updateColor);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden='true'>
            <Canvas camera={{ position: [...THREE_VISUAL_CONFIG.particle.camera.position], fov: THREE_VISUAL_CONFIG.particle.camera.fov }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <ParticleFieldInner count={count} color={particleColor} />
            </Canvas>
        </div>
    );
};

export default ParticleField;
