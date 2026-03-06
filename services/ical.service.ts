import { ICalUrl } from '../types.js';
import { supabase } from '../supabaseClient.js';
import axios from 'axios';
import * as ical from 'node-ical';

class ICalService {
  async syncApartment(apartmentId: string, icalUrls: ICalUrl[]): Promise<void> {
    if (!icalUrls || icalUrls.length === 0) {
      return;
    }

    let allBlockedDates: string[] = [];

    for (const icalUrl of icalUrls) {
      try {
        const { data } = await axios.get(icalUrl.url);
        // Use async parsing for better performance
        const events = await ical.async.parseICS(data);

        for (const key in events) {
          if (events.hasOwnProperty(key)) {
            const event = events[key];

            // Type guard to ensure we are dealing with a VEVENT with a start and end date.
            if (event && event.type === 'VEVENT' && event.start && event.end) {
              let currentDate = new Date(event.start);
              const endDate = new Date(event.end);

              // Loop through the dates of the event and add them to the blocked dates array.
              while (currentDate < endDate) {
                allBlockedDates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          }
        }
      } catch (error) {
        // Log the error but continue to the next iCal URL.
        console.error(`Error syncing iCal feed for apartment ${apartmentId} from ${icalUrl.url}:`, error);
      }
    }

    // Update the apartment in the database with the new list of blocked dates.
    const { error } = await supabase
      .from('apartments')
      .update({ airbnb_calendar_dates: allBlockedDates })
      .eq('id', apartmentId);

    if (error) {
      console.error(`Failed to update apartment with synced dates for apartment ${apartmentId}:`, error);
      throw new Error(`Failed to update apartment with synced dates: ${error.message}`);
    }
  }
}

export const iCalService = new ICalService();
