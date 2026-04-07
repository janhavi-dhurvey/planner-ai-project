import React, { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import "../../App.css";
import "./Goals.css";
import Navbar from "../../components/Navbar";
import GoalForm from "./GoalForm";
import GoalTimer from "./GoalTimer";
import ProductivityDashboard from "../../components/ProductivityDashboard";
import DeadlineSidebar from "./DeadlineSidebar"; 

// 🔥 CLEAN ASSET IMPORTS
import washitape from "../../assets/washitape-edge.png";
import starsBanner from "../../assets/doodle-stars-banner.png"; 
import flower from "../../assets/flower-doodle.png";

const Goals = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocalDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    try {
      const [time, period] = timeStr.split(" ");
      let [hour, minute] = time.split(":").map(Number);
      if (period === "AM" && hour === 12) hour = 24; 
      else if (period === "PM" && hour < 12) hour += 12;
      return hour * 60 + minute;
    } catch { return 0; }
  };

  const loadGoals = useCallback(async () => {
    try {
      const today = getLocalDate();
      const res = await API.get(`/goals?date=${today}`);
      let goalData = Array.isArray(res.data) ? res.data : [];
      goalData.sort((a, b) => (a.order ?? parseTime(a.time)) - (b.order ?? parseTime(b.time)));
      setGoals(goalData);
    } catch (err) {
      console.error("Goals loading error:", err);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
    window.addEventListener("focus", loadGoals);
    return () => window.removeEventListener("focus", loadGoals);
  }, [loadGoals]);

  const handleRestartTimeline = async () => {
    if (!window.confirm("This will clear today's plan. Continue?")) return;
    try {
      await API.delete(`/goals/daily?date=${getLocalDate()}`);
      await loadGoals();
    } catch { alert("Reset failed"); }
  };

  const handleAddGoal = async (newGoal) => {
    try {
      await API.post("/goals", { ...newGoal, date: getLocalDate() });
      await loadGoals();
      setIsFormOpen(false);
    } catch { alert("Failed to add goal"); }
  };

  const deleteGoal = async (goalId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this goal?")) return;
    try {
      await API.delete(`/goals/${goalId}`);
      await loadGoals();
    } catch { alert("Delete failed"); }
  };

  const formatDuration = (d) => {
    if (!d) return "";
    return d >= 60 ? `${Math.floor(d / 60)}h ${d % 60 || ""}`.trim() : `${d}m`;
  };

  return (
    <div className="goals-page aesthetic-bg">
      <Navbar />

      <div className="goals-container">
        
        {/* LEFT PANEL - DEADLINES */}
        <div className="left-panel">
          <div className="scrapbook-sidebar">
            <DeadlineSidebar />
            <img src={flower} alt="flower" className="sidebar-flower" />
          </div>
        </div>

        {/* RIGHT PANEL - CONTENT */}
        <div className={`right-panel ${!activeGoal && !isFormOpen ? "scroll-enabled" : ""}`}>
          
          {activeGoal ? (
            <GoalTimer goal={activeGoal} onBack={() => setActiveGoal(null)} />
          ) : isFormOpen ? (
            <div className="goal-form-wrapper">
              {/* 🔥 FIXED: Professional Back Button */}
              <button className="back-btn-aesthetic" onClick={() => setIsFormOpen(false)}> 
                ← Back to Planner 
              </button>
              <GoalForm onSave={handleAddGoal} onCancel={() => setIsFormOpen(false)} />
            </div>
          ) : (
            <div className="goals-content">
              <div className="dashboard-wrapper">
                <div className="dashboard-header-actions">
                  {goals.length > 0 && (
                    <button className="restart-btn" onClick={handleRestartTimeline}>
                      🔄 Restart Today
                    </button>
                  )}
                </div>

                <ProductivityDashboard goals={goals} />
                <img src={starsBanner} alt="stars" className="bg-stars-deco" />
              </div>

              {loading ? (
                <div className="empty-state">Loading your daily plan...</div>
              ) : goals.length === 0 ? (
                <div className="empty-state scrapbook-empty">
                  📭 No goals for today... <br />
                  <span>Use the Chatbot to doodle your schedule!</span>
                </div>
              ) : (
                <div className="timeline-grid">
                  {goals.map((goal) => (
                    <div 
                      key={goal._id} 
                      className="goal-paper-card"
                      style={{ borderLeft: `10px solid ${goal.color}` }}
                      onClick={() => setActiveGoal(goal)}
                    >
                      <img src={washitape} alt="tape" className="card-tape" />
                      
                      <div className="goal-card-body">
                        <div className="goal-icon-circle">{goal.category}</div>
                        
                        <div className="goal-info">
                          <span className="goal-tab-title">{goal.title}</span>
                          <span className="goal-tab-time">{goal.time} • {formatDuration(goal.duration)}</span>
                        </div>

                        <div className="goal-actions">
                          <button 
                            onClick={(e) => deleteGoal(goal._id, e)} 
                            className="delete-icon-btn"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button stays static outside scroll containers */}
      {!isFormOpen && !activeGoal && (
        <button className="add-goal-btn-floating" onClick={() => setIsFormOpen(true)}> + </button>
      )}
    </div>
  );
};

export default Goals;