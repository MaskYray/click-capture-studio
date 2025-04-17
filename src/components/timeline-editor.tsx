
import * as React from "react";
import { ChevronsLeft, ChevronsRight, Scissors, Plus, Minus, MousePointer, ZoomIn } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineEditorProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
}

export function TimelineEditor({
  duration,
  currentTime,
  onTimeChange,
}: TimelineEditorProps) {
  // Sample zoom points for demonstration
  const zoomPoints = [
    { id: 1, time: 4.5 },
    { id: 2, time: 12.2 },
    { id: 3, time: 25.7 },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <span className="font-mono text-sm">{formatTime(currentTime)}</span>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <Scissors className="h-4 w-4 mr-1" />
            Split
          </Button>
          <Button variant="ghost" size="sm">
            <ZoomIn className="h-4 w-4 mr-1" />
            Add Zoom
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 max-w-xs">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium w-24">Screen</span>
              <div className="timeline-track flex-1">
                <div className="timeline-clip" style={{ left: "0%", width: "100%" }}>
                  <div className="px-2 h-full flex items-center text-xs">Main Screen</div>
                </div>
                {zoomPoints.map((point) => (
                  <div 
                    key={point.id}
                    className="zoom-marker"
                    style={{ left: `${(point.time / duration) * 100}%` }}
                  >
                    <span className="sr-only">Zoom point at {formatTime(point.time)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium w-24">Camera</span>
              <div className="timeline-track flex-1">
                <div className="timeline-clip" style={{ left: "10%", width: "80%" }}>
                  <div className="px-2 h-full flex items-center text-xs">Webcam</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium w-24">Audio</span>
              <div className="timeline-track flex-1">
                <div className="timeline-clip" style={{ left: "0%", width: "100%" }}>
                  <div className="px-2 h-full flex items-center text-xs">System Audio</div>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.01}
                onValueChange={([value]) => onTimeChange(value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>00:00</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="background" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-video bg-gray-900 rounded-md cursor-pointer hover:ring-2 hover:ring-primary">
              <div className="h-full w-full flex items-center justify-center text-xs text-white">None</div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-studio-blue to-studio-purple rounded-md cursor-pointer hover:ring-2 hover:ring-primary"></div>
            <div className="aspect-video bg-gradient-to-br from-studio-blue-light to-studio-accent rounded-md cursor-pointer hover:ring-2 hover:ring-primary"></div>
            <div className="aspect-video bg-gradient-to-br from-studio-purple-light to-studio-purple rounded-md cursor-pointer hover:ring-2 hover:ring-primary"></div>
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md cursor-pointer hover:ring-2 hover:ring-primary flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="effects" className="mt-0">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium">Zoom on Click</h3>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="flex-1">Off</Button>
                <Button variant="outline" size="sm" className="flex-1">Low</Button>
                <Button variant="outline" size="sm" className="flex-1">Medium</Button>
                <Button variant="outline" size="sm" className="flex-1">High</Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium">Cursor Effects</h3>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <MousePointer className="h-4 w-4 mr-2" />
                  Normal
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <div className="relative">
                    <MousePointer className="h-4 w-4 mr-2" />
                    <div className="absolute inset-0 animate-pulse opacity-70"></div>
                  </div>
                  Highlight
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
