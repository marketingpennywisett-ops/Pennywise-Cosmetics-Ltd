/* ============================================================
   PAGE LOADER
   Keeps the splash on screen until every asset on the page
   (images, fonts, stylesheets) has actually finished loading,
   with a safety timeout so a single slow/broken asset can't
   strand a visitor on the loading screen forever.
   ============================================================ */
(function initPageLoader() {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  document.body.classList.add("is-loading");

  let hidden = false;
  function hideLoader() {
    if (hidden) return;
    hidden = true;
    document.body.classList.remove("is-loading");
    loader.classList.add("is-hidden");
    loader.addEventListener(
      "transitionend",
      () => {
        loader.remove();
      },
      { once: true },
    );
    // Fallback removal in case transitionend doesn't fire
    setTimeout(() => loader.remove(), 700);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader);
  }
  // Safety net: never let the loader block the site for more than 6s
  setTimeout(hideLoader, 6000);
})();

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const faqTrigger = document.querySelector(".faq-trigger");
const faqPanel = document.querySelector(".faq-panel");
const faqClose = document.querySelector(".faq-close");
const faqChat = document.getElementById("faqChat");
const faqForm = document.getElementById("faqForm");
const faqInput = document.getElementById("faqInput");
const scrollTopBtn = document.querySelector(".scroll-top");
const AGENT_AVATAR = "assets/Pennywise-Fav-Icon.png";

const mobileDemoOverlay = document.createElement("div");
mobileDemoOverlay.id = "mobile-demo-overlay";
mobileDemoOverlay.setAttribute("aria-live", "polite");
mobileDemoOverlay.textContent = "Not yet Mobile Ready";
document.body.appendChild(mobileDemoOverlay);

function applyMobileDemoLock() {
  const isMobile = window.matchMedia("(max-width: 1023px)").matches;
  document.body.classList.toggle("mobile-demo-lock", isMobile);
}

applyMobileDemoLock();
window.addEventListener("resize", applyMobileDemoLock);

/* ============================================================
   COUNTING ANIMATION
   ============================================================ */
let hasUserScrolled = false;

// Track when user actually scrolls
window.addEventListener(
  "scroll",
  () => {
    hasUserScrolled = true;
  },
  { once: true },
);

function initCountingAnimation() {
  const statNumbers = document.querySelectorAll(".stat-number");
  const animatedNumbers = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Only animate if user has scrolled AND element is intersecting
        if (
          hasUserScrolled &&
          entry.isIntersecting &&
          !animatedNumbers.has(entry.target)
        ) {
          animatedNumbers.add(entry.target);
          animateNumber(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
    },
  );

  statNumbers.forEach((num) => {
    observer.observe(num);
  });
}

function animateNumber(element) {
  const target = parseInt(element.dataset.target, 10);
  const suffix = element.dataset.suffix || "";
  const duration = 2000; // 2 seconds
  const startTime = performance.now();

  function frame(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const currentValue = Math.floor(progress * target);

    // Format with commas for numbers over 1000
    const formatted = currentValue.toLocaleString("en-US");
    element.textContent = formatted + suffix;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

// Initialize counting animation when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCountingAnimation);
} else {
  initCountingAnimation();
}

/* ============================================================
   CURSOR GLOW
   A soft glow that follows the pointer for a bit of ambient
   motion. Skipped on touch devices and for anyone who prefers
   reduced motion.
   ============================================================ */
(function initCursorGlow() {
  const glow = document.querySelector(".cursor-glow");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (!glow || prefersReducedMotion || isTouchDevice) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let isActive = false;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    if (!isActive) {
      isActive = true;
      glow.classList.add("is-active");
    }
  });

  window.addEventListener("mouseleave", () => {
    isActive = false;
    glow.classList.remove("is-active");
  });

  function followPointer() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;
    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(followPointer);
  }

  requestAnimationFrame(followPointer);
})();

/* ============================================================
   SCROLL REVEAL
   Adds an "in-view" class to sections once they scroll into
   view, so their contents can animate in via CSS. Currently
   used by the pharmacy promise section.
   ============================================================ */
