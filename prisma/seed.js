const prisma = require('../config/prisma');

async function main() {
  const sampleRows = [
    {
      title: 'Mid-Sem Revision Drive',
      body: 'Complete one mock test before Friday and update your progress tracker.',
      priority: 'high',
      isPublished: true,
      createdBy: 'system',
    },
    {
      title: 'Weekly Focus',
      body: 'Focus on DSA arrays, recursion, and one SQL practice set.',
      priority: 'normal',
      isPublished: true,
      createdBy: 'system',
    },
  ];

  for (const row of sampleRows) {
    await prisma.announcement.create({ data: row });
  }
}

main()
  .then(async () => {
    console.log('Prisma seed completed.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Prisma seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
