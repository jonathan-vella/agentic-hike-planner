import Joi from 'joi';
import { difficultyLevelSchema, terrainTypeSchema, geoLocationSchema, coordinatesSchema } from './common';

// User preferences validation
export const userPreferencesSchema = Joi.object({
  preferredDifficulty: Joi.array().items(difficultyLevelSchema).min(1).required(),
  maxHikingDistance: Joi.number().min(0).max(1000).required(), // km
  terrainTypes: Joi.array().items(terrainTypeSchema).min(1).required(),
  groupSize: Joi.string().valid('solo', 'small', 'large', 'any').required(),
});

// User profile validation
export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  displayName: Joi.string().min(2).max(50).required(),
  fitnessLevel: difficultyLevelSchema.required(),
  preferences: userPreferencesSchema.required(),
  location: geoLocationSchema.required(),
});

export const updateUserSchema = Joi.object({
  displayName: Joi.string().min(2).max(50).optional(),
  fitnessLevel: difficultyLevelSchema.optional(),
  preferences: userPreferencesSchema.optional(),
  location: geoLocationSchema.optional(),
}).min(1); // At least one field must be provided

export const loginCredentialsSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// User location validation (with optional coordinates for privacy)
export const userLocationSchema = geoLocationSchema.keys({
  coordinates: coordinatesSchema.optional(),
});

// User statistics validation
export const userStatisticsSchema = Joi.object({
  totalTrips: Joi.number().integer().min(0).required(),
  totalDistance: Joi.number().min(0).required(),
  totalElevationGain: Joi.number().min(0).required(),
  favoriteTrails: Joi.array().items(Joi.string().uuid()).required(),
  completedTrails: Joi.number().integer().min(0).required(),
});