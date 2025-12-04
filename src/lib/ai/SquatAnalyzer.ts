import { Keypoint } from '@tensorflow-models/pose-detection';
import { PoseAnalyzer, AnalysisResult, ExerciseFeedback } from './PoseAnalyzer';

export class SquatAnalyzer extends PoseAnalyzer {
    // Thresholds (adjustable)
    private readonly STANDING_THRESHOLD = 160; // Knee almost straight
    private readonly SQUAT_DEPTH_THRESHOLD = 100; // Knee angle for deep squat
    // private readonly BACK_ANGLE_THRESHOLD = 60; // Allowed back inclination (unused in provided logic but good to have)

    constructor() {
        super();
        this.state = 'standing'; // Initial state
    }

    analyze(): AnalysisResult {
        const feedback: ExerciseFeedback[] = [];
        const errors: string[] = [];

        // 1. Extract important keypoints
        const leftHip = this.getKeypoint('left_hip');
        const leftKnee = this.getKeypoint('left_knee');
        const leftAnkle = this.getKeypoint('left_ankle');
        const leftShoulder = this.getKeypoint('left_shoulder');

        // If keypoints are not clear, wait
        if (!leftHip || !leftKnee || !leftAnkle || !leftShoulder) {
            return {
                isCorrect: false,
                feedback: [{ type: 'warning', message: 'يرجى إظهار الجسم بالكامل للكاميرا' }], // Please show full body
                reps: this.reps,
                state: this.state,
                errors: []
            };
        }

        // 2. Calculate Intrinsic Angles
        // Knee Angle (determines depth)
        const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);

        // Back Angle (determines posture) - Shoulder relative to Hip and Vertical
        // (Simplified back lean calculation)
        const backAngle = this.calculateAngle(leftShoulder, leftHip, { x: leftHip.x, y: leftHip.y + 100 } as Keypoint);

        // 3. State Machine for Rep Counting
        // Improved state machine with clear transitions
        const previousState = this.state;

        if (kneeAngle > this.STANDING_THRESHOLD) {
            // Standing position detected
            if (this.state === 'ascending') {
                // Just completed a full rep (bottom -> ascending -> standing)
                this.reps++;
                feedback.push({ type: 'success', message: '✅ تكرار مكتمل!' }); // Completed rep!
            }
            this.state = 'standing';
        } else if (kneeAngle < this.SQUAT_DEPTH_THRESHOLD) {
            // Deep squat position
            if (this.state !== 'bottom') {
                this.state = 'bottom';
            }
        } else if (this.state === 'standing' && kneeAngle < this.STANDING_THRESHOLD) {
            // Started descending from standing
            this.state = 'descending';
        } else if (this.state === 'bottom' && kneeAngle > this.SQUAT_DEPTH_THRESHOLD) {
            // Started ascending from bottom
            this.state = 'ascending';
        } else if (this.state === 'descending' && kneeAngle < this.STANDING_THRESHOLD) {
            // Continue descending
            this.state = 'descending';
        } else if (this.state === 'ascending' && kneeAngle < this.STANDING_THRESHOLD) {
            // Continue ascending
            this.state = 'ascending';
        }

        // 4. Error Detection and Advice

        // Depth Analysis
        if (this.state === 'bottom' || this.state === 'descending') {
            if (kneeAngle < 75) {
                // Very deep (optional, might be considered good for some)
                feedback.push({ type: 'success', message: 'عمق ممتاز! 🔥' }); // Excellent depth!
            } else if (this.state === 'bottom' && kneeAngle > 110) {
                // Not deep enough
                feedback.push({
                    type: 'warning',
                    message: 'انزل أكثر للأسفل! ⬇️', // Go lower!
                    pointsToHighlight: ['left_knee', 'right_knee']
                });
                errors.push('POOR_DEPTH');
            }
        }

        // Back Posture Analysis
        // If angle is too large, it means player is leaning forward too much
        if (backAngle > 45) { // Approximate value, needs testing
            feedback.push({
                type: 'error',
                message: 'حافظ على استقامة ظهرك! ⚠️', // Keep back straight!
                pointsToHighlight: ['left_shoulder', 'left_hip']
            });
            errors.push('BAD_BACK');
        }

        // Visual Guidance (Focus Part)
        let focusPart: 'hips' | 'elbows' | 'shoulders' | 'back' | 'head' | 'none' | undefined = undefined;
        if (errors.includes('POOR_DEPTH')) focusPart = 'hips';
        if (errors.includes('BAD_BACK')) focusPart = 'back'; // Mapped 'chest' to 'back' as 'chest' isn't in the type

        return {
            isCorrect: errors.length === 0,
            feedback: feedback,
            reps: this.reps,
            state: this.state,
            errors: errors,
            focusPart: focusPart,
            // Optional: Pass angle data for debugging if needed
            angleData: { kneeAngle, backAngle }
        };
    }
}
