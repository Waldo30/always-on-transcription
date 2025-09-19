"use client";

import { Button } from "@/components/ui/button";
import { MicIcon, MoreHorizontalIcon } from "lucide-react";
import { useRecorder } from "@/hooks/use-recorder";

interface RecordButtonProps {
  onAddToHistory?: (text: string) => void;
}

export function RecordButton({ onAddToHistory }: RecordButtonProps) {
  const { isRecording, isProcessing, start, stop } = useRecorder((text) => {
    onAddToHistory?.(text);
  });

  const handleClick = () => {
    if (isProcessing) return;
    if (isRecording) stop();
    else start();
  };

  return (
    <div className="w-full flex items-center justify-center py-6">
      <Button
        variant="ghost"
        size="lg"
        className="rounded-full h-24 w-24 md:h-28 md:w-28 flex items-center justify-center shadow-sm bg-white hover:bg-slate-100"
        onClick={handleClick}
        disabled={isProcessing}
      >
        {isRecording ? (
          <MoreHorizontalIcon className="size-12 animate-pulse" />
        ) : isProcessing ? (
          <div className="animate-spin rounded-full size-12 border-2 border-slate-500 border-t-transparent" />
        ) : (
          <MicIcon className="size-12 text-primary" />
        )}
      </Button>
    </div>
  );
}
