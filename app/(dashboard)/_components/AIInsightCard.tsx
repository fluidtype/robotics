import { Card, CardDescription, CardTitle } from "./Card";

interface AIInsightCardProps {
  insight: string;
  lastUpdated: string;
}

export function AIInsightCard({ insight, lastUpdated }: AIInsightCardProps) {
  return (
    <Card className="flex h-full min-h-[360px] flex-col md:min-h-[380px]">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-secondary">AI Insight of the Day</p>
        <CardTitle>Agent summarization window</CardTitle>
      </header>
      <div className="mt-4 flex flex-1 flex-col justify-between space-y-3 border-t border-border-subtle pt-4">
        <CardDescription>{insight}</CardDescription>
        <p className="text-xs text-secondary">Last updated: {lastUpdated}</p>
      </div>
    </Card>
  );
}
