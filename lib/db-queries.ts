import { Prisma } from '@prisma/client';
import prisma from './prisma';
import {
  ArticleType,
  CompanyType,
  RoboticsTokenSnapshotType,
  SourceType,
} from './types';

export interface ArticleFilters {
  q?: string;
  category?: string;
  tag?: string;
  from?: Date;
  to?: Date;
  companyId?: string;
  limit?: number;
  offset?: number;
}

export interface CompanyFilters {
  q?: string;
  category?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

export type ArticleWithRelations = ArticleType & {
  source: SourceType;
  company: CompanyType | null;
};

export async function getArticles(
  filters: ArticleFilters,
): Promise<{ articles: ArticleWithRelations[]; total: number }> {
  const {
    q,
    category,
    tag,
    from,
    to,
    companyId,
    limit = 20,
    offset = 0,
  } = filters;

  const andConditions: Prisma.ArticleWhereInput[] = [];

  if (category) {
    andConditions.push({ category });
  }

  if (tag) {
    andConditions.push({ robot_tags: { has: tag } });
  }

  if (companyId) {
    andConditions.push({ companyId });
  }

  if (from || to) {
    const publishedFilter: Prisma.DateTimeFilter = {};
    if (from) {
      publishedFilter.gte = from;
    }
    if (to) {
      publishedFilter.lte = to;
    }
    andConditions.push({ published_at: publishedFilter });
  }

  if (q) {
    const search = q.trim();
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { summary_ai: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
  }

  const where: Prisma.ArticleWhereInput | undefined =
    andConditions.length > 0 ? { AND: andConditions } : undefined;

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      include: { source: true, company: true },
      orderBy: { published_at: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles: articles as ArticleWithRelations[], total };
}

export async function getCompanies(filters: CompanyFilters): Promise<CompanyType[]> {
  const { q, category, country, limit = 50, offset = 0 } = filters;
  const andConditions: Prisma.CompanyWhereInput[] = [];

  if (category) {
    andConditions.push({ categories: { has: category } });
  }

  if (country) {
    andConditions.push({ country: { equals: country, mode: 'insensitive' } });
  }

  if (q) {
    const search = q.trim();
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { summary_ai: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
  }

  const where: Prisma.CompanyWhereInput | undefined =
    andConditions.length > 0 ? { AND: andConditions } : undefined;

  const companies = await prisma.company.findMany({
    where,
    orderBy: [{ last_seen_at: 'desc' }, { name: 'asc' }],
    take: limit,
    skip: offset,
  });

  return companies as CompanyType[];
}

export async function getCompanyById(
  id: string,
): Promise<(CompanyType & { articles: ArticleWithRelations[] }) | null> {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      articles: {
        include: { source: true, company: true },
        orderBy: { published_at: 'desc' },
      },
    },
  });

  if (!company) {
    return null;
  }

  return company as CompanyType & { articles: ArticleWithRelations[] };
}

export async function getLatestTokenSnapshot(): Promise<RoboticsTokenSnapshotType[]> {
  const latestSnapshot = await prisma.roboticsTokenSnapshot.findFirst({
    orderBy: { takenAt: 'desc' },
  });

  if (!latestSnapshot) {
    return [];
  }

  const tokens = await prisma.roboticsTokenSnapshot.findMany({
    where: { takenAt: latestSnapshot.takenAt },
    orderBy: { rank: 'asc' },
  });

  return tokens as RoboticsTokenSnapshotType[];
}
