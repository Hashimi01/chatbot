import React from 'react';

interface AchievementBadgeProps {
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    name,
    description,
    icon,
    unlocked,
}) => {
    return (
        <div
            className={`
        relative p-3 rounded-lg border-2 transition-all duration-300
        ${unlocked
                    ? 'bg-deca-gold/20 border-deca-gold shadow-lg shadow-deca-gold/30 animate-pulse'
                    : 'bg-gray-700/30 border-gray-600 opacity-50 grayscale'
                }
      `}
        >
            <div className="flex items-center gap-3">
                <div className="text-3xl">{icon}</div>
                <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{name}</h4>
                    <p className="text-xs text-gray-300">{description}</p>
                </div>
                {unlocked && (
                    <div className="text-deca-gold text-xl">✓</div>
                )}
            </div>
            {!unlocked && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs font-semibold">🔒 Locked</span>
                </div>
            )}
        </div>
    );
};
