import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FarmerProfile, FarmDetails } from '@/lib/types';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: FarmerProfile | null;
  farmDetails: FarmDetails | null;
  isLoading: boolean;
  authUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<FarmerProfile>) => void;
  updateFarmDetails: (details: FarmDetails) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<FarmerProfile | null>(null);
  const [farmDetails, setFarmDetails] = useState<FarmDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setAuthUser(session?.user ?? null);
        
        // Defer profile loading with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setFarmDetails(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Load farmer profile
      const { data: farmerData, error: farmerError } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (farmerError) {
        console.error('Error loading farmer profile:', farmerError);
      }

      if (farmerData) {
        const profile: FarmerProfile = {
          id: farmerData.id,
          name: farmerData.name,
          email: authUser?.email || '',
          phone: farmerData.phone || '',
          latitude: Number(farmerData.latitude) || 0,
          longitude: Number(farmerData.longitude) || 0,
          state: farmerData.state || '',
          district: farmerData.district || '',
          createdAt: new Date(farmerData.created_at)
        };
        setUser(profile);

        // Load farm details
        const { data: farmData, error: farmError } = await supabase
          .from('farms')
          .select('*')
          .eq('farmer_id', farmerData.id)
          .maybeSingle();

        if (farmError) {
          console.error('Error loading farm:', farmError);
        }

        if (farmData) {
          setFarmDetails({
            id: farmData.id,
            farmerId: farmData.farmer_id,
            cropType: farmData.crop_type,
            sowingDate: new Date(farmData.sowing_date),
            season: farmData.season as 'Kharif' | 'Rabi' | 'Zaid',
            farmSize: Number(farmData.area_acres) || 1,
            farmSizeUnit: 'acres'
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    // Create initial farmer profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('farmers')
        .insert({
          user_id: data.user.id,
          name: name
        });

      if (profileError) {
        console.error('Error creating farmer profile:', profileError);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFarmDetails(null);
    setAuthUser(null);
    setSession(null);
  };

  const updateProfile = async (profile: Partial<FarmerProfile>) => {
    if (user && authUser) {
      const updated = { ...user, ...profile };
      setUser(updated);
      
      // Update in database
      const { error } = await supabase
        .from('farmers')
        .update({
          name: updated.name,
          phone: updated.phone,
          state: updated.state,
          district: updated.district,
          latitude: updated.latitude,
          longitude: updated.longitude
        })
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Error updating profile:', error);
      }
    } else if (authUser) {
      // First time setting profile after signup
      const newProfile: FarmerProfile = {
        id: '',
        name: '',
        email: authUser.email || '',
        phone: profile.phone || '',
        latitude: profile.latitude || 0,
        longitude: profile.longitude || 0,
        state: profile.state || '',
        district: profile.district || '',
        createdAt: new Date()
      };
      
      const merged = { ...newProfile, ...profile };
      setUser(merged);

      // Update in database
      const { error } = await supabase
        .from('farmers')
        .update({
          phone: merged.phone,
          state: merged.state,
          district: merged.district,
          latitude: merged.latitude,
          longitude: merged.longitude
        })
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const updateFarmDetails = async (details: FarmDetails) => {
    setFarmDetails(details);

    if (!authUser) return;

    // Get farmer ID
    const { data: farmer } = await supabase
      .from('farmers')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    if (!farmer) {
      console.error('Farmer not found');
      return;
    }

    // Check if farm exists
    const { data: existingFarm } = await supabase
      .from('farms')
      .select('id')
      .eq('farmer_id', farmer.id)
      .maybeSingle();

    if (existingFarm) {
      // Update existing farm
      const { error } = await supabase
        .from('farms')
        .update({
          crop_type: details.cropType,
          sowing_date: details.sowingDate.toISOString().split('T')[0],
          season: details.season,
          area_acres: details.farmSize
        })
        .eq('id', existingFarm.id);

      if (error) {
        console.error('Error updating farm:', error);
      }
    } else {
      // Create new farm
      const { error } = await supabase
        .from('farms')
        .insert({
          farmer_id: farmer.id,
          crop_type: details.cropType,
          sowing_date: details.sowingDate.toISOString().split('T')[0],
          season: details.season,
          area_acres: details.farmSize
        });

      if (error) {
        console.error('Error creating farm:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      farmDetails,
      isLoading,
      authUser,
      login,
      signup,
      logout,
      updateProfile,
      updateFarmDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
