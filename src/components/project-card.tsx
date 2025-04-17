
import * as React from "react";
import { Clock, MoreVertical, Video } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  duration: string;
  date: string;
  thumbnail?: string;
  className?: string;
  onClick?: () => void;
}

export function ProjectCard({
  title,
  duration,
  date,
  thumbnail,
  className,
  onClick,
}: ProjectCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md", 
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <Video className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg truncate">{title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{date}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
