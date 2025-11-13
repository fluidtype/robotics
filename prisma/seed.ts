import { PrismaClient } from '@prisma/client';

export interface SourceSeedData {
  name: string;
  url: string;
  type: string;
}

export const SOURCE_SEED_DATA: SourceSeedData[] = [
  {
    name: 'The Robot Report',
    url: 'https://www.therobotreport.com/feed/',
    type: 'rss',
  },
  {
    name: 'IEEE Spectrum Robotics',
    url: 'https://spectrum.ieee.org/robotics/fulltext/rss',
    type: 'rss',
  },
  {
    name: 'Robotics Business Review',
    url: 'https://www.roboticsbusinessreview.com/feed/',
    type: 'rss',
  },
  {
    name: 'Robotics Tomorrow',
    url: 'https://www.roboticstomorrow.com/rss/rss.xml',
    type: 'rss',
  },
  {
    name: 'RoboHub',
    url: 'https://robohub.org/feed/',
    type: 'rss',
  },
  {
    name: 'TechCrunch Robotics',
    url: 'https://techcrunch.com/category/robotics/feed/',
    type: 'rss',
  },
];

export async function ensureSeedSources(client: PrismaClient): Promise<number> {
  let createdCount = 0;

  for (const source of SOURCE_SEED_DATA) {
    const existing = await client.source.findUnique({
      where: { url: source.url },
    });

    if (existing) {
      const needsUpdate = existing.name !== source.name || existing.type !== source.type;
      if (needsUpdate) {
        await client.source.update({
          where: { id: existing.id },
          data: { name: source.name, type: source.type },
        });
      }
      continue;
    }

    await client.source.create({ data: source });
    createdCount += 1;
  }

  return createdCount;
}

async function runSeed() {
  const prisma = new PrismaClient();
  try {
    const created = await ensureSeedSources(prisma);
    console.log(`Seed complete. ${created} source(s) created.`);
  } catch (error) {
    console.error('Seed failed', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes('prisma/seed')) {
  void runSeed();
}
