"use client";

import { useState, useRef, useEffect } from "react";
import { buildPrompt } from "@/lib/buildPrompt";
import ResultPanel from "@/components/ResultPanel";
import DraftsPanel from "@/components/DraftsPanel";
import CoverPanel from "@/components/CoverPanel";
import VideoPanel from "@/components/VideoPanel";
import Header from "@/components/Header";
import { useDrafts } from "@/lib/useDrafts";
import { Draft } from "@/lib/useDrafts";

const GENRE_CATEGORIES = [
  { id: "death",   label: "Death Metal",    variant: "light" as const, subs: ["Melodic Death", "Technical Death", "Brutal Death", "Death-Doom", "Deathcore"] },
  { id: "black",   label: "Black Metal",    variant: "dim"   as const, subs: ["Atmospheric Black", "Symphonic Black", "Raw Black", "Post-Black", "Blackgaze"] },
  { id: "thrash",  label: "Thrash & Speed", variant: "light" as const, subs: ["Bay Area Thrash", "Speed Metal", "Crossover Thrash", "Technical Thrash", "Heavy Metal"] },
  { id: "doom",    label: "Doom & Sludge",  variant: "dim"   as const, subs: ["Traditional Doom", "Sludge Metal", "Stoner Metal", "Funeral Doom", "Death-Doom"] },
  { id: "modern",  label: "Modern Heavy",   variant: "light" as const, subs: ["Metalcore", "Djent", "Deathcore", "Nu-Metal", "Groove Metal"] },
  { id: "prog",    label: "Progressive",    variant: "dim"   as const, subs: ["Progressive Metal", "Power Metal", "Symphonic Metal", "Folk Metal", "Industrial Metal"] },
];

const OUTPUT_TYPES = [
  { id: "full",        label: "Full Package" },
  { id: "lyrics",      label: "Lyrics Only" },
  { id: "hooks",       label: "Hooks & Chorus" },
  { id: "production",  label: "Production Notes" },
  { id: "arrangement", label: "Arrangement" },
];

const INSTRUMENTS = [
  "Vocals", "Screams", "Guitar", "Bass", "Drums", "Keys",
  "Synth", "Strings", "Choir", "Electronics", "Saxophone", "Violin",
];

const LANGUAGES = [
  "English", "Russian", "German", "Norwegian", "Finnish", "Swedish",
  "Danish", "Icelandic", "Polish", "Ukrainian", "Czech", "French",
  "Spanish", "Portuguese", "Italian", "Greek", "Arabic", "Japanese",
];

const INTENSITY_LABELS = ["", "Soft", "Heavy", "Crushing", "Devastating", "Annihilating"];

const MOOD_PRESETS = [
  { icon: "🌑", label: "Night",    key: "B minor",  tempo: "Slow (40-60)",  intensity: 2 },
  { icon: "⚔️", label: "War",      key: "E minor",  tempo: "Fast (160+)",   intensity: 5 },
  { icon: "🌧", label: "Doom",     key: "D minor",  tempo: "Drone (20-40)", intensity: 1 },
  { icon: "💀", label: "Brutal",   key: "C# minor", tempo: "Fast (160+)",   intensity: 5 },
  { icon: "🏔", label: "Epic",     key: "Open",     tempo: "Mid (90-120)",  intensity: 4 },
  { icon: "❄️", label: "Nihilist", key: "F# minor", tempo: "Fast (160+)",   intensity: 5 },
];

const KEYS = [
  "E minor", "A minor", "D minor", "B minor", "C# minor",
  "F# minor", "G minor", "C minor", "Open", "Drop D", "Drop B",
];

const TEMPOS = ["Drone (20-40)", "Slow (40-60)", "Mid (90-120)", "Fast (160+)"];

type TrackMode = "vocal" | "instrumental" | "both";

const MODES: { id: TrackMode; label: string; icon: string }[] = [
  { id: "vocal",        label: "Vocal",        icon: "🎤" },
  { id: "instrumental", label: "Instrumental", icon: "🎸" },
  { id: "both",         label: "Both",         icon: "🎭" },
];

