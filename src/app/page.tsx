import { MicIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-300">
          Always-On Transcription
        </h1>
        <p className="text-lg mt-2 text-muted-foreground">
          Your personal speech-to-text assistant.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="p-6 bg-card rounded-full border shadow-sm">
          <MicIcon className="h-12 w-12" />
        </div>
        <p className="text-center max-w-xs text-red-300">
          Press your global hotkey to start transcribing. Click the button below
          to configure your settings.
        </p>
        <Button variant="default">
          <SettingsIcon className="mr-2 h-4" /> Configure Settings
        </Button>
      </div>

      <div className="absolute bottom-6 right-6">
        <Badge variant="outline">Status: Idle</Badge>
      </div>
    </main>
  );
}
