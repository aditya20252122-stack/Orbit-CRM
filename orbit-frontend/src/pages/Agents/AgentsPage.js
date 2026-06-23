import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import agentsService from "../../services/AgentsService";
import ManagerService from "../../services/ManagerService";
import LeadService from "../../services/leadService";
import "./AgentsPage.css";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaTimes,
  FaSearch,
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt
} from "react-icons/fa";

function AgentsPage() {
  const [agentsList, setAgentsList] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const fetchAgentsAndManagers = async () => {
    setLoading(true);
    try {
      const userRoleCur = localStorage.getItem("userRole") || "ADMIN";
      const userEmailCur = localStorage.getItem("userEmail") || "";

      let agentsData = [];
      let managersData = [];
      let leadsData = [];

      if (userRoleCur === "MANAGER" && userEmailCur) {
        try {
          const managerProfile = await ManagerService.getManagerByEmail(userEmailCur.trim().toLowerCase());
          if (managerProfile && managerProfile.id) {
            const [mgrAgents, mgrLeads] = await Promise.all([
              agentsService.getAgentsByManager(managerProfile.id),
              LeadService.getLeadsByManager(managerProfile.id)
            ]);
            agentsData = mgrAgents;
            leadsData = mgrLeads;
            managersData = [managerProfile];
          }
        } catch (err) {
          console.error("Error loading manager's agents:", err);
        }
      } else {
        const [allAgents, allManagers, allLeads] = await Promise.all([
          agentsService.getAllAgents(),
          ManagerService.getAllManagers(),
          LeadService.getAllLeads()
        ]);
        agentsData = allAgents;
        managersData = allManagers;
        leadsData = allLeads;
      }

      const mappedAgents = (Array.isArray(agentsData) ? agentsData : []).map(agent => ({
        ...agent,
        leads: (Array.isArray(leadsData) ? leadsData : []).filter(lead => lead.agent?.id === agent.id)
      }));

      setAgentsList(mappedAgents);
      setManagers(Array.isArray(managersData) ? managersData : []);
    } catch (error) {
      console.error("Error fetching agents page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentsAndManagers();
  }, []);

  const handleCreate = async (formData) => {
    await agentsService.createAgent(formData);
    fetchAgentsAndManagers();
  };

  const handleUpdate = async (formData) => {
    await agentsService.updateAgent(modal.agent.id, formData);
    fetchAgentsAndManagers();
  };

  const handleDelete = async () => {
    await agentsService.deleteAgent(modal.agent.id);
    fetchAgentsAndManagers();
  };

  const filtered = agentsList.filter((a) => {
    const matchSearch =
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone?.includes(search) ||
      a.manager?.name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const totalAgents = agentsList.length;
  const activeAgents = agentsList.filter((a) => a.status !== false).length;
  const inactiveAgents = totalAgents - activeAgents;

  return (
    <Layout>
      <div className="agents-page-container">
        
        {/* Header */}
        <div className="agents-header-flex">
          <div>
            <h1 className="agents-main-title">Agents Directory</h1>
            <p className="agents-subtitle">
              Manage your real estate agents, reporting lines, and status.
            </p>
          </div>
          <button className="primary-submit-btn" style={{ width: "auto" }} onClick={() => setModal({ type: "add" })}>
            <FaPlus /> Add New Agent
          </button>
        </div>

        {/* Stats */}
        <div className="agents-stats-bar">
          <div className="agents-stat-card glass-panel">
            <span className="stat-card-lbl">Total Agents</span>
            <h3>{totalAgents}</h3>
          </div>
          <div className="agents-stat-card glass-panel">
            <span className="stat-card-lbl">Active Agents</span>
            <h3 className="text-success">{activeAgents}</h3>
          </div>
          <div className="agents-stat-card glass-panel">
            <span className="stat-card-lbl">Inactive Agents</span>
            <h3 className="text-danger">{inactiveAgents}</h3>
          </div>
        </div>

        {/* Search */}
        <div className="agents-utilities-bar glass-panel">
          <div className="search-box-bar">
            <FaSearch className="search-icon-svg" />
            <input
              type="text"
              placeholder="Search by agent name, email, phone or manager..."
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
          <div className="agents-loading-wrapper glass-panel">
            <div className="agents-progress-spinner" />
            <p>Loading agent directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="agents-empty glass-panel animate-scale-up">
            <div className="empty-icon-wrapper"><FaUser /></div>
            <h3>No Agents Found</h3>
            <p>Get started by adding agents to your organization.</p>
            {search && (
              <button className="secondary-submit-btn" style={{ width: "auto" }} onClick={() => setSearch("")}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="agents-grid-layout">
            {filtered.map((agent) => (
              <div key={agent.id} className="agent-card glass-panel animate-scale-up">
                <div className="agent-card-header">
                  <div className="agent-avatar-circle">
                    {agent.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="agent-card-info">
                    <h4>{agent.name || "Unnamed Agent"}</h4>
                    <span className={`agent-status-badge ${agent.status !== false ? "active" : "inactive"}`}>
                      {agent.status !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="agent-card-body border-t border-b border-slate-100 py-3 my-3">
                  <div className="agent-detail-row">
                    <FaEnvelope className="detail-row-icon" />
                    <span className="detail-row-val">{agent.email || "No email added"}</span>
                  </div>
                  <div className="agent-detail-row">
                    <FaPhoneAlt className="detail-row-icon" />
                    <span className="detail-row-val">{agent.phone || "No phone added"}</span>
                  </div>
                  <div className="agent-detail-row">
                    <FaUserTie className="detail-row-icon" />
                    <span className="detail-row-val">
                      Reports to: <strong>{agent.manager?.name || "Unassigned"}</strong>
                    </span>
                  </div>
                  <div className="agent-detail-row">
                    <FaBuilding className="detail-row-icon" />
                    <span className="detail-row-val">
                      Assigned Leads: <strong>{agent.leads?.length || 0}</strong>
                    </span>
                  </div>
                </div>

                <div className="agent-card-footer">
                  <button className="agent-action-btn edit-color" onClick={() => setModal({ type: "edit", agent })}>
                    <FaEdit /> Edit
                  </button>
                  <button className="agent-action-btn delete-color" onClick={() => setModal({ type: "delete", agent })}>
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
        <AgentFormModal
          agent={modal.agent}
          managers={managers}
          onClose={() => setModal(null)}
          onSave={modal.type === "add" ? handleCreate : handleUpdate}
        />
      )}
      {modal?.type === "delete" && (
        <AgentDeleteConfirm
          agent={modal.agent}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
    </Layout>
  );
}

// ─── AGENT FORM MODAL ─────────────────────────────────────────────────────────

function AgentFormModal({ agent, managers, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    status: true, managerId: ""
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(agent?.id);

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name || "",
        email: agent.email || "",
        password: "", // don't populate password
        phone: agent.phone || "",
        status: agent.status !== false,
        managerId: agent.manager?.id || ""
      });
    }
  }, [agent]);

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
        password: form.password,
        status: form.status,
        manager: form.managerId ? { id: parseInt(form.managerId) } : null
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      alert("Error saving agent: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Agent File" : "Register New Agent"}</h2>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group-custom">
            <label className="input-label-custom">Agent Name *</label>
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
                  placeholder="agent@orbit.com"
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
              <label className="input-label-custom">Reporting Manager</label>
              <div className="input-box-custom select-wrapper">
                <select name="managerId" value={form.managerId} onChange={handleChange}>
                  <option value="">Select Manager</option>
                  {managers.map((mg) => (
                    <option key={mg.id} value={mg.id}>{mg.name}</option>
                  ))}
                </select>
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
              {saving ? "Saving agent..." : isEdit ? "Update File" : "Register Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── AGENT DELETE CONFIRM ─────────────────────────────────────────────────────

function AgentDeleteConfirm({ agent, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      alert("Error deleting agent: " + err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box modal-confirm glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">🗑️</div>
        <h2>Remove Agent from Directory?</h2>
        <p>Are you sure you want to remove <strong>{agent.name}</strong>? All their client histories will need to be reassigned.</p>
        <div className="modal-actions-panel mt-6">
          <button className="secondary-submit-btn" style={{ width: "auto" }} onClick={onClose}>Cancel</button>
          <button className="btn-danger-submit" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting file..." : "Yes, Remove Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentsPage;
