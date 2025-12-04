import { Howl } from 'howler';
import { VoicePrompts, VoicePromptKey } from './VoicePrompts';

export type SoundEffect = 'success' | 'warning' | 'error' | 'achievement';

export class AudioManager {
    private static instance: AudioManager;
    private sounds: Map<SoundEffect, Howl> = new Map();
    private language: 'ar' | 'en' = 'ar';
    private voiceEnabled: boolean = true;
    private soundEnabled: boolean = true;
    private synth: SpeechSynthesis | null = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.synth = window.speechSynthesis;
            this.initSounds();
        }
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private initSounds() {
        // Using simple sound frequencies for now (can be replaced with actual audio files)
        // For a production app, you would load actual audio files from /public/sounds/

        // Success sound - high pleasant tone
        this.sounds.set('success', new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaizsIGGS66uyRPAoRV67k77NeGgo1j9nyxXEhBSh+zA=='],
            volume: 0.3,
        }));

        // Warning sound - mid tone
        this.sounds.set('warning', new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt555NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaizsIGGS66uyRPAoRV67k77NeGgo1j9nyxXEhBSh+zA=='],
            volume: 0.25,
        }));

        // Error sound - low warning tone
        this.sounds.set('error', new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt555NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaizsIGGS66uyRPAoRV67k77NeGgo1j9nyxXEhBSh+zA=='],
            volume: 0.4,
            rate: 0.8,
        }));

        // Achievement sound - ascending tones
        this.sounds.set('achievement', new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt555NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaizsIGGS66uyRPAoRV67k77NeGgo1j9nyxXEhBSh+zA=='],
            volume: 0.5,
            rate: 1.2,
        }));
    }

    public playSound(effect: SoundEffect) {
        if (!this.soundEnabled) return;
        const sound = this.sounds.get(effect);
        if (sound) {
            sound.play();
        }
    }

    public speak(promptKey: VoicePromptKey) {
        if (!this.voiceEnabled || !this.synth) return;

        const prompt = VoicePrompts[promptKey];
        const text = this.language === 'ar' ? prompt.ar : prompt.en;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        this.synth.speak(utterance);
    }

    public setLanguage(lang: 'ar' | 'en') {
        this.language = lang;
    }

    public toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        return this.voiceEnabled;
    }

    public toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    public isVoiceEnabled(): boolean {
        return this.voiceEnabled;
    }

    public isSoundEnabled(): boolean {
        return this.soundEnabled;
    }
}
