import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

interface Trail {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  length: number; // in miles
  elevationGain: number; // in feet
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  features: string[];
  estimatedTime: string;
  rating: number;
  reviewCount: number;
}

// Mock trail data
const mockTrails: Trail[] = [
  {
    id: 'trail-001',
    name: 'Mount Washington via Tuckerman Ravine',
    description: 'A challenging and popular route to the summit of Mount Washington, featuring beautiful alpine scenery and the famous Tuckerman Ravine.',
    difficulty: 'hard',
    length: 8.2,
    elevationGain: 4250,
    location: {
      name: 'White Mountain National Forest, NH',
      latitude: 44.2706,
      longitude: -71.3033,
    },
    features: ['Alpine zone', 'Rock scrambling', 'Waterfall', 'Summit views'],
    estimatedTime: '6-8 hours',
    rating: 4.5,
    reviewCount: 1247,
  },
  {
    id: 'trail-002',
    name: 'Franconia Ridge Loop',
    description: 'A spectacular loop trail featuring two 4000-foot peaks and stunning ridge walking with panoramic views.',
    difficulty: 'moderate',
    length: 8.9,
    elevationGain: 3750,
    location: {
      name: 'Franconia Notch State Park, NH',
      latitude: 44.1684,
      longitude: -71.6447,
    },
    features: ['Ridge walking', 'Multiple summits', 'Panoramic views', 'Alpine lakes'],
    estimatedTime: '6-7 hours',
    rating: 4.8,
    reviewCount: 2156,
  },
  {
    id: 'trail-003',
    name: 'Artists Bluff Trail',
    description: 'A short, family-friendly hike to a scenic overlook with views of Franconia Notch.',
    difficulty: 'easy',
    length: 1.5,
    elevationGain: 350,
    location: {
      name: 'Franconia Notch State Park, NH',
      latitude: 44.1797,
      longitude: -71.6883,
    },
    features: ['Scenic overlook', 'Family-friendly', 'Short hike', 'Photography'],
    estimatedTime: '1-2 hours',
    rating: 4.2,
    reviewCount: 895,
  },
  {
    id: 'trail-004',
    name: 'Mount Monadnock White Dot Trail',
    description: 'The most popular route up Mount Monadnock, featuring rock scrambling and excellent summit views.',
    difficulty: 'moderate',
    length: 3.8,
    elevationGain: 1900,
    location: {
      name: 'Monadnock State Park, NH',
      latitude: 42.8584,
      longitude: -72.1086,
    },
    features: ['Rock scrambling', 'Summit views', 'Historic trail', 'Bald summit'],
    estimatedTime: '4-5 hours',
    rating: 4.3,
    reviewCount: 1698,
  },
];

export class TrailsController {
  // Search trails with filters
  public searchTrails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { location, difficulty, maxDistance, limit = 20, offset = 0 } = req.query;

    let filteredTrails = [...mockTrails];

    // Filter by location (simple text search)
    if (location && typeof location === 'string') {
      filteredTrails = filteredTrails.filter(trail =>
        trail.location.name.toLowerCase().includes(location.toLowerCase()) ||
        trail.name.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by difficulty
    if (difficulty && typeof difficulty === 'string') {
      filteredTrails = filteredTrails.filter(trail => trail.difficulty === difficulty);
    }

    // Filter by maximum distance
    if (maxDistance && typeof maxDistance === 'string') {
      const maxDist = parseFloat(maxDistance);
      if (!isNaN(maxDist)) {
        filteredTrails = filteredTrails.filter(trail => trail.length <= maxDist);
      }
    }

    // Apply pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    const paginatedTrails = filteredTrails.slice(offsetNum, offsetNum + limitNum);

    res.status(200).json({
      trails: paginatedTrails,
      pagination: {
        total: filteredTrails.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < filteredTrails.length,
      },
      message: 'Trails retrieved successfully',
    });
  });

  // Get trail details by ID
  public getTrailById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const trail = mockTrails.find(t => t.id === id);

    if (!trail) {
      res.status(404).json({
        error: {
          message: 'Trail not found',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      trail,
      message: 'Trail retrieved successfully',
    });
  });

  // Get trail recommendations (mock AI integration)
  public getRecommendations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { difficulty, location, experienceLevel } = req.query;

    // Mock AI recommendation logic
    let recommendedTrails = [...mockTrails];

    // Simple recommendation algorithm (in real app, this would use Azure AI Foundry)
    if (difficulty && typeof difficulty === 'string') {
      recommendedTrails = recommendedTrails.filter(trail => trail.difficulty === difficulty);
    }

    if (experienceLevel === 'beginner') {
      recommendedTrails = recommendedTrails.filter(trail => 
        trail.difficulty === 'easy' || (trail.difficulty === 'moderate' && trail.length < 5)
      );
    }

    // Sort by rating and limit to top 5
    recommendedTrails = recommendedTrails
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    res.status(200).json({
      recommendations: recommendedTrails,
      message: 'Trail recommendations retrieved successfully',
      meta: {
        algorithm: 'mock-ai-v1',
        criteria: { difficulty, location, experienceLevel },
      },
    });
  });
}