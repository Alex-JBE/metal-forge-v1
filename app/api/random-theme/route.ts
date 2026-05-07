import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }), { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Generate a random creative brief for a metal song. Return ONLY a JSON object with these fields:
{
  "theme": "2-3 sentence vivid, dark, atmospheric description",
  "genre": "one of: Melodic Death, Black Metal, Doom Metal, Metalcore, Thrash Metal, Sludge Metal, Progressive Metal",
  "key": "one of: E minor, A minor, D minor, B minor, C# minor, F# minor, Drop D, Drop B",
  "tempo": "one of: Drone (20-40), Slow (40-60), Mid (90-120), Fast (160+)",
  "intensity": a number from 1 to 5
}
Return only valid JSON, no markdown, no explanation.`,
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || "";

    try {
      const parsed = JSON.parse(text);
      return new Response(JSON.stringify(parsed), {
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({
        theme: "Ash falls over a ruined city. The last voice screams into silence.",
        genre: "Metalcore",
        key: "E minor",
        tempo: "Fast (160+)",
        intensity: 4,
      }), { headers: { "Content-Type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}