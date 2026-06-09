(() => {
const fallbackData = {
  businesses: [
    { id: "shop", name: "Harbor & Pine", type: "E-commerce", domain: "harborpine.example", accent: "#008c7a" },
    { id: "saas", name: "Northstar CRM", type: "SaaS startup", domain: "northstarcrm.example", accent: "#087ea4" },
    { id: "hotel", name: "Tidehouse Stay", type: "Hotel", domain: "tidehouse.example", accent: "#2c7a5d" }
  ],
  users: [{ name: "Maya Chen" }, { name: "Theo Grant" }, { name: "Priya Shah" }],
  plans: [{ name: "Growth", credits: 12000, agents: 5, members: 6 }],
  agents: [
    { id: "agent_shop", businessId: "shop", name: "Harbor Helper", website: "harborpine.example", model: "GPT-4.1 mini", status: "Live", sources: 42, theme: "#008c7a", members: ["Maya Chen", "Theo Grant"], greeting: "Hi, I can help with sizing, shipping, and returns." }
  ],
  knowledgeSources: [{ id: "src_1", businessId: "shop", type: "URLs", title: "Shipping and returns pages", status: "Synced", lastSynced: "Today, 9:12 AM" }],
  conversations: [{ id: "conv_1042", businessId: "shop", agent: "Harbor Helper", customer: "Ava Brooks", email: "ava@example.com", status: "Handoff", date: "Today", leadScore: "Warm", messages: [{ from: "user", body: "Can I exchange a jacket?" }, { from: "ai", body: "Yes. Exchanges are free within 30 days." }] }],
  leads: [{ id: "lead_1", name: "Ava Brooks", email: "ava@example.com", conversation: "conv_1042", status: "Needs follow-up", booked: false }],
  analytics: { kpis: { conversationsToday: 147, resolutionRate: 78, handoffRate: 14, capturedLeads: 23 }, conversationDays: [41, 52, 48, 63, 71, 88, 96], resolvedVsHandoff: [78, 14, 8], activity: ["Demo data loaded."] },
  widgetReplies: { default: "I found a close match in the demo knowledge base.", human: "I can escalate this to a human teammate with the full transcript.", booking: "Here is a demo booking option.", pricing: "Plans are based on credits, agents, and seats.", shipping: "Standard delivery is 3-5 business days." }
};

const state = {
  data: fallbackData,
  businessId: "shop",
  selectedConversation: null,
  sourceTab: "URLs",
  widget: { color: "#008c7a", greeting: "Hi, I can help with sizing, shipping, and returns.", name: "Harbor Helper", position: "Right", dark: false, brand: true }
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function badge(status) {
  const tone = status === "Live" || status === "Synced" || status === "Resolved" ? "" : status === "Processing" || status === "Training" || status === "Open" ? "blue" : "warn";
  return `<span class="badge ${tone}">${status}</span>`;
}

function toast(message) {
  const stack = $("#toastStack");
  if (!stack) return;
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  stack.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}

async function loadData() {
  try {
    const response = await fetch("data/demo.json");
    if (!response.ok) throw new Error("Demo data unavailable");
    state.data = await response.json();
  } catch {
    state.data = fallbackData;
    toast("Loaded bundled demo data.");
  }
  state.businessId = state.data.businesses[0]?.id || "shop";
  const agent = state.data.agents.find((item) => item.businessId === state.businessId) || state.data.agents[0];
  if (agent) Object.assign(state.widget, { color: agent.theme, greeting: agent.greeting, name: agent.name });
}

function currentBusiness() {
  return state.data.businesses.find((business) => business.id === state.businessId) || state.data.businesses[0];
}

function filtered(key) {
  return state.data[key].filter((item) => !item.businessId || item.businessId === state.businessId);
}

function renderWorkspace() {
  const select = $("#businessSelect");
  select.innerHTML = state.data.businesses.map((business) => `<option value="${business.id}">${business.name} · ${business.type}</option>`).join("");
  select.value = state.businessId;
  select.addEventListener("change", () => {
    state.businessId = select.value;
    const agent = filtered("agents")[0];
    if (agent) Object.assign(state.widget, { color: agent.theme, greeting: agent.greeting, name: agent.name });
    renderAll();
    toast(`Switched to ${currentBusiness().name}.`);
  });
}

function setView(view) {
  $$(".view").forEach((section) => section.classList.toggle("active", section.id === `${view}View`));
  $$(".sidebar-link").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
  $("#viewTitle").textContent = $(`[data-view="${view}"]`)?.textContent.trim() || "Overview";
}

function renderOverview() {
  const k = state.data.analytics.kpis;
  $("#kpiGrid").innerHTML = [
    ["Conversations today", k.conversationsToday],
    ["AI resolution rate", `${k.resolutionRate}%`],
    ["Handoff rate", `${k.handoffRate}%`],
    ["Captured leads", k.capturedLeads]
  ].map(([label, value]) => `<article class="app-card kpi"><span>${label}</span><strong>${value}</strong></article>`).join("");
  $("#conversationChart").innerHTML = state.data.analytics.conversationDays.map((value) => `<span class="bar" style="height:${value}%"></span>`).join("");
  $("#resolutionChart").innerHTML = state.data.analytics.resolvedVsHandoff.map((value, index) => `<span class="bar" style="height:${value}%; background:${["var(--primary)", "var(--amber)", "var(--blue)"][index]}"></span>`).join("");
  $("#activityList").innerHTML = state.data.analytics.activity.map((item) => `<div class="activity-item">${item}</div>`).join("");
}

function renderAgents() {
  $("#agentGrid").innerHTML = filtered("agents").map((agent) => `
    <article class="app-card">
      <div class="toolbar"><h3>${agent.name}</h3>${badge(agent.status)}</div>
      <p class="muted">${agent.website}</p>
      <div class="agent-theme" style="--agent-color:${agent.theme}"><span class="launcher-dot">R</span></div>
      <p><strong>${agent.model}</strong></p>
      <p class="muted">${agent.sources} linked sources · ${agent.members.join(", ")}</p>
      <button class="btn small" data-edit-agent="${agent.id}">Edit agent</button>
    </article>
  `).join("");
}

function renderSources() {
  $$(".source-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.sourceTab === state.sourceTab));
  const rows = filtered("knowledgeSources").filter((source) => source.type === state.sourceTab);
  $("#sourceList").innerHTML = rows.length ? rows.map((source) => `
    <div class="source-row">
      <div><strong>${source.title}</strong><p class="muted">Last synced ${source.lastSynced}</p></div>
      ${badge(source.status)}
    </div>
  `).join("") : `<div class="app-card"><h3>No ${state.sourceTab.toLowerCase()} yet</h3><p class="muted">Add a source to train this agent. The Growth plan allows 250 URLs or 250 MB of documents.</p></div>`;
}

function renderConversations() {
  const query = ($("#globalSearch")?.value || "").toLowerCase();
  const conversations = filtered("conversations").filter((conv) => `${conv.customer} ${conv.agent} ${conv.status}`.toLowerCase().includes(query));
  state.selectedConversation ||= conversations[0]?.id;
  $("#conversationList").innerHTML = conversations.map((conv) => `
    <button class="conversation-item ${conv.id === state.selectedConversation ? "active" : ""}" data-conv="${conv.id}">
      <strong>${conv.customer}</strong><p class="muted">${conv.agent} · ${conv.date}</p>${badge(conv.status)}
    </button>
  `).join("");
  const selected = conversations.find((conv) => conv.id === state.selectedConversation) || conversations[0];
  if (!selected) return;
  $("#threadTitle").textContent = `${selected.customer} · ${selected.id}`;
  $("#messageList").innerHTML = selected.messages.map((message) => `<div class="bubble ${message.from === "user" ? "user" : ""}">${message.body}</div>`).join("");
  $("#leadPanel").innerHTML = `<h3>Lead profile</h3><p><strong>${selected.customer}</strong></p><p class="muted">${selected.email}</p><p>Status: ${badge(selected.status)}</p><p>Lead score: <strong>${selected.leadScore}</strong></p><button class="btn accent" id="assignHuman">Assign to human</button>`;
  $("#assignHuman")?.addEventListener("click", () => toast("Conversation assigned with full history preserved."));
}

function renderLeads() {
  $("#leadTableBody").innerHTML = filtered("leads").map((lead) => `
    <tr><td>${lead.name}</td><td>${lead.email}</td><td>${lead.conversation}</td><td>${lead.status}</td><td>${lead.booked ? "Booked" : "Not booked"}</td></tr>
  `).join("");
}

function renderWidgetSettings() {
  $("#widgetColor").value = state.widget.color;
  $("#widgetGreeting").value = state.widget.greeting;
  $("#widgetName").value = state.widget.name;
  $("#widgetPreviewName").textContent = state.widget.name;
  $("#widgetPreviewGreeting").textContent = state.widget.greeting;
  $("#chatTitle").textContent = state.widget.name;
  $("#chatWelcome").textContent = state.widget.greeting;
  document.documentElement.style.setProperty("--widget-color", state.widget.color);
}

function renderBilling() {
  const plan = state.data.plans[1] || state.data.plans[0] || { name: "Demo", credits: 0, agents: 0, members: 0 };
  $("#billingCard").innerHTML = `
    <h3>${plan.name} plan</h3>
    <p class="muted">${plan.credits.toLocaleString()} credits · ${plan.agents} agents · ${plan.members} team members</p>
    <div class="usage-meter" aria-label="62 percent of message credits used"><span></span></div>
    <p class="muted">7,440 of 12,000 message credits used this month.</p>
    <button class="btn accent">Upgrade plan</button>
  `;
}

function renderAll() {
  renderOverview();
  renderAgents();
  renderSources();
  renderConversations();
  renderLeads();
  renderWidgetSettings();
  renderBilling();
}

function openModal(type) {
  const modal = $("#modal");
  const title = type === "source" ? "Add knowledge source" : "Create support agent";
  $("#modalContent").innerHTML = `
    <div class="modal-head"><h2>${title}</h2><button class="btn icon" data-close-modal aria-label="Close dialog">×</button></div>
    <form class="form-grid" id="modalForm">
      <div class="field"><label for="modalName">${type === "source" ? "Source name" : "Agent name"}</label><input id="modalName" required value="${type === "source" ? "New help center source" : "New Relay agent"}"></div>
      <div class="field"><label for="modalType">${type === "source" ? "Source type" : "Model"}</label><select id="modalType">${type === "source" ? "<option>URLs</option><option>documents</option><option>raw</option>" : "<option>GPT-4.1 mini</option><option>Claude 3.5 Sonnet</option><option>Gemini 1.5 Pro</option>"}</select></div>
      <button class="btn accent" type="submit">Save</button>
    </form>
  `;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  $("#modalName").focus();
  $("#modalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (type === "source") {
      state.data.knowledgeSources.unshift({ id: `src_${Date.now()}`, businessId: state.businessId, type: $("#modalType").value, title: $("#modalName").value, status: "Processing", lastSynced: "Just now" });
      state.sourceTab = $("#modalType").value;
      renderSources();
    } else {
      state.data.agents.unshift({ id: `agent_${Date.now()}`, businessId: state.businessId, name: $("#modalName").value, website: currentBusiness().domain, model: $("#modalType").value, status: "Training", sources: 0, theme: currentBusiness().accent, members: ["Maya Chen"], greeting: "Hi, I am learning your support content now." });
      renderAgents();
    }
    closeModal();
    toast("Saved changes.");
  });
}

function closeModal() {
  $("#modal").classList.remove("show");
  $("#modal").setAttribute("aria-hidden", "true");
}

function initChat() {
  const panel = $("#chatPanel");
  $("#chatLauncher").addEventListener("click", () => {
    panel.classList.toggle("open");
    $("#chatInput").focus();
  });
  $("#chatClose").addEventListener("click", () => panel.classList.remove("open"));
  $$(".suggestions button").forEach((button) => button.addEventListener("click", () => sendChat(button.textContent)));
  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    sendChat(input.value);
    input.value = "";
  });
}

