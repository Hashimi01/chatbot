import { Keypoint } from '@tensorflow-models/pose-detection';
import { AnalysisResult, ExerciseFeedback, PoseAnalyzer as AbstractPoseAnalyzer } from './PoseAnalyzer';
import { TreePoseAnalyzer } from './TreePoseAnalyzer';

// --------------------------------------------------------
// 2. الفئة الأساسية (The Brain) - تحتوي على الرياضيات المشتركة
// --------------------------------------------------------

abstract class BaseAnalyzer extends AbstractPoseAnalyzer {
    protected feedback: ExerciseFeedback[] = [];
    protected lastRepTime: number = 0;

    // reset and updateKeypoints are already in AbstractPoseAnalyzer

    // دالة مساعدة: البحث عن نقطة
    protected getPoint(name: string): Keypoint | undefined {
        return this.keypoints.find(k => k.name === name && (k.score || 0) > 0.3);
    }

    // دالة مساعدة: حساب الزاوية بين 3 نقاط
    // calculateAngle is already in AbstractPoseAnalyzer but we can override or use it
    // The user provided a specific implementation, let's use the parent one or this one.
    // Parent one uses radians/degrees conversion too.

    // دالة مساعدة: حساب المسافة العمودية
    protected getVerticalDistance(p1Name: string, p2Name: string): number {
        const p1 = this.getPoint(p1Name);
        const p2 = this.getPoint(p2Name);
        if (!p1 || !p2) return 0;
        return p1.y - p2.y;
    }
}

// --------------------------------------------------------
// 3. محللات التمارين السبعة (The 7 Exercises Logic)
// --------------------------------------------------------

// === 1. القرفصاء (Squat) ===
class SquatAnalyzer extends BaseAnalyzer {
    analyze(): AnalysisResult {
        this.feedback = [];
        const kneeAngle = this.getAngle('left_hip', 'left_knee', 'left_ankle');
        const hipY = this.getPoint('left_hip')?.y || 0;
        const kneeY = this.getPoint('left_knee')?.y || 0;

        // Logic
        if (kneeAngle > 160) {
            if (this.state === 'down') this.reps++;
            this.state = 'up';
        } else if (kneeAngle < 100) {
            this.state = 'down';
            // التحقق من العمق
            if (hipY < kneeY - 20) { // الفخذ أعلى من الركبة بكثير
                this.feedback.push({ type: 'warning', message: 'انزل أكثر! 🔥', pointsToHighlight: ['left_hip'] });
            } else {
                this.feedback.push({ type: 'success', message: 'عمق ممتاز ✅' });
            }
        }

        return {
            reps: this.reps,
            state: this.state,
            feedback: this.feedback,
            isCorrect: true, // Mapped from isPostureCorrect
            progress: 0, // Default
            nextInstruction: this.feedback.length > 0 ? this.feedback[0].message : undefined
        };
    }
}

// === 2. تمرين الضغط (Pushup) ===
class PushupAnalyzer extends BaseAnalyzer {
    analyze(): AnalysisResult {
        this.feedback = [];
        const elbowAngle = this.getAngle('left_shoulder', 'left_elbow', 'left_wrist');
        const backAngle = this.getAngle('left_shoulder', 'left_hip', 'left_ankle');

        // Posture Check (Plank Integrity)
        if (backAngle < 160) {
            this.feedback.push({ type: 'error', message: 'ظهرك منحنٍ! ارفعه قليلاً ⚠️', pointsToHighlight: ['left_hip'] });
            return {
                reps: this.reps,
                state: this.state,
                feedback: this.feedback,
                isCorrect: false,
                nextInstruction: 'Fix your back posture'
            };
        }

        // Rep Logic
        if (elbowAngle > 160) {
            if (this.state === 'down') this.reps++;
            this.state = 'up';
        } else if (elbowAngle < 90) {
            this.state = 'down';
            this.feedback.push({ type: 'success', message: 'صدرك قريب من الأرض 👍' });
        }

        return {
            reps: this.reps,
            state: this.state,
            feedback: this.feedback,
            isCorrect: true,
            nextInstruction: this.state === 'down' ? 'Push up!' : 'Lower body'
        };
    }
}

// === 3. الطعن (Lunges) ===
class LungeAnalyzer extends BaseAnalyzer {
    analyze(): AnalysisResult {
        this.feedback = [];
        const frontKneeAngle = this.getAngle('left_hip', 'left_knee', 'left_ankle');
        // const backKneeAngle = this.getAngle('right_hip', 'right_knee', 'right_ankle'); 

        if (frontKneeAngle > 160) {
            if (this.state === 'down') this.reps++;
            this.state = 'up';
        } else if (frontKneeAngle < 100) { // نزول للطعن
            this.state = 'down';

            // Safety Check: الركبة لا تتجاوز القدم
            const kneeX = this.getPoint('left_knee')?.x || 0;
            const ankleX = this.getPoint('left_ankle')?.x || 0;

            if (Math.abs(kneeX - ankleX) > 50) { // قيمة تقريبية
                this.feedback.push({ type: 'warning', message: 'ركبتك تتقدم كثيراً! ⚠️', pointsToHighlight: ['left_knee'] });
            } else {
                this.feedback.push({ type: 'success', message: 'توازن رائع ⚖️' });
            }
        }
        return {
            reps: this.reps,
            state: this.state,
            feedback: this.feedback,
            isCorrect: true
        };
    }
}

// === 4. البلانك (Plank) - يعتمد على الزمن ===
class PlankAnalyzer extends BaseAnalyzer {
    private startTime: number | null = null;

