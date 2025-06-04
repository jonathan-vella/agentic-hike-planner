import Joi from 'joi';
import { 
  difficultyLevelSchema, 
  trailTypeSchema, 
  surfaceTypeSchema, 
  rangeSchema, 
  coordinatesSchema 
} from './common';

// Trail coordinates validation
export const trailCoordinatesSchema = Joi.object({
  start: coordinatesSchema.required(),
  end: coordinatesSchema.required(),
  waypoints: Joi.array().items(coordinatesSchema).default([]),
});

// Trail location validation
export const trailLocationSchema = Joi.object({
  region: Joi.string().min(1).max(100).required(),
  park: Joi.string().min(1).max(100).required(),
  country: Joi.string().min(1).max(100).required(),
  coordinates: trailCoordinatesSchema.required(),
});

// Trail characteristics validation
export const trailCharacteristicsSchema = Joi.object({
  difficulty: difficultyLevelSchema.required(),
  distance: Joi.number().min(0.1).max(1000).required(), // km
  duration: rangeSchema.required(), // hours
  elevationGain: Joi.number().min(0).max(10000).required(), // meters
  elevationProfile: Joi.array().items(Joi.number()).default([]),
  trailType: trailTypeSchema.required(),
  surface: Joi.array().items(surfaceTypeSchema).min(1).required(),
});

// Trail seasonality validation
export const trailSeasonalitySchema = Joi.object({
  bestMonths: Joi.array().items(Joi.number().integer().min(1).max(12)).min(1).required(),
  accessibleMonths: Joi.array().items(Joi.number().integer().min(1).max(12)).min(1).required(),
});

// Trail features validation
export const trailFeaturesSchema = Joi.object({
  scenicViews: Joi.boolean().required(),
  waterFeatures: Joi.boolean().required(),
  wildlife: Joi.array().items(Joi.string().max(50)).default([]),
  seasonality: trailSeasonalitySchema.required(),
});

// Trail safety validation
export const trailSafetySchema = Joi.object({
  riskLevel: Joi.number().integer().min(1).max(5).required(),
  commonHazards: Joi.array().items(Joi.string().max(100)).default([]),
  requiresPermit: Joi.boolean().required(),
  emergencyContacts: Joi.array().items(Joi.string().max(200)).default([]),
});

// Trail amenities validation
export const trailAmenitiesSchema = Joi.object({
  parking: Joi.boolean().required(),
  restrooms: Joi.boolean().required(),
  camping: Joi.boolean().required(),
  drinkingWater: Joi.boolean().required(),
});

// Trail ratings validation
export const trailRatingsSchema = Joi.object({
  average: Joi.number().min(0).max(5).required(),
  count: Joi.number().integer().min(0).required(),
  breakdown: Joi.object().pattern(
    Joi.number().integer().min(1).max(5),
    Joi.number().integer().min(0)
  ).required(),
});

// Complete trail validation
export const trailSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).required(),
  location: trailLocationSchema.required(),
  characteristics: trailCharacteristicsSchema.required(),
  features: trailFeaturesSchema.required(),
  safety: trailSafetySchema.required(),
  amenities: trailAmenitiesSchema.required(),
  ratings: trailRatingsSchema.required(),
  isActive: Joi.boolean().default(true),
});

// Trail search filters validation
export const trailSearchFiltersSchema = Joi.object({
  difficulty: Joi.array().items(difficultyLevelSchema).optional(),
  distance: rangeSchema.optional(),
  duration: rangeSchema.optional(),
  elevationGain: rangeSchema.optional(),
  location: Joi.object({
    coordinates: coordinatesSchema.required(),
    radius: Joi.number().min(1).max(500).required(),
  }).optional(),
  features: Joi.array().items(Joi.string().max(50)).optional(),
  amenities: Joi.array().items(Joi.string().max(50)).optional(),
  rating: rangeSchema.optional(),
  trailType: Joi.array().items(trailTypeSchema).optional(),
});

// Trail search request validation
export const trailSearchRequestSchema = Joi.object({
  query: Joi.string().max(200).optional(),
  filters: trailSearchFiltersSchema.optional(),
  sortBy: Joi.string().valid('distance', 'difficulty', 'rating', 'popularity').default('rating'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

// Trail recommendation request validation
export const trailRecommendationRequestSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  location: coordinatesSchema.required(),
  preferences: Joi.object({
    difficulty: Joi.array().items(difficultyLevelSchema).min(1).required(),
    maxDistance: Joi.number().min(0.1).max(1000).required(),
    duration: rangeSchema.required(),
    features: Joi.array().items(Joi.string().max(50)).optional(),
  }).required(),
  limit: Joi.number().integer().min(1).max(50).default(10),
});