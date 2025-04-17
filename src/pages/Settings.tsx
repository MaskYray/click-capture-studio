
import * as React from "react";
import { MainNav } from "@/components/main-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="recording">Recording</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Appearance</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Switch between dark and light mode</span>
                      <ThemeToggle />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="export-notifications">Export Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when exports are complete
                      </p>
                    </div>
                    <Switch id="export-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="update-notifications">Update Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify me about new features and updates
                      </p>
                    </div>
                    <Switch id="update-notifications" defaultChecked />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recording" className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recording Settings</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>Default Camera</Label>
                    <Select defaultValue="default">
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Camera</SelectItem>
                        <SelectItem value="webcam">External Webcam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Microphone</Label>
                    <Select defaultValue="default">
                      <SelectTrigger>
                        <SelectValue placeholder="Select microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Microphone</SelectItem>
                        <SelectItem value="headset">Headset Microphone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-audio">Record System Audio</Label>
                    <Switch id="system-audio" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mic-audio">Record Microphone</Label>
                    <Switch id="mic-audio" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="countdown">Show Countdown</Label>
                    <Switch id="countdown" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Video Quality</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Frame Rate</Label>
                      <span className="text-sm font-medium">60 FPS</span>
                    </div>
                    <Slider defaultValue={[60]} max={60} step={30} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>30 FPS</span>
                      <span>60 FPS</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select defaultValue="1080p">
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        <SelectItem value="2160p">2160p (4K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="editor" className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Editor Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save">Auto-save Projects</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save projects while editing
                      </p>
                    </div>
                    <Switch id="auto-save" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-click">Auto-detect Click Effects</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect mouse clicks for zoom effects
                      </p>
                    </div>
                    <Switch id="show-click" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Default Zoom Settings</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Zoom Intensity</Label>
                    <span className="text-sm font-medium">Medium</span>
                  </div>
                  <Slider defaultValue={[50]} max={100} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <Label>Zoom Duration</Label>
                    <span className="text-sm font-medium">0.5s</span>
                  </div>
                  <Slider defaultValue={[50]} max={100} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.2s</span>
                    <span>0.5s</span>
                    <span>1.0s</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Default Export Settings</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>Default Format</Label>
                    <Select defaultValue="mp4">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Quality</Label>
                    <Select defaultValue="1080p">
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        <SelectItem value="2160p">2160p (4K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Aspect Ratio</Label>
                    <Select defaultValue="16:9">
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frame Rate</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frame rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <Label htmlFor="hardware-acceleration">Use Hardware Acceleration</Label>
                    <p className="text-sm text-muted-foreground">
                      Use GPU for faster exports (recommended)
                    </p>
                  </div>
                  <Switch id="hardware-acceleration" defaultChecked />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-8 space-x-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button className="bg-studio-blue hover:bg-studio-blue/90">Save Changes</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
