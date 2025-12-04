import type { Keypoint } from '@tensorflow-models/pose-detection';

/**
 * Utility class for calculating bone rotations from 2D pose keypoints
 * Based on best practices for pose-to-3D conversion
 */
export class BoneRotationCalculator {
    /**
     * Calculate angle between three keypoints (joint angle)
     * Returns angle in radians
     */
    static calculateJointAngle(
        p1: Keypoint,
        p2: Keypoint,
        p3: Keypoint,
        minScore: number = 0.3
    ): number | null {
        if (!p1 || !p2 || !p3) return null;
        if ((p1.score || 0) < minScore || (p2.score || 0) < minScore || (p3.score || 0) < minScore) {
            return null;
        }

        // Calculate vectors
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

        // Calculate angle using dot product
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

        if (mag1 === 0 || mag2 === 0) return null;

        const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        return Math.acos(cosAngle);
    }

    /**
     * Calculate signed angle (direction-aware) between three keypoints
     * Returns angle in radians, positive = counterclockwise
     */
    static calculateSignedAngle(
        p1: Keypoint,
        p2: Keypoint,
        p3: Keypoint,
        minScore: number = 0.3
    ): number | null {
        if (!p1 || !p2 || !p3) return null;
        if ((p1.score || 0) < minScore || (p2.score || 0) < minScore || (p3.score || 0) < minScore) {
            return null;
        }

        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

        const angle1 = Math.atan2(v1.y, v1.x);
        const angle2 = Math.atan2(v2.y, v2.x);
        let angle = angle2 - angle1;

        // Normalize to [-PI, PI]
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;

        return angle;
    }

    /**
     * Calculate bone rotation from vertical (for legs/arms)
     * Returns rotation angle in radians
     */
    static calculateBoneRotationFromVertical(
        startPoint: Keypoint,
        endPoint: Keypoint,
        minScore: number = 0.3
    ): number | null {
        if (!startPoint || !endPoint) return null;
        if ((startPoint.score || 0) < minScore || (endPoint.score || 0) < minScore) {
            return null;
        }

        const vec = {
            x: endPoint.x - startPoint.x,
            y: endPoint.y - startPoint.y
        };

        const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (length === 0) return null;

        // Angle from vertical (negative Y axis is down in screen space)
        // atan2(x, y) gives angle from positive Y axis
        return Math.atan2(vec.x, vec.y);
    }

    /**
     * Calculate 3D bone rotation for Mixamo rig
     * Converts 2D pose to 3D bone rotation
     */
    static calculateBoneRotation3D(
        parent: Keypoint,
        joint: Keypoint,
        child: Keypoint,
        boneType: 'thigh' | 'shin' | 'upperArm' | 'forearm' | 'spine',
        side: 'left' | 'right' = 'left'
    ): { x: number; y: number; z: number } | null {
        if (!parent || !joint || !child) return null;

        // Calculate joint angle
        const jointAngle = this.calculateJointAngle(parent, joint, child);
        if (jointAngle === null) return null;

        // Calculate bone direction
        const boneDir = this.calculateBoneRotationFromVertical(joint, child);
        if (boneDir === null) return null;

        let rotation = { x: 0, y: 0, z: 0 };

        switch (boneType) {
            case 'thigh':
                // Hip to knee rotation
                rotation.x = -boneDir; // Forward/backward
                rotation.y = 0;
                rotation.z = 0;
                break;

            case 'shin':
                // Knee bend
                rotation.x = Math.PI - jointAngle; // Knee flexion
                rotation.y = 0;
                rotation.z = 0;
                break;

            case 'upperArm':
                // Shoulder to elbow
                const armAngle = this.calculateBoneRotationFromVertical(joint, child);
                if (armAngle !== null) {
                    rotation.x = 0;
                    rotation.y = 0;
                    rotation.z = side === 'left' 
                        ? armAngle - Math.PI / 2 
                        : -(armAngle - Math.PI / 2);
                }
                break;

            case 'forearm':
                // Elbow bend
                rotation.x = Math.PI - jointAngle;
                rotation.y = 0;
                rotation.z = 0;
                break;

            case 'spine':
                // Torso lean
                const torsoVec = {
                    x: child.x - parent.x,
                    y: child.y - parent.y
                };
                rotation.x = Math.atan2(torsoVec.y, Math.abs(torsoVec.x)) * 0.3;
                rotation.z = Math.atan2(torsoVec.x, torsoVec.y) * 0.3;
                rotation.y = 0;
                break;
        }

        return rotation;
    }

    /**
     * Validate keypoint data quality
     */
    static validateKeypoints(keypoints: Keypoint[]): {
        isValid: boolean;
        quality: 'excellent' | 'good' | 'fair' | 'poor';
        avgScore: number;
        highConfidenceCount: number;
    } {
        if (!keypoints || keypoints.length === 0) {
            return {
                isValid: false,
                quality: 'poor',
                avgScore: 0,
                highConfidenceCount: 0
            };
        }

        const scores = keypoints.map(kp => kp.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highConfidenceCount = scores.filter(s => s > 0.6).length;

        let quality: 'excellent' | 'good' | 'fair' | 'poor';
        if (avgScore > 0.7 && highConfidenceCount > 12) {
            quality = 'excellent';
        } else if (avgScore > 0.5 && highConfidenceCount > 10) {
            quality = 'good';
        } else if (avgScore > 0.4 && highConfidenceCount > 8) {
            quality = 'fair';
        } else {
            quality = 'poor';
        }

        return {
            isValid: avgScore > 0.3,
            quality,
            avgScore,
            highConfidenceCount
        };
    }
}

