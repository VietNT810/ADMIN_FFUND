import React, { createContext, useContext, useState, useEffect } from 'react';
import checkAuth from '../app/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      setIsLoading(true);
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        setUserRole(localStorage.getItem('role'));
      } else {
        setUserRole(null);
      }

      setIsLoading(false);
    };

    authenticateUser();

    const handleStorageChange = () => {
      authenticateUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch("https://quanbeo.duckdns.org/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();

      if (!response.ok) {

        if (typeof data.error === 'string') {
          throw new Error(data.error);
        }

        if (typeof data.error === 'object') {
          const errorMessages = Object.entries(data.error)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          return { success: false, error: errorMessages };
        }
        
        throw new Error("Login failed");
      }

      const { accessToken, refreshToken, role, userId } = data.data || data;

      if (!accessToken) {
        throw new Error("No access token received. Login failed!");
      }

      if (role !== "ADMIN") {
        throw new Error("Access denied! Only ADMIN users are allowed.");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);

      setIsAuthenticated(true);
      setUserRole(role);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const value = {
    isAuthenticated,
    userRole,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
