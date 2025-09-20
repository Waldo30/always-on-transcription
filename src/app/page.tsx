"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { SettingsPanel } from "@/components/settings-panel";
import { TranscriptionList } from "@/components/transcription-list";
import { RecordButton } from "@/components/record-button";
import type { Status, Transcription } from "@/types/app";

export default function Home() {
  const [status] = useState<Status>("idle");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

  const handleCopy = async (text: string) => {
    type ElectronAPI = { send?: (channel: string, data?: unknown) => void };
    const api = (globalThis as { electronAPI?: ElectronAPI }).electronAPI;
    try {
      if (api && typeof api.send === "function") {
        api.send("copy-to-clipboard", text);
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  const handlePin = (id: string) => {
    setTranscriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: true } : item))
    );
  };

  const handleUnpin = (id: string) => {
    setTranscriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: false } : item))
    );
  };

  const handleDelete = (id: string) => {
    setTranscriptions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setTranscriptions([]);
  };

  return (
    <main className="min-h-screen bg-gray-200 flex flex-col">
      <AppHeader
        status={status}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <div className="p-2 flex-1 flex flex-col">
        <RecordButton
          onAddToHistory={(text) => {
            const newTranscription = {
              id: Date.now().toString(),
              text: text,
              timestamp: new Date(),
              isPinned: false,
              type: "audio" as const,
            };
            setTranscriptions((prev) => [newTranscription, ...prev]);
            handleCopy(text);
          }}
        />

        <div className="mb-2" />
        <div className="flex-1 min-h-0">
          <TranscriptionList
            items={transcriptions}
            onPin={handlePin}
            onUnpin={handleUnpin}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
          />
        </div>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
