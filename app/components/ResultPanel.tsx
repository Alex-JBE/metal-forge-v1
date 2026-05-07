"use client";

import { useState, useEffect } from "react";
import { exportTXT, exportPDF } from "@/lib/export";

interface ResultPanelProps {
  result: string;
  loading: boolean;
  isStreaming: boolean;
}

function extractSections(text: string) {
  const sections: Record<string, string> = {};
  const sectionOrder: string[] = [];
  const lines = text.split("\n");
  let current = "composition";
  let buffer: string[] = [];
  sectionOrder.push("composition");

  for (const line of lines) {
    const trimmed = line.trim();
    const isLyrics = /\[LYRICS/i.test(trimmed) || /^LYRICS[\s\-:]/i.test(trimmed);
    const isMusicPrompt = /^MUSIC PROMPT[\s\-:]/i.test(trimmed);
    const isArrangement = /^ARRANGEMENT[\s\-:]/i.test(trimmed);

    if (isLyrics) {
      sections[current] = buffer.join("\n").trim(); buffer = []; current = "lyrics";
      if (!sectionOrder.includes("lyrics")) sectionOrder.push("lyrics");
      continue;
    }
    if (isMusicPrompt) {
      sections[current] = buffer.join("\n").trim(); buffer = []; current = "musicPrompt";
      if (!sectionOrder.includes("musicPrompt")) sectionOrder.push("musicPrompt");
      continue;
    }
    if (isArrangement) {
      sections[current] = buffer.join("\n").trim(); buffer = []; current = "arrangement";
      if (!sectionOrder.includes("arrangement")) sectionOrder.push("arrangement");
      continue;
    }
    buffer.push(line);
  }
  sections[current] = buffer.join("\n").trim();
  return { sections, sectionOrder };
}

const SECTION_LABELS: Record<string, string> = {
  composition: "Composition",
  lyrics: "Lyrics",
  musicPrompt: "Music Prompt",
  arrangement: "Arrangement",
};

function SectionBlock({ label, sectionKey, content, onRefine }: {
  label: string; sectionKey: string; content: string;
  onRefine: (key: string, newContent: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showRefine, setShowRefine] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [refining, setRefining] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => { setLocalContent(content); }, [content]);

  async function handleRefine() {
    if (!instruction.trim()) return;
    setRefining(true); setLocalContent("");
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: label, content, instruction }),
      });
      if (!res.ok || !res.body) { setRefining(false); setLocalContent(content); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setLocalContent(acc);
      }
      onRefine(sectionKey, acc);
      setInstruction(""); setShowRefine(false);
    } catch { setLocalContent(content); }
    finally { setRefining(false); }
  }

  return (
    <div style={{ border: "1px solid #2a2a2a", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#141414", borderBottom: "1px solid #2a2a2a" }}>
        <span style={{ fontSize: "10px", fontWeight: 500, color: "#808080", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setShowRefine(!showRefine)} style={{ fontSize: "11px", color: showRefine ? "#e0e0e0" : "#606060", background: showRefine ? "rgba(224,224,224,0.08)" : "transparent", border: `1px solid ${showRefine ? "#555" : "#2a2a2a"}`, borderRadius: "4px", padding: "3px 8px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Refine</button>
          <button onClick={() => { navigator.clipboard.writeText(localContent); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ fontSize: "11px", color: copied ? "#e0e0e0" : "#f0f0f0", background: "transparent", border: "1px solid #555", borderRadius: "4px", padding: "3px 8px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{copied ? "Copied ✓" : "Copy"}</button>
        </div>
      </div>

      {showRefine && (
        <div style={{ padding: "10px 14px", background: "#111", borderBottom: "1px solid #2a2a2a", display: "flex", gap: "8px", alignItems: "center" }}>
          <input type="text" value={instruction} onChange={e => setInstruction(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRefine()}
            placeholder="e.g. make it heavier, add a breakdown, rewrite in doom style..." disabled={refining}
            style={{ flex: 1, padding: "6px 10px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#f0f0f0", fontSize: "12px", outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
          <button onClick={handleRefine} disabled={refining || !instruction.trim()} style={{ padding: "6px 14px", background: refining || !instruction.trim() ? "#1a1a1a" : "#e0e0e0", border: "none", borderRadius: "6px", color: refining || !instruction.trim() ? "#404040" : "#0f0f0f", fontSize: "12px", fontWeight: 600, cursor: refining || !instruction.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
            {refining ? "Refining..." : "Apply ↗"}
          </button>
        </div>
      )}

      <div style={{ padding: "14px", background: "#1a1a1a" }}>
        {localContent.split("\n").map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "---" || trimmed === "***") return <div key={i} style={{ height: "6px" }} />;
          if (/^\[.+\]$/.test(trimmed)) return <div key={i} style={{ fontSize: "10px", fontWeight: 500, color: "#808080", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "12px", marginBottom: "4px" }}>{trimmed.replace(/[\[\]]/g, "")}</div>;
          if (/^(TITLE|KEY|TEMPO|TUNING):/.test(trimmed)) return <p key={i} style={{ fontSize: "11px", color: "#606060", marginBottom: "2px", fontFamily: "'DM Mono', monospace" }}>{trimmed}</p>;
          if (trimmed.startsWith("#") || trimmed.startsWith("**")) return <p key={i} style={{ fontSize: "13px", fontWeight: 500, color: "#f0f0f0", marginTop: "8px", marginBottom: "2px" }}>{trimmed.replace(/^#+\s/, "").replace(/\*\*/g, "")}</p>;
          return <p key={i} style={{ fontSize: "13px", color: "#a0a0a0", lineHeight: "1.7" }}>{trimmed.replace(/^[-*]\s/, "").replace(/\*\*/g, "")}</p>;
        })}
      </div>
    </div>
  );
}

export default function ResultPanel({ result, loading, isStreaming }: ResultPanelProps) {
  const title = result.split("\n").find(l => /^#?\s*TITLE:/i.test(l))?.replace(/^#?\s*TITLE:/i, "").trim() || "metal-forge";
  const [refinedSections, setRefinedSections] = useState<Record<string, string>>({});

  useEffect(() => { if (!result) setRefinedSections({}); }, [result]);

  const rootStyle: React.CSSProperties = { height: "100%", overflow: "auto", display: "flex", flexDirection: "column" };

  if (loading) return (
    <div style={rootStyle}>
      <div style={{ margin: "16px", padding: "32px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#606060", fontSize: "13px" }}>
          <span style={{ color: "#e0e0e0" }}>●</span><span>●</span><span>●</span>
          <span style={{ marginLeft: "8px" }}>Forging...</span>
        </div>
      </div>
    </div>
  );

  if (!result) return (
    <div style={rootStyle}>
      <div style={{ margin: "16px", padding: "32px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "120px" }}>
        <p style={{ color: "#505050", fontSize: "13px", fontStyle: "italic" }}>Your composition will appear here...</p>
      </div>
    </div>
  );

  if (isStreaming) return (
    <div style={rootStyle}>
      <div style={{ padding: "16px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "16px", flex: 1, overflow: "auto" }}>
          <pre style={{ fontSize: "12px", color: "#a0a0a0", lineHeight: "1.7", whiteSpace: "pre-wrap", fontFamily: "'DM Mono', monospace", margin: 0 }}>{result}</pre>
        </div>
      </div>
    </div>
  );

  const { sections, sectionOrder } = extractSections(result);

  return (
    <div style={rootStyle}>
      {/* Download buttons above result — like Pop Forge */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", flexShrink: 0 }}>
        <button onClick={() => exportTXT(title, result)} style={{ fontSize: "11px", padding: "5px 12px", background: "transparent", border: "1px solid #555", borderRadius: "4px", color: "#f0f0f0", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>Download TXT</button>
        <button onClick={() => exportPDF(title, result)} style={{ fontSize: "11px", padding: "5px 12px", background: "#e0e0e0", border: "none", borderRadius: "4px", color: "#0f0f0f", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Download PDF</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {sectionOrder.map(key => {
          const content = refinedSections[key] || sections[key];
          return content ? <SectionBlock key={key} label={SECTION_LABELS[key] || key} sectionKey={key} content={content} onRefine={(k, v) => setRefinedSections(prev => ({ ...prev, [k]: v }))} /> : null;
        })}
      </div>
    </div>
  );
}