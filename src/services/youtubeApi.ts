const YOUTUBE_API_KEY = "AIzaSyAgENsbCl6tA4i511wIdUevk0CvEob_tCA";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
    publishedAt: string;
    channelId: string;
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
  };
}

export class YouTubeService {
  private static instance: YouTubeService;

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  async searchVideos(query: string, maxResults: number = 25, pageToken?: string): Promise<YouTubeSearchResponse> {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY,
      videoEmbeddable: 'true',
      order: 'relevance'
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await fetch(`${BASE_URL}/search?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    return response.json();
  }

  async getVideoDetails(videoId: string) {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${BASE_URL}/videos?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items[0];
  }

  async getChannelDetails(channelId: string): Promise<YouTubeChannel> {
    const params = new URLSearchParams({
      part: 'snippet,statistics',
      id: channelId,
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${BASE_URL}/channels?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items[0];
  }

  async getChannelVideos(channelId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({
      part: 'snippet',
      channelId: channelId,
      type: 'video',
      order: 'relevance',
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY,
      videoEmbeddable: 'true'
    });

    const response = await fetch(`${BASE_URL}/search?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items;
  }

  async getRelatedVideos(videoId: string): Promise<YouTubeVideo[]> {
    // Since YouTube removed related videos from API, we'll search for similar content
    const videoDetails = await this.getVideoDetails(videoId);
    if (!videoDetails) return [];

    const searchQuery = `${videoDetails.snippet.channelTitle}`;
    const response = await this.searchVideos(searchQuery, 10);
    
    // Filter out the current video
    return response.items.filter(video => video.id.videoId !== videoId);
  }

  async getTrendingVideos(regionCode: string = 'BR', maxResults: number = 25): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({
      part: 'snippet',
      chart: 'mostPopular',
      regionCode: regionCode,
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY,
      videoCategoryId: '10' // Music category
    });

    const response = await fetch(`${BASE_URL}/videos?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items.map(item => ({
      id: { videoId: item.id },
      snippet: item.snippet
    }));
  }

  extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}