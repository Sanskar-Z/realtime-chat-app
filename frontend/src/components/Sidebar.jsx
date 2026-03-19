import { IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";
import chatIcon from "../images/ChatAPP.png";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";

const Sidebar = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      socket.disconnect();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { icon: "💬", label: "Chat", onClick: () => navigate("/") },
    { icon: <IoSettingsOutline size={20} />, label: "Settings", onClick: () => navigate("/settings") },
    // Add more menu items here
  ];

  return (
    <aside className="w-20 md:w-24 bg-gray-900 flex flex-col items-center py-6 text-white h-screen">

      {/* Logo */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-800 transition">
        <img src={chatIcon} alt="ChatApp Logo" className="w-10 h-10 object-contain" />
      </div>

      {/* Menu */}
      <nav className="flex flex-col space-y-6 mt-10">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            aria-label={item.label}
            className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex items-center justify-center"
          >
            {item.icon}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto pb-4">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="p-3 hover:bg-gray-700 rounded-lg transition flex items-center justify-center"
        >
          <IoLogOutOutline size={22} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;