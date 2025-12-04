// @ts-nocheck
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const HeroScene3D: React.FC = () => {
    // Animated sphere component
    const AnimatedSphere = () => {
        const meshRef = useRef<THREE.Mesh>(null);

        useFrame((state) => {
            if (meshRef.current) {
                meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
                meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
            }
        });

        return (
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={meshRef} position={[0, 0, 0]}>
                    <icosahedronGeometry args={[1.2, 4]} />
                    <MeshDistortMaterial
                        color="#00D9FF"
                        attach="material"
                        distort={0.4}
                        speed={2}
                        roughness={0.2}
                        metalness={0.8}
                        emissive="#0082C3"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </Float>
        );
    };

    // Floating rings
    const FloatingRing = ({ position, rotation }: any) => {
        const ringRef = useRef<THREE.Mesh>(null);

        useFrame((state) => {
            if (ringRef.current) {
                ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
            }
        });

        return (
            <mesh ref={ringRef} position={position} rotation={rotation}>
                <torusGeometry args={[1.5, 0.05, 16, 100]} />
                <meshStandardMaterial
                    color="#00D9FF"
                    transparent
                    opacity={0.6}
                    metalness={0.9}
                    roughness={0.1}
                    emissive="#00D9FF"
                    emissiveIntensity={0.3}
                />
            </mesh>
        );
    };

    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    {/* ENHANCED LIGHTING */}
                    <ambientLight intensity={0.6} />
                    <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={3} color="#00D9FF" />
                    <spotLight position={[-10, -10, -10]} angle={0.3} penumbra={1} intensity={2} color="#0082C3" />
                    <pointLight position={[0, 0, 2]} intensity={2.5} color="#FFFFFF" />
                    <pointLight position={[5, 5, 0]} intensity={2} color="#FF0055" />
                    <pointLight position={[-5, -5, 0]} intensity={2} color="#00D9FF" />

                    {/* Main animated sphere */}
                    <AnimatedSphere />

                    {/* Floating rings */}
                    <FloatingRing position={[0, 0, 0]} rotation={[Math.PI / 4, 0, 0]} />
                    <FloatingRing position={[0, 0, 0]} rotation={[0, Math.PI / 4, Math.PI / 2]} />

                    {/* Sparkles */}
                    <Sparkles
                        count={150}
                        scale={6}
                        size={4}
                        speed={0.5}
                        color="#00D9FF"
                        opacity={1}
                    />

                    {/* Environment */}
                    <Environment preset="sunset" />

                    {/* Interactive camera controls */}
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate
                        autoRotateSpeed={0.5}
                        maxPolarAngle={Math.PI / 2}
                        minPolarAngle={Math.PI / 2}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};
