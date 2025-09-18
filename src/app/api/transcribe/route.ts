import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for OpenAI API
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Create a File-like object that OpenAI expects
    const audioFileForOpenAI = new File([audioBuffer], "audio.webm", {
      type: audioFile.type,
    });

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: "whisper-1",
      language: "en", // You can make this configurable later
      response_format: "text",
    });

    return NextResponse.json({
      text: transcription,
      success: true,
    });
  } catch (error) {
    console.error("Transcription error:", error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid API key")) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key" },
          { status: 401 }
        );
      }

      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "OpenAI API quota exceeded" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 }
    );
  }
}
