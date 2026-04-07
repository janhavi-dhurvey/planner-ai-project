import Chat from "../models/Chat.js";
import Goal from "../models/Goal.js";
import { askAI } from "../services/aiService.js";

/* =========================================
    FORMAT TIME
========================================= */
const formatTime = (date) => {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

/* =========================================
    DETECT PLANNER
========================================= */
const isPlannerRequest = (text) => {
  const t = text.toLowerCase();
  return ["plan", "planner", "schedule", "timeline", "study"].some(word => t.includes(word));
};

/* =========================================
    🔥 EXTRACT SUBJECTS (IMPROVED)
========================================= */
const extractSubjects = (message) => {
  const ignore = ["give", "me", "a", "planner", "for", "and", "plan", "my", "deadline", "is", "the", "study", "schedule"];
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w && !ignore.includes(w) && isNaN(w));
};

/* =========================================
    PROMPT (UPDATED FOR PROFESSIONAL TONE)
========================================= */
const buildPrompt = (message) => {
  const currentTime = formatTime(new Date());

  return [
    {
      role: "system",
      content: `
You are a Senior Academic Coach.
Current Time: ${currentTime}.

Rules:
1. Provide a professional, detailed study roadmap using bolding (**) and headers (###) for a ChatGPT-like look.
2. At the very end, provide a timeline in this EXACT format for today:
   [Subject] - [Time] - [Duration] minutes

Example Timeline:
DAA - 05:00 PM - 60 minutes
Break - 06:00 PM - 15 minutes

Ensure the timeline entries are on their own lines without any markdown symbols.
`
    },
    {
      role: "user",
      content: message
    }
  ];
};

/* =========================================
    GOAL EXTRACTION (FLEXIBLE RE-WRITE)
========================================= */
const extractGoals = (reply) => {
  try {
    const lines = reply.split("\n");
    const goals = [];

    lines.forEach(line => {
      // Flexible RegEx to catch: Subject - 05:00 PM - 60 minutes
      const match = line.match(/(.*?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\s*-\s*(\d+)\s*minutes/i);

      if (match) {
        const title = match[1].replace(/[*#]/g, "").trim(); // Clean title of markdown if any
        const time = match[2].trim().toUpperCase();
        const duration = parseInt(match[3]);

        if (title && time && !isNaN(duration)) {
          goals.push({
            title,
            time,
            duration,
            category: title.toLowerCase().includes("break") ? "☕" : "📘",
            color: title.toLowerCase().includes("break") ? "#FFD93D" : "#89CFF0"
          });
        }
      }
    });

    return goals;
  } catch (err) {
    console.error("Extraction error:", err.message);
    return [];
  }
};

/* =========================================
    CLEAN RESPONSE (FIXED: KEEPING FORMATTING)
========================================= */
const cleanReply = (reply) => {
  if (!reply || typeof reply !== "string") return "";
  // We NO LONGER remove * and # so the UI shows bold and headers correctly.
  return reply.replace(/```[\s\S]*?```/g, "").trim();
};

/* =========================================
    SEND MESSAGE (SERIAL WORKFLOW)
========================================= */
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message) return res.status(400).json({ error: "Message required" });

    // 1. Get AI Response
    const reply = await askAI(buildPrompt(message));
    const cleanedReply = cleanReply(reply);

    // 2. Extract Goals
    let goals = [];
    if (isPlannerRequest(message)) {
      goals = extractGoals(cleanedReply);
    }

    // 3. Save Chat History
    await Chat.create({
      userId,
      title: message.slice(0, 40),
      messages: [
        { role: "user", content: message },
        { role: "assistant", content: cleanedReply, structuredData: goals }
      ]
    });

    // 4. Update Database Goals (The "Sync" Step)
    if (goals.length > 0) {
      await Goal.deleteMany({ userId });

      const finalGoals = goals.map((g, index) => ({
        userId,
        ...g,
        status: "pending",
        order: index
      }));

      await Goal.insertMany(finalGoals);
      console.log(`✅ Saved ${goals.length} new goals for User ${userId}`);
    }

    return res.json({ reply: cleanedReply });

  } catch (err) {
    console.error("🔥 Chat Controller Error:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

/* =========================================
    GET CHATS / RESET
========================================= */
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(15);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch" });
  }
};

export const resetChat = async (req, res) => {
  res.json({ message: "Chat reset successful" });
};