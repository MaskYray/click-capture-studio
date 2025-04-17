
import * as React from "react";
import { Pause, Square, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingControlsProps {
  isPaused: boolean;
  duration: number;
  onPauseToggle: () => void;
  onStop: () => void;
}

export function RecordingControls({
  isPaused,
  duration,
  onPauseToggle,
  onStop,
}: RecordingControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg z-50 flex items-center space-x-4">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isPaused ? "bg-amber-500" : "bg-studio-accent recording-pulse"}`} />
        <span className="text-sm font-medium">{formatTime(duration)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onPauseToggle}
        >
          {isPaused ? (
            <CircleDot className="h-4 w-4 text-studio-accent" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onStop}
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
