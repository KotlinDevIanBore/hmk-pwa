/**
 * Speech utility for accessibility
 * Provides text-to-speech functionality to help blind and visually impaired users
 */

export interface SpeechOptions {
  /** Language code (e.g., 'en-US', 'sw-KE') */
  lang?: string;
  /** Speech rate (0.1 to 10, default: 1) */
  rate?: number;
  /** Speech pitch (0 to 2, default: 1) */
  pitch?: number;
  /** Speech volume (0 to 1, default: 1) */
  volume?: number;
  /** Whether to queue speech or interrupt current speech */
  interrupt?: boolean;
}

export interface SpeechInstance {
  /** Speak the provided text */
  speak: (text: string, options?: SpeechOptions) => Promise<void>;
  /** Stop current speech */
  stop: () => void;
  /** Check if speech is currently active */
  isSpeaking: () => boolean;
  /** Cancel all queued speech */
  cancel: () => void;
}

class SpeechManager implements SpeechInstance {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.isSupported = 'speechSynthesis' in window;
    }
  }

  /**
   * Check if speech synthesis is supported in the current browser
   */
  isAvailable(): boolean {
    return this.isSupported && this.synthesis !== null;
  }

  /**
   * Speak the provided text with optional configuration
   */
  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (!this.isAvailable() || !text.trim()) {
      return;
    }

    const {
      lang = 'en-US',
      rate = 1,
      pitch = 1,
      volume = 1,
      interrupt = true,
    } = options;

    // Stop current speech if interrupt is enabled
    if (interrupt) {
      this.stop();
    }

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = Math.max(0.1, Math.min(10, rate));
        utterance.pitch = Math.max(0, Math.min(2, pitch));
        utterance.volume = Math.max(0, Math.min(1, volume));

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (error) => {
          this.currentUtterance = null;
          reject(error);
        };

        this.currentUtterance = utterance;
        this.synthesis!.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the current speech
   */
  stop(): void {
    if (this.synthesis && this.isSpeaking()) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Check if speech is currently active
   */
  isSpeaking(): boolean {
    return (
      this.synthesis !== null &&
      this.synthesis.speaking &&
      this.currentUtterance !== null
    );
  }

  /**
   * Cancel all queued speech
   */
  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) {
      return [];
    }
    return this.synthesis.getVoices();
  }

  /**
   * Find a voice by language code
   */
  findVoiceByLang(lang: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    // Try exact match first
    let voice = voices.find((v) => v.lang === lang);
    // Try language prefix match (e.g., 'en' for 'en-US')
    if (!voice) {
      const langPrefix = lang.split('-')[0];
      voice = voices.find((v) => v.lang.startsWith(langPrefix));
    }
    return voice || null;
  }
}

// Singleton instance
let speechManagerInstance: SpeechManager | null = null;

/**
 * Get the singleton speech manager instance
 */
export function getSpeechManager(): SpeechManager {
  if (!speechManagerInstance) {
    speechManagerInstance = new SpeechManager();
  }
  return speechManagerInstance;
}

/**
 * Create a new speech instance (useful for multiple simultaneous contexts)
 */
export function createSpeechInstance(): SpeechInstance {
  return new SpeechManager();
}

/**
 * Quick utility function to speak text
 */
export async function speakText(
  text: string,
  options?: SpeechOptions
): Promise<void> {
  const manager = getSpeechManager();
  return manager.speak(text, options);
}

/**
 * Quick utility function to stop speech
 */
export function stopSpeech(): void {
  const manager = getSpeechManager();
  manager.stop();
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable(): boolean {
  const manager = getSpeechManager();
  return manager.isAvailable();
}
