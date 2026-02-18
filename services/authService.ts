import { User } from '../types.js';
import { fetchApi } from './api';

interface AuthResult {
  user: User | null;
  error: string | null;
}

/**
 * Initiates a passkey (WebAuthn) login flow.
 * NOTE: The password parameter is ignored, but kept for compatibility with the
 * existing form submission logic. The actual authentication is passwordless.
 */
export const signInWithEmail = async (email: string, password?: string): Promise<AuthResult> => {
  try {
    const user = await fetchApi<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return { user, error: null };
  } catch (error: any) {
    console.error('Sign In Failed:', error);
    return { user: null, error: error.message || 'Login failed. Please try again.' };
  }
};

/**
 * Checks if a valid session cookie exists by calling a protected endpoint.
 */
export const checkSession = async (): Promise<AuthResult> => {
  try {
    const user = await fetchApi<User>('/auth/me');
    return { user, error: null };
  } catch (error) {
    // A failure to fetch 'me' is the expected behavior for a logged-out user.
    // This is not an application error, so we return null for both user and error.
    return { user: null, error: null };
  }
};

/**
 * Logs the user out by telling the backend to clear the session cookie.
 */
export const signOut = async (): Promise<void> => {
  try {
    await fetchApi('/auth/logout', { method: 'POST' });
  } catch (error: any) {
    // Log the error, but don't disrupt the user's experience,
    // as we are clearing the client-side state anyway.
    console.error("Server logout failed:", error.message);
  }
};
