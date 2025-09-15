import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart, 
  ChevronDown,
  X,
  Minimize2,
  ArrowUp
} from 'lucide-react';
import { useMediaSession } from '@/hooks/useMediaSession';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VLCService } from '@/services/vlcService';

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

export interface FullScreenPlayerProps {
  track: Track | null;
  playlist: Track[];
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onTrackChange?: (track: Track) => void;
  onAddToFavorites?: (track: Track) => void;
  onFollowArtist?: (channelId: string, artistName: string) => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ 
  track, 
  playlist, 
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onMaximize,
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
  
  const playerRef = useRef<any>(null);
  const vlcService = VLCService.getInstance();
  const { toast } = useToast();

  // Auto-play when track changes
  useEffect(() => {
    if (track && isOpen && !isMinimized) {
      initializePlayer(true);
    }
  }, [track?.videoId, isOpen]);

  const initializePlayer = async (autoPlay = false) => {
    if (!track?.videoId) return;

    // Try VLC first for better performance
    const vlcAvailable = await vlcService.initialize();
    
    if (vlcAvailable && track.audioUrl) {
      const success = await vlcService.playTrack(track.audioUrl);
      if (success && autoPlay) {
        setIsPlaying(true);
        return;
      }
    }

    // Fallback to YouTube player
    if (window.YT) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(track.videoId);
        if (autoPlay) {
          setTimeout(() => {
            playerRef.current.playVideo();
          }, 1000);
        }
      } else {
        playerRef.current = new window.YT.Player('youtube-player-fullscreen', {
          height: '360',
          width: '640',
          videoId: track.videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            playsinline: 1
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration());
              if (autoPlay) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (event.data === 1) { // Playing
                setIsPlaying(true);
              } else if (event.data === 2) { // Paused
                setIsPlaying(false);
              } else if (event.data === 0) { // Ended
                playNext();
              }
            }
          }
        });
      }
    }
  };

  const togglePlayPause = useCallback(() => {
    if (playerRef.current && track?.videoId) {
      const state = playerRef.current.getPlayerState();
      if (state === 1) { // Playing
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [track?.videoId]);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
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

  const playNext = () => {
    if (!track || !playlist.length) return;
    
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    onTrackChange?.(playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (!track || !playlist.length) return;
    
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    const previousIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    onTrackChange?.(playlist[previousIndex]);
  };

  // Update time while playing
  useEffect(() => {
    const updateTime = () => {
      if (playerRef.current && isPlaying) {
        try {
          const current = playerRef.current.getCurrentTime();
          const total = playerRef.current.getDuration();
          setCurrentTime(current);
          if (total !== duration) {
            setDuration(total);
          }
        } catch (error) {
          console.error('Error updating time:', error);
        }
      }
    };

    if (isPlaying) {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

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

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any).onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
      };
    }
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

  if (!isOpen || !track) {
    return null;
  }

  // Minimized player
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-0 left-0 right-0 bg-app-surface border-t border-app-surface-hover z-50 p-4 cursor-pointer"
        onClick={onMaximize}
      >
        <div className="flex items-center gap-4">
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-app-text-primary font-medium truncate text-sm">
              {track.title}
            </p>
            <p className="text-app-text-secondary truncate text-xs">
              {track.artist}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="h-10 w-10 text-app-text-primary"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-10 w-10 text-app-text-secondary"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Full screen player
  return (
    <div className="fixed inset-0 bg-app-background z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-app-surface-hover">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-10 w-10 text-app-text-secondary"
        >
          <Minimize2 className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold text-app-text-primary">
          Tocando Agora
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 text-app-text-secondary"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Video Player Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="relative mb-8 w-full max-w-xs aspect-square">
          {/* YouTube Player Container */}
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl relative">
            <div id="youtube-player-fullscreen" className="w-full h-full"></div>
            
            {/* Thumbnail Overlay */}
            <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-none">
              <img
                src={track.albumArt}
                alt={`${track.title} thumbnail`}
                className="w-full h-full object-cover rounded-2xl opacity-90"
              />
              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                isPlaying ? 'bg-black/30' : 'bg-black/50'
              }`} />
            </div>
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-6 px-4">
          <h2 className="text-2xl font-bold text-app-text-primary mb-2 line-clamp-2">
            {track.title}
          </h2>
          <p className="text-lg text-app-text-secondary line-clamp-1">
            {track.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-app-text-muted min-w-[3rem]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              max={100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-sm text-app-text-muted min-w-[3rem] text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            className="h-12 w-12 text-app-text-secondary hover:text-app-text-primary"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            variant="play"
            size="icon"
            onClick={togglePlayPause}
            className="h-16 w-16 text-white"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            className="h-12 w-12 text-app-text-secondary hover:text-app-text-primary"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={addToFavorites}
            className={`flex items-center gap-2 ${isTrackFavorite ? 'text-red-400' : 'text-app-text-secondary'}`}
          >
            <Heart className={`h-5 w-5 ${isTrackFavorite ? 'fill-current' : ''}`} />
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
        <div className="flex items-center gap-3 w-full max-w-xs">
          <Volume2 className="h-5 w-5 text-app-text-muted" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0])}
            className="flex-1"
          />
        </div>
      </div>

    </div>
  );
};