import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { MoveNetLoader } from '@/lib/ai/MoveNetLoader';
import { PoseAnalyzer, AnalysisResult } from '@/lib/ai/PoseAnalyzer';
import { SquatAnalyzer } from '@/lib/ai/SquatAnalyzer';
import { PushupAnalyzer } from '@/lib/ai/PushupAnalyzer';
import { AudioManager } from '@/lib/audio/AudioManager';
import { KeypointSmoother } from '@/lib/ai/KeypointSmoother';

interface CameraFeedProps {
    analyzer: PoseAnalyzer | null;
    onAnalysisUpdate: (result: AnalysisResult) => void;
}

// Define skeleton connections as per user's "Magic Recipe"
const KEYPOINT_CONNECTIONS: Record<string, string[]> = {
    nose: ['left_eye', 'right_eye'],
    left_eye: ['left_ear'],
    right_eye: ['right_ear'],
    left_shoulder: ['right_shoulder', 'left_elbow', 'left_hip'],
    right_shoulder: ['right_elbow', 'right_hip'],
    left_elbow: ['left_wrist'],
    right_elbow: ['right_wrist'],
    left_hip: ['right_hip', 'left_knee'],
    right_hip: ['right_knee'],
    left_knee: ['left_ankle'],
    right_knee: ['right_ankle']
};

