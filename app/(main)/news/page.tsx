import ArticleCard, { ArticleCardArticle } from "@/components/ArticleCard";
import Link from "next/link";
import { getBaseUrl } from "@/lib/utils";
import { notFound } from "next/navigation";
import { NewsFiltersPanel } from "./news-filters";

const PAGE_SIZE = 10;
const categories = ["product", "funding", "partnership", "policy", "other"];
const sampleTags = ["ai", "hardware", "software", "drones", "supply-chain"];

interface NewsApiResponse {
  articles: ArticleCardArticle[];
  total: number;
}

type SearchParamsRecord = { [key: string]: string | string[] | undefined };

interface NewsPageProps {
  searchParams?: SearchParamsRecord | Promise<SearchParamsRecord>;
}

function getParamValue(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function createSearchParams(record: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(record).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params;
}

async function fetchNews(query: URLSearchParams) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/news?${query.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    notFound();
  }

  return (await response.json()) as NewsApiResponse;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {};
  const pageParam = Number(getParamValue(resolvedSearchParams.page)) || 1;
  const q = getParamValue(resolvedSearchParams.q);
  const category = getParamValue(resolvedSearchParams.category);
  const tag = getParamValue(resolvedSearchParams.tag);
  const sourceId = getParamValue(resolvedSearchParams.sourceId);
  const from = getParamValue(resolvedSearchParams.from);
  const to = getParamValue(resolvedSearchParams.to);

  const query = createSearchParams({
    q: q || undefined,
    category: category || undefined,
    tag: tag || undefined,
    sourceId: sourceId || undefined,
    from: from || undefined,
    to: to || undefined,
    limit: PAGE_SIZE.toString(),
    offset: ((pageParam - 1) * PAGE_SIZE).toString(),
  });

  const data = await fetchNews(query);
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const currentSources = Array.from(
    new Map(
      data.articles
        .filter((article) => article.source)
        .map((article) => [article.source!.id, article.source!.name]),
    ),
  ).map(([id, name]) => ({ id, name }));

  const baseSearchParams = createSearchParams({
    q: q || undefined,
    category: category || undefined,
    tag: tag || undefined,
    sourceId: sourceId || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  function buildPageLink(nextPage: number) {
    const params = new URLSearchParams(baseSearchParams);
    params.set("page", nextPage.toString());
    const qs = params.toString();
    return qs ? `/news?${qs}` : "/news";
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
      <aside>
        <NewsFiltersPanel
          initialValues={{
            q: q || "",
            category: category || "",
            tag: tag || "",
            sourceId: sourceId || "",
            from: from || "",
            to: to || "",
          }}
          categories={categories}
          tags={sampleTags}
          sources={currentSources}
        />
      </aside>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-200">Newsroom</p>
            <h1 className="text-3xl font-semibold text-white">Robotics Intelligence Feed</h1>
            <p className="text-sm text-slate-400">{data.total} articles found</p>
          </div>
        </div>
        <div className="space-y-4">
          {data.articles.length === 0 && <p className="text-sm text-slate-400">No articles match your filters.</p>}
          {data.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-sm text-slate-300">
          <span>
            Page {pageParam} of {totalPages}
          </span>
          <div className="flex gap-3">
            <Link
              href={buildPageLink(Math.max(1, pageParam - 1))}
              aria-disabled={pageParam <= 1}
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-brand-400 hover:text-brand-200 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Previous
            </Link>
            <Link
              href={buildPageLink(Math.min(totalPages, pageParam + 1))}
              aria-disabled={pageParam >= totalPages}
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-brand-400 hover:text-brand-200 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Next
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
