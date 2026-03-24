'use client';

import { THREE_VISUAL_CONFIG } from '@/constants/homeConstants';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface IGradientSphereInnerProps {
    color1?: string;
    distort?: number;
    speed?: number;
}

interface IResolvedSphereColors {
    color1: string;
    color2: string;
}

const getSphereThemeColors = (): IResolvedSphereColors => {
    if (typeof document === 'undefined') {
        return {
            color1: THREE_VISUAL_CONFIG.sphere.themeColors.start.light,
            color2: THREE_VISUAL_CONFIG.sphere.themeColors.end.light,
        };
    }

    const isDarkTheme = document.documentElement.classList.contains('dark');

    return {
        color1: isDarkTheme ? THREE_VISUAL_CONFIG.sphere.themeColors.start.dark : THREE_VISUAL_CONFIG.sphere.themeColors.start.light,
        color2: isDarkTheme ? THREE_VISUAL_CONFIG.sphere.themeColors.end.dark : THREE_VISUAL_CONFIG.sphere.themeColors.end.light,
    };
};

const GradientSphereInner = ({
    color1 = THREE_VISUAL_CONFIG.sphere.themeColors.start.light,
    distort = THREE_VISUAL_CONFIG.sphere.distort,
    speed = THREE_VISUAL_CONFIG.sphere.speed,
}: IGradientSphereInnerProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const elapsedTimeRef = useRef(0);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        elapsedTimeRef.current += delta;

        meshRef.current.rotation.x = elapsedTimeRef.current * THREE_VISUAL_CONFIG.sphere.rotationXFactor;
        meshRef.current.rotation.y = elapsedTimeRef.current * THREE_VISUAL_CONFIG.sphere.rotationYFactor;

        meshRef.current.position.y = Math.sin(elapsedTimeRef.current * THREE_VISUAL_CONFIG.sphere.floatSpeed) * THREE_VISUAL_CONFIG.sphere.floatAmplitude;
    });

    return (
        <Sphere ref={meshRef} args={[1, 64, 64]} scale={THREE_VISUAL_CONFIG.sphere.scale}>
            <MeshDistortMaterial color={color1} attach='material' distort={distort} speed={speed} roughness={0.2} metalness={0.1} />
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
export const GradientSphere = ({ color1, color2, distort = THREE_VISUAL_CONFIG.sphere.distort, speed = THREE_VISUAL_CONFIG.sphere.speed, className = '' }: IGradientSphereProps) => {
    const [resolvedColors, setResolvedColors] = useState<IResolvedSphereColors>(() => {
        const themeColors = getSphereThemeColors();
        return {
            color1: color1 || themeColors.color1,
            color2: color2 || themeColors.color2,
        };
    });

    useEffect(() => {
        const updateColors = () => {
            const themeColors = getSphereThemeColors();
            const nextColor1 = color1 || themeColors.color1;
            const nextColor2 = color2 || themeColors.color2;

            setResolvedColors((previous) => {
                if (previous.color1 === nextColor1 && previous.color2 === nextColor2) {
                    return previous;
                }

                return {
                    color1: nextColor1,
                    color2: nextColor2,
                };
            });
        };

        updateColors();

        const observer = new MutationObserver(updateColors);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [color1, color2]);

    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden='true'>
            <Canvas camera={{ position: [...THREE_VISUAL_CONFIG.sphere.camera.position], fov: THREE_VISUAL_CONFIG.sphere.camera.fov }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={THREE_VISUAL_CONFIG.sphere.lights.ambientIntensity} />
                <directionalLight position={[...THREE_VISUAL_CONFIG.sphere.lights.directionalPosition]} intensity={THREE_VISUAL_CONFIG.sphere.lights.directionalIntensity} />
                <pointLight position={[...THREE_VISUAL_CONFIG.sphere.lights.pointPosition]} intensity={THREE_VISUAL_CONFIG.sphere.lights.pointIntensity} color={resolvedColors.color2} />
                <GradientSphereInner color1={resolvedColors.color1} distort={distort} speed={speed} />
            </Canvas>
        </div>
    );
};

export default GradientSphere;
