
import { sanctumApi } from './services/api.js';

const seed = async () => {
  console.log('Seeding database with mock data...');
  try {
    await sanctumApi.seedDatabase();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
