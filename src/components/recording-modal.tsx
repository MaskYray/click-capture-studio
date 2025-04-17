
import * as React from "react";
import { Camera, Mic, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl">Start Recording</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <Tabs defaultValue="screen" className="w-full">
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
