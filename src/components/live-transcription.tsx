"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MicIcon, MoreHorizontalIcon } from "lucide-react";

interface LiveTranscriptionProps {
  onAddToHistory?: (text: string) => void;
}

export function LiveTranscription({ onAddToHistory }: LiveTranscriptionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveText, setLiveText] = useState("");

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
  };

  const handleMicClick = () => {
    if (isRecording) {
      // Recording is stopping - add to history if there's text
      if (liveText.trim() && onAddToHistory) {
        onAddToHistory(liveText);
      }
    }
    setIsRecording(!isRecording);
    if (!isRecording) {
      setLiveText("");
    }
  };

  // Simulate live transcription
  useEffect(() => {
    if (!isRecording) return;

    const sampleText =
      "This is a live transcription simulation. The text appears progressively as if it's being spoken in real time. You can see how the interface handles dynamic content updates during active recording sessions.";

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < sampleText.length) {
        setLiveText(sampleText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Add one character every 50ms

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <Card
      className={`cursor-pointer p-1 transition-all duration-200 bg-white`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="flex items-start">
          {/* Speaking Icon - Left Side, Fixed at Top */}
          <div className="flex items-start justify-center flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 w-10  flex items-center justify-center rounded-full ${
                isRecording
                  ? "bg-transparent hover:bg-slate-100"
                  : "bg-transparent hover:bg-slate-100"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
              onClick={handleMicClick}
            >
              {isRecording ? (
                <MoreHorizontalIcon className="h-4 w-4 text-red-500" />
              ) : (
                <MicIcon className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="w-full">
              <div className="min-h-[2rem] p-2 text-sm leading-relaxed">
                {isRecording ? (
                  <span className="text-slate-800">
                    {liveText}
                    <span className="animate-pulse">|</span>
                  </span>
                ) : liveText ? (
                  <span className="text-slate-800">{liveText}</span>
                ) : (
                  <span className="text-slate-600">
                    {isPinned
                      ? "Transcription is pinned and will appear here..."
                      : "Listening for speech... Click the microphone to start recording."}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
