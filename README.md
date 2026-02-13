# Sanctum API

This document provides a collection of useful `curl` commands and SQL statements for interacting with the Sanctum API and database.

## `curl` Commands

### Create a New Booking

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "apartmentId": "apt-1",
  "startDate": "2025-11-01",
  "endDate": "2025-11-05",
  "guestEmail": "test@example.com",
  "guestName": "John Doe",
  "guestCountry": "USA",
  "numGuests": 2,
  "guestMessage": "This is a test booking."
}' http://localhost:8081/api/v1/bookings
```

### Create a New User

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "email": "newuser@example.com",
  "password": "password123"
}' http://localhost:8081/api/v1/users
```

---

## Useful SQL Statements

### Insert a New Booking

```sql
INSERT INTO bookings (apartment_id, start_date, end_date, total_price, status, guest_name, guest_email, guest_country, guest_phone, num_guests, guest_message, custom_booking_id)
VALUES ('apt-1', '2025-11-01', '2025-11-05', 1000, 'confirmed', 'John Doe', 'test@example.com', 'USA', '123-456-7890', 2, 'This is a test booking.', 'SM0000003');
```

### Retrieve Booking Details

This query retrieves a booking along with its associated apartment and host information.

```sql
SELECT
  b.id AS booking_id,
  b.start_date,
  b.end_date,
  b.total_price,
  b.status,
  a.id AS apartment_id,
  a.name AS apartment_name,
  h.id AS host_id,
  h.name AS host_name
FROM
  bookings b
JOIN
  apartments a ON b.apartment_id = a.id
JOIN
  hosts h ON a.host_id = h.id
WHERE
  b.id = 'your_booking_id';
```
