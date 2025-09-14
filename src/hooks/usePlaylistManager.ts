import { useState, useEffect } from 'react';
import { PlaylistManager, PlaylistState } from '@/services/playlistManager';
import { Track } from '@/components/MusicPlayer';

export function usePlaylistManager() {
  const playlistManager = PlaylistManager.getInstance();
  const [state, setState] = useState<PlaylistState>(playlistManager.getState());

  useEffect(() => {
    const unsubscribe = playlistManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const setPlaylist = (tracks: Track[], startIndex?: number) => {
    playlistManager.setPlaylist(tracks, startIndex);
  };

  const playNext = () => {
    return playlistManager.playNext();
  };

  const playPrevious = () => {
    return playlistManager.playPrevious();
  };

  const addToQueue = (track: Track) => {
    playlistManager.addToQueue(track);
  };

  const removeFromQueue = (index: number) => {
    playlistManager.removeFromQueue(index);
  };

  const clearQueue = () => {
    playlistManager.clearQueue();
  };

  const toggleShuffle = () => {
    playlistManager.toggleShuffle();
  };

  const setRepeatMode = (mode: 'none' | 'all' | 'one') => {
    playlistManager.setRepeatMode(mode);
  };

  const getCurrentTrack = () => {
    return playlistManager.getCurrentTrack();
  };

  const getNextTrack = () => {
    return playlistManager.getNextTrack();
  };

  const getPreloadTrack = () => {
    return playlistManager.getPreloadTrack();
  };

  return {
    state,
    setPlaylist,
    playNext,
    playPrevious,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleShuffle,
    setRepeatMode,
    getCurrentTrack,
    getNextTrack,
    getPreloadTrack
  };
}