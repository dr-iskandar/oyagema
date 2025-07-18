import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create a test user
  const hashedPassword = await hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      password: hashedPassword,
      image: '/images/meditation-silhouette.svg',
    },
  });

  console.log(`Created user with id: ${user.id}`);

  // Create categories
  const categories = [
    {
      title: 'Healing & Mindfulness',
      description: 'Guided meditations and sounds for inner peace and healing',
      coverUrl: '/images/category-cover-1.svg',
      slug: 'healing',
    },
    {
      title: 'Motivasi & Self-Talk',
      description: 'Positive affirmations and motivational content to boost your spirit',
      coverUrl: '/images/category-cover-2.svg',
      slug: 'motivation',
    },
    {
      title: 'Narasi Spiritualitas',
      description: 'Spiritual teachings and wisdom for soul growth',
      coverUrl: '/images/category-cover-1.svg',
      slug: 'spiritual',
    },
    {
      title: 'Musik Instrumental Tenang',
      description: 'Soothing instrumental music for relaxation and focus',
      coverUrl: '/images/category-cover-2.svg',
      slug: 'instrumental',
    },
    {
      title: 'Affirmation Loops',
      description: 'Repeated positive affirmations for subconscious reprogramming',
      coverUrl: '/images/category-cover-1.svg',
      slug: 'affirmation',
    },
    {
      title: 'Cerita Penyadaran',
      description: 'Narrated stories with spiritual lessons and insights',
      coverUrl: '/images/category-cover-2.svg',
      slug: 'stories',
    },
  ];

  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`Created category: ${createdCategory.title}`);
  }

  // Create tracks for each category
  const healingCategory = await prisma.category.findUnique({
    where: { slug: 'healing' },
  });

  if (healingCategory) {
    const healingTracks = [
      {
        title: 'Deep Healing Meditation',
        artist: 'Mindful Voice',
        description: 'A guided meditation for deep healing and inner peace',
        coverUrl: '/images/track-cover-1.svg',
        audioUrl: '/audio/sample.mp3',
        duration: '10:15',
        categoryId: healingCategory.id,
      },
      {
        title: 'Chakra Balancing',
        artist: 'Spiritual Guide',
        description: 'Balance your chakras with this guided meditation',
        coverUrl: '/images/track-cover-2.svg',
        audioUrl: '/audio/sample.mp3',
        duration: '25:45',
        categoryId: healingCategory.id,
      },
      {
        title: 'Anxiety Relief',
        artist: 'Healing Vibrations',
        description: 'Calm your anxiety with this soothing meditation',
        coverUrl: '/images/track-cover-1.svg',
        audioUrl: '/audio/sample.mp3',
        duration: '15:30',
        categoryId: healingCategory.id,
      },
      {
        title: 'Inner Child Healing',
        artist: 'Soul Healer',
        description: 'Connect with and heal your inner child',
        coverUrl: '/images/track-cover-2.svg',
        audioUrl: '/audio/sample.mp3',
        duration: '32:10',
        categoryId: healingCategory.id,
      },
    ];

    for (const track of healingTracks) {
      const createdTrack = await prisma.track.create({
        data: track,
      });
      console.log(`Created track: ${createdTrack.title}`);
    }
  }

  // Create tracks for Motivation category
  const motivationCategory = await prisma.category.findUnique({
    where: { slug: 'motivation' },
  });

  if (motivationCategory) {
    const motivationTracks = [
      {
        title: 'Morning Motivation',
        artist: 'Positive Mind',
        description: 'Start your day with positive affirmations',
        coverUrl: '/images/track-cover-1.svg',
        audioUrl: '/audio/sample.mp3',
        duration: '08:45',
        categoryId: motivationCategory.id,
      },
      {
        title: 'Self-Love Affirmations',
        artist: 'Inner Voice',
        description: 'Powerful affirmations to boost self-love and confidence',
        coverUrl: '/images/track-cover-2.svg',
        audioUrl: '/audio/sample.mp3',
        duration: '12:30',
        categoryId: motivationCategory.id,
      },
      {
        title: 'Overcome Challenges',
        artist: 'Mindset Coach',
        description: 'Develop resilience and overcome obstacles',
        coverUrl: '/images/track-cover-1.svg',
        audioUrl: '/audio/sample.mp3',
        duration: '18:20',
        categoryId: motivationCategory.id,
      },
    ];

    for (const track of motivationTracks) {
      const createdTrack = await prisma.track.create({
        data: track,
      });
      console.log(`Created track: ${createdTrack.title}`);
    }
  }

  // Add some tracks to history
  const tracks = await prisma.track.findMany({
    take: 4,
  });

  if (tracks.length > 0) {
    // Add some tracks to history
    for (const track of tracks) {
      await prisma.history.create({
        data: {
          userId: user.id,
          trackId: track.id,
        },
      });
    }

    console.log('Added tracks to history');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });