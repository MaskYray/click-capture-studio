
import { Play } from "lucide-react";

interface VideoPreviewProps {
  videoUrl: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  background: string;
  padding: number;
}

export function VideoPreview({ videoUrl, videoRef, background, padding }: VideoPreviewProps) {
  return (
    <div className="relative aspect-video rounded-lg shadow-lg overflow-hidden mb-4">
      <div id="video-container" className={`absolute inset-0 ${background} backdrop-blur-sm`}>
        <div 
          className="absolute rounded-lg overflow-hidden bg-black/5 shadow-xl transition-all duration-300"
          style={{ inset: `${padding}px` }}
        >
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain rounded-lg transition-transform duration-300"
              controls
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Play className="h-16 w-16 text-white/50" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
