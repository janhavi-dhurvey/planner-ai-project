import React from "react";

const ProductivityDashboard = ({ goals = [] }) => {

  /* =========================================
      SAFE GOALS ARRAY
  ========================================= */

  const safeGoals = Array.isArray(goals) ? goals : [];

  /* =========================================
      BREAK DETECTION
  ========================================= */

  const isBreak = (goal) => {
    const title = (goal?.title || "").toLowerCase();
    return title.includes("break");
  };

  /* =========================================
      TOTAL MINUTES
  ========================================= */

  const totalMinutes = safeGoals.reduce(
    (sum, g) => sum + (Number(g?.duration) || 0),
    0
  );

  /* =========================================
      STUDY MINUTES
  ========================================= */

  const studyMinutes = safeGoals
    .filter(g => !isBreak(g))
    .reduce((sum, g) => sum + (Number(g?.duration) || 0), 0);

  /* =========================================
      BREAK MINUTES
  ========================================= */

  const breakMinutes = safeGoals
    .filter(g => isBreak(g))
    .reduce((sum, g) => sum + (Number(g?.duration) || 0), 0);

  /* =========================================
      BREAK COUNT
  ========================================= */

  const breakCount = safeGoals.filter(g => isBreak(g)).length;

  /* =========================================
      PRODUCTIVITY SCORE
  ========================================= */

  const productivityScore =
    totalMinutes > 0
      ? Math.min(Math.round((studyMinutes / totalMinutes) * 100), 100)
      : 0;

  /* =========================================
      COMPLETED GOALS
  ========================================= */

  const completedGoals = safeGoals.filter(
    g => g?.status === "completed"
  ).length;

  const completionRate =
    safeGoals.length > 0
      ? Math.round((completedGoals / safeGoals.length) * 100)
      : 0;

  /* =========================================
      AVERAGE SESSION
  ========================================= */

  const avgSession =
    safeGoals.length > 0
      ? Math.round(totalMinutes / safeGoals.length)
      : 0;

  /* =========================================
      FORMAT TIME
  ========================================= */

  const formatTime = (minutes) => {
    const m = Number(minutes) || 0;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (m === 0) return "0m";
    if (h === 0) return `${rem}m`;
    if (rem === 0) return `${h}h`;
    return `${h}h ${rem}m`;
  };

  /* =========================================
      DASHBOARD UI
  ========================================= */

  return (
    <div style={dashboardStyle}>
      <h2 style={titleStyle}>
        📊 Productivity Dashboard
      </h2>

      <div style={gridStyle}>
        <DashboardCard title="Study Time" value={formatTime(studyMinutes)} />
        <DashboardCard title="Break Time" value={formatTime(breakMinutes)} />
        <DashboardCard title="Break Sessions" value={breakCount} />
        <DashboardCard title="Productivity" value={`${productivityScore}%`} />
        <DashboardCard title="Goal Completion" value={`${completionRate}%`} />
        <DashboardCard title="Total Tasks" value={safeGoals.length} />
        <DashboardCard title="Avg Session" value={formatTime(avgSession)} />
      </div>
    </div>
  );
};

/* =========================================
    DASHBOARD CARD
========================================= */

const DashboardCard = ({ title, value }) => {
  return (
    <div style={cardStyle}>
      <h4 style={cardTitleStyle}>{title}</h4>
      <p style={valueStyle}>{value}</p>
    </div>
  );
};

/* =========================================
    STRICT PROFESSIONAL STYLES
========================================= */

const dashboardStyle = {
  background: "rgba(255, 255, 255, 0.2)", 
  backdropFilter: "blur(12px)",
  padding: "30px 25px", 
  borderRadius: "35px",
  marginTop: "10px", // Strict gap for the new professional Restart button
  marginBottom: "30px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
  width: "100%",
  boxSizing: "border-box"
};

const titleStyle = {
  marginBottom: "25px",
  fontSize: "22px",
  fontWeight: "900",
  color: "#2d3436",
  textAlign: "center",
  letterSpacing: "-0.5px"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: "15px"
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.95)", // High contrast white cards
  borderRadius: "20px",
  padding: "18px 10px",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
  border: "1px solid #ffffff"
};

const cardTitleStyle = {
  marginBottom: "6px",
  fontSize: "10px",
  color: "#636e72",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const valueStyle = {
  fontSize: "20px",
  fontWeight: "900",
  color: "#1e272e"
};

export default ProductivityDashboard;