(function initScrollReveal() {
  const targets = document.querySelectorAll(".promise");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 },
  );

  targets.forEach((el) => revealObserver.observe(el));
})();

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("scroll", () => {
  if (!scrollTopBtn) return;
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("visible");
  } else {
    scrollTopBtn.classList.remove("visible");
  }
});

scrollTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ============================================================
   STORE LOCATIONS MAP
   ============================================================ */
const STORE_LOCATIONS = [
  {
    name: "Chaguanas Plaza",
    phone: "612-3689 / 225-4715 / 795-9473",
    hours: "Mon-Sat 9am-7pm\nSun 10am-6pm",
    address: "Narsaloo Ramaya Marg Road, Chaguanas",
    image: "assets/Pennywise-Chaguanas-Plaza.png",
    coordinates: [10.516, -61.412],
    directions: "https://goo.gl/maps/3XaoqnRh7VBKEaWz6",
  },
  {
    name: "Long Circular Road",
    phone: "628-4905 / 628-8649 / 745-9473",
    hours: "Mon-Sat 9am-7pm",
    address: "Long Circular Road, Port of Spain",
    image: "assets/Pennywise-Long-Circular.png",
    coordinates: [10.675, -61.538],
    directions: "https://goo.gl/maps/w1fATpd8p8i1z34f7",
  },
  {
    name: "La Romain",
    phone: "225-4276 / 225-4277 / 684-9473",
    hours: "Mon-Sat 9am-7pm\nSun and Public Holidays 10am-6pm",
    address: "South Trunk Road & La Bel Air Road, Bamboo Village",
    image: "assets/Pennywise-La-Romain.png",
    coordinates: [10.273, -61.461],
    directions: "https://goo.gl/maps/PmDCLVmQMvfDZ18GA",
  },
  {
    name: "Port of Spain",
    phone: "623-3032 / 627-1736 / 466-9473",
    hours: "Mon-Sat 7:45am-5:30pm",
    address: "Charlotte Street, Port of Spain",
    image: "assets/Pennywise-Port-Of-Spain.png",
    coordinates: [10.657, -61.518],
    directions: "https://goo.gl/maps/5dSj41sYmhNmdcMB8",
  },
  {
    name: "San Fernando",
    phone: "657-2904 / 653-9473 / 785-9473",
    hours: "Mon-Sat 7:45am-5:30pm",
    address: "High Street, San Fernando",
    image: "assets/Pennywise-San-Fernando.png",
    coordinates: [10.28, -61.468],
    directions: "https://goo.gl/maps/W474Y5Xwuh82",
  },
  {
    name: "Tunapuna",
    phone: "662-3691 / 663-9473 / 683-8144",
    hours: "Mon-Fri 7:45am-5:30pm\nSat 7:30am-5:30pm\nSun 7:15am-12:00pm",
    address: "Eastern Main Road, Tunapuna",
    image: "assets/Pennywise-Tunapuna.png",
    coordinates: [10.652, -61.388],
    directions: "https://goo.gl/maps/Tt3cWiJwANz",
  },
  {
    name: "Grand Bazaar",
    phone: "645-9473 / 645-6452 / 774-9473",
    hours: "Mon-Sat 9am-7pm",
    address: "Grand Bazaar, Bamboo Settlement No. 1",
    image: "assets/Pennywise-Grand-Bazaar.png",
    coordinates: [10.646, -61.429],
    directions: "https://goo.gl/maps/vtkjjJ31Cmn",
  },
  {
    name: "Arima",
    phone: "667-4422 / 664-3469 / 683-7844",
    hours: "Mon-Fri 7:45am-5:30pm\nSat 7:30am-5:30pm\nSun 7:15am-5:30pm",
    address: "Pro Queen Street, Arima",
    image: "assets/Pennywise-Arima.png",
    coordinates: [10.628, -61.282],
    directions: "https://goo.gl/maps/kSdWqr6MvQ92",
  },
  {
    name: "Trincity Plaza",
    phone: "640-9438 / 640-8034 / 486-6973",
    hours: "Mon-Sat 9am-7pm\nSun 10am-6pm",
    address: "#4 Exposition Circular, Trincity Blvd Ext, Trincity",
    image: "assets/Pennywise-Trincity-Mall.png",
    coordinates: [10.64, -61.35],
    directions:
      "https://www.google.com/maps/search/?api=1&query=Pennywise+Trincity+Plaza+Trinidad",
  },
  {
    name: "Chaguanas Main Road",
    phone: "665-9473 / 672-5712 / 744-9473",
    hours: "Mon-Fri 7:45am-5:30pm\nSat 7:30am-5:30pm\nSun 7:15am-12:00pm",
    address: "Chaguanas Main Road, Chaguanas",
    image: "assets/Pennywise-Chaguanas-Main-Road.png",
    coordinates: [10.514, -61.405],
    directions:
      "https://www.google.com/maps/search/?api=1&query=Pennywise+Chaguanas+Main+Road+Trinidad",
  },
  {
    name: "Trincity Mall",
    phone: "640-9473 / 735-9473",
    hours: "Mon-Sat 9am-7pm",
    address: "Trincity Mall, Churchill-Roosevelt Highway, Trincity",
    image: "assets/Pennywise-Trincity-Mall.png",
    coordinates: [10.628, -61.365],
    directions: "https://goo.gl/maps/zQeoXre21iv",
  },
];

