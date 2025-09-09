import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  audioUrl: string;
  duration: number;
}

interface MusicPlayerProps {
  track: Track | null;
  playlist: Track[];
  onTrackChange?: (track: Track) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  track, 
  playlist, 
  onTrackChange 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Toggle play/pause functionality
  const togglePlayPause = () => {
    if (!audioRef.current || !track) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle track change
  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.load();
      setCurrentTime(0);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [track]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  const handleSeek = (value: number[]) => {
    if (audioRef.current && track) {
      const seekTime = (value[0] / 100) * track.duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track) {
    return (
      <div className="bg-app-surface rounded-2xl p-8 text-center shadow-player">
        <div className="text-app-text-muted text-lg">Selecione uma música para começar</div>
      </div>
    );
  }

  const progressPercentage = track.duration ? (currentTime / track.duration) * 100 : 0;

  return (
    <div className="bg-gradient-surface rounded-2xl p-8 shadow-player max-w-md mx-auto">
      {/* Audio element */}
      <audio ref={audioRef} preload="metadata">
        <source src={track.audioUrl} type="audio/mpeg" />
      </audio>

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
        <Slider
          value={[progressPercentage]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-app-text-muted text-sm mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          variant="player-control"
          size="control"
          onClick={playPrevious}
          className="rounded-full"
        >
          <SkipBack className="h-6 w-6" />
        </Button>

        <Button
          variant="play"
          size="play-button"
          onClick={togglePlayPause}
          className="rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>

        <Button
          variant="player-control"
          size="control"
          onClick={playNext}
          className="rounded-full"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="h-5 w-5 text-app-text-secondary" />
        <Slider
          value={[volume * 100]}
          onValueChange={(value) => setVolume(value[0] / 100)}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>
    </div>
  );
};