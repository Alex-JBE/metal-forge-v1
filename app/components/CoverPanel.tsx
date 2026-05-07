"use client";

import { useState } from "react";
import { exportTXT } from "@/lib/export";

interface CoverPanelProps {
  title: string;
  genre: string;
  mood: string;
  theme: string;
  composition: string;
  compositionLoading: boolean;
  onResult: (result: string) => void;
}

const FORMATS = [
  { key: "CD_COVER", label: "CD / Album", ratio: "1:1", icon: "◉" },
  { key: "YOUTUBE", label: "YouTube", ratio: "16:9", icon: "▶" },
  { key: "TIKTOK", label: "TikTok / Reels", ratio: "9:16", icon: "↑" },
];

function parseCoverResult(text: string) {
  const result: Record<string, string> = {};
  for (const format of FORMATS) {
    const regex = new RegExp(`${format.key}:\\s*([\\s\\S]*?)(?=(?:CD_COVER:|YOUTUBE:|TIKTOK:|$))`, "i");
    const match = text.match(regex);
    if (match) result[format.key] = match[1].trim();
  }
  return result;
}

export default function CoverPanel({ title, genre, mood, theme, composition, compositionLoading, onResult }: CoverPanelProps) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("CD_COVER");

  const isDisabled = loading || !composition || compositionLoading;

  async function generate() {
    setLoading(true); setResult(""); onResult("");
    try {
      const res = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, mood, theme, composition }),
      });
      if (!res.ok || !res.body) { setLoading(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setLoading(false);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setResult(acc); onResult(acc);
      }
    } catch { setLoading(false); }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function downloadTXT() {
    const parsed = parseCoverResult(result);
    const text = FORMATS.filter(f => parsed[f.key]).map(f => `${f.label} (${f.ratio})\n${"─".repeat(40)}\n${parsed[f.key]}`).join("\n\n");
    exportTXT(`${title || "cover-prompts"}-cover`, text);
  }

  const parsed = parseCoverResult(result);

  return (
    <div style={{ background: "#141414", borderRight: "1px solid #2a2a2a", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "16px", borderBottom: "1px solid #2a2a2a" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#505050", textTransform: "uppercase", marginBottom: "4px" }}>Cover Art</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#f0f0f0" }}>Image Prompts</div>
      </div>

      {/* Format selector */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #2a2a2a" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "#505050", textTransform: "uppercase", marginBottom: "8px" }}>Format</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {FORMATS.map(f => (
            <div
              key={f.key}
              onClick={() => setSelectedFormat(f.key)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: selectedFormat === f.key ? "rgba(224,224,224,0.06)" : "transparent", border: `1px solid ${selectedFormat === f.key ? "#555" : "#2a2a2a"}`, borderRadius: "6px", cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: `2px solid ${selectedFormat === f.key ? "#e0e0e0" : "#404040"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {selectedFormat === f.key && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e0e0e0" }} />}
                </div>
                <span style={{ fontSize: "12px", color: selectedFormat === f.key ? "#f0f0f0" : "#606060" }}>{f.label}</span>
              </div>
              <span style={{ fontSize: "10px", color: "#505050", fontFamily: "'DM Mono', monospace" }}>{f.ratio}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Prompts */}
      <div style={{ padding: "12px 16px 6px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "#505050", textTransform: "uppercase" }}>Generated Prompts</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "6px 16px 12px" }}>
        {loading && <div style={{ color: "#606060", fontSize: "12px", textAlign: "center", paddingTop: "24px" }}><span style={{ color: "#e0e0e0" }}>●</span> Generating prompts...</div>}
        {!loading && !result && (
          <div style={{ color: "#505050", fontSize: "11px", fontStyle: "italic", paddingTop: "8px" }}>
            {compositionLoading ? "Waiting for composition..." : !composition ? "Generate a composition first" : "Ready to generate"}
          </div>
        )}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {FORMATS.map(f => parsed[f.key] ? (
              <div key={f.key} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #2a2a2a", background: "#141414" }}>
                  <span style={{ fontSize: "10px", color: "#a0a0a0", letterSpacing: "0.08em", textTransform: "uppercase" }}>{f.label} · {f.ratio}</span>
                  <button onClick={() => copy(parsed[f.key], f.key)} style={{ fontSize: "10px", color: copied === f.key ? "#e0e0e0" : "#f0f0f0", background: "transparent", border: "1px solid #555", borderRadius: "4px", padding: "2px 8px", cursor: "pointer" }}>
                    {copied === f.key ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <div style={{ padding: "10px 12px", fontSize: "12px", color: "#a0a0a0", lineHeight: "1.6", fontFamily: "'DM Mono', monospace" }}>{parsed[f.key]}</div>
              </div>
            ) : null)}
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a2a", display: "flex", gap: "6px" }}>
        {result && (
          <button onClick={downloadTXT} style={{ padding: "10px 12px", background: "transparent", border: "1px solid #555", borderRadius: "6px", color: "#f0f0f0", fontSize: "11px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>TXT ↓</button>
        )}
        <button onClick={generate} disabled={isDisabled} style={{ flex: 1, padding: "10px", background: isDisabled ? "#1a1a1a" : "rgba(224,224,224,0.08)", border: `1px solid ${isDisabled ? "#2a2a2a" : "#555"}`, borderRadius: "6px", color: isDisabled ? "#404040" : "#e0e0e0", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: isDisabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
          {loading ? "Generating..." : compositionLoading ? "Waiting..." : !composition ? "Generate composition first" : "Generate Cover Prompts ↗"}
        </button>
      </div>
    </div>
  );
}