import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import ContactService from "../../services/ContactService";
import AgentsService from "../../services/AgentsService";
import LeadService from "../../services/leadService";
import "./ContactsPage.css";

import {
  FaPlus,
  FaTrash,
  FaTimes,
  FaSearch,
  FaAddressBook,
  FaHistory,
  FaRocket
} from "react-icons/fa";

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const fetchContactsAndAgents = async () => {
    setLoading(true);
    try {
      const [contactsData, agentsData, leadsData] = await Promise.all([
        ContactService.getContacts(),
        AgentsService.getAllAgents(),
        LeadService.getAllLeads()
      ]);
      
      const loadedContacts = Array.isArray(contactsData) ? contactsData : [];
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      const loadedLeads = Array.isArray(leadsData) ? leadsData : [];

      // Hydrate contacts with localStorage extras
      const hydrated = loadedContacts.map(c => {
        const stored = localStorage.getItem(`contact_extra_${c.id}`);
        const extras = stored ? JSON.parse(stored) : {
          type: "BUYER",
          history: "New contact card created. No deal history recorded yet."
        };
        return { ...c, ...extras };
      });

      // Track emails of manual contacts to prevent showing duplicates
      const manualEmails = new Set(hydrated.map(c => c.email?.toLowerCase().trim()).filter(Boolean));

      // Map leads to virtual contacts
      const leadContacts = loadedLeads
        .filter(l => l.email && !manualEmails.has(l.email.toLowerCase().trim()))
        .map(l => {
          const stored = localStorage.getItem(`contact_extra_lead-${l.id}`);
          const extras = stored ? JSON.parse(stored) : {
            type: l.status === "BOOKED" ? "BUSINESS" : "BUYER",
            history: `Active Lead. Pipeline Status: ${l.status || "NEW"}. Source: ${l.source || "Unknown"}.${l.notes ? " Notes: " + l.notes : ""}`
          };
          return {
            id: `lead-${l.id}`,
            name: l.name,
            email: l.email,
            phone: l.phone,
            isLead: true,
            leadId: l.id,
            ...extras
          };
        });

      setContacts([...hydrated, ...leadContacts]);
    } catch (error) {
      console.error("Error fetching contacts page data:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactsAndAgents();
  }, []);

  const handleCreate = async (formData) => {
    const newContact = await ContactService.createContact({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });

    // Save extra fields in localStorage
    localStorage.setItem(`contact_extra_${newContact.id}`, JSON.stringify({
      type: formData.type || "BUYER",
      history: formData.history || "No deal history recorded yet."
    }));

    fetchContactsAndAgents();
  };

  const handleDelete = async () => {
    if (modal.contact.isLead) {
      await LeadService.deleteLead(modal.contact.leadId);
      localStorage.removeItem(`contact_extra_lead-${modal.contact.leadId}`);
    } else {
      await ContactService.deleteContact(modal.contact.id);
      localStorage.removeItem(`contact_extra_${modal.contact.id}`);
    }
    fetchContactsAndAgents();
  };

  const handleUpdateExtras = (contactId, updatedExtras) => {
    localStorage.setItem(`contact_extra_${contactId}`, JSON.stringify(updatedExtras));
    fetchContactsAndAgents();
  };

  const handlePromoteToLead = async (leadData) => {
    await LeadService.createLead(leadData);
    alert("Contact successfully promoted to Lead!");
    setModal(null);
    fetchContactsAndAgents();
  };

  const filtered = contacts.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.type?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <Layout>
      <div className="contacts-page-container">
        
        {/* Header */}
        <div className="contacts-header-flex">
          <div>
            <h1 className="contacts-main-title">Client Contacts</h1>
            <p className="contacts-subtitle">
              Permanent directory of buyers, sellers, and business clients.
            </p>
          </div>
          <button className="primary-submit-btn" style={{ width: "auto" }} onClick={() => setModal({ type: "add" })}>
            <FaPlus /> Add New Contact
          </button>
        </div>

        {/* Search */}
        <div className="contacts-utilities-bar glass-panel">
          <div className="search-box-bar">
            <FaSearch className="search-icon-svg" />
            <input
              type="text"
              placeholder="Search by name, email, phone or type (buyer/seller)..."
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
          <div className="contacts-loading-wrapper glass-panel">
            <div className="contacts-progress-spinner" />
            <p>Loading contacts directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="contacts-empty glass-panel animate-scale-up">
            <div className="empty-icon-wrapper"><FaAddressBook /></div>
            <h3>No Contacts Found</h3>
            <p>Start by adding contacts to your business directory.</p>
            {search && (
              <button className="secondary-submit-btn" style={{ width: "auto" }} onClick={() => setSearch("")}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="contacts-datagrid-box glass-panel">
            <div className="table-responsive-box">
              <table className="contacts-datagrid-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client Identity</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Deal & Communication History</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((contact, idx) => (
                    <tr key={contact.id ?? idx} className="datagrid-hover-row">
                      <td className="row-number-col">{idx + 1}</td>
                      <td>
                        <div className="client-identity-cell">
                          <div className="client-avatar-circle">
                            {contact.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="client-name-details">
                            <span className="client-name-text">{contact.name}</span>
                            <span className={`contact-type-badge ${contact.type?.toLowerCase() || "buyer"}`}>
                              {contact.type || "BUYER"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="contact-email-text">{contact.email || "—"}</td>
                      <td className="contact-phone-text">{contact.phone || "—"}</td>
                      <td className="contact-history-preview">
                        {contact.history ? (
                          contact.history.length > 50 
                            ? contact.history.substring(0, 50) + "..."
                            : contact.history
                        ) : "No deal history recorded."}
                      </td>
                      <td>
                        <div className="grid-action-buttons" style={{ justifyContent: "flex-end" }}>
                          <button
                            className="action-icon-btn view-color"
                            title="View/Edit History"
                            onClick={() => setModal({ type: "history", contact })}
                          >
                            <FaHistory />
                          </button>
                          {contact.isLead ? (
                            <button
                              className="action-icon-btn edit-color"
                              style={{ opacity: 0.4, cursor: "not-allowed" }}
                              title="Already an Active Lead"
                              disabled
                            >
                              <FaRocket />
                            </button>
                          ) : (
                            <button
                              className="action-icon-btn edit-color"
                              title="Promote to Active Lead"
                              onClick={() => setModal({ type: "promote", contact })}
                            >
                              <FaRocket />
                            </button>
                          )}
                          <button
                            className="action-icon-btn delete-color"
                            title="Delete contact"
                            onClick={() => setModal({ type: "delete", contact })}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "add" && (
        <ContactFormModal
          onClose={() => setModal(null)}
          onSave={handleCreate}
        />
      )}
      {modal?.type === "delete" && (
        <ContactDeleteConfirm
          contact={modal.contact}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
      {modal?.type === "history" && (
        <ContactHistoryModal
          contact={modal.contact}
          onClose={() => setModal(null)}
          onSaveExtras={(updated) => handleUpdateExtras(modal.contact.id, updated)}
        />
      )}
      {modal?.type === "promote" && (
        <PromoteLeadModal
          contact={modal.contact}
          agents={agents}
          onClose={() => setModal(null)}
          onPromote={handlePromoteToLead}
        />
      )}
    </Layout>
  );
}

// ─── CONTACT FORM MODAL ───────────────────────────────────────────────────────

function ContactFormModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "BUYER", history: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      alert("Error saving contact: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Contact Card</h2>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group-custom">
            <label className="input-label-custom">Client Name *</label>
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
              <label className="input-label-custom">Email Address</label>
              <div className="input-box-custom">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="client@email.com"
                />
              </div>
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

          <div className="form-group-custom">
            <label className="input-label-custom">Category / Type</label>
            <div className="input-box-custom select-wrapper">
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="BUYER">Active Buyer</option>
                <option value="SELLER">Active Seller</option>
                <option value="CLIENT">Business Client</option>
              </select>
            </div>
          </div>

          <div className="form-group-custom">
            <label className="input-label-custom">Client History Notes</label>
            <textarea
              name="history"
              value={form.history}
              onChange={handleChange}
              placeholder="e.g. Bought Property A last year and is now looking for Property B..."
              rows={4}
              className="modal-textarea"
              style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", width: "100%", outline: "none", color: "#334155" }}
            />
          </div>

          <div className="modal-actions-panel">
            <button type="button" className="secondary-submit-btn" style={{ width: "auto" }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-submit-btn" style={{ width: "auto" }} disabled={saving}>
              {saving ? "Adding contact..." : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── CONTACT DETAILS & HISTORY MODAL ──────────────────────────────────────────

function ContactHistoryModal({ contact, onClose, onSaveExtras }) {
  const [type, setType] = useState(contact.type || "BUYER");
  const [history, setHistory] = useState(contact.history || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      onSaveExtras({ type, history });
      onClose();
    } catch (err) {
      alert("Error saving history: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Client Profile & Deal History</h2>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="view-profile-header mb-4" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="view-avatar" style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "700" }}>
              {contact.name?.charAt(0).toUpperCase()}
            </div>
            <div className="view-identity">
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>{contact.name}</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>{contact.email || "No email added"}</p>
            </div>
          </div>

          <div className="form-group-custom">
            <label className="input-label-custom">Client Category / Type</label>
            <div className="input-box-custom select-wrapper">
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="BUYER">Active Buyer</option>
                <option value="SELLER">Active Seller</option>
                <option value="CLIENT">Business Client</option>
              </select>
            </div>
          </div>

          <div className="form-group-custom">
            <label className="input-label-custom">Permanent Deal & Communication History</label>
            <textarea
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="e.g. Bought Property A last year and is now looking for Property B..."
              rows={6}
              className="modal-textarea"
              style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", width: "100%", outline: "none", color: "#334155" }}
            />
          </div>

          <div className="modal-actions-panel">
            <button type="button" className="secondary-submit-btn" style={{ width: "auto" }} onClick={onClose}>
              Close
            </button>
            <button type="submit" className="primary-submit-btn" style={{ width: "auto" }} disabled={saving}>
              {saving ? "Saving history..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PROMOTE TO ACTIVE LEAD MODAL ─────────────────────────────────────────────

function PromoteLeadModal({ contact, agents, onClose, onPromote }) {
  const [form, setForm] = useState({
    source: "Website",
    priority: "MEDIUM",
    agentId: "",
    notes: contact.history || ""
  });
  const [promoting, setPromoting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPromoting(true);
    try {
      const payload = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        status: "NEW",
        source: form.source,
        priority: form.priority,
        notes: form.notes,
        agent: form.agentId ? { id: parseInt(form.agentId) } : null
      };
      await onPromote(payload);
    } catch (err) {
      alert("Error promoting contact to lead: " + err.message);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Promote Contact to Lead</h2>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="otp-hint-banner" style={{ background: "rgba(79, 70, 229, 0.08)", borderColor: "rgba(79, 70, 229, 0.2)", color: "#4f46e5", marginBottom: "16px" }}>
            <span>🚀 Converting <strong>{contact.name}</strong> into an active pipeline lead.</span>
          </div>

          <div className="form-row">
            <div className="form-group-custom">
              <label className="input-label-custom">Lead Source</label>
              <div className="input-box-custom select-wrapper">
                <select name="source" value={form.source} onChange={handleChange}>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group-custom">
              <label className="input-label-custom">Lead Priority</label>
              <div className="input-box-custom select-wrapper">
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group-custom">
            <label className="input-label-custom">Assign Handling Agent *</label>
            <div className="input-box-custom select-wrapper">
              <select name="agentId" value={form.agentId} onChange={handleChange} required>
                <option value="">Select Agent to Handle</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>{ag.name} ({ag.email || "No email"})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group-custom">
            <label className="input-label-custom">Notes / Lead Preference</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Currently looking for a property..."
              rows={4}
              className="modal-textarea"
              style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", width: "100%", outline: "none", color: "#334155" }}
            />
          </div>

          <div className="modal-actions-panel">
            <button type="button" className="secondary-submit-btn" style={{ width: "auto" }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-submit-btn" style={{ width: "auto", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }} disabled={promoting}>
              {promoting ? "Promoting..." : "Promote and Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── CONTACT DELETE CONFIRM ───────────────────────────────────────────────────

function ContactDeleteConfirm({ contact, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      alert("Error deleting contact: " + err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-box modal-confirm glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">🗑️</div>
        <h2>Remove Contact Card?</h2>
        <p>Are you sure you want to remove <strong>{contact.name}</strong> from your business contacts directory?</p>
        <div className="modal-actions-panel mt-6">
          <button className="secondary-submit-btn" style={{ width: "auto" }} onClick={onClose}>Cancel</button>
          <button className="btn-danger-submit" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Removing..." : "Yes, Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactsPage;
