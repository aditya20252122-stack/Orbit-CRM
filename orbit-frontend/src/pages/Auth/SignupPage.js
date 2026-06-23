import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

import {
  FaRocket,
  FaBullseye,
  FaChartLine,
  FaUser,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

import {
  MdEmail,
  MdLock,
  MdPhone
} from "react-icons/md";

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role: "ADMIN",
          status: true
        })
      });

      if (!response.ok) {
        throw new Error("Registration failed. The email address may already be in use.");
      }

      alert("Account registered successfully! Redirecting you to login...");
      navigate("/loginpage");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* LEFT PANEL */}
      <div className="signup-left-panel">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="signup-brand-section">
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
      <div className="signup-right-panel">
        <div className="signup-card glass-panel-dark animate-scale-up">
          <h1>Create Account</h1>
          <p className="card-subtitle">Register a new Admin account to get started</p>

          {errorMessage && (
            <div className="error-alert">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* NAME */}
          <div className="form-group-custom">
            <label className="input-label-custom">Full Name</label>
            <div className="input-box-custom">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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

          {/* PHONE */}
          <div className="form-group-custom">
            <label className="input-label-custom">Phone Number</label>
            <div className="input-box-custom">
              <MdPhone className="input-icon" />
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            className="primary-submit-btn"
            onClick={handleSignup}
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <div className="form-divider">
            <span>or</span>
          </div>

          {/* BACK TO LOGIN */}
          <button
            className="secondary-submit-btn"
            onClick={() => navigate("/loginpage")}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
