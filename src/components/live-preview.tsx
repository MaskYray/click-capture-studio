
import React from "react";
import { Camera, Monitor } from "lucide-react";

interface LivePreviewProps {
  stream: MediaStream | null;
  type: "screen" | "camera";
}

export function LivePreview({ stream, type }: LivePreviewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        type === "camera" ? (
          <Camera className="h-12 w-12 text-muted-foreground/50" />
        ) : (
          <Monitor className="h-12 w-12 text-muted-foreground/50" />
        )
      )}
    </div>
  );
}
