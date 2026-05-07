import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, genre, mood, theme, composition } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }), { status: 500 });
    }

    const prompt = `You are an expert art director specializing in metal album artwork. Generate detailed image generation prompts for this metal track.

Track info:
- Title: ${title || "Untitled"}
- Genre: ${genre}
- Mood: ${mood}
- Theme: ${theme || "Dark and powerful"}
- Composition excerpt: ${composition?.slice(0, 500) || ""}

Generate three distinct image prompts for different formats. Each should be cinematic, dark, and perfectly capture the metal aesthetic.

Format exactly as:
CD_COVER:
[detailed prompt for square album cover art, 1:1 ratio, dark metal aesthetic]

YOUTUBE:
[detailed prompt for YouTube thumbnail, 16:9 ratio, dramatic and eye-catching]

TIKTOK:
[detailed prompt for TikTok/Reels vertical video cover, 9:16 ratio, bold and striking]`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to generate cover prompts" }), { status: 500 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const text = json.delta?.text || "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch { /* skip */ }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}