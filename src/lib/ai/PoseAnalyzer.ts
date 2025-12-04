import { Keypoint } from '@tensorflow-models/pose-detection';
export type { Keypoint };

export interface ExerciseFeedback {
    type: 'success' | 'warning' | 'error';
    message: string;
    pointsToHighlight?: string[]; // Names of keypoints to highlight
}

export interface AnalysisResult {
    isCorrect: boolean;
    feedback: ExerciseFeedback[];
    reps: number;
    state: string;
    angleData?: Record<string, number>;
    progress?: number; // 0.0 to 1.0 (Start to End of rep)

    // Advanced Biometrics
    phase?: 'eccentric' | 'concentric' | 'isometric' | 'unknown';
    stabilityScore?: number; // 0-100
    tempo?: string; // e.g. "2.0s / 1.0s"
    errors?: string[]; // Specific error codes e.g. "KNEE_VALGUS"

    // Visual Guidance
    nextInstruction?: string; // e.g. "Lower your body"
    focusPart?: 'hips' | 'elbows' | 'shoulders' | 'back' | 'head' | 'none'; // Part to zoom in on
}

export abstract class PoseAnalyzer {
    protected keypoints: Keypoint[] = [];
    protected state: string = 'waiting';
    protected reps: number = 0;

    constructor() { }

    public updateKeypoints(keypoints: Keypoint[]) {
        this.keypoints = keypoints;
    }

    public getKeypoints(): Keypoint[] {
        return this.keypoints;
    }

    public abstract analyze(): AnalysisResult;

    protected calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
        const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);

        if (angle > 180.0) {
            angle = 360.0 - angle;
        }

        return angle;
    }

    protected getAngle(p1Name: string, p2Name: string, p3Name: string): number {
        const p1 = this.getKeypoint(p1Name);
        const p2 = this.getKeypoint(p2Name);
        const p3 = this.getKeypoint(p3Name);

        if (!p1 || !p2 || !p3) return 0;

        return this.calculateAngle(p1, p2, p3);
    }

    protected getKeypoint(name: string): Keypoint | undefined {
        return this.keypoints.find((k) => k.name === name && (k.score || 0) > 0.5);
    }

    protected getDistance(p1Name: string, p2Name: string): number {
        const p1 = this.getKeypoint(p1Name);
        const p2 = this.getKeypoint(p2Name);

        if (!p1 || !p2) return 0;

        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    public reset() {
        this.state = 'waiting';
        this.reps = 0;
    }
}
