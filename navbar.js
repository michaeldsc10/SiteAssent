/**
 * navbar.js — ASSENT Agência
 * ─────────────────────────────────────────────────────────────
 * Web Component <assent-navbar> + inicialização Firebase.
 *
 * O que este arquivo faz:
 *  1. Define o custom element <assent-navbar> com Shadow DOM
 *  2. Inicializa o Firebase (Auth + Firestore) uma única vez
 *  3. Escuta onAuthStateChanged e dispara evento `assent:authchange`
 *     que as páginas (cursos.html, curso.html, etc.) usam para
 *     carregar dados do usuário logado
 *  4. Exibe avatar + botão SAIR _depois_ do CTA "Análise Gratuita"
 *     quando o usuário está logado
 *  5. Expõe helpers do Firestore em `window._*` para as páginas
 *
 * ⚙️  CONFIGURAÇÃO: Substitua FIREBASE_CONFIG com suas credenciais.
 * ─────────────────────────────────────────────────────────────
 */

import { initializeApp }           from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut }
                                   from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, getDocs, setDoc, addDoc,
  collection, query, where, orderBy, serverTimestamp, deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

/* ══════════════════════════════════════
   ⚙️  CONFIGURAÇÃO FIREBASE
   Substitua com as credenciais do seu projeto.
   Console Firebase → Configurações → Seus apps → SDK (módulo)
══════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey:            "SUA_API_KEY_AQUI",
  authDomain:        "SEU_PROJETO.firebaseapp.com",
  projectId:         "SEU_PROJETO_ID",
  storageBucket:     "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};

/* ══════════════════════════════════════
   INIT FIREBASE (uma única vez)
══════════════════════════════════════ */
const _app  = initializeApp(FIREBASE_CONFIG);
const _auth = getAuth(_app);
const _db   = getFirestore(_app);

/* ══════════════════════════════════════
   HELPERS GLOBAIS (usados pelas páginas)
   Páginas acessam via window._getDoc, window._db, etc.
══════════════════════════════════════ */
window._db               = _db;
window._doc              = doc;
window._collection       = collection;
window._getDoc           = getDoc;
window._getDocs          = getDocs;
window._setDoc           = setDoc;
window._addDoc           = addDoc;
window._deleteDoc        = deleteDoc;
window._query            = query;
window._where            = where;
window._orderBy          = orderBy;
window._serverTimestamp  = serverTimestamp;

/* ══════════════════════════════════════
   HELPER: Inicial do email para avatar
══════════════════════════════════════ */
function getInitial(user) {
  if (!user) return '?';
  if (user.displayName) return user.displayName.charAt(0).toUpperCase();
  if (user.email)       return user.email.charAt(0).toUpperCase();
  return '?';
}

