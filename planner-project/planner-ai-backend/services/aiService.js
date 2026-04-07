import axios from "axios";

/* =========================================
    CONFIG
========================================= */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.AI_MODEL || "openai/gpt-4o-mini";

/* =========================================
    AXIOS CLIENT
========================================= */

const aiClient = axios.create({
  baseURL: OPENROUTER_URL,
  timeout: 60000
});

/* =========================================
    RETRY CONFIG
========================================= */

const MAX_RETRIES = 2;

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================
    🔥 PROFESSIONAL SYSTEM PROMPT (DETAILED ROADMAP)
========================================= */

const systemPrompt = {
  role: "system",
  content: `
You are a Senior Academic Success Coach and Professional Productivity Planner.

Your goal is to provide a comprehensive, high-level study roadmap followed by a specific daily timeline.

STRUCTURE YOUR RESPONSE EXACTLY LIKE THIS:

1. 🎯 OVERALL STRATEGY: Provide a professional breakdown of how to split time between the subjects requested (e.g., "Focus 50% on DSA, 25% on Java...").
2. 📅 PHASE-WISE ROADMAP: If the user mentions a deadline, break the journey into 3 phases (Basics, Core, Advanced) with specific topics.
3. 🔥 PRO TIPS: Give 2-3 professional study tips or recommended platforms (like LeetCode or IndiaBix).
4. 📆 TODAY'S OPTIMIZED TIMELINE: This part is mandatory for the app to function.

⚠️ CRITICAL TIMELINE RULES:
- Format: [Subject] - [Time] - [Duration] minutes
- Start from the current time provided.
- Include 15-minute breaks after 60-minute blocks.
- ONLY use the subjects requested by the user.

Example Timeline:
DSA - 05:00 PM - 60 minutes
Break - 06:00 PM - 15 minutes
Java - 06:15 PM - 60 minutes

Use emojis and professional formatting. Keep it highly organized.
`
};

/* =========================================
    FALLBACK (UNCHANGED)
========================================= */

const fallbackPlanner = () => {
  const now = new Date();
  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

  let current = new Date(now);

  const make = (title, duration) => {
    const time = formatTime(current);
    current.setMinutes(current.getMinutes() + duration);
    return `${title} - ${time} - ${duration} minutes`;
  };

  return `
📅 Daily Planner (Fallback Mode)

Focus on consistency. Since the AI is currently unreachable, follow this structure:

Timeline:
${make("Primary Study", 60)}
${make("Break", 15)}
${make("Secondary Study", 60)}
${make("Break", 15)}
${make("Revision", 45)}
`;
};

/* =========================================
    ASK AI FUNCTION
========================================= */

export const askAI = async (messages) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY missing");
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array required");
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    const currentDate = now.toDateString();

    const timePrompt = {
      role: "system",
      content: `Current time is ${currentTime} on ${currentDate}. Focus STRICTLY on the subjects requested in the user's last message. Provide the professional roadmap first, then the timeline.`
    };

    /* ✅ FINAL MESSAGE STACK */
    const safeMessages = [
      systemPrompt,
      timePrompt,
      ...messages.slice(-5)
    ];

    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🧠 AI Request (Attempt ${attempt + 1})`);

        const response = await aiClient.post(
          "",
          {
            model: DEFAULT_MODEL,
            messages: safeMessages,
            temperature: 0.7, // Increased to 0.7 for more "ChatGPT-like" professional advice
            max_tokens: 1500  // Increased to handle the longer professional response
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
              "X-Title": "AI Planner Pro"
            }
          }
        );

        const aiReply =
          response?.data?.choices?.[0]?.message?.content ||
          response?.data?.choices?.[0]?.text ||
          null;

        if (!aiReply || typeof aiReply !== "string") {
          throw new Error("Invalid AI response");
        }

        console.log("✅ AI SUCCESS");
        return aiReply.trim();

      } catch (err) {
        lastError = err;
        console.error(`❌ Attempt ${attempt + 1} failed`);
        if (err.response) {
          console.error("API ERROR:", err.response.data);
        } else {
          console.error("ERROR:", err.message);
        }

        if (attempt < MAX_RETRIES) {
          await delay(1000);
        }
      }
    }

    throw lastError;

  } catch (error) {
    console.error("🔥 FINAL AI ERROR:", error.message);
    return fallbackPlanner();
  }
};