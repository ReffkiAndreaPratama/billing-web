import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

@Injectable()
export class ConfigService {
  get(key: string, defaultValue?: string): string {
    return process.env[key] || defaultValue || '';
  }

  get jwtSecret(): string {
    return this.get('JWT_SECRET', 'default-secret');
  }

  get jwtExpiresIn(): string {
    return this.get('JWT_EXPIRES_IN', '7d');
  }

  get port(): number {
    return parseInt(this.get('PORT', '4000'), 10);
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }
}
