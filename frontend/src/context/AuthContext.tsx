import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export interface User {
  id: string;
  username: string;
  email: string | null;
  full_name: string;
  portal_type: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  portalType: string;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [portalType, setPortalType] = useState<string>('staff');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setPortalType(parsed.portal_type || 'staff');
      } catch (e) {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_info', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    setPortalType(userData.portal_type);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, portalType, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
