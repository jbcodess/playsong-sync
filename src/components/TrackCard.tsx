import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  audioUrl: string;
  duration: number;
}

interface TrackCardProps {
  track: Track;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  onClick: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  isPlaying = false, 
  isCurrentTrack = false, 
  onClick 
}) => {
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`
      bg-app-surface hover:bg-app-surface-hover 
      rounded-xl p-4 transition-all duration-200 cursor-pointer
      shadow-card hover:shadow-lg group
      ${isCurrentTrack ? 'ring-2 ring-app-accent' : ''}
    `} onClick={onClick}>
      <div className="flex items-center gap-4">
        {/* Album Art with Play Button Overlay */}
        <div className="relative flex-shrink-0">
          <img
            src={track.albumArt}
            alt={`${track.title} album art`}
            className="w-16 h-16 rounded-lg object-cover"
          />
          
          {/* Play/Pause Overlay */}
          <div className={`
            absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center
            transition-opacity duration-200
            ${isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}>
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`
            font-semibold truncate text-lg
            ${isCurrentTrack ? 'text-app-accent' : 'text-app-text-primary'}
          `}>
            {track.title}
          </h4>
          <p className="text-app-text-secondary truncate">
            {track.artist}
          </p>
        </div>

        {/* Duration */}
        <div className="text-app-text-muted text-sm font-medium">
          {formatDuration(track.duration)}
        </div>
      </div>
    </div>
  );
};