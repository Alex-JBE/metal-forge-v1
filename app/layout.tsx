import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metal Forge v1",
  description: "Heavy lyrics and music prompts forged to spec.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mf-root">
          <div className="mf-shell">
            <main className="mf-main">
              <div className="mf-inner">
                <header className="mf-header">
                  <div className="mf-header-left">
                    <div className="mf-logo-mark" />
                    <div className="mf-logo-text">
                      <span className="mf-logo-title">Metal Forge v1</span>
                      <span className="mf-logo-subtitle">
                        Heavy lyrics & music prompts
                      </span>
                    </div>
                  </div>

                  <div className="mf-header-actions">
                    <span className="mf-chip">Forge Studio</span>
                    <a
                      className="mf-ghost-button"
                      href="https://github.com/Alex-JBE/metal-forge-v1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </div>
                </header>

                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}