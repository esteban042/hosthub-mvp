import { pool } from './db.js';
import { QueryResult } from 'pg';

// Helper to convert snake_case object keys to camelCase
// This was moved from db.ts
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

/**
 *
 * @param sql The SQL query to execute.
 * @param params The parameters for the SQL query.
 * @returns A promise that resolves to an array of objects, with keys converted to camelCase.
 */
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(sql, params);
  return keysToCamel(result.rows);
}

/**
 * Executes a SQL statement that doesn't return rows (e.g., INSERT, UPDATE, DELETE).
 * @param sql The SQL statement to execute.
 * @param params The parameters for the SQL statement.
 * @returns A promise that resolves to the QueryResult.
 */
export async function execute(sql: string, params?: any[]): Promise<QueryResult> {
    return pool.query(sql, params);
}
