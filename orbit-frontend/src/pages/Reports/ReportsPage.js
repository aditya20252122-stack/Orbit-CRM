import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import reportService from "../../services/ReportService";
import agentsService from "../../services/AgentsService";
import LeadService from "../../services/leadService";
import "./ReportsPage.css";

import {
  FaFileAlt,
  FaUserTie,
  FaListAlt
} from "react-icons/fa";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const CHART_COLORS = ["#6366f1", "#f59e0b", "#8b5cf6", "#10b981", "#64748b"];

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

function ReportsPage() {
  const [generalReports, setGeneralReports] = useState([]);
  const [statusReport, setStatusReport] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [agentLeads, setAgentLeads] = useState([]);
  
  // New workload & target metrics states
  const [agentWorkloads, setAgentWorkloads] = useState([]);
  const [conversionRate, setConversionRate] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const [monthlyTarget] = useState(10); // Monthly closed target of 10 booked leads

  const [loading, setLoading] = useState(true);
  const [loadingAgentReport, setLoadingAgentReport] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsData, statusData, agentsData, leadsData] = await Promise.all([
        reportService.getReports(),
        reportService.getLeadsByStatus(),
        agentsService.getAllAgents(),
        LeadService.getAllLeads()
      ]);

      setGeneralReports(Array.isArray(reportsData) ? reportsData : []);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      
      let bookedLeadsCount = 0;
      let totalLeadsCount = Array.isArray(leadsData) ? leadsData.length : 0;

      // Transform statusData (Map) to array for PieChart
      if (statusData && typeof statusData === "object") {
        const chartData = Object.entries(statusData).map(([status, count]) => {
          if (status === "BOOKED") bookedLeadsCount = count;
          return {
            name: STATUS_LABELS[status] || status,
            value: count
          };
        });
        setStatusReport(chartData);
        setBookedCount(bookedLeadsCount);
      } else {
        setStatusReport([]);
      }

      // Calculate conversion rate dynamically
      if (totalLeadsCount > 0) {
        setConversionRate(((bookedLeadsCount / totalLeadsCount) * 100).toFixed(1));
      } else {
        setConversionRate(0);
      }

      // Group leads by agent name to calculate workloads
      if (Array.isArray(leadsData) && Array.isArray(agentsData)) {
        const workloadMap = {};
        agentsData.forEach(a => {
          workloadMap[a.name] = 0;
        });

        leadsData.forEach(lead => {
          if (lead.agent && lead.agent.name) {
            workloadMap[lead.agent.name] = (workloadMap[lead.agent.name] || 0) + 1;
          }
        });

        const workloadChartData = Object.entries(workloadMap).map(([name, count]) => ({
          name,
          workload: count
        }));
        setAgentWorkloads(workloadChartData);
      }
    } catch (error) {
      console.error("Error fetching reports page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAgentChange = async (e) => {
    const agentId = e.target.value;
    setSelectedAgentId(agentId);
    if (!agentId) {
      setAgentLeads([]);
      return;
    }
    
    setLoadingAgentReport(true);
    try {
      const data = await reportService.getAgentReport(agentId);
      setAgentLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching agent report:", err);
      setAgentLeads([]);
    } finally {
      setLoadingAgentReport(false);
    }
  };

  return (
    <Layout>
      <div className="reports-page-container">
        
        {/* Header */}
        <div className="reports-header-flex">
          <div>
            <h1 className="reports-main-title">Analytics & Reports</h1>
            <p className="reports-subtitle">
              Interactive sales metrics, conversion rates, and agent portfolios.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="reports-loading-wrapper glass-panel">
            <div className="reports-progress-spinner" />
            <p>Compiling analytics summaries...</p>
          </div>
        ) : (
          <>
            {/* General Summaries */}
            <div className="reports-summary-cards">
              {generalReports.map((report, idx) => {
                let colorClass = "indigo-card";
                if (idx === 1) colorClass = "emerald-card";
                if (idx === 2) colorClass = "amber-card";
                
                return (
                  <div key={idx} className={`summary-report-card glass-panel ${colorClass}`}>
                    <div className="report-card-icon"><FaFileAlt /></div>
                    <div className="report-card-content">
                      <span className="report-name">{report.reportName}</span>
                      <h3 className="report-count">{report.count}</h3>
                      <p className="report-desc">{report.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Middle Section: PieChart + BarChart (Side by Side on Desktop) */}
            <div className="reports-charts-grid">
              
              {/* Leads by Status */}
              <div className="reports-card chart-card glass-panel">
                <div className="card-header-custom">
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700" }}>Leads by Status</h3>
                  <p className="card-sub-lbl">Compare active inquiries against closed bookings</p>
                </div>

                {statusReport.length === 0 ? (
                  <div className="reports-empty-panel">No pipeline data available.</div>
                ) : (
                  <div className="chart-wrapper-flex" style={{ marginTop: "16px" }}>
                    <div className="pie-chart-responsive">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={statusReport}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {statusReport.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pie-chart-legend">
                      {statusReport.map((item, idx) => (
                        <div key={idx} className="legend-item">
                          <span className="legend-color-dot" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
                          <span className="legend-label">{item.name}</span>
                          <span className="legend-count">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leads by Agent Workload */}
              <div className="reports-card chart-card glass-panel">
                <div className="card-header-custom">
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700" }}>Leads by Agent (Workload)</h3>
                  <p className="card-sub-lbl">Active inquiry distribution comparison across agents</p>
                </div>

                {agentWorkloads.length === 0 ? (
                  <div className="reports-empty-panel">No agent workload data available.</div>
                ) : (
                  <div style={{ width: "100%", height: 240, marginTop: "20px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={agentWorkloads}
                        margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: "rgba(79, 70, 229, 0.04)" }}
                          contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.8rem" }}
                        />
                        <Bar dataKey="workload" name="Assigned Inquiries" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>

            {/* Target Conversion Performance Tracker */}
            <div className="reports-card glass-panel mb-6" style={{ background: "linear-gradient(to right, #ffffff, #faf5ff)", padding: "24px" }}>
              <div className="card-header-custom">
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700" }}>Conversion Target Performance</h3>
                <p className="card-sub-lbl">Track team booked sales against active monthly target goals</p>
              </div>
              
              <div className="target-tracker-flex" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px", alignItems: "center", marginTop: "20px" }}>
                <div className="conversion-stats-box" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#1e3a8a" }}>Conversion Rate</span>
                    <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1d4ed8", margin: "4px 0" }}>{conversionRate}%</h2>
                    <p style={{ fontSize: "0.72rem", color: "#1e40af", margin: 0 }}>Percentage of pipeline leads successfully Booked.</p>
                  </div>

                  <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#065f46" }}>Monthly closed target</span>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#047857", margin: "4px 0" }}>{bookedCount} / {monthlyTarget} Booked</h2>
                    <p style={{ fontSize: "0.72rem", color: "#065f46", margin: 0 }}>Target closed sales: {monthlyTarget} per calendar month.</p>
                  </div>
                </div>

                <div className="progress-details-box">
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#334155", marginBottom: "8px", marginTop: 0 }}>Target Progress Bar</h4>
                  <div className="progress-bar-bg" style={{ width: "100%", height: "24px", background: "#f1f5f9", borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min((bookedCount / monthlyTarget) * 100, 100)}%`, height: "100%", background: "linear-gradient(to right, #4f46e5, #10b981)", transition: "width 1s ease-out", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "10px" }}>
                      {bookedCount > 0 && <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#fff" }}>{Math.round((bookedCount / monthlyTarget) * 100)}%</span>}
                    </div>
                  </div>
                  
                  <div className="target-analysis-msg" style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.6)", border: "1px solid #e2e8f0" }}>
                    {bookedCount >= monthlyTarget ? (
                      <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#047857" }}>🎉 Congratulations! The CRM team has met and exceeded the active monthly sales closed target!</span>
                    ) : (
                      <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#b45309" }}>💼 Team Performance: The team is currently at {Math.round((bookedCount / monthlyTarget) * 100)}% of the monthly closed sales target ({bookedCount} out of {monthlyTarget} Booked). Reassign leads or direct agents to close active inquiries.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Specific Performance List */}
            <div className="reports-card agent-report-card glass-panel mt-6">
              <div className="card-header-custom flex-header-between">
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700" }}>Agent Lead Assignment Report</h3>
                  <p className="card-sub-lbl">Filter CRM files by assigned agent portfolio</p>
                </div>
                <div className="input-box-custom select-wrapper" style={{ width: "240px" }}>
                  <select value={selectedAgentId} onChange={handleAgentChange}>
                    <option value="">Select Agent to Filter</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>{ag.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedAgentId ? (
                <div className="reports-empty-panel select-agent-hint">
                  <FaUserTie className="hint-icon" />
                  <p>Please select an agent from the dropdown to load their portfolio.</p>
                </div>
              ) : loadingAgentReport ? (
                <div className="reports-loading-wrapper" style={{ border: "none", background: "none" }}>
                  <div className="reports-progress-spinner" />
                  <p>Loading agent portfolio report...</p>
                </div>
              ) : agentLeads.length === 0 ? (
                <div className="reports-empty-panel select-agent-hint">
                  <FaListAlt className="hint-icon" />
                  <p>No leads assigned to this agent.</p>
                </div>
              ) : (
                <div className="table-responsive-box mt-4">
                  <table className="leads-datagrid-table">
                    <thead>
                      <tr>
                        <th>Lead Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Acquisition Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentLeads.map((lead, index) => (
                        <tr key={lead.id ?? index} className="datagrid-hover-row">
                          <td className="font-semibold text-slate-800">{lead.name}</td>
                          <td className="text-slate-500 font-medium">{lead.email}</td>
                          <td className="text-slate-500 font-medium">{lead.phone || "—"}</td>
                          <td>
                            <span className={`status-pill-badge ${STATUS_CLASSES[lead.status] || "badge-new"}`}>
                              {STATUS_LABELS[lead.status] || lead.status}
                            </span>
                          </td>
                          <td className="text-slate-400 font-medium">{lead.source || "—"}</td>
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

export default ReportsPage;
