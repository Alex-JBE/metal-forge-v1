export function buildPrompt({
  genres,
  outputType,
  key,
  tempo,
  intensity,
  instruments,
  language,
  theme,
  instrumental,
}: {
  genres: string[];
  outputType: string;
  key: string;
  tempo: string;
  intensity: string;
  instruments: string[];
  language: string;
  theme: string;
  instrumental: boolean;
}): string {
  const outputMap: Record<string, string> = {
    full: "Full Package: title, full lyrics with structure labels, and a detailed Suno/Udio music prompt at the end labeled MUSIC PROMPT:",
    lyrics: "Full lyrics with structure labels only (Verse, Chorus, Bridge, Solo, Outro)",
    hooks: "Hooks and chorus only — the most powerful, memorable lines",
    production: "Production notes: tuning, drop, tempo, arrangement, sound design, mix direction, reference artists",
    arrangement: "Arrangement guide: song structure, transitions, dynamics, instrumental breakdown",
  };

  const modeStr = instrumental
    ? "Instrumental only — no vocals, no lyrics"
    : "Vocal track with full lyrics";

  return `Generate ${outputMap[outputType] || outputMap.full} for a metal track with these parameters:
- Subgenres: ${genres.join(" + ")}
- Key: ${key}
- Tempo: ${tempo}
- Intensity: ${intensity}
- Instruments: ${instruments.join(", ")}
- Language: ${language}
- Mode: ${modeStr}
- Theme / Creative Direction: ${theme || "Open — choose something powerful, visceral, and dark"}

Format exactly as:
TITLE: [song title]

LYRICS:
[full lyrics with section labels like [Verse 1], [Chorus], [Bridge], [Solo] etc.]

MUSIC PROMPT: [detailed Suno/Udio prompt with genre tags, key, BPM, vocal style, guitar tone, drum pattern, atmosphere — max 220 chars]`;
}