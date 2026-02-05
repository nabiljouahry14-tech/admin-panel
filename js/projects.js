// js/projects.js
let IS_DEMO = false;

async function requireAuth() {
  const { data } = await window.sb.auth.getSession();
  if (!data.session) window.location.href = "login.html";
  return data.session;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidUrl(url) {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/* ================= DEMO FUN (NEW) ================= */
const DEMO_MESSAGES = {
  edit: [
    "Ay 🙂 Demo mode is view-only. Editing is disabled.",
    "Nice try 😄 You can explore, but you can’t edit in demo mode.",
    "Demo users can’t modify projects 👀"
  ],
  del: [
    "Whoa 😄 Don’t mess with my projects — demo mode is protected.",
    "Ay ay… hands off 😅 Delete is disabled in demo mode.",
    "Demo mode says no 🚫 deleting is locked."
  ],
  save: [
    "Nope 🙂 Saving changes is disabled in demo mode.",
    "Almost 😄 Demo users can’t save edits.",
    "Demo mode = look, don’t touch 👀"
  ]
};

function randDemoMsg(type) {
  const arr = DEMO_MESSAGES[type] || ["Demo mode restriction."];
  return arr[Math.floor(Math.random() * arr.length)];
}

function openDemoNotice(message) {
  const overlay = document.getElementById("demoOverlay");
  const msgEl = document.getElementById("demoMsg");
  if (!overlay || !msgEl) return;

  msgEl.textContent = message;
  overlay.style.display = "flex";
}

function closeDemoNotice() {
  const overlay = document.getElementById("demoOverlay");
  if (overlay) overlay.style.display = "none";
}
/* ================================================== */

function renderPageShell() {
  mountLayout({
    title: "Projects",
    subtitle: "Manage the projects shown on your portfolio",
  });

  document.getElementById("page").innerHTML = `
    <div class="grid">
      <div class="card" style="grid-column: span 12;">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
          <div>
            <div style="font-size:16px;">Create Project</div>
            <div class="muted" style="font-size:13px;margin-top:4px;">
              Here You can add as much projects as You want (even in demo mode) . Stored in Supabase.
            </div>
          </div>
          <span class="pill" id="statusPill">Ready</span>
        </div>

        <div style="height:14px;"></div>

        <div class="grid" style="gap:12px;">
          <div style="grid-column: span 6;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Title *</div>
            <input id="title" class="inputLike" placeholder="e.g., Leo AI" />
          </div>

          <div style="grid-column: span 6;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Status</div>
            <select id="status" class="inputLike">
              <option value="active">active</option>
              <option value="building">building</option>
              <option value="archived">archived</option>
            </select>
          </div>

          <div style="grid-column: span 12;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Link (optional)</div>
            <input id="link" class="inputLike" placeholder="https://..." />
            <div class="muted" style="font-size:12px;margin-top:6px;" id="linkHint"></div>
          </div>

          <div style="grid-column: span 12;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Description (optional)</div>
            <textarea id="description" class="inputLike" rows="3" placeholder="Short summary..."></textarea>
          </div>

          <div style="grid-column: span 12; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button class="btn" id="createBtn">Create</button>
            <button class="btn" id="clearBtn">Clear</button>
            <span class="muted" style="font-size:13px;" id="msg"></span>
          </div>
        </div>
      </div>

      <div class="card" style="grid-column: span 12;">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
          <div>
            <div style="font-size:16px;">
              All Projects
              ${IS_DEMO ? `<span class="pill" style="margin-left:8px;">Demo mode</span>` : ``}
            </div>
            <div class="muted" style="font-size:13px;margin-top:4px;">
              Search, view, edit, and delete.
            </div>
          </div>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; width:min(520px, 100%);">
            <input id="search" class="inputLike" placeholder="Search title..." style="flex:1; min-width:220px;" />
            <button class="btn" id="refreshBtn" style="white-space:nowrap;">Refresh</button>
          </div>
        </div>

        <div style="height:10px;"></div>

        <div style="overflow:auto; border-radius:14px; border:1px solid var(--line);">
          <table class="tablePro">
            <thead>
              <tr>
                <th style="min-width:220px;">Title</th>
                <th>Status</th>
                <th style="min-width:260px;">Link</th>
                <th style="min-width:200px;">Created</th>
                <th style="width:180px;">Action</th>
              </tr>
            </thead>
            <tbody id="tbody"></tbody>
          </table>
        </div>

        <div class="muted" style="font-size:13px;margin-top:10px;" id="countLine"></div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modalOverlay" id="editOverlay">
      <div class="modal">
        <div class="modalHeader">
          <h3>Edit Project</h3>
          <button class="xBtn" id="closeEdit">✕</button>
        </div>

        <div class="grid" style="gap:12px;">
          <div style="grid-column: span 6;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Title *</div>
            <input id="e_title" class="inputLike" />
          </div>

          <div style="grid-column: span 6;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Status</div>
            <select id="e_status" class="inputLike">
              <option value="active">active</option>
              <option value="building">building</option>
              <option value="archived">archived</option>
            </select>
          </div>

          <div style="grid-column: span 12;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Link (optional)</div>
            <input id="e_link" class="inputLike" placeholder="https://..." />
            <div class="muted" style="font-size:12px;margin-top:6px;" id="e_linkHint"></div>
          </div>

          <div style="grid-column: span 12;">
            <div class="muted" style="font-size:12px;margin-bottom:6px;">Description (optional)</div>
            <textarea id="e_description" class="inputLike" rows="3"></textarea>
          </div>

          <div style="grid-column: span 12; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button class="btn" id="saveEdit">Save changes</button>
            <button class="btn" id="cancelEdit">Cancel</button>
            <span class="muted" style="font-size:13px;" id="editMsg"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Notice Modal (NEW) -->
    <div class="modalOverlay" id="demoOverlay">
      <div class="modal" style="max-width:420px;">
        <div class="modalHeader">
          <h3>Demo Mode</h3>
          <button class="xBtn" id="closeDemo">✕</button>
        </div>

        <div id="demoMsg" class="muted" style="font-size:14px;line-height:1.6;">
          Demo message
        </div>

        <div style="height:14px;"></div>

        <button class="btn" id="demoOk">Got it</button>
      </div>
    </div>
  `;
  
}

/* --- local UI styles --- */
function injectLocalStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .inputLike{
      width:100%;
      padding:10px 12px;
      border-radius:12px;
      border:1px solid var(--line);
      background: rgba(255,255,255,.03);
      color: var(--text);
      outline:none;
    }
    .inputLike:focus{
      border-color: rgba(110,168,255,.35);
      box-shadow: 0 0 0 4px rgba(110,168,255,.10);
    }

    /* Make native selects dark */
    select.inputLike{
      appearance:none;
      -webkit-appearance:none;
      -moz-appearance:none;
      background-image:
        linear-gradient(45deg, transparent 50%, var(--muted) 50%),
        linear-gradient(135deg, var(--muted) 50%, transparent 50%);
      background-position:
        calc(100% - 18px) 50%,
        calc(100% - 12px) 50%;
      background-size: 6px 6px, 6px 6px;
      background-repeat:no-repeat;
      padding-right:34px;
      color-scheme: dark;
    }
    select.inputLike option{
      background: #0f1a2d;
      color: var(--text);
    }

    textarea.inputLike{ resize: vertical; }

    .tablePro{
      width:100%;
      border-collapse: collapse;
      background: rgba(255,255,255,.02);
    }
    .tablePro th, .tablePro td{
      padding:12px 12px;
      border-bottom:1px solid var(--line);
      text-align:left;
      white-space:nowrap;
      vertical-align:middle;
      font-size:14px;
    }
    .tablePro th{
      color: var(--muted);
      font-weight:600;
      font-size:12px;
      letter-spacing:.3px;
      text-transform:uppercase;
    }

    .badge{
      display:inline-flex;
      padding:4px 10px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,.10);
      background: rgba(255,255,255,.03);
      color: var(--muted);
      font-size:12px;
    }
    .badge.active{
      border-color: rgba(110,168,255,.35);
      background: rgba(110,168,255,.12);
      color: var(--text);
    }
    .badge.building{
      border-color: rgba(255,190,90,.35);
      background: rgba(255,190,90,.14);
      color: var(--text);
    }
    .badge.archived{
      border-color: rgba(170,170,170,.25);
      background: rgba(170,170,170,.10);
      color: var(--muted);
    }

    .danger{
      border-color: rgba(255,90,90,.25) !important;
      background: rgba(255,90,90,.08) !important;
    }

    /* Modal */
    .modalOverlay{
      position:fixed; inset:0;
      background: rgba(0,0,0,.55);
      display:none;
      align-items:center; justify-content:center;
      padding:18px;
      z-index:9999;
    }
    .modal{
      width:min(720px, 96vw);
      background: linear-gradient(180deg, rgba(255,255,255,.04), transparent 60%), var(--card);
      border:1px solid var(--line);
      border-radius:16px;
      box-shadow: 0 30px 80px rgba(0,0,0,.6);
      padding:16px;
    }
    .modalHeader{
      display:flex; justify-content:space-between; align-items:center; gap:10px;
      margin-bottom:10px;
    }
    .modalHeader h3{ margin:0; font-size:16px; }
    .xBtn{
      width:38px; height:38px;
      border-radius:12px;
      border:1px solid var(--line);
      background: rgba(255,255,255,.04);
      color: var(--text);
      cursor:pointer;
    }
  `;
  document.head.appendChild(style);
}

function setPill(text) {
  const pill = document.getElementById("statusPill");
  if (pill) pill.textContent = text;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

/** Append-only logs. Never block UX if logging fails. */
async function logActivity({ action, entity, entity_id, title, status, user_email }) {
  try {
    await window.sb.from("activity_logs").insert({
      action,
      entity,
      entity_id: entity_id ?? null,
      title: title ?? null,
      status: status ?? null,
      user_email: user_email ?? null
    });
  } catch (_) {}
}

async function getUserEmailCached() {
  try {
    const { data } = await window.sb.auth.getUser();
    return data?.user?.email ?? null;
  } catch {
    return null;
  }
}

/* --- data --- */
let allProjects = [];
let editingId = null;

async function fetchProjects() {
  setPill("Loading...");
  const { data, error } = await window.sb
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setPill("Error");
    throw new Error(error.message);
  }

  allProjects = data || [];
  setPill("Ready");
  return allProjects;
}

function openEditModal(project) {
  editingId = project.id;

  document.getElementById("e_title").value = project.title ?? "";
  document.getElementById("e_status").value = project.status ?? "active";
  document.getElementById("e_link").value = project.link ?? "";
  document.getElementById("e_description").value = project.description ?? "";
  document.getElementById("editMsg").textContent = "";

  document.getElementById("editOverlay").style.display = "flex";
}

function closeEditModal() {
  editingId = null;
  document.getElementById("editOverlay").style.display = "none";
}

function renderTable(list) {
  const tbody = document.getElementById("tbody");
  const countLine = document.getElementById("countLine");

  tbody.innerHTML = "";

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="muted" style="padding:16px;">
          No projects found.
        </td>
      </tr>
    `;
    countLine.textContent = "0 projects";
    return;
  }

  for (const p of list) {
    const safeTitle = escapeHtml(p.title);
    const safeStatus = escapeHtml(p.status ?? "active");
    const safeCreated = escapeHtml(fmtDate(p.created_at));

    const linkCell = p.link
      ? `<a class="btn" href="${escapeHtml(p.link)}" target="_blank" rel="noreferrer">Open</a>`
      : `<span class="muted">—</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${safeTitle}</td>
      <td><span class="badge ${safeStatus}">${safeStatus}</span></td>
      <td>${linkCell}</td>
      <td>${safeCreated}</td>
      <td style="display:flex; gap:8px;">
        <button class="btn" data-edit="${p.id}">Edit</button>
        <button class="btn danger" data-del="${p.id}">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // delete handlers
  tbody.querySelectorAll("button[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (IS_DEMO) {
        openDemoNotice(randDemoMsg("del"));
        return;
      }

      const id = Number(btn.getAttribute("data-del"));
      if (!Number.isFinite(id)) return;

      const ok = confirm("Delete this project? This cannot be undone.");
      if (!ok) return;

      const snapshot = allProjects.find(x => x.id === id);
      const email = await getUserEmailCached();

      setPill("Deleting...");
      const { error } = await window.sb.from("projects").delete().eq("id", id);

      if (error) {
        setPill("Error");
        alert(error.message);
        return;
      }

      await logActivity({
        action: "delete",
        entity: "project",
        entity_id: id,
        title: snapshot?.title,
        status: snapshot?.status,
        user_email: email
      });

      await refresh();
    });
  });

  // edit handlers
  tbody.querySelectorAll("button[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (IS_DEMO) {
        openDemoNotice(randDemoMsg("edit"));
        return;
      }

      const id = Number(btn.getAttribute("data-edit"));
      const p = allProjects.find((x) => x.id === id);
      if (!p) return;
      openEditModal(p);
    });
  });

  countLine.textContent = `${list.length} project(s)`;
}

function applySearch() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  if (!q) return renderTable(allProjects);

  const filtered = allProjects.filter((p) =>
    String(p.title ?? "").toLowerCase().includes(q)
  );
  renderTable(filtered);
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("status").value = "active";
  document.getElementById("link").value = "";
  document.getElementById("description").value = "";
  document.getElementById("msg").textContent = "";
  document.getElementById("linkHint").textContent = "";
}

async function createProject() {
  const msg = document.getElementById("msg");

  const title = document.getElementById("title").value.trim();
  const status = document.getElementById("status").value;
  const link = document.getElementById("link").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title) {
    msg.textContent = "Title is required.";
    return;
  }
  if (!isValidUrl(link)) {
    msg.textContent = "Link must be a valid URL (include https://).";
    return;
  }

  setPill("Saving...");
  msg.textContent = "Creating...";

  // Insert + capture id for logging
  const { data: inserted, error } = await window.sb
    .from("projects")
    .insert({
      title,
      status,
      link: link || null,
      description: description || null,
    })
    .select("id")
    .single();

  if (error) {
    setPill("Error");
    msg.textContent = error.message;
    return;
  }

  const email = await getUserEmailCached();
  await logActivity({
    action: "create",
    entity: "project",
    entity_id: inserted?.id ?? null,
    title,
    status,
    user_email: email
  });

  msg.textContent = "Created ✅";
  clearForm();
  await refresh();
}

async function refresh() {
  try {
    await fetchProjects();
    applySearch();
  } catch (e) {
    alert(e.message);
  }
}

/* --- boot --- */
(async function boot() {
  injectLocalStyles();

  await requireAuth();

  // who + demo flag BEFORE rendering (so demo pill appears)
  try {
    const { data } = await window.sb.auth.getUser();
    const email = data?.user?.email ?? "";
    IS_DEMO = email === "demo@admin.local";
  } catch {}

  renderPageShell();

  // who
  try {
    const { data } = await window.sb.auth.getUser();
    const email = data?.user?.email ?? "";
    document.getElementById("who").textContent = email;
  } catch {
    document.getElementById("who").textContent = "";
  }

  // demo modal wiring (NEW)
  document.getElementById("closeDemo")?.addEventListener("click", closeDemoNotice);
  document.getElementById("demoOk")?.addEventListener("click", closeDemoNotice);
  document.getElementById("demoOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "demoOverlay") closeDemoNotice();
  });

  // logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await window.sb.auth.signOut();
    window.location.href = "index.html";
  });

  // live link hint (create)
  const linkEl = document.getElementById("link");
  const hint = document.getElementById("linkHint");
  linkEl.addEventListener("input", () => {
    const v = linkEl.value.trim();
    if (!v) { hint.textContent = ""; return; }
    hint.textContent = isValidUrl(v)
      ? "Looks valid ✅"
      : "Include https:// (example: https://example.com)";
  });

  // buttons
  document.getElementById("createBtn").addEventListener("click", createProject);
  document.getElementById("clearBtn").addEventListener("click", clearForm);
  document.getElementById("refreshBtn").addEventListener("click", refresh);

  // search
  document.getElementById("search").addEventListener("input", applySearch);

  // modal buttons
  document.getElementById("closeEdit").addEventListener("click", closeEditModal);
  document.getElementById("cancelEdit").addEventListener("click", closeEditModal);

  // close if click outside modal
  document.getElementById("editOverlay").addEventListener("click", (e) => {
    if (e.target.id === "editOverlay") closeEditModal();
  });

  // live link hint (edit)
  const eLinkEl = document.getElementById("e_link");
  const eHint = document.getElementById("e_linkHint");
  eLinkEl.addEventListener("input", () => {
    const v = eLinkEl.value.trim();
    if (!v) { eHint.textContent = ""; return; }
    eHint.textContent = isValidUrl(v)
      ? "Looks valid ✅"
      : "Include https:// (example: https://example.com)";
  });

  // save edit
  document.getElementById("saveEdit").addEventListener("click", async () => {
    if (IS_DEMO) {
      openDemoNotice(randDemoMsg("save"));
      return;
    }

    const editMsg = document.getElementById("editMsg");

    const title = document.getElementById("e_title").value.trim();
    const status = document.getElementById("e_status").value;
    const link = document.getElementById("e_link").value.trim();
    const description = document.getElementById("e_description").value.trim();

    if (!editingId) return;
    if (!title) { editMsg.textContent = "Title is required."; return; }
    if (!isValidUrl(link)) { editMsg.textContent = "Link must be valid (include https://)."; return; }

    setPill("Saving...");
    editMsg.textContent = "Updating...";

    const { error } = await window.sb
      .from("projects")
      .update({
        title,
        status,
        link: link || null,
        description: description || null,
      })
      .eq("id", editingId);

    if (error) {
      setPill("Error");
      editMsg.textContent = error.message;
      return;
    }

    const email = await getUserEmailCached();
    await logActivity({
      action: "update",
      entity: "project",
      entity_id: editingId,
      title,
      status,
      user_email: email
    });

    editMsg.textContent = "Saved ✅";
    closeEditModal();
    await refresh();
  });

  // initial load
  await refresh();
})();


