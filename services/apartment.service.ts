import { query, execute } from '../dputils';
import { Apartment, User, UserRole } from '../types';

/**
 * Fetches all apartments from the database.
 */
export async function getAllApartments(): Promise<Apartment[]> {
    return query<Apartment>('SELECT * FROM apartments ORDER BY created_at DESC');
}

/**
 * Creates a new apartment.
 */
export async function createApartment(apartmentData: Omit<Apartment, 'id' | 'hostId' | 'createdAt' | 'updatedAt'>, user: User): Promise<Apartment> {
    const hostRes = await query<{ id: string }>('SELECT id FROM hosts WHERE user_id = $1', [user.id]);
    if (hostRes.length === 0) {
        throw new Error('You do not have a host profile and cannot create apartments.');
    }
    const hostId = hostRes[0].id;

    const {
        title,
        description,
        address,
        city,
        capacity,
        bedrooms,
        bathrooms,
        pricePerNight,
        priceOverrides = [],
        amenities = [],
        photos = [],
        isActive = true,
        mapEmbedUrl = null,
        minStayNights = 1,
        maxStayNights = 30,
    } = apartmentData;

    const result = await query<Apartment>(
        `INSERT INTO apartments
          (host_id, title, description, address, city, capacity, bedrooms, bathrooms, price_per_night, price_overrides, amenities, photos, is_active, map_embed_url, min_stay_nights, max_stay_nights)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
            hostId,
            title,
            description,
            address,
            city,
            capacity,
            bedrooms,
            bathrooms,
            pricePerNight,
            JSON.stringify(priceOverrides),
            JSON.stringify(amenities),
            JSON.stringify(photos),
            isActive,
            mapEmbedUrl,
            minStayNights,
            maxStayNights,
        ]
    );

    return result[0];
}

/**
 * Updates a batch of apartments in a transaction.
 */
export async function updateApartments(updatedApartments: Apartment[], user: User): Promise<void> {
    await execute('BEGIN');
    try {
        let userHostId: string | null = null;
        if (user.role !== UserRole.Admin) {
            const hostRes = await query<{ id: string }>('SELECT id FROM hosts WHERE user_id = $1', [user.id]);
            if (hostRes.length === 0) {
                throw new Error('You do not have a host profile and cannot update apartments.');
            }
            userHostId = hostRes[0].id;
        }

        for (const apt of updatedApartments) {
            if (user.role !== UserRole.Admin) {
                const aptRes = await query<{ hostId: string }>('SELECT host_id FROM apartments WHERE id = $1 FOR UPDATE', [apt.id]);
                if (aptRes.length === 0) {
                    throw new Error(`Apartment with id ${apt.id} not found.`);
                }
                if (String(aptRes[0].hostId) !== String(userHostId)) {
                    throw new Error(`You are not authorized to update apartment with id ${apt.id}.`);
                }
            }

            const {
                hostId, title, description, address, city, capacity, bedrooms, bathrooms, pricePerNight,
                priceOverrides, amenities, photos, isActive, mapEmbedUrl, minStayNights, maxStayNights, id
            } = apt;

            await execute(
                `UPDATE apartments SET
                  host_id = $1, title = $2, description = $3, address = $4, city = $5, capacity = $6, bedrooms = $7,
                  bathrooms = $8, price_per_night = $9, price_overrides = $10, amenities = $11, photos = $12,
                  is_active = $13, map_embed_url = $14, min_stay_nights = $15, max_stay_nights = $16
                WHERE id = $17`,
                [
                    hostId, title, description, address, city, capacity, bedrooms, bathrooms, pricePerNight,
                    JSON.stringify(priceOverrides), JSON.stringify(amenities), JSON.stringify(photos), isActive,
                    mapEmbedUrl, minStayNights, maxStayNights, id
                ]
            );
        }

        await execute('COMMIT');
    } catch (error) {
        await execute('ROLLBACK');
        throw error;
    }
}

/**
 * Fetches a single apartment by its ID.
 */
export async function getApartmentById(apartmentId: string): Promise<Apartment | null> {
    const apartments = await query<Apartment>('SELECT * FROM apartments WHERE id = $1', [apartmentId]);
    return apartments.length > 0 ? apartments[0] : null;
}
