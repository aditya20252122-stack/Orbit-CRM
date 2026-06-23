import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import ManagerService from "../../services/ManagerService";
import agentsService from "../../services/AgentsService";
import "./ManagerPage.css";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaTimes,
  FaSearch,
  FaPhoneAlt,
  FaEnvelope,
  FaSitemap
} from "react-icons/fa";

function ManagerPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const [managersData, agentsData] = await Promise.all([
        ManagerService.getAllManagers(),
        agentsService.getAllAgents()
      ]);
      const mapped = (Array.isArray(managersData) ? managersData : []).map(mgr => ({
        ...mgr,
        agents: (Array.isArray(agentsData) ? agentsData : []).filter(a => a.manager?.id === mgr.id)
      }));
      setManagers(mapped);
    } catch (error) {
      console.error("Error fetching managers list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleCreate = async (formData) => {
    await ManagerService.createManager(formData);
    fetchManagers();
  };

  const handleUpdate = async (formData) => {
    await ManagerService.updateManager(modal.manager.id, formData);
    fetchManagers();
  };

  const handleDelete = async () => {
    await ManagerService.deleteManager(modal.manager.id);
    fetchManagers();
  };

  const filtered = managers.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search);
    return matchSearch;
  });

  const totalManagers = managers.length;
  const activeManagers = managers.filter((m) => m.status !== false).length;
  const inactiveManagers = totalManagers - activeManagers;

  return (
    <Layout>
      <div className="managers-page-container">
        
        {/* Header */}
        <div className="managers-header-flex">
          <div>
            <h1 className="managers-main-title">Managers Directory</h1>
            <p className="managers-subtitle">
              Manage your real estate managers, department leads, and login statuses.
            </p>
          </div>
          <button className="primary-submit-btn" style={{ width: "auto" }} onClick={() => setModal({ type: "add" })}>
            <FaPlus /> Add New Manager
          </button>
        </div>

        {/* Stats */}
        <div className="managers-stats-bar">
          <div className="managers-stat-card glass-panel">
            <span className="stat-card-lbl">Total Managers</span>
            <h3>{totalManagers}</h3>
          </div>
          <div className="managers-stat-card glass-panel">
            <span className="stat-card-lbl">Active Managers</span>
            <h3 className="text-success">{activeManagers}</h3>
          </div>
          <div className="managers-stat-card glass-panel">
            <span className="stat-card-lbl">Inactive Managers</span>
            <h3 className="text-danger">{inactiveManagers}</h3>
          </div>
        </div>

        {/* Search */}
        <div className="managers-utilities-bar glass-panel">
          <div className="search-box-bar">
            <FaSearch className="search-icon-svg" />
            <input
              type="text"
              placeholder="Search by manager name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch("")}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="managers-loading-wrapper glass-panel">
            <div className="managers-progress-spinner" />
            <p>Loading managers directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="managers-empty glass-panel animate-scale-up">
            <div className="empty-icon-wrapper"><FaUser /></div>
            <h3>No Managers Found</h3>
            <p>Get started by adding team managers.</p>
            {search && (
              <button className="secondary-submit-btn" style={{ width: "auto" }} onClick={() => setSearch("")}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="managers-grid-layout">
            {filtered.map((manager) => (
              <div key={manager.id} className="manager-card glass-panel animate-scale-up">
                <div className="manager-card-header">
                  <div className="manager-avatar-circle">
                    {manager.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="manager-card-info">
                    <h4>{manager.name || "Unnamed Manager"}</h4>
                    <span className={`manager-status-badge ${manager.status !== false ? "active" : "inactive"}`}>
                      {manager.status !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="manager-card-body border-t border-b border-slate-100 py-3 my-3">
                  <div className="manager-detail-row">
                    <FaEnvelope className="detail-row-icon" />
                    <span className="detail-row-val">{manager.email || "No email added"}</span>
                  </div>
                  <div className="manager-detail-row">
                    <FaPhoneAlt className="detail-row-icon" />
                    <span className="detail-row-val">{manager.phone || "No phone added"}</span>
                  </div>
                  <div className="manager-detail-row">
                    <span className="detail-row-icon">📍</span>
                    <span className="detail-row-val">Area: <strong>{manager.area || "Unassigned"}</strong></span>
                  </div>
                  <div className="manager-detail-row">
                    <FaSitemap className="detail-row-icon" />
                    <span className="detail-row-val">
                      Team size: <strong>{manager.agents?.length || 0} agents</strong>
                    </span>
                  </div>
                </div>

                <div className="manager-card-footer">
                  <button className="manager-action-btn edit-color" onClick={() => setModal({ type: "edit", manager })}>
                    <FaEdit /> Edit
                  </button>
                  <button className="manager-action-btn delete-color" onClick={() => setModal({ type: "delete", manager })}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <ManagerFormModal
          manager={modal.manager}
          onClose={() => setModal(null)}
          onSave={modal.type === "add" ? handleCreate : handleUpdate}
        />
      )}
      {modal?.type === "delete" && (
        <ManagerDeleteConfirm
          manager={modal.manager}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
    </Layout>
  );
}

// ─── MANAGER FORM MODAL ───────────────────────────────────────────────────────

function ManagerFormModal({ manager, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", area: "", status: true
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(manager?.id);

  useEffect(() => {
    if (manager) {
      setForm({
        name: manager.name || "",
        email: manager.email || "",
        password: "", // don't populate password
        phone: manager.phone || "",
        area: manager.area || "",
        status: manager.status !== false
      });
    }
  }, [manager]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!isEdit && !form.password.trim()) e.password = "Password is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckboxChange = (e) => {
    setForm((prev) => ({ ...prev, status: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        area: form.area,
        status: form.status
      };
      if (form.password) {
        payload.password = form.password;
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      alert("Error saving manager: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Manager File" : "Register New Manager"}</h2>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group-custom">
            <label className="input-label-custom">Manager Name *</label>
            <div className="input-box-custom">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group-custom">
              <label className="input-label-custom">Email Address *</label>
              <div className="input-box-custom">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="manager@orbit.com"
                />
              </div>
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="form-group-custom">
              <label className="input-label-custom">Phone Number</label>
              <div className="input-box-custom">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-custom">
              <label className="input-label-custom">Account Password {isEdit && "(Optional)"}</label>
              <div className="input-box-custom">
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={isEdit ? "Leave blank to keep same" : "Account password"}
                />
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            <div className="form-group-custom">
              <label className="input-label-custom">Operational Area / Location</label>
              <div className="input-box-custom">
                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. Pune, Mumbai, Nashik"
                />
              </div>
            </div>
          </div>

          <div className="options-row">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={form.status}
                onChange={handleCheckboxChange}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text" style={{ color: "#334155" }}>Active status / Enable log in</span>
            </label>
          </div>

          <div className="modal-actions-panel">
            <button type="button" className="secondary-submit-btn" style={{ width: "auto" }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-submit-btn" style={{ width: "auto" }} disabled={saving}>
              {saving ? "Saving manager..." : isEdit ? "Update File" : "Register Manager"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MANAGER DELETE CONFIRM ───────────────────────────────────────────────────

function ManagerDeleteConfirm({ manager, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      alert("Error deleting manager: " + err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box modal-confirm glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">🗑️</div>
        <h2>Remove Manager?</h2>
        <p>Are you sure you want to remove manager <strong>{manager.name}</strong>? Reporting agents will need to report to a new manager.</p>
        <div className="modal-actions-panel mt-6">
          <button className="secondary-submit-btn" style={{ width: "auto" }} onClick={onClose}>Cancel</button>
          <button className="btn-danger-submit" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting file..." : "Yes, Remove Manager"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerPage;
