import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FarmerProfile, FarmDetails } from '@/lib/types';

interface AuthContextType {
  user: FarmerProfile | null;
  farmDetails: FarmDetails | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<FarmerProfile>) => void;
  updateFarmDetails: (details: FarmDetails) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FarmerProfile | null>(null);
  const [farmDetails, setFarmDetails] = useState<FarmDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('agropulse_user');
    const storedFarm = localStorage.getItem('agropulse_farm');
    
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }
    if (storedFarm) {
      const parsed = JSON.parse(storedFarm);
      parsed.sowingDate = new Date(parsed.sowingDate);
      setFarmDetails(parsed);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login - in production, use Firebase Auth
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const storedUser = localStorage.getItem('agropulse_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.email === email) {
        setUser(parsed);
        const storedFarm = localStorage.getItem('agropulse_farm');
        if (storedFarm) {
          const parsedFarm = JSON.parse(storedFarm);
          parsedFarm.sowingDate = new Date(parsedFarm.sowingDate);
          setFarmDetails(parsedFarm);
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } else {
      throw new Error('User not found. Please sign up first.');
    }
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: FarmerProfile = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone: '',
      latitude: 0,
      longitude: 0,
      state: '',
      district: '',
      createdAt: new Date()
    };
    
    setUser(newUser);
    localStorage.setItem('agropulse_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setFarmDetails(null);
    localStorage.removeItem('agropulse_user');
    localStorage.removeItem('agropulse_farm');
  };

  const updateProfile = (profile: Partial<FarmerProfile>) => {
    if (user) {
      const updated = { ...user, ...profile };
      setUser(updated);
      localStorage.setItem('agropulse_user', JSON.stringify(updated));
    }
  };

  const updateFarmDetails = (details: FarmDetails) => {
    setFarmDetails(details);
    localStorage.setItem('agropulse_farm', JSON.stringify(details));
  };

  return (
    <AuthContext.Provider value={{
      user,
      farmDetails,
      isLoading,
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