function sendChat(text) {
  if (!text.trim()) return;
  const log = $("#chatLog");
  log.insertAdjacentHTML("beforeend", `<div class="bubble user">${text}</div><div class="typing" aria-label="RelayDesk is typing"><span></span><span></span><span></span></div>`);
  log.scrollTop = log.scrollHeight;
  setTimeout(() => {
    $(".typing", log)?.remove();
    const lower = text.toLowerCase();
    const key = lower.includes("human") ? "human" : lower.includes("book") || lower.includes("demo") ? "booking" : lower.includes("price") || lower.includes("credit") ? "pricing" : lower.includes("ship") || lower.includes("return") ? "shipping" : "default";
    log.insertAdjacentHTML("beforeend", `<div class="bubble">${state.data.widgetReplies[key]}</div>`);
    if (key === "human") log.insertAdjacentHTML("beforeend", `<div class="bubble">What email should the team use to reach you?</div>`);
    if (key === "booking") log.insertAdjacentHTML("beforeend", `<div class="bubble"><button class="btn small accent" type="button">Open booking link</button></div>`);
    log.scrollTop = log.scrollHeight;
  }, 700);
}

function bindEvents() {
  $$(".sidebar-link").forEach((link) => link.addEventListener("click", () => setView(link.dataset.view)));
  $$(".source-tab").forEach((tab) => tab.addEventListener("click", () => { state.sourceTab = tab.dataset.sourceTab; renderSources(); }));
  $("#addAgent").addEventListener("click", () => openModal("agent"));
  $("#addSource").addEventListener("click", () => openModal("source"));
  $("#modal").addEventListener("click", (event) => {
    if (event.target.id === "modal" || event.target.matches("[data-close-modal]")) closeModal();
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
  $("#conversationList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-conv]");
    if (!button) return;
    state.selectedConversation = button.dataset.conv;
    renderConversations();
  });
  $("#globalSearch").addEventListener("input", renderConversations);
  ["widgetColor", "widgetGreeting", "widgetName"].forEach((id) => {
    $(`#${id}`).addEventListener("input", (event) => {
      const key = id.replace("widget", "").toLowerCase();
      state.widget[key] = event.target.value;
      renderWidgetSettings();
    });
  });
  $("#saveWidget").addEventListener("click", () => toast("Widget settings saved to this demo session."));
  $("#exportLeads").addEventListener("click", () => toast("Export prepared: 3 captured leads."));
  $$("[data-toast]").forEach((button) => button.addEventListener("click", () => toast(button.dataset.toast)));
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  renderWorkspace();
  bindEvents();
  renderAll();
  initChat();
  setView("overview");
});
})();
