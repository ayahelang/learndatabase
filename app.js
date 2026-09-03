/* Silverhawk LearnDatabase - Main Application Logic */

(function () {
  "use strict";

  // ===== Constants & State =====
  const STORAGE_KEY = "sh_learndb_access";
  const VOUCHERS_KEY = "sh_learndb_vouchers";
  const CRUD_KEY = "sh_learndb_crud";
  const ADMIN_PASS = "adminSH2026";
  const DEMO = typeof DEMO_VOUCHER !== "undefined" ? DEMO_VOUCHER : "D3m0";

  let isUnlocked = false;
  let isAdmin = false;
  let vouchers = [];

  // ===== DOM Helpers =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ===== Voucher System =====
  function loadVouchers() {
    try {
      const raw = localStorage.getItem(VOUCHERS_KEY);
      vouchers = raw ? JSON.parse(raw) : [];
    } catch {
      vouchers = [];
    }
    // Pastikan demo voucher selalu ada
    const hasDemo = vouchers.some((v) => v.code.toUpperCase() === DEMO.toUpperCase());
    if (!hasDemo) {
      vouchers.unshift({
        code: DEMO,
        created: new Date().toISOString(),
        expiry: null, // tidak kadaluarsa
        note: "Demo default (rahasia)",
        used: false,
        active: true
      });
      saveVouchers();
    }
  }

  function saveVouchers() {
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
  }

  function generateCode(prefix = "SH") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = prefix ? prefix.toUpperCase() + "-" : "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
      if (i === 3) code += "-";
    }
    return code;
  }

  function isVoucherValid(code) {
    if (!code) return { ok: false, msg: "Kode kosong" };
    const v = vouchers.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
    if (!v) return { ok: false, msg: "Kode voucher tidak ditemukan" };
    if (!v.active) return { ok: false, msg: "Voucher sudah dinonaktifkan" };
    if (v.expiry) {
      const exp = new Date(v.expiry);
      if (exp < new Date()) return { ok: false, msg: "Voucher sudah kadaluarsa" };
    }
    return { ok: true, voucher: v };
  }

  function unlockWithVoucher(code) {
    const result = isVoucherValid(code);
    if (!result.ok) return result;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      code: result.voucher.code,
      unlockedAt: new Date().toISOString()
    }));
    isUnlocked = true;
    return { ok: true };
  }

  function checkExistingAccess() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      const result = isVoucherValid(data.code);
      if (result.ok) {
        isUnlocked = true;
        return true;
      }
      localStorage.removeItem(STORAGE_KEY);
      return false;
    } catch {
      return false;
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    isUnlocked = false;
    isAdmin = false;
    $("#app").classList.add("hidden");
    $("#voucher-gate").classList.add("active");
    $("#admin-panel")?.classList.add("hidden");
    $("#admin-login-box")?.classList.remove("hidden");
    const adminSec = $("#admin");
    if (adminSec) adminSec.classList.remove("visible");
  }

  // ===== UI: Unlock Gate =====
  function setupVoucherGate() {
    const input = $("#voucher-input");
    const btn = $("#btn-unlock");
    const msg = $("#voucher-msg");

    function tryUnlock() {
      const code = input.value.trim();
      const result = unlockWithVoucher(code);
      if (result.ok) {
        msg.className = "msg success";
        msg.textContent = "✓ Akses berhasil! Memuat materi...";
        setTimeout(() => {
          $("#voucher-gate").classList.remove("active");
          $("#app").classList.remove("hidden");
          initApp();
        }, 600);
      } else {
        msg.className = "msg error";
        msg.textContent = "✗ " + result.msg;
      }
    }

    btn.addEventListener("click", tryUnlock);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryUnlock();
    });
  }

  // ===== Materi Cards =====
  function renderMateriCards(filter = "all") {
    const grid = $("#materi-grid");
    if (!grid || typeof DATABASES === "undefined") return;

    const list = filter === "all"
      ? DATABASES
      : DATABASES.filter((d) => d.category.includes(filter));

    grid.innerHTML = list.map((db) => `
      <article class="card" data-id="${db.id}" style="--card-accent: ${db.color}">
        <div class="card-icon" style="background: ${db.color}22; color: ${db.color}">${db.icon}</div>
        <h3>${db.name}</h3>
        <p>${db.short}</p>
        <div class="card-tags">
          ${db.category.map((c) => `<span class="tag ${c}">${c}</span>`).join("")}
        </div>
      </article>
    `).join("");

    grid.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => openMateri(card.dataset.id));
    });
  }

  function openMateri(id) {
    const db = DATABASES.find((d) => d.id === id);
    if (!db) return;
    const content = $("#materi-content");
    content.innerHTML = `
      <h2>${db.icon} ${db.name}</h2>
      <p class="materi-meta">${db.category.map((c) => c.toUpperCase()).join(" · ")}</p>
      
      <div class="materi-section">
        <h3>1. Perkenalan</h3>
        <p>${db.intro}</p>
      </div>
      
      <div class="materi-section">
        <h3>2. Cara Registrasi</h3>
        <ol>${db.registrasi.map((s) => `<li>${s}</li>`).join("")}</ol>
      </div>
      
      <div class="materi-section">
        <h3>3. Implementasi</h3>
        <ol>${db.implementasi.map((s) => `<li>${s}</li>`).join("")}</ol>
        ${db.snippet ? `<pre class="code-block">${escapeHtml(db.snippet)}</pre>` : ""}
      </div>
      
      <div class="materi-section">
        <h3>4. Deploy ke GitHub Pages / Produksi</h3>
        <ol>${db.deploy.map((s) => `<li>${s}</li>`).join("")}</ol>
      </div>
      
      ${db.tips ? `
      <div class="materi-section">
        <h3>💡 Tips</h3>
        <p>${db.tips}</p>
      </div>` : ""}
    `;
    $("#materi-modal").classList.add("active");
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ===== Simulasi CRUD =====
  function loadCrudData() {
    try {
      return JSON.parse(localStorage.getItem(CRUD_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveCrudData(data) {
    localStorage.setItem(CRUD_KEY, JSON.stringify(data));
  }

  function renderCrudTable() {
    const tbody = $("#crud-table tbody");
    if (!tbody) return;
    const data = loadCrudData();
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Belum ada data. Tambahkan item!</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map((item, i) => `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${Number(item.value).toLocaleString("id-ID")}</td>
        <td>
          <button class="btn btn-sm btn-danger" data-del="${i}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const data = loadCrudData();
        data.splice(Number(btn.dataset.del), 1);
        saveCrudData(data);
        renderCrudTable();
      });
    });
  }

  function setupCrud() {
    $("#crud-add")?.addEventListener("click", () => {
      const name = $("#crud-name").value.trim();
      const value = $("#crud-value").value;
      if (!name) return alert("Nama item wajib diisi");
      const data = loadCrudData();
      data.push({
        id: Date.now().toString(36),
        name,
        value: Number(value) || 0
      });
      saveCrudData(data);
      $("#crud-name").value = "";
      $("#crud-value").value = "";
      renderCrudTable();
    });
    $("#crud-clear")?.addEventListener("click", () => {
      if (confirm("Hapus semua data simulasi?")) {
        saveCrudData([]);
        renderCrudTable();
      }
    });
    renderCrudTable();
  }

  // ===== Query Builder =====
  function setupQueryBuilder() {
    $("#qb-run")?.addEventListener("click", () => {
      const table = $("#qb-table").value;
      const op = $("#qb-op").value;
      const where = $("#qb-where").value.trim();
      let sql = "";
      switch (op) {
        case "SELECT":
          sql = `SELECT * FROM ${table}${where ? ` WHERE ${where}` : ""};`;
          break;
        case "INSERT":
          sql = `INSERT INTO ${table} (column1, column2) VALUES (${where || "'value1', 'value2'"});`;
          break;
        case "UPDATE":
          sql = `UPDATE ${table} SET column = 'new_value'${where ? ` WHERE ${where}` : ""};`;
          break;
        case "DELETE":
          sql = `DELETE FROM ${table}${where ? ` WHERE ${where}` : ""};`;
          break;
      }
      $("#qb-output").textContent = sql;
    });
  }

  // ===== Schema Designer =====
  function setupSchema() {
    $("#schema-gen")?.addEventListener("click", () => {
      const table = $("#schema-table").value.trim() || "my_table";
      const cols = $("#schema-cols").value.trim() || "id INT PRIMARY KEY, name VARCHAR(100)";
      const sql = `CREATE TABLE ${table} (\n  ${cols.split(",").map((c) => c.trim()).join(",\n  ")}\n);`;
      $("#schema-output").textContent = sql;
    });
  }

  // ===== Playground =====
  function setupPlayground() {
    const content = $("#pg-content");
    const title = $("#pg-title");
    function show(key) {
      const snip = PLAYGROUND_SNIPPETS[key];
      if (!snip) return;
      title.textContent = snip.title;
      content.textContent = snip.code;
      $$(".pg-btn").forEach((b) => b.classList.toggle("active", b.dataset.pg === key));
    }
    $$(".pg-btn").forEach((btn) => {
      btn.addEventListener("click", () => show(btn.dataset.pg));
    });
    $("#pg-copy")?.addEventListener("click", () => {
      navigator.clipboard.writeText(content.textContent).then(() => {
        const btn = $("#pg-copy");
        const old = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => (btn.innerHTML = old), 1500);
      });
    });
    show("firebase");
  }

  // ===== Admin =====
  function renderVoucherTable() {
    const tbody = $("#voucher-table tbody");
    if (!tbody) return;
    tbody.innerHTML = vouchers.map((v, i) => {
      const exp = v.expiry ? new Date(v.expiry).toLocaleDateString("id-ID") : "—";
      const created = new Date(v.created).toLocaleDateString("id-ID");
      let status = v.active ? "Aktif" : "Nonaktif";
      if (v.expiry && new Date(v.expiry) < new Date()) status = "Kadaluarsa";
      const statusColor = status === "Aktif" ? "var(--success)" : status === "Kadaluarsa" ? "var(--warning)" : "var(--danger)";
      return `
        <tr>
          <td><code>${escapeHtml(v.code)}</code></td>
          <td>${created}</td>
          <td>${exp}</td>
          <td style="color:${statusColor}">${status}</td>
          <td>${escapeHtml(v.note || "—")}</td>
          <td>
            <button class="btn btn-sm btn-secondary" data-toggle="${i}" title="Aktif/Nonaktif">
              <i class="fas fa-power-off"></i>
            </button>
            <button class="btn btn-sm btn-danger" data-remove="${i}" title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.toggle);
        vouchers[idx].active = !vouchers[idx].active;
        saveVouchers();
        renderVoucherTable();
      });
    });
    tbody.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("Hapus voucher ini?")) return;
        const idx = Number(btn.dataset.remove);
        // Jangan hapus demo
        if (vouchers[idx].code.toUpperCase() === DEMO.toUpperCase()) {
          alert("Voucher demo tidak boleh dihapus.");
          return;
        }
        vouchers.splice(idx, 1);
        saveVouchers();
        renderVoucherTable();
      });
    });
  }

  function setupAdmin() {
    $("#btn-admin-login")?.addEventListener("click", () => {
      const pass = $("#admin-pass").value;
      const msg = $("#admin-login-msg");
      if (pass === ADMIN_PASS) {
        isAdmin = true;
        msg.className = "msg success";
        msg.textContent = "Login berhasil";
        $("#admin-login-box").classList.add("hidden");
        $("#admin-panel").classList.remove("hidden");
        renderVoucherTable();
      } else {
        msg.className = "msg error";
        msg.textContent = "Password salah";
      }
    });

    $("#btn-admin-logout")?.addEventListener("click", () => {
      isAdmin = false;
      $("#admin-panel").classList.add("hidden");
      $("#admin-login-box").classList.remove("hidden");
      $("#admin-pass").value = "";
    });

    $("#btn-gen-voucher")?.addEventListener("click", () => {
      const prefix = $("#v-prefix").value.trim() || "SH";
      const days = Number($("#v-expiry").value) || 0;
      const note = $("#v-note").value.trim();
      const code = generateCode(prefix);
      const expiry = days > 0
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        : null;
      vouchers.push({
        code,
        created: new Date().toISOString(),
        expiry,
        note,
        used: false,
        active: true
      });
      saveVouchers();
      renderVoucherTable();
      alert("Voucher dibuat: " + code);
    });

    $("#btn-export-vouchers")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(vouchers, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "silverhawk-vouchers.json";
      a.click();
    });
  }

  // ===== Navigation & Tabs =====
  function setupNav() {
    const toggle = $("#nav-toggle");
    const links = $("#nav-links");
    toggle?.addEventListener("click", () => links.classList.toggle("open"));

    $$(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href === "#admin") {
          e.preventDefault();
          const sec = $("#admin");
          sec.classList.add("visible");
          sec.scrollIntoView({ behavior: "smooth" });
          $$(".nav-link").forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
          links.classList.remove("open");
          return;
        }
        $$(".nav-link").forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        links.classList.remove("open");
      });
    });

    $("#btn-logout")?.addEventListener("click", logout);

    // Filter materi
    $$(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderMateriCards(btn.dataset.filter);
      });
    });

    // Sim tabs
    $$(".sim-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $$(".sim-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        $$(".sim-panel").forEach((p) => p.classList.remove("active"));
        $(`#sim-${tab.dataset.sim}`)?.classList.add("active");
      });
    });

    // Close materi modal
    $("#close-materi")?.addEventListener("click", () => {
      $("#materi-modal").classList.remove("active");
    });
    $("#materi-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "materi-modal") e.target.classList.remove("active");
    });
  }

  // ===== Init =====
  function initApp() {
    renderMateriCards();
    setupCrud();
    setupQueryBuilder();
    setupSchema();
    setupPlayground();
    setupAdmin();
    setupNav();
  }

  function boot() {
    loadVouchers();
    setupVoucherGate();

    // Hide loading
    setTimeout(() => {
      $("#loading-overlay")?.classList.add("hidden");
    }, 500);

    if (checkExistingAccess()) {
      $("#voucher-gate").classList.remove("active");
      $("#app").classList.remove("hidden");
      initApp();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
