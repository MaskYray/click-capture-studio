
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
      if (!videoRef.current || !videoUrl) {
        toast.error("No video available to export");
        return;
      }

      setIsExporting(true);
      setExportProgress(0);

      // Clone the original video for processing
      const originalVideo = videoRef.current;
      const videoContainer = document.getElementById('video-container');

      if (!videoContainer) {
        toast.error("Could not find video container");
        setIsExporting(false);
        return;
      }

      // Create a canvas to capture the background and video
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Could not create canvas context");
        setIsExporting(false);
        return;
      }

      // Get styles from the container
      const containerStyles = window.getComputedStyle(videoContainer);
      const containerWidth = videoContainer.clientWidth;
      const containerHeight = videoContainer.clientHeight;
      
      // Match canvas size to container
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Set up a media recorder to capture frames
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: format === 'webm' ? 'video/webm' : 'video/mp4',
        videoBitsPerSecond: quality === '2160p' ? 8000000 : 5000000
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async function() {
        const blob = new Blob(chunks, { 
          type: format === 'webm' ? 'video/webm' : 'video/mp4' 
        });
        
        setExportProgress(100);
        await screenRecordingService.saveRecording(blob, `capture.${format}`);
        toast.success('Export completed successfully');
        setIsExporting(false);
        setShowExportPanel(false);
      };

      // Start recording
      mediaRecorder.start();
      setExportProgress(10);

      // Reset the original video and prepare for frame capture
      originalVideo.currentTime = 0;
      originalVideo.muted = false;
      originalVideo.play();

      // Track progress
      let lastTime = 0;
      const totalDuration = originalVideo.duration;
      
      // Function to draw each frame with background
      const drawFrame = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background based on selected background
        const bgElement = videoContainer.querySelector('div');
        if (bgElement) {
          // Capture background color/gradient
          const bgStyles = window.getComputedStyle(bgElement);
          ctx.fillStyle = bgStyles.background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Draw video frame with padding
        const videoBounds = originalVideo.getBoundingClientRect();
        const paddingRatio = padding / containerWidth;
        const innerWidth = containerWidth * (1 - 2 * paddingRatio);
        const innerHeight = containerHeight * (1 - 2 * paddingRatio);
        const paddingX = containerWidth * paddingRatio;
        const paddingY = containerHeight * paddingRatio;
        
        ctx.drawImage(
          originalVideo, 
          paddingX, paddingY, 
          innerWidth, innerHeight
        );
        
        // Update progress based on video time
        if (originalVideo.currentTime > lastTime) {
          lastTime = originalVideo.currentTime;
          const progress = Math.min(90, 10 + (lastTime / totalDuration) * 80);
          setExportProgress(Math.floor(progress));
        }
        
        // Continue drawing frames until video ends
        if (!originalVideo.ended && !originalVideo.paused) {
          requestAnimationFrame(drawFrame);
        } else {
          // Finish recording when video ends
          setTimeout(() => {
            mediaRecorder.stop();
          }, 500);
        }
      };
      
      // Start the drawing process
      drawFrame();
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export video');
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
