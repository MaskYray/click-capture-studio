
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { CountdownOverlay } from "@/components/countdown-overlay";
import { RecordingControls } from "@/components/recording-controls";

export default function Recording() {
  const navigate = useNavigate();
  const [isCountingDown, setIsCountingDown] = React.useState(true);
  const [isPaused, setIsPaused] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleCountdownComplete = () => {
    setIsCountingDown(false);
    startTimer();
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
    
    if (isPaused) {
      startTimer();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // In a real app, this would save the recording and navigate to the editor
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
