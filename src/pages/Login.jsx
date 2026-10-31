import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../api/axios";
import { setAuth } from "../utils/auth";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", data);
      const { token, user } = res.data;

      setAuth(token, user.role);

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/worker");
      }
    } catch (err) {
      if (err.code === "ECONNABORTED" || !err.response) {
        toast.error("Connecting to server... free tier is waking up. Please retry in a few seconds.", { duration: 6000 });
      } else if (err.response?.status === 503) {
        toast.error(err.response?.data?.message || "Backend service or database is reconnecting. Please wait a moment.", { duration: 6000 });
      } else {
        toast.error(err.response?.data?.message || "Invalid credentials. Please check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md" />
      </div>

      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism Card */}
      <form 
        className="relative bg-white/10 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 z-10" 
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Rubber Factory</h2>
          <p className="text-sm text-blue-200 mt-2 font-medium">System Authentication</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              {...register("email")}
              className={`appearance-none block w-full px-4 py-3 bg-white/5 border ${errors.email ? 'border-red-400' : 'border-white/20'} rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm sm:text-sm`}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-300 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={`appearance-none block w-full px-4 py-3 bg-white/5 border ${errors.password ? 'border-red-400' : 'border-white/20'} rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm sm:text-sm`}
            />
            {errors.password && <p className="mt-1.5 text-sm text-red-300 font-medium">{errors.password.message}</p>}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-8 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-900 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {loading ? "Authenticating..." : "Sign in to Dashboard"}
        </button>
      </form>
    </div>
  );
}

export default Login;
