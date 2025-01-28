import { getPromptFromDatabase } from "@/config/firebase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const docId = "7dXhsC4sGmjOa0pKBydk"; 
    const result = await getPromptFromDatabase(docId)
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}
