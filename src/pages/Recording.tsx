
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { CountdownOverlay } from "@/components/countdown-overlay";
import { RecordingControls } from "@/components/recording-controls";
import { screenRecordingService } from "@/services/screen-recording";
import { toast } from "sonner";

export default function Recording() {
  const navigate = useNavigate();
  const [isCountingDown, setIsCountingDown] = React.useState(true);
  const [isPaused, setIsPaused] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleCountdownComplete = async () => {
    try {
      const displayMediaOptions = {
        video: {
          displaySurface: "monitor" as DisplayCaptureSurfaceType,
          logicalSurface: true,
          frameRate: 60,
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      };

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      setStream(mediaStream);
      await screenRecordingService.startRecording(mediaStream);
      
      setIsCountingDown(false);
      startTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      navigate('/');
    }
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
    
    if (isPaused) {
      startTimer();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleStop = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      await screenRecordingService.stopRecording();
      toast.success('Recording completed');
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('Failed to save recording');
    }
    
    navigate(`/editor/new`);
  };

  return (
    <div className="min-h-screen bg-black">
      {isCountingDown ? (
        <CountdownOverlay count={3} onComplete={handleCountdownComplete} />
      ) : (
        <RecordingControls
          isPaused={isPaused}
          duration={duration}
          onPauseToggle={handlePauseToggle}
          onStop={handleStop}
        />
      )}
    </div>
  );
}
