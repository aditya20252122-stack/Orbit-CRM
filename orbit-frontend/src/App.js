import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    // 🧹 Auto-flush local storage if we detect a mock or corrupted token session to avoid loading empty dashboard data
    const token = localStorage.getItem("token");
    if (token === "demo-mock-jwt-token" || (token && token.split(".").length !== 3)) {
      console.warn("Invalid or Mock token detected! Clearing local storage for a clean database login.");
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  return <AppRoutes />;
}

export default App;