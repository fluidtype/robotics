"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode, type SVGProps } from "react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: OverviewIcon },
  { href: "/news", label: "News", icon: NewsIcon },
  { href: "/companies", label: "Companies", icon: CompaniesIcon },
  { href: "/crypto", label: "Crypto Robotics", icon: CryptoIcon },
  { href: "/agent", label: "Agent", icon: AgentIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 text-sm text-secondary">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
        return (
          <Link
            key={label}
            href={href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
              "hover:bg-bg-base/60 hover:text-primary",
              isActive ? "text-accent" : "text-secondary",
            )}
          >
            <span className="relative flex w-full items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  "absolute -left-3 h-full w-1 rounded-full bg-transparent",
                  isActive && "bg-accent",
                )}
              />
              <Icon className={cn("h-[18px] w-[18px] text-accent-secondary", isActive && "text-accent")} />
              <span className="text-sm font-medium">{label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-bg-base text-primary">
      <aside className="hidden w-60 flex-col border-r border-border-subtle bg-bg-elevated/60 px-4 py-6 lg:flex">
        <div className="mb-8 space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-accent-secondary">r0r4x</p>
          <p className="text-lg font-semibold text-primary">Intelligence Hub</p>
          <p className="text-xs text-secondary">Realtime robotics command</p>
        </div>
        {nav}
      </aside>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-subtle bg-bg-elevated/90 px-4 py-6 shadow-2xl lg:hidden">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-accent-secondary">r0r4x</p>
                <p className="text-lg font-semibold text-primary">Intelligence Hub</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full border border-border-subtle p-2 text-secondary">
                <span className="sr-only">Close menu</span>
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            {nav}
          </div>
        </>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/85 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <div className="flex flex-1 items-center gap-3 lg:flex-none">
              <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-border-subtle p-2 text-secondary transition hover:text-primary lg:hidden"
              >
                <span className="sr-only">Open menu</span>
                <MenuIcon className="h-4 w-4" />
              </button>
              <div className="space-y-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-accent-secondary">
                  Command Center
                </span>
                <p className="text-xl font-semibold text-primary md:text-2xl">Robotics Intelligence Hub</p>
              </div>
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:flex-nowrap">
              <div className="w-full min-w-[220px] flex-1 sm:w-72">
                <input
                  type="search"
                  placeholder="Search robotics, companies, tokens…"
                  className="w-full rounded-2xl border border-border-subtle bg-bg-elevated/60 px-4 py-2.5 text-sm text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
                />
              </div>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl border border-transparent bg-accent px-4 py-2.5 text-sm font-semibold text-bg-base shadow-[0_0_20px_rgba(0,255,132,0.45)] transition hover:bg-accent-secondary">
                Run Agent
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 py-6 md:py-8">
          <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function OverviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} {...props}>
      <path d="M4 5h16M4 12h16M4 19h16" strokeLinecap="round" />
    </svg>
  );
}

function NewsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h5M7 12h10M7 16h6" strokeLinecap="round" />
    </svg>
  );
}

function CompaniesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} {...props}>
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M12 4v16" />
    </svg>
  );
}

function CryptoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9h6M9 15h6" strokeLinecap="round" />
    </svg>
  );
}

function AgentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} {...props}>
      <path d="M12 3v4M12 17v4M5 12h14" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} {...props}>
      <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
    </svg>
  );
}
