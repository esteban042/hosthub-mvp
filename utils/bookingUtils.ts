export const getGuestDisplayName = (guestName: string, guestEmail: string) => {
  return guestName || (guestEmail.split('@')[0].charAt(0).toUpperCase() + guestEmail.split('@')[0].slice(1));
};