import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '@/lib/ai/PoseAnalyzer';
import { AchievementBadge } from '../motivation/AchievementBadge';
import { StreakCounter } from '../motivation/StreakCounter';

interface StatsPanelProps {
    result: AnalysisResult | null;
}

// Animated number counter component
const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 500 }) => {
    const [display, setDisplay] = useState(value);

    useEffect(() => {
        const start = display;
        const end = value;
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                setDisplay(end);
                clearInterval(timer);
            } else {
                setDisplay(current);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <>{Math.round(display)}</>;
};

export const StatsPanel: React.FC<StatsPanelProps> = ({ result }) => {
    if (!result) return null;

    const currentStreak = result.reps > 0 ? result.reps : 0;
    const bestStreak = 15;
    const unlockedBadges = ['first_steps', 'warming_up'];
    if (result.reps >= 10) unlockedBadges.push('getting_strong');
    if (result.reps >= 20) unlockedBadges.push('perfectionist');

    return (
        <div className="relative w-full h-full">
            {/* Glassmorphism container with animated gradient border */}
            <div className="relative h-full max-h-screen overflow-y-auto">
                {/* Gradient border animation */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 blur-sm animate-pulse"></div>

                {/* Main container */}
                <div className="relative h-fit backdrop-blur-2xl bg-black/40 border border-white/20 rounded-3xl p-4 shadow-2xl">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        <div className="absolute -inset-full animate-spin-slow">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent"></div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                                LIVE STATS
                            </h2>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-75"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150"></div>
                            </div>
                        </div>

                        {/* Rep Counter - Large and prominent */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-300"></div>
                            <div className="relative bg-gradient-to-br from-blue-600/30 to-cyan-600/30 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-4">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-cyan-300 font-bold text-xs uppercase tracking-wider">Reps</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                            <AnimatedNumber value={result.reps} />
                                        </span>
                                        <span className="text-xl text-cyan-400/50">💪</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status & Phase */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</div>
                                <div className={`text-sm font-bold px-2 py-1 rounded-lg inline-block ${result.isCorrect
                                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                                        : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/30'
                                    }`}>
                                    {result.state.toUpperCase()}
                                </div>
                            </div>

                            {result.phase && result.phase !== 'unknown' && (
                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phase</div>
                                    <div className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent uppercase">
                                        {result.phase}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Advanced Metrics */}
                        {(result.tempo || result.stabilityScore !== undefined) && (
                            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-3 space-y-2">


                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest">Biomechanics</h3>
                                </div>

                                {result.tempo && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-300">Tempo</span>
                                        <span className="font-mono font-bold text-yellow-300 text-sm px-2 py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                            {result.tempo}
                                        </span>
                                    </div>
                                )}

                                {result.stabilityScore !== undefined && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-300">Stability</span>
                                            <span className={`font-mono font-bold text-lg ${result.stabilityScore > 80 ? 'text-green-400' :
                                                    result.stabilityScore > 50 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                <AnimatedNumber value={result.stabilityScore} />%
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${result.stabilityScore > 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                        result.stabilityScore > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                            'bg-gradient-to-r from-red-500 to-rose-500'
                                                    }`}
                                                style={{ width: `${result.stabilityScore}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Feedback Messages - Compact */}
                        {result.feedback.length > 0 && (
                            <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                                {result.feedback.slice(0, 3).map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg text-xs font-medium backdrop-blur-xl border ${item.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-200' :
                                                item.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' :
                                                    'bg-red-500/10 border-red-500/30 text-red-200'
                                            }`}
                                    >
                                        <span className="mr-1">
                                            {item.type === 'success' ? '✓' : item.type === 'warning' ? '⚠' : '✕'}
                                        </span>
                                        {item.message}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Streak Counter - Compact */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2">
                            <StreakCounter currentStreak={currentStreak} bestStreak={bestStreak} />
                        </div>

                        {/* Badges - Smaller */}
                        <div className="grid grid-cols-2 gap-2">
                            <AchievementBadge name="First" description="1 Rep" icon="🚀" unlocked={unlockedBadges.includes('first_steps')} />
                            <AchievementBadge name="Hot" description="5 Reps" icon="🔥" unlocked={unlockedBadges.includes('warming_up')} />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 209, 255, 0.5);
                    border-radius: 20px;
                }
                .delay-75 {
                    animation-delay: 75ms;
                }
                .delay-150 {
                    animation-delay: 150ms;
                }
            `}</style>
        </div>
    );
};
