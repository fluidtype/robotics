import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export interface ArticleCardArticle {
  id: string;
  title: string;
  summary_ai: string;
  category: string;
  robot_tags: string[];
  importance_score: number;
  url: string;
  published_at: string | Date;
  source?: {
    id: string;
    name: string;
    url?: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
    website?: string | null;
  } | null;
}

interface ArticleCardProps {
  article: ArticleCardArticle;
  showCompany?: boolean;
}

function getImportanceColor(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 50) return "text-amber-300";
  return "text-slate-400";
}

export function ArticleCard({ article, showCompany = true }: ArticleCardProps) {
  const publishedDate = formatDate(article.published_at);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>{article.category}</span>
        <span>{publishedDate}</span>
      </div>
      <div className="space-y-3">
        <Link
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 text-left"
        >
          <h3 className="text-xl font-semibold text-white transition group-hover:text-brand-200">
            {article.title}
          </h3>
          <span aria-hidden className="text-brand-400 group-hover:translate-x-0.5 transition">
            ↗
          </span>
        </Link>
        <p className="text-sm text-slate-300">{article.summary_ai}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span className={getImportanceColor(article.importance_score)}>
          Importance score: {article.importance_score.toFixed(0)} / 100
        </span>
        {article.source?.name && <span>• Source: {article.source.name}</span>}
        {showCompany && article.company?.name && (
          <span className="flex items-center gap-1 text-brand-200">
            Company:
            <Link
              href={`/companies/${article.company.id}`}
              className="underline decoration-dotted underline-offset-2"
            >
              {article.company.name}
            </Link>
          </span>
        )}
      </div>
      {article.robot_tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.robot_tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
export default ArticleCard;