export const CameraFeed: React.FC<CameraFeedProps> = ({ analyzer, onAnalysisUpdate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const audioManager = useRef(AudioManager.getInstance()).current;
    const smootherRef = useRef(new KeypointSmoother(5)); // Window size of 5 frames
    const previousStateRef = useRef<string>('waiting');
    const previousRepsRef = useRef<number>(0);
    const [trackingQuality, setTrackingQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

    useEffect(() => {
        const init = async () => {
            const detector = await MoveNetLoader.getInstance().loadModel();

            smootherRef.current.reset(); // Reset smoother on analyzer change

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        if (analyzer) {
                            detectPose(detector, analyzer);
                        }
                    };
                }
            }
        };

        if (analyzer) {
            init();
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [analyzer]);

    const detectPose = async (detector: poseDetection.PoseDetector, currentAnalyzer: PoseAnalyzer) => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const poses = await detector.estimatePoses(video);

                if (poses.length > 0) {
                    const rawKeypoints = poses[0].keypoints;
                    const keypoints = smootherRef.current.smooth(rawKeypoints);

                    // Calculate tracking quality based on confidence scores
                    const avgConfidence = keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) / keypoints.length;
                    const highConfidenceCount = keypoints.filter(kp => (kp.score || 0) > 0.6).length;

                    if (avgConfidence > 0.7 && highConfidenceCount > 12) {
                        setTrackingQuality('excellent');
                    } else if (avgConfidence > 0.5 && highConfidenceCount > 10) {
                        setTrackingQuality('good');
                    } else if (avgConfidence > 0.4 && highConfidenceCount > 8) {
                        setTrackingQuality('fair');
                    } else {
                        setTrackingQuality('poor');
                    }

                    currentAnalyzer.updateKeypoints(keypoints);
                    const result = currentAnalyzer.analyze();
                    onAnalysisUpdate(result);

                    // Audio feedback logic
                    // 1. Rep completed
                    if (result.reps > previousRepsRef.current) {
                        audioManager.playSound('success');
                        audioManager.speak('repComplete');
                        previousRepsRef.current = result.reps;
                    }

                    // 2. State-based feedback
                    if (result.state !== previousStateRef.current) {
                        if (result.state === 'bottom') {
                            // Good depth feedback
                            const hasGoodDepth = result.feedback.some(f => f.type === 'success' && f.message.includes('depth'));
                            if (hasGoodDepth) {
                                audioManager.speak('goodDepth');
                            }
                        }
                        previousStateRef.current = result.state;
                    }

                    // 3. Error/Warning feedback
                    result.feedback.forEach(item => {
                        if (item.type === 'error') {
                            // audioManager.playSound('error'); // Disabled per user request
                            // Map error messages to voice prompts
                            if (item.message.includes('back straight')) audioManager.speak('keepBackStraight');
                            else if (item.message.includes('hips back')) audioManager.speak('pushHipsBack');
                            else if (item.message.includes('hips')) audioManager.speak('liftHips');
                        } else if (item.type === 'warning') {
                            if (item.message.includes('deeper')) audioManager.speak('goDeeper');
                            else if (item.message.includes('Chest up')) audioManager.speak('chestUp');
                            else if (item.message.includes('elbows')) audioManager.speak('elbowsCloser');
                            else if (item.message.includes('chest')) audioManager.speak('lowerChest');
                        }
                    });

                    drawCanvas(ctx, keypoints, result);
                }
            }
        }
        requestRef.current = requestAnimationFrame(() => detectPose(detector, currentAnalyzer));
    };

    const drawCanvas = (ctx: CanvasRenderingContext2D, keypoints: poseDetection.Keypoint[], result: AnalysisResult) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 1. Convert keypoints array to a map for faster access (Optimization)
        const keypointsMap: Record<string, poseDetection.Keypoint> = {};
        keypoints.forEach((point) => {
            if ((point.score || 0) > 0.3) { // Threshold
                keypointsMap[point.name || ''] = point;
            }
        });

        // Helper to get color based on analysis
        const getSegmentColor = (part1: string, part2: string) => {
            // Default color
            let color = '#00D9FF'; // Cyan (Neutral/Good)

            // Check for specific errors affecting this segment
            if (result.errors && result.errors.length > 0) {
                // Hip Sag -> Color torso/legs red
                if (result.errors.includes('HIP_SAG') || result.errors.includes('HIPS_HIGH')) {
                    if (['left_shoulder', 'left_hip', 'right_shoulder', 'right_hip', 'left_knee', 'right_knee'].includes(part1) &&
                        ['left_shoulder', 'left_hip', 'right_shoulder', 'right_hip', 'left_knee', 'right_knee'].includes(part2)) {
                        color = '#FF4500'; // Red
                    }
                }
            }

            // Check for focus part (Visual Guidance)
            if (result.focusPart) {
                if (result.focusPart === 'elbows' && (part1.includes('elbow') || part2.includes('elbow'))) {
                    color = '#FFFF00'; // Yellow highlight
                }
                if (result.focusPart === 'hips' && (part1.includes('hip') || part2.includes('hip'))) {
                    color = '#FFFF00';
                }
                if (result.focusPart === 'shoulders' && (part1.includes('shoulder') || part2.includes('shoulder'))) {
                    color = '#FFFF00';
                }
            }

            return color;
        };

        // 2. Draw Skeleton Lines using the Map
        Object.keys(KEYPOINT_CONNECTIONS).forEach((startName) => {
            const startPoint = keypointsMap[startName];

            if (startPoint) {
                KEYPOINT_CONNECTIONS[startName].forEach((endName) => {
                    const endPoint = keypointsMap[endName];

                    if (endPoint) {
                        ctx.beginPath();
                        ctx.moveTo(startPoint.x, startPoint.y);
                        ctx.lineTo(endPoint.x, endPoint.y);

                        // Dynamic styling
                        ctx.lineWidth = 4;
                        ctx.lineCap = 'round';
                        ctx.strokeStyle = getSegmentColor(startName, endName);

                        // Add glow effect
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = ctx.strokeStyle;

                        ctx.stroke();

                        // Reset shadow
                        ctx.shadowBlur = 0;
                    }
                });
            }
        });

        // 3. Draw Keypoints (Joints)
        Object.values(keypointsMap).forEach((kp) => {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Outer ring
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = '#0082C3';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // 4. Draw Feedback Highlights (Pulsing Circles)
        result.feedback.forEach(item => {
            if (item.pointsToHighlight) {
                item.pointsToHighlight.forEach(pointName => {
                    const kp = keypointsMap[pointName];
                    if (kp) {
                        const time = Date.now() / 200;
                        const radius = 15 + Math.sin(time) * 5; // Pulsing effect

                        ctx.beginPath();
                        ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
                        ctx.fillStyle = item.type === 'error' ? 'rgba(255, 69, 0, 0.5)' : (item.type === 'warning' ? 'rgba(255, 165, 0, 0.5)' : 'rgba(80, 200, 120, 0.5)');
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
                        ctx.strokeStyle = item.type === 'error' ? '#FF4500' : (item.type === 'warning' ? '#FFA500' : '#50C878');
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                });
            }
        });
    };

    const qualityColors = {
        excellent: 'from-green-500 to-emerald-600',
        good: 'from-blue-500 to-cyan-600',
        fair: 'from-yellow-500 to-orange-500',
        poor: 'from-red-500 to-rose-600'
    };

    const qualityLabels = {
        excellent: '🎯 Excellent',
        good: '✓ Good',
        fair: '⚠ Fair',
        poor: '❌ Poor'
    };

    return (
        <div className="relative w-full max-w-[640px] mx-auto rounded-lg overflow-hidden shadow-xl border-4 border-deca-blue">
            <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="relative z-10 w-full h-full" />

            {/* Tracking Quality Badge */}
            <div className="absolute top-4 left-4 z-20">
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${qualityColors[trackingQuality]} text-white font-bold text-sm shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center gap-2 animate-pulse`}>
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    {qualityLabels[trackingQuality]}
                </div>
            </div>
        </div>
    );
};
