export default function Home() {
  return (
    <section className="space-y-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10 shadow-2xl shadow-black/40">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">Today in Robotics</p>
        <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
          Robotics Intelligence Hub
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-300">
          This dashboard will evolve into a living command center for founders, investors, and analysts
          who need trustworthy intelligence about emerging robotics companies, funding rounds, and the
          crypto markets that power automation.
        </p>
        <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
          {["AI Market Pulse", "Company Signals", "Agent Briefings"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/5 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Coming Soon</p>
              <p className="mt-2 font-semibold text-slate-100">{item}</p>
              <p className="mt-1 text-slate-400">
                Structured data cards, curated feeds, and conversational AI intelligence.
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/5 bg-slate-950/70 p-6">
        <p className="text-sm font-semibold text-slate-200">Next steps</p>
        <p className="mt-2 text-sm text-slate-400">
          Connect the database via Prisma, wire up the ETL agents, and ship the first set of live widgets.
        </p>
      </div>
    </section>
  );
}
