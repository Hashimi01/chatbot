import { Keypoint } from '@tensorflow-models/pose-detection';

/**
 * Improved Keypoint Smoother using Exponential Moving Average (EMA)
 * Provides smoother tracking with less lag than simple averaging
 */
export class ImprovedKeypointSmoother {
    private history: Map<string, { x: number; y: number; score: number }>;
    private alpha: number; // Smoothing factor (0-1), higher = more responsive

    constructor(alpha: number = 0.3) {
        this.history = new Map();
        // Clamp alpha between 0.1 and 0.9
        this.alpha = Math.max(0.1, Math.min(0.9, alpha));
    }

    public smooth(keypoints: Keypoint[]): Keypoint[] {
        return keypoints.map((kp) => {
            const key = kp.name || 'unknown';
            
            if (!this.history.has(key)) {
                // Initialize with first value
                this.history.set(key, {
                    x: kp.x,
                    y: kp.y,
                    score: kp.score || 0
                });
                return kp;
            }

            const previous = this.history.get(key)!;
            
            // Exponential Moving Average (EMA)
            // More recent values have more weight
            const smoothedX = previous.x + this.alpha * (kp.x - previous.x);
            const smoothedY = previous.y + this.alpha * (kp.y - previous.y);
            const smoothedScore = previous.score + this.alpha * ((kp.score || 0) - previous.score);

            // Update history
            this.history.set(key, {
                x: smoothedX,
                y: smoothedY,
                score: smoothedScore
            });

            return {
                ...kp,
                x: smoothedX,
                y: smoothedY,
                score: smoothedScore
            };
        });
    }

    public reset() {
        this.history.clear();
    }

    public setAlpha(alpha: number) {
        this.alpha = Math.max(0.1, Math.min(0.9, alpha));
    }
}

