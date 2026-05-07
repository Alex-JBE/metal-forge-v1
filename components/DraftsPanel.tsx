"use client";
import { Draft } from "@/lib/useDrafts";

interface DraftsPanelProps {
  drafts: Draft[];
  onLoad: (draft: Draft) => void;
  onDelete: (id: string) => void;
  onStar: (id: string) => void;
}

export default function DraftsPanel({ drafts, onLoad, onDelete, onStar }: DraftsPanelProps) {
  const starred = drafts.filter(d => d.starred);
  const recent = drafts.filter(d => !d.starred);

  if (drafts.length === 0) {
    return (
      <div style={{ padding: "12px 16px" }}>
        <p style={{ fontSize: "12px", color: "#6A2020", fontStyle: "italic" }}>No saved drafts yet</p>
      </div>
    );
  }

  function DraftItem({ draft }: { draft: Draft }) {
    return (
      <div
        onClick={() => onLoad(draft)}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px", padding: "6px 8px", borderRadius: "6px", cursor: "pointer", transition: "background 0.1s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#1A0A0A")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#C8B8B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {draft.title}
          </div>
          <div style={{ fontSize: "11px", color: "#6A2020", marginTop: "2px" }}>
            {draft.genres.join(" + ")} · {draft.createdAt}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginTop: "2px" }}>
          <button onClick={e => { e.stopPropagation(); onStar(draft.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: draft.starred ? "#dc2626" : "#5A3030", padding: "0", lineHeight: 1 }}>★</button>
          <button onClick={e => { e.stopPropagation(); onDelete(draft.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#5A3030", padding: "0", lineHeight: 1 }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = "#FF6B6B")}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = "#5A3030")}
          >✕</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {starred.length > 0 && (
        <>
          <div style={{ fontSize: "9px", color: "#dc2626", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 16px 2px", fontWeight: 600 }}>★ Starred</div>
          <div style={{ padding: "0 8px" }}>{starred.map(d => <DraftItem key={d.id} draft={d} />)}</div>
          {recent.length > 0 && <div style={{ fontSize: "9px", color: "#6A2020", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px 2px", fontWeight: 600 }}>Recent</div>}
        </>
      )}
      <div style={{ padding: "0 8px" }}>{recent.map(d => <DraftItem key={d.id} draft={d} />)}</div>
    </div>
  );
}