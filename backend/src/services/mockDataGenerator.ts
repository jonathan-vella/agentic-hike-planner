import { v4 as uuid } from 'uuid';
import { 
  UserProfile, 
  TripPlan, 
  Trail, 
  AIRecommendation,
  DifficultyLevel,
  TripStatus,
  TrailType,
  SurfaceType
} from '../types';

export class MockDataGenerator {
  
  // Generate random user profiles
  generateUsers(count: number = 10): UserProfile[] {
    const users: UserProfile[] = [];
    const cities = [
      { city: 'San Francisco', state: 'California', region: 'california-north' },
      { city: 'Los Angeles', state: 'California', region: 'california-south' },
      { city: 'Denver', state: 'Colorado', region: 'colorado-central' },
      { city: 'Seattle', state: 'Washington', region: 'washington-west' },
      { city: 'Portland', state: 'Oregon', region: 'oregon-north' },
      { city: 'Boulder', state: 'Colorado', region: 'colorado-north' },
      { city: 'Salt Lake City', state: 'Utah', region: 'utah-north' },
      { city: 'Phoenix', state: 'Arizona', region: 'arizona-central' },
    ];

    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Emily', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
    const fitnessLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const terrainTypes = ['mountain', 'forest', 'desert', 'coastal', 'canyon', 'valley', 'alpine'] as const;

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const location = cities[Math.floor(Math.random() * cities.length)];
      const userId = uuid();
      const fitnessLevel = fitnessLevels[Math.floor(Math.random() * fitnessLevels.length)];

      const user: UserProfile = {
        id: userId,
        partitionKey: userId,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        displayName: `${firstName} ${lastName}`,
        fitnessLevel,
        preferences: {
          preferredDifficulty: [fitnessLevel],
          maxHikingDistance: Math.floor(Math.random() * 50) + 5, // 5-55 km
          terrainTypes: this.getRandomSubset([...terrainTypes], 1, 3),
          groupSize: ['solo', 'small', 'large', 'any'][Math.floor(Math.random() * 4)] as any,
        },
        location: {
          ...location,
          country: 'USA',
          coordinates: {
            longitude: -120 + Math.random() * 20, // Rough West Coast USA
            latitude: 32 + Math.random() * 15,
          },
        },
        createdAt: this.getRandomDate(90), // Within last 90 days
        updatedAt: this.getRandomDate(30), // Within last 30 days
        isActive: Math.random() > 0.1, // 90% active
      };

      users.push(user);
    }

