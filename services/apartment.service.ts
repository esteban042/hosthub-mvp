
import { query } from '../dputils.js';
import { pool } from '../db.js';
import { Apartment, User, UserRole, ICalUrl, Currency } from '../types.js';

// Helper to map snake_case DB rows to camelCase Apartment objects
const mapRowToApartment = (row: any): Apartment => ({
    id: row.id,
    hostId: row.host_id,
    title: row.title,
    description: row.description,
    address: row.address,
    city: row.city,
    capacity: row.capacity,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    pricePerNight: row.price_per_night,
    priceOverrides: row.price_overrides,
    amenities: row.amenities,
    photos: row.photos,
    isActive: row.is_active,
    mapEmbedUrl: row.map_embed_url,
    minStayNights: row.min_stay_nights,
    maxStayNights: row.max_stay_nights,
    icalUrls: row.ical_urls,
    airbnbCalendarDates: row.airbnb_calendar_dates,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currency: row.currency
});

/**
 * Fetches all apartments from the database.
 */
export async function getAllApartments(): Promise<Apartment[]> {
    const result = await query('SELECT * FROM apartments ORDER BY created_at DESC');
    return result.rows.map(mapRowToApartment);
}

/**
 * Fetches all apartments for a given host ID.
 */
export async function getApartmentsByHostId(hostId: string): Promise<Apartment[]> {
    const result = await query('SELECT * FROM apartments WHERE host_id = $1', [hostId]);
    return result.rows.map(mapRowToApartment);
}

/**
 * Creates a new apartment.
 */
export async function createApartment(apartmentData: Omit<Apartment, 'id' | 'hostId' | 'createdAt' | 'updatedAt'>, user: User): Promise<Apartment> {
    const hostRes = await query<{ id: string }>('SELECT id FROM hosts WHERE user_id = $1', [user.id]);
    if (hostRes.rows.length === 0) {
        throw new Error('You do not have a host profile and cannot create apartments.');
    }
    const hostId = hostRes.rows[0].id;

    const {
        title, description, address, city, capacity, bedrooms, bathrooms, pricePerNight, currency,
        priceOverrides = [], amenities = [], photos = [], isActive = true, mapEmbedUrl = null,
        minStayNights = 1, maxStayNights = 30
    } = apartmentData;

    const result = await query(
        `INSERT INTO apartments
          (host_id, title, description, address, city, capacity, bedrooms, bathrooms, price_per_night, price_overrides, amenities, photos, is_active, map_embed_url, min_stay_nights, max_stay_nights, currency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
            hostId, title, description, address, city, capacity, bedrooms, bathrooms, pricePerNight,
            JSON.stringify(priceOverrides), JSON.stringify(amenities), JSON.stringify(photos), isActive,
            mapEmbedUrl, minStayNights, maxStayNights, JSON.stringify(currency)
        ]
    );

    return mapRowToApartment(result.rows[0]);
}

/**
 * FINAL CORRECTED VERSION: Updates a batch of apartments in a transaction. This version ensures that host
 * authorization is correctly checked for each apartment within the transaction.
 */
export async function updateApartments(updatedApartments: Partial<Apartment>[], user: User): Promise<void> {
    if (!user || !user.id) {
        throw new Error('User must be authenticated to update apartments.');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [user.id]);
        const userHostId = hostRes.rows.length > 0 ? hostRes.rows[0].id : null;

        for (const apt of updatedApartments) {
            if (!apt.id) {
                console.warn('Skipping update for apartment with no ID.');
                continue;
            }

            const aptRes = await client.query('SELECT * FROM apartments WHERE id = $1 FOR UPDATE', [apt.id]);
            if (aptRes.rows.length === 0) {
                throw new Error(`Apartment with id ${apt.id} not found.`);
            }
            const existingDbRow = aptRes.rows[0];

            if (user.role === UserRole.HOST) {
                if (!userHostId) {
                    throw new Error('You do not have a host profile and cannot update apartments.');
                }
                if (String(existingDbRow.host_id) !== String(userHostId)) {
                    throw new Error(`You are not authorized to update apartment with id ${apt.id}.`);
                }
            }

            // Build the update query dynamically to handle partial updates cleanly
            const updateFields = Object.keys(apt).reduce((acc, key) => {
                if (key !== 'id') { // Exclude the ID from the fields to be updated
                    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    acc[snakeKey] = (apt as any)[key];
                }
                return acc;
            }, {} as any);
            
            const setClause = Object.keys(updateFields).map((key, index) => 
                `${key} = $${index + 2}`
            ).join(', ');

            if (setClause.length > 0) {
                 const queryParams = [apt.id, ...Object.values(updateFields).map(v => 
                    (v !== null && typeof v === 'object') ? JSON.stringify(v) : v
                )];

                await client.query(
                    `UPDATE apartments SET ${setClause} WHERE id = $1`,
                    queryParams
                );
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to update apartments transactionally:', error);
        throw error;
    } finally {
        client.release();
    }
}


/**
 * Fetches a single apartment by its ID.
 */
export async function getApartmentById(apartmentId: string): Promise<Apartment | null> {
    const result = await query('SELECT * FROM apartments WHERE id = $1', [apartmentId]);
    return result.rows.length > 0 ? mapRowToApartment(result.rows[0]) : null;
}

export async function updateApartmentIcalUrls(apartmentId: string, icalUrls: ICalUrl[], user: User): Promise<Apartment> {
    const client = await pool.connect();
    try {
        const aptRes = await client.query<{ host_id: string }>('SELECT host_id FROM apartments WHERE id = $1', [apartmentId]);
        if (aptRes.rows.length === 0) {
            throw new Error(`Apartment with id ${apartmentId} not found.`);
        }
        const apartmentHostId = aptRes.rows[0].host_id;

        if (user.role === UserRole.HOST) {
            const hostRes = await client.query<{ id: string }>('SELECT id FROM hosts WHERE user_id = $1', [user.id]);
            const userHostId = hostRes.rows.length > 0 ? hostRes.rows[0].id : null;

            if (!userHostId) {
                throw new Error('You do not have a host profile and cannot update apartments.');
            }
            if (String(apartmentHostId) !== String(userHostId)) {
                throw new Error(`You are not authorized to update apartment with id ${apartmentId}.`);
            }
        }

        const result = await client.query(
            'UPDATE apartments SET ical_urls = $1 WHERE id = $2 RETURNING *',
            [JSON.stringify(icalUrls), apartmentId]
        );

        return mapRowToApartment(result.rows[0]);
    } finally {
        client.release();
    }
}

export const apartmentService = {
  findAll: getAllApartments,
  findById: getApartmentById,
  updateIcalUrls: updateApartmentIcalUrls,
  create: createApartment,
  update: updateApartments
};