import { query, execute } from '../dputils.js';
import { Host } from '../types.js';

/**
 * Fetches all hosts from the database.
 * @returns A promise that resolves to an array of Host objects.
 */
export async function getHosts(): Promise<Host[]> {
  return query<Host>('SELECT * FROM hosts');
}

/**
 * Fetches public information for all hosts.
 * @returns A promise that resolves to an array of partial Host objects, including only slug and name.
 */
export async function getPublicHosts(): Promise<Pick<Host, 'slug' | 'name'>[]> {
  return query<Pick<Host, 'slug' | 'name'>>('SELECT slug, name FROM hosts');
}

/**
 * Creates a new host in the database.
 * @param hostData The data for the new host.
 * @returns The newly created host object.
 */
export async function createHost(hostData: Omit<Host, 'id'>): Promise<Host> {
  const {
    name,
    slug,
    bio,
    avatar,
    subscriptionType,
    commissionRate,
    businessName,
    contactEmail,
    physicalAddress,
    country,
    phoneNumber,
    landingPagePicture,
    airbnbCalendarLink,
    premiumConfig,
    paymentInstructions,
    vat,
    businessId,
    checkInTime,
    checkOutTime,
    checkInInfo,
    checkInMessage,
    welcomeMessage,
    checkoutMessage,
    userId,
    currency
  } = hostData;

  const sql = `
    INSERT INTO hosts
      (name, slug, bio, avatar, subscription_type, commission_rate, business_name, contact_email, physical_address, country, phone_number, landing_page_picture, airbnb_calendar_link, premium_config, payment_instructions, vat, business_id, check_in_time, check_out_time, check_in_info, check_in_message, welcome_message, checkout_message, user_id, currency)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    RETURNING *
  `;

  const params = [
    name,
    slug.toLowerCase().replace(/\s+/g, '-'),
    bio,
    avatar,
    subscriptionType,
    commissionRate,
    businessName,
    contactEmail,
    physicalAddress,
    country,
    phoneNumber,
    landingPagePicture,
    airbnbCalendarLink,
    JSON.stringify(premiumConfig),
    paymentInstructions,
    vat,
    businessId,
    checkInTime,
    checkOutTime,
    checkInInfo,
    checkInMessage,
    welcomeMessage,
    checkoutMessage,
    userId,
    currency
  ];

  const result = await query<Host>(sql, params);
  return result[0];
}

/**
 * Fetches a single host by its ID.
 * @param hostId The ID of the host to fetch.
 * @returns A promise that resolves to a Host object, or null if not found.
 */
export async function getHostById(hostId: string): Promise<Host | null> {
    const result = await query<Host>('SELECT * FROM hosts WHERE id = $1', [hostId]);
    return result.length > 0 ? result[0] : null;
}

/**
 * Fetches a single host by its user ID.
 * @param userId The user ID of the host to fetch.
 * @returns A promise that resolves to a Host object, or null if not found.
 */
export async function getHostByUserId(userId: string): Promise<Host | null> {
    const result = await query<Host>('SELECT * FROM hosts WHERE user_id = $1', [userId]);
    return result.length > 0 ? result[0] : null;
}

/**
 * Updates a host in the database.
 * @param hostId The ID of the host to update.
 * @param updatedFields An object containing the fields to update.
 * @returns The updated host object.
 */
export async function updateHost(hostId: string, updatedFields: Partial<Host>): Promise<Host> {
    const queryParts: string[] = [];
    const queryValues: any[] = [];
    let queryIndex = 1;

    for (const key in updatedFields) {
        if (Object.prototype.hasOwnProperty.call(updatedFields, key) && key !== 'id') {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            queryParts.push(`${snakeKey} = $${queryIndex++}`);
            queryValues.push(updatedFields[key as keyof Partial<Host>]);
        }
    }

    if (queryParts.length === 0) {
        throw new Error('No fields to update.');
    }

    const queryString = `UPDATE hosts SET ${queryParts.join(', ')} WHERE id = $${queryIndex} RETURNING *`;
    queryValues.push(hostId);

    await execute('BEGIN');
    try {
        const result = await query<Host>(queryString, queryValues);
        await execute('COMMIT');
        return result[0];
    } catch (error) {
        await execute('ROLLBACK');
        throw error;
    }
}
