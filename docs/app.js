const promptsByType = {
  "Product Webinars": [
    "Ask which product was covered, who attended, and which partner or customer needs follow-up.",
    "Collect the recording, final deck, attendee list, chat questions, poll results, and follow-up owners.",
    "Ask whether marketing should turn the webinar into social clips, email content, or partner enablement material.",
  ],
  Conference: [
    "Ask which sessions they attended, who they met, and what opportunities or competitors came up.",
    "Collect session photos, speaker notes, business cards, lead lists, booth photos, and useful brochures.",
    "Ask whether any follow-up meetings, content requests, or sales handoffs need to be created.",
  ],
  Expo: [
    "Ask booth location, lead quality, strategic conversations, and what demos or merch performed best.",
    "Collect booth photos, lead scans, visitor notes, competitor photos, videos, and collateral used at the booth.",
    "Ask what assets should go to marketing and what materials are needed before the next expo.",
  ],
  "Customer Visits": [
    "Ask who they met, what problem was discussed, what was promised, and who owns each follow-up.",
    "Collect site photos, equipment photos, meeting notes, customer questions, permission notes, and business cards.",
    "Ask whether the next visit needs brochures, demo files, case studies, stickers, T-shirts, or caps.",
  ],
  "University Visit": [
    "Ask which faculty or department attended, MOU status, signatures needed, and expected timeline.",
    "Collect signed drafts, campus photos, faculty contacts, student-program notes, presentation files, and visit photos.",
    "Ask whether legal, marketing, or leadership needs a summary or follow-up packet.",
  ],
};

const defaultEvents = [
  {
    name: "Upcoming customer visit",
    type: "Customer Visits",
    date: "Next week",
    drive: "Drive folder will be created after sync",
    merch: "Ask SE about stickers, T-shirts, and caps",
  },
];

const state = {
  events: [...defaultEvents],
};

const micButton = document.querySelector("#micButton");
const micLabel = document.querySelector("#micLabel");
const voiceNote = document.querySelector("#voiceNote");
const eventName = document.querySelector("#eventName");
const eventDate = document.querySelector("#eventDate");
const eventType = document.querySelector("#eventType");
const eventLocation = document.querySelector("#eventLocation");
const driveLink = document.querySelector("#driveLink");
const assetInput = document.querySelector("#assetInput");
const assetCount = document.querySelector("#assetCount");
const assetAction = document.querySelector("#assetAction");
const assetNotes = document.querySelector("#assetNotes");
const needsMerch = document.querySelector("#needsMerch");
const stickers = document.querySelector("#stickers");
const shirts = document.querySelector("#shirts");
const caps = document.querySelector("#caps");
const questionList = document.querySelector("#questionList");
const assetChecklist = document.querySelector("#assetChecklist");
const calendarList = document.querySelector("#calendarList");
const createButton = document.querySelector("#createButton");
const clearButton = document.querySelector("#clearButton");
const quickButtons = document.querySelectorAll(".quick-actions button");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    voiceNote.value = `${voiceNote.value} ${transcript}`.trim();
  };

  recognition.onend = () => {
    isRecording = false;
    micButton.classList.remove("recording");
    micLabel.textContent = "Hold to speak";
  };
} else {
  micLabel.textContent = "Type your weekly update";
}

function renderPrompts() {
  const currentType = eventType.value;
  const prompts = promptsByType[currentType] || promptsByType["Customer Visits"];

  questionList.innerHTML = prompts
    .map((prompt) => `<li>${escapeHtml(prompt)}</li>`)
    .join("");

  assetChecklist.innerHTML = prompts
    .slice(1, 2)
    .join("")
    .replace("Collect ", "")
    .split(", ")
    .map((item) => `<div class="asset-item">${escapeHtml(item.replace(".", ""))}</div>`)
    .join("");
}

function renderCalendar() {
  calendarList.innerHTML = state.events
    .map((event) => {
      const merchLine = event.merch ? `<span>${escapeHtml(event.merch)}</span>` : "";
      const driveLine = event.drive ? `<span>${escapeHtml(event.drive)}</span>` : "";
      const assetLine = event.assetAction ? `<span>${escapeHtml(event.assetAction)}</span>` : "";
      return `
        <article class="calendar-card">
          <strong>${escapeHtml(event.name)}</strong>
          <span>${escapeHtml(event.type)} - ${escapeHtml(event.date)}</span>
          ${driveLine}
          ${assetLine}
          ${merchLine}
        </article>
      `;
    })
    .join("");
}

function setActiveType(type) {
  eventType.value = type;
  quickButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.type === type);
  });
  renderPrompts();
}

function startRecording() {
  if (!recognition || isRecording) return;
  recognition.start();
  isRecording = true;
  micButton.classList.add("recording");
  micLabel.textContent = "Listening...";
}

function stopRecording() {
  if (!recognition || !isRecording) return;
  recognition.stop();
}

function resetForm() {
  voiceNote.value = "";
  eventName.value = "";
  eventDate.value = new Date().toISOString().slice(0, 10);
  eventLocation.value = "";
  driveLink.value = "";
  assetInput.value = "";
  assetAction.selectedIndex = 0;
  assetNotes.value = "";
  needsMerch.checked = false;
  stickers.value = 0;
  shirts.value = 0;
  caps.value = 0;
  assetCount.textContent = "No files selected";
  setActiveType("Product Webinars");
}

micButton.addEventListener("mousedown", startRecording);
micButton.addEventListener("mouseup", stopRecording);
micButton.addEventListener("mouseleave", stopRecording);
micButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  startRecording();
});
micButton.addEventListener("touchend", stopRecording);

quickButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveType(button.dataset.type));
});

eventType.addEventListener("change", () => setActiveType(eventType.value));

assetInput.addEventListener("change", () => {
  const count = assetInput.files.length;
  assetCount.textContent = count === 1 ? "1 file selected" : `${count} files selected`;
});

createButton.addEventListener("click", () => {
  const merchItems = [
    Number(stickers.value) ? `${stickers.value} stickers` : "",
    Number(shirts.value) ? `${shirts.value} T-shirts` : "",
    Number(caps.value) ? `${caps.value} caps` : "",
  ].filter(Boolean);

  state.events.unshift({
    name: eventName.value || "Untitled field activity",
    type: eventType.value,
    date: eventLocation.value
      ? `${eventDate.value || "Date pending"} at ${eventLocation.value}`
      : eventDate.value || "Date pending",
    drive: driveLink.value || "Drive folder will be created after sync",
    assetAction: `Asset action: ${assetAction.value}`,
    merch: needsMerch.checked
      ? `Merch requested: ${merchItems.join(", ") || "quantities pending"}`
      : "No merch requested yet",
  });

  renderCalendar();
});

clearButton.addEventListener("click", resetForm);

setActiveType("Product Webinars");
eventDate.value = new Date().toISOString().slice(0, 10);
renderCalendar();
