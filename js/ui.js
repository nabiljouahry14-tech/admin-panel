// js/ui.js
// js/ui.js
const ICONS = {
  dashboard: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/>
      <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/>
      <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor"/>
      <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/>
    </svg>
  `,
  projects: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="4" rx="2" fill="currentColor"/>
      <rect x="3" y="10" width="18" height="4" rx="2" fill="currentColor"/>
      <rect x="3" y="16" width="18" height="4" rx="2" fill="currentColor"/>
    </svg>
  `,
  refresh: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 4v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  edit: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4l10-10-4-4L4 16v4z" fill="currentColor"/>
    </svg>
  `,
  delete: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 7h12M9 7v10m6-10v10M4 7h16l-1 13H5L4 7z" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
};

function setActiveNav() {
  const path = location.pathname.split("/").pop() || "dashboard.html";
  document.querySelectorAll("[data-nav]").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

function mountLayout({ title, subtitle }) {
  document.body.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand">
          <div class="logoBox logoText">NJ</div>
          <div>
            <h1>Admin Panel</h1>
            <div class="sub">Portfolio Backoffice</div>
          </div>
        </div>

        <nav class="nav">
          <a data-nav href="dashboard.html">
            <span class="icon">${ICONS.dashboard}</span>
            Dashboard
          </a>

          <a data-nav href="projects.html">
            <span class="icon">${ICONS.projects}</span>
            Projects
          </a>

        </nav>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="title">
            <h2>${title}</h2>
            <p>${subtitle}</p>
          </div>
          <div class="actions">
            <span class="pill" id="who">Loading...</span>
            <button class="btn" id="logoutBtn">Logout</button>
          </div>
        </div>

        <div id="page"></div>
      </main>
    </div>
  `;

  setActiveNav();
}
