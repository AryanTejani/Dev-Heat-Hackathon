import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add request interceptor to dynamically add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage at request time (not just at creation time)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - redirect to login without clearing token
      // This allows the user to potentially refresh the token instead of logging out
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;