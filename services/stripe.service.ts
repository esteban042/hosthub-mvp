import Stripe from 'stripe';
import { getHostByUserId, updateHost } from './host.service';

// TODO: Replace with your Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createStripeAccount = async (userId: string): Promise<string> => {
  const host = await getHostByUserId(userId);
  if (!host) {
    throw new Error('Host not found');
  }

  if (host.stripeAccountId) {
    return host.stripeAccountId;
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: host.contactEmail,
    business_type: 'individual',
    individual: {
      email: host.contactEmail,
    },
  });

  await updateHost(host.id, { stripeAccountId: account.id });

  return account.id;
};

export const createStripeAccountLink = async (accountId: string): Promise<Stripe.AccountLink> => {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.APP_URL}/host/settings`,
    return_url: `${process.env.APP_URL}/host/settings`,
    type: 'account_onboarding',
  });

  return accountLink;
};
