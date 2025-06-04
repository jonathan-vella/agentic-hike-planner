import { CosmosClient } from '@azure/cosmos';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  operationType: string;
  duration: number;
  requestCharge: number;
  statusCode: number;
  timestamp: number;
}

interface BenchmarkResults {
  totalOperations: number;
  totalDuration: number;
  averageDuration: number;
  totalRequestCharge: number;
  averageRequestCharge: number;
  operationsPerSecond: number;
  metrics: PerformanceMetrics[];
}

export class CosmosDbPerformanceBenchmark {
  private client: CosmosClient;
  private databaseName: string;
  private containerName: string;
  private metrics: PerformanceMetrics[] = [];

  constructor(client: CosmosClient, databaseName: string, containerName: string) {
    this.client = client;
    this.databaseName = databaseName;
    this.containerName = containerName;
  }

  private recordMetric(operationType: string, duration: number, requestCharge: number, statusCode: number) {
    this.metrics.push({
      operationType,
      duration,
      requestCharge,
      statusCode,
      timestamp: Date.now(),
    });
  }

  async benchmarkReadOperations(iterations: number = 100): Promise<BenchmarkResults> {
    console.log(`🏃‍♂️ Running read operations benchmark (${iterations} iterations)...`);
    
    const container = this.client.database(this.databaseName).container(this.containerName);
    const readMetrics: PerformanceMetrics[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        const response = await container.items.query({
          query: 'SELECT TOP 1 * FROM c'
        }).fetchNext();
        
        const duration = performance.now() - startTime;
        const requestCharge = response.requestCharge || 0;
        
        const metric: PerformanceMetrics = {
          operationType: 'read',
          duration,
          requestCharge,
          statusCode: 200,
          timestamp: Date.now(),
        };
        
        readMetrics.push(metric);
        this.recordMetric('read', duration, requestCharge, 200);
        
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordMetric('read', duration, 0, 500);
      }
    }
    
