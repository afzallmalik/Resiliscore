import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resiliscore – Cyber Resilience Maturity for SMEs",
  description:
    "Cyber resilience maturity assessment for SMEs. Identify risk, prioritise improvements, and generate a clear resilience report in minutes.",
  openGraph: {
    title: "Resiliscore – Cyber Resilience Maturity for SMEs",
    description:
      "Cyber resilience maturity assessment for SMEs. Identify risk, prioritise improvements, and generate a clear resilience report in minutes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="siteHeader">
          <div className="siteHeaderInner">
            <Link href="/" className="siteBrand" aria-label="Resiliscore home">
              <Image
                src="/resiliscore-logo.png"
                alt="Resiliscore"
                width={220}
                height={44}
                priority
                style={{ height: 34, width: "auto" }}
              />
            </Link>

            <nav className="siteNav" aria-label="Primary">
              <Link href="/methodology" className="siteNavLink">
                Methodology
              </Link>
              <Link href="/privacy" className="siteNavLink">
                Privacy
              </Link>
              <Link href="/terms" className="siteNavLink">
                Terms
              </Link>
              <Link href="/assessment" className="siteHeaderCta">
                Take free assessment
              </Link>
            </nav>
          </div>
        </header>

        <div className="sitePageWrap">{children}</div>
      </body>
    </html>
  );
}
