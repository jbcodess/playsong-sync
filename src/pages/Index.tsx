import React, { useState } from 'react';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Sidebar } from '@/components/Sidebar';
import { TrackCard } from '@/components/TrackCard';
import { SearchBar } from '@/components/SearchBar';

// Sample track data
const sampleTracks = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample audio
    duration: 355,
  },
  {
    id: '2',
    title: 'Imagine',
    artist: 'John Lennon',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 183,
  },
  {
    id: '3',
    title: 'Hotel California',
    artist: 'Eagles',
    albumArt: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 391,
  },
  {
    id: '4',
    title: 'Sweet Child O Mine',
    artist: 'Guns N Roses',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 356,
  },
  {
    id: '5',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    albumArt: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    duration: 482,
  },
];

const Index = () => {
  const [currentTrack, setCurrentTrack] = useState(sampleTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [searchResults, setSearchResults] = useState(sampleTracks);

  const handleTrackSelect = (track: typeof sampleTracks[0]) => {
    setCurrentTrack(track);
  };

  const handleSearch = (query: string) => {
    // Filter tracks based on search query
    const filtered = sampleTracks.filter(track =>
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    setActiveSection('search');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-app-text-primary mb-4">
                Resultados da Busca
              </h2>
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
            </div>
          </div>
        );
      
      case 'library':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-app-text-primary mb-4">
              Minha Biblioteca
            </h2>
            <div className="space-y-3">
              {sampleTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isCurrentTrack={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  onClick={() => handleTrackSelect(track)}
                />
              ))}
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-app-text-primary mb-4">
              Histórico
            </h2>
            <p className="text-app-text-secondary">
              Suas músicas reproduzidas recentemente aparecerão aqui.
            </p>
          </div>
        );
      
      default:
        return (
          <div className="space-y-8">
            {/* Search Bar */}
            <div className="bg-app-surface rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-sm">▶️🎵</span>
                </div>
                <h1 className="text-3xl font-bold text-app-text-primary">PlaySong</h1>
              </div>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Music Player */}
            <MusicPlayer
              track={currentTrack}
              playlist={sampleTracks}
              onTrackChange={setCurrentTrack}
            />

            {/* Popular Tracks */}
            <div>
              <h2 className="text-2xl font-bold text-app-text-primary mb-6">
                Músicas Populares
              </h2>
              <div className="space-y-3">
                {sampleTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isCurrentTrack={currentTrack?.id === track.id}
                    isPlaying={isPlaying}
                    onClick={() => handleTrackSelect(track)}
                  />
                ))}
              </div>
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

export default Index;
