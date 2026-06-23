import { NavLink, useNavigate } from "react-router-dom";
import {
  FaAddressBook,
  FaCog,
  FaFileAlt,
  FaHome,
  FaSignOutAlt,
  FaUsers,
  FaUserTie,
  FaTimes
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "ADMIN";

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/loginpage");
  };

  return (
    <div className={`sidebar shadow-xl ${isOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="logo-dot"></div>
        <span>Orbit</span>
        <span className="logo-accent">CRM</span>
        <button className="sidebar-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="sidebar-menu">
        <div className="menu-group-label">Core Modules</div>
        
        {userRole === "ADMIN" && (
          <NavLink to="/dashboard" className="sidebar-link">
            <FaHome className="link-icon" />
            <span>Dashboard</span>
          </NavLink>
        )}

        <NavLink to="/leads" className="sidebar-link">
          <FaUsers className="link-icon" />
          <span>{userRole === "AGENT" ? "My Leads" : "Leads"}</span>
        </NavLink>

        {userRole === "ADMIN" && (
          <NavLink to="/manager" className="sidebar-link">
            <FaUserTie className="link-icon" />
            <span>Managers</span>
          </NavLink>
        )}

        {(userRole === "ADMIN" || userRole === "MANAGER") && (
          <NavLink to="/agents" className="sidebar-link">
            <FaUsers className="link-icon" />
            <span>Agents</span>
          </NavLink>
        )}

        {userRole === "ADMIN" && (
          <NavLink to="/contacts" className="sidebar-link">
            <FaAddressBook className="link-icon" />
            <span>Contacts</span>
          </NavLink>
        )}

        {(userRole === "ADMIN" || userRole === "MANAGER") && (
          <NavLink to="/reports" className="sidebar-link">
            <FaFileAlt className="link-icon" />
            <span>Reports</span>
          </NavLink>
        )}
      </div>

      <div className="sidebar-footer border-t border-slate-800 pt-5">
        <NavLink to="/settings" className="sidebar-link">
          <FaCog className="link-icon" />
          <span>Settings</span>
        </NavLink>

        <a href="#logout" className="sidebar-link logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="link-icon" />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
}

export default Sidebar;