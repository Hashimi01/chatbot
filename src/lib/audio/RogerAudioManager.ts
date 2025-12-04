import { Howl } from 'howler';

export class RogerAudioManager {
  private static instance: RogerAudioManager;
  private icqSound: Howl | null = null;
  private keyboardSound: Howl | null = null;
  private soundEnabled: boolean = true;
  private audioUnlocked: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initSounds();
    }
  }

  public static getInstance(): RogerAudioManager {
    if (!RogerAudioManager.instance) {
      RogerAudioManager.instance = new RogerAudioManager();
    }
    return RogerAudioManager.instance;
  }

  private initSounds() {
    // ICQ notification sound (classic "uh-oh" sound)
    // Use fallback directly to avoid 404 errors
    const icqFallback = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt555NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaizsIGGS66uyRPAoRV67k77NeGgo1j9nyxXEhBSh+zA==';
    
    this.icqSound = new Howl({
      src: [icqFallback],
      volume: 0.6,
      preload: true,
    });

    // Keyboard typing sound - use fallback directly
    const keyboardFallback = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt555NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaizsIGGS66uyRPAoRV67k77NeGgo1j9nyxXEhBSh+zA==';
    
    this.keyboardSound = new Howl({
      src: [keyboardFallback],
      volume: 0.3,
      preload: true,
    });
  }

  public unlockAudio() {
    this.audioUnlocked = true;
    // Play a silent sound to unlock audio context
    if (this.icqSound) {
      this.icqSound.volume(0);
      this.icqSound.play();
      this.icqSound.volume(0.6);
    }
  }

  public playICQ() {
    if (!this.soundEnabled || !this.audioUnlocked) return;
    if (this.icqSound) {
      this.icqSound.play();
    }
  }

  public playKeyboardClick() {
    if (!this.soundEnabled || !this.audioUnlocked) return;
    if (this.keyboardSound) {
      // Try to play sprite, fallback to normal play
      try {
        this.keyboardSound.play('click');
      } catch {
        this.keyboardSound.play();
      }
    }
  }

  public playTypingSequence(duration: number, onComplete?: () => void) {
    if (!this.soundEnabled || !this.audioUnlocked) return;
    
    const interval = 150; // Play click every 150ms
    const clicks = Math.floor(duration / interval);
    let clickCount = 0;

    const playClick = () => {
      if (clickCount < clicks) {
        this.playKeyboardClick();
        clickCount++;
        setTimeout(playClick, interval);
      } else if (onComplete) {
        onComplete();
      }
    };

    playClick();
  }

  public toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

