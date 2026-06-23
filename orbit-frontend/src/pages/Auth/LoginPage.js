import { useState } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBullseye,
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaRocket,
  FaUnlockAlt
} from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ADMIN"); // ADMIN, MANAGER, AGENT
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password first.");
      return;
    }
    setErrorMessage("");
    setLoadingOtp(true);
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorObj;
        try {
          errorObj = JSON.parse(errorText);
        } catch (e) {}
        throw new Error((errorObj && errorObj.message) || errorText || "Failed to send verification code. Please check credentials.");
      }
      
      setLoadingOtp(false);
      setOtpSent(true);
    } catch (err) {
      setLoadingOtp(false);
      setErrorMessage(err.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    if (role === "ADMIN" && !otpSent) {
      setErrorMessage("Please request and enter an OTP first.");
      return;
    }

    if (role === "ADMIN" && !otp) {
      setErrorMessage("Please enter the OTP.");
      return;
    }

    setErrorMessage("");
    try {
      const urlMap = {
        ADMIN: "http://localhost:8080/api/auth/admin/login",
        MANAGER: "http://localhost:8080/api/auth/manager/login",
        AGENT: "http://localhost:8080/api/auth/agent/login"
      };

      const body = { email, password };
      
      if (role === "ADMIN") {
        body.otp = otp;
      }

      let token = "";
      try {
        const response = await fetch(urlMap[role], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          token = data.token || "demo-mock-jwt-token";
        } else {
          const errorText = await response.text();
          let errorObj;
          try {
            errorObj = JSON.parse(errorText);
          } catch (e) {}
          throw new Error((errorObj && errorObj.message) || errorText || "Login failed. Please check credentials.");
        }
      } catch (fetchErr) {
        // ADMIN strictly fails if backend check fails
        if (role === "ADMIN") {
          throw fetchErr;
        }

        // MANAGER and AGENT can use the demo bypass token if the password is "123456" or backend connection fails
        if (password === "123456" || !fetchErr.message || (!fetchErr.message.includes("Invalid") && !fetchErr.message.includes("credentials"))) {
          console.warn("Backend connection failed or demo mode password used. Using Demo Mode token.", fetchErr);
          token = "demo-mock-jwt-token";
        } else {
          throw fetchErr;
        }
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);

      if (role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/leads");
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="brand-section">
          <div className="orbit-wrapper">
            <div className="planet"></div>
            <div className="ring"></div>
            <div className="satellite satellite-1"></div>
            <div className="satellite satellite-2"></div>
          </div>

          <h1 className="brand-title">
            Orbit <span className="title-glow">CRM</span>
          </h1>

          <p className="brand-subtitle">
            Real Estate Customer Relationship Management
          </p>

          <div className="tagline">
            <div>
              <div className="tag-icon-circle"><FaRocket /></div>
              <span>Manage Leads.</span>
            </div>

            <div>
              <div className="tag-icon-circle"><FaBullseye /></div>
              <span>Track Opportunities.</span>
            </div>

            <div>
              <div className="tag-icon-circle"><FaChartLine /></div>
              <span>Grow Revenue.</span>
            </div>
          </div>

          <p className="description">
            Streamline property inquiries, manage clients,
            automate follow-ups, and close more deals faster
            with Orbit CRM.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="login-card glass-panel-dark animate-scale-up">
          <h1>Welcome Back</h1>
          <p className="card-subtitle">Sign in to your Orbit CRM account</p>

          {errorMessage && (
            <div className="error-alert">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ROLE SELECTOR (TABS) */}
          <div className="form-group-custom">
            <label className="input-label-custom">Login Role</label>
            <div className="role-tabs">
              <button
                type="button"
                className={role === "ADMIN" ? "tab-btn active" : "tab-btn"}
                onClick={() => {
                  setRole("ADMIN");
                  setOtpSent(false);
                  setOtp("");
                  setErrorMessage("");
                }}
              >
                Admin
              </button>
              <button
                type="button"
                className={role === "MANAGER" ? "tab-btn active" : "tab-btn"}
                onClick={() => {
                  setRole("MANAGER");
                  setOtpSent(false);
                  setOtp("");
                  setErrorMessage("");
                }}
              >
                Manager
              </button>
              <button
                type="button"
                className={role === "AGENT" ? "tab-btn active" : "tab-btn"}
                onClick={() => {
                  setRole("AGENT");
                  setOtpSent(false);
                  setOtp("");
                  setErrorMessage("");
                }}
              >
                Agent
              </button>
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group-custom">
            <label className="input-label-custom">Email Address</label>
            <div className="input-box-custom">
              <MdEmail className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="form-group-custom">
            <label className="input-label-custom">Password</label>
            <div className="input-box-custom">
              <MdLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {(role === "MANAGER" || role === "AGENT") && (
              <div className="otp-hint-banner">
                <span>🔑 Demo Password: <strong>123456</strong> (Simulated)</span>
              </div>
            )}
          </div>

          {/* OTP SECTION FOR ADMIN */}
          {role === "ADMIN" && (
            <div className="form-group-custom">
              {!otpSent ? (
                <button
                  type="button"
                  className="send-otp-btn"
                  onClick={handleSendOtp}
                  disabled={loadingOtp}
                >
                  {loadingOtp ? "Sending OTP..." : "Get Verification Code"}
                </button>
              ) : (
                <>
                  <label className="input-label-custom">OTP Verification Code</label>
                  <div className="input-box-custom">
                    <FaUnlockAlt className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* OPTIONS */}
          <div className="options-row">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              <span className="checkbox-text">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* SIGN IN BUTTON */}
          {(role !== "ADMIN" || otpSent) && (
            <button className="primary-submit-btn" onClick={handleLogin}>
              Sign In
            </button>
          )}

          <div className="form-divider">
            <span>or</span>
          </div>

          {/* SIGNUP LINK */}
          <button className="secondary-submit-btn" onClick={() => navigate("/signuppage")}>
            Create Admin Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;