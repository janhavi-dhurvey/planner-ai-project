import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import "./Goals.css";

const GoalTimer = ({ goal, onBack }) => {
  const totalGoalSeconds = (goal?.duration || 60) * 60;
  const [seconds, setSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    setSeconds(0);
    setBreakSeconds(0);
    setIsRunning(false);
    setIsBreakMode(false);
  }, [goal]);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      if (isBreakMode) {
        setBreakSeconds(prev => prev + 1);
      } else {
        setSeconds(prev => {
          const next = prev + 1;
          if (next >= totalGoalSeconds) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleGoalCompletion();
            alert("🎉 Goal completed!");
            return totalGoalSeconds;
          }
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning, isBreakMode, totalGoalSeconds]);

  const handleGoalCompletion = async () => {
    try {
      if (goal?._id) {
        await API.put(`/goals/${goal._id}`, {
          ...goal,
          status: "completed"
        });
      }
    } catch {}
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const remainingSeconds = Math.max(totalGoalSeconds - seconds, 0);
  const progress = totalGoalSeconds > 0 ? Math.min((seconds / totalGoalSeconds) * 100, 100) : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const startTimer = () => {
    if (isRunning && !isBreakMode) return;
    setIsBreakMode(false);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const startBreak = () => {
    setIsBreakMode(true);
    setIsRunning(true);
  };

  const resetTimer = () => {
    if(!window.confirm("Reset all progress for this session?")) return;
    clearInterval(timerRef.current);
    setSeconds(0);
    setBreakSeconds(0);
    setIsRunning(false);
    setIsBreakMode(false);
  };

  return (
    <div className="timer-container fade-in">
      {/* Professional Back Button */}
      <button className="back-btn-aesthetic" onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px' }}>
        ← Back to Planner
      </button>

      <h2 className="timer-goal-title">{goal?.title}</h2>

      {/* Progress Circle Section */}
      <div className="timer-circle-box">
        <svg width="220" height="220">
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke={goal?.color || "#fab1a0"}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>

        {/* Big Countdown Display */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -40%)' }}>
           <h1 className="timer-display">{formatTime(seconds)}</h1>
           <p style={{ fontSize: '12px', fontWeight: '800', color: '#636e72', textTransform: 'uppercase' }}>
             {isBreakMode ? "☕ On Break" : "✍️ Focusing"}
           </p>
        </div>
      </div>

      {/* Stats and Time Info */}
      <div className="timer-stats-grid">
        <div>
          <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Remaining</span>
          <span style={{ fontSize: '18px', fontWeight: '800' }}>{formatTime(remainingSeconds)}</span>
        </div>
        <div style={{ width: '1px', background: '#ddd' }}></div>
        <div>
          <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Breaks</span>
          <span style={{ fontSize: '18px', fontWeight: '800' }}>{formatTime(breakSeconds)}</span>
        </div>
      </div>

      {/* Professional Action Buttons */}
      <div className="timer-actions-row">
        {!isRunning || isBreakMode ? (
          <button className="timer-btn timer-btn-primary" onClick={startTimer}>▶ Resume Focus</button>
        ) : (
          <button className="timer-btn timer-btn-secondary" onClick={pauseTimer}>⏸ Pause</button>
        )}
        
        <button className="timer-btn timer-btn-secondary" onClick={startBreak}>☕ Take Break</button>
        <button className="timer-btn timer-btn-secondary" onClick={resetTimer}>🔄 Reset</button>
        <button className="timer-btn timer-btn-danger" onClick={onBack}>⏹ Terminate</button>
      </div>
    </div>
  );
};

export default GoalTimer;