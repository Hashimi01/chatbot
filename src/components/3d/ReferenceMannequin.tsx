// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MathUtils, AnimationMixer, LoopRepeat, Bone } from 'three';
import { useGLTF, useFBX } from '@react-three/drei';
import { Vector3 } from 'three';

interface ReferenceMannequinProps {
    exercise: 'squat' | 'pushup';
    progress: number; // 0 to 1
    modelUrl?: string;
    focusPart?: 'hips' | 'elbows' | 'shoulders' | 'back' | 'head' | 'none';
    errors?: string[]; // Error codes to display visual guides
}

export const ReferenceMannequin: React.FC<ReferenceMannequinProps> = ({ exercise, progress, modelUrl, focusPart = 'none', errors = [] }) => {
    const groupRef = useRef<Group>(null);
    const mixerRef = useRef<AnimationMixer | null>(null);
    const [bones, setBones] = useState<Map<string, Bone>>(new Map());

    // Camera target refs for smooth interpolation
    const targetCameraPos = useRef(new Vector3(0, 0.8, 2.5));
    const targetLookAt = useRef(new Vector3(0, 0, 0));

    // Determine file type
    const isFBX = modelUrl?.toLowerCase().endsWith('.fbx');

    // Load model based on type
    const gltf = modelUrl && !isFBX ? useGLTF(modelUrl) : null;
    const fbx = modelUrl && isFBX ? useFBX(modelUrl) : null;

    // Unified model data
    const modelData = isFBX ? { scene: fbx, animations: fbx?.animations } : gltf;

    // Body Parts Refs (for procedural fallback)
    const leftThighRef = useRef<Mesh>(null);
    const rightThighRef = useRef<Mesh>(null);
    const leftShinRef = useRef<Mesh>(null);
    const rightShinRef = useRef<Mesh>(null);
    const torsoRef = useRef<Mesh>(null);
    const headRef = useRef<Mesh>(null);
    const leftArmRef = useRef<Mesh>(null);
    const rightArmRef = useRef<Mesh>(null);
    const leftForearmRef = useRef<Mesh>(null);
    const rightForearmRef = useRef<Mesh>(null);

    // Setup animation mixer
    useEffect(() => {
        if (modelData && modelData.scene && groupRef.current) {
            // Extract bones
            const boneMap = new Map<string, Bone>();
            modelData.scene.traverse((object) => {
                if (object instanceof Bone) {
                    boneMap.set(object.name, object);
                }
            });
            setBones(boneMap);

            // Setup animations
            if (modelData.animations && modelData.animations.length > 0) {
                mixerRef.current = new AnimationMixer(modelData.scene);
                const action = mixerRef.current.clipAction(modelData.animations[0]);
                action.setLoop(LoopRepeat, Infinity);
                action.play();
            }
        }
    }, [modelData]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Smooth interpolation with easing
        const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const t = easeInOutCubic(progress);

        // Apply whole-body transformations (Position & Rotation) FIRST
        // This must happen before animation mixer to ensure proper orientation
        if (exercise === 'squat') {
            // Squat: Move down, keep vertical
            groupRef.current.position.y = MathUtils.lerp(0, -0.6, t);
            groupRef.current.rotation.x = 0;
            groupRef.current.rotation.y = 0;
            groupRef.current.rotation.z = 0;
        } else if (exercise === 'pushup') {
            // Pushup: Rotate to horizontal position (plank position)
            // Rotate -90° around X axis to make body horizontal, face down
            groupRef.current.rotation.x = -Math.PI / 2; // Face down, horizontal (-90 degrees)
            groupRef.current.rotation.y = Math.PI ; // Rotate 180° around Y axis to flip direction
            groupRef.current.rotation.z = Math.PI * 2 / 3; // Rotate 120° around Z axis to face camera correctly
            // Position: When body is rotated -90° on X, it lies on XZ plane
            // Ground is at y=-1.5. Body thickness is ~0.2-0.3.
            // We position center at -1.3 to have hands/feet on ground (-1.5)
            groupRef.current.position.set(0.2, -1.3, 0.9);
        }

        // Camera Animation Logic
        // Determine target position based on focusPart
        switch (focusPart) {
            case 'hips':
                targetCameraPos.current.set(0, 0.5, 1.5);
                targetLookAt.current.set(0, 0.5, 0);
                break;
            case 'elbows':
                targetCameraPos.current.set(-0.8, 0.5, 1.2); // Side view of arm
                targetLookAt.current.set(-0.3, 0.5, 0);
                break;
            case 'shoulders':
                targetCameraPos.current.set(0, 0.8, 1.2); // Closer to upper body
                targetLookAt.current.set(0, 0.8, 0);
                break;
            case 'back':
                targetCameraPos.current.set(0.8, 0.6, 1.5); // Side/back view
                targetLookAt.current.set(0, 0.6, 0);
                break;
            default:
                if (exercise === 'pushup') {
                    targetCameraPos.current.set(0, -0.5, 2.5); // Lower camera for ground-level pushup
                    targetLookAt.current.set(0, -1.3, 0); // Look at body on ground
                } else {
                    targetCameraPos.current.set(0, 0.8, 2.5); // Default view
                    targetLookAt.current.set(0, 0, 0);
                }
                break;
        }

        // Smoothly interpolate camera
        state.camera.position.lerp(targetCameraPos.current, 0.05);
        state.camera.lookAt(targetLookAt.current); // Note: OrbitControls might override this if not disabled or updated

        // Update animation mixer if it exists
        if (mixerRef.current) {
            mixerRef.current.update(delta);
        }

        // If using Model with animations
        // Note: Body rotation/position is applied BEFORE animation, so it works with animations too
        if (modelData && mixerRef.current && modelData.animations && modelData.animations.length > 0) {
            const duration = modelData.animations[0].duration;
            mixerRef.current.setTime(t * duration);
            // Don't return here - let bone animations continue below if needed
            // The body rotation is already applied above, so animation will work on rotated body
        }

        // If using Model WITHOUT animations (Procedural Bone Animation)
        if (modelData && bones.size > 0) {
            const getBone = (name: string) => bones.get(name) || bones.get(`mixamorig${name}`);

            if (exercise === 'squat') {
                // Procedural Squat for Bones
                // ... (bone logic remains similar, but relative to the now vertical group)

                // Thigh rotation (hip flexion)
                const thighRot = MathUtils.lerp(0, -Math.PI / 1.8, t);
                const leftUpLeg = getBone('LeftUpLeg');
                const rightUpLeg = getBone('RightUpLeg');
                if (leftUpLeg) leftUpLeg.rotation.x = thighRot;
                if (rightUpLeg) rightUpLeg.rotation.x = thighRot;

                // Shin rotation (knee flexion)
                const shinRot = MathUtils.lerp(0, Math.PI / 1.9, t);
                const leftLeg = getBone('LeftLeg');
                const rightLeg = getBone('RightLeg');
                if (leftLeg) leftLeg.rotation.x = shinRot;
                if (rightLeg) rightLeg.rotation.x = shinRot;

                // Arms forward
                const armRot = MathUtils.lerp(0, -Math.PI / 2.2, t);
                const leftArm = getBone('LeftArm');
                const rightArm = getBone('RightArm');
                if (leftArm) leftArm.rotation.x = armRot;
                if (rightArm) rightArm.rotation.x = armRot;

            } else if (exercise === 'pushup') {
                // Pushup Bone Animation - Hands and feet on ground
                // Body is horizontal, arms forward (under shoulders), legs back

                // Arms: Point down (towards ground) when body is horizontal
                // Since body is rotated -90° on X axis, arms need to point in -Y direction (down)
                // In T-pose, arms point sideways. For pushup, they point down.
                const leftArm = getBone('LeftArm') || getBone('mixamorigLeftArm');
                const rightArm = getBone('RightArm') || getBone('mixamorigRightArm');

                if (leftArm) {
                    // Rotate arm to point down (towards ground)
                    // From T-pose (pointing sideways) to pushup (pointing down)
                    leftArm.rotation.x = -Math.PI / 2; // Point down (90 degrees)
                    leftArm.rotation.y = 0;
                    leftArm.rotation.z = Math.PI / 6; // Slight outward angle for natural position
                }
                if (rightArm) {
                    rightArm.rotation.x = -Math.PI / 2; // Point down (90 degrees)
                    rightArm.rotation.y = 0;
                    rightArm.rotation.z = -Math.PI / 6; // Slight outward angle (mirrored)
                }

                // Forearm rotation (Elbow bend) - controls pushup depth
                // t=0: arms straight (up position), t=1: arms bent (down position)
                const elbowBend = MathUtils.lerp(0, -Math.PI / 2.5, t);
                const leftForeArm = getBone('LeftForeArm') || getBone('mixamorigLeftForeArm');
                const rightForeArm = getBone('RightForeArm') || getBone('mixamorigRightForeArm');
                if (leftForeArm) leftForeArm.rotation.x = elbowBend;
                if (rightForeArm) rightForeArm.rotation.x = elbowBend;

                // Hands/Wrists - palms flat on floor
                const leftHand = getBone('LeftHand') || getBone('mixamorigLeftHand');
                const rightHand = getBone('RightHand') || getBone('mixamorigRightHand');
                if (leftHand) {
                    leftHand.rotation.x = -Math.PI / 2; // Palms down
                    leftHand.rotation.y = 0;
                    leftHand.rotation.z = 0;
                }
                if (rightHand) {
                    rightHand.rotation.x = -Math.PI / 2; // Palms down
                    rightHand.rotation.y = 0;
                    rightHand.rotation.z = 0;
                }

                // Legs: Keep straight back (feet on ground)
                const leftUpLeg = getBone('LeftUpLeg') || getBone('mixamorigLeftUpLeg');
                const rightUpLeg = getBone('RightUpLeg') || getBone('mixamorigRightUpLeg');
                if (leftUpLeg) {
                    leftUpLeg.rotation.x = 0; // Straight back
                    leftUpLeg.rotation.y = 0;
                    leftUpLeg.rotation.z = 0;
                }
                if (rightUpLeg) {
                    rightUpLeg.rotation.x = 0; // Straight back
                    rightUpLeg.rotation.y = 0;
                    rightUpLeg.rotation.z = 0;
                }

                // Keep legs straight
                const leftLeg = getBone('LeftLeg') || getBone('mixamorigLeftLeg');
                const rightLeg = getBone('RightLeg') || getBone('mixamorigRightLeg');
                if (leftLeg) leftLeg.rotation.x = 0;
                if (rightLeg) rightLeg.rotation.x = 0;

                // Head up (look forward)
                const neck = getBone('Neck') || getBone('mixamorigNeck');
                const head = getBone('Head') || getBone('mixamorigHead');
                if (neck) neck.rotation.x = -Math.PI / 4; // Look up
                if (head) head.rotation.x = -Math.PI / 4;
            }
            return;
        }

        // Fallback: Procedural Animation for Primitives
        // ... (Keep existing fallback logic if needed, or rely on group transform)
        // Since we moved group transform up, we just need limb rotations here
        if (!modelData) {
            if (exercise === 'squat') {
                // ... primitive limb rotations ...
            } else if (exercise === 'pushup') {
                // ... primitive limb rotations ...
            }
        }

        // Add subtle breathing animation
        const breathingScale = 1 + Math.sin(Date.now() * 0.001) * 0.02;
        if (torsoRef.current) torsoRef.current.scale.y = breathingScale;
    });

    // If Model is loaded, render it inside the group with visual guides
    if (modelData) {
        // Rotation and position are handled in useFrame dynamically
        // Don't set rotation/position here as it will override useFrame updates
        return (
            <group ref={groupRef}>
                <primitive object={modelData.scene} scale={[0.01, 0.01, 0.01]} />

                {/* Visual Guidance Arrows and Lines */}
                {errors.includes('HIP_SAG') && (
                    <>
                        {/* Arrow pointing up at hips - showing correction */}
                        <arrowHelper
                            args={[
                                new Vector3(0, 1, 0), // direction (up)
                                new Vector3(0, 0.5, 0), // origin (hip position)
                                0.3, // length
                                0xFF4500, // color (red)
                                0.1, // headLength
                                0.08 // headWidth
                            ]}
                        />
                        {/* Pulsing sphere at correction point */}
                        <mesh position={[0, 0.5, 0]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshBasicMaterial color="#FF4500" transparent opacity={0.6} />
                        </mesh>
                        {/* Text label */}
                        <mesh position={[0.2, 0.5, 0]}>
                            <meshBasicMaterial color="#FF4500" />
                        </mesh>
                    </>
                )}

                {/* Hips too high - arrow pointing down */}
                {errors.includes('HIPS_HIGH') && (
                    <>
                        <arrowHelper
                            args={[
                                new Vector3(0, -1, 0), // direction (down)
                                new Vector3(0, 0.7, 0), // origin
                                0.3, // length
                                0xFFA500, // color (orange)
                                0.1,
                                0.08
                            ]}
                        />
                        <mesh position={[0, 0.5, 0]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshBasicMaterial color="#FFA500" transparent opacity={0.6} />
                        </mesh>
                    </>
                )}

                {/* Alignment guide line - showing proper body alignment */}
                {(exercise === 'pushup' && (errors.includes('HIP_SAG') || errors.includes('HIPS_HIGH'))) && (
                    <>
                        {/* Ideal alignment line (shoulders to ankles) */}
                        <line>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    count={2}
                                    array={new Float32Array([
                                        0, 0.8, 0,  // shoulder position
                                        0, -0.5, 0  // ankle position
                                    ])}
                                    itemSize={3}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial color="#00FF00" linewidth={3} transparent opacity={0.5} />
                        </line>
                        {/* Dashed line style using LineDashedMaterial */}
                        <mesh position={[0.15, 0.15, 0]}>
                            <boxGeometry args={[0.02, 1.5, 0.02]} />
                            <meshBasicMaterial color="#00FF00" transparent opacity={0.3} />
                        </mesh>
                    </>
                )}

                {/* Elbow position guide */}
                {focusPart === 'elbows' && (
                    <>
                        {/* Arrows showing proper elbow angle (45 degrees) */}
                        <arrowHelper
                            args={[
                                new Vector3(-0.7, 0, 0.7).normalize(), // 45 degree angle
                                new Vector3(-0.3, 0.5, 0),
                                0.2,
                                0xFFFF00,
                                0.08,
                                0.06
                            ]}
                        />
                        <arrowHelper
                            args={[
                                new Vector3(0.7, 0, 0.7).normalize(),
                                new Vector3(0.3, 0.5, 0),
                                0.2,
                                0xFFFF00,
                                0.08,
                                0.06
                            ]}
                        />
                    </>
                )}
            </group>
        );
    }

    // Limb component for DRY code
    const Limb = ({ position, rotation, length, radius, color }: any) => (
        <mesh position={position} rotation={rotation}>
            <cylinderGeometry args={[radius, radius, length, 12]} />
            <meshStandardMaterial
                color={color}
                metalness={0.3}
                roughness={0.4}
                emissive={color}
                emissiveIntensity={0.2}
            />
        </mesh>
    );

    // Joint component with glow
    const Joint = ({ position, size = 0.12, color = "#0082C3" }: any) => (
        <mesh position={position}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial
                color={color}
                metalness={0.6}
                roughness={0.2}
                emissive={color}
                emissiveIntensity={0.5}
            />
        </mesh>
    );

    const primaryColor = "#0082C3"; // Deca Blue
    const accentColor = "#00D9FF"; // Cyan glow

    // Focus Indicator Component
    const FocusIndicator = ({ position, visible }: { position: [number, number, number], visible: boolean }) => {
        if (!visible) return null;
        return (
            <mesh position={position}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color="#ff0055" transparent opacity={0.4} wireframe />
                <mesh scale={[1.5, 1.5, 1.5]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial color="#ff0055" transparent opacity={0.2} />
                </mesh>
            </mesh>
        );
    };

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Visual Indicators for Focus */}
            <FocusIndicator position={[0, 0.5, 0]} visible={focusPart === 'hips'} />
            <FocusIndicator position={[-0.3, 1.3, 0]} visible={focusPart === 'elbows'} />
            <FocusIndicator position={[0.3, 1.3, 0]} visible={focusPart === 'elbows'} />
            <FocusIndicator position={[0, 1.4, 0]} visible={focusPart === 'shoulders'} />
            <FocusIndicator position={[0, 1, -0.2]} visible={focusPart === 'back'} />

            {/* Head */}
            <Joint position={[0, 1.7, 0]} size={0.18} color={accentColor} />
            <mesh ref={headRef} position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial
                    color={primaryColor}
                    metalness={0.5}
                    roughness={0.3}
                    emissive={primaryColor}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Torso */}
            <mesh ref={torsoRef} position={[0, 1, 0]}>
                <cylinderGeometry args={[0.18, 0.15, 0.8, 12]} />
                <meshStandardMaterial
                    color={primaryColor}
                    metalness={0.4}
                    roughness={0.3}
                    emissive={primaryColor}
                    emissiveIntensity={0.25}
                />
            </mesh>

            {/* Hips */}
            <Joint position={[0, 0.55, 0]} size={0.15} color={accentColor} />

            {/* Left Thigh */}
            <group position={[-0.15, 0.5, 0]}>
                <Joint position={[0, 0, 0]} size={0.1} />
                <group ref={leftThighRef}>
                    <Limb position={[0, -0.25, 0]} length={0.5} radius={0.08} color={primaryColor} />
                    <Joint position={[0, -0.5, 0]} size={0.09} />

                    {/* Left Shin */}
                    <group ref={leftShinRef} position={[0, -0.5, 0]}>
                        <Limb position={[0, -0.25, 0]} length={0.5} radius={0.07} color={primaryColor} />
                        <Joint position={[0, -0.5, 0]} size={0.08} color={accentColor} />
                    </group>
                </group>
            </group>

            {/* Right Thigh */}
            <group position={[0.15, 0.5, 0]}>
                <Joint position={[0, 0, 0]} size={0.1} />
                <group ref={rightThighRef}>
                    <Limb position={[0, -0.25, 0]} length={0.5} radius={0.08} color={primaryColor} />
                    <Joint position={[0, -0.5, 0]} size={0.09} />

                    {/* Right Shin */}
                    <group ref={rightShinRef} position={[0, -0.5, 0]}>
                        <Limb position={[0, -0.25, 0]} length={0.5} radius={0.07} color={primaryColor} />
                        <Joint position={[0, -0.5, 0]} size={0.08} color={accentColor} />
                    </group>
                </group>
            </group>

            {/* Left Arm */}
            <group position={[-0.3, 1.3, 0]}>
                <Joint position={[0, 0, 0]} size={0.09} />
                <group ref={leftArmRef}>
                    <Limb position={[0, -0.2, 0]} length={0.4} radius={0.06} color={primaryColor} />
                    <Joint position={[0, -0.4, 0]} size={0.08} />

                    {/* Left Forearm */}
                    <group ref={leftForearmRef} position={[0, -0.4, 0]}>
                        <Limb position={[0, -0.2, 0]} length={0.4} radius={0.05} color={primaryColor} />
                        <Joint position={[0, -0.4, 0]} size={0.07} color={accentColor} />
                    </group>
                </group>
            </group>

            {/* Right Arm */}
            <group position={[0.3, 1.3, 0]}>
                <Joint position={[0, 0, 0]} size={0.09} />
                <group ref={rightArmRef}>
                    <Limb position={[0, -0.2, 0]} length={0.4} radius={0.06} color={primaryColor} />
                    <Joint position={[0, -0.4, 0]} size={0.08} />

                    {/* Right Forearm */}
                    <group ref={rightForearmRef} position={[0, -0.4, 0]}>
                        <Limb position={[0, -0.2, 0]} length={0.4} radius={0.05} color={primaryColor} />
                        <Joint position={[0, -0.4, 0]} size={0.07} color={accentColor} />
                    </group>
                </group>
            </group>
        </group>
    );
};
