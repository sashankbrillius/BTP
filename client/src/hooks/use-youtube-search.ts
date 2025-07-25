import { useQuery } from "@tanstack/react-query";

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  duration?: string;
  channel?: string;
  description?: string;
  url?: string;
}

interface PineconeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  metadata?: any;
}

interface PineconeResponse {
  videos: PineconeVideo[];
  results?: any[];
}

// Hook for YouTube video search
export function useYouTubeVideos(suggestions: string[], limit = 6) {
  return useQuery({
    queryKey: ['youtube-videos', suggestions],
    queryFn: async (): Promise<Video[]> => {
      if (!suggestions.length) return [];
      
      const response = await fetch('/api/youtube/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: suggestions.join(' '),
          maxResults: limit
        })
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      return data.videos || [];
    },
    enabled: suggestions.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}

// Hook for Pinecone video search
export function usePineconeVideos(query: string, options: { topK?: number; enabled?: boolean } = {}) {
  const { topK = 5, enabled = true } = options;
  
  return useQuery({
    queryKey: ['pinecone-videos', query, topK],
    queryFn: async (): Promise<PineconeResponse> => {
      if (!query.trim()) return { videos: [] };
      
      const response = await fetch('/api/pinecone/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: query.trim(),
          topK
        })
      });

      if (!response.ok) {
        throw new Error(`Pinecone API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert Pinecone results to video format
      const videos: PineconeVideo[] = data.results?.map((result: any, index: number) => ({
        id: `pinecone-${index}`,
        title: result.metadata?.title || result.text?.substring(0, 60) + '...' || `Video ${index + 1}`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(result.metadata?.title || result.text?.substring(0, 50) || query)}`,
        thumbnail: '',
        description: result.text?.substring(0, 150) + '...' || 'Educational content',
        metadata: result.metadata
      })) || [];

      return { videos, results: data.results };
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
}

// Helper function to check if error is YouTube quota exceeded
export function isYouTubeQuotaExceededError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  return message.includes('quota') || 
         message.includes('exceeded') || 
         error.status === 403;
}