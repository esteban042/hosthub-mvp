import { Pool } from 'pg';
import { config, isProduction } from './config';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Helper to convert snake_case object keys to camelCase
export const keysToCamel = (o: any): any => {
    if (o instanceof Date) {
      return o;
    }
    if (Array.isArray(o)) {
      return o.map(v => keysToCamel(v));
    }
    if (o !== null && typeof o === 'object') {
      return Object.keys(o).reduce((acc: {[key: string]: any}, key: string) => {
        const camelKey = key.replace(/([-_][a-z])/ig, ($1) => {
          return $1.toUpperCase().replace('-', '').replace('_', '');
        });
        acc[camelKey] = keysToCamel(o[key]);
        return acc;
      }, {});
    }
    return o;
  };
  