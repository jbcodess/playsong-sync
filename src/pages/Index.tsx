import React, { useState, useEffect, useCallback } from 'react';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Sidebar } from '@/components/Sidebar';
import { TrackCard } from '@/components/TrackCard';
import { SearchBar } from '@/components/SearchBar';
import { YouTubeService, YouTubeVideo } from '@/services/youtubeApi';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

// Convert YouTube video to Track interface
const convertYouTubeVideoToTrack = (video: YouTubeVideo) => ({
  id: video.id.videoId,
  title: video.snippet.title,
  artist: video.snippet.channelTitle,
  albumArt: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
  audioUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
  duration: 0,
  // Duration will be set when video loads
  channelId: video.snippet.channelId,
  videoId: video.id.videoId
});
const Index = () => {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<any[]>('playsong-favorites', []);
  const [followedArtists, setFollowedArtists] = useLocalStorage<Array<{
    id: string;
    name: string;
  }>>('playsong-followed-artists', []);
  const {
    toast
  } = useToast();
  const youtubeService = YouTubeService.getInstance();

  // Load trending tracks on component mount
  useEffect(() => {
    loadTrendingTracks();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => console.log('Service Worker registered')).catch(err => console.error('Service Worker registration failed:', err));
    }
  }, []);
  const loadTrendingTracks = async () => {
    try {
      setLoading(true);
      const videos = await youtubeService.getTrendingVideos('BR', 20);
      const tracks = videos.map(convertYouTubeVideoToTrack);
      setTrendingTracks(tracks);
      setPlaylist(tracks);
      if (!currentTrack && tracks.length > 0) {
        setCurrentTrack(tracks[0]);
      }
    } catch (error) {
      console.error('Error loading trending tracks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as músicas em alta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleTrackSelect = useCallback((track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);
  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setActiveSection('search');

      // Check if it's a YouTube URL
      const videoId = youtubeService.extractVideoId(query);
      if (videoId) {
        const videoDetails = await youtubeService.getVideoDetails(videoId);
        if (videoDetails) {
          const track = {
            id: videoId,
            title: videoDetails.snippet.title,
            artist: videoDetails.snippet.channelTitle,
            albumArt: videoDetails.snippet.thumbnails.high?.url || videoDetails.snippet.thumbnails.medium?.url,
            audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
            duration: 0,
            channelId: videoDetails.snippet.channelId,
            videoId: videoId
          };
          setCurrentTrack(track);
          setPlaylist([track]);
          setSearchResults([track]);
        }
      } else {
        // Search for videos
        const searchResponse = await youtubeService.searchVideos(query, 25);
        const tracks = searchResponse.items.map(convertYouTubeVideoToTrack);
        setSearchResults(tracks);
        setPlaylist(tracks);
        setNextPageToken(searchResponse.nextPageToken || null);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const loadMoreResults = async () => {
    if (!nextPageToken) return;
    try {
      setLoading(true);
      // This would need the last search query - we'd need to store it
      // For now, we'll just disable this feature
    } catch (error) {
      console.error('Error loading more results:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddToFavorites = useCallback((track: any) => {
    setFavorites(prev => [...prev, track]);
  }, [setFavorites]);
  const handleFollowArtist = useCallback((channelId: string, artistName: string) => {
    setFollowedArtists(prev => [...prev, {
      id: channelId,
      name: artistName
    }]);
  }, [setFollowedArtists]);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const renderContent = () => {
    switch (activeSection) {
      case 'search':
        return <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-app-text-primary mb-4">
                Resultados da Busca
              </h2>
              {loading ? <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent mx-auto"></div>
                  <p className="text-app-text-secondary mt-2">Buscando...</p>
                </div> : <div className="space-y-3">
                  {searchResults.map(track => <TrackCard key={track.id} track={track} isCurrentTrack={currentTrack?.id === track.id} isPlaying={isPlaying} onClick={() => handleTrackSelect(track)} />)}
                </div>}
            </div>
          </div>;
      case 'library':
        return <div className="space-y-6">
            <h2 className="text-2xl font-bold text-app-text-primary mb-4">
              Minha Biblioteca
            </h2>
            {/* This section was replaced with favorites and followed artists below */}
          </div>;
      case 'history':
        return <div className="space-y-6">
            <h2 className="text-2xl font-bold text-app-text-primary mb-4">
              Histórico
            </h2>
            <p className="text-app-text-secondary">
              Suas músicas reproduzidas recentemente aparecerão aqui.
            </p>
          </div>;
      default:
        return <div className="space-y-8">
            {/* Search Bar */}
            <div className="bg-app-surface rounded-2xl p-6 shadow-card py-[6px] my-0 mx-[99px] px-[45px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src="/lovable-uploads/67508e0d-5de8-4d0a-a3e9-3d86ae04639e.png" alt="PlaySong" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-bold text-app-text-primary">PlaySong</h1>
              </div>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Music Player */}
            <MusicPlayer track={currentTrack} playlist={playlist} onTrackChange={setCurrentTrack} onAddToFavorites={handleAddToFavorites} onFollowArtist={handleFollowArtist} />

            {/* Popular Tracks */}
            <div>
              <h2 className="text-2xl font-bold text-app-text-primary mb-6">
                Músicas em Alta
              </h2>
              {loading ? <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent mx-auto"></div>
                  <p className="text-app-text-secondary mt-2">Carregando...</p>
                </div> : <div className="space-y-3">
                {trendingTracks.map(track => <TrackCard key={track.id} track={track} isCurrentTrack={currentTrack?.id === track.id} isPlaying={isPlaying} onClick={() => handleTrackSelect(track)} />)}
                </div>}
            </div>
          </div>;
    }
  };
  return <div className="min-h-screen bg-app-background dark">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 ml-0 md:ml-0">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>;
};
export default Index;