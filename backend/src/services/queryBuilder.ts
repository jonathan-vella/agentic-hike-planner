import { SqlQuerySpec } from '@azure/cosmos';
import { TrailSearchFilters, DifficultyLevel, TrailType } from '../types';

export class TrailQueryBuilder {
  private whereConditions: string[] = [];
  private parameters: any[] = [];
  private orderByClause: string = '';
  private offsetLimit: string = '';

  constructor() {
    // Always include active trails
    this.whereConditions.push('c.isActive = true');
  }

  // Text search across multiple fields
  withTextSearch(searchTerm: string): this {
    if (searchTerm && searchTerm.trim()) {
      this.whereConditions.push(`(
        CONTAINS(LOWER(c.name), LOWER(@searchTerm))
        OR CONTAINS(LOWER(c.description), LOWER(@searchTerm))
        OR CONTAINS(LOWER(c.location.park), LOWER(@searchTerm))
        OR CONTAINS(LOWER(c.location.region), LOWER(@searchTerm))
      )`);
      this.parameters.push({ name: '@searchTerm', value: searchTerm.trim() });
    }
    return this;
  }

  // Filter by difficulty levels
  withDifficulty(difficulties: DifficultyLevel[]): this {
    if (difficulties && difficulties.length > 0) {
      this.whereConditions.push('c.characteristics.difficulty IN (@difficulties)');
      this.parameters.push({ name: '@difficulties', value: difficulties });
    }
    return this;
  }

  // Filter by distance range
  withDistanceRange(minDistance?: number, maxDistance?: number): this {
    if (minDistance !== undefined && minDistance >= 0) {
      this.whereConditions.push('c.characteristics.distance >= @minDistance');
      this.parameters.push({ name: '@minDistance', value: minDistance });
    }
    if (maxDistance !== undefined && maxDistance > 0) {
      this.whereConditions.push('c.characteristics.distance <= @maxDistance');
      this.parameters.push({ name: '@maxDistance', value: maxDistance });
    }
    return this;
  }

  // Filter by duration range (in hours)
  withDurationRange(minDuration?: number, maxDuration?: number): this {
    if (minDuration !== undefined && minDuration >= 0) {
      this.whereConditions.push('c.characteristics.duration.min >= @minDuration');
      this.parameters.push({ name: '@minDuration', value: minDuration });
    }
    if (maxDuration !== undefined && maxDuration > 0) {
      this.whereConditions.push('c.characteristics.duration.max <= @maxDuration');
      this.parameters.push({ name: '@maxDuration', value: maxDuration });
    }
    return this;
  }

  // Filter by elevation gain range
  withElevationRange(minElevation?: number, maxElevation?: number): this {
    if (minElevation !== undefined && minElevation >= 0) {
      this.whereConditions.push('c.characteristics.elevationGain >= @minElevation');
      this.parameters.push({ name: '@minElevation', value: minElevation });
    }
    if (maxElevation !== undefined && maxElevation > 0) {
      this.whereConditions.push('c.characteristics.elevationGain <= @maxElevation');
      this.parameters.push({ name: '@maxElevation', value: maxElevation });
    }
    return this;
  }

  // Filter by trail types
  withTrailTypes(trailTypes: TrailType[]): this {
    if (trailTypes && trailTypes.length > 0) {
      this.whereConditions.push('c.characteristics.trailType IN (@trailTypes)');
      this.parameters.push({ name: '@trailTypes', value: trailTypes });
    }
    return this;
  }

  // Filter by region
  withRegion(region: string): this {
    if (region && region.trim()) {
      this.whereConditions.push('c.location.region = @region');
      this.parameters.push({ name: '@region', value: region.trim() });
    }
    return this;
  }

  // Filter by park
  withPark(park: string): this {
    if (park && park.trim()) {
      this.whereConditions.push('c.location.park = @park');
      this.parameters.push({ name: '@park', value: park.trim() });
    }
    return this;
  }

  // Filter by minimum rating
  withMinimumRating(minRating: number): this {
    if (minRating > 0 && minRating <= 5) {
      this.whereConditions.push('c.ratings.average >= @minRating');
      this.parameters.push({ name: '@minRating', value: minRating });
    }
    return this;
  }

  // Filter by features
  withFeatures(features: string[]): this {
    if (features && features.length > 0) {
      const featureConditions: string[] = [];

      features.forEach((feature, index) => {
        switch (feature.toLowerCase()) {
        case 'scenic views':
        case 'scenicviews':
          featureConditions.push('c.features.scenicViews = true');
          break;
        case 'water features':
        case 'waterfeatures':
          featureConditions.push('c.features.waterFeatures = true');
          break;
        case 'wildlife':
          featureConditions.push('ARRAY_LENGTH(c.features.wildlife) > 0');
          break;
        default:
          // Generic feature search in wildlife array
          featureConditions.push(`ARRAY_CONTAINS(c.features.wildlife, @feature${index})`);
          this.parameters.push({ name: `@feature${index}`, value: feature });
        }
      });

      if (featureConditions.length > 0) {
        this.whereConditions.push(`(${featureConditions.join(' OR ')})`);
      }
    }
    return this;
  }

