import { useState } from "react";
import { registerUser } from "../services/authService";
import { NavLink, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import logo from "../images/SwiftChat.png";
import { toast } from "react-hot-toast";

const RegisterUser = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if ([fullName, email, username, password].some((f) => f.trim() === "")) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(fullName, email, username, password);
      toast.success(res.message || "Registration successful");
      setFullName("");
      setEmail("");
      setUsername("");
      setPassword("");
      navigate("/login");
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">

      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #dbeafe 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <main className="relative w-full max-w-[400px]">

        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md shadow-blue-100 border border-blue-50 flex items-center justify-center mb-3">
            <img src={logo} alt="SwiftChat" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">SwiftChat</h1>
          <p className="text-sm text-gray-400 mt-0.5">Fast. Simple. Reliable messaging.</p>
        </div>

        {/* Card */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200 px-8 py-8">

          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-400 mt-0.5">Start your conversations today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4.5 h-4.5" />
                  ) : (
                    <EyeIcon className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl transition-all duration-150 shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-blue-500 font-semibold hover:text-blue-600 hover:underline transition"
            >
              Sign in
            </NavLink>
          </p>

        </section>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} SwiftChat · All rights reserved
        </p>

      </main>
    </div>
  );
};

export default RegisterUser;