import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaSearch, FaInfoCircle, FaBars } from "react-icons/fa";
import AgentsService from "../../services/AgentsService";
import LeadService from "../../services/leadService";

import "./Navbar.css";

function Navbar({ onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  const userRole = localStorage.getItem("userRole") || "USER";
  const userEmail = localStorage.getItem("userEmail") || "admin@orbit.com";

  // Dynamic notification states
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);
  const maxSeenIdRef = useRef(0);
  const isFirstLoadRef = useRef(true);
  
  // Extract clean first name: remove numbers and strip last name 'suryavanshi'
  let namePart = userEmail.split("@")[0].toLowerCase().replace(/[0-9]/g, "");
  if (namePart.includes("suryavanshi")) {
    namePart = namePart.split("suryavanshi")[0];
  }
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  // Poll leads for new enquiries / assignments
  useEffect(() => {
    let intervalId;
    
    const checkNewEnquiries = async () => {
      try {
        const role = localStorage.getItem("userRole") || "USER";
        const email = localStorage.getItem("userEmail") || "";
        
        let currentLeads = [];
        
        if (role === "AGENT" && email) {
          // Agent: Fetch agent details then fetch assigned leads via service
          try {
            const agentProfile = await AgentsService.getAgentByEmail(email.trim().toLowerCase());
            if (agentProfile && agentProfile.id) {
              currentLeads = await LeadService.getLeadsByAgent(agentProfile.id);
            }
          } catch (err) {
            console.error("Error fetching agent leads in Navbar:", err);
          }
        } else {
          // Admin / Manager: Fetch all leads via service
          try {
            currentLeads = await LeadService.getAllLeads();
          } catch (err) {
            console.error("Error fetching leads in Navbar:", err);
          }
        }
        
        if (!Array.isArray(currentLeads)) return;

        // Sort by ID to process them chronologically
        const sortedLeads = [...currentLeads].sort((a, b) => a.id - b.id);
        
        if (isFirstLoadRef.current) {
          // Initial load: set base seen ID and add last 3 as read history
          if (sortedLeads.length > 0) {
            maxSeenIdRef.current = Math.max(...sortedLeads.map(l => l.id));
            
            const history = sortedLeads.slice(-3).map(l => ({
              id: `hist-${l.id}`,
              text: role === "AGENT"
                ? `Lead '${l.name}' is assigned to you in ${l.area || "your area"}.`
                : `New client enquiry received from '${l.name}' in ${l.area || "unspecified area"}.`,
              time: "Previously",
              type: "info",
              read: true
            }));
            setNotificationsList(history.reverse());
          }
          isFirstLoadRef.current = false;
        } else {
          // Check for new leads
          const newLeads = sortedLeads.filter(l => l.id > maxSeenIdRef.current);
          if (newLeads.length > 0) {
            maxSeenIdRef.current = Math.max(...newLeads.map(l => l.id));
            
            const newNotifs = newLeads.map(l => ({
              id: `new-${l.id}-${Date.now()}`,
              text: role === "AGENT"
                ? `New lead '${l.name}' assigned to you in ${l.area || "your area"}!`
                : `New client enquiry '${l.name}' received in ${l.area || "unspecified area"}!`,
              time: "Just now",
              type: "warning",
              read: false
            }));
            
            setNotificationsList(prev => [...newNotifs, ...prev]);
            setUnreadCount(prev => prev + newNotifs.length);
            
            // Set toast warning alert
            const latest = newLeads[newLeads.length - 1];
            setActiveToast({
              title: role === "AGENT" ? "New Lead Assigned" : "New Client Enquiry",
              message: role === "AGENT"
                ? `Lead '${latest.name}' assigned to you in ${latest.area || "your area"}.`
                : `Client '${latest.name}' submitted an enquiry in ${latest.area || "unspecified area"}.`
            });
            
            setTimeout(() => {
              setActiveToast(null);
            }, 5000);
          }
        }
      } catch (err) {
        console.error("Error checking for new leads:", err);
      }
    };

    checkNewEnquiries();
    intervalId = setInterval(checkNewEnquiries, 15000); // Check every 15 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleDropdown = () => {
    setShowNotifications(!showNotifications);
    setUnreadCount(0); // clear red dot on opening panel
  };

  return (
    <div className="navbar glass-panel">
      <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
        <FaBars />
      </button>
      <div className="navbar-search">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Quick search leads, agents..." />
      </div>

      <div className="navbar-right">
        {/* Notifications Icon with Indicator */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <div className="bell-container" onClick={handleToggleDropdown}>
            <FaBell className="notification-icon" />
            {unreadCount > 0 && <span className="notification-dot"></span>}
          </div>

          {showNotifications && (
            <div className="notifications-dropdown glass-panel animate-scale-up">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <span className="mark-read" onClick={handleMarkAllRead}>Mark all read</span>
              </div>
              <div className="dropdown-body">
                {notificationsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px", fontSize: "0.78rem", color: "#94a3b8" }}>
                    No new notifications.
                  </div>
                ) : (
                  notificationsList.map((item) => (
                    <div key={item.id} className={`notification-item ${!item.read ? "unread" : ""}`}>
                      <div className="item-icon-wrapper">
                        <FaInfoCircle className={`item-icon ${item.type}`} />
                      </div>
                      <div className="item-content">
                        <p className="item-text" style={{ fontWeight: !item.read ? 600 : 400 }}>{item.text}</p>
                        <span className="item-time">{item.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-container">
          <div className="profile-avatar">
            {displayName.charAt(0)}
          </div>
          <div className="profile-details">
            <span className="profile-name">{displayName}</span>
            <span className={`profile-role-badge ${userRole.toLowerCase()}`}>
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Slide-in Toast Banner */}
      {activeToast && (
        <div className="toast-notification-banner animate-slide-in">
          <div className="toast-icon-circle">🔔</div>
          <div className="toast-body-content">
            <h4>{activeToast.title}</h4>
            <p>{activeToast.message}</p>
          </div>
          <button className="toast-close-btn" onClick={() => setActiveToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;