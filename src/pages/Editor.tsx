import * as React from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Download, Play, Save, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { TimelineEditor } from "@/components/timeline-editor";
import { ExportPanel } from "@/components/export-panel";
import { screenRecordingService } from "@/services/screen-recording";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [showExportPanel, setShowExportPanel] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const recordedBlob = screenRecordingService.getCurrentRecording();
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, []);

  // Mock project title
  const projectTitle = id === "new" ? "Untitled Project" : "Project Demo";
  
  // Mock video duration (in seconds)
  const videoDuration = 45;

  const handleExport = async (format: string, quality: string, ratio: string) => {
    const recordedBlob = screenRecordingService.getCurrentRecording();
    if (recordedBlob) {
      await screenRecordingService.saveRecording(recordedBlob);
    }
    setShowExportPanel(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      
      <main className="flex-1 px-6 py-4 flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {/* Editor header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button variant="ghost" className="mr-2" asChild>
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
          
          {/* Video preview */}
          <div className="relative aspect-video rounded-lg shadow-lg overflow-hidden mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-studio-blue/20 to-studio-purple/20 backdrop-blur-sm" />
            <div className="absolute inset-4 rounded-lg overflow-hidden bg-black/5 shadow-xl">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  className="w-full h-full object-contain rounded-lg"
                  controls
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Play className="h-16 w-16 text-white/50" />
                </div>
              )}
            </div>
          </div>
          
          {/* Timeline editor */}
          <TimelineEditor
            duration={videoDuration}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
          />
          
          {/* Export panel */}
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
