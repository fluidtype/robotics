import { CoinGeckoMarketResponse, RoboticsTokenSnapshotData } from './types';
import { RetriableError, retry } from './retry';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_TIMEOUT_MS = Number(process.env.COINGECKO_TIMEOUT_MS ?? 10000);
const COINGECKO_MAX_RETRIES = Number(process.env.COINGECKO_MAX_RETRIES ?? 2);

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

function shouldRetryCoinGecko(error: unknown): boolean {
  if (error instanceof RetriableError) {
    return true;
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return true;
    }
    return /ENETUNREACH|ECONNRESET|ETIMEDOUT|fetch failed/i.test(error.message);
  }
  return false;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COINGECKO_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRoboticsTokens(): Promise<RoboticsTokenSnapshotData[]> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    category: 'robotics',
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '250',
    page: '1',
    price_change_percentage: '1h,24h,7d',
  });

  const data = await retry(
    async () => {
      const response = await fetchWithTimeout(`${COINGECKO_API_URL}/coins/markets?${params.toString()}`, {
        headers: {
          accept: 'application/json',
          'x-cg-pro-api-key': apiKey,
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const errorMessage = `CoinGecko API error: ${response.status} ${response.statusText} - ${errorBody}`;
        if (response.status === 429 || response.status >= 500) {
          throw new RetriableError(errorMessage);
        }
        throw new Error(errorMessage);
      }

      return (await response.json()) as CoinGeckoMarketResponse[];
    },
    {
      retries: COINGECKO_MAX_RETRIES,
      baseDelayMs: 1500,
      shouldRetry: shouldRetryCoinGecko,
    },
  );

  return data.map(mapToken);
}
