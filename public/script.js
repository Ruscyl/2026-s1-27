const transcriptInput = document.getElementById("transcriptInput");
const generateBtn = document.getElementById("generateBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const statusMessage = document.getElementById("statusMessage");
const newsletterPreview = document.getElementById("newsletterPreview");

const sampleTranscript = `Welcome to CEO Advantage. In today’s episode, we discuss why executive teams struggle to scale decision-making as organisations grow. Our guest is Sarah Mitchell, a leadership strategist and former COO with over twenty years of experience helping mid-market and enterprise leaders build resilient operating models.

Sarah explains that many leadership teams mistake activity for alignment. She argues that when organisations scale, the core challenge is not adding more meetings, but improving decision clarity, accountability, and role ownership. She shares that executives often create complexity by allowing too many decisions to escalate to the top.

One of the strongest points in the episode is that leadership discipline matters more than leadership charisma. Sarah says, "If every decision needs the CEO, you do not have a leadership team — you have a dependency model."

The conversation also explores how executive leaders can reduce friction by documenting decision rights, simplifying communication rhythms, and focusing on the handful of metrics that actually drive outcomes. Sarah recommends that leaders audit recurring meetings, identify where bottlenecks appear, and redesign governance around speed and accountability rather than tradition.

Finally, the episode closes with a discussion about building trust in senior teams. Sarah notes that trust is built when leaders consistently make clear decisions, communicate trade-offs, and reinforce shared priorities across the organisation.`;

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderNewsletter(data) {
  return `
    <div class="email-wrapper">
      <div class="email-container">
        <div class="email-header">
          <div class="brand">CEO Advantage</div>
          <h1>${escapeHtml(data.episode_title || "Executive Insights Newsletter")}</h1>
        </div>

        <div class="email-subheader">
          <div class="badge">Episode ${escapeHtml(data.episode_number || "42")}</div>
          <div class="episode-meta">
            <span><strong>Guest:</strong> ${escapeHtml(data.guest_name || "Featured Executive Guest")}</span>
            <span><strong>Series:</strong> CEO Advantage Podcast</span>
          </div>
          <div class="executive-brief">
            ${escapeHtml(data.executive_brief || "No executive brief available.")}
          </div>
        </div>

        <div class="section">
          <h2>Top Executive Insights</h2>

          <div class="insight-card">
            <h3>${escapeHtml(data.insight_1_title || "Insight 1")}</h3>
            <p>${escapeHtml(data.insight_1_body || "")}</p>
          </div>

          <div class="insight-card">
            <h3>${escapeHtml(data.insight_2_title || "Insight 2")}</h3>
            <p>${escapeHtml(data.insight_2_body || "")}</p>
          </div>

          <div class="insight-card">
            <h3>${escapeHtml(data.insight_3_title || "Insight 3")}</h3>
            <p>${escapeHtml(data.insight_3_body || "")}</p>
          </div>
        </div>

        <div class="section">
          <h2>Quote of the Week</h2>
          <div class="quote-box">"${escapeHtml(data.quote_of_the_week || "Strong leadership creates clarity, not complexity.")}"</div>
        </div>

        <div class="section">
          <h2>Key Takeaways for Leaders</h2>
          <ul class="takeaway-list">
            <li>${escapeHtml(data.takeaway_1 || "")}</li>
            <li>${escapeHtml(data.takeaway_2 || "")}</li>
            <li>${escapeHtml(data.takeaway_3 || "")}</li>
            <li>${escapeHtml(data.takeaway_4 || "")}</li>
          </ul>
        </div>

        <div class="section">
          <h2>Personalised Executive Focus</h2>
          <div class="personalised-box">
            <h3>${escapeHtml(data.personalised_topic || "Leadership Strategy")}</h3>
            <p>${escapeHtml(data.personalised_insight || "Focus on building systems that improve executive decision quality and organisational alignment.")}</p>
          </div>
        </div>

        <div class="section">
          <h2>Continue the Conversation</h2>
          <div class="cta-row">
            <a href="${escapeHtml(data.listen_url || "#")}" class="cta-button">Listen Now</a>
            <a href="${escapeHtml(data.read_more_url || "#")}" class="cta-button secondary">Read More</a>
            <a href="${escapeHtml(data.share_url || "#")}" class="cta-button">Share Episode</a>
          </div>
        </div>

        <div class="footer">
          CEO Advantage • Executive insights for leaders, decision-makers, and growth-focused organisations.
        </div>
      </div>
    </div>
  `;
}

loadSampleBtn.addEventListener("click", () => {
  transcriptInput.value = sampleTranscript;
  statusMessage.textContent = "Demo transcript loaded.";
});

generateBtn.addEventListener("click", async () => {
  const transcript = transcriptInput.value.trim();

  if (!transcript) {
    statusMessage.textContent = "Please paste a transcript first.";
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  statusMessage.textContent = "Generating newsletter content via AI...";

  try {
    const response = await fetch("/generate-newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transcript })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unknown server error.");
    }

    newsletterPreview.classList.remove("empty-state");
    newsletterPreview.innerHTML = renderNewsletter(data);
    statusMessage.textContent = "Newsletter generated successfully.";
  } catch (error) {
    console.error(error);
    statusMessage.textContent = `Error: ${error.message}`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Newsletter";
  }
});