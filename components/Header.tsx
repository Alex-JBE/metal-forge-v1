"use client";
import { useState } from "react";
import { exportAllTXT, exportAllPDF } from "@/lib/export";

interface HeaderProps {
  title: string;
  composition: string;
  coverResult: string;
  videoResult: string;
  onClear: () => void;
}

export default function Header({ title, composition, coverResult, videoResult, onClear }: HeaderProps) {
  const hasContent = composition || coverResult || videoResult;

  return (
    <header style={{
      background: "#0d0a0a",
      borderBottom: "1px solid #2a1010",
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
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #991b1b, #450a0a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fca5a5" }}>🤘</div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 600, color: "#f0e8e8", letterSpacing: "0.02em" }}>METAL FORGE</div>
          <div style={{ fontSize: "10px", color: "#7f1d1d", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "-2px" }}>AI Composition Suite</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {hasContent && (
          <>
            <button onClick={onClear} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #3a1010", borderRadius: "6px", color: "#9a8080", fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
              New Track
            </button>
            <button onClick={() => exportAllTXT(title, composition, coverResult, videoResult)} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #9a8080", borderRadius: "6px", color: "#f0e8e8", fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
              Export All TXT
            </button>
            <button onClick={() => exportAllPDF(title, composition, coverResult, videoResult)} style={{ padding: "6px 14px", background: "rgba(220,38,38,0.15)", border: "1px solid #991b1b", borderRadius: "6px", color: "#fca5a5", fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
              Export All PDF
            </button>
          </>
        )}
        {["Docs", "GitHub"].map(label => (
          <button key={label} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #2a1010", borderRadius: "6px", color: "#9a8080", fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}