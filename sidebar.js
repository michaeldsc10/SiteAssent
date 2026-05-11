/**
 * sidebar.js — ASSENT AGÊNCIA
 * Sidebar reutilizável. Importar com:
 *   <script type="module" src="/sidebar.js"></script>
 *
 * Expõe:
 *   AssentSidebar.init({ navItems, onLogout, activePage })
 *   AssentSidebar.setUser({ nome, email, fotoBase64 })
 *   AssentSidebar.setActive(key)
 */

const SIDEBAR_CSS = `
:root {
  --sidebar: 240px;
  --sidebar-collapsed: 64px;
  --gold: #C9A84C;
  --gold-dim: #a8883a;
  --gold-line: rgba(201,168,76,0.3);
  --border: rgba(255,255,255,0.06);
  --border2: rgba(255,255,255,0.1);
  --surface: #0d0d0d;
  --surface2: #141414;
  --surface3: #1c1c1c;
  --muted: #666666;
  --white: #FFFFFF;
  --heading: 'Montserrat', sans-serif;
  --body: 'DM Sans', sans-serif;
}

/* ── SIDEBAR ── */
.assent-sidebar {
  width: var(--sidebar);
  flex-shrink: 0;
  background: rgba(13,13,13,0.72);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  transition: width .3s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}
.assent-sidebar.collapsed { width: var(--sidebar-collapsed); }

/* Logo */
.sb-logo {
  padding: 20px 20px 16px;
  font-family: var(--heading); font-weight: 900; font-size: 1rem; letter-spacing: .14em;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  white-space: nowrap; min-height: 64px; color: var(--white);
}
.sb-logo em { color: var(--gold); font-style: normal; }
.sb-logo-text { transition: opacity .2s, width .2s; overflow: hidden; }
.assent-sidebar.collapsed .sb-logo-text { opacity: 0; width: 0; }

.sb-toggle {
  background: none;
  border: 1px solid var(--border2);
  color: var(--muted);
  width: 28px; height: 28px; border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}
.sb-toggle:hover { border-color: var(--gold-line); color: var(--gold); }
.sb-toggle svg { transition: transform .3s; width: 14px; height: 14px; }
.assent-sidebar.collapsed .sb-toggle svg { transform: rotate(180deg); }

/* User strip */
.sb-user {
  padding: 16px 12px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; white-space: nowrap; overflow: hidden;
}
.sb-user:hover .sb-user-name { color: var(--gold); }
.sb-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--heading); font-weight: 800; font-size: .85rem; color: #000;
  border: 2px solid var(--gold-line); position: relative;
}
.sb-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sb-user-info { transition: opacity .2s; overflow: hidden; }
.assent-sidebar.collapsed .sb-user-info { opacity: 0; width: 0; }
.sb-user-name { font-family: var(--heading); font-weight: 700; font-size: .85rem; transition: color .2s; line-height: 1.2; color: var(--white); }
.sb-user-email { font-size: .72rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }

/* Nav */
.sb-nav { flex: 1; padding: 12px 0; overflow-y: auto; overflow-x: hidden; }
.sb-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 22px;
  font-size: .82rem; font-weight: 500; color: var(--muted);
  cursor: pointer; transition: all .2s; position: relative;
  white-space: nowrap; overflow: hidden;
}
.sb-nav-item:hover { color: var(--white); background: rgba(255,255,255,.03); }
.sb-nav-item.active { color: var(--gold); background: rgba(201,168,76,.06); }
.sb-nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: var(--gold); border-radius: 0 2px 2px 0;
}
.sb-nav-icon { width: 18px; height: 18px; flex-shrink: 0; }
.sb-nav-label { transition: opacity .2s; }
.assent-sidebar.collapsed .sb-nav-label { opacity: 0; }
.assent-sidebar.collapsed .sb-nav-item { padding: 11px 0; justify-content: center; }
.assent-sidebar.collapsed .sb-nav-item.active::before { display: none; }
.assent-sidebar.collapsed .sb-nav-item.active { border-left: 3px solid var(--gold); }

/* Tooltip collapsed */
.assent-sidebar.collapsed .sb-nav-item { position: relative; }
.assent-sidebar.collapsed .sb-nav-item:hover::after {
  content: attr(data-label);
  position: absolute; left: calc(var(--sidebar-collapsed) - 8px); top: 50%; transform: translateY(-50%);
  background: var(--surface3); color: var(--white); font-size: .75rem; font-weight: 600;
  padding: 5px 12px; border-radius: 8px; white-space: nowrap; z-index: 200;
  border: 1px solid var(--border2); pointer-events: none;
}

/* Footer */
.sb-footer { padding: 16px 12px; border-top: 1px solid var(--border); }
.sb-btn-sair {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px; border-radius: 50px;
  background: transparent; border: 1px solid var(--border2);
  color: var(--muted); font-size: .78rem; font-weight: 600; font-family: var(--heading);
  letter-spacing: .05em; text-transform: uppercase; cursor: pointer; transition: all .2s;
  white-space: nowrap; overflow: hidden;
}
.sb-btn-sair:hover { border-color: rgba(192,57,43,.4); color: #e87070; }
.assent-sidebar.collapsed .sb-btn-sair { padding: 10px 0; border-radius: 50%; }
.sb-sair-label { transition: opacity .2s, max-width .2s; max-width: 120px; overflow: hidden; }
.assent-sidebar.collapsed .sb-sair-label { opacity: 0; max-width: 0; }

/* ── MOBILE TOPBAR ── */
.assent-mob-topbar {
  display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  background: rgba(13,13,13,0.85); border-bottom: 1px solid var(--border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  height: 56px; align-items: center; justify-content: space-between; padding: 0 16px;
}
.mob-topbar-logo { font-family: var(--heading); font-weight: 900; font-size: .9rem; letter-spacing: .12em; color: var(--white); }
.mob-topbar-logo em { color: var(--gold); font-style: normal; }
.assent-hamburger { background: none; border: none; cursor: pointer; padding: 4px; display: flex; flex-direction: column; gap: 5px; }
.assent-hamburger span { width: 22px; height: 2px; background: var(--white); border-radius: 2px; display: block; transition: all .3s; }
.assent-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.assent-hamburger.open span:nth-child(2) { opacity: 0; }
.assent-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── OVERLAY MOBILE ── */
.assent-sb-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 99; }
.assent-sb-overlay.open { display: block; }

@media (max-width: 900px) {
  .assent-sidebar { transform: translateX(-100%); width: var(--sidebar) !important; }
  .assent-sidebar.open { transform: translateX(0); }
  .assent-mob-topbar { display: flex; }
  .sb-toggle { display: none; }
}
`;

