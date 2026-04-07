import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Home.css"; 

/**
 * RELATIVE PATH FIX:
 * ../ moves from 'home' to 'pages'
 * ../../ moves from 'pages' to 'src'
 */
import skyImg from "../../assets/sky-bg.jpg";
import gridImg from "../../assets/grid-paper.png";
import tornImg from "../../assets/torn-edge.png";

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ goals: 0, chats: 0, completed: 0 });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.name || "User";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadStats = async () => {
    try {
      const goalsRes = await API.get("/goals");
      const chatsRes = await API.get("/chat"); 
      const goals = goalsRes.data || [];
      const completed = goals.filter(g => g.status === "completed").length;

      setStats({
        goals: goals.length,
        chats: chatsRes.data?.length || 0,
        completed
      });
    } catch (err) {
      console.log("Stats error", err);
    }
  };

  const progress = stats.goals === 0 ? 0 : Math.round((stats.completed / stats.goals) * 100);

  return (
    <div style={pageWrapper}>
      {/* SECTION 1: HERO */}
      <header style={{...heroSection, backgroundImage: `url(${skyImg})`}}>
        <div style={navLinks}>
          <span style={clickableNav} onClick={() => navigate("/chatbot")}>CHATBOT</span>
          <span style={clickableNav} onClick={() => navigate("/goals")}>GOALS</span>
          <span style={logoText}>AI.PLANNER</span>
          <span style={clickableNav} onClick={() => navigate("/calendar")}>CALENDAR</span>
          <span style={{...clickableNav, color: "#D66853"}} onClick={handleLogout}>LOGOUT</span>
        </div>

        <div className="hero-content-mobile" style={heroContent}>
          <div className="photo-frame-animate" style={photoFrame}>
             <div style={photoCircle}>{initial}</div>
          </div>
          <div className="hero-text-container-mobile" style={heroTextContainer}>
            <h1 className="indie-title-mobile" style={indieTitle}>Productivity <br/> For The Focused.</h1>
            <p style={heroSub}>Transform your academic journey with AI-optimized timelines and smart goal tracking.</p>
            <button className="connect-btn-animate" style={connectBtn} onClick={() => navigate("/chatbot")}>LET'S PLAN ➔</button>
          </div>
        </div>
      </header>

      <div style={{...tornDivider, backgroundImage: `url(${tornImg})`}}></div>

      <section style={{...statsSection, backgroundImage: `url(${gridImg})`}}>
        <h2 style={handwrittenHeading}>My Progress...</h2>
        <div style={statsGrid}>
          <StatTapeCard title="GOALS" value={stats.goals} label="Active Tasks" />
          <StatTapeCard title="FINISHED" value={stats.completed} label="Success Rate" />
          <StatTapeCard title="CHATS" value={stats.chats} label="AI Sessions" />
        </div>
        
        <div style={rulerContainer}>
            <div style={rulerLabels}>
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
            </div>
            <div style={rulerBase}>
                <div className="ruler-fill-style" style={{...rulerFill, width: `${progress}%`}}></div>
            </div>
            <p style={progressText}>{progress}% Efficiency Achieved Today</p>
        </div>
      </section>

      <section style={linksSection}>
        <div style={introBox}>
            <h2 style={{...handwrittenHeading, color: "#5A6D56", textShadow: "none"}}>I'm {name}.</h2>
            <p style={bioText}>
                Your personal digital academic architect. Whether you're tackling DSA, Python, or Web Dev, 
                I'm here to ensure every hour of your study session counts.
            </p>
        </div>

        <div style={actionGrid}>
            <div className="sticky-note-hover" style={{...stickyNote, background: "#FEFAE0"}} onClick={() => navigate("/chatbot")}>
                <h3 style={stickyTitle}>🤖 CHAT</h3>
                <p style={stickyDesc}>Get AI Guidance</p>
            </div>
            <div className="sticky-note-hover" style={{...stickyNote, background: "#F1FAEE", transform: "rotate(2deg)"}} onClick={() => navigate("/goals")}>
                <h3 style={stickyTitle}>🎯 GOALS</h3>
                <p style={stickyDesc}>Manage Tasks</p>
            </div>
            <div className="sticky-note-hover" style={{...stickyNote, background: "#E9EDC9", transform: "rotate(-1deg)"}} onClick={() => navigate("/calendar")}>
                <h3 style={stickyTitle}>📅 PLAN</h3>
                <p style={stickyDesc}>View Timeline</p>
            </div>
        </div>
      </section>

      <footer style={footerStyle}>
         <p>© 2026 {name} Planner • Digital Scrapbook Edition</p>
      </footer>
    </div>
  );
};

const StatTapeCard = ({ title, value, label }) => (
  <div style={statCardBase}>
    <div style={washiTape}></div>
    <h4 style={statCardTitle}>{title}</h4>
    <div style={statValue}>{value}</div>
    <p style={statLabel}>{label}</p>
  </div>
);

