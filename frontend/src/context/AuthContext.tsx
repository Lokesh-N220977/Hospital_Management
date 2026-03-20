import React, { createContext, useContext, useState } from 'react';
import authService, { type User, type LoginResponse } from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (res: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Init from localStorage so page refresh doesn't log user out
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!authService.getStoredUser());

  /** Call this after any successful login (OTP or Email) */
  const login = (res: LoginResponse) => {
    authService.storeSession(res);
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.clearSession();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
