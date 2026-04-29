export type LyricFieldOption = {
  label: string;
  value: string;
};

export type LyricFormField = {
  key: string;
  label: string;
  placeholder: string;
  options: LyricFieldOption[];
};

export const lyricFormFields: LyricFormField[] = [
  {
    key: "subgenre",
    label: "Subgenre",
    placeholder: "Enter subgenre",
    options: [
      { label: "Boom bap", value: "Boom bap" },
      { label: "Trap", value: "Trap" },
      { label: "Drill", value: "Drill" },
      { label: "Grime", value: "Grime" },
      { label: "Conscious", value: "Conscious" },
    ],
  },
  {
    key: "mood",
    label: "Mood",
    placeholder: "Enter mood",
    options: [
      { label: "Aggressive", value: "Aggressive" },
      { label: "Dark", value: "Dark" },
      { label: "Melancholic", value: "Melancholic" },
      { label: "Triumphant", value: "Triumphant" },
      { label: "Reflective", value: "Reflective" },
    ],
  },
  {
    key: "theme",
    label: "Theme",
    placeholder: "Enter theme",
    options: [
      { label: "Street survival", value: "Street survival" },
      { label: "Ambition", value: "Ambition" },
      { label: "Betrayal", value: "Betrayal" },
      { label: "Pain", value: "Pain" },
      { label: "Victory", value: "Victory" },
    ],
  },
];