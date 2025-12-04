// @ts-nocheck
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { ReferenceMannequin } from './ReferenceMannequin';
import { LiveUserAvatar } from './LiveUserAvatar';
import type { Keypoint } from '@tensorflow-models/pose-detection';

interface DualModelViewProps {
    exercise: 'squat' | 'pushup';
    progress: number;
    userKeypoints: Keypoint[];
    modelUrl?: string;
    focusPart?: string;
    nextInstruction?: string;
    errors?: string[];
}

export const DualModelView: React.FC<DualModelViewProps> = ({
    exercise, 
    progress, 
    userKeypoints,
    modelUrl = '/models/athletic-male.glb',
    focusPart, 
    nextInstruction,
    errors = [] 
}) => {
    return (
        <div className="w-full h-full grid grid-rows-2 gap-8 p-4">
            {/* Reference Model - Perfect Form */}
            <div className="relative w-full bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl overflow-hidden border border-green-500/20">
                <Canvas camera={{ position: exercise === 'pushup' ? [0, 0.5, 2.5] : [0, 1, 3], fov: 50 }}>
                    <ambientLight intensity={0.3} />
                    <spotLight position={[5, 5, 5]} angle={0.3} intensity={1.5} color="#10b981" />
                    <spotLight position={[-5, 3, -2]} angle={0.4} intensity={1} color="#059669" />

                    <Environment preset="city" />

                    <React.Suspense fallback={<mesh><boxGeometry /><meshStandardMaterial color="green" wireframe /></mesh>}>
                        {/* Reference mannequin showing perfect form */}
                        <ReferenceMannequin 
                            key="reference-model" 
                            exercise={exercise} 
                            progress={progress} 
                            modelUrl={modelUrl}
                            focusPart={focusPart as any}
                            errors={errors}
                        />
                    </React.Suspense>

                    {/* Ground Plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                        <planeGeometry args={[10, 10]} />
                        <meshStandardMaterial
                            color="#1a4d2e"
                            metalness={0.1}
                            roughness={0.8}
                            opacity={0.3}
                            transparent
                        />
                    </mesh>
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                    <OrbitControls
                        enableZoom={true}
                        minDistance={exercise === 'pushup' ? 1.5 : 2}
                        maxDistance={exercise === 'pushup' ? 4 : 5}
                        enablePan={false}
                        maxPolarAngle={exercise === 'pushup' ? Math.PI / 2 + 0.5 : Math.PI / 2 + 0.3}
                        minPolarAngle={exercise === 'pushup' ? Math.PI / 2 - 0.5 : Math.PI / 2 - 0.3}
                    />
                </Canvas>

                <div className="absolute top-4 left-4 backdrop-blur-xl bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1">
                    <p className="text-green-300 text-xs font-bold uppercase tracking-wider">✓ Perfect Form</p>
                </div>
            </div>

            {/* Live User Model */}
            <div className="relative w-full bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl overflow-hidden border border-blue-500/20">
                <Canvas camera={{ position: exercise === 'pushup' ? [0, 0.5, 2.5] : [0, 0.5, 2.5], fov: 50 }}>
                    <ambientLight intensity={0.4} />
                    <spotLight position={[5, 5, 5]} angle={0.3} intensity={2} color="#3b82f6" />
                    <spotLight position={[-5, 3, -2]} angle={0.4} intensity={1.5} color="#0ea5e9" />
                    <pointLight position={[0, 2, 0]} intensity={1} color="#FFFFFF" />

                    <Environment preset="city" />

                    <React.Suspense fallback={
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[1, 1, 1]} />
                            <meshStandardMaterial color="#3b82f6" wireframe />
                        </mesh>
                    }>
                        {/* Live user avatar */}
                        {userKeypoints && userKeypoints.length > 0 ? (
                            <LiveUserAvatar key="live-user-model" keypoints={userKeypoints} modelUrl={modelUrl} />
                        ) : (
                            <mesh position={[0, 0, 0]}>
                                <boxGeometry args={[1, 1, 1]} />
                                <meshStandardMaterial color="#3b82f6" opacity={0.5} transparent />
                            </mesh>
                        )}
                    </React.Suspense>

                    {/* Ground Plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                        <planeGeometry args={[10, 10]} />
                        <meshStandardMaterial
                            color="#1e3a8a"
                            metalness={0.1}
                            roughness={0.8}
                            opacity={0.3}
                            transparent
                        />
                    </mesh>
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                    <OrbitControls
                        enableZoom={true}
                        minDistance={exercise === 'pushup' ? 1.5 : 2}
                        maxDistance={exercise === 'pushup' ? 4 : 5}
                        enablePan={false}
                        maxPolarAngle={exercise === 'pushup' ? Math.PI / 2 + 0.5 : Math.PI / 2 + 0.3}
                        minPolarAngle={exercise === 'pushup' ? Math.PI / 2 - 0.5 : Math.PI / 2 - 0.3}
                    />
                </Canvas>

                <div className="absolute top-4 left-4 backdrop-blur-xl bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wider">Your Form</p>
                </div>
            </div>
        </div>
    );
};