/* ══════════════════════════════════════
   WEB COMPONENT — <assent-navbar>
══════════════════════════════════════ */
class AssentNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this._render();
    this._setupInteractions();
    this._listenAuth();
  }

  /* ─── HTML + CSS do componente ─── */
  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        :host { display: block; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── LOGO ── */
        .logo {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -.01em;
          text-decoration: none;
          background: linear-gradient(90deg,#D4AF37 0%,#EAEAEA 25%,#D4AF37 50%,#EAEAEA 75%,#B8860B 100%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0% center; }
        }

        /* ── NAV ── */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: #1c1a14;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', sans-serif;
          transition: background .3s, box-shadow .3s;
        }
        nav.scrolled {
          background: rgba(28,26,20,0.97);
          backdrop-filter: blur(16px);
          box-shadow: 0 2px 24px rgba(0,0,0,.5);
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }

        .inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
        }

        /* ── LINKS ── */
        .links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }
        .links a, .drop-trigger {
          color: rgba(255,255,255,.75);
          text-decoration: none;
          font-size: .84rem;
          font-weight: 500;
          letter-spacing: .06em;
          text-transform: uppercase;
          transition: color .2s;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .links a:hover, .drop-trigger:hover { color: #fff; }

        /* ── LADO DIREITO ── */
        .right-side {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* ── CTA ── */
        .cta {
          display: inline-flex;
          align-items: center;
          padding: 11px 26px;
          border-radius: 50px;
          background: #F5A623;
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: .82rem;
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 0 32px rgba(245,166,35,.28);
          transition: background .25s, transform .25s, box-shadow .25s;
          white-space: nowrap;
        }
        .cta:hover {
          background: #E09820;
          transform: translateY(-2px);
          box-shadow: 0 0 52px rgba(245,166,35,.42);
        }

        /* ── ÁREA DE AUTH (avatar + sair) — visível só quando logado ── */
        .auth-area {
          display: none;           /* começa oculto; JS exibe quando logado */
          align-items: center;
          gap: 10px;
        }
        .auth-area.visible { display: flex; }

        /* Separador entre CTA e auth */
        .auth-sep {
          width: 1px;
          height: 22px;
          background: rgba(255,255,255,.12);
        }

        /* Avatar circular com inicial */
        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #B8860B);
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: .82rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: default;
          box-shadow: 0 0 14px rgba(212,175,55,.3);
          letter-spacing: 0;
        }

        /* Botão SAIR */
        .btn-sair {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,.15);
          background: transparent;
          color: rgba(255,255,255,.65);
          font-family: 'Inter', sans-serif;
          font-size: .78rem;
          font-weight: 600;
          letter-spacing: .05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color .2s, color .2s, background .2s;
          white-space: nowrap;
        }
        .btn-sair:hover {
          border-color: rgba(224,85,85,.5);
          color: #ff8a80;
          background: rgba(224,85,85,.06);
        }
        .btn-sair svg { width: 13px; height: 13px; flex-shrink: 0; }

        /* ── DROPDOWN DE SERVIÇOS ── */
        .drop-wrap { position: relative; }
        .arrow { display: inline-flex; transition: transform .25s; }
        .drop-wrap.open .arrow { transform: rotate(180deg); }

        .dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 16px);
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,.22);
          min-width: 420px;
          border: 1px solid rgba(0,0,0,.06);
          z-index: 10;
        }
        .dropdown::before {
          content: '';
          position: absolute;
          top: -7px; left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 13px; height: 13px;
          background: #fff;
          border-left: 1px solid rgba(0,0,0,.06);
          border-top: 1px solid rgba(0,0,0,.06);
        }
        .drop-wrap.open .dropdown { display: block; }

        .ditem {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          border-radius: 10px;
          text-decoration: none;
          transition: background .2s;
        }
        .ditem + .ditem { margin-top: 6px; }
        .ditem:hover { background: rgba(245,166,35,.07); }

        .dicon {
          width: 42px; height: 42px;
          flex-shrink: 0;
          border-radius: 10px;
          background: rgba(245,166,35,.1);
          display: flex; align-items: center; justify-content: center;
          color: #B8841C;
        }
        .dicon svg { width: 22px; height: 22px; }

        .dtitle {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .87rem;
          font-weight: 700;
          color: #B8841C;
          margin-bottom: 6px;
        }
        .ddesc {
          font-size: .77rem;
          color: #666;
          line-height: 1.6;
        }

        /* ── HAMBURGER ── */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 8px;
        }
        .hamburger span {
          width: 24px; height: 2px;
          background: #fff;
          border-radius: 2px;
          display: block;
          transition: all .3s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── MOBILE MENU ── */
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 8px 28px 24px;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          color: rgba(255,255,255,.8);
          text-decoration: none;
          font-size: .9rem;
          font-weight: 500;
          letter-spacing: .05em;
          text-transform: uppercase;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
          transition: color .2s;
        }
        .mobile-menu a:hover { color: #F5A623; }

        /* Separador no mobile quando logado */
        .mobile-auth-sep {
          display: none;
          height: 1px;
          background: rgba(255,255,255,.08);
          margin: 8px 0;
        }
        .mobile-auth-sep.visible { display: block; }

        .mobile-user-info {
          display: none;
          align-items: center;
          gap: 10px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .mobile-user-info.visible { display: flex; }
        .mobile-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #B8860B);
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: .78rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mobile-user-email {
          font-size: .78rem;
          color: rgba(255,255,255,.5);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .mobile-cta {
          margin-top: 18px;
          text-align: center;
          background: #F5A623 !important;
          color: #111 !important;
          border-radius: 50px;
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 700 !important;
          border-bottom: none !important;
          padding: 14px 0 !important;
        }
        .mobile-sair {
          margin-top: 10px;
          text-align: center;
          color: rgba(255,255,255,.45) !important;
          font-size: .8rem !important;
          border-bottom: none !important;
          padding: 10px 0 !important;
          text-transform: none !important;
          letter-spacing: .02em !important;
          display: none;
        }
        .mobile-sair.visible { display: block; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .links, .right-side { display: none; }
          .hamburger { display: flex; }
        }
      </style>

      <nav id="nav">
        <div class="container">
          <div class="inner">

            <!-- Logo -->
            <a href="/" class="logo">ASSENT</a>

            <!-- Links de navegação (desktop) -->
            <ul class="links">
              <li class="drop-wrap" id="dropWrap">
                <button class="drop-trigger" id="dropBtn">
                  Serviços
                  <span class="arrow">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </button>
                <div class="dropdown">
                  <a href="/trafego" class="ditem">
                    <div class="dicon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </div>
                    <div>
                      <span class="dtitle">Gestão de Tráfego Pago</span>
                      <span class="ddesc">Anúncios estratégicos para empresas que querem resultados previsíveis.</span>
                    </div>
                  </a>
                  <a href="/aplicativos" class="ditem">
                    <div class="dicon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5"/>
                      </svg>
                    </div>
                    <div>
                      <span class="dtitle">Aplicativos</span>
                      <span class="ddesc">Soluções digitais personalizadas para escalar o seu negócio.</span>
                    </div>
                  </a>
                  <a href="/fotografia" class="ditem">
                    <div class="dicon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        <circle cx="12" cy="14" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <span class="dtitle">Fotografia Profissional</span>
                      <span class="ddesc">Imagens que valorizam sua marca e convertem visitantes em clientes.</span>
                    </div>
                  </a>
                </div>
              </li>

              <li><a href="/#provas">Resultados</a></li>
              <li><a href="/#processo">Como Funciona</a></li>
              <li><a href="/#faq">Dúvidas</a></li>
            </ul>

            <!-- ── LADO DIREITO: CTA + Auth ── -->
            <div class="right-side">

              <!-- CTA público (sempre visível) -->
              <a href="https://wa.me/5562991383079?text=Olá!" class="cta" target="_blank">
                Análise Gratuita
              </a>

              <!-- Auth: aparece DEPOIS do CTA quando logado -->
              <div class="auth-area" id="authArea">
                <div class="auth-sep"></div>
                <div class="user-avatar" id="userAvatar" title="">?</div>
                <button class="btn-sair" id="btnSair">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sair
                </button>
              </div>

            </div>

            <!-- Hamburger mobile -->
            <button class="hamburger" id="hamburger">
              <span></span><span></span><span></span>
            </button>

          </div>

          <!-- Menu mobile -->
          <div class="mobile-menu" id="mobileMenu">
            <!-- Info do usuário (só quando logado) -->
            <div class="mobile-user-info" id="mobileUserInfo">
              <div class="mobile-avatar" id="mobileAvatar">?</div>
              <span class="mobile-user-email" id="mobileUserEmail"></span>
            </div>

            <a href="/trafego">Tráfego Pago</a>
            <a href="/aplicativos">Aplicativos</a>
            <a href="/fotografia">Fotografia</a>
            <a href="/#provas">Resultados</a>
            <a href="/#processo">Como Funciona</a>
            <a href="/#faq">Dúvidas</a>
            <a href="https://wa.me/5562991383079?text=Olá!" class="mobile-cta" target="_blank">
              Análise Gratuita
            </a>
            <!-- Botão sair mobile (só quando logado) -->
            <a href="#" class="mobile-sair" id="mobileSair">↩ Sair da conta</a>
          </div>

        </div>
      </nav>
    `;
  }

  /* ─── Interações (scroll, dropdown, hamburger) ─── */
  _setupInteractions() {
    const sr = this.shadowRoot;

    // Scroll → classe .scrolled
    const nav = sr.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    });

    // Dropdown de serviços
    const dropWrap = sr.getElementById('dropWrap');
    const dropBtn  = sr.getElementById('dropBtn');
    dropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropWrap.classList.toggle('open');
    });
    document.addEventListener('click', () => dropWrap.classList.remove('open'));

    // Hamburger
    const hamburger  = sr.getElementById('hamburger');
    const mobileMenu = sr.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    sr.querySelectorAll('.mobile-menu a:not(.mobile-sair)').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // Botão SAIR (desktop)
    sr.getElementById('btnSair').addEventListener('click', () => this._logout());

    // Botão SAIR (mobile)
    sr.getElementById('mobileSair').addEventListener('click', (e) => {
      e.preventDefault();
      this._logout();
    });
  }

  /* ─── Logout ─── */
  async _logout() {
    try {
      await signOut(_auth);
      // Redireciona para home ou página de login
      window.location.href = '/';
    } catch (err) {
      console.error('[Navbar] Erro ao sair:', err);
    }
  }

  /* ─── Escuta estado de autenticação ─── */
  _listenAuth() {
    onAuthStateChanged(_auth, (user) => {
      this._updateAuthUI(user);

      // Dispara evento global para as páginas
      window.dispatchEvent(new CustomEvent('assent:authchange', {
        detail: { user }
      }));
    });
  }

  /* ─── Atualiza UI de auth na navbar ─── */
  _updateAuthUI(user) {
    const sr         = this.shadowRoot;
    const authArea   = sr.getElementById('authArea');
    const userAvatar = sr.getElementById('userAvatar');
    const mobileInfo = sr.getElementById('mobileUserInfo');
    const mobileAvt  = sr.getElementById('mobileAvatar');
    const mobileEmail = sr.getElementById('mobileUserEmail');
    const mobileSair = sr.getElementById('mobileSair');

    if (user) {
      const inicial = getInitial(user);
      const email   = user.email || '';

      // Desktop: mostra área de auth
      authArea.classList.add('visible');
      userAvatar.textContent = inicial;
      userAvatar.title       = email;

      // Mobile: mostra info do usuário e botão sair
      mobileInfo.classList.add('visible');
      mobileAvt.textContent    = inicial;
      mobileEmail.textContent  = email;
      mobileSair.classList.add('visible');
    } else {
      // Não logado — oculta tudo
      authArea.classList.remove('visible');
      mobileInfo.classList.remove('visible');
      mobileSair.classList.remove('visible');
    }
  }
}

customElements.define('assent-navbar', AssentNavbar);
