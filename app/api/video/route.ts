import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, genre, mood, theme, composition, duration, clipLength, sceneCount, segmentationMode } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }), { status: 500 });
    }

    const segInfo = segmentationMode === "split_by_duration"
      ? `Split into ${clipLength}-second clips for a ${duration} track`
      : segmentationMode === "split_by_scene_count"
      ? `Create exactly ${sceneCount} scenes`
      : "Create a full-length continuous video script";

    const prompt = `You are an expert metal music video director. Create a cinematic video script for this metal track.

Track info:
- Title: ${title || "Untitled"}
- Genre: ${genre}
- Mood: ${mood}
- Theme: ${theme || "Dark and powerful"}
- Duration: ${duration || "3:30"}
- Segmentation: ${segInfo}

First provide:
CHARACTER_BIBLE:
[2-3 sentences describing the main characters/entities in the video]

WORLD_BIBLE:
[2-3 sentences describing the visual world and aesthetic]

STORY_ARC:
[2-3 sentences describing the narrative arc]

Then generate the clip prompts:
CLIP_1:
[detailed cinematic prompt for this clip — camera angle, lighting, action, atmosphere]

CLIP_2:
[detailed cinematic prompt]

Continue for all clips. Make each clip dark, cinematic, and perfectly matching the metal aesthetic.

Composition for reference:
${composition?.slice(0, 800) || ""}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to generate video script" }), { status: 500 });
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