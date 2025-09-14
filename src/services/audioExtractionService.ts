// Service para extrair URLs de áudio do YouTube usando yt-dlp
export class AudioExtractionService {
  private static instance: AudioExtractionService;
  private cache = new Map<string, string>();

  static getInstance(): AudioExtractionService {
    if (!AudioExtractionService.instance) {
      AudioExtractionService.instance = new AudioExtractionService();
    }
    return AudioExtractionService.instance;
  }

  async extractAudioUrl(youtubeUrl: string): Promise<string | null> {
    try {
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) return null;

      // Check cache first
      if (this.cache.has(videoId)) {
        return this.cache.get(videoId)!;
      }

      // In production, this would call a backend service with yt-dlp
      // For now, we'll simulate the extraction with a timeout
      const audioUrl = await this.simulateExtraction(videoId);
      
      if (audioUrl) {
        this.cache.set(videoId, audioUrl);
      }

      return audioUrl;
    } catch (error) {
      console.error('Error extracting audio URL:', error);
      return null;
    }
  }

  private async simulateExtraction(videoId: string): Promise<string | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a simulated direct audio URL
    // In production, this would be the actual extracted URL from yt-dlp
    return `https://audio-stream.youtube.com/audio/${videoId}.m4a`;
  }

  private extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  clearCache(): void {
    this.cache.clear();
  }
}