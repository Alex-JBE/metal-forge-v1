"use client";
import { exportAllTXT, exportAllPDF } from "@/lib/export";

interface HeaderProps {
  title: string;
  composition: string;
  coverResult: string;
  videoResult: string;
  onClear: () => void;
}

export default function Header({ title, composition, coverResult, videoResult, onClear }: HeaderProps) {
  const hasContent = !!(composition || coverResult || videoResult);

  return (
    <header style={{
      background: "#0f0f0f",
      borderBottom: "1px solid #2a2a2a",
      padding: "0 24px",
      height: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #333, #111)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#e0e0e0", border: "1px solid #444" }}>🤘</div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 600, color: "#f0f0f0", letterSpacing: "0.02em" }}>METAL FORGE</div>
          <div style={{ fontSize: "10px", color: "#505050", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "-2px" }}>AI Composition Suite</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button onClick={onClear} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #333", borderRadius: "6px", color: "#a0a0a0", fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
          New Track
        </button>
        {hasContent && composition && (
          <button style={{ padding: "6px 14px", background: "rgba(224,224,224,0.08)", border: "1px solid #555", borderRadius: "6px", color: "#e0e0e0", fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
            Suno ↗
          </button>
        )}
        <button onClick={() => exportAllTXT(title, composition, coverResult, videoResult)} disabled={!hasContent} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #555", borderRadius: "6px", color: hasContent ? "#f0f0f0" : "#404040", fontSize: "12px", cursor: hasContent ? "pointer" : "not-allowed", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
          Export TXT
        </button>
        <button onClick={() => exportAllPDF(title, composition, coverResult, videoResult)} disabled={!hasContent} style={{ padding: "6px 14px", background: hasContent ? "#e0e0e0" : "#1a1a1a", border: "none", borderRadius: "6px", color: hasContent ? "#0f0f0f" : "#404040", fontSize: "12px", cursor: hasContent ? "pointer" : "not-allowed", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          Export PDF
        </button>
      </div>
    </header>
  );
}