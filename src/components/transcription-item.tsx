"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PinIcon, MoreHorizontalIcon, ClockIcon } from "lucide-react";

interface TranscriptionItemProps {
  id: string;
  text: string;
  timestamp: Date;
  isPinned: boolean;
  type: "text" | "audio";
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TranscriptionItem({
  id,
  text,
  timestamp,
  isPinned,
  onPin,
  onUnpin,
}: TranscriptionItemProps) {
  const [copied, setCopied] = React.useState(false);
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

  const handleCopy = async () => {
    try {
      const api: any = (globalThis as any).electronAPI;
      if (api && typeof api.send === "function") {
        api.send("copy-to-clipboard", text);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  return (
    <Card
      className={`cursor-pointer p-2 transition-all duration-200 bg-white hover:bg-slate-300 ${
        isPinned ? "bg-slate-300/50" : ""
      }`}
      onClick={handleCopy}
    >
      <CardContent className="p-0">
        <div className="flex gap-1">
          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <p className="text-xs leading-normal tracking-wide line-clamp-4">
              {text}
            </p>
            <div className="relative flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <ClockIcon className="h-2.5 w-2.5" />
              {formatTime(timestamp)}
              {copied ? (
                <div className="absolute left-1/2 -translate-x-1/2">
                  <Badge className="text-[10px] py-0 px-1.5">Copied</Badge>
                </div>
              ) : null}
            </div>
          </div>

          {/* Action Buttons - Right Side, Vertically Stacked */}
          <div className="flex flex-col justify-between gap-1">
            {/* Hamburger Menu - Top */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 hover:bg-slate-400/30"
              title="More options"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontalIcon className="h-2 w-2" />
            </Button>

            {/* Pin Button - Bottom */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 hover:bg-slate-400/30"
              onClick={(e) => {
                e.stopPropagation();
                if (isPinned) {
                  onUnpin(id);
                } else {
                  onPin(id);
                }
              }}
              title={isPinned ? "Unpin" : "Pin"}
            >
              <PinIcon
                className={`h-2 w-2 ${
                  isPinned
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
