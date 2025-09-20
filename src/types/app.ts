export type Status = "idle" | "recording" | "processing";

export type TranscriptionType = "audio"; // extend later if needed

export interface Transcription {
  id: string;
  text: string;
  timestamp: Date;
  isPinned: boolean;
  type: TranscriptionType;
}