function injectCSS() {
  if (document.getElementById('assent-sidebar-css')) return;
  const style = document.createElement('style');
  style.id = 'assent-sidebar-css';
  style.textContent = SIDEBAR_CSS;
  document.head.appendChild(style);
}

const ICONS = {
  apps: `<svg class="sb-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="9" height="9" rx="1"/><rect x="13" y="3" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>`,
  profile: `<svg class="sb-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
  courses: `<svg class="sb-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  logout: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
};

let _cfg = {};
let _sidebarEl = null;

function buildSidebar(cfg) {
  _cfg = cfg;

  // Remove elementos de sidebar de uma sessão anterior antes de reconstruir.
  // Sem isso, se um novo usuário logar após outro, a sidebar antiga permanece
  // no DOM com os dados do usuário anterior.
  document.getElementById('assent-sidebar')?.remove();
  document.getElementById('assent-sb-overlay')?.remove();
  document.querySelector('.assent-mob-topbar')?.remove();

  // Overlay mobile
  const overlay = document.createElement('div');
  overlay.className = 'assent-sb-overlay';
  overlay.id = 'assent-sb-overlay';
  overlay.addEventListener('click', closeSidebar);

  // Mobile topbar
  const topbar = document.createElement('div');
  topbar.className = 'assent-mob-topbar';
  topbar.innerHTML = `
    <span class="mob-topbar-logo">ASSENT&nbsp;<em>AGÊNCIA</em></span>
    <button class="assent-hamburger" id="assent-ham" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>`;
  topbar.querySelector('#assent-ham').addEventListener('click', toggleSidebar);

  // Sidebar element
  const sidebar = document.createElement('aside');
  sidebar.className = 'assent-sidebar';
  sidebar.id = 'assent-sidebar';

  // Nav items HTML
  const navItems = (cfg.navItems || []).map(item => {
    const icon = ICONS[item.icon] || '';
    return `<div class="sb-nav-item${item.key === cfg.activePage ? ' active' : ''}"
      data-key="${item.key}"
      data-label="${item.label}"
      data-href="${item.href || ''}"
      tabindex="0"
      role="button"
      aria-label="${item.label}">
      ${icon}
      <span class="sb-nav-label">${item.label}</span>
    </div>`;
  }).join('');

  sidebar.innerHTML = `
    <div class="sb-logo">
      <span class="sb-logo-text">ASSENT&nbsp;<em>AGÊNCIA</em></span>
      <button class="sb-toggle" id="assent-sb-toggle" title="Recolher menu" aria-label="Recolher menu">
        ${ICONS.chevron}
      </button>
    </div>
    <div class="sb-user" id="assent-sb-user" role="button" tabindex="0">
      <div class="sb-avatar" id="assent-sb-avatar">?</div>
      <div class="sb-user-info">
        <div class="sb-user-name" id="assent-sb-name">Carregando...</div>
        <div class="sb-user-email" id="assent-sb-email"></div>
      </div>
    </div>
    <nav class="sb-nav" id="assent-sb-nav">
      ${navItems}
    </nav>
    <div class="sb-footer">
      <button class="sb-btn-sair" id="assent-sb-logout" aria-label="Sair da conta">
        ${ICONS.logout}
        <span class="sb-sair-label">Sair da conta</span>
      </button>
    </div>`;

  // Events
  sidebar.querySelector('#assent-sb-toggle').addEventListener('click', toggleCollapse);
  sidebar.querySelector('#assent-sb-logout').addEventListener('click', () => cfg.onLogout?.());
  sidebar.querySelector('#assent-sb-user').addEventListener('click', () => {
    cfg.onUserClick?.();
    closeSidebar();
  });
  sidebar.querySelectorAll('.sb-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.key;
      const href = item.dataset.href;
      if (href) {
        window.location.href = href;
      } else {
        setActive(key);
        cfg.onNav?.(key);
        closeSidebar();
      }
    });
  });

  _sidebarEl = sidebar;

  // Restore collapsed state
  if (localStorage.getItem('assent-sidebar-collapsed') === '1') {
    sidebar.classList.add('collapsed');
    _applyMainMargin(true);
  }

  // Inject into body (before first child)
  document.body.prepend(overlay, topbar, sidebar);

  // Adjust main content margin
  _applyMainMargin(sidebar.classList.contains('collapsed'));
}

