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
        {children}
      </body>
    </html>
  );
}