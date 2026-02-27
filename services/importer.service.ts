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
      let apartmentData: any;

      const initialStateScript = $('script#initial-shared-state').html();
      if (initialStateScript) {
        const initialState = JSON.parse(initialStateScript);
        const urqlState = initialState.urqlState;
        if (urqlState) {
          const key = Object.keys(urqlState).find(k => k.includes('StaysPdpSections'));
          if (key && urqlState[key].data) {
            const pdpData = JSON.parse(urqlState[key].data);
            apartmentData = pdpData.data.presentation.stayProductDetailPage.sections;
          }
        }
      }

      if (!apartmentData) {
        throw new Error("Could not find apartment data. Airbnb\'s website structure may have changed, making it incompatible with the importer.");
      }

      const { metadata, sections } = apartmentData;

      const title = metadata?.name || 'Untitled Listing';
      
      const overviewSection = sections.find((s: any) => s.section?.id === 'OVERVIEW_DEFAULT_V2');
      const description = overviewSection?.section?.htmlDescription?.htmlText || 'No description available.';
      
      const amenitiesSection = sections.find((s: any) => s.section?.id === 'AMENITIES_DEFAULT');
      const amenities = amenitiesSection?.section?.amenities?.map((a: any) => a.title) || [];
      
      const locationSection = sections.find((s: any) => s.section?.id === 'LOCATION_DEFAULT');
      const address = locationSection?.section?.subtitle || '';
      
      const pricePerNight = 0;
      const capacity = 1;
      const city = address.split(',')[0]?.trim() || '';
      const country = address.split(',').pop()?.trim() || '';
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
