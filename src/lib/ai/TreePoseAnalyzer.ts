import { PoseAnalyzer, AnalysisResult, ExerciseFeedback } from './PoseAnalyzer';

export class TreePoseAnalyzer extends PoseAnalyzer {
    private stabilityBuffer: number[] = [];
    private startTime: number | null = null;
    private holdTime: number = 0;

    constructor() {
        super();
    }

    analyze(): AnalysisResult {
        if (!this.keypoints || this.keypoints.length === 0) {
            return {
                isCorrect: false,
                feedback: [],
                reps: 0,
                state: 'unknown',
                phase: 'unknown'
            };
        }

        const keypoints = this.keypoints;
        const feedback: ExerciseFeedback[] = [];
        const errors: string[] = [];

        // Keypoints
        const leftHip = keypoints.find(k => k.name === 'left_hip');
        const rightHip = keypoints.find(k => k.name === 'right_hip');
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
        const leftAnkle = keypoints.find(k => k.name === 'left_ankle');
        const rightAnkle = keypoints.find(k => k.name === 'right_ankle');

        if (!leftHip || !rightHip || !leftShoulder || !rightShoulder || !leftAnkle || !rightAnkle) {
            return {
                isCorrect: false,
                feedback: [],
                reps: 0,
                state: 'unknown'
            };
        }

        // 1. Hip Level Check
        const hipSlope = Math.abs(leftHip.y - rightHip.y);
        const isHipsLevel = hipSlope < 0.05; // Threshold depends on coordinate system, assuming normalized 0-1? 
        // MoveNet returns pixel coords usually, but if normalized... let's assume pixel coords and use relative difference
        // Actually, let's use angle.
        const hipAngle = Math.atan2(rightHip.y - leftHip.y, rightHip.x - leftHip.x) * 180 / Math.PI;
        const hipLevelDeviation = Math.abs(hipAngle); // Should be 0 or 180 depending on order, let's say 0 is horizontal

        if (hipLevelDeviation > 10) {
            feedback.push({ message: "Level your hips!", type: 'warning' });
            errors.push("HIPS_UNLEVEL");
        }

        // 2. Sway Index (Center of Gravity Stability)
        // Approximate COG as midpoint of hips
        const cogX = (leftHip.x + rightHip.x) / 2;
        // We need history to calculate sway.
        // For now, let's use shoulder sway relative to hips (Torso verticality stability)
        const torsoVerticality = Math.abs(Math.atan2(rightShoulder.y - rightHip.y, rightShoulder.x - rightHip.x) * 180 / Math.PI - 90);

        const stabilityScore = Math.max(0, 100 - torsoVerticality * 2 - hipLevelDeviation * 2);
        this.stabilityBuffer.push(stabilityScore);
        if (this.stabilityBuffer.length > 30) this.stabilityBuffer.shift();
        const avgStability = this.stabilityBuffer.reduce((a, b) => a + b, 0) / this.stabilityBuffer.length;

        // 3. Temporal Stability (Hold Time)
        let isCorrect = true;
        if (avgStability < 70) {
            isCorrect = false;
            feedback.push({ message: "Stabilize your body!", type: 'warning' });
            this.startTime = null; // Reset timer if unstable
        } else {
            if (!this.startTime) this.startTime = Date.now();
            this.holdTime = (Date.now() - this.startTime) / 1000;
            feedback.push({ message: `Holding: ${this.holdTime.toFixed(1)}s`, type: 'success' });
        }

        // Check if foot is placed correctly (not on knee)
        // This requires identifying which leg is up.
        // Assuming left leg is standing, right is up.
        // Check right ankle y position relative to left knee y.
        // If right ankle is near left knee -> Error.
        // This is complex without knowing which leg is which.
        // We'll skip specific foot placement for now.

        return {
            isCorrect,
            feedback,
            reps: Math.floor(this.holdTime), // Use reps field for seconds held? Or just display holdTime in UI
            state: isCorrect ? 'holding' : 'unstable',
            angleData: { hipLevelDeviation, torsoVerticality },
            progress: Math.min(1, this.holdTime / 30), // Target 30s?
            stabilityScore: Math.round(avgStability),
            tempo: `${this.holdTime.toFixed(1)}s`,
            errors
        };
    }
}
