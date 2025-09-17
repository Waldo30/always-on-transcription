import { Badge } from "@/components/ui/badge";
import { MicIcon, MicOffIcon, LoaderIcon } from "lucide-react";

type Status = "idle" | "recording" | "processing";

interface StatusIndicatorProps {
  status: Status;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "recording":
        return {
          label: "Recording",
          icon: <MicIcon className="h-3 w-3" />,
          variant: "destructive" as const,
          className: "animate-pulse bg-destructive text-destructive-foreground",
        };
      case "processing":
        return {
          label: "Processing",
          icon: <LoaderIcon className="h-3 w-3 animate-spin" />,
          variant: "secondary" as const,
          className: "bg-secondary text-secondary-foreground",
        };
      default:
        return {
          label: "Idle",
          icon: <MicOffIcon className="h-3 w-3" />,
          variant: "outline" as const,
          className: "bg-background text-foreground border-border",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1.5 ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