const TRINIDAD_BOUNDS = [
  [10.02, -61.98],
  [10.88, -60.82],
];

function initLocationsMap() {
  const mapElement = document.getElementById("locationsMap");
  if (!mapElement || typeof L === "undefined") return;

  const map = L.map(mapElement, {
    scrollWheelZoom: false,
    maxBounds: TRINIDAD_BOUNDS,
    maxBoundsViscosity: 1,
    minZoom: 10,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
  }).setView([10.45, -61.3], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  window.setTimeout(() => {
    map.invalidateSize();
    map.fitBounds(TRINIDAD_BOUNDS, { padding: [20, 20] });
  }, 300);

  L.Icon.Default.mergeOptions({
    imagePath: "https://unpkg.com/leaflet@1.9.4/dist/images/",
    iconRetinaUrl: "marker-icon-2x.png",
    iconUrl: "marker-icon.png",
    shadowUrl: "marker-shadow.png",
  });

  const pinkPin = L.divIcon({
    className: "pink-map-marker",
    html: '<span class="pink-map-pin" aria-hidden="true"></span>',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -36],
  });

  const detailsPanel = document.getElementById("locationDetails");
  let selectedMarker = null;

  function showStoreDetails(store, marker) {
    selectedMarker?.getElement()?.classList.remove("is-selected");
    selectedMarker = marker;
    selectedMarker.getElement()?.classList.add("is-selected");
    if (!detailsPanel) return;
    detailsPanel.innerHTML = `
      <img src="${store.image}" alt="${store.name} store" />
      <p class="location-details-label">Pennywise Cosmetics</p>
      <h3>${store.name}</h3>
      <p class="location-details-hours">${store.hours}</p>
      <p class="location-details-address">${store.address}</p>
      <p class="location-details-phone">${store.phone}</p>
      <a href="${store.directions}" target="_blank" rel="noreferrer">Get directions <span>↗</span></a>`;
  }

  STORE_LOCATIONS.forEach((store) => {
    const marker = L.marker(store.coordinates, { icon: pinkPin }).addTo(map);
    marker.on("mouseover click focus", () => showStoreDetails(store, marker));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLocationsMap);
} else {
  initLocationsMap();
}

faqTrigger?.addEventListener("click", () => {
  const isOpen = faqPanel.classList.toggle("open");
  faqPanel.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) faqInput?.focus();
});

