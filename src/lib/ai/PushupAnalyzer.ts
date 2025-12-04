import { PoseAnalyzer, AnalysisResult, ExerciseFeedback } from './PoseAnalyzer';

export class PushupAnalyzer extends PoseAnalyzer {
    private lastPhaseChangeTime: number = 0;
    private currentPhase: 'eccentric' | 'concentric' | 'isometric' | 'unknown' = 'unknown';
    private eccentricDuration: number = 0;
    private concentricDuration: number = 0;
    private stabilityBuffer: number[] = [];

    constructor() {
        super();
    }

    public analyze(): AnalysisResult {
        if (!this.keypoints || this.keypoints.length === 0) {
            return {
                isCorrect: false,
                feedback: [],
                reps: this.reps,
                state: this.state,
                phase: 'unknown'
            };
        }

        const keypoints = this.keypoints;
        const feedback: ExerciseFeedback[] = [];
        const errors: string[] = [];

        // Keypoints
        const shoulder = keypoints.find(k => k.name === 'left_shoulder');
        const elbow = keypoints.find(k => k.name === 'left_elbow');
        const wrist = keypoints.find(k => k.name === 'left_wrist');
        const hip = keypoints.find(k => k.name === 'left_hip');
        const ankle = keypoints.find(k => k.name === 'left_ankle');

        if (!shoulder || !elbow || !wrist || !hip || !ankle) {
            return {
                isCorrect: false,
                feedback: [{ type: 'warning', message: '📸 يرجى إظهار الجسم بالكامل للكاميرا' }],
                reps: this.reps,
                state: this.state,
                phase: 'unknown'
            };
        }

        // 1. Calculate Angles
        const elbowAngle = this.calculateAngle(shoulder, elbow, wrist);
        const bodyAlignmentAngle = this.calculateAngle(shoulder, hip, ankle);

        // **CRITICAL: Validate Pushup Posture (Prevent False Positives)**
        // The user must be in a proper plank/pushup position before we count any reps

        // Check 1: Body must be roughly horizontal (shoulder and hip should be at similar Y levels)
        const shoulderHipVerticalDiff = Math.abs(shoulder.y - hip.y);
        const bodyLength = Math.sqrt(Math.pow(shoulder.x - ankle.x, 2) + Math.pow(shoulder.y - ankle.y, 2));
        const horizontalRatio = shoulderHipVerticalDiff / bodyLength;

        // Check 2: User should be facing down (nose/eyes should be visible and below shoulders)
        const nose = keypoints.find(k => k.name === 'nose');
        const isFacingDown = nose && nose.y > shoulder.y - 30; // Relaxed: nose near or below shoulder

        // Check 3: Hands should be visible and below/near shoulder level
        const isHandsPositioned = wrist.y >= shoulder.y - 100; // Relaxed threshold

        // Check 4: Body should be relatively straight (alignment angle check)
        const isBodyStraight = bodyAlignmentAngle > 140 && bodyAlignmentAngle < 220; // Relaxed range

        // Combined Validation: Is this actually a pushup position?
        // More lenient thresholds for better detection
        const isValidPushupPosition = horizontalRatio < 0.4 && // Body is horizontal (relaxed from 0.25)
            isFacingDown && // Facing down
            isHandsPositioned && // Hands in position
            isBodyStraight; // Body is straight

        // If not in valid position, reset state and give feedback
        if (!isValidPushupPosition) {
            // Determine specific feedback
            let feedbackMessage = 'ضع جسمك في وضعية الضغط الصحيحة (بلانك)';

            // Check what's missing
            if (!isFacingDown) {
                feedbackMessage = '⚠️ يرجى إظهار وجهك ورأسك للكاميرا';
            } else if (!isHandsPositioned) {
                feedbackMessage = '⚠️ تأكد من ظهور يديك في الكاميرا';
            } else if (horizontalRatio >= 0.4) {
                feedbackMessage = '⚠️ اجعل جسمك أفقياً (وضعية البلانك)';
            } else if (!isBodyStraight) {
                feedbackMessage = '⚠️ حافظ على جسمك مستقيماً';
            }

            // Reset to waiting state if we're not in a valid pushup position
            if (this.state !== 'waiting') {
                this.state = 'waiting';
            }

            return {
                isCorrect: false,
                feedback: [{
                    type: 'warning',
                    message: feedbackMessage
                }],
                reps: this.reps,
                state: this.state,
                phase: 'unknown',
                errors: ['INVALID_POSTURE']
            };
        }

        // 2. Phase Detection & Tempo (Only if in valid position)
        const now = Date.now();
        let newPhase = this.currentPhase;

        // Pushup: Start at top (elbows extended ~180), go down (eccentric), push up (concentric)
        if (this.state === 'waiting' && elbowAngle < 160) {
            newPhase = 'eccentric';
        } else if (this.state === 'bottom' && elbowAngle > 90) {
            newPhase = 'concentric';
        } else if (elbowAngle > 170 || elbowAngle < 80) {
            newPhase = 'isometric';
        }

        if (newPhase !== this.currentPhase) {
            const duration = (now - this.lastPhaseChangeTime) / 1000;
            if (this.currentPhase === 'eccentric') this.eccentricDuration = duration;
            if (this.currentPhase === 'concentric') this.concentricDuration = duration;

            this.currentPhase = newPhase;
            this.lastPhaseChangeTime = now;
        }

        // 3. Stability Tracking (Core/Hip Sag)
        const alignmentDeviation = Math.abs(180 - bodyAlignmentAngle);
        const stabilityScore = Math.max(0, 100 - alignmentDeviation * 2);
        this.stabilityBuffer.push(stabilityScore);
        if (this.stabilityBuffer.length > 30) this.stabilityBuffer.shift();
        const avgStability = this.stabilityBuffer.reduce((a, b) => a + b, 0) / this.stabilityBuffer.length;

        // 4. Failure Point Detection & Guidance
        let isCorrect = true;
        let nextInstruction = "";
        let focusPart: 'hips' | 'elbows' | 'shoulders' | 'back' | 'head' | 'none' = 'none';

        // Check 1: Hip Sag (Plank form)
        if (bodyAlignmentAngle < 160) {
            feedback.push({ message: "ارفع وركك! شد عضلات البطن", type: 'error', pointsToHighlight: ['left_hip'] });
            isCorrect = false;
            errors.push("HIP_SAG");
            focusPart = 'hips';
        } else if (bodyAlignmentAngle > 200) {
            feedback.push({ message: "اخفض وركك قليلاً", type: 'warning', pointsToHighlight: ['left_hip'] });
            isCorrect = false;
            errors.push("HIPS_HIGH");
            focusPart = 'hips';
        }

        // Check 2: Elbow Flare
        const elbowFlared = elbowAngle > 100 && elbowAngle < 140;

        // State Machine & Next Instruction
        switch (this.state) {
            case 'waiting':
                nextInstruction = "انزل ببطء مع الحفاظ على استقامة الظهر";
                focusPart = focusPart === 'none' ? 'back' : focusPart;

                // Start descending when elbows begin to bend from extended position
                if (elbowAngle < 160) {
                    this.state = 'descending';
                }
                break;

            case 'descending':
                nextInstruction = "استمر في النزول حتى يقترب صدرك من الأرض";
                focusPart = focusPart === 'none' ? 'elbows' : focusPart;

                if (elbowAngle <= 85) {
                    this.state = 'bottom';
                }
                if (elbowFlared) {
                    feedback.push({ type: 'warning', message: 'ضم مرفقيك للجسم (45 درجة)', pointsToHighlight: ['left_elbow'] });
                    focusPart = 'elbows';
                }
                break;

            case 'bottom':
                nextInstruction = "ادفع جسمك للأعلى بقوة!";
                focusPart = focusPart === 'none' ? 'shoulders' : focusPart;

                // Provide depth feedback
                if (elbowAngle <= 75) {
                    feedback.push({ type: 'success', message: '🔥 عمق ممتاز!', pointsToHighlight: ['left_elbow'] });
                } else if (elbowAngle <= 90) {
                    feedback.push({ type: 'success', message: '✅ عمق جيد!', pointsToHighlight: ['left_elbow'] });
                } else {
                    feedback.push({ type: 'warning', message: '⬇️ انزل أكثر بصدرك', pointsToHighlight: ['left_shoulder'] });
                    focusPart = 'shoulders';
                }

                // Start ascending when user begins to push up
                if (elbowAngle > 100) {
                    this.state = 'ascending';
                }
                break;

            case 'ascending':
                nextInstruction = "افرد ذراعيك بالكامل";
                focusPart = focusPart === 'none' ? 'elbows' : focusPart;

                if (elbowAngle > 160) {
                    // Only count rep once when completing the full cycle
                    // Rep is counted here because we've completed: waiting -> descending -> bottom -> ascending -> waiting
                    this.state = 'waiting';
                    this.reps++;
                    feedback.push({ type: 'success', message: '✅ تكرار ممتاز!', pointsToHighlight: [] });
                }
                break;
        }

        // Calculate Progress (0 = Top, 1 = Bottom)
        const progress = Math.min(1, Math.max(0, (170 - elbowAngle) / (170 - 70)));

        return {
            isCorrect,
            feedback,
            reps: this.reps,
            state: this.state,
            angleData: { elbowAngle, bodyAlignmentAngle },
            progress,
            phase: this.currentPhase,
            stabilityScore: Math.round(avgStability),
            tempo: `${this.eccentricDuration.toFixed(1)}s / ${this.concentricDuration.toFixed(1)}s`,
            errors,
            nextInstruction,
            focusPart
        };
    }
}
