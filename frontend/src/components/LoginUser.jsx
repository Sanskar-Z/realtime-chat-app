import { useState } from "react";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/useAuth";
import { NavLink, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";


const LoginUser = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if ([usernameOrEmail, password].some(f => f.trim() === "")) {
            alert("All fields are required");
            return;
        }

        try {
            const res = await loginUser(usernameOrEmail, password);

            console.log("Login successful:", res);

            setUser(res.data.user);

            navigate("/"); // go to chat
        } catch (error) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="register-user flex justify-center items-center h-screen">
            <div className="flex flex-col gap-4 p-6 w-[30%] border border-gray-100 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-center">
                    Login User
                </h2>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">

                    {/* Username / Email */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="usernameOrEmail" className="text-sm font-medium">
                            Username or Email
                        </label>
                        <input
                            id="usernameOrEmail"
                            type="text"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            placeholder="Enter username or email"
                            className="p-3 shadow-sm border border-gray-100 rounded-md focus:outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1 relative">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="p-3 shadow-sm border border-gray-100 rounded-md focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="m-auto bg-blue-500 text-white px-4 py-2 rounded-md active:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
                <NavLink to="/register" className="text-sm text-center text-blue-500 hover:underline">
                    Don't have an account? Register here.
                </NavLink>
            </div>
        </div>
    );
};

export default LoginUser;
