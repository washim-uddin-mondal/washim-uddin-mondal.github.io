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

const dataPaths = {
  achievements: "data/achievements-data.json",
  books: "data/book-data.json",
  conferences: "data/conference-data.json",
  currentMembers: "data/current-members.json",
  journals: "data/journal-data.json",
  openings: "data/project-openings.json",
  teachingRecognition: "data/teaching/teaching-recognition/teaching-recognition.json",
  taughtCourses: "data/teaching/courses/taught-courses.json",
  probabilityStochasticProcessesLectures:
    "data/teaching/courses/probability-stochastic-processes/probability-stochastic-processes-lectures.json",
  probabilityStochasticProcessesPracticeSets:
    "data/teaching/courses/probability-stochastic-processes/probability-stochastic-processes-practice-sets.json",
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

function normalizeLocalDataHref(href) {
  const raw = String(href ?? "").trim();
  if (!raw) {
    return "";
  }

  if (/^https?:\/\//i.test(raw) || raw.startsWith("#")) {
    return raw;
  }

  const dataMatch = raw.match(/^\.?\.?\/?data\/(.+)$/i);
  if (dataMatch) {
    return resolveFromRoot(`data/${dataMatch[1]}`);
  }

  const cleaned = raw.replace(/^\.?\//, "");
  return resolveFromRoot(`data/${cleaned}`);
}

function normalizeTeachingDataHref(href) {
  const raw = String(href ?? "").trim();
  if (!raw) {
    return "";
  }

  if (/^https?:\/\//i.test(raw) || raw.startsWith("#")) {
    return raw;
  }

  const teachingMatch = raw.match(/^\.?\.?\/?data\/teaching\/(.+)$/i);
  if (teachingMatch) {
    return resolveFromRoot(`data/teaching/${teachingMatch[1]}`);
  }

  const cleaned = raw.replace(/^\.?\//, "");
  return resolveFromRoot(`data/teaching/${cleaned}`);
}

function normalizeDataLinks(text) {
  return String(text).replaceAll("../Data/", "../data/").replaceAll("./Data/", "./data/");
}

function classifyActionLink(href, text) {
  const normalizedHref = href.toLowerCase();
  const normalizedText = text.toLowerCase();
  if (normalizedHref.endsWith(".pdf") || normalizedText.includes("pdf")) {
    return "pdf";
  }
  if (normalizedHref.startsWith("http://") || normalizedHref.startsWith("https://") || normalizedText.includes("web")) {
    return "web";
  }
  return "";
}

function iconSvg(type) {
  if (type === "pdf") {
    return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z\"></path><path d=\"M14 2v6h6\"></path></svg>";
  }
  return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M14 4h6v6\"></path><path d=\"M20 4 10 14\"></path><path d=\"M10 5H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-3\"></path></svg>";
}

function iconActionLink(type, href) {
  const label = type === "pdf" ? "Open PDF" : "Open web link";
  return (
    "<a class=\"icon-action-btn icon-action-" +
    type +
    "\" href=\"" +
    escapeHtml(href) +
    "\" target=\"_blank\" rel=\"noreferrer\" aria-label=\"" +
    label +
    "\" title=\"" +
    label +
    "\">" +
    iconSvg(type) +
    "</a>"
  );
}

function extractContentAndActions(htmlText) {
  const holder = document.createElement("div");
  holder.innerHTML = normalizeDataLinks(htmlText);
  const anchors = Array.from(holder.querySelectorAll("a[href]"));
  const actions = {
    pdf: "",
    web: "",
  };

  anchors.forEach((anchor) => {
    const href = normalizeLocalDataHref(anchor.getAttribute("href"));
    const type = classifyActionLink(href, anchor.textContent || "");
    if (!href || !type || actions[type]) {
      return;
    }
    actions[type] = href;
    anchor.remove();
  });

  const contentHtml = holder.innerHTML.replace(/\s+/g, " ").trim();
  return { contentHtml, actions };
}

function actionButtonsHtml(actions) {
  const links = [];
  if (actions.pdf) {
    links.push(iconActionLink("pdf", actions.pdf));
  }
  if (actions.web) {
    links.push(iconActionLink("web", actions.web));
  }
  if (links.length === 0) {
    return "";
  }
  return "<span class=\"cell-actions\" aria-label=\"Related links\">" + links.join("") + "</span>";
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
    let html = "<thead><tr><th>Semester</th><th>Course No.</th><th>Course Title</th><th>Teaching Role</th><th>Recognition</th></tr></thead><tbody>";
    teaching.forEach((item) => {
      const recognitionActions = item.pdfHref ? actionButtonsHtml({ pdf: item.pdfHref, web: "" }) : "";
      html +=
        "<tr><td data-label=\"Semester\" class=\"teaching-recognition-cell\"><div class=\"teaching-recognition-entry\">" +
        "<span class=\"semester-badge\">" +
        escapeHtml(item.semester) +
        "</span></div></td><td data-label=\"Course No.\" class=\"teaching-recognition-cell\"><div class=\"award-entry teaching-recognition-entry\">" +
        escapeHtml(item.courseNo) +
        "</div></td><td data-label=\"Course Title\" class=\"teaching-recognition-cell\"><div class=\"award-entry teaching-recognition-entry\">" +
        escapeHtml(item.courseTitle) +
        "</div></td><td data-label=\"Teaching Role\" class=\"teaching-recognition-cell\"><div class=\"award-entry teaching-recognition-entry\">" +
        escapeHtml(item.teachingRole) +
        "</div></td><td data-label=\"Recognition\" class=\"teaching-recognition-cell teaching-recognition-link-cell\"><div class=\"award-entry teaching-recognition-entry teaching-recognition-link-entry\">" +
        recognitionActions +
        "</div></td></tr>";
    });
    html += "</tbody>";
    teachingTable.innerHTML = html;
  }
}

function renderTeachingCoursesTable(courses) {
  const coursesTable = document.getElementById("teachingCoursesTable");
  if (!coursesTable) {
    return;
  }

  let html = "<thead><tr><th>Course Title</th><th>Course Page</th></tr></thead><tbody>";
  courses.forEach((item) => {
    const courseLink = actionButtonsHtml({ pdf: "", web: item.coursePage });

    html +=
      "<tr><td data-label=\"Course Title\" class=\"course-title-cell\"><div class=\"award-entry course-title-entry\">" +
      escapeHtml(item.title) +
      "</div></td><td data-label=\"Course Page\" class=\"course-link-cell\"><div class=\"award-entry course-link-entry\">" +
      courseLink +
      "</div></td></tr>";
  });
  html += "</tbody>";
  coursesTable.innerHTML = html;
}

function renderCourseMaterialsTable(materials) {
  const materialsTable = document.getElementById("courseMaterialsTable");
  if (!materialsTable) {
    return;
  }

  let html = "<thead><tr><th>Lecture No.</th><th>Lecture Title</th><th>Course Material</th></tr></thead><tbody>";
  materials.forEach((item) => {
    const materialHtml = item.pdfHref
      ? "<div class=\"award-entry course-material-entry\">" + actionButtonsHtml({ pdf: item.pdfHref, web: "" }) + "</div>"
      : "<div class=\"award-entry course-material-entry\">PDF pending</div>";

    html +=
      "<tr><td data-label=\"Lecture No.\" class=\"lecture-no-cell\"><div class=\"award-entry lecture-no-entry\">" +
      escapeHtml(item.number) +
      "</div></td><td data-label=\"Lecture Title\" class=\"lecture-title-cell\"><div class=\"award-entry lecture-title-entry\">" +
      escapeHtml(item.title) +
      "</div></td><td data-label=\"Course Material\" class=\"course-material-cell\">" +
      materialHtml +
      "</td></tr>";
  });
  html += "</tbody>";
  materialsTable.innerHTML = html;
}

function renderPracticeSetsTable(sets) {
  const practiceSetsTable = document.getElementById("practiceSetsTable");
  if (!practiceSetsTable) {
    return;
  }

  let html = "<thead><tr><th>P. Set No.</th><th>Practice Question Set Contents</th><th>Course Material</th></tr></thead><tbody>";
  sets.forEach((item) => {
    const materialHtml = item.pdfHref
      ? "<div class=\"award-entry course-material-entry\">" + actionButtonsHtml({ pdf: item.pdfHref, web: "" }) + "</div>"
      : "<div class=\"award-entry course-material-entry\">PDF pending</div>";

    html +=
      "<tr><td data-label=\"Practice Set No.\" class=\"lecture-no-cell\"><div class=\"award-entry lecture-no-entry\">" +
      escapeHtml(item.number) +
      "</div></td><td data-label=\"Contents\" class=\"lecture-title-cell\"><div class=\"award-entry lecture-title-entry\">" +
      escapeHtml(item.contents) +
      "</div></td><td data-label=\"Course Material\" class=\"course-material-cell\">" +
      materialHtml +
      "</td></tr>";
  });
  html += "</tbody>";
  practiceSetsTable.innerHTML = html;
}

function renderOpeningsTable(openings) {
  const openingsTable = document.getElementById("openingsTable");
  if (!openingsTable) {
    return;
  }

  let html = "<thead><tr><th>Position</th><th>Deadline</th><th>Sponsor</th><th>Details</th></tr></thead><tbody>";
  openings.forEach((item) => {
    const parsed = extractContentAndActions(item.details);
    const detailsHtml = parsed.contentHtml || "";
    const detailsContent = detailsHtml ? "<span class=\"details-text\">" + detailsHtml + "</span>" : "";
    html +=
      "<tr><td data-label=\"Position\"><div class=\"member-degree\">" +
      escapeHtml(item.position) +
      "</div></td><td data-label=\"Deadline\"><span class=\"year-badge\">" +
      escapeHtml(item.deadline) +
      "</span></td><td data-label=\"Sponsor\"><div class=\"award-entry\">" +
      escapeHtml(item.sponsor) +
      "</div></td><td data-label=\"Details\" class=\"details-cell\"><div class=\"award-entry details-entry\">" +
      detailsContent +
      actionButtonsHtml(parsed.actions) +
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
      fetch(resolveFromRoot(dataPaths.achievements)).then((response) => response.json()),
      fetch(resolveFromRoot(dataPaths.teachingRecognition)).then((response) => response.json()),
    ]);

    const normalizedAchievements = achievementsRows
      .map((item) => ({
        year: String(item.Year ?? "").trim(),
        award: String(item.Award ?? "").replaceAll("|", " - ").trim(),
      }))
      .sort((a, b) => Number.parseInt(b.year, 10) - Number.parseInt(a.year, 10));

    const normalizedTeaching = teachingRows.map((item) => ({
      semester: String(item.Semester ?? "").trim(),
      courseNo: String(item["Course No."] ?? "").trim(),
      courseTitle: String(item["Course Title"] ?? "").trim(),
      teachingRole: String(item["Teaching Role"] ?? "").trim(),
      pdfHref: item["PDF Link"]
        ? resolveFromRoot(
          `data/teaching/teaching-recognition/recognition-files/${String(item["PDF Link"]).trim()}`
        )
        : "",
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
    const rows = await fetch(resolveFromRoot(dataPaths.currentMembers)).then((response) => response.json());
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
    const rows = await fetch(resolveFromRoot(dataPaths.openings)).then((response) => response.json());
    const normalized = rows.map((item) => ({
      position: String(item.Position ?? "").trim(),
      deadline: String(item.Deadline ?? "").trim(),
      sponsor: String(item.Sponsor ?? "").trim(),
      details: normalizeDataLinks(item.Details ?? "").trim(),
    }));
    renderOpeningsTable(normalized);
  } catch (error) {
    const openingsTable = document.getElementById("openingsTable");
    if (openingsTable) {
      openingsTable.innerHTML = "<tbody><tr><td>Could not load openings data.</td></tr></tbody>";
    }
  }
}

async function loadTeachingCoursesTable() {
  try {
    const rows = await fetch(resolveFromRoot(dataPaths.taughtCourses)).then((response) => response.json());
    const normalized = rows.map((item) => ({
      title: String(item["Course Title"] ?? "").trim(),
      coursePage: String(item["Course Page"] ?? "").trim(),
    }));
    renderTeachingCoursesTable(normalized);
  } catch (error) {
    const coursesTable = document.getElementById("teachingCoursesTable");
    if (coursesTable) {
      coursesTable.innerHTML = "<tbody><tr><td>Could not load taught courses data.</td></tr></tbody>";
    }
  }
}

async function loadCourseMaterialsTable() {
  try {
    const rows = await fetch(resolveFromRoot(dataPaths.probabilityStochasticProcessesLectures)).then((response) => response.json());
    const normalized = rows.map((item, index) => ({
      number: String(item["Lecture No."] ?? index + 1).trim(),
      title: String(item["Lecture Title"] ?? "").trim(),
      pdfHref: normalizeTeachingDataHref(item["PDF Link"] ?? ""),
    }));
    renderCourseMaterialsTable(normalized);
  } catch (error) {
    const materialsTable = document.getElementById("courseMaterialsTable");
    if (materialsTable) {
      materialsTable.innerHTML = "<tbody><tr><td>Could not load course material data.</td></tr></tbody>";
    }
  }
}

async function loadPracticeSetsTable() {
  try {
    const rows = await fetch(resolveFromRoot(dataPaths.probabilityStochasticProcessesPracticeSets)).then((response) => response.json());
    const normalized = rows.map((item, index) => ({
      number: String(item["Practice Set No."] ?? index + 1).trim(),
      contents: String(item.Contents ?? "").trim(),
      pdfHref: normalizeTeachingDataHref(item["PDF Link"] ?? ""),
    }));
    renderPracticeSetsTable(normalized);
  } catch (error) {
    const practiceSetsTable = document.getElementById("practiceSetsTable");
    if (practiceSetsTable) {
      practiceSetsTable.innerHTML = "<tbody><tr><td>Could not load practice set data.</td></tr></tbody>";
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
      fetch(resolveFromRoot(dataPaths.journals)).then((response) => response.json()),
      fetch(resolveFromRoot(dataPaths.conferences)).then((response) => response.json()),
      fetch(resolveFromRoot(dataPaths.books)).then((response) => response.json()),
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
loadTeachingCoursesTable();
loadCourseMaterialsTable();
loadPracticeSetsTable();
loadMembersTable();
loadOpeningsTable();
setupMobileNav();
setupTimelineInteractions();
