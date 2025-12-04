import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CameraFeed } from '@/components/exercise/CameraFeed';
import { StatsPanel } from '@/components/dashboard/StatsPanel';
import { SceneContainer } from '@/components/3d/SceneContainer';
import { DualModelView } from '@/components/3d/DualModelView';
import { ParticleField } from '@/components/effects/ParticleField';
import { AnalyzerFactory } from '@/lib/ai/ExerciseLib';
import { AnalysisResult, PoseAnalyzer } from '@/lib/ai/PoseAnalyzer';
import { ArrowLeft } from 'lucide-react';

const WorkoutPage = () => {
    const router = useRouter();
    const { exercise } = router.query;
    const [analyzer, setAnalyzer] = useState<PoseAnalyzer | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    useEffect(() => {
        if (exercise) {
            setAnalyzer(AnalyzerFactory.create(exercise as string));
        }
    }, [exercise]);

    const handleAnalysisUpdate = (newResult: AnalysisResult) => {
        setResult(newResult);
    };

    if (!exercise || !analyzer) return (
        <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl text-cyan-300 animate-pulse">Initializing AI...</p>
            </div>
        </div>
    );

    const exerciseName = (exercise as string).replace('_', ' ').toUpperCase();

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <Head>
                <title>{exerciseName} - DecaMotion AI</title>
            </Head>

            {/* Animated gradient background */}
            <div className="fixed inset-0 bg-gradient-to-br from-black via-blue-950/50 to-purple-950/50"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>

            {/* Particle field */}
            <ParticleField count={80} color="#00D9FF" />

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-6 z-50">
                <div className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-3 text-white/80 hover:text-cyan-400 transition-all duration-300 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-bold text-lg">Exit Workout</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {exerciseName}
                        </h1>
                    </div>
                    <div className="w-32" />
                </div>
            </header>

            <main className="relative w-full h-screen flex pt-24 px-6 pb-6 gap-6">
                {/* Left: Stats Panel */}
                <div className="w-72">
                    <StatsPanel result={result} />
                </div>

                {/* Center: Camera Feed */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-50 blur-xl"></div>
                        <div className="relative h-full">
                            <CameraFeed
                                analyzer={analyzer}
                                onAnalysisUpdate={handleAnalysisUpdate}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: 3D Reference Model */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 relative">
                        {/* Glow effect for 3D container */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl opacity-40 blur-lg"></div>
                        <div className="relative h-full backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Reference Model Only */}
                            <DualModelView
                                exercise={exercise === 'tree_pose' ? 'squat' : exercise as 'squat' | 'pushup'}
                                progress={result?.progress || 0}
                                userKeypoints={analyzer?.getKeypoints() || []}
                                modelUrl={
                                    exercise === 'pushup'
                                        ? "/models/Push Up.fbx"
                                        : exercise === 'squat'
                                            ? "/models/Air Squat Bent Arms.fbx"
                                            : "/models/athletic-male.glb"
                                }
                                focusPart={result?.focusPart}
                                nextInstruction={result?.nextInstruction}
                                errors={result?.errors}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WorkoutPage;
