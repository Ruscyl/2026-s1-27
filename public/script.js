const transcriptInput = document.getElementById("transcriptInput");
const generateBtn = document.getElementById("generateBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const statusMessage = document.getElementById("statusMessage");
const newsletterPreview = document.getElementById("newsletterPreview");
const transcriptFileInput = document.getElementById("transcriptFile");
const fileDropZone = document.getElementById("fileDropZone");
const subscriberNameInput = document.getElementById("subscriberName");
const subscriberEmailInput = document.getElementById("subscriberEmail");
const addSubscriberBtn = document.getElementById("addSubscriberBtn");
const subscriberMessage = document.getElementById("subscriberMessage");
const subscriberList = document.getElementById("subscriberList");
const sendNewsletterBtn = document.getElementById("sendNewsletterBtn");
const newsletterSubjectInput = document.getElementById("newsletterSubject");
const distributionStatus = document.getElementById("distributionStatus");
const sendConfirmModal = document.getElementById("sendConfirmModal");
const confirmSendBtn = document.getElementById("confirmSendBtn");
const cancelSendBtn = document.getElementById("cancelSendBtn");
const sendConfirmMessage = document.getElementById("sendConfirmMessage");

// Edit modal elements
const editModal = document.getElementById("editModal");
const editNewsletterBtn = document.getElementById("editNewsletterBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditsBtn = document.getElementById("saveEditsBtn");

const editFields = {
  episode_number: document.getElementById("editEpisodeNumber"),
  episode_title: document.getElementById("editEpisodeTitle"),
  guest_name: document.getElementById("editGuestName"),
  executive_brief: document.getElementById("editExecutiveBrief"),
  insight_1_title: document.getElementById("editInsight1Title"),
  insight_1_body: document.getElementById("editInsight1Body"),
  insight_2_title: document.getElementById("editInsight2Title"),
  insight_2_body: document.getElementById("editInsight2Body"),
  insight_3_title: document.getElementById("editInsight3Title"),
  insight_3_body: document.getElementById("editInsight3Body"),
  quote_of_the_week: document.getElementById("editQuoteOfTheWeek"),
  takeaway_1: document.getElementById("editTakeaway1"),
  takeaway_2: document.getElementById("editTakeaway2"),
  takeaway_3: document.getElementById("editTakeaway3"),
  takeaway_4: document.getElementById("editTakeaway4"),
  personalised_topic: document.getElementById("editPersonalisedTopic"),
  personalised_insight: document.getElementById("editPersonalisedInsight")
};

let currentNewsletterHtml = "";
let currentNewsletterData = {};
let subscribers = [];

const sampleTranscript = `Welcome to CEO Advantage. In today's episode, we discuss why executive teams struggle to scale decision-making as organisations grow. Our guest is Sarah Mitchell, a leadership strategist and former COO with over twenty years of experience helping mid-market and enterprise leaders build resilient operating models.

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

function setSubscriberMessage(message) {
  subscriberMessage.textContent = message;
}

function setDistributionMessage(message) {
  distributionStatus.textContent = message;
}

function updateDistributionState() {
  sendNewsletterBtn.disabled = !currentNewsletterHtml || subscribers.length === 0;
}

async function loadSubscribers() {
  try {
    const response = await fetch("/api/subscribers");
    const data = await response.json();
    subscribers = Array.isArray(data) ? data : [];
    renderSubscriberList();
    updateDistributionState();
  } catch (error) {
    console.error(error);
    setSubscriberMessage("Unable to load subscribers.");
  }
}

function renderSubscriberList() {
  subscriberList.innerHTML = "";

  if (!subscribers.length) {
    subscriberList.innerHTML = "<li class='subscriber-empty'>No subscribers yet.</li>";
    return;
  }

  subscribers.forEach((subscriber) => {
    const li = document.createElement("li");
    li.className = "subscriber-item";
    li.innerHTML = `
      <span><strong>${escapeHtml(subscriber.name)}</strong> &lt;${escapeHtml(subscriber.email)}&gt;</span>
      <button class="remove-subscriber" data-email="${escapeHtml(subscriber.email)}">Remove</button>
    `;
    subscriberList.appendChild(li);
  });
}

async function addSubscriber() {
  const name = subscriberNameInput.value.trim();
  const email = subscriberEmailInput.value.trim().toLowerCase();

  if (!name || !email) {
    setSubscriberMessage("Please enter both name and email.");
    return;
  }

  try {
    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unable to add subscriber.");
    }

    subscriberNameInput.value = "";
    subscriberEmailInput.value = "";
    setSubscriberMessage(`Added ${result.email}.`);
    await loadSubscribers();
  } catch (error) {
    console.error(error);
    setSubscriberMessage(error.message);
  }
}

async function removeSubscriber(email) {
  try {
    const response = await fetch("/api/subscribers", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unable to remove subscriber.");
    }

    setSubscriberMessage(`Removed ${email}.`);
    await loadSubscribers();
  } catch (error) {
    console.error(error);
    setSubscriberMessage(error.message);
  }
}

function showSendConfirm() {
  if (!currentNewsletterHtml) {
    setDistributionMessage("Generate a newsletter before sending.");
    return;
  }
  if (!subscribers.length) {
    setDistributionMessage("Add subscribers before sending.");
    return;
  }

  sendConfirmMessage.textContent = `You are about to send the newsletter to ${subscribers.length} subscriber(s). Proceed?`;
  sendConfirmModal.classList.remove("hidden");
}

function hideSendConfirm() {
  sendConfirmModal.classList.add("hidden");
}

async function sendNewsletter() {
  hideSendConfirm();

  const subject = newsletterSubjectInput.value.trim() || "CEO Advantage Newsletter";
  sendNewsletterBtn.disabled = true;
  sendNewsletterBtn.textContent = "Sending...";
  setDistributionMessage("Distributing newsletter to subscribers...");

  try {
    const response = await fetch("/send-newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subject,
        html: currentNewsletterHtml,
        text: stripHtml(currentNewsletterHtml)
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to send newsletter.");
    }

    if (!result.success) {
      const detail = result.message || "Some newsletter deliveries failed.";
      setDistributionMessage(detail);
      console.warn("Newsletter delivery results:", result.results);
      return;
    }

    setDistributionMessage(result.message || `Newsletter sent to ${result.delivered} subscriber(s).`);
  } catch (error) {
    console.error(error);
    setDistributionMessage(error.message);
  } finally {
    sendNewsletterBtn.disabled = false;
    sendNewsletterBtn.textContent = "Send Newsletter to Subscribers";
  }
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function openEditModal() {
  if (!currentNewsletterData || !Object.keys(currentNewsletterData).length) {
    statusMessage.textContent = "Generate a newsletter before editing.";
    return;
  }

  // Populate form with current data
  Object.keys(editFields).forEach((key) => {
    if (editFields[key]) {
      editFields[key].value = currentNewsletterData[key] || "";
    }
  });

  editModal.classList.remove("hidden");
}

function closeEditModal() {
  editModal.classList.add("hidden");
}

function saveEdits() {
  // Collect edited data
  Object.keys(editFields).forEach((key) => {
    if (editFields[key]) {
      currentNewsletterData[key] = editFields[key].value || "";
    }
  });

  // Re-render the newsletter preview with updated data
  currentNewsletterHtml = renderNewsletter(currentNewsletterData);
  newsletterPreview.innerHTML = currentNewsletterHtml;
  statusMessage.textContent = "Newsletter updated.";
  closeEditModal();
}

// Event listeners
addSubscriberBtn.addEventListener("click", addSubscriber);
subscriberList.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-subscriber")) {
    removeSubscriber(event.target.dataset.email);
  }
});

sendNewsletterBtn.addEventListener("click", showSendConfirm);
confirmSendBtn.addEventListener("click", sendNewsletter);
cancelSendBtn.addEventListener("click", hideSendConfirm);
sendConfirmModal.addEventListener("click", (event) => {
  if (event.target === sendConfirmModal || event.target.classList.contains("modal-backdrop")) {
    hideSendConfirm();
  }
});

// Edit modal event listeners
editNewsletterBtn.addEventListener("click", openEditModal);
saveEditsBtn.addEventListener("click", saveEdits);
cancelEditBtn.addEventListener("click", closeEditModal);
editModal.addEventListener("click", (event) => {
  if (event.target === editModal || event.target.classList.contains("modal-backdrop")) {
    closeEditModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSendConfirm();
    closeEditModal();
  }
});

loadSubscribers();

function handleTranscriptFile(file) {
  if (!file) {
    statusMessage.textContent = "No transcript file selected.";
    return;
  }

  const acceptedTypes = ["text/plain", "text/markdown", "application/octet-stream"];
  if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(txt|md|text|log)$/i)) {
    statusMessage.textContent = "Please upload a plain text transcript file (.txt, .md, .log).";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    transcriptInput.value = reader.result;
    statusMessage.textContent = `Loaded transcript from ${file.name}.`;
  };
  reader.onerror = () => {
    statusMessage.textContent = `Unable to read ${file.name}. Please try another file.`;
  };
  reader.readAsText(file, "UTF-8");
}

transcriptFileInput.addEventListener("change", () => {
  handleTranscriptFile(transcriptFileInput.files[0]);
});

fileDropZone.addEventListener("click", () => {
  transcriptFileInput.click();
});

fileDropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  fileDropZone.classList.add("dragover");
});

fileDropZone.addEventListener("dragleave", () => {
  fileDropZone.classList.remove("dragover");
});

fileDropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  fileDropZone.classList.remove("dragover");
  const file = event.dataTransfer.files[0];
  handleTranscriptFile(file);
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

    // Store the newsletter data for editing
    currentNewsletterData = data;
    newsletterPreview.classList.remove("empty-state");
    currentNewsletterHtml = renderNewsletter(data);
    newsletterPreview.innerHTML = currentNewsletterHtml;
    editNewsletterBtn.classList.remove("hidden");
    updateDistributionState();
    statusMessage.textContent = "Newsletter generated successfully.";
  } catch (error) {
    console.error(error);
    statusMessage.textContent = `Error: ${error.message}`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Newsletter";
  }
});
