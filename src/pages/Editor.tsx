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
  const [showInput, setShowInput] = React.useState(false)
  const [projectTitle, setProjectTitle] = React.useState(id === "new" ? "Untitled Project" : "Project Demo")
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


  const videoDuration = 45;

  const handleExport = async (format: string, quality: string, ratio: string) => {
    try {
      const videoContainer = document.getElementById('video-container');
      if (!videoContainer) {
        toast.error("Could not find video container");
        return;
      }

      setIsExporting(true);
      setExportProgress(0);

      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(videoContainer, {
        backgroundColor: null,
        scale: quality === '2160p' ? 2 : 1,
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, `image/${format === 'gif' ? 'gif' : 'png'}`);
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      setExportProgress(100);
      await screenRecordingService.saveRecording(blob, `capture.${format === 'gif' ? 'gif' : 'png'}`);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export video');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setShowExportPanel(false);
    }
  };
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
              {!showInput ?
                <h1 className="text-2xl font-semibold cursor-pointer" onDoubleClick={() => setShowInput(true)}>{projectTitle}</h1>
                :
                <input type="text" value={projectTitle} className="border border-blue-500 rounded-sm p-2" onChange={(e) => {
                  clearTimeout(timeOut)
                  setProjectTitle(e.target.value)
                  timeOut = setTimeout(() => {
                    setShowInput(false)
                  }, 1000)
                }} />
              }
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

            </div>
          </div>

          <div className="flex flex-row gap-4  ">

            <div
              style={{
                aspectRatio: 3 / 2
              }}
              className="relative w-full h-full border   flex  justify-center items-center rounded-lg shadow-lg overflow-hidden mb-4">
              <div
                style={{
                  aspectRatio: 3 / 2
                }}
                id="video-container" className={`w-full h-fit  flex flex-row justify-center items-center shadow-xl ${backgrounds[selectedBackground]} backdrop-blur-sm`}>
                {/* Video Item - Centered with proper margin */}
                <div
                  className={`absolute  h-fit rounded-lg border-gray-600 border-2 overflow-hidden bg-black shadow-lg shadow-black transition-all duration-300`}
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
                        autoPlay
                        className=" h-full w-full transition-transform  duration-300"
                        controls={false}
                      />
                    ) : (
                      <div className="flex w-full  items-center justify-center">
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
              onTimeChange={setCurrentTime}
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
              onTimeChange={setCurrentTime}
              backgrounds={backgrounds}
              selectedBackground={selectedBackground}
              setSelectedBackground={setSelectedBackground}
              padding={padding}
              setPadding={setPadding}
            />

          </div>



        </div>
      </main >
    </div >
  );
}
