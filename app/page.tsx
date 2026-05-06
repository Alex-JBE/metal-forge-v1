"use client";

import { useState } from "react";

const SUBGENRES = [
  "Death Metal", "Black Metal", "Thrash Metal", "Doom Metal",
  "Power Metal", "Heavy Metal", "Groove Metal", "Sludge Metal",
  "Industrial Metal / Metalcore / Djent", "Progressive Metal",
  "Nu-Metal", "Speed Metal", "Folk Metal", "Symphonic Metal",
];

const MOODS = [
  "Brooding, violent, triumphant", "Dark and oppressive",
  "Furious and relentless", "Melancholic and haunting",
  "Epic and grandiose", "Cold and nihilistic",
  "Chaotic and frenzied", "Slow and crushing",
];

const THEMES = [
  "Ash, betrayal, machine ruin", "War and destruction",
  "Ancient mythology", "Inner demons and madness",
  "Post-apocalyptic wasteland", "Occult and forbidden knowledge",
  "Nature's wrath", "Death and rebirth",
];

const LANGUAGES = ["English", "Russian", "German", "Norwegian", "Finnish", "Swedish"];
const INTENSITIES = ["Low", "Medium", "High", "Extreme"];

const STRUCTURES = [
  "Verse / Chorus / Verse / Bridge",
  "Intro / Verse / Chorus / Solo / Outro",
  "Verse / Verse / Chorus / Bridge / Chorus",
  "Through-composed",
  "Drone / Build / Explosion",
];

const STYLE_TAGS = [
  "INDUSTRIAL METAL", "METALCORE", "CINEMATIC", "DJENT", "DEATH METAL",
  "SLUDGE", "PROGRESSIVE", "BLACK METAL", "DOOM", "THRASH",
];

const INSPIRE_PROMPTS = [
  "Write with strong physical imagery, a huge chorus, and modern heavy production energy.",
  "Dark atmosphere with blast beats, tremolo riffs, and raw screaming vocals.",
  "Epic orchestral intro building into crushing downtuned riffs and cathartic chorus.",
  "Slow, oppressive groove with feedback walls and whispered vocals turning to roars.",
  "Relentless thrash attack — 200bpm verses, gang shout chorus, shredding bridge.",
];