    return this.calculateResults(readMetrics);
  }

  async benchmarkWriteOperations(iterations: number = 50): Promise<BenchmarkResults> {
    console.log(`✍️ Running write operations benchmark (${iterations} iterations)...`);
    
    const container = this.client.database(this.databaseName).container(this.containerName);
    const writeMetrics: PerformanceMetrics[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const testDocument = {
        id: `perf-test-${Date.now()}-${i}`,
        partitionKey: 'performance-test',
        testData: {
          iteration: i,
          timestamp: new Date().toISOString(),
          randomData: Math.random().toString(36),
        },
      };
      
      const startTime = performance.now();
      
      try {
        const response = await container.items.create(testDocument);
        const duration = performance.now() - startTime;
        const requestCharge = response.requestCharge || 0;
        
        const metric: PerformanceMetrics = {
          operationType: 'write',
          duration,
          requestCharge,
          statusCode: response.statusCode,
          timestamp: Date.now(),
        };
        
        writeMetrics.push(metric);
        this.recordMetric('write', duration, requestCharge, response.statusCode);
        
        // Clean up - delete the test document
        await container.item(testDocument.id, testDocument.partitionKey).delete();
        
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordMetric('write', duration, 0, 500);
      }
    }
    
    return this.calculateResults(writeMetrics);
  }

  async benchmarkQueryOperations(iterations: number = 20): Promise<BenchmarkResults> {
    console.log(`🔍 Running query operations benchmark (${iterations} iterations)...`);
    
    const container = this.client.database(this.databaseName).container(this.containerName);
    const queryMetrics: PerformanceMetrics[] = [];
    
    const queries = [
      { query: 'SELECT * FROM c WHERE c.fitnessLevel = @level', parameters: [{ name: '@level', value: 'intermediate' }] },
      { query: 'SELECT * FROM c WHERE c.location.region = @region', parameters: [{ name: '@region', value: 'california-north' }] },
      { query: 'SELECT COUNT(1) FROM c', parameters: [] },
      { query: 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET 0 LIMIT 10', parameters: [] },
    ];
    
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      const startTime = performance.now();
      
      try {
        const response = await container.items.query(query).fetchAll();
        const duration = performance.now() - startTime;
        const requestCharge = response.requestCharge || 0;
        
        const metric: PerformanceMetrics = {
          operationType: 'query',
          duration,
          requestCharge,
          statusCode: 200,
          timestamp: Date.now(),
        };
        
        queryMetrics.push(metric);
        this.recordMetric('query', duration, requestCharge, 200);
        
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordMetric('query', duration, 0, 500);
      }
    }
    
    return this.calculateResults(queryMetrics);
  }

  async runFullBenchmark(): Promise<{
    reads: BenchmarkResults;
    writes: BenchmarkResults;
    queries: BenchmarkResults;
    summary: BenchmarkSummary;
  }> {
    console.log('🚀 Starting comprehensive Cosmos DB performance benchmark...');
    
    const reads = await this.benchmarkReadOperations();
    const writes = await this.benchmarkWriteOperations();
    const queries = await this.benchmarkQueryOperations();
    
    const summary = this.generateSummary(reads, writes, queries);
    
    return { reads, writes, queries, summary };
  }

  private calculateResults(metrics: PerformanceMetrics[]): BenchmarkResults {
    const totalOperations = metrics.length;
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const totalRequestCharge = metrics.reduce((sum, m) => sum + m.requestCharge, 0);
    
    return {
      totalOperations,
      totalDuration,
      averageDuration: totalDuration / totalOperations,
      totalRequestCharge,
      averageRequestCharge: totalRequestCharge / totalOperations,
      operationsPerSecond: (totalOperations / totalDuration) * 1000,
      metrics,
    };
  }

  private generateSummary(reads: BenchmarkResults, writes: BenchmarkResults, queries: BenchmarkResults): BenchmarkSummary {
    const totalOperations = reads.totalOperations + writes.totalOperations + queries.totalOperations;
    const totalRUs = reads.totalRequestCharge + writes.totalRequestCharge + queries.totalRequestCharge;
    const totalDuration = reads.totalDuration + writes.totalDuration + queries.totalDuration;
    
    return {
      totalOperations,
      totalDuration,
      totalRequestUnits: totalRUs,
      averageRequestUnitsPerOperation: totalRUs / totalOperations,
      overallOperationsPerSecond: (totalOperations / totalDuration) * 1000,
      breakdown: {
        reads: {
          avgDuration: reads.averageDuration,
          avgRUs: reads.averageRequestCharge,
          opsPerSecond: reads.operationsPerSecond,
        },
        writes: {
          avgDuration: writes.averageDuration,
          avgRUs: writes.averageRequestCharge,
          opsPerSecond: writes.operationsPerSecond,
        },
        queries: {
          avgDuration: queries.averageDuration,
          avgRUs: queries.averageRequestCharge,
          opsPerSecond: queries.operationsPerSecond,
        },
      },
      recommendations: this.generateRecommendations(reads, writes, queries),
    };
  }

  private generateRecommendations(reads: BenchmarkResults, writes: BenchmarkResults, queries: BenchmarkResults): string[] {
    const recommendations: string[] = [];
    
    // High latency recommendations
    if (reads.averageDuration > 100) {
      recommendations.push('Consider optimizing read operations - average latency is high');
    }
    
    if (writes.averageDuration > 200) {
      recommendations.push('Consider optimizing write operations - average latency is high');
    }
    
    if (queries.averageDuration > 500) {
      recommendations.push('Consider optimizing queries with better indexing or query structure');
    }
    
    // High RU consumption recommendations
    if (reads.averageRequestCharge > 10) {
      recommendations.push('Read operations consuming high RUs - consider query optimization');
    }
    
    if (writes.averageRequestCharge > 15) {
      recommendations.push('Write operations consuming high RUs - consider document size optimization');
    }
    
    if (queries.averageRequestCharge > 50) {
      recommendations.push('Queries consuming high RUs - consider adding composite indexes');
    }
    
    // Throughput recommendations
    const totalRUsPerSecond = (reads.totalRequestCharge + writes.totalRequestCharge + queries.totalRequestCharge) / 
                              ((reads.totalDuration + writes.totalDuration + queries.totalDuration) / 1000);
    
    if (totalRUsPerSecond > 350) {
      recommendations.push('Consider increasing provisioned throughput or moving to autoscale');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! No immediate optimizations needed.');
    }
    
    return recommendations;
  }

  getAllMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  exportMetricsAsCSV(): string {
    const headers = ['Timestamp', 'Operation Type', 'Duration (ms)', 'Request Charge (RU)', 'Status Code'];
    const rows = this.metrics.map(m => [
      new Date(m.timestamp).toISOString(),
      m.operationType,
      m.duration.toFixed(2),
      m.requestCharge.toFixed(2),
      m.statusCode.toString(),
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

interface BenchmarkSummary {
  totalOperations: number;
  totalDuration: number;
  totalRequestUnits: number;
  averageRequestUnitsPerOperation: number;
  overallOperationsPerSecond: number;
  breakdown: {
    reads: { avgDuration: number; avgRUs: number; opsPerSecond: number };
    writes: { avgDuration: number; avgRUs: number; opsPerSecond: number };
    queries: { avgDuration: number; avgRUs: number; opsPerSecond: number };
  };
  recommendations: string[];
}

// Usage example and test
export async function runPerformanceBenchmarks(cosmosDbEndpoint?: string, cosmosDbKey?: string): Promise<void> {
  if (!cosmosDbEndpoint || !cosmosDbKey) {
    console.log('⚠️ Cosmos DB credentials not provided, skipping performance benchmarks');
    return;
  }

  try {
    const client = new CosmosClient({
      endpoint: cosmosDbEndpoint,
      key: cosmosDbKey,
    });

    const benchmark = new CosmosDbPerformanceBenchmark(client, 'HikePlannerDB', 'users');
    const results = await benchmark.runFullBenchmark();
    
    console.log('\n📊 Performance Benchmark Results:');
    console.log('=====================================');
    console.log(`Total Operations: ${results.summary.totalOperations}`);
    console.log(`Total Duration: ${(results.summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Total Request Units: ${results.summary.totalRequestUnits.toFixed(2)} RU`);
    console.log(`Average RU per Operation: ${results.summary.averageRequestUnitsPerOperation.toFixed(2)} RU`);
    console.log(`Overall Ops/Second: ${results.summary.overallOperationsPerSecond.toFixed(2)}`);
    
    console.log('\n📈 Breakdown by Operation Type:');
    console.log(`Reads - Avg: ${results.summary.breakdown.reads.avgDuration.toFixed(2)}ms, ${results.summary.breakdown.reads.avgRUs.toFixed(2)} RU`);
    console.log(`Writes - Avg: ${results.summary.breakdown.writes.avgDuration.toFixed(2)}ms, ${results.summary.breakdown.writes.avgRUs.toFixed(2)} RU`);
    console.log(`Queries - Avg: ${results.summary.breakdown.queries.avgDuration.toFixed(2)}ms, ${results.summary.breakdown.queries.avgRUs.toFixed(2)} RU`);
    
    console.log('\n💡 Recommendations:');
    results.summary.recommendations.forEach(rec => console.log(`- ${rec}`));
    
    // Export metrics to CSV for further analysis
    const csvData = benchmark.exportMetricsAsCSV();
    console.log(`\n📋 CSV export ready (${csvData.split('\n').length - 1} records)`);
    
  } catch (error) {
    console.error('❌ Performance benchmark failed:', error);
  }
}