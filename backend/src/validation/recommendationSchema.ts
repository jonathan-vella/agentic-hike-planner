import Joi from 'joi';
import { coordinatesSchema } from './common';

// Recommendation factors validation
export const recommendationFactorsSchema = Joi.object({
  fitnessMatch: Joi.number().min(0).max(1).required(),
  preferenceAlignment: Joi.number().min(0).max(1).required(),
  seasonalSuitability: Joi.number().min(0).max(1).required(),
  safetyConsiderations: Joi.number().min(0).max(1).required(),
});

// Recommendation alternative validation
export const recommendationAlternativeSchema = Joi.object({
  trailId: Joi.string().uuid().required(),
  reason: Joi.string().max(500).required(),
  confidence: Joi.number().min(0).max(1).required(),
});

// AI recommendation validation
export const aiRecommendationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  tripId: Joi.string().uuid().required(),
  trailIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  reasoning: Joi.string().max(1000).required(),
  confidence: Joi.number().min(0).max(1).required(),
  factors: recommendationFactorsSchema.required(),
  alternatives: Joi.array().items(recommendationAlternativeSchema).default([]),
  expiresAt: Joi.date().greater('now').required(),
});

// Generate recommendation request validation
export const generateRecommendationRequestSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  tripId: Joi.string().uuid().required(),
  preferences: Joi.object({
    difficulty: Joi.array().items(Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert')).min(1).required(),
    maxDistance: Joi.number().min(0.1).max(1000).required(),
    duration: Joi.object({
      min: Joi.number().min(0).required(),
      max: Joi.number().min(Joi.ref('min')).required(),
    }).required(),
    features: Joi.array().items(Joi.string().max(50)).optional(),
  }).required(),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    radius: Joi.number().min(1).max(500).required(),
  }).required(),
});

// Recommendation feedback validation
export const recommendationFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  useful: Joi.boolean().required(),
  issues: Joi.array().items(Joi.string().max(200)).optional(),
  selectedTrail: Joi.string().uuid().optional(),
});

// AI context validation (for internal use)
export const aiContextSchema = Joi.object({
  userProfile: Joi.object({
    fitnessLevel: Joi.string().required(),
    experience: Joi.array().items(Joi.string()).required(),
    preferences: Joi.object().required(),
  }).required(),
  tripRequirements: Joi.object({
    dates: Joi.object({
      start: Joi.date().required(),
      end: Joi.date().min(Joi.ref('start')).required(),
    }).required(),
    participants: Joi.number().integer().min(1).required(),
    preferences: Joi.object().required(),
  }).required(),
  availableTrails: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      characteristics: Joi.object().required(),
      location: Joi.object().required(),
    })
  ).required(),
  weatherData: Joi.object({
    forecast: Joi.object().optional(),
    seasonal: Joi.object().optional(),
  }).optional(),
});