async function callForge(prompt: string): Promise<string> {
  const res = await fetch("/api/forge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result || "";
}

export default function MetalForgePage() {
  const [outputMode, setOutputMode] = useState<"both" | "lyrics" | "music">("both");
  const [subgenre, setSubgenre] = useState(SUBGENRES[8]);
  const [mood, setMood] = useState(MOODS[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [language, setLanguage] = useState("English");
  const [intensity, setIntensity] = useState("High");
  const [structure, setStructure] = useState(STRUCTURES[0]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["INDUSTRIAL METAL", "METALCORE", "CINEMATIC"]);
  const [creativeDirection, setCreativeDirection] = useState(INSPIRE_PROMPTS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [musicPrompt, setMusicPrompt] = useState("");
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInspire = () => {
    const random = INSPIRE_PROMPTS[Math.floor(Math.random() * INSPIRE_PROMPTS.length)];
    setCreativeDirection(random);
  };

  const handleClear = () => {
    setTitle("");
    setLyrics("");
    setMusicPrompt("");
    setCreativeDirection("");
  };

  const buildPrompt = () => {
    const parts: string[] = [];
    if (outputMode === "both" || outputMode === "lyrics") {
      parts.push(`Generate metal song lyrics with the following parameters:
- Subgenre: ${subgenre}
- Mood: ${mood}
- Theme: ${theme}
- Language: ${language}
- Intensity: ${intensity}
- Structure: ${structure}
- Styles: ${selectedStyles.join(", ")}
- Creative Direction: ${creativeDirection}

Format your response as:
TITLE: [song title]

LYRICS:
[full lyrics with section labels like [Verse 1], [Chorus], etc.]`);
    }
    if (outputMode === "both" || outputMode === "music") {
      parts.push(`\n\nAlso generate a Suno/Udio music generation prompt (max 200 chars) for: ${subgenre}, ${mood} mood, ${intensity} intensity, styles: ${selectedStyles.join(", ")}.
Format: MUSIC PROMPT: [prompt]`);
    }
    return parts.join("");
  };

  const handleForge = async () => {
    setIsLoading(true);
    setTitle(""); setLyrics(""); setMusicPrompt("");
    try {
      const text = await callForge(buildPrompt());
      const titleMatch = text.match(/TITLE:\s*(.+)/);
      if (titleMatch) setTitle(titleMatch[1].trim());
      const lyricsMatch = text.match(/LYRICS:\s*([\s\S]*?)(?=MUSIC PROMPT:|$)/);
      if (lyricsMatch) setLyrics(lyricsMatch[1].trim());
      const musicMatch = text.match(/MUSIC PROMPT:\s*(.+)/);
      if (musicMatch) setMusicPrompt(musicMatch[1].trim());
      if (!titleMatch && !lyricsMatch) setLyrics(text.trim());
    } catch {
      setLyrics("Generation error. Check ANTHROPIC_API_KEY in Vercel environment variables.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!lyrics) return;
    setIsLoading(true);
    try {
      const text = await callForge(
        `Refine these metal lyrics to be more powerful, visceral, and poetic. Keep the structure. Make imagery more intense, chorus more anthemic:\n\n${lyrics}\n\nReturn only the refined lyrics.`
      );
      setLyrics(text.trim());
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const handleRegeneratePrompt = async () => {
    setIsLoading(true);
    try {
      const text = await callForge(
        `Generate a Suno/Udio music prompt (max 200 chars) for: ${subgenre}, ${mood} mood, ${intensity} intensity, styles: ${selectedStyles.join(", ")}. Return only the prompt text.`
      );
      setMusicPrompt(text.trim());
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const handleSaveFull = () => {
    const content = [
      title ? `TITLE: ${title}` : "",
      lyrics ? `\nLYRICS:\n${lyrics}` : "",
      musicPrompt ? `\nMUSIC PROMPT:\n${musicPrompt}` : "",
    ].filter(Boolean).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "metal-forge"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Courier New', monospace" }}>

      {/* NAVBAR */}
      <nav style={{ borderBottom: "1px solid #2a0a0a", background: "#0d0d0d", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #991b1b, #450a0a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fca5a5" }}>
            MF
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.15em", color: "#fff" }}>METAL FORGE V1</div>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#7f1d1d" }}>HEAVY LYRICS & MUSIC PROMPTS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["FORGE STUDIO", "GITHUB"].map(btn => (
            <button key={btn} style={{ padding: "6px 16px", fontSize: 11, letterSpacing: "0.12em", border: "1px solid #3a1010", background: "transparent", color: "#fca5a5", borderRadius: 6, cursor: "pointer" }}>
              {btn}
            </button>
          ))}
        </div>
      </nav>

      {/* 4 COLUMNS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, padding: 16, maxWidth: 1600, margin: "0 auto" }}>

        {/* COL 1 — CONTROL DECK */}
        <div style={{ background: "#111", border: "1px solid #2a1010", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#7f1d1d" }}>CONTROL DECK</div>

          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.25, color: "#fff" }}>
              Создайте свой<br />следующий<br />
              <span style={{ color: "#dc2626" }}>металлический</span><br />шедевр
            </h1>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 12, lineHeight: 1.6 }}>
              Настройте субжанр, настроение, структуру и режим вывода. Генерируйте тексты, музыкальные промпты или и то, и другое.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["MODE: LYRICS + MUSIC PROMPT", "READY FOR LIVE GENERATION"].map(tag => (
              <span key={tag} style={{ padding: "3px 8px", fontSize: 9, letterSpacing: "0.1em", border: "1px solid #3a1010", color: "#991b1b", borderRadius: 4 }}>{tag}</span>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b7280", marginBottom: 8 }}>OUTPUT MODE</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["both", "lyrics", "music"] as const).map(mode => (
                <button key={mode} onClick={() => setOutputMode(mode)} style={{
                  padding: "6px 12px", fontSize: 10, letterSpacing: "0.12em", fontWeight: 700, borderRadius: 6, cursor: "pointer", border: "1px solid",
                  background: outputMode === mode ? "#991b1b" : "transparent",
                  borderColor: outputMode === mode ? "#dc2626" : "#3a1010",
                  color: outputMode === mode ? "#fff" : "#6b7280",
                }}>
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
            <button onClick={handleInspire} style={{ flex: 1, padding: "8px", fontSize: 10, letterSpacing: "0.12em", border: "1px solid #3a1010", background: "transparent", color: "#9ca3af", borderRadius: 6, cursor: "pointer" }}>
              INSPIRE ME
            </button>
            <button onClick={handleClear} style={{ flex: 1, padding: "8px", fontSize: 10, letterSpacing: "0.12em", border: "1px solid #3a1010", background: "transparent", color: "#9ca3af", borderRadius: 6, cursor: "pointer" }}>
              CLEAR
            </button>
          </div>
        </div>

        {/* COL 2 — PARAMETERS */}
        <div style={{ background: "#111", border: "1px solid #2a1010", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#7f1d1d" }}>PARAMETERS</div>

          {[
            { label: "SUBGENRE", value: subgenre, setter: setSubgenre, options: SUBGENRES },
            { label: "MOOD", value: mood, setter: setMood, options: MOODS },
            { label: "THEME", value: theme, setter: setTheme, options: THEMES },
            { label: "LANGUAGE", value: language, setter: setLanguage, options: LANGUAGES },
            { label: "INTENSITY", value: intensity, setter: setIntensity, options: INTENSITIES },
            { label: "STRUCTURE", value: structure, setter: setStructure, options: STRUCTURES },
          ].map(({ label, value, setter, options }) => (
            <div key={label}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b7280", marginBottom: 6 }}>{label}</div>
              <select value={value} onChange={e => setter(e.target.value)}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* COL 3 — STYLE & DIRECTION */}
        <div style={{ background: "#111", border: "1px solid #2a1010", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#7f1d1d" }}>STYLE & DIRECTION</div>

          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b7280", marginBottom: 8 }}>STYLE PALETTE</div>
            <button onClick={() => setShowStylePicker(!showStylePicker)} style={{ width: "100%", padding: "8px", fontSize: 11, letterSpacing: "0.12em", border: "1px solid #3a1010", background: "transparent", color: "#9ca3af", borderRadius: 6, cursor: "pointer" }}>
              BROWSE STYLES ({selectedStyles.length})
            </button>

            {showStylePicker && (
              <div style={{ marginTop: 8, padding: 12, background: "#0d0d0d", border: "1px solid #2a1010", borderRadius: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {STYLE_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleStyle(tag)} style={{
                    padding: "6px 8px", fontSize: 9, letterSpacing: "0.1em", borderRadius: 4, cursor: "pointer", border: "1px solid",
                    background: selectedStyles.includes(tag) ? "#450a0a" : "transparent",
                    borderColor: selectedStyles.includes(tag) ? "#991b1b" : "#3a1010",
                    color: selectedStyles.includes(tag) ? "#fca5a5" : "#6b7280",
                  }}>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {selectedStyles.map(tag => (
                <span key={tag} onClick={() => toggleStyle(tag)} style={{ padding: "3px 8px", fontSize: 9, letterSpacing: "0.1em", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: 4, cursor: "pointer" }}>
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b7280", marginBottom: 8 }}>CREATIVE DIRECTION</div>
            <textarea value={creativeDirection} onChange={e => setCreativeDirection(e.target.value)} rows={7}
              placeholder="Describe the sound, energy, and feel you want..." />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleForge} disabled={isLoading} style={{
              width: "100%", padding: "12px", fontSize: 12, letterSpacing: "0.15em", fontWeight: 900, border: "none",
              background: isLoading ? "#450a0a" : "#991b1b", color: isLoading ? "#7f1d1d" : "#fff", borderRadius: 6, cursor: isLoading ? "not-allowed" : "pointer",
            }}>
              {isLoading ? "FORGING..." : "FORGE OUTPUT"}
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={handleRefine} disabled={isLoading || !lyrics} style={{ padding: "8px", fontSize: 10, letterSpacing: "0.12em", border: "1px solid #3a1010", background: "transparent", color: "#9ca3af", borderRadius: 6, cursor: "pointer" }}>
                REFINE LYRICS
              </button>
              <button onClick={handleRegeneratePrompt} disabled={isLoading} style={{ padding: "8px", fontSize: 10, letterSpacing: "0.12em", border: "1px solid #3a1010", background: "transparent", color: "#9ca3af", borderRadius: 6, cursor: "pointer" }}>
                REGEN PROMPT
              </button>
            </div>
          </div>
        </div>

        {/* COL 4 — OUTPUT */}
        <div style={{ background: "#111", border: "1px solid #2a1010", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#7f1d1d" }}>OUTPUT</div>

          {/* Title */}
          <div style={{ background: "#0d0d0d", border: "1px solid #2a1010", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b7280" }}>TITLE</span>
              <button onClick={() => handleCopy(title, "title")} disabled={!title} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: copiedField === "title" ? "#dc2626" : "#6b7280", cursor: "pointer" }}>
                {copiedField === "title" ? "COPIED!" : "COPY"}
              </button>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", minHeight: 20 }}>
              {isLoading && !title
                ? <span style={{ color: "#7f1d1d" }}>GENERATING...</span>
                : title || <span style={{ color: "#374151", fontSize: 11 }}>Title will appear here</span>}
            </div>
          </div>

          {/* Lyrics */}
          <div style={{ background: "#0d0d0d", border: "1px solid #2a1010", borderRadius: 8, padding: 12, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b7280" }}>LYRICS</span>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => handleCopy(lyrics, "lyrics")} disabled={!lyrics} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: copiedField === "lyrics" ? "#dc2626" : "#6b7280", cursor: "pointer" }}>
                  {copiedField === "lyrics" ? "COPIED!" : "COPY LYRICS"}
                </button>
                <button onClick={handleSaveFull} disabled={!lyrics && !title} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}>
                  SAVE FULL
                </button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 320, overflowY: "auto", minHeight: 100 }}>
              {isLoading && !lyrics
                ? <span style={{ color: "#7f1d1d" }}>Forging lyrics...</span>
                : lyrics || <span style={{ color: "#374151" }}>Lyrics will appear here after generation</span>}
            </div>
          </div>

          {/* Music Prompt */}
          <div style={{ background: "#0d0d0d", border: "1px solid #2a1010", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b7280" }}>MUSIC PROMPT</span>
              <button onClick={() => handleCopy(musicPrompt, "music")} disabled={!musicPrompt} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: copiedField === "music" ? "#dc2626" : "#6b7280", cursor: "pointer" }}>
                {copiedField === "music" ? "COPIED!" : "COPY PROMPT"}
              </button>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, minHeight: 40 }}>
              {isLoading && !musicPrompt && (outputMode === "both" || outputMode === "music")
                ? <span style={{ color: "#7f1d1d" }}>Generating prompt...</span>
                : musicPrompt || <span style={{ color: "#374151" }}>Suno/Udio prompt will appear here</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}