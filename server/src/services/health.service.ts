import { getDbHealth } from '../config/database';
import { config } from '../config/env';
import { HealthCheckData } from '../types';

export class HealthService {
  /**
   * Retrieves overall system and database health status.
   * Pure business logic: no Express dependencies.
   */
  public async getHealthStatus(): Promise<HealthCheckData> {
    const dbHealth = getDbHealth();
    const memory = process.memoryUsage();

    let status: HealthCheckData['status'] = 'UP';
    if (dbHealth.status === 'disconnected') {
      status = 'DOWN';
    } else if (dbHealth.status === 'connecting' || dbHealth.status === 'disconnecting') {
      status = 'DEGRADED';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime() * 100) / 100,
      environment: config.NODE_ENV,
      database: dbHealth,
      memory: {
        heapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    };
  }
}

export const healthService = new HealthService();

