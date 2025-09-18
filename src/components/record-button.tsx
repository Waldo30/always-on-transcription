"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MicIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PodcastIcon,
} from "lucide-react";

interface RecordButtonProps {
  onAddToHistory?: (text: string) => void;
}

export function RecordButton({ onAddToHistory }: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await transcribeAudio(audioBlob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const text: string | undefined = result?.text;
      if (text && text.trim()) {
        onAddToHistory?.(text);
      }
    } catch (err) {
      console.error("Transcription error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
