import { Keypoint } from '@tensorflow-models/pose-detection';

export class KeypointSmoother {
    private history: Map<string, { x: number[]; y: number[]; score: number[] }>;
    private windowSize: number;

    constructor(windowSize: number = 5) {
        this.history = new Map();
        this.windowSize = windowSize;
    }

    public smooth(keypoints: Keypoint[]): Keypoint[] {
        return keypoints.map((kp) => {
            if (!this.history.has(kp.name!)) {
                this.history.set(kp.name!, { x: [], y: [], score: [] });
            }

            const data = this.history.get(kp.name!)!;

            // Add new values
            data.x.push(kp.x);
            data.y.push(kp.y);
            data.score.push(kp.score || 0);

            // Maintain window size
            if (data.x.length > this.windowSize) {
                data.x.shift();
                data.y.shift();
                data.score.shift();
            }

            // Calculate average
            const avgX = data.x.reduce((a, b) => a + b, 0) / data.x.length;
            const avgY = data.y.reduce((a, b) => a + b, 0) / data.y.length;
            const avgScore = data.score.reduce((a, b) => a + b, 0) / data.score.length;

            return {
                ...kp,
                x: avgX,
                y: avgY,
                score: avgScore,
            };
        });
    }

    public reset() {
        this.history.clear();
    }
}