  // Filter by amenities
  withAmenities(amenities: string[]): this {
    if (amenities && amenities.length > 0) {
      const amenityConditions: string[] = [];

      amenities.forEach(amenity => {
        switch (amenity.toLowerCase()) {
        case 'parking':
          amenityConditions.push('c.amenities.parking = true');
          break;
        case 'restrooms':
          amenityConditions.push('c.amenities.restrooms = true');
          break;
        case 'camping':
          amenityConditions.push('c.amenities.camping = true');
          break;
        case 'drinking water':
        case 'drinkingwater':
          amenityConditions.push('c.amenities.drinkingWater = true');
          break;
        }
      });

      if (amenityConditions.length > 0) {
        this.whereConditions.push(`(${amenityConditions.join(' OR ')})`);
      }
    }
    return this;
  }

  // Filter by seasonal availability
  withSeasonalAvailability(month: number): this {
    if (month >= 1 && month <= 12) {
      this.whereConditions.push('ARRAY_CONTAINS(c.features.seasonality.accessibleMonths, @month)');
      this.parameters.push({ name: '@month', value: month });
    }
    return this;
  }

  // Filter by risk level
  withMaxRiskLevel(maxRiskLevel: number): this {
    if (maxRiskLevel >= 1 && maxRiskLevel <= 5) {
      this.whereConditions.push('c.safety.riskLevel <= @maxRiskLevel');
      this.parameters.push({ name: '@maxRiskLevel', value: maxRiskLevel });
    }
    return this;
  }

  // Filter trails that don't require permits
  withoutPermitRequired(): this {
    this.whereConditions.push('c.safety.requiresPermit = false');
    return this;
  }

  // Sort by various criteria
  sortBy(field: string, order: 'asc' | 'desc' = 'desc'): this {
    const orderDirection = order.toUpperCase();
    
    switch (field) {
    case 'rating':
      this.orderByClause = `ORDER BY c.ratings.average ${orderDirection}`;
      break;
    case 'distance':
      this.orderByClause = `ORDER BY c.characteristics.distance ${orderDirection}`;
      break;
    case 'difficulty':
      // Custom sorting for difficulty levels
      this.orderByClause = `ORDER BY (
          CASE c.characteristics.difficulty
            WHEN 'beginner' THEN 1
            WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3
            WHEN 'expert' THEN 4
            ELSE 5
          END
        ) ${orderDirection}`;
      break;
    case 'popularity':
      this.orderByClause = `ORDER BY c.ratings.count ${orderDirection}`;
      break;
    case 'elevation':
      this.orderByClause = `ORDER BY c.characteristics.elevationGain ${orderDirection}`;
      break;
    case 'name':
      this.orderByClause = `ORDER BY c.name ${orderDirection}`;
      break;
    case 'created':
      this.orderByClause = `ORDER BY c.createdAt ${orderDirection}`;
      break;
    default:
      this.orderByClause = `ORDER BY c.ratings.average ${orderDirection}`;
    }
    return this;
  }

  // Add pagination
  withPagination(offset: number = 0, limit: number = 20): this {
    this.offsetLimit = `OFFSET ${Math.max(0, offset)} LIMIT ${Math.min(100, Math.max(1, limit))}`;
    return this;
  }

  // Apply all filters from a filter object
  withFilters(filters: TrailSearchFilters): this {
    if (filters.difficulty) {
      this.withDifficulty(filters.difficulty);
    }

    if (filters.distance) {
      this.withDistanceRange(filters.distance.min, filters.distance.max);
    }

    if (filters.duration) {
      this.withDurationRange(filters.duration.min, filters.duration.max);
    }

    if (filters.elevationGain) {
      this.withElevationRange(filters.elevationGain.min, filters.elevationGain.max);
    }

    if (filters.trailType) {
      this.withTrailTypes(filters.trailType);
    }

    if (filters.rating) {
      this.withMinimumRating(filters.rating.min || 0);
    }

    if (filters.features) {
      this.withFeatures(filters.features);
    }

    if (filters.amenities) {
      this.withAmenities(filters.amenities);
    }

    // Location filter (simplified - in production you'd use geospatial queries)
    if (filters.location) {
      // For now, we'll skip geospatial queries and just use region-based search
      // In a real implementation, you'd use ST_DISTANCE for proper geospatial filtering
    }

    return this;
  }

  // Build the final query
  build(): SqlQuerySpec {
    let query = 'SELECT * FROM c';
    
    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.orderByClause) {
      query += ` ${this.orderByClause}`;
    }

    if (this.offsetLimit) {
      query += ` ${this.offsetLimit}`;
    }

    return {
      query,
      parameters: this.parameters,
    };
  }

  // Build a count query (for pagination)
  buildCountQuery(): SqlQuerySpec {
    let query = 'SELECT VALUE COUNT(1) FROM c';
    
    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    return {
      query,
      parameters: this.parameters,
    };
  }

  // Reset the builder to start fresh
  reset(): this {
    this.whereConditions = ['c.isActive = true'];
    this.parameters = [];
    this.orderByClause = '';
    this.offsetLimit = '';
    return this;
  }

  // Get a summary of applied filters (for debugging)
  getFilterSummary(): {
    whereConditions: string[];
    parameterCount: number;
    orderBy: string;
    pagination: string;
    } {
    return {
      whereConditions: this.whereConditions,
      parameterCount: this.parameters.length,
      orderBy: this.orderByClause,
      pagination: this.offsetLimit,
    };
  }
}