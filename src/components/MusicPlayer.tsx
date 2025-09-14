import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from 'lucide-react';
import { useMediaSession } from '@/hooks/useMediaSession';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VLCService } from '@/services/vlcService';
import { PlaylistManager } from '@/services/playlistManager';
import { BackgroundPlaybackService } from '@/services/backgroundPlaybackService';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  audioUrl: string;
  duration: number;
  channelId?: string;
  videoId?: string;
}

export interface MusicPlayerProps {
  track: Track | null;
  playlist: Track[];
  onTrackChange?: (track: Track) => void;
  onAddToFavorites?: (track: Track) => void;
  onFollowArtist?: (channelId: string, artistName: string) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  track, 
  playlist, 
  onTrackChange,
  onAddToFavorites,
  onFollowArtist
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [favorites, setFavorites] = useLocalStorage<Track[]>('playsong-favorites', []);
  const [followedArtists, setFollowedArtists] = useLocalStorage<Array<{id: string, name: string}>>('playsong-followed-artists', []);
  
  const vlcService = VLCService.getInstance();
  const playlistManager = PlaylistManager.getInstance();
  const backgroundService = BackgroundPlaybackService.getInstance();
  const { toast } = useToast();

  const togglePlayPause = useCallback(async () => {
    if (vlcService.getIsPlaying()) {
      vlcService.pause();
    } else {
      await vlcService.play();
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    vlcService.seekTo(time);
  }, []);

  const addToFavorites = useCallback(() => {
    if (track) {
      const isAlreadyFavorite = favorites.some(fav => fav.id === track.id);
      if (isAlreadyFavorite) {
        setFavorites(favorites.filter(fav => fav.id !== track.id));
        toast({ title: "Removido dos favoritos", description: track.title });
      } else {
        setFavorites([...favorites, track]);
        toast({ title: "Adicionado aos favoritos", description: track.title });
        onAddToFavorites?.(track);
      }
    }
  }, [track, favorites, setFavorites, toast, onAddToFavorites]);

  const followArtist = useCallback(() => {
    if (track?.channelId) {
      const isAlreadyFollowed = followedArtists.some(artist => artist.id === track.channelId);
      if (isAlreadyFollowed) {
        setFollowedArtists(followedArtists.filter(artist => artist.id !== track.channelId));
        toast({ title: "Parou de seguir", description: track.artist });
      } else {
        setFollowedArtists([...followedArtists, { id: track.channelId, name: track.artist }]);
        toast({ title: "Seguindo artista", description: track.artist });
        onFollowArtist?.(track.channelId, track.artist);
      }
    }
  }, [track, followedArtists, setFollowedArtists, toast, onFollowArtist]);

  const playNext = useCallback(() => {
    const nextTrack = playlistManager.playNext();
    if (nextTrack) {
      onTrackChange?.(nextTrack);
    }
  }, [onTrackChange]);

  const playPrevious = useCallback(() => {
    const previousTrack = playlistManager.playPrevious();
    if (previousTrack) {
      onTrackChange?.(previousTrack);
    }
  }, [onTrackChange]);

  const toggleShuffle = useCallback(() => {
    playlistManager.toggleShuffle();
    toast({ 
      title: playlistManager.getState().isShuffled ? "Modo aleatório ativado" : "Modo aleatório desativado" 
    });
  }, [toast]);

  const toggleRepeat = useCallback(() => {
    const state = playlistManager.getState();
    const modes: Array<'none' | 'all' | 'one'> = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    playlistManager.setRepeatMode(nextMode);
    
    const modeNames = { none: 'desativado', all: 'repetir tudo', one: 'repetir música' };
    toast({ title: `Modo repetição: ${modeNames[nextMode]}` });
  }, [toast]);

  // Initialize VLC Service and setup playlist
  useEffect(() => {
    const initializeServices = async () => {
      await vlcService.initialize();
      
      // Setup VLC event handlers
      vlcService.onTimeUpdate(setCurrentTime);
      vlcService.onDurationChange(setDuration);
      vlcService.onPlay(() => setIsPlaying(true));
      vlcService.onPause(() => setIsPlaying(false));
      vlcService.onEnded(playNext);
      
      // Setup playlist
      if (playlist.length > 0) {
        const currentIndex = track ? playlist.findIndex(t => t.id === track.id) : 0;
        playlistManager.setPlaylist(playlist, Math.max(0, currentIndex));
      }
    };

    initializeServices();
  }, [playlist]);

  // Load and play track when it changes
  useEffect(() => {
    const loadTrack = async () => {
      if (!track?.audioUrl && !track?.videoId) return;

      const youtubeUrl = track.audioUrl || `https://www.youtube.com/watch?v=${track.videoId}`;
      const loaded = await vlcService.loadTrack(youtubeUrl);
      
      if (loaded) {
        // Auto-play the track
        await vlcService.play();
        
        // Setup background playback
        if ('mediaSession' in navigator) {
          backgroundService.setupMediaSession(
            new MediaMetadata({
              title: track.title,
              artist: track.artist,
              artwork: [{ src: track.albumArt, sizes: '512x512', type: 'image/jpeg' }]
            }),
            {
              onPlay: togglePlayPause,
              onPause: togglePlayPause,
              onPrevious: playPrevious,
              onNext: playNext,
              onSeek: (details: any) => seekTo(details.seekTime || 0)
            }
          );
        }
      }
    };

    if (track) {
      loadTrack();
    }
  }, [track]);

  // Handle volume changes
  useEffect(() => {
    vlcService.setVolume(volume);
  }, [volume]);

  // Media Session API for background playback controls
  useMediaSession(
    track ? {
      title: track.title,
      artist: track.artist,
      artwork: [{
        src: track.albumArt,
        sizes: '512x512',
        type: 'image/jpeg'
      }]
    } : null,
    {
      onPlay: togglePlayPause,
      onPause: togglePlayPause,
      onPreviousTrack: playPrevious,
      onNextTrack: playNext,
      onSeekTo: seekTo
    },
    isPlaying
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      vlcService.destroy();
    };
  }, []);

  const handleSeek = (value: number[]) => {
    const seekTime = (value[0] / 100) * duration;
    seekTo(seekTime);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTrackFavorite = favorites.some(fav => fav.id === track?.id);
  const isArtistFollowed = followedArtists.some(artist => artist.id === track?.channelId);
  const playlistState = playlistManager.getState();

  if (!track) {
    return null; // Don't render anything if no track is selected
  }

  return (
    <div className="bg-gradient-surface rounded-2xl p-6 shadow-card w-full max-w-sm mx-auto">
      {/* Album Art */}
      <div className="relative mb-4">
        <img
          src={track.albumArt}
          alt={`${track.title} album art`}
          className="w-full aspect-square rounded-xl object-cover shadow-card"
        />
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
          isPlaying ? 'bg-black/10' : 'bg-black/0'
        }`} />
      </div>

      {/* Track Info */}
      <div className="text-center mb-4">
        <h3 className="text-app-text-primary text-lg font-bold mb-1 truncate">
          {track.title}
        </h3>
        <p className="text-app-text-secondary text-sm truncate">
          {track.artist}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-app-text-muted min-w-[3rem]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            max={100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1 [&>.slider-track]:bg-progress-background [&>.slider-range]:bg-progress-fill"
          />
          <span className="text-sm text-app-text-muted min-w-[3rem] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleShuffle}
          className={`h-8 w-8 ${playlistState.isShuffled ? 'text-app-accent' : 'text-app-text-secondary'} hover:text-app-text-primary`}
        >
          <Shuffle className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={playPrevious}
          className="h-10 w-10 text-app-text-secondary hover:text-app-text-primary"
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button
          variant="play"
          size="icon"
          onClick={togglePlayPause}
          className="h-12 w-12"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={playNext}
          className="h-10 w-10 text-app-text-secondary hover:text-app-text-primary"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRepeat}
          className={`h-8 w-8 ${playlistState.repeatMode !== 'none' ? 'text-app-accent' : 'text-app-text-secondary'} hover:text-app-text-primary`}
        >
          <Repeat className="h-4 w-4" />
          {playlistState.repeatMode === 'one' && (
            <span className="absolute text-xs font-bold">1</span>
          )}
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={addToFavorites}
          className={`flex items-center gap-2 ${isTrackFavorite ? 'text-red-400' : 'text-app-text-secondary'}`}
        >
          <Heart className={`h-4 w-4 ${isTrackFavorite ? 'fill-current' : ''}`} />
          {isTrackFavorite ? 'Favorito' : 'Favoritar'}
        </Button>
        
        {track?.channelId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={followArtist}
            className={`flex items-center gap-2 ${isArtistFollowed ? 'text-app-accent' : 'text-app-text-secondary'}`}
          >
            {isArtistFollowed ? 'Seguindo' : 'Seguir'} Artista
          </Button>
        )}
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-app-text-muted" />
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="w-20"
        />
      </div>

    </div>
  );
};