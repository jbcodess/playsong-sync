import { Track } from '@/components/MusicPlayer';

export interface PlaylistState {
  tracks: Track[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'all' | 'one';
  queue: Track[];
}

export class PlaylistManager {
  private static instance: PlaylistManager;
  private state: PlaylistState = {
    tracks: [],
    currentIndex: 0,
    isShuffled: false,
    repeatMode: 'none',
    queue: []
  };
  private shuffledIndices: number[] = [];
  private listeners: Set<(state: PlaylistState) => void> = new Set();

  static getInstance(): PlaylistManager {
    if (!PlaylistManager.instance) {
      PlaylistManager.instance = new PlaylistManager();
    }
    return PlaylistManager.instance;
  }

  // State management
  getState(): PlaylistState {
    return { ...this.state };
  }

  subscribe(listener: (state: PlaylistState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Playlist operations
  setPlaylist(tracks: Track[], startIndex: number = 0): void {
    this.state.tracks = tracks;
    this.state.currentIndex = startIndex;
    this.generateShuffledIndices();
    this.notifyListeners();
  }

  getCurrentTrack(): Track | null {
    if (this.state.tracks.length === 0) return null;
    const index = this.state.isShuffled 
      ? this.shuffledIndices[this.state.currentIndex] 
      : this.state.currentIndex;
    return this.state.tracks[index] || null;
  }

  getNextTrack(): Track | null {
    if (this.state.tracks.length === 0) return null;

    // Check queue first
    if (this.state.queue.length > 0) {
      return this.state.queue[0];
    }

    let nextIndex = this.state.currentIndex;

    if (this.state.repeatMode === 'one') {
      return this.getCurrentTrack();
    }

    nextIndex = this.state.currentIndex + 1;

    if (nextIndex >= this.state.tracks.length) {
      if (this.state.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return null; // End of playlist
      }
    }

    const index = this.state.isShuffled 
      ? this.shuffledIndices[nextIndex] 
      : nextIndex;
    return this.state.tracks[index] || null;
  }

  playNext(): Track | null {
    // Play from queue first
    if (this.state.queue.length > 0) {
      const track = this.state.queue.shift()!;
      this.notifyListeners();
      return track;
    }

    const nextTrack = this.getNextTrack();
    if (nextTrack) {
      this.state.currentIndex = this.state.currentIndex + 1;
      if (this.state.currentIndex >= this.state.tracks.length) {
        this.state.currentIndex = this.state.repeatMode === 'all' ? 0 : this.state.tracks.length - 1;
      }
      this.notifyListeners();
    }
    return nextTrack;
  }

  playPrevious(): Track | null {
    if (this.state.tracks.length === 0) return null;

    let prevIndex = this.state.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.state.tracks.length - 1;
    }

    this.state.currentIndex = prevIndex;
    this.notifyListeners();
    return this.getCurrentTrack();
  }

  // Queue management
  addToQueue(track: Track): void {
    this.state.queue.push(track);
    this.notifyListeners();
  }

  removeFromQueue(index: number): void {
    this.state.queue.splice(index, 1);
    this.notifyListeners();
  }

  clearQueue(): void {
    this.state.queue = [];
    this.notifyListeners();
  }

  // Shuffle and repeat
  toggleShuffle(): void {
    this.state.isShuffled = !this.state.isShuffled;
    if (this.state.isShuffled) {
      this.generateShuffledIndices();
    }
    this.notifyListeners();
  }

  setRepeatMode(mode: 'none' | 'all' | 'one'): void {
    this.state.repeatMode = mode;
    this.notifyListeners();
  }

  private generateShuffledIndices(): void {
    this.shuffledIndices = Array.from({ length: this.state.tracks.length }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
    }
  }

  // Preload next track for smooth playback
  getPreloadTrack(): Track | null {
    const nextTrack = this.getNextTrack();
    return nextTrack;
  }
}