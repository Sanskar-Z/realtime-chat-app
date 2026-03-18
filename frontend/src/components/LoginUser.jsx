import { useState } from "react";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/useAuth";
import { NavLink, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import logo from "../images/ChatAPP.png";

const LoginUser = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if ([usernameOrEmail, password].some((f) => f.trim() === "")) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await loginUser(usernameOrEmail, password);

      console.log("Login successful:", res);
      setUser(res.data.user);

      navigate("/");
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-indigo-200">
      <main className="w-full max-w-md p-6 animate-fade-in">
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 md:p-10">

          {/* Header */}
          <header className="text-center mb-8">
              <img src={logo} alt="Chat App Logo" className="w-20 mx-auto mb-4" />
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            </div> */}

            <h1 className="text-2xl font-bold text-gray-800">
              Welcome Back
            </h1>

            <p className="text-gray-500 mt-2">
              Sign in to continue your conversations
            </p>
          </header> 

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email / Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username or Email
              </label>

              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter username or email"
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">

              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600"
                >
                  Forgot password?
                </button>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-10 text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <NavLink
                to="/register"
                className="text-indigo-600 font-bold hover:underline"
              >
                Create account
              </NavLink>
            </p>
          </footer>

        </section>
      </main>
    </div>
  );
};

export default LoginUser;