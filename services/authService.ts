import { supabase } from './api';
import { User } from '../types';

export const signInWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: any }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }

  if (data.user) {
    const { user } = data;
    const finalUser: User = {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata as any)?.role || 'guest',
      name: (user.user_metadata as any)?.name || '', // Make sure name & avatar are in metadata
      avatar: (user.user_metadata as any)?.avatar || '',
    };
    return { user: finalUser, error: null };
  }

  return { user: null, error: new Error('User data not found after sign-in.') };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const { user } = session;
        callback({
          id: user.id,
          email: user.email || '',
          role: (user.user_metadata as any)?.role || 'guest',
          name: (user.user_metadata as any)?.name || user.email || '',
          avatar: (user.user_metadata as any)?.avatar || '',
        });
      } else {
        callback(null);
      }
    }
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
};