
import { ChevronLeft, Download, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorHeaderProps {
  projectTitle: string;
  onExportClick: () => void;
}

export function EditorHeader({ projectTitle, onExportClick }: EditorHeaderProps) {
  return (
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
          onClick={onExportClick}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
