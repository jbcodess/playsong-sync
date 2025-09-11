import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Sidebar } from '@/components/Sidebar';
import { TrackCard } from '@/components/TrackCard';
import { SearchBar } from '@/components/SearchBar';
import { YouTubeService, YouTubeVideo } from '@/services/youtubeApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Convert YouTube video to Track interface
const convertYouTubeVideoToTrack = (video: YouTubeVideo) => ({
  id: video.id.videoId,
  title: video.snippet.title,
  artist: video.snippet.channelTitle,
  albumArt: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
  audioUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
  duration: 0,
  channelId: video.snippet.channelId,
  videoId: video.id.videoId
});

const Dashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [followedArtists, setFollowedArtists] = useState<Array<{id: string, name: string}>>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  const { toast } = useToast();
  const youtubeService = YouTubeService.getInstance();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load user data and trending tracks
  useEffect(() => {
    if (user) {
      loadUserData();
      loadTrendingTracks();
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(() => console.log('Service Worker registered'))
          .catch(err => console.error('Service Worker registration failed:', err));
      }
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);
      
      if (favoritesData) {
        const favTracks = favoritesData.map(fav => ({
          id: fav.track_id,
          title: fav.track_title,
          artist: fav.track_artist,
          albumArt: fav.track_album_art,
          videoId: fav.track_video_id,
          channelId: fav.track_channel_id,
          audioUrl: `https://www.youtube.com/watch?v=${fav.track_video_id}`
        }));
        setFavorites(favTracks);
      }

      // Load followed artists
      const { data: artistsData } = await supabase
        .from('followed_artists')
        .select('*')
        .eq('user_id', user.id);
      
      if (artistsData) {
        setFollowedArtists(artistsData.map(artist => ({
          id: artist.artist_id,
          name: artist.artist_name
        })));
      }

      // Load history
      const { data: historyData } = await supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50);
      
      if (historyData) {
        const historyTracks = historyData.map(hist => ({
          id: hist.track_id,
          title: hist.track_title,
          artist: hist.track_artist,
          albumArt: hist.track_album_art,
          videoId: hist.track_video_id,
          channelId: hist.track_channel_id,
          audioUrl: `https://www.youtube.com/watch?v=${hist.track_video_id}`,
          playedAt: hist.played_at
        }));
        setHistory(historyTracks);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Add track to history when it changes
  useEffect(() => {
    if (currentTrack && user) {
      // Add to local state
      setHistory(prev => {
        const filtered = prev.filter(track => track.id !== currentTrack.id);
        return [currentTrack, ...filtered].slice(0, 50);
      });

      // Save to database
      const saveToHistory = async () => {
        try {
          await supabase.from('listening_history').insert({
            user_id: user.id,
            track_id: currentTrack.id,
            track_title: currentTrack.title,
            track_artist: currentTrack.artist,
            track_album_art: currentTrack.albumArt,
            track_video_id: currentTrack.videoId,
            track_channel_id: currentTrack.channelId
          });
        } catch (error) {
          console.error('Error saving to history:', error);
        }
      };
      
      saveToHistory();
    }
  }, [currentTrack, user]);

  const loadTrendingTracks = async () => {
    try {
      setLoading(true);
      const videos = await youtubeService.getTrendingVideos('BR', 20);
      const tracks = videos.map(convertYouTubeVideoToTrack);
      setTrendingTracks(tracks);
      setPlaylist(tracks);
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

  const handleAddToFavorites = useCallback(async (track: any) => {
    if (!user) return;
    
    try {
      const isAlreadyFavorite = favorites.some(fav => fav.id === track.id);
      
      if (isAlreadyFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', track.id);
        
        setFavorites(prev => prev.filter(fav => fav.id !== track.id));
        toast({ title: "Removido dos favoritos", description: track.title });
      } else {
        // Add to favorites
        await supabase.from('favorites').insert({
          user_id: user.id,
          track_id: track.id,
          track_title: track.title,
          track_artist: track.artist,
          track_album_art: track.albumArt,
          track_video_id: track.videoId,
          track_channel_id: track.channelId
        });
        
        setFavorites(prev => [...prev, track]);
        toast({ title: "Adicionado aos favoritos", description: track.title });
      }
    } catch (error) {
      console.error('Error managing favorites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favoritos",
        variant: "destructive"
      });
    }
  }, [user, favorites, toast]);

  const handleFollowArtist = useCallback(async (channelId: string, artistName: string) => {
    if (!user) return;
    
    try {
      const isAlreadyFollowed = followedArtists.some(artist => artist.id === channelId);
      
      if (isAlreadyFollowed) {
        // Unfollow artist
        await supabase
          .from('followed_artists')
          .delete()
          .eq('user_id', user.id)
          .eq('artist_id', channelId);
        
        setFollowedArtists(prev => prev.filter(artist => artist.id !== channelId));
        toast({ title: "Parou de seguir", description: artistName });
      } else {
        // Follow artist
        await supabase.from('followed_artists').insert({
          user_id: user.id,
          artist_id: channelId,
          artist_name: artistName
        });
        
        setFollowedArtists(prev => [...prev, { id: channelId, name: artistName }]);
        toast({ title: "Seguindo artista", description: artistName });
      }
    } catch (error) {
      console.error('Error managing followed artists:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar artista seguido",
        variant: "destructive"
      });
    }
  }, [user, followedArtists, toast]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-app-text-primary mb-4">
                Resultados da Busca
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent mx-auto"></div>
                  <p className="text-app-text-secondary mt-2">Buscando...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isCurrentTrack={currentTrack?.id === track.id}
                      isPlaying={isPlaying}
                      onClick={() => handleTrackSelect(track)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-8">
            {/* Search Bar */}
            <div className="bg-app-surface rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src="/lovable-uploads/67508e0d-5de8-4d0a-a3e9-3d86ae04639e.png" alt="PlaySong" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-bold text-app-text-primary">PlaySong</h1>
              </div>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Music Player - Only show if track is selected */}
            {currentTrack && (
              <MusicPlayer
                track={currentTrack}
                playlist={playlist}
                onTrackChange={setCurrentTrack}
                onAddToFavorites={handleAddToFavorites}
                onFollowArtist={handleFollowArtist}
              />
            )}

            {/* Popular Tracks */}
            <div>
              <h2 className="text-2xl font-bold text-app-text-primary mb-6">
                Músicas em Alta
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent mx-auto"></div>
                  <p className="text-app-text-secondary mt-2">Carregando...</p>
                </div>
              ) : (
                <div className="space-y-3">
                {trendingTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isCurrentTrack={currentTrack?.id === track.id}
                    isPlaying={isPlaying}
                    onClick={() => handleTrackSelect(track)}
                  />
                ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-app-background dark">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          favorites={favorites}
          followedArtists={followedArtists}
          history={history}
          onClearHistory={async () => {
            if (user) {
              await supabase
                .from('listening_history')
                .delete()
                .eq('user_id', user.id);
              setHistory([]);
              toast({ title: "Histórico limpo" });
            }
          }}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 ml-0 md:ml-0">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;