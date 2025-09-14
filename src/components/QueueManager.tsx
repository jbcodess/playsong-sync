import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Play, Music } from 'lucide-react';
import { Track } from './MusicPlayer';
import { usePlaylistManager } from '@/hooks/usePlaylistManager';

interface QueueManagerProps {
  onTrackSelect?: (track: Track) => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({ onTrackSelect }) => {
  const { state, removeFromQueue, clearQueue } = usePlaylistManager();

  if (state.queue.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Fila de Reprodução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-app-text-muted text-center py-8">
            Nenhuma música na fila
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Fila ({state.queue.length})
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearQueue}
          className="text-app-text-muted hover:text-app-text-primary"
        >
          Limpar
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {state.queue.map((track, index) => (
          <div 
            key={`${track.id}-${index}`}
            className="flex items-center gap-3 p-2 rounded-lg bg-app-surface/50 hover:bg-app-surface transition-colors"
          >
            <img 
              src={track.albumArt} 
              alt={track.title}
              className="w-10 h-10 rounded object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-app-text-primary truncate">
                {track.title}
              </p>
              <p className="text-xs text-app-text-secondary truncate">
                {track.artist}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTrackSelect?.(track)}
                className="h-8 w-8 text-app-text-muted hover:text-app-text-primary"
              >
                <Play className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromQueue(index)}
                className="h-8 w-8 text-app-text-muted hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};