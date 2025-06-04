import Joi from 'joi';
import { 
  difficultyLevelSchema, 
  trailTypeSchema, 
  dateRangeSchema, 
  rangeSchema, 
  budgetSchema, 
  coordinatesSchema 
} from './common';

// Trip location validation
export const tripLocationSchema = Joi.object({
  region: Joi.string().min(1).max(100).required(),
  coordinates: coordinatesSchema.required(),
  radius: Joi.number().min(1).max(500).required(), // km
});

// Trip participants validation
export const tripParticipantsSchema = Joi.object({
  count: Joi.number().integer().min(1).max(50).required(),
  fitnessLevels: Joi.array().items(difficultyLevelSchema).min(1).required(),
  specialRequirements: Joi.array().items(Joi.string().max(100)).default([]),
});

// Trip preferences validation
export const tripPreferencesSchema = Joi.object({
  difficulty: Joi.array().items(difficultyLevelSchema).min(1).required(),
  duration: rangeSchema.required(), // hours
  distance: rangeSchema.required(), // km
  elevationGain: rangeSchema.required(), // meters
  trailTypes: Joi.array().items(trailTypeSchema).min(1).required(),
});

// Create trip validation
export const createTripSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional().default(''),
  dates: dateRangeSchema.required(),
  location: tripLocationSchema.required(),
  participants: tripParticipantsSchema.required(),
  preferences: tripPreferencesSchema.required(),
  budget: budgetSchema.optional(),
});

// Update trip validation
export const updateTripSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  status: Joi.string().valid('planning', 'confirmed', 'completed', 'cancelled').optional(),
  dates: dateRangeSchema.optional(),
  location: tripLocationSchema.optional(),
  participants: tripParticipantsSchema.optional(),
  preferences: tripPreferencesSchema.optional(),
  selectedTrails: Joi.array().items(Joi.string().uuid()).optional(),
  equipment: Joi.array().items(Joi.string().max(50)).optional(),
  budget: budgetSchema.optional(),
}).min(1); // At least one field must be provided

// Trip summary validation
export const tripSummarySchema = Joi.object({
  id: Joi.string().uuid().required(),
  title: Joi.string().required(),
  status: Joi.string().valid('planning', 'confirmed', 'completed', 'cancelled').required(),
  dates: dateRangeSchema.required(),
  trailCount: Joi.number().integer().min(0).required(),
  participantCount: Joi.number().integer().min(1).required(),
});