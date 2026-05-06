import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: "Generate a random, vivid 1-2 sentence creative direction for a metal song. Make it dark, visceral, and powerful. Return only the text, no labels, no quotes.",
        }],
      }),
    });

    const data = await response.json();
    const theme = data.content?.map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").join("") || "";

    return NextResponse.json({ theme: theme.trim() });
  } catch (err) {
    return NextResponse.json({ theme: "Ash falls over a ruined city. The last voice screams into silence." });
  }
}