    return users;
  }

  // Generate realistic trail data
  generateTrails(count: number = 50): Trail[] {
    const trails: Trail[] = [];
    const trailNames = [
      'Mist Trail to Vernal Fall',
      'Angels Landing',
      'Half Dome',
      'Mount Whitney Trail',
      'Bright Angel Trail',
      'Emerald Lake Trail',
      'Hidden Lake Overlook',
      'Cascade Canyon Trail',
      'Delicate Arch Trail',
      'Observation Point',
      'The Narrows',
      'Zion Canyon Overlook',
      'Mesa Arch Trail',
      'Skyline Trail',
      'Panorama Trail',
      'Four Mile Trail',
      'Nevada Fall Trail',
      'Grinnell Glacier',
      'Highline Trail',
      'Mount Elbert Trail',
    ];

    const parks = [
      'Yosemite National Park',
      'Zion National Park',
      'Glacier National Park',
      'Grand Canyon National Park',
      'Rocky Mountain National Park',
      'Arches National Park',
      'Canyonlands National Park',
      'Sequoia National Park',
      'Olympic National Park',
      'Mount Rainier National Park',
    ];

    const regions = [
      'california-north',
      'california-south',
      'utah-south',
      'arizona-north',
      'colorado-central',
      'montana-north',
      'washington-west',
      'oregon-south',
    ];

    const difficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const trailTypes: TrailType[] = ['loop', 'out-and-back', 'point-to-point', 'shuttle'];
    const surfaces: SurfaceType[] = ['rock', 'dirt', 'paved', 'gravel', 'stone-steps'];
    const wildlife = ['deer', 'bears', 'eagles', 'marmots', 'bighorn sheep', 'mountain goats', 'chipmunks', 'ravens'];
    const hazards = ['steep cliffs', 'river crossings', 'loose rock', 'altitude', 'weather changes', 'wildlife encounters'];

    for (let i = 0; i < count; i++) {
      const name = trailNames[Math.floor(Math.random() * trailNames.length)] + (i > trailNames.length ? ` ${i}` : '');
      const park = parks[Math.floor(Math.random() * parks.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const distance = this.getRandomDistance(difficulty);
      const elevationGain = this.getRandomElevation(difficulty, distance);

      const trail: Trail = {
        id: uuid(),
        partitionKey: region,
        name,
        description: this.generateTrailDescription(name, park, difficulty),
        location: {
          region: region.split('-')[0],
          park,
          country: 'USA',
          coordinates: {
            start: {
              longitude: -120 + Math.random() * 20,
              latitude: 32 + Math.random() * 15,
            },
            end: {
              longitude: -120 + Math.random() * 20,
              latitude: 32 + Math.random() * 15,
            },
            waypoints: [],
          },
        },
        characteristics: {
          difficulty,
          distance,
          duration: {
            min: Math.floor(distance * 0.8), // Rough hours estimate
            max: Math.floor(distance * 1.5),
          },
          elevationGain,
          elevationProfile: this.generateElevationProfile(distance, elevationGain),
          trailType: trailTypes[Math.floor(Math.random() * trailTypes.length)],
          surface: this.getRandomSubset(surfaces, 1, 3),
        },
        features: {
          scenicViews: Math.random() > 0.3,
          waterFeatures: Math.random() > 0.5,
          wildlife: this.getRandomSubset(wildlife, 0, 4),
          seasonality: {
            bestMonths: this.getBestMonths(region),
            accessibleMonths: this.getAccessibleMonths(region),
          },
        },
        safety: {
          riskLevel: this.getRiskLevel(difficulty),
          commonHazards: this.getRandomSubset(hazards, 0, 3),
          requiresPermit: Math.random() > 0.7,
          emergencyContacts: ['911', 'Park Ranger Station'],
        },
        amenities: {
          parking: Math.random() > 0.2,
          restrooms: Math.random() > 0.4,
          camping: Math.random() > 0.6,
          drinkingWater: Math.random() > 0.5,
        },
        ratings: {
          average: 3 + Math.random() * 2, // 3.0 - 5.0
          count: Math.floor(Math.random() * 500) + 10,
          breakdown: this.generateRatingBreakdown(),
        },
        createdAt: this.getRandomDate(365), // Within last year
        updatedAt: this.getRandomDate(90),
        isActive: Math.random() > 0.05, // 95% active
      };

      trails.push(trail);
    }

    return trails;
  }

  // Generate trip plans
  generateTrips(userIds: string[], count: number = 30): TripPlan[] {
    const trips: TripPlan[] = [];
    const statuses: TripStatus[] = ['planning', 'confirmed', 'completed', 'cancelled'];
    const titles = [
      'Yosemite Adventure',
      'Grand Canyon Exploration',
      'Rocky Mountain High',
      'Pacific Coast Trail',
      'Desert Wandering',
      'Alpine Challenge',
      'Forest Hiking Weekend',
      'Mountain Peak Quest',
      'Canyon Discovery',
      'Wilderness Escape',
    ];

    for (let i = 0; i < count; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const title = titles[Math.floor(Math.random() * titles.length)] + (i > titles.length ? ` ${i}` : '');
      const startDate = this.getFutureDate(Math.random() * 180); // 0-180 days in future
      const endDate = new Date(startDate.getTime() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000); // 1-8 days

      const trip: TripPlan = {
        id: uuid(),
        partitionKey: userId,
        userId,
        title,
        description: `A wonderful hiking adventure exploring the best trails in the region. Perfect for ${['solo travelers', 'small groups', 'families', 'experienced hikers'][Math.floor(Math.random() * 4)]}.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        dates: {
          startDate,
          endDate,
          flexibility: Math.floor(Math.random() * 7), // 0-7 days flexibility
        },
        location: {
          region: ['california', 'colorado', 'utah', 'arizona'][Math.floor(Math.random() * 4)],
          coordinates: {
            longitude: -120 + Math.random() * 20,
            latitude: 32 + Math.random() * 15,
          },
          radius: Math.floor(Math.random() * 100) + 50, // 50-150 km
        },
        participants: {
          count: Math.floor(Math.random() * 6) + 1, // 1-6 people
          fitnessLevels: this.getRandomSubset(['beginner', 'intermediate', 'advanced', 'expert'], 1, 3),
          specialRequirements: Math.random() > 0.7 ? ['wheelchair accessible'] : [],
        },
        preferences: {
          difficulty: this.getRandomSubset(['beginner', 'intermediate', 'advanced', 'expert'], 1, 3),
          duration: { min: 2, max: 8 }, // 2-8 hours
          distance: { min: 5, max: 20 }, // 5-20 km
          elevationGain: { min: 100, max: 1500 }, // 100-1500 meters
          trailTypes: this.getRandomSubset(['loop', 'out-and-back', 'point-to-point'], 1, 2),
        },
        selectedTrails: [], // Will be populated separately
        equipment: this.getRandomEquipment(),
        budget: {
          amount: Math.floor(Math.random() * 2000) + 500, // $500-2500
          currency: 'USD',
          includesAccommodation: Math.random() > 0.5,
        },
        createdAt: this.getRandomDate(60),
        updatedAt: this.getRandomDate(30),
      };

      trips.push(trip);
    }

    return trips;
  }

  // Generate AI recommendations
  generateRecommendations(userIds: string[], tripIds: string[], trailIds: string[], count: number = 20): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    for (let i = 0; i < count; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const tripId = tripIds[Math.floor(Math.random() * tripIds.length)];
      const selectedTrails = this.getRandomSubset(trailIds, 1, 5);
      const confidence = 0.5 + Math.random() * 0.5; // 0.5-1.0

      const recommendation: AIRecommendation = {
        id: uuid(),
        partitionKey: userId,
        userId,
        tripId,
        trailIds: selectedTrails,
        reasoning: this.generateRecommendationReasoning(confidence),
        confidence,
        factors: {
          fitnessMatch: Math.random(),
          preferenceAlignment: Math.random(),
          seasonalSuitability: Math.random(),
          safetyConsiderations: Math.random(),
        },
        alternatives: this.generateAlternatives(trailIds, selectedTrails),
        createdAt: this.getRandomDate(7),
        updatedAt: this.getRandomDate(3),
        expiresAt: this.getFutureDate(30 + Math.random() * 30), // 30-60 days from now
      };

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  // Helper methods
  private getRandomSubset<T>(array: T[], minCount: number, maxCount: number): T[] {
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private getRandomDate(daysBack: number): Date {
    const now = new Date();
    const msBack = Math.random() * daysBack * 24 * 60 * 60 * 1000;
    return new Date(now.getTime() - msBack);
  }

  private getFutureDate(daysAhead: number): Date {
    const now = new Date();
    const msAhead = Math.random() * daysAhead * 24 * 60 * 60 * 1000;
    return new Date(now.getTime() + msAhead);
  }

  private getRandomDistance(difficulty: DifficultyLevel): number {
    const ranges = {
      beginner: { min: 1, max: 8 },
      intermediate: { min: 5, max: 15 },
      advanced: { min: 10, max: 25 },
      expert: { min: 15, max: 50 },
    };
    const range = ranges[difficulty];
    return Math.round((Math.random() * (range.max - range.min) + range.min) * 10) / 10;
  }

  private getRandomElevation(difficulty: DifficultyLevel, distance: number): number {
    const baseElevation = distance * 50; // 50m per km base
    const multipliers = {
      beginner: 0.5,
      intermediate: 1.0,
      advanced: 1.5,
      expert: 2.0,
    };
    return Math.floor(baseElevation * multipliers[difficulty] * (0.5 + Math.random()));
  }

  private getRiskLevel(difficulty: DifficultyLevel): number {
    const riskLevels = {
      beginner: 1 + Math.floor(Math.random() * 2), // 1-2
      intermediate: 2 + Math.floor(Math.random() * 2), // 2-3
      advanced: 3 + Math.floor(Math.random() * 2), // 3-4
      expert: 4 + Math.floor(Math.random() * 2), // 4-5
    };
    return riskLevels[difficulty];
  }

  private generateElevationProfile(distance: number, totalGain: number): number[] {
    const points = Math.floor(distance * 2); // 2 points per km
    const profile: number[] = [0]; // Start at 0
    
    for (let i = 1; i < points; i++) {
      const progress = i / (points - 1);
      const targetElevation = totalGain * Math.sin(progress * Math.PI); // Bell curve
      const variation = (Math.random() - 0.5) * totalGain * 0.1; // 10% variation
      profile.push(Math.max(0, Math.floor(targetElevation + variation)));
    }
    
    return profile;
  }

  private generateTrailDescription(name: string, park: string, difficulty: DifficultyLevel): string {
    const descriptions = {
      beginner: `A gentle and accessible trail perfect for families and beginners. ${name} offers beautiful scenery without challenging terrain.`,
      intermediate: `A moderately challenging hike with rewarding views. ${name} in ${park} provides a great workout with stunning vistas.`,
      advanced: `An challenging trail for experienced hikers. ${name} demands good fitness and preparation but rewards with spectacular views.`,
      expert: `An extremely demanding trail for expert hikers only. ${name} requires exceptional fitness, experience, and proper equipment.`,
    };
    return descriptions[difficulty];
  }

  private getBestMonths(region: string): number[] {
    const monthsByRegion: Record<string, number[]> = {
      'california-north': [4, 5, 6, 9, 10],
      'california-south': [3, 4, 5, 10, 11],
      'colorado-central': [6, 7, 8, 9],
      'utah-south': [4, 5, 9, 10],
      'arizona-central': [3, 4, 10, 11],
      'washington-west': [6, 7, 8, 9],
      'montana-north': [6, 7, 8],
      'oregon-south': [5, 6, 7, 8, 9],
    };
    return monthsByRegion[region] || [6, 7, 8];
  }

  private getAccessibleMonths(region: string): number[] {
    const bestMonths = this.getBestMonths(region);
    const extended = [...bestMonths];
    
    // Add shoulder months
    bestMonths.forEach(month => {
      if (month > 1 && !extended.includes(month - 1)) extended.push(month - 1);
      if (month < 12 && !extended.includes(month + 1)) extended.push(month + 1);
    });
    
    return extended.sort((a, b) => a - b);
  }

  private generateRatingBreakdown(): { [key: number]: number } {
    const total = Math.floor(Math.random() * 500) + 10;
    const breakdown: { [key: number]: number } = {};
    
    let remaining = total;
    for (let rating = 5; rating >= 1; rating--) {
      if (rating === 1) {
        breakdown[rating] = remaining;
      } else {
        const count = Math.floor(remaining * (0.1 + Math.random() * 0.4));
        breakdown[rating] = count;
        remaining -= count;
      }
    }
    
    return breakdown;
  }

  private getRandomEquipment(): string[] {
    const equipment = [
      'hiking boots', 'backpack', 'water bottles', 'first aid kit',
      'map and compass', 'headlamp', 'rain jacket', 'snacks',
      'trekking poles', 'sun hat', 'sunglasses', 'sunscreen',
      'warm layers', 'emergency whistle', 'multi-tool', 'camera',
    ];
    return this.getRandomSubset(equipment, 5, 10);
  }

  private generateRecommendationReasoning(confidence: number): string {
    if (confidence > 0.9) {
      return 'Excellent match based on your fitness level, preferences, and past hiking history. These trails align perfectly with your goals.';
    } else if (confidence > 0.8) {
      return 'Strong recommendation based on your preferences and the trail characteristics. Very likely to be a great fit.';
    } else if (confidence > 0.7) {
      return 'Good match for your hiking style and fitness level. These trails should provide an enjoyable experience.';
    } else {
      return 'Moderate recommendation based on available options. Consider these trails but verify they meet your specific needs.';
    }
  }

  private generateAlternatives(allTrailIds: string[], selectedTrailIds: string[]): Array<{ trailId: string; reason: string; confidence: number }> {
    const available = allTrailIds.filter(id => !selectedTrailIds.includes(id));
    const alternativeCount = Math.floor(Math.random() * 3) + 1; // 1-3 alternatives
    const selected = this.getRandomSubset(available, 0, Math.min(alternativeCount, available.length));
    
    const reasons = [
      'Similar difficulty but different scenery',
      'Shorter distance for time constraints',
      'Better weather conditions expected',
      'Lower crowd density',
      'More accessible parking',
      'Additional wildlife viewing opportunities',
    ];

    return selected.map(trailId => ({
      trailId,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      confidence: 0.3 + Math.random() * 0.4, // 0.3-0.7
    }));
  }
}