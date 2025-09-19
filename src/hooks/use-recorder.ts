"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ElectronAPI = {
  send?: (channel: string, data?: unknown) => void;
  receive?: (channel: string, func: (...args: unknown[]) => void) => void;
};

export function useRecorder(onTranscription?: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

  const start = useCallback(async () => {
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
      isRecordingRef.current = true;
      const api = (globalThis as { electronAPI?: ElectronAPI }).electronAPI;
      if (api?.send) api.send("start-transcription");
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  }, []);

  const stop = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(true);
      isProcessingRef.current = true;
      const api = (globalThis as { electronAPI?: ElectronAPI }).electronAPI;
      if (api?.send) api.send("stop-transcription");
    }
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const api = (globalThis as { electronAPI?: ElectronAPI }).electronAPI;
      if (api?.send) api.send("processing-started");
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
        onTranscription?.(text);
      }
    } catch (err) {
      console.error("Transcription error:", err);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [onTranscription]);

  useEffect(() => {
    const api = (globalThis as { electronAPI?: ElectronAPI }).electronAPI;
    if (api?.receive) {
      api.receive("toggle-recording", () => {
        if (isProcessingRef.current) return;
        if (isRecordingRef.current) {
          stop();
        } else {
          start();
        }
      });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [start, stop]);

  return { isRecording, isProcessing, start, stop } as const;
}


