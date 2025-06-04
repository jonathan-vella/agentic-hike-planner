import { Request, Response } from 'express';
import { config } from '../config';
import { asyncHandler } from '../middleware/errorHandler';

export class HealthController {
  // Basic health check
  public getHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: config.api.version,
      services: {
        database: await this.checkDatabaseHealth(),
        azure: await this.checkAzureServicesHealth(),
      },
    };

    res.status(200).json(health);
  });

  // Detailed health check
  public getDetailedHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: config.api.version,
      responseTime: 0,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
      },
      services: {
        database: await this.checkDatabaseHealth(),
        azure: await this.checkAzureServicesHealth(),
      },
    };

    health.responseTime = Date.now() - startTime;
    res.status(200).json(health);
  });

  // API version info
  public getVersion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const version = {
      version: config.api.version,
      buildTime: new Date().toISOString(), // In real app, this would be build timestamp
      gitCommit: process.env.GIT_COMMIT || 'unknown',
      nodeVersion: process.version,
      environment: config.nodeEnv,
    };

    res.status(200).json(version);
  });

  // Check database connectivity (mock for now)
  private async checkDatabaseHealth(): Promise<{ status: string; responseTime?: number }> {
    try {
      const startTime = Date.now();
      
      // TODO: Implement actual Azure Cosmos DB health check
      // For now, just simulate a check
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: config.azure.cosmosDb.endpoint ? 'connected' : 'not_configured',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'error',
      };
    }
  }

  // Check Azure services health (mock for now)
  private async checkAzureServicesHealth(): Promise<Record<string, { status: string }>> {
    return {
      cosmosDb: {
        status: config.azure.cosmosDb.endpoint ? 'configured' : 'not_configured',
      },
      adB2c: {
        status: config.azure.adB2c.tenantId ? 'configured' : 'not_configured',
      },
      aiFoundry: {
        status: config.azure.aiFoundry.endpoint ? 'configured' : 'not_configured',
      },
      storage: {
        status: config.azure.storage.accountName ? 'configured' : 'not_configured',
      },
    };
  }
}