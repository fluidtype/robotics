import { CoinGeckoMarketResponse, RoboticsTokenSnapshotData } from './types';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

function getApiKey(): string {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('COINGECKO_API_KEY is not configured');
  }
  return apiKey;
}

function mapToken(response: CoinGeckoMarketResponse): RoboticsTokenSnapshotData {
  return {
    coingeckoId: response.id,
    symbol: response.symbol,
    name: response.name,
    image: response.image ?? null,
    priceUsd: response.current_price,
    marketCapUsd: response.market_cap,
    volume24hUsd: response.total_volume,
    change1hPct: response.price_change_percentage_1h_in_currency ?? 0,
    change24hPct: response.price_change_percentage_24h_in_currency ?? 0,
    change7dPct: response.price_change_percentage_7d_in_currency ?? 0,
    rank: response.market_cap_rank,
  };
}

export async function fetchRoboticsTokens(): Promise<RoboticsTokenSnapshotData[]> {
  const params = new URLSearchParams({
    category: 'robotics',
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '250',
    page: '1',
    price_change_percentage: '1h,24h,7d',
  });

  const response = await fetch(`${COINGECKO_API_URL}/coins/markets?${params.toString()}`, {
    headers: {
      'accept': 'application/json',
      'x-cg-pro-api-key': getApiKey(),
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = (await response.json()) as CoinGeckoMarketResponse[];
  return data.map(mapToken);
}