const s = {
  col: { display: "flex" as const, flexDirection: "column" as const, height: "100%", overflow: "hidden" as const },
  sectionLabel: {
    fontSize: "11px", letterSpacing: "0.12em", color: "#505050",
    textTransform: "uppercase" as const, padding: "14px 16px 8px", fontWeight: 500,
  },
  outBtn: (active: boolean) => ({
    fontSize: "12px", padding: "8px 14px", borderRadius: "6px",
    border: `1px solid ${active ? "#e0e0e0" : "transparent"}`,
    background: active ? "rgba(224,224,224,0.08)" : "transparent",
    color: active ? "#f0f0f0" : "#606060",
    cursor: "pointer" as const, textAlign: "left" as const,
    fontWeight: active ? 500 : 400, transition: "all 0.15s", width: "100%",
    fontFamily: "'DM Sans', sans-serif",
  }),
  paramCard: {
    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "10px 12px",
  },
  paramLabel: {
    fontSize: "10px", color: "#505050", letterSpacing: "0.1em",
    textTransform: "uppercase" as const, marginBottom: "6px", fontWeight: 500,
  },
  select: {
    width: "100%", background: "transparent", border: "none",
    color: "#f0f0f0", fontSize: "13px", fontWeight: 500,
    outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  tag: (active: boolean) => ({
    fontSize: "12px", padding: "5px 12px", borderRadius: "20px",
    border: `1px solid ${active ? "#e0e0e0" : "#2a2a2a"}`,
    background: active ? "rgba(224,224,224,0.1)" : "#1a1a1a",
    color: active ? "#f0f0f0" : "#606060",
    cursor: "pointer" as const, transition: "all 0.15s", fontWeight: active ? 500 : 400,
    fontFamily: "'DM Sans', sans-serif",
  }),
};

function getVariantForGenre(g: string): "light" | "dim" {
  const cat = GENRE_CATEGORIES.find(c => c.label === g || c.subs.includes(g));
  return cat?.variant ?? "light";
}

export default function Home() {
  const [activeGenres, setActiveGenres] = useState<string[]>(["Metalcore"]);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [outputType, setOutputType] = useState("full");
  const [key, setKey] = useState("E minor");
  const [tempo, setTempo] = useState("Fast (160+)");
  const [intensity, setIntensity] = useState(4);
  const [instruments, setInstruments] = useState<string[]>(["Vocals", "Guitar", "Drums"]);
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("");
  const [trackMode, setTrackMode] = useState<TrackMode>("vocal");
  const [result, setResult] = useState("");
  const [coverResult, setCoverResult] = useState("");
  const [videoResult, setVideoResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inspireLoading, setInspireLoading] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  const { drafts, saveDraft, deleteDraft, toggleStar } = useDrafts();
  const genreBlockRef = useRef<HTMLDivElement>(null);

  const compositionTitle = result.split("\n").find(l => /^#?\s*TITLE:/i.test(l))?.replace(/^#?\s*TITLE:/i, "").trim() || "";
  const instrumental = trackMode === "instrumental";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (genreBlockRef.current && !genreBlockRef.current.contains(e.target as Node)) {
        setOpenCat(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function clearAll() {
    setResult(""); setCoverResult(""); setVideoResult(""); setTheme("");
    setActiveGenres(["Metalcore"]); setOutputType("full");
    setKey("E minor"); setTempo("Fast (160+)"); setIntensity(4);
    setInstruments(["Vocals", "Guitar", "Drums"]);
    setLanguage("English"); setTrackMode("vocal"); setOpenCat(null);
  }

  function toggleGenre(g: string) {
    setActiveGenres(prev => {
      if (prev.includes(g)) return prev.length > 1 ? prev.filter(x => x !== g) : prev;
      if (prev.length >= 3) return prev;
      return [...prev, g];
    });
  }

  function removeGenre(g: string) {
    setActiveGenres(prev => prev.length > 1 ? prev.filter(x => x !== g) : prev);
  }

  function isCatActive(cat: typeof GENRE_CATEGORIES[0]) {
    return activeGenres.includes(cat.label) || cat.subs.some(sub => activeGenres.includes(sub));
  }

  function toggleInstrument(i: string) {
    setInstruments(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  async function inspire() {
    setInspireLoading(true); setTheme("");
    try {
      const res = await fetch("/api/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre: activeGenres.join(" + "), mood: INTENSITY_LABELS[intensity], tempo, instrumental }),
      });
      if (!res.ok || !res.body) { setInspireLoading(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setTheme(acc);
      }
    } catch { setTheme("Ash falls over a ruined city. The last voice screams into silence."); }
    finally { setInspireLoading(false); }
  }

  async function randomTheme() {
    setRandomLoading(true); setTheme("");
    try {
      const res = await fetch("/api/random-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.theme) setTheme(data.theme);
      if (data.genre) setActiveGenres([data.genre]);
      if (data.key) setKey(data.key);
      if (data.tempo) setTempo(data.tempo);
      if (data.intensity) setIntensity(data.intensity);
    } catch { setTheme("A dying sun bleeds over the battlefield. Nothing remains but bone and silence."); }
    finally { setRandomLoading(false); }
  }

  async function generate() {
    setLoading(true); setIsStreaming(true);
    setResult(""); setCoverResult(""); setVideoResult("");
    try {
      const prompt = buildPrompt({
        genres: activeGenres, outputType, key, tempo,
        intensity: INTENSITY_LABELS[intensity],
        instruments, language, theme, instrumental,
      });
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok || !res.body) { setResult("Generation failed"); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setLoading(false);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setResult(acc);
      }
      setTheme("");
    } catch { setResult("Error connecting to API"); }
    finally { setLoading(false); setIsStreaming(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#0f0f0f", color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif" }}>
      <Header title={compositionTitle} composition={result} coverResult={coverResult} videoResult={videoResult} onClear={clearAll} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1fr", flex: 1, overflow: "hidden" }}>

        <CoverPanel
          title={compositionTitle}
          genre={activeGenres.join(" + ")}
          mood={INTENSITY_LABELS[intensity]}
          theme={theme}
          composition={result}
          compositionLoading={isStreaming}
          onResult={setCoverResult}
        />

        {/* COL 2 */}
        <div style={{ ...s.col, background: "#141414", borderRight: "1px solid #2a2a2a" }}>
          <div style={{ padding: "40px 20px 20px", borderBottom: "1px solid #2a2a2a" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 700, color: "#f0f0f0", lineHeight: 1.0, letterSpacing: "-0.03em" }}>
              Forge your next
              <br />
              <span style={{ color: "#a0a0a0", fontStyle: "italic" }}>metal masterpiece</span>
            </div>
            <div style={{ fontSize: "13px", color: "#505050", marginTop: "12px", lineHeight: 1.4 }}>
              Select subgenre, set parameters, generate.
            </div>
            <div style={{ display: "flex", gap: "5px", marginTop: "8px", flexWrap: "wrap" }}>
              {MOOD_PRESETS.map(preset => (
                <button key={preset.label} onClick={() => { setKey(preset.key); setTempo(preset.tempo); setIntensity(preset.intensity); }} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", border: "1px solid #2a2a2a", background: "#1a1a1a", color: "#606060", cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>
                  {preset.icon} {preset.label}
                </button>
              ))}
            </div>
            <button onClick={inspire} disabled={inspireLoading} style={{ marginTop: "10px", width: "100%", padding: "8px 14px", background: inspireLoading ? "#1a1a1a" : "rgba(224,224,224,0.06)", border: `1px solid ${inspireLoading ? "#2a2a2a" : "#555"}`, borderRadius: "8px", color: inspireLoading ? "#404040" : "#e0e0e0", fontSize: "12px", fontWeight: 500, cursor: inspireLoading ? "not-allowed" : "pointer", letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
              {inspireLoading ? "Generating brief..." : "✦ Inspire Me"}
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={s.sectionLabel}>Subgenre</div>

            <div ref={genreBlockRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", padding: "0 12px" }}>
              {GENRE_CATEGORIES.map(cat => {
                const active = isCatActive(cat);
                const isOpen = openCat === cat.id;
                const isLight = cat.variant === "light";
                return (
                  <div key={cat.id} style={{ position: "relative" }}>
                    <div style={{ display: "flex", borderRadius: "20px", border: `1px solid ${active ? (isLight ? "#e0e0e0" : "#888") : "#2a2a2a"}`, background: active ? (isLight ? "rgba(224,224,224,0.1)" : "rgba(136,136,136,0.1)") : "#1a1a1a", overflow: "hidden", transition: "all 0.15s" }}>
                      <button onClick={() => { toggleGenre(cat.subs[0]); setOpenCat(null); }} style={{ flex: 1, fontSize: "12px", padding: "6px 4px 6px 10px", background: "transparent", border: "none", color: active ? (isLight ? "#f0f0f0" : "#c0c0c0") : "#606060", cursor: "pointer", textAlign: "left" as const, fontWeight: active ? 500 : 400, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {cat.label}
                      </button>
                      <button onClick={() => setOpenCat(isOpen ? null : cat.id)} style={{ width: "22px", background: "transparent", border: "none", borderLeft: `1px solid ${active ? "#444" : "#2a2a2a"}`, color: active ? "#a0a0a0" : "#404040", cursor: "pointer", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>▾</button>
                    </div>
                    {isOpen && (
                      <div style={{ position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#1e1e1e", border: "1px solid #333", borderRadius: "10px", zIndex: 50, overflow: "hidden" }}>
                        {cat.subs.map((sub, idx) => {
                          const subActive = activeGenres.includes(sub);
                          return (
                            <button key={sub} onClick={() => toggleGenre(sub)} style={{ display: "block", width: "100%", textAlign: "left" as const, padding: "7px 12px", background: subActive ? "rgba(224,224,224,0.08)" : "transparent", border: "none", borderBottom: idx < cat.subs.length - 1 ? "1px solid #2a2a2a" : "none", color: subActive ? "#f0f0f0" : "#606060", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "8px 12px 0", display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {activeGenres.map(g => {
                const v = getVariantForGenre(g);
                return (
                  <div key={g} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", padding: "3px 8px 3px 10px", borderRadius: "20px", border: `1px solid ${v === "light" ? "#e0e0e0" : "#888"}`, background: v === "light" ? "rgba(224,224,224,0.1)" : "rgba(136,136,136,0.1)", color: v === "light" ? "#f0f0f0" : "#c0c0c0" }}>
                    <span>{g}</span>
                    <button onClick={() => removeGenre(g)} style={{ background: "none", border: "none", color: "#808080", cursor: "pointer", fontSize: "12px", lineHeight: 1, padding: "0 0 0 2px", display: "flex", alignItems: "center" }}>×</button>
                  </div>
                );
              })}
            </div>

            {activeGenres.length >= 2 && (
              <div style={{ margin: "6px 12px 0", padding: "7px 10px", background: "rgba(224,224,224,0.05)", border: "1px solid #333", borderRadius: "6px", fontSize: "11px", color: "#888" }}>
                Blend mode — {activeGenres.length} subgenres active
              </div>
            )}

            <div style={{ height: "1px", background: "#2a2a2a", margin: "12px 0" }} />

            <div style={s.sectionLabel}>Output</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
              {OUTPUT_TYPES.map(o => (
                <button key={o.id} onClick={() => setOutputType(o.id)} style={s.outBtn(outputType === o.id)}>{o.label}</button>
              ))}
            </div>

            <div style={{ height: "1px", background: "#2a2a2a", margin: "12px 0" }} />

            <div style={s.sectionLabel}>History</div>
            <DraftsPanel
              drafts={drafts}
              onLoad={(draft: Draft) => {
                setActiveGenres(draft.genres); setOutputType(draft.outputType); setResult(draft.result);
                if (draft.key) setKey(draft.key);
                if (draft.tempo) setTempo(draft.tempo);
                if (draft.intensity) setIntensity(draft.intensity);
                if (draft.language) setLanguage(draft.language);
                if (draft.trackMode) setTrackMode(draft.trackMode as TrackMode);
                if (draft.instruments) setInstruments(draft.instruments);
              }}
              onDelete={deleteDraft}
              onStar={toggleStar}
            />
          </div>
        </div>

        {/* COL 3 */}
        <div style={{ ...s.col, background: "#0f0f0f" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #2a2a2a" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Key</div>
                <select style={s.select} value={key} onChange={e => setKey(e.target.value)}>
                  {KEYS.map(k => <option key={k} style={{ background: "#1a1a1a" }}>{k}</option>)}
                </select>
              </div>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Tempo</div>
                <select style={s.select} value={tempo} onChange={e => setTempo(e.target.value)}>
                  {TEMPOS.map(t => <option key={t} style={{ background: "#1a1a1a" }}>{t}</option>)}
                </select>
              </div>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Intensity</div>
                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setIntensity(n)} style={{ height: "6px", flex: 1, borderRadius: "2px", border: "none", background: n <= intensity ? "#e0e0e0" : "#2a2a2a", cursor: "pointer" }} />
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: "#808080", marginTop: "5px" }}>{INTENSITY_LABELS[intensity]}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "14px 16px", borderBottom: "1px solid #2a2a2a", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={s.paramLabel}>Theme</div>
                <button onClick={randomTheme} disabled={randomLoading} title="Random theme"
                  style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: "6px", color: randomLoading ? "#303030" : "#606060", fontSize: "14px", cursor: randomLoading ? "not-allowed" : "pointer", padding: "2px 8px", lineHeight: 1, transition: "all 0.15s" }}
                  onMouseEnter={e => { if (!randomLoading) { (e.currentTarget.style.borderColor = "#e0e0e0"); (e.currentTarget.style.color = "#e0e0e0"); } }}
                  onMouseLeave={e => { (e.currentTarget.style.borderColor = "#2a2a2a"); (e.currentTarget.style.color = randomLoading ? "#303030" : "#606060"); }}
                >{randomLoading ? "⟳" : "🎲"}</button>
              </div>
              <textarea value={theme} onChange={e => setTheme(e.target.value)}
                placeholder="Ash falls over a ruined city. The last voice screams into silence..."
                style={{ width: "100%", height: "120px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "8px 12px", color: "#a0a0a0", fontSize: "12px", resize: "none" as const, outline: "none", fontFamily: "'DM Mono', monospace", lineHeight: "1.7", overflow: "auto", boxSizing: "border-box" as const }} />
            </div>

            <div>
              <div style={s.paramLabel}>Instrumentation</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {INSTRUMENTS.map(i => <button key={i} onClick={() => toggleInstrument(i)} style={s.tag(instruments.includes(i))}>{i}</button>)}
              </div>
            </div>

            <div>
              <div style={s.paramLabel}>Language</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {LANGUAGES.map(l => <button key={l} onClick={() => setLanguage(l)} style={s.tag(language === l)}>{l}</button>)}
              </div>
            </div>

            <div>
              <div style={s.paramLabel}>Mode</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {MODES.map(m => (
                  <button key={m.id} onClick={() => setTrackMode(m.id)} style={{ fontSize: "12px", padding: "5px 14px", borderRadius: "20px", border: `1px solid ${trackMode === m.id ? "#e0e0e0" : "#2a2a2a"}`, background: trackMode === m.id ? "rgba(224,224,224,0.1)" : "#1a1a1a", color: trackMode === m.id ? "#f0f0f0" : "#606060", cursor: "pointer", transition: "all 0.15s", fontWeight: trackMode === m.id ? 500 : 400, fontFamily: "'DM Sans', sans-serif" }}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            <ResultPanel result={result} loading={loading} isStreaming={isStreaming} />
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a2a", display: "flex", gap: "8px" }}>
            <button
              onClick={() => { if (result) saveDraft({ title: compositionTitle || "Untitled", genres: activeGenres, outputType, result, key, tempo, intensity, language, trackMode, instruments }); }}
              disabled={!result}
              style={{ padding: "10px 16px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "6px", color: result ? "#a0a0a0" : "#303030", fontSize: "12px", cursor: result ? "pointer" : "not-allowed", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}
            >Save Draft</button>
            <button
              onClick={generate}
              disabled={loading || isStreaming}
              style={{ flex: 1, padding: "10px", background: (loading || isStreaming) ? "#1a1a1a" : "#e0e0e0", border: "none", borderRadius: "6px", color: (loading || isStreaming) ? "#404040" : "#0f0f0f", fontSize: "13px", fontWeight: 600, cursor: (loading || isStreaming) ? "not-allowed" : "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}
            >{(loading || isStreaming) ? "Forging..." : "Forge Track ↗"}</button>
          </div>
        </div>

        <VideoPanel
          title={compositionTitle}
          genre={activeGenres.join(" + ")}
          mood={INTENSITY_LABELS[intensity]}
          theme={theme}
          composition={result}
          compositionLoading={isStreaming}
          onResult={setVideoResult}
        />

      </div>
    </div>
  );
}