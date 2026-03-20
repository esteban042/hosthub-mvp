
import axios from 'axios';
import ical, { CalendarComponent } from 'node-ical';
import { query, execute } from '../dputils.js';
import { BlockedDate } from '../types.js';
import { apartmentService } from './apartment.service.js';
import { v4 as uuidv4 } from 'uuid';

// Type guard to check if a component is a VEVENT
function isVEvent(component: CalendarComponent): component is ical.VEvent {
    return component.type === 'VEVENT';
}

/**
 * Fetches calendar data from iCal links, parses it, and updates the blocked_dates table for a single apartment.
 * @param apartmentId The ID of the apartment being synced.
 * @param icalUrls The array of iCal URL strings for the apartment.
 */
export async function syncApartmentIcal(apartmentId: string, icalUrls: string[]): Promise<void> {
  console.log(`[SYNC-DEBUG] Starting sync for apartmentId: ${apartmentId}`);
  if (!icalUrls || icalUrls.length === 0) {
    console.log(`[SYNC-DEBUG] No iCal URLs for apartment ${apartmentId}, skipping sync.`);
    return;
  }

  const allBlockedDates: Omit<BlockedDate, 'id' | 'apartmentId'>[] = [];

  for (const url of icalUrls) {
    console.log(`[SYNC-DEBUG] Fetching iCal from URL: ${url}`);
    try {
      const response = await axios.get<string>(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }); // Added User-Agent
      const icalData = response.data;
      console.log(`[SYNC-DEBUG] Received iCal data (first 300 chars): ${icalData.substring(0, 300)}`);

      const events = ical.parseICS(icalData);
      console.log(`[SYNC-DEBUG] Parsed iCal data. Found ${Object.keys(events).length} components.`);

      for (const event of Object.values(events)) {
        if (event && isVEvent(event) && event.start && event.end) {
          let loopDate = new Date(event.start);
          loopDate.setUTCHours(0, 0, 0, 0);

          let stopDate = new Date(event.end);
          stopDate.setUTCHours(0, 0, 0, 0);

          console.log(`[SYNC-DEBUG] Processing event from ${loopDate.toISOString()} to ${stopDate.toISOString()}`);

          while (loopDate < stopDate) {
            allBlockedDates.push({ date: loopDate.toISOString().split('T')[0], source: 'ICAL' });
            loopDate.setUTCDate(loopDate.getUTCDate() + 1);
          }
        }
      }
    } catch (error) {
      console.error(`[SYNC-ERROR] Failed to fetch or parse iCal from ${url}:`, error);
    }
  }

  console.log(`[SYNC-DEBUG] Total blocked dates extracted from all iCals: ${allBlockedDates.length}`);
  if (allBlockedDates.length === 0) {
    console.log(`[SYNC-DEBUG] No new dates to block for apartment ${apartmentId}. Sync finished.`);
    return;
  }

  await execute('BEGIN');
  try {
    console.log(`[SYNC-DEBUG] Deleting existing ICAL dates for apartment ${apartmentId}.`);
    await query('DELETE FROM blocked_dates WHERE apartment_id = $1 AND source = $2', [apartmentId, 'ICAL']);

    const uniqueDates = [...new Set(allBlockedDates.map(bd => bd.date))];
    console.log(`[SYNC-DEBUG] Found ${uniqueDates.length} unique dates to potentially insert.`);

    const manualBlocksResult = await query('SELECT date FROM blocked_dates WHERE apartment_id = $1 AND source = $2', [apartmentId, 'MANUAL']);
    const manualBlockDates = new Set(manualBlocksResult.rows.map(r => new Date(r.date).toISOString().split('T')[0]));
    console.log(`[SYNC-DEBUG] Found ${manualBlockDates.size} existing manual blocks.`);

    const insertPromises = [];
    for (const date of uniqueDates) {
      if (!manualBlockDates.has(date)) {
        const newId = uuidv4();
        const sql = 'INSERT INTO blocked_dates (id, apartment_id, date, source) VALUES ($1, $2, $3, $4)';
        insertPromises.push(query(sql, [newId, apartmentId, date, 'ICAL']));
      }
    }

    console.log(`[SYNC-DEBUG] Preparing to insert ${insertPromises.length} new iCal dates.`);
    await Promise.all(insertPromises);

    await execute('COMMIT');
    console.log(`[SYNC-SUCCESS] Successfully committed ${insertPromises.length} new iCal dates for apartment ${apartmentId}.`);
  } catch (dbError) {
    await execute('ROLLBACK');
    console.error(`[SYNC-DB-ERROR] Database error during sync for apartment ${apartmentId}:`, dbError);
    throw dbError;
  }
}

export async function syncAllApartments(): Promise<void> {
  console.log('----------------------------------');
  console.log('Starting full iCal sync job...');
  try {
    const allApartments = await apartmentService.findAll();
    const apartmentsToSync = allApartments.filter(apt => apt.icalUrls && apt.icalUrls.length > 0);

    console.log(`Found ${apartmentsToSync.length} apartments with iCal URLs to sync.`);

    for (const apartment of apartmentsToSync) {
      if (apartment.icalUrls) {
        const urls = apartment.icalUrls.map(ical => ical.url);
        await syncApartmentIcal(apartment.id, urls);
      }
    }

    console.log('Full iCal sync job finished successfully.');
    console.log('----------------------------------');
  } catch (error) {
    console.error('An error occurred during the full iCal sync job:', error);
  }
}
