import React, { useState, useEffect } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import "./Layout.css";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Monitor DOM for modal presence and toggle modal-open class on body
    const observer = new MutationObserver(() => {
      const modalExists = document.querySelector(".modal-overlay") !== null;
      if (modalExists) {
        document.body.classList.add("modal-open");
      } else {
        document.body.classList.remove("modal-open");
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      document.body.classList.remove("modal-open");
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* Sidebar Backdrop Overlay for Mobile/Tablet */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="layout-content">
        <Navbar onToggleSidebar={toggleSidebar} />

        <div className="page-content animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;