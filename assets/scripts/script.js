const dateEl = document.getElementById("updatedDate");
if (dateEl) {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealEls.forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
  observer.observe(el);
});

function setupMobileNav() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) {
    return;
  }

  const closeMenu = () => {
    toggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (!nav.contains(target) && !toggle.contains(target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) {
      closeMenu();
    }
  });
}

function setupTimelineInteractions() {
  const steps = Array.from(document.querySelectorAll(".timeline-step"));
  const panels = Array.from(document.querySelectorAll(".timeline-panel"));
  if (steps.length === 0 || panels.length === 0) {
    return;
  }

  const activateStep = (targetStep) => {
    const panelId = targetStep.dataset.panel;
    if (!panelId) {
      return;
    }

    steps.forEach((step) => {
      const isActive = step === targetStep;
      step.classList.toggle("is-active", isActive);
      step.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach((panel) => {
      const isActive = panel.id === panelId;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  };

  steps.forEach((step, index) => {
    step.addEventListener("click", () => activateStep(step));
    step.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + direction + steps.length) % steps.length;
      const nextStep = steps[nextIndex];
      nextStep.focus();
      activateStep(nextStep);
    });
  });
}

const publicationState = {
  all: [],
  currentFilter: "all",
};

const isPagesPath = /\/pages\/[^/]+\.html?$/.test(window.location.pathname);
const basePrefix = isPagesPath ? "../" : "";

function resolveFromRoot(relativePath) {
  return `${basePrefix}${relativePath}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderAwardsTables(achievements, teaching) {
  const achievementTable = document.getElementById("achievementTable");
  if (achievementTable) {
    let html = "<thead><tr><th>Year</th><th>Award</th></tr></thead><tbody>";
    achievements.forEach((item) => {
      html +=
        "<tr><td data-label=\"Year\"><span class=\"year-badge\">" +
        escapeHtml(item.year) +
        "</span></td><td data-label=\"Award\"><div class=\"award-entry\">" +
        escapeHtml(item.award) +
        "</div></td></tr>";
    });
    html += "</tbody>";
    achievementTable.innerHTML = html;
  }

  const teachingTable = document.getElementById("teachingRecognitionTable");
  if (teachingTable) {
    let html = "<thead><tr><th>Semester</th><th>Teaching Recognition</th></tr></thead><tbody>";
    teaching.forEach((item) => {
      html +=
        "<tr><td data-label=\"Semester\"><span class=\"semester-badge\">" +
        escapeHtml(item.semester) +
        "</span></td><td data-label=\"Teaching Recognition\"><div class=\"award-entry\">" +
        item.recognition +
        "</div></td></tr>";
    });
    html += "</tbody>";
    teachingTable.innerHTML = html;
  }
}

function renderOpeningsTable(openings) {
  const openingsTable = document.getElementById("openingsTable");
  if (!openingsTable) {
    return;
  }

  let html = "<thead><tr><th>Position</th><th>Deadline</th><th>Sponsor</th><th>Details</th></tr></thead><tbody>";
  openings.forEach((item) => {
    html +=
      "<tr><td data-label=\"Position\"><div class=\"member-degree\">" +
      escapeHtml(item.position) +
      "</div></td><td data-label=\"Deadline\"><span class=\"year-badge\">" +
      escapeHtml(item.deadline) +
      "</span></td><td data-label=\"Sponsor\"><div class=\"award-entry\">" +
      escapeHtml(item.sponsor) +
      "</div></td><td data-label=\"Details\"><div class=\"award-entry\">" +
      item.details +
      "</div></td></tr>";
  });
  html += "</tbody>";
  openingsTable.innerHTML = html;
}

function extractTextFromHtml(htmlText) {
  const holder = document.createElement("div");
  holder.innerHTML = htmlText;
  return (holder.textContent || "").trim();
}

function extractLinkedinFromHtml(htmlText) {
  const holder = document.createElement("div");
  holder.innerHTML = htmlText;
  const anchor = holder.querySelector("a[href]");
  if (!anchor) {
    return "";
  }
  const href = anchor.getAttribute("href") || "";
  return href.includes("linkedin.com") ? href : "";
}

function initialsFromName(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderMembersCards(members) {
  const membersGrid = document.getElementById("membersGrid");
  if (!membersGrid) {
    return;
  }

  let html = "";
  members.forEach((item) => {
    const displayName = extractTextFromHtml(item.memberHtml);
    const linkedinUrl = extractLinkedinFromHtml(item.memberHtml);
    const initials = initialsFromName(displayName);
    const resolvedPhotoPath = item.photoPath ? resolveFromRoot(item.photoPath) : "";
    const memberPhoto = item.photoPath
      ? `<img class="member-photo" src="${escapeHtml(resolvedPhotoPath)}" alt="${escapeHtml(displayName)}" loading="lazy" />`
      : `<div class="member-photo-placeholder">${escapeHtml(initials)}</div>`;
    const linkedinBadge = linkedinUrl
      ? `<a class="member-linkedin" href="${escapeHtml(linkedinUrl)}" target="_blank" rel="noreferrer" aria-label="LinkedIn profile of ${escapeHtml(displayName)}">
           <img src="${escapeHtml(resolveFromRoot("assets/images/linkedin-logo.png"))}" alt="LinkedIn" />
         </a>`
      : "";

    html +=
      `<article class="member-card card">
        <div class="member-photo-wrap">${memberPhoto}</div>
        <div class="member-content">
          <div class="member-name">
            <span>${escapeHtml(displayName)}</span>
            ${linkedinBadge}
          </div>
          <div class="member-degree">${escapeHtml(item.degree)}</div>
          <div class="member-area">${escapeHtml(item.researchArea)}</div>
        </div>
      </article>`;
  });
  membersGrid.innerHTML = html;
}

async function loadAwardsTables() {
  try {
    const [achievementsRows, teachingRows] = await Promise.all([
      fetch(resolveFromRoot("data/achievementsData.json")).then((response) => response.json()),
      fetch(resolveFromRoot("data/teachingRecognition.json")).then((response) => response.json()),
    ]);

    const normalizedAchievements = achievementsRows
      .map((item) => ({
        year: String(item.Year ?? "").trim(),
        award: String(item.Award ?? "").replaceAll("|", " - ").trim(),
      }))
      .sort((a, b) => Number.parseInt(b.year, 10) - Number.parseInt(a.year, 10));

    const normalizedTeaching = teachingRows.map((item) => ({
      semester: String(item.Semester ?? "").trim(),
      recognition: String(item["Teaching Recognition"] ?? "")
        .replaceAll("../Data/", "https://home.iitk.ac.in/~wmondal/Data/")
        .trim(),
    }));

    renderAwardsTables(normalizedAchievements, normalizedTeaching);
  } catch (error) {
    const achievementTable = document.getElementById("achievementTable");
    if (achievementTable) {
      achievementTable.innerHTML = "<tbody><tr><td>Could not load awards data.</td></tr></tbody>";
    }
    const teachingTable = document.getElementById("teachingRecognitionTable");
    if (teachingTable) {
      teachingTable.innerHTML = "<tbody><tr><td>Could not load teaching recognition data.</td></tr></tbody>";
    }
  }
}

async function loadMembersTable() {
  try {
    const rows = await fetch(resolveFromRoot("data/currentMembers.json")).then((response) => response.json());
    const normalized = rows.map((item) => ({
      memberHtml: String(item.Members ?? "").trim(),
      degree: String(item.Degree ?? "").trim(),
      researchArea: String(item["Research Area"] ?? "").trim(),
      photoPath: item.Photo ? String(item.Photo).trim() : "",
    }));
    renderMembersCards(normalized);
  } catch (error) {
    const membersGrid = document.getElementById("membersGrid");
    if (membersGrid) {
      membersGrid.innerHTML = "<p>Could not load current members data.</p>";
    }
  }
}

async function loadOpeningsTable() {
  try {
    const rows = await fetch(resolveFromRoot("data/projectOpenings.json")).then((response) => response.json());
    const normalized = rows.map((item) => ({
      position: String(item.Position ?? "").trim(),
      deadline: String(item.Deadline ?? "").trim(),
      sponsor: String(item.Sponsor ?? "").trim(),
      details: String(item.Details ?? "").replaceAll("../Data/", "https://home.iitk.ac.in/~wmondal/Data/").trim(),
    }));
    renderOpeningsTable(normalized);
  } catch (error) {
    const openingsTable = document.getElementById("openingsTable");
    if (openingsTable) {
      openingsTable.innerHTML = "<tbody><tr><td>Could not load openings data.</td></tr></tbody>";
    }
  }
}

function normalizePublications(rows, type) {
  return rows.map((row) => {
    const yearNum = Number.parseInt(row.Year, 10);
    const url = typeof row.URL === "string" ? row.URL.trim() : "";

    return {
      type,
      year: Number.isFinite(yearNum) ? yearNum : 0,
      yearText: row.Year || "",
      authors: row.Authors || "",
      venue: row["Journal/Conference"] || "",
      title: row.Title || "",
      url: url.startsWith("http") ? url : "#",
    };
  });
}

function renderAllPublicationsTable() {
  const table = document.getElementById("allPublicationsTable");
  if (!table) {
    return;
  }

  const filtered = publicationState.currentFilter === "all"
    ? publicationState.all
    : publicationState.all.filter((item) => item.type === publicationState.currentFilter);

  const sorted = [...filtered].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  let html = "<thead><tr><th>#</th><th>Year</th><th>Type</th><th>Publication</th></tr></thead><tbody>";
  sorted.forEach((item, index) => {
    const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    const titleHtml =
      "<a class=\"pub-title-link\" href=\"" +
      item.url +
      "\" target=\"_blank\" rel=\"noreferrer\">" +
      escapeHtml(item.title) +
      "</a>";

    const publicationHtml = `
      <div class="pub-entry">
        <div class="pub-entry-title">${titleHtml}</div>
        <div class="pub-entry-authors">${escapeHtml(item.authors)}</div>
        <div class="pub-entry-venue"><i>${escapeHtml(item.venue)}</i></div>
      </div>
    `;

    html +=
      "<tr><td data-label=\"#\">[" +
      (index + 1) +
      "]</td><td data-label=\"Year\"><span class=\"year-badge\">" +
      escapeHtml(item.yearText) +
      "</span></td><td data-label=\"Type\"><span class=\"type-badge type-" +
      escapeHtml(item.type) +
      "\">" +
      escapeHtml(typeLabel) +
      "</span></td><td data-label=\"Publication\">" +
      publicationHtml +
      "</td></tr>";
  });
  html += "</tbody>";

  table.innerHTML = html;
}

function setupPublicationFilters() {
  const filterWrap = document.getElementById("pubFilter");
  if (!filterWrap) {
    return;
  }

  filterWrap.querySelectorAll("button[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      publicationState.currentFilter = button.dataset.filter || "all";
      filterWrap.querySelectorAll("button").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      renderAllPublicationsTable();
    });
  });
}

async function loadPublicationTables() {
  try {
    const [journalRows, conferenceRows, bookRows] = await Promise.all([
      fetch(resolveFromRoot("data/journalData.json")).then((response) => response.json()),
      fetch(resolveFromRoot("data/conferenceData.json")).then((response) => response.json()),
      fetch(resolveFromRoot("data/bookData.json")).then((response) => response.json()),
    ]);

    const journals = normalizePublications(journalRows, "journal");
    const conferences = normalizePublications(conferenceRows, "conference");
    const books = normalizePublications(bookRows, "book");

    publicationState.all = [...journals, ...conferences, ...books];

    setupPublicationFilters();
    renderAllPublicationsTable();
  } catch (error) {
    const table = document.getElementById("allPublicationsTable");
    if (table) {
      table.innerHTML =
        "<tbody><tr><td>Could not load publication data. Run the site via a local server (e.g., python3 -m http.server 8000).</td></tr></tbody>";
    }
  }
}

loadPublicationTables();
loadAwardsTables();
loadMembersTable();
loadOpeningsTable();
setupMobileNav();
setupTimelineInteractions();
