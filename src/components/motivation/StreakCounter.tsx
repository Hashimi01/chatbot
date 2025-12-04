import React from 'react';

interface StreakCounterProps {
    currentStreak: number;
    bestStreak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
    currentStreak,
    bestStreak,
}) => {
    return (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-400/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-4xl animate-bounce">🔥</span>
                    <div>
                        <p className="text-xs text-gray-300">Current Streak</p>
                        <p className="text-2xl font-black text-white">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Best</p>
                    <p className="text-lg font-bold text-orange-300">{bestStreak}</p>
                </div>
            </div>
            {currentStreak >= 3 && (
                <p className="mt-2 text-xs text-center text-orange-200 font-semibold">
                    {currentStreak >= 7 ? '🏆 You\'re on fire!' : '💪 Keep it up!'}
                </p>
            )}
        </div>
    );
};
