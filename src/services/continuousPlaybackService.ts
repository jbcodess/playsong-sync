// Continuous Playback Service - Ensures music never stops
export class ContinuousPlaybackService {
  private static instance: ContinuousPlaybackService;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private preventPauseInterval: NodeJS.Timeout | null = null;
  private isActive = false;
  private currentPlayer: any = null;
  private onTrackEndCallback: (() => void) | null = null;

  static getInstance(): ContinuousPlaybackService {
    if (!ContinuousPlaybackService.instance) {
      ContinuousPlaybackService.instance = new ContinuousPlaybackService();
    }
    return ContinuousPlaybackService.instance;
  }

  // Start continuous playback mode
  start(player: any, onTrackEnd?: () => void): void {
    this.isActive = true;
    this.currentPlayer = player;
    this.onTrackEndCallback = onTrackEnd || null;

    // Keep screen awake and app active
    this.setupKeepAlive();
    
    // Prevent automatic pausing
    this.setupPreventPause();
    
    // Setup media session for background playback
    this.setupMediaSession();
    
    console.log('Continuous playback mode activated');
  }

  // Stop continuous playback mode
  stop(): void {
    this.isActive = false;
    
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    
    if (this.preventPauseInterval) {
      clearInterval(this.preventPauseInterval);
      this.preventPauseInterval = null;
    }
    
    console.log('Continuous playback mode deactivated');
  }

  // Keep the app alive and prevent suspension
  private setupKeepAlive(): void {
    // Request wake lock to keep screen awake
    this.requestWakeLock();
    
    // Heartbeat to keep app active
    this.keepAliveInterval = setInterval(() => {
      if (this.isActive && this.currentPlayer) {
        try {
          // Send small activity signal
          this.currentPlayer.getPlayerState?.();
          
          // Log activity to console to prevent GC
          console.debug('🎵 Playback heartbeat');
        } catch (error) {
          console.warn('Heartbeat check failed:', error);
        }
      }
    }, 10000); // Every 10 seconds
  }

  // Prevent automatic pausing by monitoring player state
  private setupPreventPause(): void {
    this.preventPauseInterval = setInterval(() => {
      if (this.isActive && this.currentPlayer) {
        try {
          const state = this.currentPlayer.getPlayerState?.();
          
          // If paused unexpectedly, resume immediately
          if (state === 2) { // YouTube paused state
            console.log('🎵 Auto-resuming paused track');
            this.currentPlayer.playVideo?.();
          }
          
          // If ended, trigger next track
          if (state === 0 && this.onTrackEndCallback) { // YouTube ended state
            console.log('🎵 Track ended, playing next');
            this.onTrackEndCallback();
          }
        } catch (error) {
          console.warn('Pause prevention check failed:', error);
        }
      }
    }, 2000); // Every 2 seconds
  }

  // Setup enhanced media session for background playback
  private setupMediaSession(): void {
    if ('mediaSession' in navigator) {
      // Override default behaviors to prevent pausing
      navigator.mediaSession.setActionHandler('pause', () => {
        console.log('🎵 Pause action blocked');
        // Intentionally do nothing to prevent pausing
      });
      
      // Enhanced play handler
      navigator.mediaSession.setActionHandler('play', () => {
        if (this.currentPlayer) {
          this.currentPlayer.playVideo?.();
        }
      });
      
      // Set playback state to always playing when active
      if (this.isActive) {
        navigator.mediaSession.playbackState = 'playing';
      }
    }
  }

  // Request wake lock to prevent screen sleep
  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('🎵 Wake lock acquired');
        
        // Re-acquire wake lock if lost
        wakeLock.addEventListener('release', () => {
          if (this.isActive) {
            setTimeout(() => this.requestWakeLock(), 1000);
          }
        });
      }
    } catch (error) {
      console.warn('Wake lock failed:', error);
    }
  }

  // Force play if player is available
  forcePlay(): void {
    if (this.isActive && this.currentPlayer) {
      try {
        this.currentPlayer.playVideo?.();
        console.log('🎵 Forced play executed');
      } catch (error) {
        console.warn('Force play failed:', error);
      }
    }
  }

  // Check if continuous mode is active
  isActiveMode(): boolean {
    return this.isActive;
  }

  // Update player reference
  updatePlayer(player: any): void {
    this.currentPlayer = player;
  }

  // Set track end callback
  setTrackEndCallback(callback: () => void): void {
    this.onTrackEndCallback = callback;
  }
}
