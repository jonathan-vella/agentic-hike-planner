#!/usr/bin/env npx ts-node

/**
 * Azure Data Seeding Script
 * Seeds the Azure Cosmos DB with sample hiking data for testing
 */

import { DatabaseService } from './src/services/database';
import { DataSeeder } from './src/services/dataSeeder';

async function seedAzureData() {
  console.log('🌱 Starting Azure Cosmos DB data seeding...');
  
  const databaseService = new DatabaseService(false); // Real Azure mode
  const dataSeeder = new DataSeeder(databaseService);
  
  try {
    // Initialize database connection
    console.log('🔗 Connecting to Azure Cosmos DB...');
    await databaseService.initialize();
    console.log('✅ Connected to Azure Cosmos DB');
    
    // Initialize the data seeder
    console.log('🔧 Initializing data seeder...');
    await dataSeeder.initialize();
    console.log('✅ Data seeder initialized');
    
    // Just seed a small amount of test data
    console.log('\n🌱 Seeding test data...');
    
    // Seed a few users
    console.log('👥 Creating 3 sample users...');
    const userIds = await dataSeeder.seedUsers(3);
    console.log(`✅ Created ${userIds.length} users`);
    
    // Seed a few trails
    console.log('🥾 Creating 5 sample trails...');
    const trailIds = await dataSeeder.seedTrails(5);
    console.log(`✅ Created ${trailIds.length} trails`);
    
    // Seed a few trips
    console.log('🗺️ Creating 3 sample trips...');
    const tripIds = await dataSeeder.seedTrips(userIds, 3);
    console.log(`✅ Created ${tripIds.length} trips`);
    
    console.log('\n🎉 Azure data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data seeding:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await databaseService.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding script
if (require.main === module) {
  seedAzureData();
}
