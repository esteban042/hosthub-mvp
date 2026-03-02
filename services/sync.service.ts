import axios from 'axios';
import ical, { CalendarComponent } from 'node-ical';
import { query, execute } from '../dputils.js';
import { BlockedDate } from '../types.js';

// Type guard to check if a component is a VEVENT
function isVEvent(component: CalendarComponent): component is ical.VEvent {
    return component.type === 'VEVENT';
}

/**
 * Fetches calendar data from an iCal link, parses it, and updates the blocked_dates table.
 * @param hostId The ID of the host whose calendar is being synced.
 * @param calendarUrl The URL of the iCal file.
 */
export async function syncHostIcal(hostId: string, calendarUrl: string): Promise<void> {
  try {
    // 1. Fetch the iCal data, specifying the expected response type is a string
    const response = await axios.get<string>(calendarUrl);
    const icalData = response.data;

    // 2. Parse the iCal data
    const events = ical.parseICS(icalData);

    // 3. Get all apartments for the host
    const apartmentsResult = await query('SELECT id FROM apartments WHERE host_id = $1', [hostId]);
    const apartmentIds = apartmentsResult.rows.map(row => row.id);

    if (apartmentIds.length === 0) {
        console.log(`No apartments found for host ${hostId}, skipping sync.`);
        return;
    }

    // 4. Extract dates and prepare for database insertion
    const blockedDates: Omit<BlockedDate, 'id'>[] = [];
    // Use Object.values and our type guard for a safer loop
    for (const event of Object.values(events)) {
      if (event && isVEvent(event) && event.start && event.end) {
          let currentDate = new Date(event.start);
          const endDate = new Date(event.end);

          while (currentDate < endDate) {
            for (const apartmentId of apartmentIds) {
                blockedDates.push({
                    apartmentId: apartmentId,
                    date: new Date(currentDate.setUTCHours(0, 0, 0, 0)).toISOString().split('T')[0],
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
      }
    }

    if (blockedDates.length === 0) {
        console.log(`No new dates to block for host ${hostId}.`);
        return;
    }

    // 5. Insert new blocked dates into the database, ignoring duplicates
    await execute('BEGIN');
    try {
        // First, clear existing automatically blocked dates for this host's apartments
        await query('DELETE FROM blocked_dates WHERE apartment_id = ANY($1::uuid[])', [apartmentIds]);

        // Prepare the insert query
        const insertPromises = blockedDates.map(bd => {
            const sql = 'INSERT INTO blocked_dates (apartment_id, date) VALUES ($1, $2) ON CONFLICT (apartment_id, date) DO NOTHING';
            return query(sql, [bd.apartmentId, bd.date]);
        });

        await Promise.all(insertPromises);

        await execute('COMMIT');
        console.log(`Successfully synced ${blockedDates.length} dates for host ${hostId}.`);
    } catch (dbError) {
        await execute('ROLLBACK');
        console.error(`Database error during sync for host ${hostId}:`, dbError);
        throw dbError; // Re-throw to be caught by the outer catch block
    }

  } catch (error) {
    console.error(`Failed to sync iCal for host ${hostId}:`, error);
    // We don't re-throw here to prevent one host's failure from stopping the whole cron job
  }
}
