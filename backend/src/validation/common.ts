import Joi from 'joi';

// Common validation schemas
export const coordinatesSchema = Joi.object({
  longitude: Joi.number().min(-180).max(180).required(),
  latitude: Joi.number().min(-90).max(90).required(),
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  flexibility: Joi.number().integer().min(0).max(30).optional(),
});

export const rangeSchema = Joi.object({
  min: Joi.number().min(0).required(),
  max: Joi.number().min(Joi.ref('min')).required(),
});

export const locationSchema = Joi.object({
  region: Joi.string().min(1).max(100).required(),
  coordinates: coordinatesSchema.required(),
});

export const geoLocationSchema = locationSchema.keys({
  city: Joi.string().min(1).max(100).required(),
  state: Joi.string().min(1).max(100).required(),
  country: Joi.string().min(1).max(100).required(),
  address: Joi.string().max(200).optional(),
});

export const budgetSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  currency: Joi.string().length(3).uppercase().required(),
  includesAccommodation: Joi.boolean().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

export const queryOptionsSchema = paginationSchema.keys({
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// Enum validations
export const difficultyLevelSchema = Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert');
export const terrainTypeSchema = Joi.string().valid('mountain', 'forest', 'desert', 'coastal', 'canyon', 'valley', 'alpine');
export const trailTypeSchema = Joi.string().valid('loop', 'out-and-back', 'point-to-point', 'shuttle');
export const surfaceTypeSchema = Joi.string().valid('rock', 'dirt', 'paved', 'gravel', 'sand', 'snow', 'stone-steps', 'boardwalk');