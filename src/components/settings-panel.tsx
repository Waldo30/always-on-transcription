"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyboardIcon, Volume2Icon } from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [startHotkey, setStartHotkey] = useState("Ctrl+Shift+R");
  const [stopHotkey, setStopHotkey] = useState("Ctrl+Shift+S");
  const [isRecordingHotkey, setIsRecordingHotkey] = useState(false);

  const handleHotkeyChange = (type: "start" | "stop") => {
    setIsRecordingHotkey(true);
    setTimeout(() => {
      setIsRecordingHotkey(false);
      if (type === "start") {
        setStartHotkey("Ctrl+Shift+R");
      } else {
        setStopHotkey("Ctrl+Shift+S");
      }
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your transcription preferences and hotkeys.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <KeyboardIcon className="h-4 w-4" />
              <h3 className="font-medium text-lg">Hotkeys</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Start Recording</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHotkeyChange("start")}
                  disabled={isRecordingHotkey}
                >
                  {isRecordingHotkey ? "Press keys..." : startHotkey}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stop Recording</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHotkeyChange("stop")}
                  disabled={isRecordingHotkey}
                >
                  {isRecordingHotkey ? "Press keys..." : stopHotkey}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2Icon className="h-4 w-4" />
              <h3 className="font-medium text-lg">Audio</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Input Device</span>
                <Button variant="outline" size="sm">
                  Default Microphone
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Model</span>
                <Button variant="outline" size="sm">
                  Whisper Base
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={onClose} size="sm">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
