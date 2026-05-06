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
  "Industrial Metal", "Metalcore", "Cinematic", "Djent", "Death Metal",
  "Sludge", "Progressive", "Black Metal", "Doom", "Thrash", "Symphonic", "Groove",
];

const INSPIRE_PROMPTS = [
  "Write with strong physical imagery, a huge chorus, and modern heavy production energy.",
  "Dark atmosphere with blast beats, tremolo riffs, and raw screaming vocals.",
  "Epic orchestral intro building into crushing downtuned riffs and cathartic chorus.",
  "Slow, oppressive groove with feedback walls and whispered vocals turning to roars.",
  "Relentless thrash attack — 200bpm verses, gang shout chorus, shredding bridge.",
];

const OUTPUT_MODES = ["Full Package", "Lyrics Only", "Music Prompt Only"];

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

const S = {
  sidebar: {
    width: 260,
    background: "#0d0d0d",
    borderRight: "1px solid #1f0808",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
  },
  center: {
    flex: 1,
    background: "#0f0f0f",
    borderRight: "1px solid #1f0808",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  rightPanel: {
    width: 340,
    background: "#0d0d0d",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
  },
};

export default function MetalForgePage() {
  const [outputMode, setOutputMode] = useState("Full Package");
  const [subgenre, setSubgenre] = useState(SUBGENRES[8]);
  const [mood, setMood] = useState(MOODS[0]);
  const [theme, setTheme] = useState("Write your theme or describe the concept...");
  const [language, setLanguage] = useState("English");
  const [intensity, setIntensity] = useState("High");
  const [structure, setStructure] = useState(STRUCTURES[0]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Industrial Metal", "Metalcore", "Cinematic"]);
  const [creativeDirection, setCreativeDirection] = useState(INSPIRE_PROMPTS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [output, setOutput] = useState("");
  const [musicPrompt, setMusicPrompt] = useState("");
  const [history, setHistory] = useState<{ title: string; styles: string; time: string }[]>([]);
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

  const buildPrompt = () => {
    if (outputMode === "Music Prompt Only") {
      return `Generate a Suno/Udio music generation prompt (max 200 chars) for: ${subgenre}, ${mood} mood, ${intensity} intensity, styles: ${selectedStyles.join(", ")}. Return only the prompt text.`;
    }
    const base = `Generate metal song lyrics with these parameters:
- Subgenre: ${subgenre}
- Mood: ${mood}
- Theme: ${theme}
- Language: ${language}
- Intensity: ${intensity}
- Structure: ${structure}
- Styles: ${selectedStyles.join(", ")}
- Creative Direction: ${creativeDirection}

Format:
TITLE: [title]

LYRICS:
[full lyrics with [Verse 1], [Chorus], etc.]`;
    if (outputMode === "Full Package") {
      return base + `\n\nMUSIC PROMPT: [Suno/Udio prompt max 200 chars]`;
    }
    return base;
  };

  const handleForge = async () => {
    setIsLoading(true);
    setTitle(""); setOutput(""); setMusicPrompt("");
    try {
      const text = await callForge(buildPrompt());
      const titleMatch = text.match(/TITLE:\s*(.+)/);
      const t = titleMatch ? titleMatch[1].trim() : "";
      setTitle(t);

      const lyricsMatch = text.match(/LYRICS:\s*([\s\S]*?)(?=MUSIC PROMPT:|$)/);
      if (lyricsMatch) setOutput(lyricsMatch[1].trim());
      else if (!titleMatch) setOutput(text.trim());

      const musicMatch = text.match(/MUSIC PROMPT:\s*(.+)/);
      if (musicMatch) setMusicPrompt(musicMatch[1].trim());

      if (t) {
        const now = new Date();
        const time = `${now.toLocaleDateString()} · ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        setHistory(prev => [{ title: t, styles: selectedStyles.slice(0, 2).join(" · "), time }, ...prev.slice(0, 9)]);
      }
    } catch {
      setOutput("Generation error. Check ANTHROPIC_API_KEY in Vercel environment variables.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const content = [title ? `TITLE: ${title}` : "", output ? `\nLYRICS:\n${output}` : "", musicPrompt ? `\nMUSIC PROMPT:\n${musicPrompt}` : ""].filter(Boolean).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title || "metal-forge"}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const label = (text: string) => (
    <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b2020", marginBottom: 8, textTransform: "uppercase" as const }}>{text}</div>
  );

  const selectStyle: React.CSSProperties = {
    width: "100%", background: "#161010", border: "1px solid #2a1010",
    color: "#d1d5db", fontSize: 13, padding: "9px 12px", borderRadius: 8,
    outline: "none", cursor: "pointer", appearance: "none" as const,
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a", fontFamily: "'Courier New', monospace", color: "#e5e5e5", overflow: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ height: 52, borderBottom: "1px solid #1f0808", background: "#0a0a0a", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #991b1b, #450a0a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fca5a5" }}>MF</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.15em", color: "#fff" }}>METAL FORGE V1</div>
            <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#7f1d1d" }}>HEAVY LYRICS & MUSIC PROMPTS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["New Track", "Export TXT", "Export PDF", "Docs", "GitHub"].map(btn => (
            <button key={btn} onClick={btn === "Export TXT" ? handleSave : undefined} style={{
              padding: "6px 14px", fontSize: 11, letterSpacing: "0.1em", borderRadius: 6, cursor: "pointer",
              border: btn === "Export PDF" ? "none" : "1px solid #2a1010",
              background: btn === "Export PDF" ? "#991b1b" : "transparent",
              color: btn === "Export PDF" ? "#fff" : "#9ca3af",
              fontFamily: "'Courier New', monospace",
            }}>{btn}</button>
          ))}
        </div>
      </nav>

      {/* MAIN BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT SIDEBAR */}
        <div style={S.sidebar}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid #1f0808" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b2020", marginBottom: 12 }}>COVER ART</div>
            <div style={{ fontSize: 12, color: "#4b5563" }}>Image Prompts</div>
            <div style={{ marginTop: 16, background: "#1a0808", border: "1px dashed #3a1010", borderRadius: 8, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#4b5563", letterSpacing: "0.1em", textAlign: "center" as const, padding: 12 }}>
              Forge a track first to generate cover art
            </div>
          </div>

          <div style={{ padding: "16px", borderBottom: "1px solid #1f0808" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b2020", marginBottom: 12 }}>OUTPUT MODE</div>
            {OUTPUT_MODES.map(mode => (
              <div key={mode} onClick={() => setOutputMode(mode)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", marginBottom: 4, borderRadius: 6, cursor: "pointer",
                background: outputMode === mode ? "#1f0808" : "transparent",
                border: outputMode === mode ? "1px solid #7f1d1d" : "1px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: outputMode === mode ? "#dc2626" : "#374151", border: outputMode === mode ? "none" : "1px solid #374151" }} />
                  <span style={{ fontSize: 12, color: outputMode === mode ? "#fca5a5" : "#6b7280" }}>{mode}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px", flex: 1, overflowY: "auto" as const }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b2020", marginBottom: 12 }}>HISTORY</div>
            {history.length === 0 ? (
              <div style={{ fontSize: 11, color: "#374151" }}>Forge a track first</div>
            ) : history.map((item, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #1f0808", cursor: "pointer" }}>
                <div style={{ fontSize: 12, color: "#d1d5db", marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: "#6b2020" }}>{item.styles} · {item.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div style={S.center}>
          <div style={{ flex: 1, overflowY: "auto" as const, padding: "32px 40px" }}>

            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, color: "#fff" }}>
              Forge your next<br />
              <span style={{ color: "#dc2626", fontStyle: "italic" }}>metal masterpiece</span>
            </h1>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 32 }}>Select subgenre, set parameters, generate.</p>

            {/* SUBGENRE + MOOD row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                {label("Subgenre")}
                <select value={subgenre} onChange={e => setSubgenre(e.target.value)} style={selectStyle}>
                  {SUBGENRES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                {label("Mood")}
                <select value={mood} onChange={e => setMood(e.target.value)} style={selectStyle}>
                  {MOODS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* THEME textarea */}
            <div style={{ marginBottom: 20 }}>
              {label("Theme")}
              <textarea value={theme} onChange={e => setTheme(e.target.value)} rows={3}
                style={{ ...selectStyle, resize: "none" as const, lineHeight: 1.6, fontFamily: "'Courier New', monospace" }}
                placeholder="Describe your theme or concept..." />
            </div>

            {/* STYLE TAGS */}
            <div style={{ marginBottom: 20 }}>
              {label("Style")}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                {STYLE_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleStyle(tag)} style={{
                    padding: "6px 14px", fontSize: 11, borderRadius: 20, cursor: "pointer", border: "1px solid",
                    background: selectedStyles.includes(tag) ? "#450a0a" : "transparent",
                    borderColor: selectedStyles.includes(tag) ? "#dc2626" : "#2a1010",
                    color: selectedStyles.includes(tag) ? "#fca5a5" : "#6b7280",
                    fontFamily: "'Courier New', monospace",
                  }}>{tag}</button>
                ))}
              </div>
              {selectedStyles.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: "#7f1d1d" }}>
                  {selectedStyles.join(" · ")} — {selectedStyles.length} style{selectedStyles.length !== 1 ? "s" : ""} active
                </div>
              )}
            </div>

            {/* LANGUAGE */}
            <div style={{ marginBottom: 20 }}>
              {label("Language")}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                {LANGUAGES.map(lang => (
                  <button key={lang} onClick={() => setLanguage(lang)} style={{
                    padding: "6px 14px", fontSize: 11, borderRadius: 20, cursor: "pointer", border: "1px solid",
                    background: language === lang ? "#450a0a" : "transparent",
                    borderColor: language === lang ? "#dc2626" : "#2a1010",
                    color: language === lang ? "#fca5a5" : "#6b7280",
                    fontFamily: "'Courier New', monospace",
                  }}>{lang}</button>
                ))}
              </div>
            </div>

            {/* INTENSITY + STRUCTURE row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                {label("Intensity")}
                <select value={intensity} onChange={e => setIntensity(e.target.value)} style={selectStyle}>
                  {INTENSITIES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                {label("Structure")}
                <select value={structure} onChange={e => setStructure(e.target.value)} style={selectStyle}>
                  {STRUCTURES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* CREATIVE DIRECTION */}
            <div style={{ marginBottom: 20 }}>
              {label("Creative Direction")}
              <textarea value={creativeDirection} onChange={e => setCreativeDirection(e.target.value)} rows={4}
                style={{ ...selectStyle, resize: "none" as const, lineHeight: 1.6, fontFamily: "'Courier New', monospace" }}
                placeholder="Describe the sound, energy, and feel you want..." />
            </div>

          </div>

          {/* BOTTOM ACTION BAR */}
          <div style={{ borderTop: "1px solid #1f0808", padding: "14px 40px", display: "flex", alignItems: "center", gap: 12, background: "#0a0a0a", flexShrink: 0 }}>
            <button onClick={handleInspire} style={{ padding: "10px 20px", fontSize: 11, letterSpacing: "0.1em", border: "1px solid #2a1010", background: "transparent", color: "#9ca3af", borderRadius: 8, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
              ✦ Inspire Me
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={handleForge} disabled={isLoading} style={{
              padding: "12px 48px", fontSize: 13, letterSpacing: "0.15em", fontWeight: 900,
              border: "none", borderRadius: 8, cursor: isLoading ? "not-allowed" : "pointer",
              background: isLoading ? "#450a0a" : "#dc2626", color: isLoading ? "#7f1d1d" : "#fff",
              fontFamily: "'Courier New', monospace",
            }}>
              {isLoading ? "FORGING..." : "FORGE OUTPUT ↗"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={S.rightPanel}>
          <div style={{ flex: 1, overflowY: "auto" as const, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* TITLE */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b2020" }}>TITLE</div>
                <button onClick={() => handleCopy(title, "title")} disabled={!title} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: copiedField === "title" ? "#dc2626" : "#4b5563", cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
                  {copiedField === "title" ? "COPIED!" : "COPY"}
                </button>
              </div>
              <div style={{ background: "#161010", border: "1px solid #2a1010", borderRadius: 8, padding: 14, minHeight: 48 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>
                  {isLoading && !title ? <span style={{ color: "#7f1d1d" }}>Generating...</span> : title || <span style={{ color: "#374151", fontWeight: 400, fontSize: 12 }}>Title will appear here</span>}
                </div>
              </div>
            </div>

            {/* OUTPUT / LYRICS */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b2020" }}>COMPOSITION</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => callForge(`Refine these metal lyrics to be more powerful and poetic:\n\n${output}\n\nReturn only the lyrics.`).then(t => setOutput(t.trim()))} disabled={!output || isLoading} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: "#4b5563", cursor: "pointer", fontFamily: "'Courier New', monospace" }}>Refine</button>
                  <button onClick={() => handleCopy(output, "output")} disabled={!output} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: copiedField === "output" ? "#dc2626" : "#4b5563", cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
                    {copiedField === "output" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div style={{ background: "#161010", border: "1px solid #2a1010", borderRadius: 8, padding: 14, minHeight: 200, maxHeight: 340, overflowY: "auto" as const }}>
                <div style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.8, whiteSpace: "pre-wrap" as const }}>
                  {isLoading && !output ? <span style={{ color: "#7f1d1d" }}>Forging lyrics...</span> : output || <span style={{ color: "#374151" }}>Your composition will appear here...</span>}
                </div>
              </div>
            </div>

            {/* MUSIC PROMPT */}
            {(outputMode === "Full Package" || outputMode === "Music Prompt Only") && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#6b2020" }}>MUSIC PROMPT</div>
                  <button onClick={() => handleCopy(musicPrompt, "music")} disabled={!musicPrompt} style={{ fontSize: 10, letterSpacing: "0.1em", background: "transparent", border: "none", color: copiedField === "music" ? "#dc2626" : "#4b5563", cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
                    {copiedField === "music" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div style={{ background: "#161010", border: "1px solid #2a1010", borderRadius: 8, padding: 14, minHeight: 60 }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
                    {isLoading && !musicPrompt ? <span style={{ color: "#7f1d1d" }}>Generating prompt...</span> : musicPrompt || <span style={{ color: "#374151" }}>Suno/Udio prompt will appear here</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT BOTTOM */}
          <div style={{ borderTop: "1px solid #1f0808", padding: "14px 20px", display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={handleSave} disabled={!output && !title} style={{ flex: 1, padding: "10px", fontSize: 10, letterSpacing: "0.1em", border: "1px solid #2a1010", background: "transparent", color: "#9ca3af", borderRadius: 6, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
              Download TXT
            </button>
            <button onClick={handleForge} disabled={isLoading} style={{ flex: 1, padding: "10px", fontSize: 10, letterSpacing: "0.1em", border: "none", background: "#991b1b", color: "#fff", borderRadius: 6, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
              Download PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}