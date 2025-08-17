import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  division: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: 'admin' | 'manager' | 'user';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Auth state change detected
        
        // Handle sign out or token refresh errors
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setUserRole(null);
            setLoading(false);
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and role when authenticated
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Clear invalid session
        setSession(null);
        setUser(null);
        setProfile(null);
        setUserRole(null);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Auth session error:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setUserRole(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserRole(data);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh profile data
      await fetchUserProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    profile,
    userRole,
    loading,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: userRole?.role === 'admin',
    isManager: userRole?.role === 'manager',
    isPending: profile?.status === 'pending',
    isApproved: profile?.status === 'approved',
    isRejected: profile?.status === 'rejected',
  };
};