faqClose?.addEventListener("click", () => {
  faqPanel.classList.remove("open");
  faqPanel.setAttribute("aria-hidden", "true");
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

/* ============================================================
   FAQ ASSISTANT — free-text question matching
   The FAQ content can optionally be loaded from a live Google Sheet.
   To use it, publish the sheet to the web and set GOOGLE_SHEETS_CONFIG.spreadsheetId.
   Sheet 1 should contain a FAQ tab with columns like: keywords, answer.
   Sheet 2 should contain a StoreHours tab with columns like: name, match, hours, phone.
   ============================================================ */

const GOOGLE_SHEETS_CONFIG = {
  useLiveSheet: false, // set to true once your sheet is published to the web
  spreadsheetId: "", // example: "1x2y3z..."
  faqSheetName: "Sheet1",
  storeHoursSheetName: "Sheet2",
};

function buildSheetUrl(sheetName) {
  const id = GOOGLE_SHEETS_CONFIG.spreadsheetId.trim();
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    sheetName,
  )}`;
}

function parseSheetRow(row, cols) {
  const result = {};
  row.c.forEach((cell, index) => {
    const key = cols[index]?.label
      ? cols[index].label.toString().trim().toLowerCase().replace(/\s+/g, "_")
      : `col_${index}`;
    result[key] = cell?.v ?? "";
  });
  return result;
}

function parseSheetResponse(text) {
  const json = JSON.parse(text.replace(/^.*?\(/, "").replace(/\);?\s*$/, ""));
  return json.table;
}

async function fetchSheetData(sheetName) {
  const response = await fetch(buildSheetUrl(sheetName));
  if (!response.ok) {
    throw new Error(`Google Sheet request failed: ${response.status}`);
  }
  const text = await response.text();
  const table = parseSheetResponse(text);
  const cols = table.cols || [];
  return table.rows.map((row) => parseSheetRow(row, cols));
}

function normalizeKeywords(value) {
  return value
    .toString()
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

let FAQ_DATA = [
  {
    keywords: ["hour", "hours", "open", "opening", "close", "closing", "time"],
    answer:
      'Hours vary a bit by store — most are open 7 days, roughly 8am to 7pm. Tell me a store name (like "Chaguanas" or "Trincity") and I can give you its exact hours, or check the locations page.',
  },
  {
    keywords: [
      "prescription",
      "pharmacy",
      "refill",
      "medication",
      "medicine",
      "script",
      "rx",
    ],
    answer:
      "Yes! WhatsApp a photo of your prescription to your nearest Pennywise Pharmacy, then bring the physical script in store to collect.",
  },
  {
    keywords: [
      "where",
      "location",
      "locations",
      "address",
      "nearest",
      "store",
      "branch",
    ],
    answer:
      "We have 10 stores across Trinidad, from Port of Spain to San Fernando. Find your nearest one on our locations page.",
  },
  {
    keywords: ["cdap", "otc", "over the counter", "drug plan"],
    answer:
      "Our pharmacies process CDAP and carry a full range of over-the-counter medication — just ask the pharmacist on duty.",
  },
  {
    keywords: ["phone", "call", "number", "contact"],
    answer:
      "You can reach our head office at (868) 640-5991, or find each store's direct line on the locations page.",
  },
  {
    keywords: ["delivery", "deliver", "ship", "online order"],
    answer:
      "We don't currently offer online ordering — pop into your nearest store, or call ahead and our team can set an item aside for you.",
  },
];

let STORE_HOURS = [
  {
    name: "Chaguanas Plaza",
    match: "chaguanas plaza",
    hours: "Mon—Sat 9am—7pm, Sun 10am—6pm",
    phone: "(868) 612-3689",
  },
  {
    name: "La Romain Plaza",
    match: "la romain",
    hours: "Mon—Sat 9am—7pm, Sun 10am—6pm",
    phone: "(868) 225-4276",
  },
  {
    name: "Long Circular Mall",
    match: "long circular",
    hours: "Mon—Sat 9am—7pm, Sunday closed",
    phone: "(868) 628-4905",
  },
  {
    name: "Grand Bazaar",
    match: "grand bazaar",
    hours: "Mon—Sat 9am—7pm, Sunday closed",
    phone: "(868) 645-9473",
  },
  {
    name: "Port of Spain",
    match: "port of spain",
    hours: "Mon—Sat 7:45am—5:30pm, Sunday closed",
    phone: "(868) 623-3032",
  },
  {
    name: "San Fernando",
    match: "san fernando",
    hours: "Mon—Sat 7:45am—5:30pm, Sunday closed",
    phone: "(868) 653-9473",
  },
  {
    name: "Tunapuna",
    match: "tunapuna",
    hours: "Mon—Fri 7:45am—5:30pm, Sat 7:30am—5:30pm, Sun 7:15am—12pm",
    phone: "(868) 612-4792",
  },
  {
    name: "Arima",
    match: "arima",
    hours: "Mon—Fri 7:45am—5:30pm, Sat 7:30am—5:30pm, Sun 7:15am—12pm",
    phone: "(868) 667-4422",
  },
  {
    name: "Chaguanas",
    match: "chaguanas",
    hours: "Mon—Fri 7:45am—5:30pm, Sat 7:30am—5:30pm, Sun 7:15am—12pm",
    phone: "(868) 665-9473",
  },
  {
    name: "Trincity",
    match: "trincity",
    hours: "Mon—Sat 9am—7pm, Sunday closed",
    phone: "(868) 640-9473",
  },
];

async function loadFaqFromSheet() {
  if (!GOOGLE_SHEETS_CONFIG.useLiveSheet) return;
  if (!GOOGLE_SHEETS_CONFIG.spreadsheetId.trim()) {
    console.warn("Google Sheets FAQ is enabled but spreadsheetId is not set.");
    return;
  }

  try {
    const faqRows = await fetchSheetData(GOOGLE_SHEETS_CONFIG.faqSheetName);
    const newFaq = faqRows
      .map((row) => ({
        keywords: normalizeKeywords(
          row.keywords || row.keyword || row.questions || "",
        ),
        answer: row.answer || row.response || "",
      }))
      .filter((item) => item.keywords.length > 0 && item.answer);
    if (newFaq.length > 0) {
      FAQ_DATA = newFaq;
    }
  } catch (error) {
    console.warn("Unable to load FAQ sheet:", error);
  }

  try {
    const hoursRows = await fetchSheetData(
      GOOGLE_SHEETS_CONFIG.storeHoursSheetName,
    );
    const newHours = hoursRows
      .map((row) => ({
        name: row.name || "",
        match: (row.match || row.location || "").toString().toLowerCase(),
        hours: row.hours || "",
        phone: row.phone || "",
      }))
      .filter((item) => item.name && item.match && item.hours);
    if (newHours.length > 0) {
      STORE_HOURS = newHours;
    }
  } catch (error) {
    console.warn("Unable to load Store Hours sheet:", error);
  }
}

const FALLBACK_ANSWER =
  "I don't have an exact answer for that yet — call us at (868) 640-5991 or check our locations page and our team can help.";

function findAnswer(rawQuery) {
  const q = rawQuery.toLowerCase();

  const store = STORE_HOURS.find((s) => q.includes(s.match));
  if (store && /hour|open|close|time/.test(q)) {
    return `${store.name} is open ${store.hours}. You can reach that store at ${store.phone}.`;
  }

  let best = null;
  let bestScore = 0;
  FAQ_DATA.forEach((entry) => {
    const score = entry.keywords.reduce(
      (total, k) => (q.includes(k) ? total + 1 : total),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  if (best) return best.answer;
  if (store)
    return `${store.name} is open ${store.hours}. You can reach that store at ${store.phone}.`;
  return FALLBACK_ANSWER;
}

function scrollChatToBottom() {
  faqChat.scrollTop = faqChat.scrollHeight;
}

function typeText(el, text, speed = 16) {
  let i = 0;
  (function step() {
    el.textContent = text.slice(0, i);
    scrollChatToBottom();
    if (i <= text.length) {
      i += 1;
      setTimeout(step, speed);
    }
  })();
}

function appendUserMessage(text) {
  const userMsg = document.createElement("div");
  userMsg.className = "msg msg-user";
  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = text;
  userMsg.appendChild(bubble);
  faqChat.appendChild(userMsg);
  scrollChatToBottom();
}

function appendTypingIndicator() {
  const typingMsg = document.createElement("div");
  typingMsg.className = "msg msg-agent";
  typingMsg.innerHTML = `<img class="msg-avatar" src="${AGENT_AVATAR}" alt=""><div class="msg-bubble msg-typing"><span></span><span></span><span></span></div>`;
  faqChat.appendChild(typingMsg);
  scrollChatToBottom();
  return typingMsg;
}

faqForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = faqInput.value.trim();
  if (!text) return;

  faqInput.disabled = true;
  appendUserMessage(text);
  const typingMsg = appendTypingIndicator();

  setTimeout(() => {
    typingMsg.remove();
    const agentMsg = document.createElement("div");
    agentMsg.className = "msg msg-agent";
    agentMsg.innerHTML = `<img class="msg-avatar" src="${AGENT_AVATAR}" alt=""><div class="msg-bubble"></div>`;
    faqChat.appendChild(agentMsg);
    typeText(agentMsg.querySelector(".msg-bubble"), findAnswer(text));
    faqInput.disabled = false;
    faqInput.value = "";
    faqInput.focus();
  }, 900);
});

/* ============================================================
   GOOGLE SIGN-IN via Supabase Auth
   Requires the Google provider to be enabled in your Supabase
   project (Authentication > Providers) with a Google OAuth
   client, and this site's URL added under Authentication >
   URL Configuration (Site URL / Redirect URLs).
   ============================================================ */

const SUPABASE_URL = "https://egntuecesspphxkfvokd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbnR1ZWNlc3NwcGh4a2Z2b2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MTg1MDcsImV4cCI6MjEwMjA5NDUwN30.XqxF5N39degzluxcD1VQrhmxqL7WX1aGCuSWLPPUDTc";

const supabaseClient = window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

async function refreshAuthUI() {
  if (!supabaseClient) return;
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  document.querySelectorAll(".auth-slot").forEach((slot) => {
    if (session?.user) {
      const meta = session.user.user_metadata || {};
      const name =
        meta.full_name || meta.name || session.user.email || "Account";
      const avatar = meta.avatar_url || meta.picture || "";
      slot.innerHTML = `<button class="user-chip" type="button">${
        avatar ? `<img class="user-avatar" src="${avatar}" alt="">` : ""
      }<span>${name.split(" ")[0]}</span></button>`;
      slot.querySelector(".user-chip").addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        refreshAuthUI();
      });
    } else {
      slot.innerHTML = `<button class="google-btn" type="button"><img src="assets/Google.png" alt="Google" /><span>Sign in</span></button>`;
      slot.querySelector(".google-btn").addEventListener("click", () => {
        supabaseClient.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.href },
        });
      });
    }
  });
}

supabaseClient?.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();
loadFaqFromSheet().catch((error) =>
  console.warn("FAQ sheet load failed:", error),
);

// Load gallery images from Supabase storage bucket named 'Galley'
async function loadGalleryFromSupabase() {
  if (!supabaseClient) return;
  const container = document.getElementById("supabaseGallery");
  if (!container) return;
  container.innerHTML = "<p>Loading…</p>";
  try {
    const { data, error } = await supabaseClient.storage
      .from("Galley")
      .list("", { limit: 200 });
    if (error) throw error;
    if (!data || data.length === 0) {
      container.innerHTML = "<p>No images found in the gallery.</p>";
      return;
    }
    container.innerHTML = "";
    for (const f of data) {
      if (f.name.endsWith("/")) continue;
      const { data: urlData } = supabaseClient.storage
        .from("Galley")
        .getPublicUrl(f.name);
      const card = document.createElement("article");
      card.className = "gallery-card";
      const art = document.createElement("div");
      art.className = "card-art";
      const img = document.createElement("img");
      img.src = urlData.publicUrl;
      img.alt = f.name;
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      art.appendChild(img);
      const caption = document.createElement("div");
      caption.className = "card-caption";
      caption.innerHTML = `<strong>${f.name.replace(/\.[^/.]+$/, "")}</strong><span></span>`;
      card.appendChild(art);
      card.appendChild(caption);
      container.appendChild(card);
    }
  } catch (err) {
    console.error("Gallery load error", err);
    container.innerHTML = "<p>Unable to load gallery.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadGalleryFromSupabase();
});
