import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ForgeMode = "both" | "lyrics" | "music";

type ForgeInputs = {
  mode: ForgeMode;
  subgenre: string;
  mood: string;
  theme: string;
  language: string;
  intensity: string;
  structure: string;
  creativeDirection: string;
  selectedStyles?: string[];
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ForgeInputs;

    const {
      mode,
      subgenre,
      mood,
      theme,
      language,
      intensity,
      structure,
      creativeDirection,
      selectedStyles = [],
    } = body;

    const styleText = selectedStyles.length
      ? selectedStyles.join(", ")
      : "none";

    const systemPrompt = `You are an elite metal lyricist and heavy music prompt designer.
Write material that feels original, emotionally charged, cinematic, memorable, and professionally crafted.
Avoid generic filler, lazy repetition, placeholders, and cheap cliches.
Return valid JSON only with this exact shape:
{"title":"string","lyrics":"string","musicPrompt":"string"}
No markdown, no code fences, no commentary outside JSON.`;

    const userPrompt = `Generate a heavy music concept with these inputs:
Mode: ${mode}
Subgenre: ${subgenre}
Mood: ${mood}
Theme: ${theme}
Language: ${language}
Intensity: ${intensity}
Structure: ${structure}
Creative direction: ${creativeDirection || "none"}
Selected style cues: ${styleText}

Requirements:
- Always return title, lyrics, and musicPrompt fields.
- If mode is "lyrics", prioritize lyrics quality.
- If mode is "music", prioritize musicPrompt quality, but still return short useful lyrics.
- If mode is "both", make both outputs strong.
- Lyrics must feel authored, not templated.
- Use vivid imagery, tension, momentum, and a memorable hook.
- Respect the requested language.
- Music prompt must be detailed and production-useful.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Model returned empty output" },
        { status: 500 }
      );
    }

    let parsed: { title: string; lyrics: string; musicPrompt: string };

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Forge request failed" },
      { status: 500 }
    );
  }
}