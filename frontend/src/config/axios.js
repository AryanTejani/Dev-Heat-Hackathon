import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://dev-heat-hackathon.onrender.com",
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
    // Handle 401 (Unauthorized) and 404 (Not Found) errors
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem("token"); // Clear invalid token
        window.location.href = '/login';
      }
      // You can also handle 404 errors here if needed
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
