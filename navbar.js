// ══════════════════════════════════════
//  FIREBASE — init centralizado (navbar.js)
// ══════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9HEWiHFc8YEuj_Ab-7TxGKqdQkSRQAio",
  authDomain: "assent-2b945.firebaseapp.com",
  projectId: "assent-2b945",
  storageBucket: "assent-2b945.firebasestorage.app",
  messagingSenderId: "851051401705",
  appId: "1:851051401705:web:fa6ebb1cc6ee5d3a737b78",
  measurementId: "G-K7F0F7PZ8M"
};

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// ── Expõe no window para todos os scripts da página ──
window._auth    = auth;
window._db      = db;
window._storage = storage;

window._currentAuthUser   = undefined; // undefined = Firebase ainda resolvendo
window._currentAuthPerfil = null;

window._EmailAuthProvider            = EmailAuthProvider;
window._reauthenticateWithCredential = reauthenticateWithCredential;
window._updatePassword               = updatePassword;
window._signInWithEmailAndPassword   = signInWithEmailAndPassword;
window._createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window._sendPasswordResetEmail       = sendPasswordResetEmail;
window._signOut                      = signOut;
window._doc             = doc;
window._setDoc          = setDoc;
window._getDoc          = getDoc;
window._getDocs         = getDocs;
window._updateDoc       = updateDoc;
window._serverTimestamp = serverTimestamp;
window._collection      = collection;
window._query           = query;
window._where           = where;
window._orderBy         = orderBy;
window._ref             = ref;
window._uploadBytes     = uploadBytes;
window._getDownloadURL  = getDownloadURL;

// ── Gerenciador global de auth ──
// Dispara 'assent:authchange' em qualquer mudança de estado,
// para que qualquer página possa reagir sem importar Firebase novamente.
onAuthStateChanged(auth, async (user) => {
  let perfil = null;
  if (user) {
    try {
      const snap = await getDoc(doc(db, 'perfis', user.uid));
      if (snap.exists()) perfil = snap.data();
    } catch (e) { /* sem acesso à rede ou Firestore */ }
  }
  window._currentAuthUser   = user;   // null = deslogado, object = logado
  window._currentAuthPerfil = perfil;

  window.dispatchEvent(new CustomEvent('assent:authchange', { detail: { user, perfil } }));

  // Atualiza componentes <assent-navbar> já montados na página
  document.querySelectorAll('assent-navbar').forEach(el => {
    if (el._updateAuthUI) el._updateAuthUI(user, perfil);
  });
});


