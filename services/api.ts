import { Apartment, Booking, BookingStatus, Host, BlockedDate } from '../types';

// THIS MUST BE UPDATED AFTER DEPLOYMENT TO YOUR RENDER BACKEND SERVICE URL
const API_BASE_URL = 'https://hosthub-backend42.onrender.com'; 

export const hostHubApi = {
  async getLandingData(slug?: string): Promise<{ host: Host; apartments: Apartment[]; bookings: Booking[]; blockedDates: BlockedDate[] }> {
    const response = await fetch(`${API_BASE_URL}/landing?slug=${slug || ''}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },

  async getAllHosts(): Promise<Host[]> {
    const response = await fetch(`${API_BASE_URL}/hosts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  },

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }
    const newBooking = await response.json();
    return newBooking;
  },

  async updateHosts(updatedList: Host[]): Promise<Host[]> {
    const response = await fetch(`${API_BASE_URL}/hosts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedList),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }
    const updatedHosts = await response.json();
    return updatedHosts;
  },

  async updateApartments(updatedList: Apartment[]): Promise<Apartment[]> {
    const response = await fetch(`${API_BASE_URL}/apartments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedList),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }
    const updatedApartments = await response.json();
    return updatedApartments;
  },

  async updateBookings(updatedList: Booking[]): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedList),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }
    const updatedBookings = await response.json();
    return updatedBookings;
  },

  async updateBlockedDates(updatedList: BlockedDate[]): Promise<BlockedDate[]> {
    const response = await fetch(`${API_BASE_URL}/blocked-dates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedList),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }
    const updatedBlockedDates = await response.json();
    return updatedBlockedDates;
  }
};