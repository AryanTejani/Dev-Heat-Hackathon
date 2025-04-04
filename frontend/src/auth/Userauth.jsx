import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";

const UserAuth = ({ children }) => {
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyAuth = async () => {
      if (!user && token) {
        try {
          const response = await axiosInstance.get("/users/me");
          setUser(response.data.user);
        } catch (error) {
          console.error("Auth verification failed:", error);
          // We don't remove the token here, just let the request fail
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [user, token, setUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only redirect if there's definitely no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Even if user data fetch failed, we'll try to render children
  // The API calls in children components will handle auth errors
  return children;
};

export default UserAuth;
