import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../config/axios";

// Create the UserContext
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status on initial load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          // Verify token and get user data
          const response = await axiosInstance.get('/users/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Don't remove token here - just set user to null
        }
      }
      
      setLoading(false);
      setAuthChecked(true);
    };

    verifyUser();
  }, []);

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, authChecked, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;