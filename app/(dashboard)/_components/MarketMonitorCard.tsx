import { Card, CardDescription, CardTitle } from "./Card";
import type { RoboticsTokenSnapshotUI } from "@/components/CryptoTable";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface MarketMonitorCardProps {
  tokens: RoboticsTokenSnapshotUI[];
}

export function MarketMonitorCard({ tokens }: MarketMonitorCardProps) {
  const hasData = tokens.length > 0;
  const displayTokens = tokens.slice(0, 8);
  const totalMarketCap = tokens.reduce((sum, token) => sum + (token.marketCapUsd || 0), 0);
  const avgChange = tokens.length
    ? tokens.reduce((sum, token) => sum + (token.change24hPct || 0), 0) / tokens.length
    : 0;
  const topMover = tokens.length
    ? [...tokens].sort((a, b) => b.change24hPct - a.change24hPct)[0]
    : undefined;

  return (
    <Card className="flex h-full min-h-[280px] flex-col md:min-h-[320px]">
      <header className="space-y-1">
        <CardTitle>Market Monitor</CardTitle>
        <CardDescription>Tracking robotics-aligned digital assets and their 24h momentum.</CardDescription>
      </header>

      <div className="mt-4 flex flex-1 flex-col border-t border-border-subtle pt-4">
        {hasData ? (
          <div className="flex flex-1 flex-col gap-4">
            <LineChart tokens={displayTokens} />
            <div className="grid gap-3 text-sm text-secondary sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent-secondary">Total Cap</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(totalMarketCap, { notation: "compact" })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent-secondary">Avg 24h change</p>
                <p className={avgChange >= 0 ? "text-accent" : "text-rose-300"}>{formatPercent(avgChange)}</p>
              </div>
              {topMover && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-accent-secondary">Top mover</p>
                  <p className="text-primary">
                    {topMover.name}
                    <span className="ml-2 text-xs text-secondary">{formatPercent(topMover.change24hPct)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center rounded-2xl border border-dashed border-border-subtle/70 bg-bg-base/30 p-5 text-sm text-secondary">
            No token data available yet. The ETL pipeline will populate the robotics market snapshot after the next daily
            run.
          </div>
        )}
      </div>
    </Card>
  );
}

function LineChart({ tokens }: { tokens: RoboticsTokenSnapshotUI[] }) {
  if (tokens.length === 0) return null;
  const values = tokens.map((token) => token.priceUsd || 0);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(tokens.length - 1, 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  });

  return (
    <div className="min-h-[180px] w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full">
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          points={points.join(" ")}
        />
        <polygon
          points={`${points.join(" ")} 100,100 0,100`}
          fill="url(#chartGradient)"
          opacity="0.25"
        />
        {tokens.map((token, index) => (
          <text
            key={token.id}
            x={(index / Math.max(tokens.length - 1, 1)) * 100}
            y={100}
            dy="-2"
            textAnchor="middle"
            fontSize="3"
            fill="var(--text-secondary)"
          >
            {token.symbol.toUpperCase()}
          </text>
        ))}
      </svg>
    </div>
  );
}
