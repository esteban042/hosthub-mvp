import axios from 'axios';
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

      const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (!match || !match[1]) {
        throw new Error('Could not find __NEXT_DATA__ script tag. Airbnb page structure might have changed.');
      }
      
      const nextData = JSON.parse(match[1]);
      const listingData = nextData.props.pageProps.listing;

      const newApartmentData = {
        title: listingData.name || 'Untitled Listing',
        description: listingData.sectioned_description.description || 'Imported from Airbnb',
        pricePerNight: listingData.price || 0,
        capacity: listingData.person_capacity || 1,
        amenities: listingData.listing_amenities.map((a: any) => a.name) || [],
        images: listingData.photos.map((p: any) => p.large) || [],
        host: host,
      };

      const createdApartment = await apartmentService.create(newApartmentData as any);
      return createdApartment;

    } catch (error) {
      console.error('Error importing apartment:', error);
      throw new Error('Failed to import apartment from Airbnb.');
    }
  }
}

export const importerService = new ImporterService();
