import React, { useState } from "react";
import "./GoalForm.css";

const GoalForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState("📘");
  const [color, setColor] = useState("#89CFF0");
  const [period, setPeriod] = useState("AM");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = ["📘", "✏️", "🎧", "💻", "🎯", "🏃‍♀️", "🔍"];
  const colors = [
    "#C5B4E3", "#FF6B6B", "#FFD93D",
    "#F6C177", "#A8E063", "#9ECae1", "#8E7DBE"
  ];

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${period}`;
  };

  const handleSave = async () => {
    if (saving) return;
    if (!title.trim()) return setError("Enter a goal title");
    if (!startTime) return setError("Select start time");
    if (duration <= 0) return setError("Invalid duration");

    try {
      setSaving(true);
      await onSave({
        title: title.trim(),
        time: formatTime(startTime),
        duration: Number(duration),
        category,
        color
      });
      setTitle("");
      setStartTime("");
      setDuration(60);
      setPeriod("AM");
      setError("");
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="goal-form-compact fade-in">
      {error && <p className="goal-error">{error}</p>}

      <div className="goal-input-group">
        <label>Goal Title</label>
        <input
          type="text"
          placeholder="Example: Study DSA"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Row for Time and Duration to save vertical space */}
      <div className="goal-form-row">
        <div className="goal-input-group flex-1">
          <label>Start Time</label>
          <div className="time-input-wrapper">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            {/* AM/PM Styled Toggle */}
            <div className="period-toggle">
              <button 
                type="button"
                className={period === "AM" ? "active" : ""} 
                onClick={() => setPeriod("AM")}
              >AM</button>
              <button 
                type="button"
                className={period === "PM" ? "active" : ""} 
                onClick={() => setPeriod("PM")}
              >PM</button>
            </div>
          </div>
        </div>

        <div className="goal-input-group flex-small">
          <label>Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      <div className="goal-input-group">
        <label>Category</label>
        <div className="category-icons-compact">
          {categories.map((c) => (
            <span
              key={c}
              onClick={() => setCategory(c)}
              className={category === c ? "active-icon" : ""}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="goal-input-group">
        <label>Color</label>
        <div className="color-options-compact">
          {colors.map((clr) => (
            <div
              key={clr}
              className={`color-circle ${color === clr ? "active-color" : ""}`}
              style={{ background: clr }}
              onClick={() => setColor(clr)}
            />
          ))}
        </div>
      </div>

      <div className="goal-form-actions">
        <button className="goal-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Goal"}
        </button>
        <button className="goal-cancel" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GoalForm;