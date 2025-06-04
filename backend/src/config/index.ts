import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  azure: {
    cosmosDb: {
      endpoint: process.env.AZURE_COSMOS_DB_ENDPOINT || '',
      key: process.env.AZURE_COSMOS_DB_KEY || '',
    },
    adB2c: {
      tenantId: process.env.AZURE_AD_B2C_TENANT_ID || '',
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID || '',
    },
    aiFoundry: {
      endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT || '',
      key: process.env.AZURE_AI_FOUNDRY_KEY || '',
    },
    storage: {
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
      accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
    },
  },
  api: {
    version: process.env.API_VERSION || '1.0.0',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
} as const;

// Validate critical configuration
export const validateConfig = (): void => {
  const requiredEnvVars = ['NODE_ENV'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: ${envVar} environment variable is not set`);
    }
  }
  
  if (config.nodeEnv === 'production') {
    const prodRequiredVars = [
      'AZURE_COSMOS_DB_ENDPOINT',
      'AZURE_COSMOS_DB_KEY',
    ];
    
    for (const envVar of prodRequiredVars) {
      if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is not set in production`);
      }
    }
  }
};