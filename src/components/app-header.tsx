"use client";

import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/status-indicator";

interface AppHeaderProps {
  status: "idle" | "recording" | "processing";
  onSettingsClick: () => void;
}

export function AppHeader({ status, onSettingsClick }: AppHeaderProps) {
  return (
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold text-sm">Always-On Transcription</h1>
            <p className="text-xs text-muted-foreground">
              Press hotkey to start
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
