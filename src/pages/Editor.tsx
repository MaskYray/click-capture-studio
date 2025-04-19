import * as React from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Download, Play, Save, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { TimelineEditor } from "@/components/timeline-editor";
import { ExportPanel } from "@/components/export-panel";
import { screenRecordingService } from "@/services/screen-recording";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { BackgroundEffectEditor } from "@/components/background-effects-editor";
import { VideoPreview } from "@/components/video-preview/VideoPreview";
import { exportVideo } from "@/utils/videoExport";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [showExportPanel, setShowExportPanel] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = React.useState<number>(0);
  const [padding, setPadding] = React.useState(64);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showInput, setShowInput] = React.useState(false);
  const [projectTitle, setProjectTitle] = React.useState(id === "new" ? "Untitled Project" : "Project Demo");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [splitPoints, setSplitPoints] = React.useState<number[]>([]);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  
  const backgrounds = [
    // Soft radial with a bluish glow
    'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-studio-blue/20 via-white/10 to-studio-purple/30',

    // Diagonal blend with light tones
    'bg-gradient-to-br from-studio-purple-light to-studio-accent',

    // Clean linear horizontal blend
    'bg-gradient-to-r from-studio-blue-light to-studio-purple',

    // Energetic left to right blend
    'bg-gradient-to-r from-studio-blue to-studio-purple',

    // Center glow effect
    'bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-studio-accent/30 via-studio-purple-light to-transparent',

    // Vibrant bottom-right light throw
    'bg-gradient-to-br from-studio-purple/40 via-studio-accent/30 to-studio-blue/10',

    // Circular gradient with purple core
    'bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-studio-purple to-studio-blue/20',

    // Classic diagonal but muted
    'bg-gradient-to-tr from-studio-purple/10 to-studio-blue/30',

    // Mixed radial shimmer
    'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-studio-accent/40 via-studio-purple-light to-studio-blue/10',

    // Top-down bold blend
    'bg-gradient-to-b from-studio-blue/30 via-studio-purple to-studio-accent',
  ];

  React.useEffect(() => {
    const recordedBlob = screenRecordingService.getCurrentRecording();
    const mousePositions = screenRecordingService.getMousePositions();

    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setVideoUrl(url);

      if (videoRef.current) {
        videoRef.current.ontimeupdate = () => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
          const relevantPositions = mousePositions.filter(
            pos => Math.abs(pos.timestamp - (currentTime * 1000)) < 100
          );

          if (relevantPositions.length > 0) {
            const lastPosition = relevantPositions[relevantPositions.length - 1];
            const scale = 1.2; // Zoom scale factor
            if (videoRef.current) {
              videoRef.current.style.transform = `scale(${scale})`;
              videoRef.current.style.transformOrigin = `${lastPosition.x}px ${lastPosition.y}px`;
            }
          } else {
            if (videoRef.current) {
              videoRef.current.style.transform = 'scale(1)';
            }
          }
        };
      }

      return () => URL.revokeObjectURL(url);
    }
  }, []);

  const videoDuration = videoRef.current?.duration || 45;

  const handleExport = async (format: string, quality: string, ratio: string) => {
    try {
      if (!videoRef.current || !videoContainerRef.current) {
        toast.error("Video not ready for export");
        return;
      }
      
      setIsExporting(true);
      setExportProgress(0);
      
      await exportVideo(
        videoRef.current, 
        videoContainerRef.current,
        format, 
        quality, 
        (progress) => setExportProgress(progress)
      );
      
      setIsExporting(false);
      setShowExportPanel(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export video');
      setIsExporting(false);
    }
  };

  const handleSplitVideo = () => {
    if (videoRef.current && currentTime > 0) {
      setSplitPoints((prev) => {
        // Check if the split point already exists
        if (!prev.includes(currentTime)) {
          return [...prev, currentTime].sort((a, b) => a - b);
        }
        return prev;
      });
      toast.success(`Split added at ${formatTime(currentTime)}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  React.useEffect(() => {
    const handleVideoEnded = () => {
      setIsPlaying(false);
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnded);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('ended', handleVideoEnded);
      }
    };
  }, [videoRef]);

  let timeOut;

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />

      <main className="flex-1 px-6 py-4 flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button variant="ghost" className="mr-2">
                <a href="/">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </a>
              </Button>
              {!showInput ? (
                <h1 className="text-2xl font-semibold cursor-pointer" onDoubleClick={() => setShowInput(true)}>
                  {projectTitle}
                </h1>
              ) : (
                <input
                  type="text"
                  value={projectTitle}
                  className="border border-blue-500 rounded-sm p-2"
                  onChange={(e) => {
                    clearTimeout(timeOut);
                    setProjectTitle(e.target.value);
                    timeOut = setTimeout(() => {
                      setShowInput(false);
                    }, 4000);
                  }}
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={togglePlayPause}
              >
                <Play className="h-4 w-4 mr-2" />
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>
          </div>

          <div className="flex flex-row gap-4">
            <div
              style={{
                aspectRatio: 3 / 2
              }}
              className="relative w-full h-full border flex justify-center items-center rounded-lg shadow-lg overflow-hidden mb-4"
            >
              <div
                ref={videoContainerRef}
                style={{
                  aspectRatio: 3 / 2
                }}
                id="video-container" 
                className={`w-full h-fit flex flex-row justify-center items-center shadow-xl ${backgrounds[selectedBackground]} backdrop-blur-sm`}
              >
                <div
                  className={`absolute h-fit rounded-lg border-gray-600 border-2 overflow-hidden bg-black shadow-lg shadow-black transition-all duration-300`}
                  style={{
                    top: `${padding}px`,
                    bottom: `${padding}px`,
                    left: `${padding}px`,
                    right: `${padding}px`,
                    margin: 'auto'
                  }}
                >
                  <div>
                    <div className="bg-blue w-full flex gap-x-1 bg-gray-800 p-2">
                      <div className="h-2 w-2 bg-red-500 rounded-full shadow"></div>
                      <div className="h-2 w-2 bg-yellow-200 rounded-full shadow"></div>
                      <div className="h-2 w-2 bg-green-500 rounded-full shadow"></div>
                    </div>

                    {videoUrl ? (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="h-full w-full transition-transform duration-300"
                        controls={false}
                      />
                    ) : (
                      <div className="flex w-full items-center justify-center">
                        <Play className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <BackgroundEffectEditor
              duration={videoDuration}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              backgrounds={backgrounds}
              selectedBackground={selectedBackground}
              setSelectedBackground={setSelectedBackground}
              padding={padding}
              setPadding={setPadding}
              handleExport={handleExport}
              isExporting={isExporting}
              exportProgress={exportProgress}
            />
          </div>

          <div className="py-3">
            <TimelineEditor
              duration={videoDuration}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              backgrounds={backgrounds}
              selectedBackground={selectedBackground}
              setSelectedBackground={setSelectedBackground}
              padding={padding}
              setPadding={setPadding}
              onSplitVideo={handleSplitVideo}
              splitPoints={splitPoints}
              isPlaying={isPlaying}
              onPlayPause={togglePlayPause}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
