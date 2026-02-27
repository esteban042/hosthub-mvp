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
      let pdpState: any;

      $('script').each((i, elem) => {
        const scriptContent = $(elem).html();
        if (scriptContent && scriptContent.includes('pdpPDPState')) {
          const jsonRegex = /({.*})/;
          const match = scriptContent.match(jsonRegex);

          if (match && match[0]) {
            try {
              const potentialJson = match[0];
              const parsed = JSON.parse(potentialJson);

              const findPdpState = (obj: any): any => {
                if (obj && typeof obj === 'object') {
                  if (obj.pdpPDPState) {
                    return obj.pdpPDPState;
                  }
                  for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                      const found = findPdpState(obj[key]);
                      if (found) return found;
                    }
                  }
                }
                return null;
              };

              pdpState = findPdpState(parsed);
              if (pdpState) return false; // exit loop
            } catch (e) {
              // ignore and continue
            }
          }
        }
      });

      if (!pdpState) {
        throw new Error("Could not find apartment data. Airbnb's website structure may have changed, making it incompatible with the importer.");
      }

      const listing: any = pdpState.listing || {};
      const pricing: any = pdpState.pricing || {};

      const title = listing.name || listing.title || 'Untitled Listing';
      const description = listing.sectioned_description?.description || listing.description || 'No description available.';
      const pricePerNight = pricing.price?.price_items?.[0]?.rate || pricing.rate || listing.price || 0;
      const capacity = listing.person_capacity || listing.guest_capacity || 1;
      const amenities = (listing.listing_amenities || []).map((amenity: any) => amenity.name).filter(Boolean);
      const photos = (listing.photos || []).map((photo: any) => photo.picture || photo.url).filter(Boolean);
      const locationTitle = listing.location_title || '';
      const city = locationTitle.split(',')?.[0]?.trim() || listing.city || '';
      const country = locationTitle.split(',')?.pop()?.trim() || listing.country || '';
      const address = listing.address || `${city}, ${country}`.trim();

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
          photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600'],
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
