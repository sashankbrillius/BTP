import { Play, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Video {
  videoId: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  channel?: string;
  description?: string;
  url?: string;
}

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  compact?: boolean;
  className?: string;
}

export function VideoCard({ video, onClick, compact = false, className }: VideoCardProps) {
  const thumbnailUrl = video.thumbnail || 
    (video.videoId && !video.videoId.startsWith('http') 
      ? `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg` 
      : undefined);

  return (
    <div
      className={cn(
        "group cursor-pointer rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200",
        "bg-white hover:bg-blue-50",
        compact ? "p-2" : "p-3",
        className
      )}
      onClick={onClick}
    >
      <div className={cn("flex gap-3", compact ? "items-start" : "items-center")}>
        {/* Thumbnail */}
        <div className={cn(
          "relative flex-shrink-0 rounded overflow-hidden bg-gray-100",
          compact ? "w-16 h-12" : "w-24 h-18"
        )}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Play className={cn("text-blue-600", compact ? "w-4 h-4" : "w-6 h-6")} />
            </div>
          )}
          
          {/* Duration overlay */}
          {video.duration && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
              {video.duration}
            </div>
          )}
          
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="text-white w-6 h-6" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2",
            compact ? "text-sm mb-1" : "text-base mb-2"
          )}>
            {video.title}
          </h4>
          
          {video.channel && (
            <p className={cn(
              "text-gray-600 mb-1",
              compact ? "text-xs" : "text-sm"
            )}>
              {video.channel}
            </p>
          )}
          
          {video.description && !compact && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
              {video.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}