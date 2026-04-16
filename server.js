import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import juice from "juice";
import nodemailer from "nodemailer";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const subscribersFile = path.join(__dirname, "subscribers.json");
let subscribers = [];

function createMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass || !process.env.FROM_EMAIL) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

const mailTransporter = createMailTransporter();

async function loadSubscribers() {
  try {
    const data = await fs.promises.readFile(subscribersFile, "utf8");
    subscribers = JSON.parse(data || "[]");
  } catch (error) {
    if (error.code === "ENOENT") {
      subscribers = [];
      await fs.promises.writeFile(subscribersFile, JSON.stringify(subscribers, null, 2));
    } else {
      console.error("Unable to load subscribers:", error);
      subscribers = [];
    }
  }
}

async function saveSubscribers() {
  await fs.promises.writeFile(subscribersFile, JSON.stringify(subscribers, null, 2));
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

await loadSubscribers();

app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

const SYSTEM_PROMPT = `
You are generating content for the CEO Advantage newsletter.

Audience:
Senior executives, business leaders, and decision-makers.

Task:
Read the podcast transcript below and generate structured newsletter content for a branded HTML email.

Requirements:
- Tone must be professional, executive-focused, concise, and insightful.
- Avoid fluff or overly casual language.
- Summaries should be practical and action-oriented.
- Extract the strongest quote from the speaker if possible.
- If no exact quote is suitable, generate a concise "quote of the week" based on the main theme.
- If the transcript is vague, poor quality, placeholder, or lacks meaningful business content, still produce a professional output by inferring a sensible executive theme from the overall tone and language.
- Keep each field concise and usable in an email newsletter.
- Return ONLY valid JSON.

Return this exact structure:
{
  "episode_number": "42",
  "episode_title": "",
  "guest_name": "",
  "executive_brief": "",
  "insight_1_title": "",
  "insight_1_body": "",
  "insight_2_title": "",
  "insight_2_body": "",
  "insight_3_title": "",
  "insight_3_body": "",
  "quote_of_the_week": "",
  "takeaway_1": "",
  "takeaway_2": "",
  "takeaway_3": "",
  "takeaway_4": "",
  "personalised_topic": "Leadership Strategy",
  "personalised_insight": "",
  "listen_url": "#",
  "read_more_url": "#",
  "share_url": "#"
}
`;

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Failed to parse AI response as JSON.");
  }
}

app.post("/generate-newsletter", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const userPrompt = `Transcript:\n${transcript}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ]
    });

    const rawText = completion.choices[0]?.message?.content || "";
    const newsletterData = safeJsonParse(rawText);

    res.json(newsletterData);
  } catch (error) {
    console.error("Newsletter generation error:", error);
    res.status(500).json({
      error: "Failed to generate newsletter.",
      details: error.message
    });
  }
});

app.get("/api/subscribers", (req, res) => {
  res.json(subscribers);
});

app.post("/api/subscribers", async (req, res) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();
    const trimmedName = (name || "").trim();

    if (!trimmedName || !normalizedEmail) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (subscribers.some((subscriber) => subscriber.email === normalizedEmail)) {
      return res.status(409).json({ error: "Subscriber already exists." });
    }

    const subscriber = { name: trimmedName, email: normalizedEmail };
    subscribers.push(subscriber);
    await saveSubscribers();

    res.status(201).json(subscriber);
  } catch (error) {
    console.error("Add subscriber error:", error);
    res.status(500).json({ error: "Failed to add subscriber." });
  }
});

app.delete("/api/subscribers", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const index = subscribers.findIndex((subscriber) => subscriber.email === normalizedEmail);
    if (index === -1) {
      return res.status(404).json({ error: "Subscriber not found." });
    }

    subscribers.splice(index, 1);
    await saveSubscribers();

    res.json({ success: true });
  } catch (error) {
    console.error("Remove subscriber error:", error);
    res.status(500).json({ error: "Failed to remove subscriber." });
  }
});

app.post("/send-newsletter", async (req, res) => {
  try {
    const { subject, html, text } = req.body;

    if (!subject || !subject.trim() || !html || !html.trim()) {
      return res.status(400).json({ error: "Subject and newsletter content are required." });
    }

    if (!subscribers.length) {
      return res.status(400).json({ error: "No subscribers available to send the newsletter." });
    }

    if (!mailTransporter) {
      return res.status(500).json({
        error:
          "Email sending is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and FROM_EMAIL in .env."
      });
    }

    const from = process.env.FROM_EMAIL;
    const bodyText = text && text.trim() ? text : stripHtml(html);

    // Inline CSS for better email client compatibility
    const cssPath = path.join(__dirname, "public", "style.css");
    const css = fs.readFileSync(cssPath, "utf8");
    const fullHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`;
    const inlinedHtml = juice(fullHtml);

    const results = await Promise.all(
      subscribers.map(async (subscriber) => {
        try {
          await mailTransporter.sendMail({
            from,
            to: subscriber.email,
            subject,
            html: inlinedHtml,
            text: bodyText
          });
          return { email: subscriber.email, status: "sent" };
        } catch (error) {
          return { email: subscriber.email, status: "failed", error: error.message };
        }
      })
    );

    const delivered = results.filter((item) => item.status === "sent").length;
    const failed = results.filter((item) => item.status === "failed").length;
    const success = failed === 0;

    res.json({
      success,
      delivered,
      failed,
      results,
      message: success
        ? `Newsletter sent to ${delivered} subscriber(s).`
        : failed === subscribers.length
        ? "Newsletter delivery failed for all subscribers."
        : `Newsletter delivered to ${delivered} subscriber(s), failed for ${failed}.`
    });
  } catch (error) {
    console.error("Send newsletter error:", error);
    res.status(500).json({ error: "Failed to distribute newsletter.", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});