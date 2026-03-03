# Stripe Checkout Flow

This document outlines the entire payment process, from the moment a guest makes a booking to the final payout to the host. It also provides a clear breakdown of all associated fees and commissions.

## Overview

The payment process is handled by Stripe Connect, which allows for a seamless and automated experience for both hosts and guests. The entire flow can be summarized as follows:

1.  **Booking:** A guest books an apartment and pays the total price through our platform.
2.  **Payment Processing:** The payment is securely processed by Stripe.
3.  **Fee Distribution:** Stripe automatically deducts its processing fee and our platform commission.
4.  **Host Payout:** The remaining balance is automatically transferred to the host's connected Stripe account.

## Fee Structure

There are two main fees deducted from the total booking price:

*   **Stripe Processing Fee:** This is a standard fee charged by Stripe for processing the transaction. The fee is typically **2.9% + a fixed fee** of the total transaction amount. The fixed fee varies by currency. For example, it is $0.30 for USD and €0.25 for EUR. Please refer to Stripe's official documentation for the most up-to-date pricing.
*   **Platform Commission:** This is our commission for providing the booking platform and associated services. Our commission is set at **4.3%** of the total booking price.

## Payout Calculation

The final payout to the host is calculated as follows:

**Host Payout = Total Booking Price - Stripe Processing Fee - Platform Commission**

### Example

Let's assume a guest books an apartment for a total price of **$500**.

*   **Total Booking Price:** $500
*   **Stripe Processing Fee:** (2.9% of $500) + $0.30 = $14.50 + $0.30 = $14.80
*   **Platform Commission:** 4.3% of $500 = $21.50
*   **Total Fees:** $14.80 + $21.50 = $36.30
*   **Host Payout:** $500 - $36.30 = **$463.70**

## How to Change the Commission Rate

To change the platform's commission rate, a technician will need to update the rate in two places: the backend for calculations and the frontend for marketing and display purposes.

### 1. Backend Configuration

The core commission rate logic is stored in a constant within the `utils/currencies.ts` file.

*   **File:** `utils/currencies.ts`
*   **Constant:** `STRIPE_COMMISSION_RATE`

To change the commission, modify the value of this constant. For example, to change the commission to 5%, you would update the line to:

```typescript
export const STRIPE_COMMISSION_RATE = 0.05; // 5%
```

### 2. Frontend Display

The commission rate is also displayed in the marketing text on the generic landing page. These values must be updated to match the backend configuration.

*   **File:** `components/GenericLandingPage.tsx`

In this file, you will need to update the following:

*   **ROI Section Text:** In the `ROISection` component, update the text that mentions the commission rate.
*   **ROI Section Calculation:** In the `ROISection` component's `useMemo` hook, update the `ourFee` variable to the new commission rate.
*   **Pricing Section Text:** In the `PricingSection` component, update the text that mentions the commission rate in the description and in the feature lists for the "Pro" and "Premium" plans.

By updating all of these locations, you will ensure that the new commission rate is consistently applied and displayed across the entire platform.

## Code Implementation

The logic for the Stripe checkout flow is distributed across several files in the codebase:

*   **`hooks/useBookApartment.ts`**: This is a client-side hook that initiates the booking process. It collects the booking details and calls the `createBooking` API endpoint.

*   **`services/api.ts`**: This file defines the `createBooking` function that sends a POST request to the backend API at `/api/v1/bookings`.

*   **`routes/api/bookings.ts`**: This is the Express route that handles the incoming booking request. It validates the request body and then calls the `createBooking` function in the `booking.service.ts`.

*   **`services/booking.service.ts`**: This is the core of the booking logic. The `createBooking` function in this file does the following:
    *   Calculates the total price, platform fee, Stripe fee, and host payout using the `calculateBookingPrices` function.
    *   Creates a Stripe Checkout session with the calculated amounts and the host's Stripe account as the transfer destination.
    *   The `line_items` in the session are configured with the final price, and the `payment_intent_data.transfer_data.amount` is set to the host's payout amount.
    *   Saves the booking details, including the Stripe session ID, to the database.

*   **`utils/currencies.ts`**: This file defines the `STRIPE_COMMISSION_RATE` (4.3%) and the fixed fees for different currencies, which are used in the payout calculation.

*   **`routes/api/stripe-webhooks.ts`**: This file contains the webhook handler for Stripe. When a checkout session is successfully completed, Stripe sends a `checkout.session.completed` event to this endpoint. The handler then does the following:
    *   Retrieves the booking from the database using the booking ID from the session metadata.
    *   Updates the booking status to `PAID`.
    *   Retrieves the actual Stripe fee from the charge's balance transaction and recalculates the platform fee and host payout to ensure accuracy.
    *   Sends a confirmation email to the guest.

This detailed breakdown provides a clear understanding of how the Stripe checkout process is implemented and how the fees and payouts are managed within the application.