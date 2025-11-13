import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBaseUrl, formatDate } from "@/lib/utils";
import { CompanyType } from "@/lib/types";
import { CompaniesFiltersPanel } from "./companies-filters";

const categories = ["mobility", "logistics", "health", "industrial", "software"];
const countries = ["United States", "Canada", "Germany", "Italy", "Japan"];

type CompaniesSearchParams = { [key: string]: string | string[] | undefined };

interface CompaniesPageProps {
  searchParams?: CompaniesSearchParams | Promise<CompaniesSearchParams>;
}

type CompanyResponse = Omit<CompanyType, "last_seen_at"> & { last_seen_at: string };

function getParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

async function fetchCompanies(params: URLSearchParams) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/companies?${params.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error("Failed to load companies");
  }

  return (await response.json()) as CompanyResponse[];
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {};
  const q = getParam(resolvedSearchParams.q);
  const category = getParam(resolvedSearchParams.category);
  const country = getParam(resolvedSearchParams.country);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (country) params.set("country", country);

  const companies = await fetchCompanies(params);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
      <aside>
        <CompaniesFiltersPanel
          initialValues={{ q: q || "", category: category || "", country: country || "" }}
          categories={categories}
          countries={countries}
        />
      </aside>
      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-200">Company Atlas</p>
          <h1 className="text-3xl font-semibold text-white">Robotics Directory</h1>
          <p className="text-sm text-slate-400">{companies.length} companies matched</p>
        </div>
        <div className="grid gap-4">
          {companies.length === 0 && (
            <p className="text-sm text-slate-400">No companies found. Adjust your filters.</p>
          )}
          {companies.map((company) => (
            <Card key={company.id} className="space-y-4">
              <CardHeader className="mb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                  <span>{company.country ?? "Global"}</span>
                  <span>•</span>
                  <span>Last seen {formatDate(company.last_seen_at)}</span>
                </div>
                <CardTitle className="text-2xl text-white">{company.name}</CardTitle>
                <CardDescription>
                  {company.summary_ai ?? "AI summary will be available soon. We're processing the latest filings."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                {company.website && (
                  <Link
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-200 underline decoration-dotted underline-offset-2"
                  >
                    Visit website
                  </Link>
                )}
                <Link
                  href={`/companies/${company.id}`}
                  className="text-brand-100 underline decoration-dotted underline-offset-2"
                >
                  View profile →
                </Link>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.4em] text-slate-500">
                  {company.categories.map((categoryValue) => (
                    <span key={categoryValue} className="rounded-full border border-white/10 px-3 py-1">
                      {categoryValue}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
