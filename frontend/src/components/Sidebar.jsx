import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import chatIcon from "../images/ChatAPP.png";
import { BsFillPersonFill } from "react-icons/bs";
import { IoLogOutOutline } from "react-icons/io5";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/useAuth";

const Sidebar = ({ onSelectUser, activeUser }) => {
  const { setUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);


  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    socket.disconnect();
    navigate("/login");
  };

  return (
    <div className="p-3 w-[40vw] h-[96vh] rounded-2xl bg-white border border-gray-200 shadow-md relat ive overflow-hidden">
      {console.log("Online-users: ", onlineUsers)}

      {/* Header */}
      <div className="p-3 flex items-center gap-2 sticky top-0 bg-white z-10 justify-between">
        <span className="flex gap-2 items-center">
          <img src={chatIcon} alt="Chat App" className="w-10 h-10" />
          <span className="font-bold text-xl text-blue-600">ChatAPP</span>
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm leading-none cursor-pointer hover:bg-gray-100 hover:text-red-600"
        >
          <IoLogOutOutline size={14} />
          <span>Logout</span>
        </button>
      </div>

      {/* Online users */}
      <div className="mt-2 p-3 flex flex-col gap-1.5 shadow-md bg-gray-50 rounded-lg h-[89%]">
        <h2 className="text-xl font-semibold mb-2">Online Users</h2>

        <div className="flex-1 overflow-auto">
          {console.log(socket)}

          {onlineUsers.size === 0 ? (
            <p className="text-gray-500">No users online</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {onlineUsers
                .filter((id) => id.userId != socket?.auth?.userId)
                .map((user) => (
                  <li
                    key={user.userId}
                    onClick={() => onSelectUser(user.userId)}
                    className={`p-2 rounded-lg cursor-pointer flex gap-3 items-center
              ${activeUser === user.userId ? "bg-blue-100" : "bg-gray-100 hover:bg-blue-50"}`}
                  >
                    {/* avatar */}
                    <span className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      <BsFillPersonFill size={20} color="" />
                    </span>

                    <span className="font-medium">{user.username}</span>

                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
