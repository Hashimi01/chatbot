// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Keypoint } from '@tensorflow-models/pose-detection';

interface LiveUserAvatarProps {
    keypoints: Keypoint[];
    modelUrl: string;
}

export const LiveUserAvatar: React.FC<LiveUserAvatarProps> = ({ keypoints, modelUrl }) => {
    const modelRef = useRef<THREE.Group>(null);
    const [bones, setBones] = useState<Map<string, THREE.Bone>>(new Map());
    const gltf = useGLTF(modelUrl);

    // Setup bones on load
    useEffect(() => {
        if (gltf && gltf.scene) {
            const boneMap = new Map<string, THREE.Bone>();
            gltf.scene.traverse((object) => {
                if (object instanceof THREE.Bone) {
                    boneMap.set(object.name, object);
                }
            });
            setBones(boneMap);

            // Clone the scene to avoid modifying the cached version
            if (modelRef.current) {
                modelRef.current.clear();
                const clonedScene = gltf.scene.clone();
                modelRef.current.add(clonedScene);
            }
        }
    }, [gltf]);

    // Ensure model is visible even without keypoints
    if (!gltf || !gltf.scene) {
        return (
            <group ref={modelRef} position={[0, 0, 0]} scale={[0.01, 0.01, 0.01]}>
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#3b82f6" wireframe />
                </mesh>
            </group>
        );
    }

    useFrame(() => {
        // If no keypoints, keep model in default position but still visible
        if (!keypoints || keypoints.length === 0) {
            if (modelRef.current) {
                // Reset to default position
                modelRef.current.position.set(0, 0, 0);
                modelRef.current.quaternion.set(0, 0, 0, 1);
            }
            return;
        }
        
        if (bones.size === 0 || !modelRef.current) return;

        // Helper to calculate 3D angle from 2D keypoints (more accurate)
        const getAngle3D = (p1: Keypoint, p2: Keypoint, p3: Keypoint) => {
            if (!p1 || !p2 || !p3 || !p1.score || !p2.score || !p3.score) return null;
            if (p1.score < 0.3 || p2.score < 0.3 || p3.score < 0.3) return null;

            // Calculate vectors
            const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
            const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

            // Calculate angle
            const dot = v1.x * v2.x + v1.y * v2.y;
            const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
            const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
            
            if (mag1 === 0 || mag2 === 0) return null;
            
            const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
            return Math.acos(cosAngle);
        };

        // Helper to calculate signed angle (direction aware)
        const getSignedAngle = (p1: Keypoint, p2: Keypoint, p3: Keypoint) => {
            if (!p1 || !p2 || !p3 || !p1.score || !p2.score || !p3.score) return null;
            if (p1.score < 0.3 || p2.score < 0.3 || p3.score < 0.3) return null;

            const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
            const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
            
            const angle1 = Math.atan2(v1.y, v1.x);
            const angle2 = Math.atan2(v2.y, v2.x);
            let angle = angle2 - angle1;
            
            // Normalize to [-PI, PI]
            while (angle > Math.PI) angle -= 2 * Math.PI;
            while (angle < -Math.PI) angle += 2 * Math.PI;
            
            return angle;
        };

        // Helper to rotate bone using Quaternion Slerp (smoother)
        const rotateBoneQuaternion = (boneName: string, axis: 'x' | 'y' | 'z', angle: number, offset: number = 0, lerpFactor: number = 0.2) => {
            const bone = bones.get(boneName) || bones.get(`mixamorig${boneName}`);
            if (bone) {
                const targetRotation = angle + offset;
                const euler = new THREE.Euler();
                euler[axis] = targetRotation;
                const targetQuat = new THREE.Quaternion().setFromEuler(euler);
                bone.quaternion.slerp(targetQuat, lerpFactor);
            }
        };

        // Get keypoints
        const kp = (name: string) => keypoints.find(k => k.name === name);

        // --- Core body keypoints ---
        const nose = kp('nose');
        const leftShoulder = kp('left_shoulder');
        const leftElbow = kp('left_elbow');
        const leftWrist = kp('left_wrist');
        const rightShoulder = kp('right_shoulder');
        const rightElbow = kp('right_elbow');
        const rightWrist = kp('right_wrist');
        const leftHip = kp('left_hip');
        const rightHip = kp('right_hip');
        const leftKnee = kp('left_knee');
        const leftAnkle = kp('left_ankle');
        const rightKnee = kp('right_knee');
        const rightAnkle = kp('right_ankle');

        // ============================================
        // POSITION MODEL ON GROUND (Feet at y=0)
        // ============================================
        // Calculate ground position based on ankles
        let groundY = 0;
        if (leftAnkle && rightAnkle) {
            // Average ankle position to determine ground level
            const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
            // Normalize: assume video height is ~640px, convert to 3D space
            // Model scale is 0.01, so we need to adjust
            // Position model so ankles are at y=0
            groundY = 0; // Will be set based on model's root bone position
        }

        // ============================================
        // FULL BODY POSE DETECTION (3D Orientation)
        // ============================================
        if (leftShoulder && rightShoulder && leftHip && rightHip && leftAnkle && rightAnkle) {
            // Calculate body center points
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
            const hipMidX = (leftHip.x + rightHip.x) / 2;
            const hipMidY = (leftHip.y + rightHip.y) / 2;
            const ankleMidX = (leftAnkle.x + rightAnkle.x) / 2;
            const ankleMidY = (leftAnkle.y + rightAnkle.y) / 2;
            const bodyMidX = (shoulderMidX + hipMidX) / 2;

            // Calculate body height for scaling
            const bodyHeight = Math.abs(shoulderMidY - ankleMidY);
            const torsoHeight = Math.abs(shoulderMidY - hipMidY);
            const legHeight = Math.abs(hipMidY - ankleMidY);
            const torsoWidth = Math.abs(leftShoulder.x - rightShoulder.x);

            // Determine if lying down based on torso aspect ratio
            const isLyingDown = torsoHeight < torsoWidth * 0.9;

            // Position model: feet should be at y=0
            // Mixamo models typically have root at hip level, so we need to offset
            // Standard Mixamo model height is ~100 units, so hip is at ~50
            // We want ankles at y=0, so position.y should be adjusted
            let targetY = 0; // Ground level
            let targetRotZ = 0;
            let targetRotX = 0;
            let targetRotY = 0;

            if (isLyingDown) {
                // Lying down (Push-up position) - rotate to horizontal
                // Rotate -90° around X axis to make body horizontal, face down
                // Then rotate 180° around Y to flip direction
                targetY = -1.3; // Position on ground (same as ReferenceMannequin)
                targetRotZ = 0; // No Z rotation needed
                targetRotX = -Math.PI; // Rotate -90° around X to be horizontal
                targetRotY = Math.PI ; // Rotate 60° around Y to flip direction
            } else {
                // Standing/Sitting - keep feet on ground (y=0)
                // Mixamo models have root at hip (~50 units up), so we offset to put feet at y=0
                // Model scale is 0.01, so 1 Mixamo unit = 0.01 Three.js units
                // Standard Mixamo model: hip at y=50, feet at y=0 (in Mixamo space)
                // After scaling 0.01: hip at y=0.5, feet at y=0 (in Three.js space)
                // So we position at y=0 to keep feet on ground
                targetY = 0;

                // 2. SIDEWAYS LEAN (Rotation Z) - body tilt left/right
                const torsoAngleFromVertical = Math.atan2(shoulderMidX - hipMidX, hipMidY - shoulderMidY);
                targetRotZ = torsoAngleFromVertical * 0.3; // Dampen for stability

                // 3. FORWARD/BACKWARD LEAN (Rotation X) - body lean forward/back
                const expectedTorsoHeight = torsoWidth * 2.0;
                const foreshortening = Math.min(1, torsoHeight / expectedTorsoHeight);
                if (foreshortening < 0.95) {
                    targetRotX = Math.acos(Math.max(0, foreshortening)) * 0.5;
                }

                // 4. LEFT/RIGHT ROTATION (Rotation Y) - body rotation around vertical axis
                const shoulderLine = rightShoulder.x - leftShoulder.x;
                targetRotY = (shoulderLine / 200) * 0.5; // Normalize and dampen
            }

            // Apply position (smooth interpolation)
            modelRef.current.position.y = THREE.MathUtils.lerp(modelRef.current.position.y, targetY, 0.15);

            // Apply rotations (smooth)
            // Standard order: Y (yaw) -> X (pitch) -> Z (roll)
            const targetRotZQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, targetRotZ));
            const targetRotXQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(targetRotX, 0, 0));
            const targetRotYQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetRotY, 0));
            
            // Combine rotations in correct order: Y (yaw) -> X (pitch) -> Z (roll)
            const combinedQuat = new THREE.Quaternion()
                .multiplyQuaternions(targetRotYQuat, targetRotXQuat)
                .multiply(targetRotZQuat);
            
            modelRef.current.quaternion.slerp(combinedQuat, 0.15);

            // Horizontal position (sideways movement)
            const normalizedX = (bodyMidX - 320) / 320;
            modelRef.current.position.x = THREE.MathUtils.lerp(
                modelRef.current.position.x,
                -normalizedX * 0.3,
                0.2
            );

            // Depth position (forward/backward)
            const normalizedZ = (bodyHeight / 640) * 2;
            modelRef.current.position.z = THREE.MathUtils.lerp(
                modelRef.current.position.z,
                normalizedZ * 0.3,
                0.15
            );
        }

        // --- Spine/Torso orientation (fine tuning) ---
        if (leftShoulder && rightShoulder && leftHip && rightHip) {
            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
            const hipMidY = (leftHip.y + rightHip.y) / 2;
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const hipMidX = (leftHip.x + rightHip.x) / 2;

            // Forward/backward lean
            const forwardLean = Math.atan2(shoulderMidY - hipMidY, Math.abs(shoulderMidX - hipMidX));
            rotateBoneQuaternion('mixamorigSpine', 'x', forwardLean * 0.4, 0, 0.15);
            rotateBoneQuaternion('mixamorigSpine1', 'x', forwardLean * 0.2, 0, 0.15);
            rotateBoneQuaternion('mixamorigSpine2', 'x', forwardLean * 0.1, 0, 0.15);

            // Sideways lean
            const sideLean = Math.atan2(shoulderMidX - hipMidX, hipMidY - shoulderMidY);
            rotateBoneQuaternion('mixamorigSpine', 'z', sideLean * 0.3, 0, 0.15);
        }

        // --- Arms (Improved accuracy) ---
        // Left Arm
        if (leftShoulder && leftElbow && leftWrist) {
            // Shoulder to elbow angle
            const armAngle = getSignedAngle(leftHip || leftShoulder, leftShoulder, leftElbow);
            if (armAngle !== null) {
                // Calculate 3D rotation for arm
                const armVec = { x: leftElbow.x - leftShoulder.x, y: leftElbow.y - leftShoulder.y };
                const armAngle2D = Math.atan2(armVec.y, armVec.x);
                rotateBoneQuaternion('mixamorigLeftArm', 'z', armAngle2D - Math.PI / 2, 0, 0.2);
            }

            // Elbow bend
            const elbowAngle = getAngle3D(leftShoulder, leftElbow, leftWrist);
            if (elbowAngle !== null) {
                const bendAngle = Math.PI - elbowAngle;
                rotateBoneQuaternion('mixamorigLeftForeArm', 'x', bendAngle, 0, 0.25);
            }
        }

        // Right Arm
        if (rightShoulder && rightElbow && rightWrist) {
            const armAngle = getSignedAngle(rightHip || rightShoulder, rightShoulder, rightElbow);
            if (armAngle !== null) {
                const armVec = { x: rightElbow.x - rightShoulder.x, y: rightElbow.y - rightShoulder.y };
                const armAngle2D = Math.atan2(armVec.y, armVec.x);
                rotateBoneQuaternion('mixamorigRightArm', 'z', -(armAngle2D - Math.PI / 2), 0, 0.2);
            }

            const elbowAngle = getAngle3D(rightShoulder, rightElbow, rightWrist);
            if (elbowAngle !== null) {
                const bendAngle = Math.PI - elbowAngle;
                rotateBoneQuaternion('mixamorigRightForeArm', 'x', bendAngle, 0, 0.25);
            }
        }

        // --- Legs (Improved accuracy) ---
        // Left Leg
        if (leftHip && leftKnee && leftAnkle) {
            // Hip rotation (thigh) - calculate angle from vertical
            // In 2D: Y increases downward, so we calculate angle from vertical (hip to knee)
            const thighVec = { x: leftKnee.x - leftHip.x, y: leftKnee.y - leftHip.y };
            const thighLength = Math.sqrt(thighVec.x * thighVec.x + thighVec.y * thighVec.y);
            if (thighLength > 0) {
                // Angle from vertical (0 = straight down, positive = forward)
                // atan2(y, x) gives angle from positive X axis
                // We want angle from negative Y axis (downward)
                const angleFromVertical = Math.atan2(thighVec.x, thighVec.y);
                // Convert to 3D rotation: negative X rotation for forward leg movement
                rotateBoneQuaternion('mixamorigLeftUpLeg', 'x', -angleFromVertical, 0, 0.2);
            }

            // Knee bend - angle between thigh and shin
            const kneeAngle = getAngle3D(leftHip, leftKnee, leftAnkle);
            if (kneeAngle !== null) {
                // Calculate how much the knee is bent
                const bendAngle = Math.PI - kneeAngle;
                rotateBoneQuaternion('mixamorigLeftLeg', 'x', bendAngle, 0, 0.25);
            }
        }

        // Right Leg
        if (rightHip && rightKnee && rightAnkle) {
            const thighVec = { x: rightKnee.x - rightHip.x, y: rightKnee.y - rightHip.y };
            const thighLength = Math.sqrt(thighVec.x * thighVec.x + thighVec.y * thighVec.y);
            if (thighLength > 0) {
                const angleFromVertical = Math.atan2(thighVec.x, thighVec.y);
                rotateBoneQuaternion('mixamorigRightUpLeg', 'x', -angleFromVertical, 0, 0.2);
            }

            const kneeAngle = getAngle3D(rightHip, rightKnee, rightAnkle);
            if (kneeAngle !== null) {
                const bendAngle = Math.PI - kneeAngle;
                rotateBoneQuaternion('mixamorigRightLeg', 'x', bendAngle, 0, 0.25);
            }
        }

        // --- Head/Neck tracking ---
        if (nose && leftShoulder && rightShoulder) {
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

            const headAngleX = Math.atan2(nose.x - shoulderMidX, shoulderMidY - nose.y);
            rotateBoneQuaternion('mixamorigNeck', 'z', headAngleX * 0.5, 0, 0.15);
            rotateBoneQuaternion('mixamorigHead', 'z', headAngleX * 0.3, 0, 0.15);
        }
    });

    return (
        <group ref={modelRef} position={[0, 0, 0]} scale={[0.01, 0.01, 0.01]}>
            {/* Model added via useEffect - positioned so feet are at y=0 */}
            {/* Rotation is handled in useFrame based on body position */}
        </group>
    );
};
