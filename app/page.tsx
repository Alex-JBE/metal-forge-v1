"use client";

import { useMemo, useState } from "react";

type ForgeMode = "both" | "lyrics" | "music";

type ForgeInputs = {
  mode: ForgeMode;
  subgenre: string;
  mood: string;
  theme: string;
  language: string;
  intensity: string;
  structure: string;
  creativeDirection: string;
};

type ForgeResult = {
  title: string;
  lyrics: string;
  musicPrompt: string;
};

type FieldOption = {
  label: string;
  value: string;
};

type FieldConfig = {
  key: keyof ForgeInputs;
  label: string;
  placeholder: string;
  options: FieldOption[];
};

const lyricFormFields: FieldConfig[] = [
  {
    key: "subgenre",
    label: "Subgenre",
    placeholder: "Enter subgenre",
    options: [
      { label: "Industrial Metal", value: "Industrial Metal" },
      { label: "Metalcore", value: "Metalcore" },
      { label: "Doom Metal", value: "Doom Metal" },
      { label: "Black Metal", value: "Black Metal" },
      { label: "Deathcore", value: "Deathcore" },
    ],
  },
  {
    key: "mood",
    label: "Mood",
    placeholder: "Enter mood",
    options: [
      { label: "Brooding", value: "Brooding" },
      { label: "Violent", value: "Violent" },
      { label: "Triumphant", value: "Triumphant" },
      { label: "Despairing", value: "Despairing" },
      { label: "Apocalyptic", value: "Apocalyptic" },
    ],
  },
  {
    key: "theme",
    label: "Theme",
    placeholder: "Enter theme",
    options: [
      { label: "Ash", value: "Ash" },
      { label: "Betrayal", value: "Betrayal" },
      { label: "Machine ruin", value: "Machine ruin" },
      { label: "Collapse", value: "Collapse" },
      { label: "Revenge", value: "Revenge" },
    ],
  },
  {
    key: "language",
    label: "Language",
    placeholder: "Enter language",
    options: [
      { label: "English", value: "English" },
      { label: "German", value: "German" },
      { label: "Spanish", value: "Spanish" },
      { label: "French", value: "French" },
      { label: "Italian", value: "Italian" },
      { label: "Portuguese", value: "Portuguese" },
      { label: "Russian", value: "Russian" },
      { label: "Japanese", value: "Japanese" },
    ],
  },
  {
    key: "intensity",
    label: "Intensity",
    placeholder: "Select intensity",
    options: [
      { label: "Low", value: "Low" },
      { label: "Medium", value: "Medium" },
      { label: "High", value: "High" },
      { label: "Extreme", value: "Extreme" },
      { label: "Crushing", value: "Crushing" },
    ],
  },
  {
    key: "structure",
    label: "Structure",
    placeholder: "Select structure",
    options: [
      {
        label: "Verse / Chorus / Verse / Bridge / Outro",
        value: "Verse / Chorus / Verse / Bridge / Outro",
      },
      {
        label: "Intro / Verse / Chorus / Verse / Chorus / Outro",
        value: "Intro / Verse / Chorus / Verse / Chorus / Outro",
      },
      {
        label: "Intro / Verse / Pre-Chorus / Chorus / Breakdown / Outro",
        value: "Intro / Verse / Pre-Chorus / Chorus / Breakdown / Outro",
      },
      {
        label: "Verse / Chorus / Verse / Chorus / Breakdown / Final Chorus",
        value: "Verse / Chorus / Verse / Chorus / Breakdown / Final Chorus",
      },
      {
        label: "Intro / Build / Chorus / Breakdown / Chorus / Outro",
        value: "Intro / Build / Chorus / Breakdown / Chorus / Outro",
      },
    ],
  },
];

const initialInputs: ForgeInputs = {
  mode: "both",
  subgenre: "Industrial Metal / Metalcore / Doom",
  mood: "Brooding, violent, triumphant",
  theme: "Ash, betrayal, machine ruin",
  language: "English",
  intensity: "High",
  structure: "Verse / Chorus / Verse / Bridge / Outro",
  creativeDirection:
    "Write with strong physical imagery, a huge chorus, and modern heavy production energy.",
};

const demoResult: ForgeResult = {
  title: "Architects of the Ashfall",
  lyrics: `[VERSE 1]
Smoke in the rafters, iron in my lungs
We built our vows where the furnace tongues
Licked at the bones of a faith gone thin
And taught the wolves how to wear our skin

[CHORUS]
We are the architects of the ashfall
Crowned in the sparks of a dead withdrawal
Hammer the night till the black veins ring
Out of the fire, let the endtime sing

[VERSE 2]
Teeth in the static, names in the wire
Hands full of ruin and borrowed fire
Every promise a blade half-drawn
Every saint just rust by dawn`,
  musicPrompt: `Industrial metal with metalcore momentum, 148 BPM.
Cold mechanical intro, drop-C guitars, sharp gated snare,
massive halftime chorus, aggressive shouted vocals with a
melodic hook layer, dense sub bass, sparks-and-smoke atmosphere,
modern wide production, dramatic breakdown before final chorus.`,
};

