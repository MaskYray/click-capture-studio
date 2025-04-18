import * as React from "react";
import { useParams } from "react-router-dom";
import { MainNav } from "@/components/main-nav";
import { TimelineEditor } from "@/components/timeline-editor";
import { ExportPanel } from "@/components/export-panel";
import { screenRecordingService } from "@/services/screen-recording";
import { Slider } from "@/components/ui/slider";
import { VideoPreview } from "@/components/video-preview/VideoPreview";
import { BackgroundSelector } from "@/components/video-preview/BackgroundSelector";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { exportVideo } from "@/utils/videoExport";

const backgrounds = [
  'bg-gradient-to-br from-studio-blue/20 to-studio-purple/20',
  'bg-gradient-to-br from-studio-purple-light to-studio-accent',
  'bg-gradient-to-br from-studio-blue-light to-studio-purple',
  'bg-gradient-to-r from-studio-blue to-studio-purple',
];

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [showExportPanel, setShowExportPanel] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = React.useState<number>(0);
  const [padding, setPadding] = React.useState(16);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const recordedBlob = screenRecordingService.getCurrentRecording();
    const mousePositions = screenRecordingService.getMousePositions();

    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setVideoUrl(url);

      if (videoRef.current) {
        videoRef.current.ontimeupdate = () => {
          const currentTime = videoRef.current?.currentTime || 0;
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

  const projectTitle = id === "new" ? "Untitled Project" : "Project Demo";
  const videoDuration = 45;

  const handleExport = async (format: string, quality: string, ratio: string) => {
    try {
      setIsExporting(true);
      const videoContainer = document.getElementById('video-container');
      
      if (!videoRef.current || !videoContainer) return;
      
      await exportVideo(
        videoRef.current,
        videoContainer,
        format,
        quality,
        setExportProgress
      );
      
      setIsExporting(false);
      setShowExportPanel(false);
    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);
      setShowExportPanel(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      
      <main className="flex-1 px-6 py-4 flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
          <EditorHeader 
            projectTitle={projectTitle}
            onExportClick={() => setShowExportPanel(!showExportPanel)}
          />
          
          <VideoPreview
            videoUrl={videoUrl}
            videoRef={videoRef}
            background={backgrounds[selectedBackground]}
            padding={padding}
          />
          
          <BackgroundSelector
            backgrounds={backgrounds}
            selectedBackground={selectedBackground}
            onBackgroundSelect={setSelectedBackground}
          />
          
          <TimelineEditor
            duration={videoDuration}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
          />
          
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Video Padding</span>
              <span>{padding}px</span>
            </div>
            <Slider
              value={[padding]}
              min={0}
              max={64}
              step={4}
              onValueChange={([value]) => setPadding(value)}
            />
          </div>
          
          {showExportPanel && (
            <div className="mt-4">
              <ExportPanel
                onExport={handleExport}
                isExporting={isExporting}
                progress={exportProgress}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
