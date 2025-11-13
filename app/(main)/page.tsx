import { AIInsightCard } from "@/app/(dashboard)/_components/AIInsightCard";
import { MarketMonitorCard } from "@/app/(dashboard)/_components/MarketMonitorCard";
import { ShellLayout } from "@/app/(dashboard)/_components/ShellLayout";
import { TodayInRoboticsCard } from "@/app/(dashboard)/_components/TodayInRoboticsCard";
import { TopArticlesCard } from "@/app/(dashboard)/_components/TopArticlesCard";
import type { ArticleCardArticle } from "@/components/ArticleCard";
import type { RoboticsTokenSnapshotUI } from "@/components/CryptoTable";
import { getBaseUrl, formatDate } from "@/lib/utils";

const FEATURED_ARTICLE_LIMIT = 6;

interface NewsApiResponse {
  articles: ArticleCardArticle[];
  total: number;
}

async function getHomeData() {
  const baseUrl = getBaseUrl();
  const articlesQuery = new URLSearchParams({ limit: FEATURED_ARTICLE_LIMIT.toString() });

  try {
    const [articlesRes, tokensRes] = await Promise.all([
      fetch(`${baseUrl}/api/news?${articlesQuery.toString()}`, {
        next: { revalidate: 120 },
      }),
      fetch(`${baseUrl}/api/crypto/robotics`, { next: { revalidate: 600 } }),
    ]);

    if (!articlesRes.ok) {
      throw new Error("Failed to load articles");
    }
    if (!tokensRes.ok) {
      throw new Error("Failed to load tokens");
    }

    const articlesData = (await articlesRes.json()) as NewsApiResponse;
    const tokensData = (await tokensRes.json()) as RoboticsTokenSnapshotUI[];

    return {
      articles: articlesData.articles,
      tokens: tokensData,
    };
  } catch (error) {
    console.error(error);
    return { articles: [], tokens: [] };
  }
}

export default async function HomePage() {
  const { articles, tokens } = await getHomeData();
  const lastUpdated = formatDate(new Date(), { dateStyle: "medium", timeStyle: "short" });
  const insightCopy =
    "Robotics capital flows continue to shift toward autonomous logistics. Funding updates for last-mile delivery platforms represented 42% of tracked deals this week, indicating a renewed focus on revenue-ready deployments.";

  return (
    <ShellLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8 lg:px-6">
        <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <TodayInRoboticsCard />
          <AIInsightCard insight={insightCopy} lastUpdated={lastUpdated} />
        </div>
        <div className="mt-4 grid gap-4 md:mt-6 md:gap-6 lg:grid-cols-2">
          <MarketMonitorCard tokens={tokens} />
          <TopArticlesCard articles={articles} />
        </div>
      </div>
    </ShellLayout>
  );
}
