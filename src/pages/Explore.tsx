import React from 'react';
import { Music, TrendingUp, Radio, Heart, Headphones, Guitar } from 'lucide-react';

const Explore = () => {
  const genres = [
    { name: 'Pop', icon: Heart, color: 'from-pink-500 to-rose-400' },
    { name: 'Rock', icon: Guitar, color: 'from-red-500 to-orange-400' },
    { name: 'Hip Hop', icon: Headphones, color: 'from-purple-500 to-indigo-400' },
    { name: 'Eletrônica', icon: Radio, color: 'from-blue-500 to-cyan-400' },
    { name: 'Sertanejo', icon: Music, color: 'from-green-500 to-emerald-400' },
    { name: 'Funk', icon: TrendingUp, color: 'from-yellow-500 to-amber-400' },
  ];

  const trending = [
    { title: 'Top 50 Brasil', tracks: '50 músicas' },
    { title: 'Viral Brasil', tracks: '50 músicas' },
    { title: 'Top Global', tracks: '50 músicas' },
    { title: 'Novos Lançamentos', tracks: '100 músicas' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-app-text-primary mb-2">Explorar</h1>
        <p className="text-app-text-secondary">Descubra novos estilos musicais</p>
      </div>

      {/* Genres */}
      <div>
        <h2 className="text-2xl font-bold text-app-text-primary mb-6">Gêneros Musicais</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.name}
              className={`bg-gradient-to-br ${genre.color} rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200`}
            >
              <genre.icon className="h-8 w-8 text-white mb-4" />
              <h3 className="text-white font-bold text-lg">{genre.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div>
        <h2 className="text-2xl font-bold text-app-text-primary mb-6">Em Alta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trending.map((playlist) => (
            <div
              key={playlist.title}
              className="bg-app-surface rounded-2xl p-6 hover:bg-app-surface-hover transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-app-accent to-blue-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-app-text-primary font-bold text-lg">{playlist.title}</h3>
                  <p className="text-app-text-secondary">{playlist.tracks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;