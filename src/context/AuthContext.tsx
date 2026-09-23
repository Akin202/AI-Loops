import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase.ts';
import type { TeamRole } from '../../types/index.ts';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: TeamRole;
  profile: {
    id?: string;
    name?: string;
    title?: string;
    unit?: string;
    role?: TeamRole;
    email?: string;
  } | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  // For local development when Supabase project is not yet live
  devBypassLogin: (mockRole?: TeamRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<TeamRole>('Viewer');
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or initialize user profile from profiles table
  const loadUserProfile = async (currentUser: User) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data && !error) {
        setProfile(data);
        if (data.role) {
          setRole(data.role as TeamRole);
        }
      } else {
        // Fallback or create base profile
        const defaultRole: TeamRole = currentUser.email?.endsWith('@unipod.ng') || currentUser.email?.includes('admin')
          ? 'Lead'
          : 'Viewer';

        const newProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Team Member',
          role: defaultRole,
        };

        setProfile(newProfile);
        setRole(defaultRole);

        // Best effort create profile row
        await supabase.from('profiles').insert(newProfile).select().maybeSingle();
      }
    } catch (err) {
      console.warn('Could not load profile from Supabase, using default role:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // In offline / dev fallback mode, default to authenticated Lead for testing
      setLoading(false);
      return;
    }

    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        loadUserProfile(currentSession.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadUserProfile(newSession.user);
      } else {
        setProfile(null);
        setRole('Viewer');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured') };
    }

    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/console`
      : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole('Viewer');
  };

  const devBypassLogin = (mockRole: TeamRole = 'Lead') => {
    setRole(mockRole);
    setProfile({
      name: 'Ecosystem Lead',
      email: 'lead@loops.ng',
      role: mockRole,
      title: 'Head of Partnerships',
    });
    setUser({
      id: 'mock-user-id',
      email: 'lead@loops.ng',
      app_metadata: {},
      user_metadata: { full_name: 'Ecosystem Lead' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        profile,
        loading,
        signInWithMagicLink,
        signOut,
        devBypassLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
