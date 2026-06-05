import { IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineMessage } from "react-icons/md";
import chatIcon from "../images/SwiftChat.png";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../socket/socket";

const Sidebar = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    { icon: <MdOutlineMessage size={20} />, label: "Chat", path: "/", onClick: () => navigate("/") },
    { icon: <IoSettingsOutline size={20} />, label: "Settings", path: "/settings", onClick: () => navigate("/settings") },
  ];

  return (
    <aside className="w-[68px] bg-white border-r border-gray-100 flex flex-col items-center py-5 h-screen flex-shrink-0">

      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-8 flex-shrink-0">
        <img src={chatIcon} alt="SwiftChat" className="w-6 h-6 object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={item.onClick}
              aria-label={item.label}
              title={item.label}
              className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150
                ${isActive
                  ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }
              `}
            >
              {item.icon}
              {isActive && (
                <span className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        aria-label="Logout"
        title="Log out"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-all duration-150"
      >
        <IoLogOutOutline size={20} />
      </button>

    </aside>
  );
};

export default Sidebar;