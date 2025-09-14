import { useEffect } from 'react';

export interface MediaSessionTrack {
  title: string;
  artist: string;
  album?: string;
  artwork?: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
  onSeekTo?: (time: number) => void;
}

export function useMediaSession(
  track: MediaSessionTrack | null,
  handlers: MediaSessionHandlers,
  isPlaying: boolean = false
) {
  useEffect(() => {
    if ('mediaSession' in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || '',
        artwork: track.artwork || [
          {
            src: '/lovable-uploads/67508e0d-5de8-4d0a-a3e9-3d86ae04639e.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      });

      // Set playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Set action handlers
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
      // Override pause to prevent stopping music in continuous mode
      navigator.mediaSession.setActionHandler('pause', () => {
        console.log('Media Session pause blocked - continuous mode');
        // Don't call handlers.onPause to prevent pausing
      });
      navigator.mediaSession.setActionHandler('previoustrack', handlers.onPreviousTrack);
      navigator.mediaSession.setActionHandler('nexttrack', handlers.onNextTrack);
      
      if (handlers.onSeekTo) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            handlers.onSeekTo!(details.seekTime);
          }
        });
      }

      // Set position state if playing
      if (isPlaying) {
        navigator.mediaSession.setPositionState({
          duration: 0, // Will be updated by the player
          playbackRate: 1,
          position: 0
        });
      }
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
      }
    };
  }, [track, handlers, isPlaying]);
}