export function exportTXT(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(filename: string, content: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8; color: #111; }
          h1 { font-size: 22px; margin-bottom: 24px; }
          pre { white-space: pre-wrap; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${filename}</h1>
        <pre>${content}</pre>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}

export function exportAllTXT(title: string, composition: string, coverResult: string, videoResult: string) {
  const parts: string[] = [];
  if (composition) parts.push(`COMPOSITION\n${"─".repeat(40)}\n${composition}`);
  if (coverResult) parts.push(`COVER ART PROMPTS\n${"─".repeat(40)}\n${coverResult}`);
  if (videoResult) parts.push(`VIDEO SCRIPT\n${"─".repeat(40)}\n${videoResult}`);
  exportTXT(title || "metal-forge", parts.join("\n\n"));
}

export function exportAllPDF(title: string, composition: string, coverResult: string, videoResult: string) {
  const parts: string[] = [];
  if (composition) parts.push(`COMPOSITION\n${"─".repeat(40)}\n${composition}`);
  if (coverResult) parts.push(`COVER ART PROMPTS\n${"─".repeat(40)}\n${coverResult}`);
  if (videoResult) parts.push(`VIDEO SCRIPT\n${"─".repeat(40)}\n${videoResult}`);
  exportPDF(title || "metal-forge", parts.join("\n\n"));
}