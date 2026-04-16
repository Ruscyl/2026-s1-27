import express from "express";
import dotenv from "dotenv";
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});