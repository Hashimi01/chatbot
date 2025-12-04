// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useFBX, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ExerciseCard3DProps {
    modelUrl: string;
    exercise: 'squat' | 'pushup' | 'tree_pose' | 'lunge' | 'plank' | 'jumping_jack' | 'high_knees' | 'overhead_press';
}

const Model = ({ modelUrl, exercise }: ExerciseCard3DProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const isFBX = modelUrl.toLowerCase().endsWith('.fbx');

    // Load model
    const gltf = !isFBX ? useGLTF(modelUrl) : null;
    const fbx = isFBX ? useFBX(modelUrl) : null;
    const modelData = isFBX ? fbx : gltf?.scene;

    // Animation mixer
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);

    useEffect(() => {
        if (modelData) {
            // Setup animation if available
            const animations = isFBX ? fbx?.animations : gltf?.animations;
            if (animations && animations.length > 0) {
                mixerRef.current = new THREE.AnimationMixer(modelData);
                const action = mixerRef.current.clipAction(animations[0]);
                action.play();
            }

            // Apply specific rotations/positions based on exercise
            if (exercise === 'pushup' || exercise === 'plank') {
                // Pushup/Plank specific adjustments
                modelData.rotation.x = -Math.PI / 2; // Face down
                modelData.position.y = -0.5; // On ground
            } else {
                // Standing exercises
                modelData.rotation.x = 0;
                modelData.position.y = -0.9; // Feet on ground
            }
        }
    }, [modelData, exercise, isFBX, fbx, gltf]);

    useFrame((state, delta) => {
        if (mixerRef.current) {
            mixerRef.current.update(delta);
        }

        // Gentle rotation
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005;
        }
    });

    // Dynamic scale based on file type and exercise - DRAMATICALLY INCREASED
    let scale = 0.025; // Much larger default for FBX (2.5x bigger!)

    if (!isFBX) {
        scale = 2.0; // GLB significantly larger
    }

    // Specific adjustments per exercise
    if (exercise === 'plank' || exercise === 'pushup') {
        scale = isFBX ? 0.03 : 2.2; // Even larger for ground exercises
    } else if (exercise === 'jumping_jack') {
        scale = isFBX ? 0.028 : 2.1;
    } else if (exercise === 'squat') {
        scale = isFBX ? 0.027 : 2.0;
    }

    if (!modelData) return null;

    return (
        <group ref={groupRef}>
            <primitive object={modelData} scale={[scale, scale, scale]} />
            {/* Add rim lighting effect to make model pop */}
            <pointLight position={[2, 1, 2]} intensity={3} color="#00D9FF" distance={5} />
            <pointLight position={[-2, 1, -2]} intensity={3} color="#FF0055" distance={5} />
        </group>
    );
};

export const ExerciseCard3D: React.FC<ExerciseCard3DProps> = (props) => {
    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Canvas
                camera={{ position: [0, 1, 2.2], fov: 55 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                {/* DRAMATIC LIGHTING SETUP */}
                {/* Strong ambient for base visibility */}
                <ambientLight intensity={1.8} color="#ffffff" />

                {/* Key light - main illumination */}
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={3.5}
                    color="#00D9FF"
                    castShadow
                />

                {/* Fill light - soften shadows */}
                <directionalLight
                    position={[-3, 3, -3]}
                    intensity={2.5}
                    color="#FF0055"
                />

                {/* Rim lights for edge definition */}
                <spotLight
                    position={[0, 5, -5]}
                    angle={0.6}
                    intensity={4}
                    color="#ffffff"
                    penumbra={0.5}
                    distance={15}
                />

                {/* Ground/bottom light for complete illumination */}
                <pointLight position={[0, -1, 0]} intensity={2} color="#6366f1" />

                {/* Accent lights for drama */}
                <pointLight position={[3, 2, 3]} intensity={2.5} color="#00D9FF" />
                <pointLight position={[-3, 2, -3]} intensity={2.5} color="#FF0055" />

                {/* Environment for reflections and ambient */}
                <Environment preset="sunset" />

                <Model {...props} />

                {/* Enhanced shadows */}
                <ContactShadows
                    position={[0, -1, 0]}
                    opacity={0.6}
                    scale={12}
                    blur={3}
                    far={5}
                    color="#00D9FF"
                />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={1.2}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.2}
                    maxAzimuthAngle={Math.PI / 6}
                    minAzimuthAngle={-Math.PI / 6}
                />
            </Canvas>
        </div>
    );
};
