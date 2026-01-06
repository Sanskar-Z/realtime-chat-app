import { useState } from "react"
import { registerUser } from "../services/authService.js"
import { NavLink } from "react-router-dom"

const RegisterUser = () => {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault()

        if ([fullName, email, username, password].some(f => f.trim() === "")) {
            alert("All fields are required")
            return
        }

        registerUser(fullName, email, username, password)
            .then((data) => {
                console.log("User registered successfully:", data)
                alert(data.message || "Registration successful")
                setFullName("")
                setEmail("")
                setUsername("")
                setPassword("")
            })
            .catch((error) => {
                if (error.response && error.response.data?.message) {
                    alert(error.response.data.message)
                } else {
                    alert("Something went wrong. Please try again.")
                }
            })
    }

    return (
        <div className="register-user flex justify-center items-center h-screen">
            <div className="flex flex-col gap-4 p-6 w-[50%] border border-gray-100 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-center">
                    Register User
                </h2>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="fullname" className="text-sm font-medium">
                            Full Name
                        </label>
                        <input
                            id="fullname"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                            className="p-3 shadow-sm border border-gray-100 rounded-md focus:outline-none"
                        />
                    </div>

                    {/* Email + Username */}
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 w-1/2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                className="p-3 shadow-sm border border-gray-100 rounded-md focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1 w-1/2">
                            <label htmlFor="username" className="text-sm font-medium">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="p-3 shadow-sm border border-gray-100 rounded-md focus:outline-none"
                            />
                        </div>
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
                            className="absolute right-3 top-9 text-sm text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="m-auto bg-blue-500 text-white px-4 py-2 rounded-md active:bg-blue-600"
                    >
                        Register
                    </button>
                </form>
                <NavLink to="/login" className="text-sm text-center text-blue-500 hover:underline">
                    Already have an account? Login here.
                </NavLink>
            </div>
        </div>
    )
}

export default RegisterUser
