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
    setTitle(""); setLyrics(""); setMusicPrompt("");
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

Provide:
1. A powerful song title
2. Full lyrics following the structure ${structure}

Format your response as:
TITLE: [song title]

LYRICS:
[full lyrics with section labels like [Verse 1], [Chorus], etc.]`);
    }
    if (outputMode === "both" || outputMode === "music") {
      parts.push(`\n\nMUSIC PROMPT:
Also generate a Suno/Udio music generation prompt (max 200 chars) capturing: ${subgenre}, ${mood} mood, ${intensity} intensity, ${selectedStyles.join(", ")} styles.
Format: MUSIC PROMPT: [prompt]`);
    }
    return parts.join("");
  };

  const handleForge = async () => {
    setIsLoading(true);
    setTitle(""); setLyrics(""); setMusicPrompt("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: buildPrompt() }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").join("") || "";

      const titleMatch = text.match(/TITLE:\s*(.+)/);
      if (titleMatch) setTitle(titleMatch[1].trim());

      const lyricsMatch = text.match(/LYRICS:\s*([\s\S]*?)(?=MUSIC PROMPT:|$)/);
      if (lyricsMatch) setLyrics(lyricsMatch[1].trim());

      const musicMatch = text.match(/MUSIC PROMPT:\s*(.+)/);
      if (musicMatch) setMusicPrompt(musicMatch[1].trim());

      if (!titleMatch && !lyricsMatch) {
        setLyrics(text.trim());
      }
    } catch (err) {
      setLyrics("⚠️ Generation error. Check your API connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!lyrics) return;
    setIsLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Refine these metal lyrics to be more powerful, visceral, and poetic while keeping the structure intact. Make the imagery more intense and the chorus more anthemic:\n\n${lyrics}\n\nReturn only the refined lyrics.`,
          }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").join("") || "";
      setLyrics(text.trim());
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePrompt = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Generate a new Suno/Udio music generation prompt (max 200 chars) for: ${subgenre}, ${mood} mood, ${intensity} intensity, styles: ${selectedStyles.join(", ")}. Return only the prompt text, no labels.`,
          }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").join("") || "";
      setMusicPrompt(text.trim());
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
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
    a.href = url; a.download = `${title || "metal-forge"}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-mono">
      {/* Navbar */}
      <nav className="border-b border-[#2a0a0a] bg-[#0d0d0d] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center text-xs font-black text-red-200 shadow-lg shadow-red-900/50">
            MF
          </div>
          <div>
            <div className="text-sm font-black tracking-widest text-white">METAL FORGE V1</div>
            <div className="text-[10px] tracking-widest text-red-600/70">HEAVY LYRICS & MUSIC PROMPTS</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 text-xs tracking-widest border border-[#3a1010] text-red-300/70 rounded hover:border-red-700 hover:text-red-300 transition-colors">
            FORGE STUDIO
          </button>
          <button className="px-4 py-1.5 text-xs tracking-widest border border-[#3a1010] text-red-300/70 rounded hover:border-red-700 hover:text-red-300 transition-colors">
            GITHUB
          </button>
        </div>
      </nav>

      {/* 4-Column Grid */}
      <div className="grid grid-cols-4 gap-4 p-4 max-w-[1600px] mx-auto">

        {/* ── COLUMN 1: CONTROL DECK ── */}
        <div className="bg-[#111111] border border-[#2a1010] rounded-lg p-5 flex flex-col gap-4">
          <div className="text-[10px] tracking-widest text-red-600/60 uppercase">Control Deck</div>
          <div>
            <h1 className="text-2xl font-black leading-tight text-white">
              Создайте свой<br />следующий<br />
              <span className="text-red-600">металлический</span><br />шедевр
            </h1>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Настройте субжанр, настроение, структуру и режим вывода. Генерируйте тексты, музыкальные промпты или и то, и другое.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[10px] tracking-widest border border-[#3a1010] text-red-500/60 rounded">
              MODE: LYRICS + MUSIC PROMPT
            </span>
            <span className="px-2 py-0.5 text-[10px] tracking-widest border border-[#3a1010] text-red-500/60 rounded">
              READY FOR LIVE GENERATION
            </span>
          </div>

          {/* Output Mode */}
          <div>
            <div className="text-[10px] tracking-widest text-gray-500 mb-2">OUTPUT MODE</div>
            <div className="flex gap-2">
              {(["both", "lyrics", "music"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setOutputMode(mode)}
                  className={`px-3 py-1.5 text-[10px] tracking-widest rounded font-bold transition-all ${
                    outputMode === mode
                      ? "bg-red-800 text-white border border-red-700"
                      : "border border-[#3a1010] text-gray-500 hover:border-red-800/50 hover:text-gray-300"
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Inspire / Clear */}
          <div className="flex gap-2 mt-auto pt-2">
            <button
              onClick={handleInspire}
              className="flex-1 py-2 text-[10px] tracking-widest border border-[#3a1010] text-gray-400 rounded hover:border-red-800/50 hover:text-gray-200 transition-colors"
            >
              INSPIRE ME
            </button>
            <button
              onClick={handleClear}
              className="flex-1 py-2 text-[10px] tracking-widest border border-[#3a1010] text-gray-400 rounded hover:border-red-800/50 hover:text-gray-200 transition-colors"
            >
              CLEAR
            </button>
          </div>
        </div>

        {/* ── COLUMN 2: PARAMETERS ── */}
        <div className="bg-[#111111] border border-[#2a1010] rounded-lg p-5 flex flex-col gap-4">
          <div className="text-[10px] tracking-widest text-red-600/60 uppercase">Parameters</div>

          {/* Subgenre */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-500 block mb-1.5">SUBGENRE</label>
            <select
              value={subgenre}
              onChange={e => setSubgenre(e.target.value)}
              className="w-full bg-[#1a0a0a] border border-[#3a1010] text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-red-800 appearance-none cursor-pointer"
            >
              {SUBGENRES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-500 block mb-1.5">MOOD</label>
            <select
              value={mood}
              onChange={e => setMood(e.target.value)}
              className="w-full bg-[#1a0a0a] border border-[#3a1010] text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-red-800 appearance-none cursor-pointer"
            >
              {MOODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-500 block mb-1.5">THEME</label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="w-full bg-[#1a0a0a] border border-[#3a1010] text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-red-800 appearance-none cursor-pointer"
            >
              {THEMES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-500 block mb-1.5">LANGUAGE</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full bg-[#1a0a0a] border border-[#3a1010] text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-red-800 appearance-none cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-500 block mb-1.5">INTENSITY</label>
            <select
              value={intensity}
              onChange={e => setIntensity(e.target.value)}
              className="w-full bg-[#1a0a0a] border border-[#3a1010] text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-red-800 appearance-none cursor-pointer"
            >
              {INTENSITIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>

          {/* Structure */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-500 block mb-1.5">STRUCTURE</label>
            <select
              value={structure}
              onChange={e => setStructure(e.target.value)}
              className="w-full bg-[#1a0a0a] border border-[#3a1010] text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-red-800 appearance-none cursor-pointer"
            >
              {STRUCTURES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── COLUMN 3: STYLE + DIRECTION + ACTIONS ── */}
        <div className="bg-[#111111] border border-[#2a1010] rounded-lg p-5 flex flex-col gap-4">
          <div className="text-[10px] tracking-widest text-red-600/60 uppercase">Style & Direction</div>

          {/* Style Palette */}
          <div>
            <div className="text-[10px] tracking-widest text-gray-500 mb-2">STYLE PALETTE</div>
            <button
              onClick={() => setShowStylePicker(!showStylePicker)}
              className="w-full py-2 text-xs tracking-widest border border-[#3a1010] text-gray-400 rounded hover:border-red-800/50 transition-colors"
            >
              BROWSE STYLES ({selectedStyles.length})
            </button>

            {showStylePicker && (
              <div className="mt-2 p-3 bg-[#0d0d0d] border border-[#3a1010] rounded grid grid-cols-2 gap-1.5">
                {STYLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleStyle(tag)}
                    className={`px-2 py-1 text-[9px] tracking-widest rounded transition-all ${
                      selectedStyles.includes(tag)
                        ? "bg-red-900/40 border border-red-700/60 text-red-300"
                        : "border border-[#3a1010] text-gray-500 hover:border-red-800/40"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedStyles.map(tag => (
                <span
                  key={tag}
                  onClick={() => toggleStyle(tag)}
                  className="px-2 py-0.5 text-[9px] tracking-widest border border-red-800/40 text-red-500/80 rounded cursor-pointer hover:border-red-600 transition-colors"
                >
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          {/* Creative Direction */}
          <div className="flex-1">
            <div className="text-[10px] tracking-widest text-gray-500 mb-2">CREATIVE DIRECTION</div>
            <textarea
              value={creativeDirection}
              onChange={e => setCreativeDirection(e.target.value)}
              rows={6}
              className="w-full bg-[#1a0a0a] border border-[#3a1010] text-gray-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-red-800 resize-none leading-relaxed"
              placeholder="Describe the sound, energy, and feel you want..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleForge}
              disabled={isLoading}
              className="w-full py-3 bg-red-800 hover:bg-red-700 disabled:bg-red-950 disabled:text-red-800 text-white text-xs font-black tracking-widest rounded transition-all shadow-lg shadow-red-900/30"
            >
              {isLoading ? "FORGING..." : "FORGE OUTPUT"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRefine}
                disabled={isLoading || !lyrics}
                className="py-2 text-[10px] tracking-widest border border-[#3a1010] text-gray-400 rounded hover:border-red-800/50 hover:text-gray-200 disabled:opacity-30 transition-colors"
              >
                REFINE LYRICS
              </button>
              <button
                onClick={handleRegeneratePrompt}
                disabled={isLoading}
                className="py-2 text-[10px] tracking-widest border border-[#3a1010] text-gray-400 rounded hover:border-red-800/50 hover:text-gray-200 disabled:opacity-30 transition-colors"
              >
                REGEN PROMPT
              </button>
            </div>
          </div>
        </div>

        {/* ── COLUMN 4: OUTPUT ── */}
        <div className="bg-[#111111] border border-[#2a1010] rounded-lg p-5 flex flex-col gap-4">
          <div className="text-[10px] tracking-widest text-red-600/60 uppercase">Output</div>

          {/* Title */}
          <div className="bg-[#0d0d0d] border border-[#2a1010] rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-widest text-gray-500">TITLE</span>
              <button
                onClick={() => handleCopy(title, "title")}
                disabled={!title}
                className="text-[10px] tracking-widest text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                {copiedField === "title" ? "COPIED!" : "COPY"}
              </button>
            </div>
            <div className="text-sm font-black text-white min-h-[20px]">
              {isLoading && !title ? (
                <span className="text-red-800 animate-pulse">GENERATING...</span>
              ) : title || (
                <span className="text-gray-700 text-xs">Title will appear here</span>
              )}
            </div>
          </div>

          {/* Lyrics */}
          <div className="bg-[#0d0d0d] border border-[#2a1010] rounded p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-widest text-gray-500">LYRICS</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(lyrics, "lyrics")}
                  disabled={!lyrics}
                  className="text-[10px] tracking-widest text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                >
                  {copiedField === "lyrics" ? "COPIED!" : "COPY LYRICS"}
                </button>
                <button
                  onClick={handleSaveFull}
                  disabled={!lyrics && !title}
                  className="text-[10px] tracking-widest text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                >
                  SAVE FULL
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[340px] overflow-y-auto custom-scroll min-h-[100px]">
              {isLoading && !lyrics ? (
                <span className="text-red-800 animate-pulse">Forging lyrics...</span>
              ) : lyrics || (
                <span className="text-gray-700">Lyrics will appear here after generation</span>
              )}
            </div>
          </div>

          {/* Music Prompt */}
          <div className="bg-[#0d0d0d] border border-[#2a1010] rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-widest text-gray-500">MUSIC PROMPT</span>
              <button
                onClick={() => handleCopy(musicPrompt, "music")}
                disabled={!musicPrompt}
                className="text-[10px] tracking-widest text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                {copiedField === "music" ? "COPIED!" : "COPY PROMPT"}
              </button>
            </div>
            <div className="text-xs text-gray-400 leading-relaxed min-h-[40px]">
              {isLoading && !musicPrompt && (outputMode === "both" || outputMode === "music") ? (
                <span className="text-red-800 animate-pulse">Generating prompt...</span>
              ) : musicPrompt || (
                <span className="text-gray-700">Suno/Udio prompt will appear here</span>
              )}
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: #0d0d0d; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3a1010; border-radius: 2px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #6b0000; }
        select option { background: #1a0a0a; }
      `}</style>
    </div>
  );
}
