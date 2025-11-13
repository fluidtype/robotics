import type { ArticleCardArticle } from "@/components/ArticleCard";
import { formatDate } from "@/lib/utils";
import { Card, CardDescription, CardTitle } from "./Card";

interface TopArticlesCardProps {
  articles: ArticleCardArticle[];
}

export function TopArticlesCard({ articles }: TopArticlesCardProps) {
  const hasArticles = articles.length > 0;

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <CardTitle>Top Articles</CardTitle>
        <CardDescription>The freshest AI summarized stories for operators.</CardDescription>
      </div>
      {hasArticles ? (
        <div className="space-y-3">
          {articles.map((article) => (
            <article key={article.id} className="space-y-2 rounded-xl border border-border-subtle/80 bg-bg-base/40 p-3">
              <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.25em] text-secondary">
                <span>{article.source?.name ?? "Independent"}</span>
                <span>{formatDate(article.published_at, { month: "short", day: "numeric" })}</span>
              </div>
              <p className="text-sm font-medium text-primary">{article.title}</p>
              <p className="text-xs text-secondary">{article.summary_ai}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border-subtle/70 bg-bg-base/30 p-5 text-sm text-secondary">
          No articles available yet. When the pipeline ingests the next briefings the stream will auto-populate.
        </p>
      )}
    </Card>
  );
}
