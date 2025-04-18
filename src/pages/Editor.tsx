import * as React from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Download, Play, Save, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { TimelineEditor } from "@/components/timeline-editor";
import { ExportPanel } from "@/components/export-panel";
import { screenRecordingService } from "@/services/screen-recording";
import { Slider } from "@/components/ui/slider";

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

  const backgrounds = [
    'bg-gradient-to-br from-studio-blue/20 to-studio-purple/20',
    'bg-gradient-to-br from-studio-purple-light to-studio-accent',
    'bg-gradient-to-br from-studio-blue-light to-studio-purple',
    'bg-gradient-to-r from-studio-blue to-studio-purple',
  ];

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
      const videoContainer = document.getElementById('video-container');
      if (!videoContainer) return;

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(videoContainer);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      await screenRecordingService.saveRecording(blob);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setShowExportPanel(false);
  };

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
              <h1 className="text-2xl font-semibold">{projectTitle}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                className="bg-studio-blue hover:bg-studio-blue/90"
                size="sm"
                onClick={() => setShowExportPanel(!showExportPanel)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="relative aspect-video rounded-lg shadow-lg overflow-hidden mb-4">
            <div id="video-container" className={`absolute inset-0 ${backgrounds[selectedBackground]} backdrop-blur-sm`}>
              <div 
                className="absolute rounded-lg overflow-hidden bg-black/5 shadow-xl transition-all duration-300"
                style={{ 
                  inset: `${padding}px`,
                }}
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
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            {backgrounds.map((bg, index) => (
              <button
                key={index}
                className={`aspect-video rounded-lg cursor-pointer ${bg} ${
                  selectedBackground === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedBackground(index)}
              />
            ))}
          </div>
          
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
