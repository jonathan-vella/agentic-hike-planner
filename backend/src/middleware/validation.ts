import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        validationErrors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        validationErrors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate route parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        validationErrors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (validationErrors.length > 0) {
      const error = createError(`Validation failed: ${validationErrors.join('; ')}`, 400);
      next(error);
      return;
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  // Trip validation schemas
  createTrip: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    startDate: Joi.date().iso().min('now').required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
    location: Joi.object({
      name: Joi.string().required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).required(),
  }),

  updateTrip: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').optional(),
    location: Joi.object({
      name: Joi.string().required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),
  }),

  // Common parameter schemas
  idParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Trail search schema
  trailSearch: Joi.object({
    location: Joi.string().min(1).allow('').optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').optional(),
    maxDistance: Joi.number().positive().optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),
};