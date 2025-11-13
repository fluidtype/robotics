import Link from "next/link";
import ArticleCard, { ArticleCardArticle } from "@/components/ArticleCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBaseUrl, formatDate } from "@/lib/utils";
import { CompanyType } from "@/lib/types";
import { notFound } from "next/navigation";

interface CompanyDetail extends CompanyType {
  articles: ArticleCardArticle[];
}

async function fetchCompany(id: string): Promise<CompanyDetail> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/companies/${id}`, { next: { revalidate: 120 } });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load company");
  }

  return (await response.json()) as CompanyDetail;
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await fetchCompany(params.id);

  return (
    <div className="space-y-10">
      <Card className="space-y-6">
        <CardHeader className="mb-0">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-200">Company Profile</p>
          <CardTitle className="text-4xl text-white">{company.name}</CardTitle>
          <CardDescription>
            {company.summary_ai ?? "Summary not available yet. Check back soon for AI-generated context."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm text-slate-300">
          {company.website && (
            <Link
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="text-brand-200 underline decoration-dotted underline-offset-2"
            >
              Visit website ↗
            </Link>
          )}
          <span>Last seen {formatDate(company.last_seen_at)}</span>
          {company.country && <span>HQ: {company.country}</span>}
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            {company.categories.map((category) => (
              <span key={category} className="rounded-full border border-white/10 px-3 py-1">
                {category}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-200">Related News</p>
          <h2 className="text-2xl font-semibold text-white">Articles mentioning {company.name}</h2>
        </div>
        {company.articles.length === 0 && (
          <p className="text-sm text-slate-400">No articles linked to this company yet.</p>
        )}
        <div className="space-y-4">
          {company.articles.map((article) => (
            <ArticleCard key={article.id} article={article} showCompany={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
