import { updatePromptInDatabase } from "@/config/firebase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt1, prompt2 } = await req.json();

    if (!prompt1 || !prompt2) {
      return NextResponse.json(
        { error: "Both prompts are required" },
        { status: 400 }
      );
    }

    const result = await updatePromptInDatabase("7dXhsC4sGmjOa0pKBydk",prompt1, prompt2);

    return NextResponse.json({ message: "Prompts saved successfully", result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save prompts" },
      { status: 500 }
    );
  }
}
