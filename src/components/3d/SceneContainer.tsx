// @ts-nocheck
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sparkles } from '@react-three/drei';
import { ReferenceMannequin } from './ReferenceMannequin';

interface SceneContainerProps {
    exercise: 'squat' | 'pushup';
    progress: number;
    modelUrl?: string;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({ exercise, progress, modelUrl }) => {
    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-black">
            <Canvas
                camera={{ position: [0, 1, 3], fov: 50 }}
                gl={{ alpha: true, antialias: true }}
            >
                <Suspense fallback={null}>
                    {/* Lighting Setup */}
                    <ambientLight intensity={0.3} />
                    <spotLight
                        position={[5, 5, 5]}
                        angle={0.3}
                        penumbra={0.5}
                        intensity={2}
                        castShadow
                        color="#00D9FF"
                    />
                    <spotLight
                        position={[-5, 3, -2]}
                        angle={0.4}
                        penumbra={0.6}
                        intensity={1.5}
                        color="#0082C3"
                    />
                    <pointLight position={[0, 2, 0]} intensity={1} color="#FFFFFF" />

                    {/* Environment Effects */}
                    <Environment preset="city" />
                    <Sparkles
                        count={30}
                        scale={4}
                        size={2}
                        speed={0.3}
                        color="#00D9FF"
                        opacity={0.6}
                    />

                    {/* Character */}
                    <ReferenceMannequin exercise={exercise} progress={progress} modelUrl={modelUrl} />

                    {/* Ground Shadow */}
                    <ContactShadows
                        position={[0, -1.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2}
                        far={4}
                    />

                    {/* Camera Controls */}
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        maxPolarAngle={Math.PI / 2}
                        minPolarAngle={Math.PI / 4}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};
