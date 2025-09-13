import React, { useState, useEffect } from 'react';
import { TrackCard } from '@/components/TrackCard';
import { YouTubeService } from '@/services/youtubeApi';
import { useToast } from '@/hooks/use-toast';

const Explore = () => {
  const [genres, setGenres] = useState<any[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const youtubeService = YouTubeService.getInstance();

  const musicGenres = [
    { name: 'Pop', query: 'pop music hits', emoji: '🎵' },
    { name: 'Rock', query: 'rock music hits', emoji: '🎸' },
    { name: 'Hip Hop', query: 'hip hop rap music', emoji: '🎤' },
    { name: 'Eletrônica', query: 'electronic dance music', emoji: '🎧' },
    { name: 'Funk', query: 'funk brasileiro hits', emoji: '🕺' },
    { name: 'Sertanejo', query: 'sertanejo universitário', emoji: '🤠' },
    { name: 'MPB', query: 'mpb música popular brasileira', emoji: '🎼' },
    { name: 'Reggae', query: 'reggae music hits', emoji: '🌴' },
  ];

  useEffect(() => {
    loadTrendingMusic();
  }, []);

  const loadTrendingMusic = async () => {
    try {
      setLoading(true);
      const videos = await youtubeService.getTrendingVideos('BR', 20);
      const tracks = videos.map(video => ({
        id: video.id.videoId,
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        albumArt: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        audioUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        duration: 0,
        channelId: video.snippet.channelId,
        videoId: video.id.videoId
      }));
      setTrendingTracks(tracks);
    } catch (error) {
      console.error('Error loading trending music:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as músicas em alta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGenreMusic = async (genre: any) => {
    try {
      setLoading(true);
      const searchResponse = await youtubeService.searchVideos(genre.query, 15);
      const tracks = searchResponse.items.map((video: any) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        albumArt: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        audioUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        duration: 0,
        channelId: video.snippet.channelId,
        videoId: video.id.videoId
      }));
      setGenres(prev => [...prev.filter(g => g.name !== genre.name), { ...genre, tracks }]);
    } catch (error) {
      console.error('Error loading genre music:', error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar músicas de ${genre.name}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-text-primary mb-2">
          Explorar
        </h1>
        <p className="text-app-text-secondary">
          Descubra novos estilos musicais e tendências
        </p>
      </div>

      {/* Music Genres */}
      <div>
        <h2 className="text-lg font-semibold text-app-text-primary mb-4">
          Estilos Musicais
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {musicGenres.map((genre) => (
            <button
              key={genre.name}
              onClick={() => loadGenreMusic(genre)}
              className="bg-app-surface hover:bg-app-surface-hover rounded-xl p-4 text-left transition-colors border border-app-surface-hover"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{genre.emoji}</span>
                <span className="font-medium text-app-text-primary">{genre.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Music */}
      <div>
        <h2 className="text-lg font-semibold text-app-text-primary mb-4">
          Músicas em Alta no Brasil
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent mx-auto"></div>
            <p className="text-app-text-secondary mt-2">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trendingTracks.slice(0, 10).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isCurrentTrack={false}
                isPlaying={false}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Genre Results */}
      {genres.map((genre) => (
        <div key={genre.name}>
          <h2 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <span>{genre.emoji}</span>
            Top {genre.name}
          </h2>
          <div className="space-y-3">
            {genre.tracks?.slice(0, 5).map((track: any) => (
              <TrackCard
                key={track.id}
                track={track}
                isCurrentTrack={false}
                isPlaying={false}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Explore;