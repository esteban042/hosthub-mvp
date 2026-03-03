# Host Onboarding: A Step-by-Step Guide for Technicians

This document provides a detailed, technical walkthrough of the new host onboarding process. It is intended for developers and system administrators who need to understand the underlying mechanics of the system.

## Onboarding Flow

The host onboarding process consists of four main steps:

1.  **User Account Creation:** A new user account is created via a `POST` request.
2.  **Host Profile Creation:** A new host profile is created and linked to the user account.
3.  **Stripe Account Creation:** A new Stripe Express account is created for the host.
4.  **Stripe Onboarding:** The host is redirected to Stripe to complete the onboarding process.

## Step 1: User Account Creation

The first step is to create a new user account. This is done by sending a `POST` request to the `/api/v1/users` endpoint.

### How it Works

1.  A `POST` request is sent to the `/api/v1/users` endpoint with the user's email and password in the request body.

    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"email":"new.host@example.com","password":"a.strong.password"}' http://localhost:3000/api/v1/users
    ```

2.  The `createUser` function in `services/user.service.ts` is called.
3.  The function hashes the password and creates a new record in the `users` table.
4.  The new user's ID, email, and role are returned in the response.

### Database Connection: `users` and `hosts`

The `users` and `hosts` tables are linked by a one-to-one relationship. The `hosts` table has a `user_id` column that is a foreign key referencing the `id` column in the `users` table. This means that each host profile must be associated with a user account, and each user account can have at most one host profile.

## Step 2: Host Profile Creation

Once the user account is created, the next step is to create a host profile. This is handled by the `createHost` function in `services/host.service.ts`.

### How it Works

1.  A `POST` request is sent to the `/api/v1/hosts` endpoint with the host's information, including the `userId` obtained from the previous step.
2.  The `createHost` function creates a new record in the `hosts` table, linking it to the user's account via the `userId`.

## Step 3: Stripe Account Creation

After the host profile is created, a new Stripe Express account is created for the host. This is handled by the `createStripeAccount` function in `services/stripe.service.ts`.

### How it Works

1.  A `POST` request is sent to the `/api/v1/stripe/create-account` endpoint with the host's `userId`.
2.  The `createStripeAccount` function retrieves the host's information and creates a new Stripe Express account.
3.  The host's record in the database is updated with the new Stripe account ID.

## Step 4: Stripe Onboarding

The final step is to redirect the host to Stripe to complete the onboarding process. This is handled by the `createStripeAccountLink` function in `services/stripe.service.ts`.

### How it Works

1.  A `POST` request is sent to the `/api/v1/stripe/create-account-link` endpoint with the Stripe account ID.
2.  The `createStripeAccountLink` function generates a unique link for the host to complete the Stripe onboarding process.
3.  The host is then redirected to this link to provide their personal and financial information to Stripe.

Once the host has completed the Stripe onboarding process, they will be able to receive payouts for bookings.
