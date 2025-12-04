import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export class MoveNetLoader {
    private static instance: MoveNetLoader;
    private detector: poseDetection.PoseDetector | null = null;

    private constructor() { }

    public static getInstance(): MoveNetLoader {
        if (!MoveNetLoader.instance) {
            MoveNetLoader.instance = new MoveNetLoader();
        }
        return MoveNetLoader.instance;
    }

    public async loadModel(modelType: 'Lightning' | 'Thunder' = 'Thunder'): Promise<poseDetection.PoseDetector> {
        if (this.detector) {
            return this.detector;
        }

        await tf.ready();
        const detectorConfig = {
            modelType: modelType === 'Thunder' ? poseDetection.movenet.modelType.SINGLEPOSE_THUNDER : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        return this.detector;
    }
}
