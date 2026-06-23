import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import "./DashboardPage.css";

import AgentsService from "../../services/AgentsService";
import ContactService from "../../services/ContactService";
import LeadService from "../../services/leadService";
import ManagerService from "../../services/ManagerService";
import ReportService from "../../services/ReportService";

import {
  FaChartLine,
  FaDollarSign,
  FaPercentage,
  FaUsers,
  FaUserTie,
  FaAddressBook,
  FaFileAlt,
  FaAngleRight,
  FaCalendarAlt
} from "react-icons/fa";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";

const STATUS_LABELS = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  BOOKED: "Booked",
  LOST: "Lost",
};

const STATUS_CLASSES = {
  NEW: "badge-new",
  CONTACTED: "badge-contacted",
  INTERESTED: "badge-interested",
  BOOKED: "badge-booked",
  LOST: "badge-lost",
};

function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [managers, setManagers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          leadsData,
          managersData,
          agentsData,
          contactsData,
          reportsData
        ] = await Promise.all([
          LeadService.getAllLeads(),
          ManagerService.getAllManagers(),
          AgentsService.getAllAgents(),
          ContactService.getContacts(),
          ReportService.getReports()
        ]);

        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setManagers(Array.isArray(managersData) ? managersData : []);
        setAgents(Array.isArray(agentsData) ? agentsData : []);
        setContacts(Array.isArray(contactsData) ? contactsData : []);
        setReports(Array.isArray(reportsData) ? reportsData : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // KPI Calculations
  const totalLeads = leads.length;

  const activeDeals = leads.filter(
    (l) =>
      l.status === "NEW" ||
      l.status === "CONTACTED" ||
      l.status === "INTERESTED"
  ).length;

  const bookedCount = leads.filter((l) => l.status === "BOOKED").length;
  const revenueCr = (bookedCount * 0.5).toFixed(1);
  const conversionRate = totalLeads > 0 ? Math.round((bookedCount / totalLeads) * 100) : 0;

  // Pipeline Data
  const newCount = leads.filter((l) => l.status === "NEW").length;
  const contactedCount = leads.filter((l) => l.status === "CONTACTED").length;
  const interestedCount = leads.filter((l) => l.status === "INTERESTED").length;
  const lostCount = leads.filter((l) => l.status === "LOST").length;

  const pipelineData = [
    { stage: "New", deals: newCount || 0, color: "#4f46e5" },
    { stage: "Contacted", deals: contactedCount || 0, color: "#f59e0b" },
    { stage: "Interested", deals: interestedCount || 0, color: "#8b5cf6" },
    { stage: "Booked", deals: bookedCount || 0, color: "#10b981" },
    { stage: "Lost", deals: lostCount || 0, color: "#64748b" }
  ];

  const chartData = pipelineData.filter((item) => item.deals > 0);

  // Sorting Leads
  const sortedLeads = [...leads].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const recentLeadsList = sortedLeads.slice(0, 4);

  // Activity Feed
  const activities = sortedLeads.slice(0, 5).map((l) => {
    const name = l.name || "Unknown Lead";
    const dateStr = l.createdAt
      ? new Date(l.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "";

    let message = "";
    let statusClass = "act-new";
    if (l.status === "BOOKED") {
      message = `Closed deal successfully with ${name}`;
      statusClass = "act-booked";
    } else if (l.status === "LOST") {
      message = `Marked lead ${name} as Lost`;
      statusClass = "act-lost";
    } else if (l.status === "CONTACTED") {
      message = `Contacted lead ${name}`;
      statusClass = "act-contacted";
    } else if (l.status === "INTERESTED") {
      message = `Lead ${name} expressed interest in property`;
      statusClass = "act-interested";
    } else {
      message = `Added new lead ${name} to database`;
      statusClass = "act-new";
    }

    return { message, time: dateStr, statusClass };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-label">{payload[0].payload.stage}</p>
          <p className="tooltip-value">
            <span>Deals: </span><strong>{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header-section">
          <div>
            <h1 className="dashboard-main-title">Dashboard Overview</h1>
            <p className="dashboard-subtitle">Monitor leads, pipeline performance, and analytics.</p>
          </div>
          <div className="dashboard-date-badge">
            <FaCalendarAlt />
            <span>Today: {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading-shell">
            <div className="dashboard-spinner" />
            <p>Loading dashboard metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid-container">
              <div className="kpi-card-wrapper gradient-indigo">
                <div className="kpi-card-content">
                  <span className="kpi-label">Total Leads</span>
                  <h2 className="kpi-value">{totalLeads}</h2>
                  <span className="kpi-trend">All registered clients</span>
                </div>
                <div className="kpi-card-icon">
                  <FaUsers />
                </div>
              </div>

              <div className="kpi-card-wrapper">
                <div className="kpi-card-content">
                  <span className="kpi-label">Managers</span>
                  <h2 className="kpi-value">{managers.length}</h2>
                  <span className="kpi-trend">Supervising teams</span>
                </div>
                <div className="kpi-card-icon color-violet">
                  <FaUserTie />
                </div>
              </div>

              <div className="kpi-card-wrapper">
                <div className="kpi-card-content">
                  <span className="kpi-label">Agents</span>
                  <h2 className="kpi-value">{agents.length}</h2>
                  <span className="kpi-trend">Handling property inquiries</span>
                </div>
                <div className="kpi-card-icon color-blue">
                  <FaUsers />
                </div>
              </div>

              <div className="kpi-card-wrapper">
                <div className="kpi-card-content">
                  <span className="kpi-label">Contacts</span>
                  <h2 className="kpi-value">{contacts.length}</h2>
                  <span className="kpi-trend">Client directory list</span>
                </div>
                <div className="kpi-card-icon color-emerald">
                  <FaAddressBook />
                </div>
              </div>

              <div className="kpi-card-wrapper">
                <div className="kpi-card-content">
                  <span className="kpi-label">Active Deals</span>
                  <h2 className="kpi-value">{activeDeals}</h2>
                  <span className="kpi-trend">In pipeline progression</span>
                </div>
                <div className="kpi-card-icon color-amber">
                  <FaChartLine />
                </div>
              </div>

              <div className="kpi-card-wrapper">
                <div className="kpi-card-content">
                  <span className="kpi-label">Revenue Target</span>
                  <h2 className="kpi-value">₹{revenueCr} Cr</h2>
                  <span className="kpi-trend text-success">Based on conversions</span>
                </div>
                <div className="kpi-card-icon color-rose">
                  <FaDollarSign />
                </div>
              </div>

              <div className="kpi-card-wrapper">
                <div className="kpi-card-content">
                  <span className="kpi-label">Conversion Rate</span>
                  <h2 className="kpi-value">{conversionRate}%</h2>
                  <span className="kpi-trend">Leads booked ratio</span>
                </div>
                <div className="kpi-card-icon color-indigo">
                  <FaPercentage />
                </div>
              </div>

              <div className="kpi-card-wrapper">
                <div className="kpi-card-content">
                  <span className="kpi-label">Reports Generated</span>
                  <h2 className="kpi-value">{reports.length}</h2>
                  <span className="kpi-trend">Analytical summaries</span>
                </div>
                <div className="kpi-card-icon color-slate">
                  <FaFileAlt />
                </div>
              </div>
            </div>

            {/* CHART + ACTIVITY TIMELINE */}
            <div className="dashboard-charts-timeline">
              <div className="dashboard-card chart-card-wrapper">
                <div className="card-header-custom">
                  <h3>Sales Pipeline Distribution</h3>
                  <span className="card-header-badge">Real-time status</span>
                </div>

                {chartData.length === 0 ? (
                  <div className="dashboard-empty-panel">No pipeline data available. Add leads to view progress.</div>
                ) : (
                  <div className="responsive-chart-container">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                        <Bar dataKey="deals" radius={[6, 6, 0, 0]} maxBarSize={45}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="dashboard-card timeline-card-wrapper">
                <div className="card-header-custom">
                  <h3>Recent activity log</h3>
                </div>

                {activities.length === 0 ? (
                  <div className="dashboard-empty-panel">No recent events logged.</div>
                ) : (
                  <div className="timeline-items-feed">
                    {activities.map((item, index) => (
                      <div key={index} className="timeline-feed-item">
                        <div className={`timeline-indicator-dot ${item.statusClass}`}></div>
                        <div className="timeline-item-content">
                          <p className="timeline-item-text">{item.message}</p>
                          <span className="timeline-item-date">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RECENT LEADS TABLE */}
            <div className="dashboard-card table-card-wrapper">
              <div className="card-header-custom table-header-flex">
                <div>
                  <h3>Recently Added Leads</h3>
                  <p className="card-header-sub">Latest inquiries requiring agent action</p>
                </div>
                <a href="/leads" className="view-all-link-btn">
                  <span>View All Leads</span>
                  <FaAngleRight />
                </a>
              </div>

              {recentLeadsList.length === 0 ? (
                <div className="dashboard-empty-panel">No leads found in database.</div>
              ) : (
                <div className="dashboard-table-responsive">
                  <table className="dashboard-table-view">
                    <thead>
                      <tr>
                        <th>Lead Name</th>
                        <th>Acquisition Source</th>
                        <th>Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeadsList.map((lead, index) => (
                        <tr key={lead.id ?? index}>
                          <td className="font-semibold text-slate-800">
                            <div className="table-lead-identity">
                              <div className="table-lead-initials">
                                {lead.name?.charAt(0).toUpperCase()}
                              </div>
                              <span>{lead.name || "Unnamed Client"}</span>
                            </div>
                          </td>
                          <td className="text-slate-500 font-medium">{lead.source || "—"}</td>
                          <td>
                            <span className={`status-pill-badge ${STATUS_CLASSES[lead.status] || "badge-new"}`}>
                              {STATUS_LABELS[lead.status] || lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default DashboardPage;