const pageWrapper = { minHeight: "100vh", background: "#FDFBF7", fontFamily: "'Inter', sans-serif", color: "#4A4A4A", overflowX: "hidden" };
const heroSection = { backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", padding: "40px 10% 120px 10%", textAlign: "center", position: "relative" };
const navLinks = { display: "flex", justifyContent: "center", alignItems: "center", gap: "30px", fontSize: "11px", fontWeight: "800", letterSpacing: "2px", marginBottom: "60px", color: "#5A6D56" };
const clickableNav = { cursor: "pointer", transition: "0.2s opacity" };
const logoText = { fontSize: "20px", margin: "0 40px", color: "#222", fontWeight: "900", letterSpacing: "1px" };
const heroContent = { display: "flex", alignItems: "center", justifyContent: "center", gap: "60px", flexWrap: "wrap" };
const photoFrame = { width: "260px", height: "260px", background: "white", padding: "12px", borderRadius: "50%", boxShadow: "0 15px 35px rgba(0,0,0,0.1)", border: "6px solid #A3B18A" };
const photoCircle = { width: "100%", height: "100%", borderRadius: "50%", background: "#6B705C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "90px", color: "white", fontWeight: "900" };
const heroTextContainer = { textAlign: "left", maxWidth: "480px" };
const indieTitle = { fontFamily: "'Indie Flower', cursive", fontSize: "55px", lineHeight: "0.95", color: "#5A6D56", marginBottom: "20px" };
const heroSub = { fontSize: "15px", marginBottom: "35px", lineHeight: "1.7", opacity: 0.7, fontWeight: "500" };
const connectBtn = { padding: "16px 40px", background: "#D66853", color: "white", border: "none", borderRadius: "8px", fontWeight: "900", fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0px #7E3123", letterSpacing: "1px" };
const tornDivider = { height: "100px", width: "100%", backgroundRepeat: "repeat-x", backgroundPosition: "bottom", backgroundSize: "contain", marginTop: "-50px", zIndex: "10", position: "relative" };
const statsSection = { backgroundColor: `#E87489`, backgroundRepeat: "repeat", padding: "100px 10%", textAlign: "center" };
const handwrittenHeading = { fontFamily: "'Indie Flower', cursive", fontSize: "42px", color: "white", marginBottom: "50px", textShadow: "2px 2px 0px rgba(0,0,0,0.1)" };
const statsGrid = { display: "flex", justifyContent: "center", gap: "35px", flexWrap: "wrap", marginBottom: "70px" };
const statCardBase = { background: "white", width: "200px", padding: "35px 20px", borderRadius: "12px", position: "relative", boxShadow: "0 12px 25px rgba(0,0,0,0.08)" };
const washiTape = { position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%) rotate(-1deg)", width: "90px", height: "25px", background: "rgba(163, 177, 138, 0.7)", border: "1px dashed rgba(255,255,255,0.4)" };
const statCardTitle = { fontSize: "10px", letterSpacing: "3px", color: "#D66853", fontWeight: "900", borderBottom: "1px solid #EEE", paddingBottom: "12px", marginBottom: "20px" };
const statValue = { fontSize: "55px", fontWeight: "900", color: "#333", lineHeight: "1" };
const statLabel = { fontSize: "10px", fontWeight: "800", opacity: 0.4, marginTop: "10px", textTransform: "uppercase" };
const rulerContainer = { maxWidth: "750px", margin: "0 auto", background: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" };
const rulerLabels = { display: "flex", justifyContent: "space-between", padding: "0 12px", fontSize: "11px", fontWeight: "900", color: "#CCC", marginBottom: "8px" };
const rulerBase = { height: "45px", background: "#F8F8F8", borderRadius: "8px", overflow: "hidden", border: "2px solid #EEE" };
const rulerFill = { height: "100%", background: "repeating-linear-gradient(45deg, #A3B18A, #A3B18A 10px, #92A075 10px, #92A075 20px)", transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)" };
const progressText = { marginTop: "18px", fontSize: "14px", fontWeight: "800", color: "#5A6D56", letterSpacing: "0.5px" };
const linksSection = { padding: "120px 10%", display: "flex", alignItems: "center", justifyContent: "center", gap: "80px", flexWrap: "wrap" };
const introBox = { maxWidth: "380px" };
const bioText = { fontSize: "17px", lineHeight: "1.9", color: "#666", fontWeight: "400" };
const actionGrid = { display: "flex", gap: "25px" };
const stickyNote = { width: "150px", height: "150px", padding: "25px", boxShadow: "8px 8px 0px rgba(0,0,0,0.03)", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" };
const stickyTitle = { fontSize: "16px", fontWeight: "900", marginBottom: "8px", letterSpacing: "1px" };
const stickyDesc = { fontSize: "11px", fontWeight: "600", opacity: 0.6 };
const footerStyle = { padding: "60px", textAlign: "center", fontSize: "11px", opacity: 0.4, fontWeight: "700", letterSpacing: "1px", borderTop: "1px solid #F0F0F0" };

export default Home;