const STYLE_OPTIONS = [
  "Industrial Metal",
  "Metalcore",
  "Deathcore",
  "Doom Metal",
  "Black Metal",
  "Post-Metal",
  "Sludge Metal",
  "Groove Metal",
  "Nu Metal",
  "Symphonic Metal",
  "Progressive Metal",
  "Thrash Metal",
  "Death Metal",
  "Alternative Metal",
  "Djenty",
  "Cinematic",
  "Apocalyptic",
  "Melancholic",
  "Aggressive",
  "Ritualistic",
  "Mechanical",
  "Cold",
  "Epic",
  "Raw",
  "Atmospheric",
  "Punishing",
  "Dark",
  "Massive Chorus",
  "Breakdown Heavy",
  "Synth-Driven",
  "Orchestral",
  "Arena-Ready",
  "Haunting",
  "Gritty",
  "Militant",
  "Futuristic",
  "Desolate",
  "Violent",
  "Minimal",
  "Chaotic",
  "Hypnotic",
  "Monolithic",
  "High Energy",
  "Slow Crush",
  "Stomping",
  "Ghostly",
  "Riff-Focused",
  "Hook-Focused",
  "Percussive",
  "Modern",
  "Old School",
  "Cybernetic",
  "Infernal",
  "Ashen",
  "Cathedral",
  "Blade Runner",
  "Warlike",
  "Noir",
  "Emotional",
  "Bleak",
  "Crushing",
  "Burning",
  "Stormy",
  "Urban Decay",
  "Rust and Fire",
  "Machine Ruin",
  "Post-Apocalypse",
  "Mythic",
  "Theatrical",
  "Anti-Hero",
  "Terminal Collapse",
  "Night Drive",
  "Heavy Pop Edge",
  "Arena Doom",
];

const DIRECTION_IDEAS = [
  "Write with huge visual imagery, sharp internal tension, and a massive chantable chorus.",
  "Blend mechanical coldness with emotional collapse; make the hook feel unforgettable and heavy.",
  "Focus on apocalyptic city imagery, strong rhythmic phrasing, and a dramatic final section.",
  "Use dark cinematic tension, violent momentum, and a hook that feels arena-sized.",
  "Keep it bleak, modern, and aggressive with memorable repetition and physical language.",
  "Write like the world is ending slowly: smoke, steel, grief, pressure, and triumph.",
];

