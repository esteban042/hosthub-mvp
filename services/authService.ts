import { User } from '../types';

const API_BASE_URL = '/api/v1';

export const signInWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { user: null, error: errorData.error || 'Invalid credentials' };
    }

    const user: User = await response.json();
    return { user, error: null };
  } catch (err) {
    return { user: null, error: 'An unexpected error occurred.' };
  }
};

export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Logout failed.' };
    }

    return { error: null };
  } catch (err) {
    return { error: 'An unexpected error occurred.' };
  }
};

export const checkSession = async (): Promise<{ user: User | null; error: string | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/me`);

    if (!response.ok) {
      return { user: null, error: 'No active session' };
    }

    const user: User = await response.json();
    return { user, error: null };
  } catch (err) {
    return { user: null, error: 'An unexpected error occurred.' };
  }
};
