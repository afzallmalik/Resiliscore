"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = { href: string; label: string; cta?: boolean };

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/methodology", label: "Methodology" },
      { href: "/resources", label: "Resources" },
      { href: "/about", label: "About" },
      { href: "/assessment", label: "Start Assessment", cta: true },
    ],
    []
  );

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="nav" aria-label="Primary">
      <div className="nav-left">
        <div className="logo">
          <Link href="/" onClick={() => setOpen(false)}>
            RESILISCORE
          </Link>
        </div>

        <div className="nav-links desktop">
          {items.map((it) =>
            it.cta ? (
              <Link key={it.href} href={it.href} className="btn-primary">
                {it.label}
              </Link>
            ) : (
              <Link key={it.href} href={it.href} className={isActive(it.href) ? "nav-active" : ""}>
                {it.label}
              </Link>
            )
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Menu"
        className="menu-btn mobile"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <div className="mobile-menu mobile" role="menu">
          {items.map((it) =>
            it.cta ? (
              <Link key={it.href} href={it.href} className="btn-primary" onClick={() => setOpen(false)}>
                {it.label}
              </Link>
            ) : (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={isActive(it.href) ? "nav-active" : ""}
              >
                {it.label}
              </Link>
            )
          )}

          <div className="mobile-legal">
            <Link href="/privacy" onClick={() => setOpen(false)}>
              Privacy
            </Link>
            <Link href="/terms" onClick={() => setOpen(false)}>
              Terms
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}