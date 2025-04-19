
import * as React from "react";
import { Camera, Mic, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordingControls } from "./recording-controls";
import { CountdownOverlay } from "./countdown-overlay";
import { screenRecordingService } from "@/services/screen-recording";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRecording: () => void;
}

export function RecordingModal({
  isOpen,
  onClose,
  onStartRecording
}: RecordingModalProps) {

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

      try {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        if (mediaStream) {
          setStream(mediaStream);
          await screenRecordingService.startRecording(mediaStream);
        } else {
          console.log('failed')
        }
      } catch (e) {
        console.log(e);
      }

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <div className=" bg-black h-[400px] p-3 rounded-lg py-5 overflow-hidden">
          {isCountingDown ? (
            <CountdownOverlay count={2} onComplete={handleCountdownComplete} />
          ) : (
            <RecordingControls
              isPaused={isPaused}
              duration={duration}
              onPauseToggle={handlePauseToggle}
              onStop={handleStop}
            />
          )}
        </div>
        {/* <Tabs defaultValue="screen" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="screen">
              <Monitor className="h-4 w-4 mr-2" />
              Screen
            </TabsTrigger>
            <TabsTrigger value="camera">
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="both">
              <div className="flex items-center">
                <Monitor className="h-4 w-4" />
                <span className="mx-1">+</span>
                <Camera className="h-4 w-4 mr-2" />
                Both
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screen" className="mt-0">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Monitor className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Audio Source
                  </Button>
                </div>
                <Button onClick={onStartRecording} className="bg-studio-accent hover:bg-studio-accent/90">
                  Start Recording
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="camera" className="mt-0">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Audio Source
                  </Button>
                </div>
                <Button onClick={onStartRecording} className="bg-studio-accent hover:bg-studio-accent/90">
                  Start Recording
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="both" className="mt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Monitor className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Camera className="h-10 w-10 text-muted-foreground/50" />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Audio Source
                  </Button>
                </div>
                <Button onClick={onStartRecording} className="bg-studio-accent hover:bg-studio-accent/90">
                  Start Recording
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs> */}
      </DialogContent>
    </Dialog>
  );
}
