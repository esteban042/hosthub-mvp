import axios from 'axios';
import * as cheerio from 'cheerio';
import { query } from '../dputils.js';
import { Apartment, Host } from '../types.js';
import { QueryResult } from 'pg';

class ImporterService {
  async importApartment(url: string, host: Host): Promise<Apartment> {
    try {
      const { data }: { data: string } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const $ = cheerio.load(data);

      const title = $('h1').first().text().trim();
      const description = $('div[data-plugin-in-point-id="DESCRIPTION_DEFAULT"]').first().text().trim();

      if (!title) {
        throw new Error("Could not extract apartment title. Airbnb\'s website structure may have changed.");
      }

      if (!description) {
        throw new Error("Could not extract apartment description. Airbnb\'s website structure may have changed.");
      }

      const pricePerNight = 0;
      const capacity = 1;
      const amenities: string[] = [];
      const city = '';
      const country = '';
      const address = '';
      const photos = ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600'];

      const result: QueryResult<Apartment> = await query(
        'INSERT INTO apartments (host_id, title, description, price_per_night, capacity, amenities, city, country, address, photos, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [
          host.id,
          title,
          description,
          pricePerNight,
          capacity,
          amenities,
          city,
          country,
          address,
          photos,
          true,
        ]
      );
      return result.rows[0];

    } catch (error) {
      console.error('Error importing apartment from Airbnb:', error);
      if (error instanceof Error) {
        throw new Error(`Import failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred while importing from Airbnb.');
    }
  }
}

export const importerService = new ImporterService();
