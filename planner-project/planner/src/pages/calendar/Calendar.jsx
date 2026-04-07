import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import SelectedDateView from "./SelectedDateView";
import "./Calendar.css";

const Calendar = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================
      LOCAL DATE INITIALIZATION (IST FIX)
  ========================================= */
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  /* =========================================
      HELPER: LATE NIGHT SORTING LOGIC
  ========================================= */
  const parseTimeForSort = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    try {
      const cleanedTime = timeStr.trim().toUpperCase();
      const parts = cleanedTime.split(" ");
      if (parts.length < 2) return 0;

      const [time, period] = parts;
      let [hour, minute] = time.split(":").map(Number);
      
      if (isNaN(hour)) hour = 0;
      if (isNaN(minute)) minute = 0;

      if (period === "AM" && hour === 12) {
        hour = 24; 
      } else if (period === "PM" && hour < 12) {
        hour += 12;
      }
      
      return hour * 60 + minute;
    } catch (err) {
      return 0;
    }
  };

  /* =========================================
      LOAD GOALS (FETCH BY DATE)
  ========================================= */
  const loadGoals = useCallback(async (date) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/goals?date=${date}`);
      
      const rawData = res?.data?.goals || res?.data || [];
      const data = Array.isArray(rawData) ? rawData : [];

      const sorted = [...data].sort((a, b) => {
        if (a?.order !== undefined && b?.order !== undefined) {
          return a.order - b.order;
        }
        return parseTimeForSort(a?.time) - parseTimeForSort(b?.time);
      });

      setGoals(sorted);
    } catch (err) {
      console.error("Calendar load error:", err);
      setError("Failed to load planner for this date.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals(selectedDate);
  }, [selectedDate, loadGoals]);

  return (
    <div className="calendar-page-wrapper">
      <Navbar />

      <div className="calendar-content-centerer">
        <div className="calendar-main-box fade-in">
          
          <div className="calendar-header">
            <h2 className="calendar-title">📅 AI Timeline Planner</h2>
            
            <p style={{ marginBottom: "15px", opacity: 0.8, fontWeight: "700", fontSize: "14px", color: "#2d3436" }}>
              Select a Date to View Plan
            </p>

            {/* DATE SELECTOR PILL */}
            <div className="date-picker-wrapper">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* TIMELINE VIEW CONTAINER */}
          <div className="timeline-scroll-area">
            <SelectedDateView 
              goals={goals || []} 
              loading={loading} 
              error={error} 
              selectedDate={selectedDate} 
            />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Calendar;