import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/news", label: "News" },
  { href: "/companies", label: "Companies" },
  { href: "/agent", label: "Agent" },
];

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-500/20 p-2 text-brand-400">
              <span className="text-xs font-semibold uppercase tracking-wide">RIH</span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">
                Robotics Intelligence Hub
              </p>
              <p className="text-xs text-slate-400">Realtime robotics market console</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="rounded-full border border-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-brand-400 hover:text-brand-200">
            Launch App
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