export default function Home() {
  const [inputs, setInputs] = useState<ForgeInputs>(initialInputs);
  const [result, setResult] = useState<ForgeResult>(demoResult);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "Industrial Metal",
    "Metalcore",
    "Cinematic",
  ]);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [styleSearch, setStyleSearch] = useState("");

  const [openDropdown, setOpenDropdown] = useState<keyof ForgeInputs | null>(
    null
  );

  const updateField = (field: keyof ForgeInputs, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const activeOutputLabel = useMemo(() => {
    if (inputs.mode === "lyrics") return "Lyrics only";
    if (inputs.mode === "music") return "Music prompt only";
    return "Lyrics + music prompt";
  }, [inputs.mode]);

  const handleForge = async () => {
    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    const generatedTitle =
      inputs.theme.trim().length > 0
        ? `Forged from ${inputs.theme.trim()}`
        : "Forged in the Static";

    const generatedLyrics = `[VERSE 1]
${inputs.theme || "Ash"} in the marrow, smoke in the rain
Built from the pressure, tempered by pain
Language: ${inputs.language}
Mood: ${inputs.mood}

[CHORUS]
We rise in the furnace, we carry the sound
Strike the dark iron and shake the ground
Subgenre: ${inputs.subgenre}
Intensity: ${inputs.intensity}

[VERSE 2]
Structure carved in sparks and wire
Every cut feeds the engine fire
Direction: ${inputs.creativeDirection || "No extra direction given"}`;

    const generatedMusicPrompt = `${inputs.subgenre}, ${inputs.intensity.toLowerCase()} intensity, ${inputs.mood.toLowerCase()} emotional tone. Language focus: ${inputs.language}. Song structure: ${inputs.structure}. Creative direction: ${
      inputs.creativeDirection || "none provided"
    }. Selected style cues: ${
      selectedStyles.length ? selectedStyles.join(", ") : "none"
    }. Build a modern heavy arrangement with a dramatic chorus, dense low end, strong rhythmic identity, and cinematic transitions.`;

    setResult({
      title: generatedTitle,
      lyrics: generatedLyrics,
      musicPrompt: generatedMusicPrompt,
    });

    setHasGenerated(true);
    setIsGenerating(false);
  };

  const filteredStyles = useMemo(() => {
    const q = styleSearch.trim().toLowerCase();
    if (!q) return STYLE_OPTIONS;
    return STYLE_OPTIONS.filter((style) =>
      style.toLowerCase().includes(q)
    );
  }, [styleSearch]);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((item) => item !== style)
        : [...prev, style]
    );
  };

  const generateCreativeDirection = () => {
    const random =
      DIRECTION_IDEAS[Math.floor(Math.random() * DIRECTION_IDEAS.length)];
    const stylesText =
      selectedStyles.length > 0
        ? ` Style cues: ${selectedStyles.join(", ")}.`
        : "";

    updateField("creativeDirection", `${random}${stylesText}`);
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "metal-forge-output";

  const saveBlob = async (blob: Blob, suggestedName: string) => {
    try {
      const anyWindow = window as Window & {
        showSaveFilePicker?: (options?: unknown) => Promise<any>;
      };

      if (anyWindow.showSaveFilePicker) {
        const extension = suggestedName.includes(".")
          ? suggestedName.slice(suggestedName.lastIndexOf("."))
          : ".txt";

        const handle = await anyWindow.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: "File",
              accept: {
                [blob.type || "application/octet-stream"]: [extension],
              },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSaveFull = async () => {
    const text = [
      `Title: ${result.title}`,
      "",
      inputs.mode !== "music" ? `Lyrics:\n${result.lyrics}` : "",
      inputs.mode !== "lyrics"
        ? `Music Prompt:\n${result.musicPrompt}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    await saveBlob(blob, `${slugify(result.title)}.txt`);
  };

  const handleSavePdf = async () => {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginX = 48;
    const marginTop = 56;
    const marginBottom = 56;
    const contentWidth = pageWidth - marginX * 2;

    let y = marginTop;

    const ensureSpace = (needed = 24) => {
      if (y + needed > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
      }
    };

    const addWrappedText = (
      text: string,
      fontSize = 12,
      lineHeight = 18
    ) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(20, 20, 20);

      const paragraphs = text.split("\n");

      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
          y += lineHeight * 0.7;
          ensureSpace(lineHeight);
          continue;
        }

        const lines = doc.splitTextToSize(paragraph, contentWidth);

        for (const line of lines) {
          ensureSpace(lineHeight);
          doc.text(line, marginX, y);
          y += lineHeight;
        }
      }
    };

    const addSectionTitle = (text: string) => {
      ensureSpace(32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 15, 15);
      doc.text(text, marginX, y);
      y += 18;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 15, 15);
    doc.text(result.title, marginX, y);
    y += 26;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.7);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 24;

    if (inputs.mode !== "music") {
      addSectionTitle("Lyrics");
      addWrappedText(result.lyrics, 12, 18);
      y += 16;
    }

    if (inputs.mode !== "lyrics") {
      addSectionTitle("Music Prompt");
      addWrappedText(result.musicPrompt, 12, 18);
    }

    doc.save(`${slugify(result.title)}.pdf`);
  };

  const styleBrowseLabel = stylesOpen
    ? "Hide styles"
    : `Browse styles${selectedStyles.length ? ` (${selectedStyles.length})` : ""}`;

  return (
    <div className="mf-grid">
      <section className="mf-panel">
        <div className="mf-panel-inner">
          <div className="mf-section-label">Control deck</div>

          <h1 className="mf-hero-title">Forge your next heavy track</h1>

          <p className="mf-hero-copy">
            Shape subgenre, mood, structure, and output mode. Generate
            lyrics, music prompts, or both from one cinematic control
            surface.
          </p>

          <div className="mf-status-row">
            <span className="mf-status-pill">Mode: {activeOutputLabel}</span>
            <span className="mf-status-pill">Ready for live generation</span>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <div className="mf-section-label">Output mode</div>
              <div className="mf-segment-row">
                <button
                  className={`mf-segment-button ${
                    inputs.mode === "both"
                      ? "mf-segment-button-active"
                      : ""
                  }`}
                  onClick={() => updateField("mode", "both")}
                  type="button"
                >
                  Both
                </button>
                <button
                  className={`mf-segment-button ${
                    inputs.mode === "lyrics"
                      ? "mf-segment-button-active"
                      : ""
                  }`}
                  onClick={() => updateField("mode", "lyrics")}
                  type="button"
                >
                  Lyrics
                </button>
                <button
                  className={`mf-segment-button ${
                    inputs.mode === "music"
                      ? "mf-segment-button-active"
                      : ""
                  }`}
                  onClick={() => updateField("mode", "music")}
                  type="button"
                >
                  Music
                </button>
              </div>
            </div>

            <hr className="mf-divider" />

            <div className="mf-form-grid">
              {lyricFormFields.map((field) => {
                const isOpen = openDropdown === field.key;

                return (
                  <div className="mf-field" key={field.key}>
                    <span className="mf-field-label">{field.label}</span>

                    <div className="mf-combobox">
                      <input
                        type="text"
                        className="mf-input"
                        value={inputs[field.key]}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                      <button
                        type="button"
                        className="mf-combobox-trigger"
                        aria-label={`Show ${field.label} options`}
                        onClick={() =>
                          setOpenDropdown((prev) =>
                            prev === field.key ? null : field.key
                          )
                        }
                      ></button>

                      {isOpen && (
                        <div className="mf-combobox-menu">
                          {field.options.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className="mf-combobox-option"
                              onClick={() => {
                                updateField(field.key, option.value);
                                setOpenDropdown(null);
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <hr className="mf-divider" />

            <div style={{ display: "grid", gap: "14px" }}>
              <div className="mf-field">
                <span className="mf-field-label">Style palette</span>

                <button
                  className="mf-secondary-button"
                  type="button"
                  onClick={() => setStylesOpen((prev) => !prev)}
                >
                  {styleBrowseLabel}
                </button>

                {stylesOpen && (
                  <div className="mf-style-picker">
                    <input
                      className="mf-input"
                      value={styleSearch}
                      onChange={(e) => setStyleSearch(e.target.value)}
                      placeholder="Search styles..."
                    />

                    <div className="mf-style-list">
                      {filteredStyles.map((style) => {
                        const active = selectedStyles.includes(style);

                        return (
                          <button
                            key={style}
                            type="button"
                            className={`mf-style-option ${
                              active ? "mf-style-option-active" : ""
                            }`}
                            onClick={() => toggleStyle(style)}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedStyles.length > 0 && (
                  <div className="mf-selected-styles">
                    {selectedStyles.map((style) => (
                      <span key={style} className="mf-chip">
                        {style}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <label className="mf-field">
                <span className="mf-field-label">Creative direction</span>
                <textarea
                  className="mf-textarea"
                  value={inputs.creativeDirection}
                  onChange={(e) =>
                    updateField("creativeDirection", e.target.value)
                  }
                  placeholder="Optional. Leave empty or click Inspire me."
                />
              </label>

              <div className="mf-action-row">
                <button
                  className="mf-secondary-button"
                  type="button"
                  onClick={generateCreativeDirection}
                >
                  Inspire me
                </button>

                {inputs.creativeDirection.trim().length > 0 && (
                  <button
                    className="mf-mini-button"
                    type="button"
                    onClick={() => updateField("creativeDirection", "")}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="mf-action-row">
              <button
                className="mf-primary-button"
                type="button"
                onClick={handleForge}
                disabled={isGenerating}
              >
                {isGenerating ? "Forging..." : "Forge output"}
              </button>

              <button
                className="mf-secondary-button"
                type="button"
                disabled={!hasGenerated || isGenerating}
              >
                Refine lyrics
              </button>

              <button
                className="mf-secondary-button"
                type="button"
                disabled={!hasGenerated || isGenerating}
              >
                Regenerate prompt
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mf-panel">
        <div className="mf-panel-inner">
          <div className="mf-section-label">Output</div>

          <div className="mf-output-block">
            <div className="mf-output-head">
              <span className="mf-output-title">Title</span>
              <button
                className="mf-mini-button"
                type="button"
                onClick={() => navigator.clipboard.writeText(result.title)}
              >
                Copy
              </button>
            </div>
            <div className="mf-output-value mf-output-title-value">
              {result.title}
            </div>
          </div>

          {inputs.mode !== "music" && (
            <div className="mf-output-block">
              <div className="mf-output-head">
                <span className="mf-output-title">Lyrics</span>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="mf-mini-button"
                    type="button"
                    onClick={() => navigator.clipboard.writeText(result.lyrics)}
                  >
                    Copy lyrics
                  </button>
                  <button
                    className="mf-mini-button"
                    type="button"
                    onClick={handleSaveFull}
                  >
                    Save full
                  </button>
                  <button
                    className="mf-mini-button"
                    type="button"
                    onClick={handleSavePdf}
                  >
                    Export PDF
                  </button>
                </div>
              </div>

              <div className="mf-output-scroll">
                <pre className="mf-output-pre">{result.lyrics}</pre>
              </div>
            </div>
          )}

          {inputs.mode !== "lyrics" && (
            <div className="mf-output-block">
              <div className="mf-output-head">
                <span className="mf-output-title">Music prompt</span>
                <button
                  className="mf-mini-button"
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(result.musicPrompt)
                  }
                >
                  Copy prompt
                </button>
              </div>

              <div className="mf-output-scroll">
                <pre className="mf-output-pre">{result.musicPrompt}</pre>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}