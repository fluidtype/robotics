import { Card, CardDescription, CardTitle } from "./Card";

interface AIInsightCardProps {
  insight: string;
  lastUpdated: string;
}

export function AIInsightCard({ insight, lastUpdated }: AIInsightCardProps) {
  return (
    <Card className="flex h-full min-h-[260px] flex-col justify-between space-y-4">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-secondary">AI Insight of the Day</p>
        <CardTitle>Agent summarization window</CardTitle>
        <CardDescription>{insight}</CardDescription>
      </div>
      <p className="text-xs text-secondary">Last updated: {lastUpdated}</p>
    </Card>
  );
}
