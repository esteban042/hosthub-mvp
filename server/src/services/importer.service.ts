import axios from 'axios';
import * as cheerio from 'cheerio';
import { apartmentService } from './apartment.service';
import { Apartment } from '../entities/Apartment';
import { Host } from '../entities/Host';

class ImporterService {
  async importApartment(url: string, host: Host): Promise<Apartment> {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);

      // --- More Detailed Data Extraction Logic ---
      const title = $('h1').text() || $('[data-section-id="TITLE_DEFAULT"] h1').text();
      const description = $('div[data-section-id="DESCRIPTION_DEFAULT"] div div').text();
      const priceString = $('div[data-section-id="BOOK_IT_SIDEBAR"] div > span > span').first().text().replace(/[^\d]/g, '');
      const pricePerNight = priceString ? parseInt(priceString, 10) : 0;

      let capacity = 1;
      $('div[data-section-id="OVERVIEW_DEFAULT_V2"] div').each((i, el) => {
        const text = $(el).text();
        if (text.toLowerCase().includes('guest')) {
            const capacityMatch = text.match(/(\d+)\s+guest/);
            if (capacityMatch && capacityMatch[1]) {
                capacity = parseInt(capacityMatch[1], 10);
            }
        }
      });

      const amenities: string[] = [];
      $('div[data-section-id="AMENITIES_DEFAULT"] div > div > div').each((i, el) => {
        amenities.push($(el).text());
      });

      const newApartmentData = {
        title: title || 'Untitled Listing',
        description: description || 'Imported from Airbnb',
        pricePerNight: pricePerNight || 0,
        capacity: capacity || 1,
        amenities: amenities || [],
        images: [], // No image handling for now
        host: host,
      };

      // Type assertion to match the expected entity format
      const createdApartment = await apartmentService.create(newApartmentData as any);
      return createdApartment;

    } catch (error) {
      console.error('Error importing apartment:', error);
      throw new Error('Failed to import apartment from Airbnb.');
    }
  }
}

export const importerService = new ImporterService();
