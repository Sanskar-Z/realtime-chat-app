import { IoLogOutOutline } from "react-icons/io5";
import chatIcon from "../images/ChatAPP.png";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";

const Sidebar = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    socket.disconnect();
    navigate("/login");
  };

  return (
    <aside className="w-20 md:w-24 bg-gray-900 flex flex-col items-center py-6 text-white">

      {/* Logo */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-800 transition">
  <img src={chatIcon} alt="chat" className="w-10 h-10 object-contain" />
</div>

      {/* Menu */}
      <nav className="flex flex-col space-y-6 mt-10">
        <button className="p-3 bg-gray-700 rounded-lg">💬</button>
      </nav>

      {/* Logout */}
      <div className="mt-auto pb-4">
        <button
          onClick={handleLogout}
          className="p-3 hover:bg-gray-700 rounded-lg"
        >
          <IoLogOutOutline size={22} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;