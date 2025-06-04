import { Container, SqlQuerySpec } from '@azure/cosmos';
import { BaseRepository } from './BaseRepository';
import { AIRecommendation, GenerateRecommendationRequest, RecommendationFeedback } from '../types';

export class RecommendationRepository extends BaseRepository<AIRecommendation> {
  constructor(container: Container) {
    super(container);
  }

  async create(recommendationData: Omit<AIRecommendation, 'id' | 'partitionKey' | 'createdAt' | 'updatedAt'>): Promise<AIRecommendation> {
    const recommendationDocument = {
      ...recommendationData,
      partitionKey: recommendationData.userId,
    };

    return await super.create(recommendationDocument);
  }

  async findByUserId(userId: string, limit: number = 20, continuationToken?: string): Promise<{
    recommendations: AIRecommendation[];
    continuationToken?: string;
    hasMore: boolean;
  }> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.expiresAt > @now ORDER BY c.createdAt DESC',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@now', value: new Date().toISOString() },
      ],
    };

    const result = await this.queryWithPagination(querySpec, limit, continuationToken, userId);
    
    return {
      recommendations: result.items,
      continuationToken: result.continuationToken,
      hasMore: result.hasMore,
    };
  }

  async findByTripId(tripId: string, userId: string): Promise<AIRecommendation[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tripId = @tripId AND c.expiresAt > @now ORDER BY c.confidence DESC',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@tripId', value: tripId },
        { name: '@now', value: new Date().toISOString() },
      ],
    };

    return await this.query(querySpec, userId);
  }

  async findHighConfidenceRecommendations(
    userId: string, 
    minConfidence: number = 0.7, 
    limit: number = 10
  ): Promise<AIRecommendation[]> {
    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM c 
        WHERE c.userId = @userId 
        AND c.confidence >= @minConfidence 
        AND c.expiresAt > @now
        ORDER BY c.confidence DESC
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@minConfidence', value: minConfidence },
        { name: '@now', value: new Date().toISOString() },
      ],
    };

    const result = await this.queryWithPagination(querySpec, limit, undefined, userId);
    return result.items;
  }

  async findRecommendationsForTrail(trailId: string, limit: number = 20): Promise<AIRecommendation[]> {
    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM c 
        WHERE ARRAY_CONTAINS(c.trailIds, @trailId) 
        AND c.expiresAt > @now
        ORDER BY c.confidence DESC
      `,
      parameters: [
        { name: '@trailId', value: trailId },
        { name: '@now', value: new Date().toISOString() },
      ],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async findExpiredRecommendations(limit: number = 100): Promise<AIRecommendation[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.expiresAt <= @now ORDER BY c.expiresAt ASC',
      parameters: [{ name: '@now', value: new Date().toISOString() }],
    };

    const result = await this.queryWithPagination(querySpec, limit);
    return result.items;
  }

  async deleteExpiredRecommendations(): Promise<number> {
    const expiredRecommendations = await this.findExpiredRecommendations(1000);
    let deletedCount = 0;

    for (const recommendation of expiredRecommendations) {
      try {
        await this.delete(recommendation.id, recommendation.partitionKey);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete expired recommendation ${recommendation.id}:`, error);
      }
    }

    return deletedCount;
  }

  async extendRecommendationExpiry(recommendationId: string, userId: string, additionalDays: number = 7): Promise<AIRecommendation> {
    const recommendation = await this.findById(recommendationId, userId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    const newExpiryDate = new Date(recommendation.expiresAt);
    newExpiryDate.setDate(newExpiryDate.getDate() + additionalDays);

    return await this.update(recommendationId, userId, {
      expiresAt: newExpiryDate,
    });
  }

  async updateRecommendationWithFeedback(
    recommendationId: string, 
    userId: string, 
    feedback: RecommendationFeedback
  ): Promise<AIRecommendation> {
    const recommendation = await this.findById(recommendationId, userId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    // In a real implementation, this feedback would be used to improve future recommendations
    // For now, we'll just store it as metadata
    const updates: Partial<AIRecommendation> = {
      // Store feedback in a metadata field (would need to add this to the interface)
      // feedback: feedback
    };

    // If the user selected a trail, we might want to boost confidence in similar recommendations
    if (feedback.selectedTrail) {
      // Logic to update recommendation based on selected trail
    }

    return await this.update(recommendationId, userId, updates);
  }

  async getRecommendationStats(userId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    averageConfidence: number;
    topFactors: {
      fitnessMatch: number;
      preferenceAlignment: number;
      seasonalSuitability: number;
      safetyConsiderations: number;
    };
  }> {
    const allRecommendationsQuery: SqlQuerySpec = {
      query: 'SELECT c.confidence, c.factors, c.expiresAt FROM c WHERE c.userId = @userId',
      parameters: [{ name: '@userId', value: userId }],
    };

    const recommendations = await this.query(allRecommendationsQuery, userId);
    const now = new Date();

    let totalConfidence = 0;
    let active = 0;
    let expired = 0;
    const factorSums = {
      fitnessMatch: 0,
      preferenceAlignment: 0,
      seasonalSuitability: 0,
      safetyConsiderations: 0,
    };

    recommendations.forEach(rec => {
      totalConfidence += rec.confidence;
      
      if (new Date(rec.expiresAt) > now) {
        active++;
      } else {
        expired++;
      }

      factorSums.fitnessMatch += rec.factors.fitnessMatch;
      factorSums.preferenceAlignment += rec.factors.preferenceAlignment;
      factorSums.seasonalSuitability += rec.factors.seasonalSuitability;
      factorSums.safetyConsiderations += rec.factors.safetyConsiderations;
    });

    const total = recommendations.length;
    const averageConfidence = total > 0 ? totalConfidence / total : 0;

    return {
      total,
      active,
      expired,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      topFactors: {
        fitnessMatch: total > 0 ? Math.round((factorSums.fitnessMatch / total) * 100) / 100 : 0,
        preferenceAlignment: total > 0 ? Math.round((factorSums.preferenceAlignment / total) * 100) / 100 : 0,
        seasonalSuitability: total > 0 ? Math.round((factorSums.seasonalSuitability / total) * 100) / 100 : 0,
        safetyConsiderations: total > 0 ? Math.round((factorSums.safetyConsiderations / total) * 100) / 100 : 0,
      },
    };
  }

  async findSimilarRecommendations(
    userId: string, 
    trailIds: string[], 
    confidenceThreshold: number = 0.6,
    limit: number = 5
  ): Promise<AIRecommendation[]> {
    // Find recommendations that share similar trails
    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM c 
        WHERE c.userId = @userId 
        AND c.confidence >= @confidenceThreshold
        AND c.expiresAt > @now
        AND EXISTS(
          SELECT VALUE trail 
          FROM trail IN c.trailIds 
          WHERE trail IN (@trailIds)
        )
        ORDER BY c.confidence DESC
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@confidenceThreshold', value: confidenceThreshold },
        { name: '@now', value: new Date().toISOString() },
        { name: '@trailIds', value: trailIds },
      ],
    };

    const result = await this.queryWithPagination(querySpec, limit, undefined, userId);
    return result.items;
  }
}