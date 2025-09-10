import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Download } from 'lucide-react';
import { useMediaSession } from '@/hooks/useMediaSession';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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
  
  const playerRef = useRef<any>(null);
  const { toast } = useToast();

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

  // Initialize YouTube Player
  useEffect(() => {
    if (track?.videoId && window.YT) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(track.videoId);
      } else {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: track.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            playsinline: 1 // Enable background playback on mobile
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration());
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
  }, [track?.videoId]);

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

  if (!track) {
    return null; // Don't render anything if no track is selected
  }

  return (
    <div className="bg-gradient-surface rounded-2xl p-8 shadow-card max-w-md mx-auto">
      {/* Album Art */}
      <div className="relative mb-6">
        <img
          src={track.albumArt}
          alt={`${track.title} album art`}
          className="w-full aspect-square rounded-2xl object-cover shadow-card"
        />
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          isPlaying ? 'bg-black/10' : 'bg-black/0'
        }`} />
      </div>

      {/* Track Info */}
      <div className="text-center mb-6">
        <h3 className="text-app-text-primary text-xl font-bold mb-1 truncate">
          {track.title}
        </h3>
        <p className="text-app-text-secondary text-lg truncate">
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
            className="flex-1"
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

      {/* Hidden YouTube Player */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div id="youtube-player"></div>
      </div>
    </div>
  );
};