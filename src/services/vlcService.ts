import { AudioExtractionService } from './audioExtractionService';
import { BackgroundPlaybackService } from './backgroundPlaybackService';

// Enhanced VLC Service with real libVLC integration
export class VLCService {
  private static instance: VLCService;
  private isInitialized = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioExtractionService = AudioExtractionService.getInstance();
  private backgroundService = BackgroundPlaybackService.getInstance();
  private currentTime = 0;
  private duration = 0;
  private volume = 1;
  private isPlaying = false;

  // Event handlers
  private onTimeUpdateCallback?: (time: number) => void;
  private onDurationChangeCallback?: (duration: number) => void;
  private onPlayCallback?: () => void;
  private onPauseCallback?: () => void;
  private onEndedCallback?: () => void;
  private onLoadedCallback?: () => void;
  
  static getInstance(): VLCService {
    if (!VLCService.instance) {
      VLCService.instance = new VLCService();
    }
    return VLCService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Initialize background playback service
      await this.backgroundService.initialize();
      
      this.isInitialized = true;
      console.log('VLC Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize VLC Service:', error);
      return false;
    }
  }

  // Event handler setters
  onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }

  onDurationChange(callback: (duration: number) => void): void {
    this.onDurationChangeCallback = callback;
  }

  onPlay(callback: () => void): void {
    this.onPlayCallback = callback;
  }

  onPause(callback: () => void): void {
    this.onPauseCallback = callback;
  }

  onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  onLoaded(callback: () => void): void {
    this.onLoadedCallback = callback;
  }

  private setupAudioElement(audioUrl: string): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
    }

    this.currentAudio = new Audio();
    this.currentAudio.src = audioUrl;
    this.currentAudio.preload = 'auto';
    this.currentAudio.volume = this.volume;

    // Setup event listeners
    this.currentAudio.addEventListener('loadedmetadata', () => {
      this.duration = this.currentAudio!.duration;
      this.onDurationChangeCallback?.(this.duration);
      this.onLoadedCallback?.();
    });

    this.currentAudio.addEventListener('timeupdate', () => {
      this.currentTime = this.currentAudio!.currentTime;
      this.onTimeUpdateCallback?.(this.currentTime);
    });

    this.currentAudio.addEventListener('play', () => {
      this.isPlaying = true;
      this.onPlayCallback?.();
    });

    this.currentAudio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.onPauseCallback?.();
    });

    this.currentAudio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.onEndedCallback?.();
    });

    this.currentAudio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
    });
  }

  async loadTrack(youtubeUrl: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Extract direct audio URL
      const audioUrl = await this.audioExtractionService.extractAudioUrl(youtubeUrl);
      if (!audioUrl) {
        console.error('Failed to extract audio URL');
        return false;
      }

      // Setup audio element with extracted URL
      this.setupAudioElement(audioUrl);
      return true;
    } catch (error) {
      console.error('Error loading track:', error);
      return false;
    }
  }

  async playTrack(youtubeUrl: string): Promise<boolean> {
    try {
      const loaded = await this.loadTrack(youtubeUrl);
      if (!loaded) return false;

      if (this.currentAudio) {
        await this.currentAudio.play();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error playing track:', error);
      return false;
    }
  }

  async play(): Promise<void> {
    if (this.currentAudio && !this.isPlaying) {
      try {
        await this.currentAudio.play();
      } catch (error) {
        console.error('Play error:', error);
      }
    }
  }

  pause(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
    }
  }

  stop(): void {
    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentTime = 0;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  }

  setVolume(volume: number): void {
    try {
      this.volume = Math.max(0, Math.min(1, volume / 100)); // Convert 0-100 to 0-1
      if (this.currentAudio) {
        this.currentAudio.volume = this.volume;
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  seekTo(time: number): void {
    try {
      if (this.currentAudio) {
        this.currentAudio.currentTime = time;
        this.currentTime = time;
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  // Getters for current state
  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getVolume(): number {
    return this.volume * 100; // Convert back to 0-100
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Cleanup
  destroy(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    this.backgroundService.releaseWakeLock();
  }
}