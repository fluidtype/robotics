import { Card, CardDescription, CardTitle } from "./Card";

const roadmapItems = [
  {
    title: "AI Market Pulse",
    description: "Signals on liquidity, sentiment, and robotics-aligned tokens.",
  },
  {
    title: "Company Signals",
    description: "Founder updates, patent velocity, and hiring momentum.",
  },
  {
    title: "Agent Briefings",
    description: "Automated digests tuned to your robotics thesis.",
  },
];

export function TodayInRoboticsCard() {
  return (
    <Card className="flex h-full flex-col justify-between gap-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-secondary">Today in Robotics</p>
        <CardTitle>Command console for the robotics economy</CardTitle>
        <CardDescription>
          Track the macro pulse, AI-ranked briefings, and the companies advancing autonomous systems. Built for
          analysts and operators who need a compact but complete vantage point.
        </CardDescription>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {roadmapItems.map((item) => (
          <div key={item.title} className="rounded-xl border border-border-subtle/80 bg-bg-base/40 p-3">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-accent-secondary">Roadmap</p>
            <p className="mt-2 text-sm font-semibold text-primary">{item.title}</p>
            <p className="mt-1 text-sm text-secondary">{item.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