function _applyMainMargin(collapsed) {
  const main = document.getElementById('assent-dash-main') || document.querySelector('.dash-main');
  if (main) {
    main.style.marginLeft = collapsed
      ? 'var(--sidebar-collapsed)'
      : 'var(--sidebar)';
  }
}

function toggleCollapse() {
  const sidebar = document.getElementById('assent-sidebar');
  if (!sidebar) return;
  const isCollapsed = sidebar.classList.toggle('collapsed');
  _applyMainMargin(isCollapsed);
  localStorage.setItem('assent-sidebar-collapsed', isCollapsed ? '1' : '0');
}

function toggleSidebar() {
  const sidebar = document.getElementById('assent-sidebar');
  const ham = document.getElementById('assent-ham');
  const overlay = document.getElementById('assent-sb-overlay');
  sidebar?.classList.toggle('open');
  ham?.classList.toggle('open');
  overlay?.classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('assent-sidebar')?.classList.remove('open');
  document.getElementById('assent-ham')?.classList.remove('open');
  document.getElementById('assent-sb-overlay')?.classList.remove('open');
}

function setUser({ nome, email, fotoBase64 }) {
  const nameEl = document.getElementById('assent-sb-name');
  const emailEl = document.getElementById('assent-sb-email');
  const avatarEl = document.getElementById('assent-sb-avatar');
  if (!nameEl) return;

  const firstName = nome?.split(' ')[0] || '—';
  const inits = (nome || email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  nameEl.textContent = firstName;
  if (emailEl) emailEl.textContent = email || '';
  if (avatarEl) {
    if (fotoBase64) {
      avatarEl.innerHTML = `<img src="${fotoBase64}" alt="foto"/>`;
    } else {
      avatarEl.textContent = inits;
    }
  }
}

function setActive(key) {
  document.querySelectorAll('.sb-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.key === key);
  });
}

function init(cfg) {
  injectCSS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => buildSidebar(cfg));
  } else {
    buildSidebar(cfg);
  }
}

// Public API
window.AssentSidebar = { init, setUser, setActive, toggleCollapse, closeSidebar };
export { init, setUser, setActive, toggleCollapse, closeSidebar };
