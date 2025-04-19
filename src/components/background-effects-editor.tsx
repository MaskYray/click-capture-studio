
import * as React from "react";
import { ChevronsLeft, ChevronsRight, Scissors, Plus, Minus, MousePointer, ZoomIn } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportPanel } from "./export-panel";

interface BackgroundEffectProp {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  backgrounds: string[];
  setSelectedBackground: (index: number) => void;
  selectedBackground: number;
  setPadding: (padding: number) => void;
  padding: number;
  handleExport: (format: string, quality: string, ratio: string) => void;
  isExporting: boolean;
  exportProgress: number;
}

export function BackgroundEffectEditor({
  handleExport,
  isExporting,
  exportProgress,
  backgrounds,
  setSelectedBackground,
  selectedBackground,
  setPadding,
  padding
}: BackgroundEffectProp) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 w-4/12">
      <Tabs defaultValue="background" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 max-w-xs">
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="background" className="mt-0">
          <div className="flex flex-row flex-wrap justify-start p-2 gap-2">
            {backgrounds.map((bg, index) => (
              <button
                key={index}
                className={`rounded-lg h-[80px] min-w-[80px] cursor-pointer ${bg} ${selectedBackground === index ? 'ring-2 ring-primary' : ''
                  }`}
                onClick={() => setSelectedBackground(index)}
              />
            ))}
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Video Padding</span>
              <span>{padding}px</span>
            </div>
            <Slider
              value={[padding]}
              min={0}
              max={100}
              step={4}
              onValueChange={([value]) => setPadding(value)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="mt-0">
          <div className="mt-4">
            <ExportPanel
              onExport={handleExport}
              isExporting={isExporting}
              progress={exportProgress}
            />
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
