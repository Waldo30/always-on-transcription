import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
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

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    const audioFileForOpenAI = new File([audioBuffer], "audio.webm", {
      type: audioFile.type,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: "whisper-1",
      language: "en",
      response_format: "text",
    });

    return NextResponse.json({
      text: transcription,
      success: true,
    });
  } catch (error) {
    console.error("Transcription error:", error);
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