// ══════════════════════════════════════
//  WEB COMPONENT
// ══════════════════════════════════════
class AssentNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        :host { display: block; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ddesc { line-height: 1.6; font-size: .8rem; }

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
          gap: 20px;
        }

        /* ── LINKS ── */
        .links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
          flex: 1;
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

        /* ── AUTH ÁREA ── */
        .nav-auth {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .nav-auth-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #B8860B);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800; font-size: .72rem;
          color: #111;
          text-decoration: none;
          overflow: hidden;
          border: 2px solid rgba(212,175,55,.35);
          transition: border-color .2s, transform .2s;
          flex-shrink: 0;
          cursor: pointer;
        }
        .nav-auth-avatar:hover { border-color: #D4AF37; transform: scale(1.06); }
        .nav-auth-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
        .nav-logout {
          background: none;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 50px;
          padding: 7px 14px;
          color: rgba(255,255,255,.6);
          font-size: .75rem; font-weight: 600;
          cursor: pointer;
          letter-spacing: .06em; text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          transition: all .2s;
          white-space: nowrap;
        }
        .nav-logout:hover { border-color: rgba(224,85,85,.5); color: #f08080; }
        .nav-login-link {
          color: rgba(255,255,255,.8);
          text-decoration: none;
          font-size: .8rem; font-weight: 600;
          letter-spacing: .05em; text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          border: 1px solid rgba(255,255,255,.2);
          padding: 8px 16px;
          border-radius: 50px;
          transition: all .2s;
          white-space: nowrap;
        }
        .nav-login-link:hover { color: #fff; border-color: rgba(255,255,255,.4); background: rgba(255,255,255,.05); }
        /* Skeleton enquanto Firebase resolve */
        .auth-skeleton {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,.06);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: .4; }
          50%       { opacity: .8; }
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
          font-size: .82rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 0 32px rgba(245,166,35,.28);
          transition: background .25s, transform .25s, box-shadow .25s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cta:hover {
          background: #E09820;
          transform: translateY(-2px);
          box-shadow: 0 0 52px rgba(245,166,35,.42);
        }

        /* ── DROPDOWN ── */
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
          display: flex; align-items: flex-start; gap: 14px;
          padding: 18px; border-radius: 10px;
          text-decoration: none; transition: background .2s;
        }
        .ditem:hover { background: rgba(245,166,35,.07); }
        .ditem + .ditem { margin-top: 6px; }

        .dicon {
          width: 42px; height: 42px; flex-shrink: 0;
          border-radius: 10px; background: rgba(245,166,35,.1);
          display: flex; align-items: center; justify-content: center;
          color: #B8841C;
        }
        .dicon svg { width: 22px; height: 22px; }
        .dtitle {
          display: block; font-family: 'Montserrat', sans-serif;
          font-size: .87rem; font-weight: 700; color: #B8841C; margin-bottom: 6px;
        }
        .ddesc { font-size: .77rem; color: #666; line-height: 1.5; }

        /* ── HAMBURGER ── */
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; background: none; border: none; padding: 8px;
        }
        .hamburger span {
          width: 24px; height: 2px; background: #fff;
          border-radius: 2px; display: block; transition: all .3s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── MOBILE MENU ── */
        .mobile-menu {
          display: none; flex-direction: column;
          padding: 8px 28px 24px;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          color: rgba(255,255,255,.8); text-decoration: none;
          font-size: .9rem; font-weight: 500;
          letter-spacing: .05em; text-transform: uppercase;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
          transition: color .2s;
        }
        .mobile-menu a:hover { color: #F5A623; }
        .mobile-auth-sep {
          height: 1px; background: rgba(255,255,255,.08); margin: 4px 0;
        }
        .mobile-logout-btn {
          background: none; border: none;
          color: rgba(255,255,255,.5);
          font-size: .85rem; font-weight: 500;
          letter-spacing: .05em; text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          padding: 14px 0; cursor: pointer; text-align: left;
          border-bottom: 1px solid rgba(255,255,255,.05);
          transition: color .2s; width: 100%;
        }
        .mobile-logout-btn:hover { color: #f08080; }
        .mobile-cta {
          margin-top: 18px; text-align: center;
          background: #F5A623 !important; color: #111 !important;
          border-radius: 50px;
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 700 !important;
          border-bottom: none !important;
          padding: 14px 0 !important;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .links, .cta, .nav-auth { display: none; }
          .hamburger { display: flex; }
        }
      </style>

      <nav id="nav">
        <div class="container">
          <div class="inner">

            <a href="index.html" class="logo">ASSENT</a>

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
                        <path d="M3 3h18v4L12 17 3 7V3z"/>
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

            <!-- AUTH ÁREA — preenchida dinamicamente pelo _updateAuthUI -->
            <div class="nav-auth" id="navAuthArea">
              <div class="auth-skeleton"></div>
            </div>

            <a href="https://wa.me/5562991383079?text=Olá!" class="cta" target="_blank">Análise Gratuita</a>

            <button class="hamburger" id="hamburger">
              <span></span><span></span><span></span>
            </button>
          </div>

          <div class="mobile-menu" id="mobileMenu">
            <a href="/trafego">Tráfego Pago</a>
            <a href="/aplicativos">Aplicativos</a>
            <a href="/fotografia">Fotografia</a>
            <a href="/#provas">Resultados</a>
            <a href="/#processo">Como Funciona</a>
            <a href="/#faq">Dúvidas</a>
            <!-- AUTH mobile — preenchida dinamicamente -->
            <div id="mobileAuthArea"></div>
            <a href="https://wa.me/5562991383079?text=Olá!" class="mobile-cta" target="_blank">Análise Gratuita</a>
          </div>
        </div>
      </nav>
    `;

    // ── Scroll ──
    const nav = this.shadowRoot.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    });

    // ── Dropdown ──
    const dropWrap = this.shadowRoot.getElementById('dropWrap');
    const dropBtn  = this.shadowRoot.getElementById('dropBtn');
    dropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropWrap.classList.toggle('open');
    });
    document.addEventListener('click', () => dropWrap.classList.remove('open'));

    // ── Hamburger ──
    const hamburger  = this.shadowRoot.getElementById('hamburger');
    const mobileMenu = this.shadowRoot.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    this.shadowRoot.querySelectorAll('.mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // ── Auth UI ──
    this._updateAuthUI = (user, perfil) => {
      const authArea       = this.shadowRoot.getElementById('navAuthArea');
      const mobileAuthArea = this.shadowRoot.getElementById('mobileAuthArea');
      if (!authArea) return;

      if (user) {
        const nome     = perfil?.nome || user.email || '';
        const initials = nome
          ? nome.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
          : (user.email || '?')[0].toUpperCase();
        const avatarHTML = perfil?.fotoURL
          ? `<img src="${perfil.fotoURL}" alt="avatar"/>`
          : initials;

        // Desktop: avatar + botão sair
        authArea.innerHTML = `
          <a href="/membros" class="nav-auth-avatar" title="Minha conta">${avatarHTML}</a>
          <button class="nav-logout" id="navLogoutBtn">Sair</button>
        `;
        this.shadowRoot.getElementById('navLogoutBtn')
          .addEventListener('click', () => signOut(auth));

        // Mobile: minha conta + sair
        mobileAuthArea.innerHTML = `
          <div class="mobile-auth-sep"></div>
          <a href="/membros">Minha Conta</a>
          <button class="mobile-logout-btn" id="mobileLogoutBtn">Sair da conta</button>
        `;
        const mobileLogout = this.shadowRoot.getElementById('mobileLogoutBtn');
        if (mobileLogout) {
          mobileLogout.addEventListener('click', () => {
            signOut(auth);
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
          });
        }

      } else {
        // Desktop: link de login
        authArea.innerHTML = `<a href="/membros" class="nav-login-link">Login / Cadastrar-se</a>`;

        // Mobile: link de login
        mobileAuthArea.innerHTML = `
          <div class="mobile-auth-sep"></div>
          <a href="/membros">Login / Cadastrar-se</a>
        `;
      }
    };

    // Se Firebase já resolveu antes deste componente montar (improvável mas possível)
    if (window._currentAuthUser !== undefined) {
      this._updateAuthUI(window._currentAuthUser, window._currentAuthPerfil);
    }

    // Escuta mudanças de auth vindas do gerenciador global
    window.addEventListener('assent:authchange', (e) => {
      this._updateAuthUI(e.detail.user, e.detail.perfil);
    });
  }
}

customElements.define('assent-navbar', AssentNavbar);
