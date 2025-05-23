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
import { exportVideo, formatTimeDisplay } from "@/utils/videoExport";
import { backgrounds } from "@/services/color";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [showExportPanel, setShowExportPanel] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = React.useState<number>(0);
  const [padding, setPadding] = React.useState(20);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showInput, setShowInput] = React.useState(false);
  const [projectTitle, setProjectTitle] = React.useState(id === "new" ? "Untitled Project" : "Project Demo");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [splitPoints, setSplitPoints] = React.useState<number[]>([]);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = React.useState(0);
  const [showMenu, setShowMenu] = React.useState(true);

  React.useEffect(() => {
    if (id === "new") {
      const recordingVideoUrl = screenRecordingService.getRecordingVideoUrl();
      console.log("Recording video URL:", recordingVideoUrl);
      if (recordingVideoUrl) {
        setVideoUrl(recordingVideoUrl);
      } else {
        toast.error("No recording found. Please record a video first.");
      }
    } else if (id) {
      setVideoUrl(`/videos/${id}`);
    }
  }, [id]);

  React.useEffect(() => {
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setVideoDuration(videoRef.current.duration);
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

      videoElement.load();

      if (videoElement.readyState >= 1) {
        setVideoDuration(videoElement.duration);
      }
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [videoRef.current, videoUrl]);

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
        const existingPoint = prev.find(point => Math.abs(point - currentTime) < 0.1);
        if (!existingPoint) {
          return [...prev, currentTime].sort((a, b) => a - b);
        }
        return prev;
      });
      toast.success(`Split added at ${formatTimeDisplay(currentTime)}`);
    }
  };

  const handleDeleteSplit = (index: number) => {
    setSplitPoints(prev => prev.filter((_, i) => i !== index));
    toast.success("Split point removed");
  };

  const handleTimeChange = (time: number) => {
    if (isNaN(time) || !isFinite(time)) {
      time = 0;
    }
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
    const handleVideoEvents = () => {
      if (videoRef.current) {
        videoRef.current.ontimeupdate = () => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        };

        videoRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    };

    handleVideoEvents();

    return () => {
      if (videoRef.current) {
        videoRef.current.ontimeupdate = null;
        videoRef.current.onended = null;
      }
    };
  }, [videoRef.current]);

  let timeOut: NodeJS.Timeout;

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
                  aspectRatio: 3 / 2,
                }}
                id="video-container"
                className={`h-full w-full flex flex-row justify-center items-center shadow-xl ${backgrounds[selectedBackground]} backdrop-blur-sm`}
              >
                <div
                  className={`absolute aspect-auto ${videoRef.current?.videoWidth > 300 ? "rounded-2xl" : "rounded-xl"} border-gray-600 border-2 overflow-hidden bg-black shadow-lg shadow-black transition-all duration-300`}
                  style={{
                    width: `${videoRef.current?.videoWidth > 500 ? '90%' : '300px'}`,
                    scale: `${padding / 100}`,
                  }}
                >
                  <div className="pb-2  bg-gray-800">
                    {showMenu &&
                      <div className="bg-blue w-full flex gap-x-1 bg-gray-800 p-2">
                        <div className="h-2 w-2 bg-red-500 rounded-full shadow"></div>
                        <div className="h-2 w-2 bg-yellow-200 rounded-full shadow"></div>
                        <div className="h-2 w-2 bg-green-500 rounded-full shadow"></div>
                      </div>
                    }

                    {videoUrl ? (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain transition-transform duration-300"
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
              showMenu={showMenu}
              setShowMenu={setShowMenu}
            />
          </div>

          <div className="py-3">
            <TimelineEditor
              duration={videoDuration}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              onSplitVideo={handleSplitVideo}
              splitPoints={splitPoints}
              isPlaying={isPlaying}
              onPlayPause={togglePlayPause}
              onDeleteSplit={handleDeleteSplit}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
