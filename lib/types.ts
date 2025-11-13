export type ArticleCategory =
  | 'product'
  | 'funding'
  | 'partnership'
  | 'policy'
  | 'other';

export interface SourceType {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface CompanyType {
  id: string;
  name: string;
  website?: string | null;
  country?: string | null;
  categories: string[];
  summary_ai?: string | null;
  last_seen_at: Date;
}

export interface RawNewsType {
  id: string;
  sourceId: string;
  url: string;
  title_raw: string;
  content_raw: string;
  published_at: Date;
  ingested_at: Date;
  processed: boolean;
}

export interface RawNewsData {
  title_raw: string;
  content_raw: string;
  url: string;
  published_at: Date;
}

export interface ArticleType {
  id: string;
  sourceId: string;
  companyId?: string | null;
  url: string;
  title: string;
  summary_ai: string;
  category: ArticleCategory;
  robot_tags: string[];
  importance_score: number;
  published_at: Date;
  created_at: Date;
}

export interface EnrichedArticleData {
  title: string;
  summary_ai: string;
  category: ArticleCategory;
  robot_tags: string[];
  importance_score: number;
  company_name: string | null;
  company_website?: string | null;
}

export interface RoboticsTokenSnapshotType {
  id: string;
  coingeckoId: string;
  symbol: string;
  name: string;
  image?: string | null;
  priceUsd: number;
  marketCapUsd: number;
  volume24hUsd: number;
  change1hPct: number;
  change24hPct: number;
  change7dPct: number;
  rank: number;
  takenAt: Date;
}

export interface RoboticsTokenSnapshotData {
  coingeckoId: string;
  symbol: string;
  name: string;
  image?: string | null;
  priceUsd: number;
  marketCapUsd: number;
  volume24hUsd: number;
  change1hPct: number;
  change24hPct: number;
  change7dPct: number;
  rank: number;
}

export interface CoinGeckoMarketResponse {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap_rank: number;
}

export interface RawNewsWithSource extends RawNewsType {
  source: SourceType;
}
