#!/usr/bin/env ts-node

import { databaseService, dataSeeder } from './src/services';

async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('Usage: npx ts-node db-cli.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  init                 - Initialize database and containers');
    console.log('  seed [count]         - Seed database with mock data');
    console.log('  status               - Show database status and data counts');
    console.log('  health               - Check database health');
    console.log('');
    console.log('Examples:');
    console.log('  npx ts-node db-cli.ts init');
    console.log('  npx ts-node db-cli.ts seed 50');
    console.log('  npx ts-node db-cli.ts status');
    return;
  }

  try {
    switch (command) {
      case 'init':
        await initDatabase();
        break;
      case 'seed':
        const count = parseInt(process.argv[3]) || 20;
        await seedDatabase(count);
        break;
      case 'status':
        await showStatus();
        break;
      case 'health':
        await checkHealth();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function initDatabase() {
  console.log('🚀 Initializing database...');
  
  await databaseService.initialize();
  console.log('✅ Database initialized successfully');
  
  await dataSeeder.initialize();
  console.log('✅ Data seeder initialized');
}

async function seedDatabase(baseCount: number) {
  console.log(`🌱 Seeding database with ${baseCount} base entities...`);
  
  await databaseService.initialize();
  await dataSeeder.initialize();
  
  const result = await dataSeeder.seedAll({
    users: baseCount,
    trails: baseCount * 5, // More trails than users
    trips: baseCount * 2,  // 2 trips per user on average
    recommendations: baseCount, // 1 recommendation per user on average
  });
  
  console.log('✅ Database seeded successfully:');
  console.log(`   Users: ${result.users}`);
  console.log(`   Trails: ${result.trails}`);
  console.log(`   Trips: ${result.trips}`);
  console.log(`   Recommendations: ${result.recommendations}`);
}

async function showStatus() {
  console.log('📊 Database Status');
  console.log('==================');
  
  try {
    await dataSeeder.initialize();
    const counts = await dataSeeder.getDataCounts();
    
    console.log(`Users:          ${counts.users}`);
    console.log(`Trails:         ${counts.trails}`);
    console.log(`Trips:          ${counts.trips}`);
    console.log(`Recommendations: ${counts.recommendations}`);
    console.log(`Total documents: ${counts.users + counts.trails + counts.trips + counts.recommendations}`);
  } catch (error) {
    console.error('❌ Could not retrieve status:', error);
  }
}

async function checkHealth() {
  console.log('🏥 Checking database health...');
  
  try {
    const health = await databaseService.healthCheck();
    
    if (health.status === 'healthy') {
      console.log('✅ Database is healthy');
      console.log(`   Database: ${health.database}`);
    } else {
      console.log('❌ Database is unhealthy');
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}