    analyze(): AnalysisResult {
        this.feedback = [];
        const shoulderHipAnkle = this.getAngle('left_shoulder', 'left_hip', 'left_ankle');

        // التحقق من الاستقامة (180 درجة هي الخط المستقيم)
        const isStraight = shoulderHipAnkle > 165 && shoulderHipAnkle < 195;

        if (isStraight) {
            if (!this.startTime) this.startTime = Date.now();
            // هنا الـ reps تمثل الثواني
            const seconds = Math.floor((Date.now() - this.startTime) / 1000);
            this.reps = seconds;
            this.feedback.push({ type: 'success', message: 'ثبات ممتاز! 🔥' });
            return {
                reps: this.reps,
                state: 'holding',
                feedback: this.feedback,
                isCorrect: true,
                tempo: `${seconds}s`
            };
        } else {
            // إذا كسر الثبات
            this.startTime = null; // إعادة تعيين (أو يمكن إيقافه مؤقتاً)
            if (shoulderHipAnkle < 165) {
                this.feedback.push({ type: 'error', message: 'ارفع خصرك للأعلى! ⬆️', pointsToHighlight: ['left_hip'] });
            } else {
                this.feedback.push({ type: 'error', message: 'اخفض خصرك قليلاً! ⬇️', pointsToHighlight: ['left_hip'] });
            }
            return {
                reps: this.reps,
                state: 'bad_form',
                feedback: this.feedback,
                isCorrect: false
            };
        }
    }
}

// === 5. القفز الجانبي (Jumping Jacks) ===
class JumpingJackAnalyzer extends BaseAnalyzer {
    analyze(): AnalysisResult {
        this.feedback = [];
        const leftWristY = this.getPoint('left_wrist')?.y || 0;
        const leftShoulderY = this.getPoint('left_shoulder')?.y || 0;
        const leftAnkleX = this.getPoint('left_ankle')?.x || 0;
        const rightAnkleX = this.getPoint('right_ankle')?.x || 0;

        // الحالة 1: اليدان للأعلى والقدمان متباعدتان
        const handsUp = leftWristY < leftShoulderY - 50; // اليد فوق الكتف
        const legsApart = Math.abs(leftAnkleX - rightAnkleX) > 100; // مسافة بين القدمين

        // الحالة 2: اليدان للأسفل والقدمان مضمومتان
        const handsDown = leftWristY > leftShoulderY;
        const legsTogether = Math.abs(leftAnkleX - rightAnkleX) < 80;

        if (handsUp && legsApart) {
            this.state = 'open';
        } else if (handsDown && legsTogether) {
            if (this.state === 'open') {
                this.reps++;
                this.feedback.push({ type: 'success', message: 'قفزة جيدة! 🐇' });
            }
            this.state = 'closed';
        }

        return {
            reps: this.reps,
            state: this.state,
            feedback: this.feedback,
            isCorrect: true
        };
    }
}

// === 6. رفع الركبة (High Knees) ===
class HighKneeAnalyzer extends BaseAnalyzer {
    analyze(): AnalysisResult {
        this.feedback = [];
        const leftKneeY = this.getPoint('left_knee')?.y || 999;
        const leftHipY = this.getPoint('left_hip')?.y || 0;

        // التحقق: هل الركبة أعلى من الحوض؟ (في البرمجة Y يقل كلما صعدنا للأعلى)
        if (leftKneeY < leftHipY) {
            if (this.state === 'down') {
                this.reps++;
                this.feedback.push({ type: 'success', message: 'ممتاز! 🚀' });
            }
            this.state = 'up';
        } else {
            this.state = 'down';
        }

        return {
            reps: this.reps,
            state: this.state,
            feedback: this.feedback,
            isCorrect: true
        };
    }
}

// === 7. ضغط الأكتاف (Overhead Press) ===
class OverheadPressAnalyzer extends BaseAnalyzer {
    analyze(): AnalysisResult {
        this.feedback = [];
        const leftElbowAngle = this.getAngle('left_shoulder', 'left_elbow', 'left_wrist');
        const rightElbowAngle = this.getAngle('right_shoulder', 'right_elbow', 'right_wrist');

        const avgAngle = (leftElbowAngle + rightElbowAngle) / 2;

        if (avgAngle > 160) { // الذراع ممدودة بالكامل للأعلى
            if (this.state === 'down') {
                this.reps++;
                this.feedback.push({ type: 'success', message: 'قوي! 💪' });
            }
            this.state = 'up';
        } else if (avgAngle < 90) { // الذراع مثنية عند الأكتاف
            this.state = 'down';
        } else {
            // نصيحة أثناء الحركة
            this.feedback.push({ type: 'info' as any, message: 'ادفع للأعلى بالكامل ⬆️' });
        }

        return {
            reps: this.reps,
            state: this.state,
            feedback: this.feedback,
            isCorrect: true
        };
    }
}

// --------------------------------------------------------
// 4. المصنع (Factory) - الزر السحري للتبديل
// --------------------------------------------------------

export class AnalyzerFactory {
    static create(exerciseName: string): AbstractPoseAnalyzer {
        switch (exerciseName.toLowerCase()) {
            case 'squat': return new SquatAnalyzer();
            case 'pushup': return new PushupAnalyzer();
            case 'lunge': return new LungeAnalyzer();
            case 'plank': return new PlankAnalyzer();
            case 'jumping_jack': return new JumpingJackAnalyzer();
            case 'high_knees': return new HighKneeAnalyzer();
            case 'overhead_press': return new OverheadPressAnalyzer();
            case 'tree_pose': return new TreePoseAnalyzer();
            default: return new SquatAnalyzer(); // الافتراضي
        }
    }
}
