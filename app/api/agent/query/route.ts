import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/lib/db-queries';
import { queryAgent } from '@/lib/grok-client';

interface AgentQueryBody {
  userQuery?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

const DEFAULT_LOOKBACK_DAYS = 7;
const MAX_ARTICLES = 10;

function parseDateString(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getDefaultDateRange(): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - DEFAULT_LOOKBACK_DAYS);
  return { from, to };
}

export async function POST(req: NextRequest) {
  try {
    const body: AgentQueryBody = await req.json();
    const userQuery = body.userQuery?.trim();

    if (!userQuery) {
      return NextResponse.json(
        { error: 'The field "userQuery" is required.' },
        { status: 400 },
      );
    }

    let from = parseDateString(body.dateRange?.from);
    let to = parseDateString(body.dateRange?.to);

    if (!from || !to) {
      const fallbackRange = getDefaultDateRange();
      from = from ?? fallbackRange.from;
      to = to ?? fallbackRange.to;
    }

    if (from > to) {
      return NextResponse.json(
        { error: 'Invalid dateRange. The "from" date must be earlier than "to".' },
        { status: 400 },
      );
    }

    const { articles } = await getArticles({
      q: userQuery,
      from,
      to,
      limit: MAX_ARTICLES,
    });

    const contextBody = articles
      .map((article, index) => {
        const publishedAt = article.published_at?.toISOString?.() ?? article.published_at;
        return [
          `Articolo ${index + 1}:`,
          `Titolo: ${article.title}`,
          `Sommario: ${article.summary_ai}`,
          `Fonte: ${article.source?.name ?? 'Sconosciuta'}`,
          `Pubblicato il: ${publishedAt}`,
          `Punteggio importanza: ${article.importance_score}`,
        ].join('\n');
      })
      .join('\n\n');

    const fallbackContext =
      'Non sono disponibili articoli recenti nel periodo indicato. Rispondi dicendo che non sono presenti dati nel contesto.';

    const systemPrompt =
      'Agisci come Robotics Intelligence Agent. Rispondi solo usando i dati nel CONTEXT. Se la risposta non è presente, dichiara: "Non ho trovato informazioni sufficienti nei dati recenti per rispondere a questa domanda."';

    const context = `${systemPrompt}\n\nCONTEXT:\n${contextBody || fallbackContext}`;

    const answer = await queryAgent(context, userQuery);

    return NextResponse.json({
      answer,
      context_articles_count: articles.length,
    });
  } catch (error) {
    console.error('Failed to process agent query', error);
    return NextResponse.json(
      { error: 'Failed to process agent query' },
      { status: 500 },
    );
  }
}
