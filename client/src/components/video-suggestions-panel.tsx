import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useYouTubeVideos, usePineconeVideos, isYouTubeQuotaExceededError } from "@/hooks/use-youtube-search";
import { VideoCard } from "./video-card";

interface VideoSuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  usePinecone?: boolean;
  className?: string;
}

export function VideoSuggestionsPanel({
  isOpen,
  onClose,
  suggestions,
  usePinecone = false,
  className
}: VideoSuggestionsPanelProps) {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  
  // Use the hooks for video fetching
  const yt = useYouTubeVideos(suggestions, 6);
  const pinecone = usePineconeVideos(suggestions.join(" "), { 
    topK: 5, 
    enabled: usePinecone || quotaExceeded 
  });
  
  // Select data source based on preference or quota status
  const rawVideos = usePinecone || quotaExceeded ? pinecone.data?.videos : yt.data;
  const isLoading = usePinecone || quotaExceeded ? pinecone.isLoading : yt.isLoading;
  const error = usePinecone || quotaExceeded ? pinecone.error : yt.error;

  // Generate fallback videos from suggestions if no API data available
  const videos = rawVideos && rawVideos.length > 0 ? rawVideos : 
    suggestions.map((suggestion, index) => ({
      videoId: `fallback-${index}`,
      id: `fallback-${index}`,
      title: suggestion,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion)}`,
      thumbnail: '',
      description: `Learn about ${suggestion} with educational video content`,
      channel: 'YouTube Search'
    }));

  // Check for YouTube quota exceeded
  useEffect(() => {
    if (isYouTubeQuotaExceededError(yt.error)) {
      setQuotaExceeded(true);
      console.log('YouTube quota exceeded, switching to Pinecone');
    }
  }, [yt.error]);

  // Debug logging
  useEffect(() => {
    if (videos && videos.length > 0) {
      const source = rawVideos && rawVideos.length > 0 ? 
        (usePinecone || quotaExceeded ? 'Pinecone' : 'YouTube') : 
        'Contextual Fallback';
      console.log('Video suggestions loaded:', videos.length, 'videos from', source);
      console.log('Video titles:', videos.map(v => v.title));
    }
  }, [videos, rawVideos, usePinecone, quotaExceeded]);

  const handleVideoClick = (videoId: string, url?: string) => {
    if (url) {
      console.log('Opening video URL:', url);
      window.open(url, '_blank');
    } else if (videoId && !videoId.startsWith('fallback')) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log('Opening YouTube video:', youtubeUrl);
      window.open(youtubeUrl, '_blank');
    } else {
      console.log('No valid URL found for video:', videoId);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={cn("w-80 h-full flex flex-col", className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Suggestions
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Based on your current topic</span>
          {quotaExceeded && (
            <Badge variant="secondary" className="text-xs">
              Pinecone (Quota Exceeded)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-4 pt-0">
        {quotaExceeded && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
            YouTube API quota exceeded. Showing results from knowledge base instead.
          </div>
        )}

        {/* Video Suggestions */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-20 mb-2" />
                  <div className="bg-gray-200 h-4 rounded mb-1" />
                  <div className="bg-gray-200 h-3 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-red-600 text-sm mb-2">Failed to load video suggestions</p>
              <p className="text-gray-500 text-xs">{error.message}</p>
            </div>
          )}

          {videos && videos.length > 0 && (
            <div className="space-y-3">
              {videos.slice(0, 6).map((video: any, idx: number) => {
                // Extract YouTube videoId from url for real videos
                let videoId = video.videoId || "";
                if (video.url && !video.url.includes('search_query')) {
                  const match = video.url.match(/[?&]v=([^&#]+)/) || 
                               video.url.match(/youtu\.be\/([^?&#]+)/) || 
                               video.url.match(/youtube\.com\/embed\/([^?&#]+)/);
                  if (match) videoId = match[1];
                }
                
                return (
                  <VideoCard
                    key={video.videoId || video.id || video.url || idx}
                    video={{
                      ...video,
                      videoId: videoId || video.id || `fallback-${idx}`,
                      thumbnail: video.thumbnail || 
                        (videoId && !videoId.startsWith("http") && !videoId.startsWith("fallback") 
                          ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` 
                          : undefined)
                    }}
                    onClick={() => handleVideoClick(videoId || video.id || `fallback-${idx}`, video.url)}
                    compact
                  />
                );
              })}
            </div>
          )}

          {(!videos || videos.length === 0) && !isLoading && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No video suggestions available</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Ask a question to see contextual video suggestions
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}