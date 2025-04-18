import * as React from "react";
import { Camera, File, Plus, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { ProjectCard } from "@/components/project-card";
import { RecordingModal } from "@/components/recording-modal";

// Sample project data
const recentProjects = [
  {
    id: 1,
    title: "Product Demo Walkthrough",
    duration: "4:32",
    date: "Today",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500"
  },
  {
    id: 2,
    title: "Tutorial: Getting Started",
    duration: "8:15",
    date: "Yesterday",
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=500"
  },
  {
    id: 3,
    title: "Weekly Team Meeting",
    duration: "42:20",
    date: "3 days ago",
    thumbnail: "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&q=80&w=500"
  },
  {
    id: 4,
    title: "Feature Showcase",
    duration: "3:45",
    date: "Last week",
    thumbnail: "https://images.unsplash.com/photo-1595675024853-0f3ec9098ac7?auto=format&fit=crop&q=80&w=500"
  }
];

export default function Index() {
  const [isRecordingModalOpen, setRecordingModalOpen] = React.useState(false);

  const handleStartRecording = () => {
    setRecordingModalOpen(false);
    // In a real app, this would start the recording and navigate to the recording page
    window.location.href = "/recording";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero section */}
          <div className="mb-10 text-center animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">ClickCapture Studio</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Create stunning screen recordings and edit them with ease
            </p>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-scale-in">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setRecordingModalOpen(true)}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-studio-blue/10 flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-studio-blue" />
                </div>
                <h2 className="text-xl font-semibold">Start Recording</h2>
                <p className="text-muted-foreground mt-2">
                  Capture your screen, camera, or both with audio
                </p>
                <Button className="mt-4 bg-studio-blue hover:bg-studio-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Recording
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-studio-purple/10 flex items-center justify-center mb-4">
                  <UploadCloud className="h-6 w-6 text-studio-purple" />
                </div>
                <h2 className="text-xl font-semibold">Import Video</h2>
                <p className="text-muted-foreground mt-2">
                  Import existing videos to enhance and edit
                </p>
                <Button variant="outline" className="mt-4 border-studio-purple text-studio-purple hover:bg-studio-purple/10">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-studio-accent/10 flex items-center justify-center mb-4">
                  <File className="h-6 w-6 text-studio-accent" />
                </div>
                <h2 className="text-xl font-semibold">Create Project</h2>
                <p className="text-muted-foreground mt-2">
                  Start from scratch with a new empty project
                </p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent projects */}
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Recent Projects</h2>
              <Button variant="ghost">
                <a href="/projects">View all projects</a>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  duration={project.duration}
                  date={project.date}
                  thumbnail={project.thumbnail}
                  onClick={() => window.location.href = `/editor/${project.id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <RecordingModal
        isOpen={isRecordingModalOpen}
        onClose={() => setRecordingModalOpen(false)}
        onStartRecording={handleStartRecording}
      />
    </div>
  );
}
