// Voice prompts in Arabic and English for exercise feedback

export interface VoicePrompt {
    ar: string;
    en: string;
}

export const VoicePrompts = {
    // Success messages
    repComplete: {
        ar: 'ممتاز! عدة كاملة',
        en: 'Excellent! Rep complete',
    },
    goodDepth: {
        ar: 'عمق ممتاز',
        en: 'Good depth',
    },
    perfectForm: {
        ar: 'حركة مثالية',
        en: 'Perfect form',
    },

    // Squat-specific warnings
    goDeeper: {
        ar: 'انزل أعمق قليلاً',
        en: 'Go a little deeper',
    },
    keepBackStraight: {
        ar: 'حافظ على استقامة ظهرك',
        en: 'Keep your back straight',
    },
    pushHipsBack: {
        ar: 'أرجع وركيك للخلف',
        en: 'Push your hips back',
    },
    chestUp: {
        ar: 'ارفع صدرك',
        en: 'Chest up',
    },

    // Push-up specific warnings
    lowerChest: {
        ar: 'أنزل صدرك أكثر',
        en: 'Lower your chest',
    },
    liftHips: {
        ar: 'ارفع وركيك',
        en: 'Lift your hips',
    },
    keepBodyStraight: {
        ar: 'حافظ على استقامة جسمك',
        en: 'Keep your body straight',
    },
    elbowsCloser: {
        ar: 'قرّب مرفقيك من جسمك',
        en: 'Bring your elbows closer',
    },

    // Motivational messages
    keepGoing: {
        ar: 'واصل! أنت تبذل جهداً رائعاً',
        en: 'Keep going! You are doing great',
    },
    almostThere: {
        ar: 'تقريباً وصلت',
        en: 'Almost there',
    },
    youDidIt: {
        ar: 'أحسنت! لقد فعلتها',
        en: 'You did it!',
    },

    // General
    getReady: {
        ar: 'استعد',
        en: 'Get ready',
    },
    bodyNotVisible: {
        ar: 'تأكد من ظهور جسمك بالكامل',
        en: 'Make sure your full body is visible',
    },
};

export type VoicePromptKey = keyof typeof VoicePrompts;
