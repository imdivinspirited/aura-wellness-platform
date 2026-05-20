import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';
import { Program } from '../models/Program';
import { Event } from '../models/Event';
import { Service } from '../models/Service';
import { Page } from '../models/Page';

dotenv.config();

async function upsertShop(input: { slug: string; name: string; logoUrl?: string }) {
  return Shop.findOneAndUpdate(
    { slug: input.slug },
    {
      $set: {
        slug: input.slug,
        name: input.name,
        logoUrl: input.logoUrl,
        status: 'active',
        contact: {},
      },
      $setOnInsert: { ownerUserIds: [] },
    },
    { upsert: true, new: true }
  );
}

async function upsertProduct(input: {
  shopId: any;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  tags?: string[];
  images?: string[];
}) {
  return Product.findOneAndUpdate(
    { shopId: input.shopId, slug: input.slug },
    {
      $set: {
        shopId: input.shopId,
        slug: input.slug,
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        currency: 'INR',
        stock: input.stock,
        tags: input.tags || [],
        images: input.images || [],
        isPublished: true,
      },
    },
    { upsert: true, new: true }
  );
}

async function upsertProgram(input: { slug: string; title: string; shortDescription: string; description: string }) {
  return Program.findOneAndUpdate(
    { slug: input.slug },
    {
      $set: {
        slug: input.slug,
        title: input.title,
        shortDescription: input.shortDescription,
        description: input.description,
        category: 'beginning',
        tags: ['international', 'wellness'],
        audience: ['adults'],
        durationDays: 3,
        isOnline: true,
        baseTimezone: 'Asia/Kolkata',
        languages: ['en'],
        isInternationalVisible: true,
        galleryImageUrls: [],
        youtubeVideoIds: [],
        metadata: { difficulty: 'introductory', benefits: ['Stress relief', 'Better sleep'] },
      },
    },
    { upsert: true, new: true }
  );
}

async function upsertEvent(input: { slug: string; title: string; shortDescription: string; description: string; startAt: Date }) {
  return Event.findOneAndUpdate(
    { slug: input.slug },
    {
      $set: {
        slug: input.slug,
        title: input.title,
        shortDescription: input.shortDescription,
        description: input.description,
        tags: ['international', 'live'],
        schedule: { startAt: input.startAt, timezone: 'Asia/Kolkata' },
        galleryImageUrls: [],
        youtubeVideoIds: [],
        isPublished: true,
        isInternationalVisible: true,
        languages: ['en'],
      },
    },
    { upsert: true, new: true }
  );
}

async function upsertService(input: { slug: string; title: string; shortDescription: string; description: string }) {
  return Service.findOneAndUpdate(
    { slug: input.slug },
    {
      $set: {
        slug: input.slug,
        title: input.title,
        shortDescription: input.shortDescription,
        description: input.description,
        category: 'shopping',
        tags: ['shop'],
        galleryImageUrls: [],
        youtubeVideoIds: [],
        isPublished: true,
        languages: ['en'],
      },
    },
    { upsert: true, new: true }
  );
}

async function upsertPage(input: { slug: string; title: string; description: string }) {
  return Page.findOneAndUpdate(
    { slug: input.slug },
    {
      $set: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        status: 'published',
        language: 'en',
        sections: [
          {
            sectionId: 'hero-1',
            type: 'hero',
            order: 1,
            props: { title: input.title, subtitle: input.description },
          },
          {
            sectionId: 'rt-1',
            type: 'rich_text',
            order: 2,
            props: { html: '<p>This page is seeded to verify real CMS + chatbot indexing.</p>' },
          },
        ],
      },
    },
    { upsert: true, new: true }
  );
}

async function main() {
  await connectDatabase();

  const shop = await upsertShop({ slug: 'aura-shop', name: 'The AOLIC Shop' });
  await upsertProduct({
    shopId: shop._id,
    slug: 'ayurveda-oil',
    name: 'Ayurveda Massage Oil',
    description: 'Traditional herbal oil for relaxation and recovery.',
    priceCents: 49900,
    stock: 50,
    tags: ['ayurveda', 'wellness'],
  });
  await upsertProduct({
    shopId: shop._id,
    slug: 'meditation-beads',
    name: 'Meditation Beads (Mala)',
    description: 'Handcrafted mala beads for meditation practice.',
    priceCents: 29900,
    stock: 100,
    tags: ['meditation', 'spiritual'],
  });

  await upsertProgram({
    slug: 'international-happiness',
    title: 'International Happiness Program',
    shortDescription: 'A beginner-friendly program for international visitors with flexible schedules.',
    description: 'Breathing techniques, meditation, and practical wisdom in a structured multi-day format.',
  });

  await upsertEvent({
    slug: 'international-orientation',
    title: 'International Visitor Orientation',
    shortDescription: 'Get started with campus guidance, schedules, and program recommendations.',
    description: 'Orientation session with Q&A and recommended next steps.',
    startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await upsertService({
    slug: 'campus-shopping',
    title: 'Campus Shopping',
    shortDescription: 'Shop wellness, books, and spiritual items.',
    description: 'On-campus shopping including ayurveda products, books, and gifts.',
  });

  await upsertPage({
    slug: 'international-visitors',
    title: 'International Visitors',
    description: 'Timezone-aware events, curated programs, and visitor guidance.',
  });

  console.log('✅ Seed complete.');
  await disconnectDatabase();
}

main().catch(async (e) => {
  console.error('❌ Seed failed:', e);
  try {
    await disconnectDatabase();
  } catch {
    // ignore
  }
  process.exit(1);
});

