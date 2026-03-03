import { chromium } from 'playwright';

const VIEWPORT = { width: 1280, height: 720 };

export const scrapeAirbnbListing = async (url: string) => {
  const browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('script[type="application/ld+json"]');

    const listingData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        throw new Error('Could not find JSON-LD script tag. Airbnb website structure may have changed.');
      }

      const jsonData = JSON.parse(script.textContent || '{}');

      const title = jsonData.name;
      if (!title) {
        throw new Error('Could not extract apartment title from JSON-LD. Airbnb website structure may have changed.');
      }
      
      const description = jsonData.description || '';
      const photos = jsonData.image || [];
      const price = jsonData.offers?.price ? parseFloat(jsonData.offers.price) : null;

      const amenities = jsonData.amenityFeature?.map((amenity: any) => amenity.name).filter(Boolean) || [];

      return {
        title: title.split(' - ')[0], // Clean up title, e.g., "Cabin in the Woods - Big Bear, California"
        description,
        amenities,
        photos: [...new Set(photos)].slice(0, 15), // Get unique photos, limit to 15
        price,
      };
    });

    return listingData;

  } catch (error) {
    console.error('Error scraping Airbnb listing:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to scrape the Airbnb listing: ${error.message}`);
    }
    throw new Error('An unknown error occurred during scraping.');
  } finally {
    await browser.close();
  }
};
