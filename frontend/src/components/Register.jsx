import { useState } from "react"

const Register = ({onRegister}) => {
    const [username, setUsername] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim()) return;
        
        onRegister(username)
    }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[30vw] h-[30vh] flex flex-col gap-6 p-6 rounded-2xl border border-gray-200 shadow-lg">
        <p className="text-2xl mx-auto">Register</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            className="p-3 shadow-sm rounded border border-gray-200"
            placeholder="Username"
          />

          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg active:bg-blue-600">
            Register
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
