import { useState, useEffect } from "react";
import socket from "../socket/socket";
import chatIcon from "../images/ChatAPP.png";
import { BsFillPersonFill } from "react-icons/bs";

const Sidebar = ({onSelectUser, activeUser}) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users));
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);

  return (
    <div className="p-3 w-[30vw] h-[96vh] rounded-2xl bg-white border border-gray-200 shadow-md relative overflow-hidden">
      {console.log("Online-users: ", onlineUsers)}

      {/* Header */}
      <div className="p-3 flex items-center gap-2 font-bold text-xl text-blue-600 sticky top-0 bg-white z-10">
        <img src={chatIcon} alt="Chat App" className="w-10 h-10" />
        <span>ChatAPP</span>
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
              {Array.from(onlineUsers)
              .filter((id) => id != socket?.auth?.userId)  
              .map((userId) => (
                <li
                  key={userId}
                  onClick={() => onSelectUser(userId)}
                  className={`p-2 rounded-lg cursor-pointer flex gap-3 items-center
              ${activeUser === userId ? "bg-blue-100" : "bg-gray-100 hover:bg-blue-50"}`}
                >
                  {/* avatar */}
                  <span className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    <BsFillPersonFill size={20} color="" />
                  </span>

                  <span className="font-medium">{userId}</span>

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
