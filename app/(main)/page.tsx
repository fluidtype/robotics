import ArticleCard, { ArticleCardArticle } from "@/components/ArticleCard";
import { CryptoTable, RoboticsTokenSnapshotUI } from "@/components/CryptoTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBaseUrl } from "@/lib/utils";

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

  return (
    <div className="space-y-12">
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-gradient-to-br from-slate-950 to-slate-900">
          <CardHeader className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-200">Today in Robotics</p>
            <CardTitle className="text-4xl text-white">Robotics Intelligence Hub</CardTitle>
            <CardDescription>
              The command center for founders, analysts, and investors following the robotics economy. Monitor
              the most important articles, token markets, and AI generated insights in a single view.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {["AI Market Pulse", "Company Signals", "Agent Briefings"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">Roadmap</p>
                <p className="mt-2 text-sm font-semibold text-white">{item}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Upcoming module focused on curated intelligence and AI automation.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Insight of the Day</CardTitle>
            <CardDescription>
              Daily signal distilled from the latest AI processed news. (Live agent connection coming soon.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-200">
              Robotics capital flows continue to shift toward autonomous logistics. Funding updates for last-mile
              delivery platforms represented 42% of tracked deals this week, indicating a renewed focus on
              revenue-ready deployments.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <Card className="col-span-1 space-y-6">
          <CardHeader className="mb-0">
            <CardTitle>Market Monitor</CardTitle>
            <CardDescription>Latest RoboticsToken snapshot aggregated from CoinGecko.</CardDescription>
          </CardHeader>
          <CardContent>
            {tokens.length > 0 ? (
              <CryptoTable tokens={tokens} />
            ) : (
              <p className="text-sm text-slate-400">No token data available right now.</p>
            )}
          </CardContent>
        </Card>
        <Card className="space-y-6">
          <CardHeader className="mb-0">
            <CardTitle>Top Articles</CardTitle>
            <CardDescription>The freshest AI summarized stories for operators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {articles.length === 0 && <p className="text-sm text-slate-400">No articles available.</p>}
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
