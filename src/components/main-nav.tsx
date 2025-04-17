
import * as React from "react";
import { Link } from "react-router-dom";
import { Palette, Settings, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-6 md:gap-10 px-6 py-4",
        className
      )}
      {...props}
    >
      <Link to="/" className="flex items-center gap-2">
        <Video className="h-6 w-6 text-studio-accent" />
        <span className="font-bold text-xl">ClickCapture Studio</span>
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Appearance</span>
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
