"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TranscriptionItem } from "@/components/transcription-item";
import { MicIcon } from "lucide-react";

interface TranscriptionItemData {
  id: string;
  text: string;
  timestamp: Date;
  isPinned: boolean;
  type: "text" | "audio";
}

interface TranscriptionListProps {
  items: TranscriptionItemData[];
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function TranscriptionList({
  items,
  onPin,
  onUnpin,
  onDelete,
  onClearAll,
}: TranscriptionListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MicIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No transcriptions yet</p>
        <p className="text-xs">Start recording to see your history here</p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return b.timestamp.getTime() - a.timestamp.getTime();
    }
    return a.isPinned ? -1 : 1;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="text-sm font-semibold">Transcription History</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-3 w-full">
          {sortedItems.map((item) => (
            <TranscriptionItem
              key={item.id}
              id={item.id}
              text={item.text}
              timestamp={item.timestamp}
              isPinned={item.isPinned}
              type={item.type}
              onPin={onPin}
              onUnpin={onUnpin}
              onDelete={onDelete}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
