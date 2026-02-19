import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resiliscore – Cyber Resilience Maturity Assessment",
  description: "Free, framework-aligned cyber resilience maturity diagnostic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/assessment">Start Assessment</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
