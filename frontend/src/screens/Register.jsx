import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    axiosInstance
      .post("/users/register", {
        email,
        password,
      })
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem("token", token);
        setUser(res.data.user);

        // Update axios header with new token
        axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;

        navigate("/");
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          setError(err.response.data.message || "Registration failed");
          console.log(err.response.data);
        } else {
          setError("Unexpected error occurred");
          console.error("Unexpected error:", err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Register</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded">{error}</div>
        )}
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded ${
              loading ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
