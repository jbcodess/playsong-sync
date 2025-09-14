// Service para gerenciar reprodução em segundo plano
export class BackgroundPlaybackService {
  private static instance: BackgroundPlaybackService;
  private wakeLock: WakeLockSentinel | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  static getInstance(): BackgroundPlaybackService {
    if (!BackgroundPlaybackService.instance) {
      BackgroundPlaybackService.instance = new BackgroundPlaybackService();
    }
    return BackgroundPlaybackService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Register service worker for background playback
      await this.registerServiceWorker();
      
      // Request wake lock to prevent screen sleep
      await this.requestWakeLock();
      
      // Setup visibility change handler
      this.setupVisibilityHandler();
      
      console.log('Background playback service initialized');
    } catch (error) {
      console.error('Failed to initialize background playback:', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private async requestWakeLock(): Promise<void> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake lock acquired');
        
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake lock released');
        });
      } catch (error) {
        console.error('Failed to acquire wake lock:', error);
      }
    }
  }

  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        // App is in background - ensure playback continues
        this.enableBackgroundPlayback();
      } else {
        // App is in foreground - re-acquire wake lock if needed
        if (!this.wakeLock) {
          await this.requestWakeLock();
        }
      }
    });
  }

  private enableBackgroundPlayback(): void {
    // Send message to service worker to maintain playback
    if (this.serviceWorkerRegistration?.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'ENABLE_BACKGROUND_PLAYBACK'
      });
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  // Configure media session for background controls
  setupMediaSession(metadata: MediaMetadata, handlers: any): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = metadata;
      navigator.mediaSession.playbackState = 'playing';
      
      // Set action handlers
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
      navigator.mediaSession.setActionHandler('pause', handlers.onPause);
      navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
      navigator.mediaSession.setActionHandler('seekto', handlers.onSeek);
    }
  }
}