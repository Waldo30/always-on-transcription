"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { SettingsPanel } from "@/components/settings-panel";
import { TranscriptionList } from "@/components/transcription-list";
import { RecordButton } from "@/components/record-button";

// Mock data for demonstration
const mockTranscriptions = [
  {
    id: "1",
    text: "This is a sample transcription that demonstrates how the clipboard history will look. It shows a longer text that gets truncated with ellipsis.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isPinned: false,
    type: "audio" as const,
  },
  {
    id: "2",
    text: "Short transcription",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isPinned: true,
    type: "audio" as const,
  },
  {
    id: "3",
    text: "Another example of transcribed text that shows how the interface handles different lengths of content and various timestamps.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isPinned: false,
    type: "audio" as const,
  },
];

export default function Home() {
  const [status] = useState<"idle" | "recording" | "processing">("idle");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastTranscription] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [transcriptions, setTranscriptions] = useState(mockTranscriptions);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
