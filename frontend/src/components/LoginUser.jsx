import { useState } from "react"
import { loginUser } from "../services/authService"

const LoginUser = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = (e) => {
        e.preventDefault()

        if ([usernameOrEmail, password].some(f => f.trim() === "")) {
            alert("All fields are required")
            return
        }

        console.log({ usernameOrEmail, password })

        loginUser(usernameOrEmail, password)
            .then((res) => {
                console.log("Login successful:", res)
                alert("Login successful")
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
            <div className="flex flex-col gap-4 p-6 w-[30%] border border-gray-100 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-center">
                    Login User
                </h2>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">

                    {/* Email or Username */}
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
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="p-3 shadow-sm border border-gray-100 rounded-md focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="m-auto bg-blue-500 text-white px-4 py-2 rounded-md active:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginUser
