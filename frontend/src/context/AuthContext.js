"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// Add useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminToken = localStorage.getItem("adminToken");
        
        if (token) {
          // Validate token with backend
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              'x-auth-token': token
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
          }
        }
        
        if (adminToken === "yes") {
          setIsAdminAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Failed to verify authentication");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginAdmin = () => {
    localStorage.setItem("adminToken", "yes");
    setIsAdminAuthenticated(true);
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    setIsAdminAuthenticated(false);
  };

  const login = async (token, userData) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to login");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Update user data
  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const response = await fetch('http://localhost:5000/api/users/me', {
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const updatedUserData = await response.json();
        setUser(updatedUserData);
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      } else {
        throw new Error("Failed to update user data");
      }
    } catch (err) {
      console.error("Update user error:", err);
      setError("Failed to update user data");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
