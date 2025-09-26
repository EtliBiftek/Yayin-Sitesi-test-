"use strict";

const qs = (sel, el = document) => el.querySelector(sel);
const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

function scrollToBottom(el) {
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
}

function createMessageElement(username, text, avatarUrl, isSelf = false) {
  const wrap = document.createElement("div");
  wrap.className = "message" + (isSelf ? " me" : "");

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.alt = "Kullanıcı avatarı";
  avatar.src = avatarUrl;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const strong = document.createElement("strong");
  strong.textContent = username;
  bubble.appendChild(strong);
  bubble.appendChild(document.createTextNode(" " + text));

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  return wrap;
}

function initHoverPreviews() {
  const cards = qsa(".stream-card");
  cards.forEach((card) => {
    const vid = qs("video.preview", card);
    if (!vid) return;
    card.addEventListener("mouseenter", () => {
      vid.muted = true;
      const playPromise = vid.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    });
    card.addEventListener("mouseleave", () => {
      vid.pause();
      try { vid.currentTime = 0; } catch (_) {}
    });
  });
}

function initProfileTabs() {
  const tabs = qsa(".tab-nav .tab");
  const panels = qsa(".tab-panel");
  if (tabs.length === 0) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((p) => p.toggleAttribute("hidden", p.getAttribute("data-tab") !== id));
    });
  });
}

function initCategoryFilter() {
  const input = qs("#categoryFilter");
  const cards = qsa(".category-grid .category-card");
  if (!input || cards.length === 0) return;
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    cards.forEach((c) => {
      const title = (c.getAttribute("data-title") || "").toLowerCase();
      c.style.display = title.includes(term) ? "" : "none";
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const app = qs("#app");
  const video = qs("#liveVideo");
  const quickPlay = qs("#quickPlay");
  const chat = qs(".chat");
  const messages = qs("#messages");
  const chatForm = qs("#chatForm");
  const chatText = qs("#chatText");
  const toggleChat = qs("#toggleChat");
  const prevLive = qs("#prevLive");
  const nextLive = qs("#nextLive");
  const liveCarousel = qs("#liveCarousel");
  const collapseSidebar = qs("#collapseSidebar");
  const sidebar = qs(".sidebar");
  const playerAndChat = qs(".player-and-chat");

  // Player quick toggle
  if (quickPlay && video) {
    quickPlay.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  // Chat send
  if (chatForm && chatText && messages) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = chatText.value.trim();
      if (!value) return;
      const el = createMessageElement("sen", value, "https://i.pravatar.cc/100?img=1", true);
      messages.appendChild(el);
      chatText.value = "";
      scrollToBottom(messages);
    });
  }

  // Chat toggle
  if (toggleChat && chat) {
    toggleChat.addEventListener("click", () => {
      chat.classList.toggle("collapsed");
      const hidden = chat.classList.contains("collapsed");
      if (playerAndChat) playerAndChat.classList.toggle("chat-hidden", hidden);
      toggleChat.setAttribute("aria-pressed", hidden ? "true" : "false");
    });
  }

  // Carousel controls
  function carouselStep(forward = true) {
    if (!liveCarousel) return;
    const width = liveCarousel.clientWidth;
    const step = Math.max(260, Math.floor(width * 0.9));
    liveCarousel.scrollBy({ left: forward ? step : -step, behavior: "smooth" });
  }
  if (prevLive) prevLive.addEventListener("click", () => carouselStep(false));
  if (nextLive) nextLive.addEventListener("click", () => carouselStep(true));

  // Sidebar collapse
  if (collapseSidebar && sidebar && app) {
    collapseSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      app.classList.toggle("sidebar-collapsed");
      const expanded = !sidebar.classList.contains("collapsed");
      collapseSidebar.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  // Initialize per-page helpers
  initHoverPreviews();
  initProfileTabs();
  initCategoryFilter();
});
