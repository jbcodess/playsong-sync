import React from 'react';
import { Heart, UserPlus, Music, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TrackCard } from '@/components/TrackCard';

const Library = () => {
  const [favorites] = useLocalStorage<any[]>('playsong-favorites', []);
  const [followedArtists] = useLocalStorage<Array<{id: string, name: string}>>('playsong-followed-artists', []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-app-text-primary mb-2">Minha Biblioteca</h1>
        <p className="text-app-text-secondary">Suas músicas e artistas favoritos</p>
      </div>

      {/* Favorites */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-white fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-app-text-primary">Músicas Favoritas</h2>
          <span className="text-app-text-muted">({favorites.length})</span>
        </div>
        
        {favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isCurrentTrack={false}
                isPlaying={false}
                onClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-app-surface rounded-2xl">
            <Heart className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
            <p className="text-app-text-secondary text-lg">Nenhuma música favorita ainda</p>
            <p className="text-app-text-muted">Favorite músicas para vê-las aqui</p>
          </div>
        )}
      </div>

      {/* Followed Artists */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-app-accent rounded-xl flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-app-text-primary">Artistas Seguidos</h2>
          <span className="text-app-text-muted">({followedArtists.length})</span>
        </div>
        
        {followedArtists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {followedArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-app-surface rounded-2xl p-4 hover:bg-app-surface-hover transition-colors cursor-pointer text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-app-accent to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-app-text-primary font-semibold truncate">{artist.name}</h3>
                <p className="text-app-text-muted text-sm">Artista</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-app-surface rounded-2xl">
            <UserPlus className="h-12 w-12 text-app-text-muted mx-auto mb-4" />
            <p className="text-app-text-secondary text-lg">Nenhum artista seguido ainda</p>
            <p className="text-app-text-muted">Siga artistas para vê-los aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;