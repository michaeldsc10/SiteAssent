/**
 * navbar.js — ASSENT Agência
 * ─────────────────────────────────────────────────────────
 * COMO FUNCIONA:
 *
 *  1. Define o Web Component <assent-navbar>
 *  2. Inicializa Firebase (Auth + Firestore) via ESM
 *  3. Dispara `assent:authchange` → as páginas escutam isso
 *  4. Exibe avatar + nome + SAIR *depois* do CTA quando logado
 *
 * ⚙️  CONFIGURAÇÃO: troque os valores de FIREBASE_CONFIG.
 * ─────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, getApp }
  from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification, EmailAuthProvider,
  reauthenticateWithCredential, updatePassword
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, getDocs, setDoc, addDoc,
  collection, query, where, orderBy, serverTimestamp, deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

/* ══════════════════════════════════════
   ⚙️  CONFIGURAÇÃO — substitua aqui
══════════════════════════════════════ */
const FIREBASE_CONFIG = {
   apiKey: "AIzaSyB9HEWiHFc8YEuj_Ab-7TxGKqdQkSRQAio",
  authDomain: "assent-2b945.firebaseapp.com",
  projectId: "assent-2b945",
  storageBucket: "assent-2b945.firebasestorage.app",
  messagingSenderId: "851051401705",
  appId: "1:851051401705:web:fa6ebb1cc6ee5d3a737b78",
  measurementId: "G-K7F0F7PZ8M"
};

/* ── Firebase init ── */
const _app  = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
const _auth = getAuth(_app);
const _db   = getFirestore(_app);

/* ── Helpers globais ── */
window._auth                              = _auth;
window._signInWithEmailAndPassword        = signInWithEmailAndPassword;
window._createUserWithEmailAndPassword    = createUserWithEmailAndPassword;
window._sendPasswordResetEmail            = sendPasswordResetEmail;
window._signOut                           = signOut;
window._EmailAuthProvider                 = EmailAuthProvider;
window._reauthenticateWithCredential      = reauthenticateWithCredential;
window._updatePassword                    = updatePassword;
window._sendEmailVerification             = sendEmailVerification;

window._db              = _db;
window._doc             = doc;
window._collection      = collection;
window._getDoc          = getDoc;
window._getDocs         = getDocs;
window._setDoc          = setDoc;
window._addDoc          = addDoc;
window._deleteDoc       = deleteDoc;
window._query           = query;
window._where           = where;
window._orderBy         = orderBy;
window._serverTimestamp = serverTimestamp;

/* ── Escuta auth e dispara evento global ── */
onAuthStateChanged(_auth, (user) => {
  window.dispatchEvent(new CustomEvent('assent:authchange', { detail: { user } }));
});

/* ── Logout global ── */
window._logout = () => signOut(_auth).then(() => { window.location.href = '/'; });

/* ══════════════════════════════════════
   WEB COMPONENT
══════════════════════════════════════ */
class AssentNavbar extends HTMLElement {
  connectedCallback() {
    this._mount();
    this._bindEvents();
    window.addEventListener('assent:authchange', (e) => {
      this._onAuth(e.detail.user);
    });
  }

  _initial(user) {
    if (user?.displayName) return user.displayName[0].toUpperCase();
    if (user?.email)       return user.email[0].toUpperCase();
    return '?';
  }

  _mount() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
:host{display:block;}
*{box-sizing:border-box;margin:0;padding:0;}

.logo{
  font-family:'Montserrat',sans-serif;font-size:1.35rem;font-weight:800;
  letter-spacing:-.01em;text-decoration:none;color:#D4AF37;
}

nav{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  background:#1c1a14;border-bottom:1px solid rgba(255,255,255,.07);
  font-family:'Inter',sans-serif;transition:background .3s,box-shadow .3s;
}
nav.scrolled{background:rgba(20,18,12,.98);backdrop-filter:blur(20px);box-shadow:0 1px 0 rgba(212,175,55,.08),0 8px 40px rgba(0,0,0,.5);}
.container{max-width:1200px;margin:0 auto;padding:0 28px;}
.inner{display:flex;align-items:center;justify-content:space-between;height:68px;}

.links{display:flex;align-items:center;gap:32px;list-style:none;}
.links a,.drop-trigger{
  color:rgba(255,255,255,.65);text-decoration:none;font-size:.82rem;font-weight:500;
  letter-spacing:.07em;text-transform:uppercase;transition:color .2s;
  background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;
  padding:0;display:flex;align-items:center;gap:5px;
}
.links a:hover,.drop-trigger:hover{color:#fff;}

/* Lado direito */
.right{display:flex;align-items:center;gap:10px;}

.cta{
  display:inline-flex;align-items:center;
  padding:11px 26px;border-radius:50px;background:#F5A623;color:#111;
  font-family:'Montserrat',sans-serif;font-size:.82rem;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;text-decoration:none;
  box-shadow:0 0 32px rgba(245,166,35,.28);
  transition:background .25s,transform .25s,box-shadow .25s;white-space:nowrap;
}
.cta:hover{background:#E09820;transform:translateY(-2px);box-shadow:0 0 52px rgba(245,166,35,.42);}

/* Botão ENTRAR */
.btn-entrar{
  display:inline-flex;align-items:center;gap:7px;
  padding:9px 20px;border-radius:50px;
  border:1px solid rgba(255,255,255,.15);background:transparent;
  color:rgba(255,255,255,.65);
  font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;
  letter-spacing:.05em;text-transform:uppercase;
  text-decoration:none;white-space:nowrap;
  transition:border-color .2s,color .2s,background .2s;
}
.btn-entrar svg{width:14px;height:14px;flex-shrink:0;}
.btn-entrar:hover{border-color:rgba(255,255,255,.35);color:#fff;background:rgba(255,255,255,.04);}
.right.logado .btn-entrar{opacity:0;pointer-events:none;width:0;padding:0;border:none;overflow:hidden;margin:0;}

/* Separador */
.sep{width:1px;height:22px;background:rgba(255,255,255,.1);opacity:0;pointer-events:none;transition:opacity .3s;}

/* Avatar */
.avatar{
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,#D4AF37,#B8860B);
  color:#111;font-family:'Montserrat',sans-serif;font-size:.82rem;font-weight:800;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 14px rgba(212,175,55,.3);cursor:pointer;
  opacity:0;pointer-events:none;transform:scale(.8);
  transition:opacity .3s,transform .3s;overflow:hidden;flex-shrink:0;
}
.avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;}

/* Nome do usuário */
.user-name{
  font-family:'Inter',sans-serif;font-size:.8rem;font-weight:500;
  color:rgba(255,255,255,.75);white-space:nowrap;
  max-width:110px;overflow:hidden;text-overflow:ellipsis;
  opacity:0;pointer-events:none;transform:translateX(-6px);
  transition:opacity .35s,transform .35s;
}

/* Botão SAIR */
.btn-sair{
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 16px;border-radius:50px;
  border:1px solid rgba(255,255,255,.12);background:transparent;
  color:rgba(255,255,255,.5);
  font-family:'Inter',sans-serif;font-size:.75rem;font-weight:600;
  letter-spacing:.05em;text-transform:uppercase;cursor:pointer;
  opacity:0;pointer-events:none;transform:translateX(-4px);
  transition:opacity .3s,transform .3s,border-color .2s,color .2s,background .2s;
  white-space:nowrap;
}
.btn-sair svg{width:13px;height:13px;flex-shrink:0;}
.btn-sair:hover{border-color:rgba(224,85,85,.4);color:#ff8a80;background:rgba(224,85,85,.05);}

/* Quando logado */
.right.logado .sep,
.right.logado .avatar,
.right.logado .user-name,
.right.logado .btn-sair{opacity:1;pointer-events:auto;transform:none;}

/* ══════════════════════════════════════
   DROPDOWN — redesign premium
══════════════════════════════════════ */
.drop-wrap{position:relative;}
.arrow{display:inline-flex;transition:transform .3s cubic-bezier(.4,0,.2,1);}
.drop-wrap.open .arrow{transform:rotate(180deg);}
.drop-trigger.active,.drop-wrap.open .drop-trigger{color:#fff;}

.dropdown{
  position:absolute;top:calc(100% + 18px);left:50%;
  transform:translateX(-50%) translateY(-10px);
  background:rgba(15,13,8,.97);
  backdrop-filter:blur(40px) saturate(1.4);
  -webkit-backdrop-filter:blur(40px) saturate(1.4);
  border-radius:18px;
  min-width:400px;
  border:1px solid rgba(255,255,255,.07);
  border-top:1px solid rgba(212,175,55,.2);
  box-shadow:
    0 0 0 1px rgba(0,0,0,.5),
    0 24px 80px rgba(0,0,0,.75),
    0 2px 0 rgba(212,175,55,.08) inset;
  z-index:10;
  visibility:hidden;
  opacity:0;
  pointer-events:none;
  transition:opacity .28s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1), visibility 0s .28s;
  overflow:hidden;
}
.drop-wrap.open .dropdown{
  visibility:visible;
  opacity:1;
  pointer-events:auto;
  transform:translateX(-50%) translateY(0);
  transition:opacity .28s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1), visibility 0s 0s;
}

/* Indicador triangular */
.dropdown::before{
  content:'';
  position:absolute;top:-5px;left:50%;transform:translateX(-50%);
  width:10px;height:5px;
  background:rgba(212,175,55,.25);
  clip-path:polygon(50% 0%,0% 100%,100% 100%);
}

/* Header interno */
.d-header{
  padding:16px 20px 12px;
  display:flex;align-items:center;justify-content:space-between;
}
.d-header-label{
  font-family:'Montserrat',sans-serif;font-size:.6rem;font-weight:700;
  letter-spacing:.18em;color:rgba(212,175,55,.45);text-transform:uppercase;
}
.d-header-line{
  flex:1;height:1px;background:linear-gradient(to right,rgba(212,175,55,.15),transparent);
  margin-left:12px;
}

/* Lista de itens */
.d-list{padding:0 10px 14px;display:flex;flex-direction:column;gap:6px;}

.ditem{
  display:flex;align-items:center;gap:14px;padding:16px 12px;
  border-radius:12px;text-decoration:none;
  transition:background .22s ease;
  position:relative;
}
.ditem:hover{background:rgba(212,175,55,.06);}
.ditem:hover .dicon{
  background:rgba(212,175,55,.14);
  border-color:rgba(212,175,55,.25);
  color:#F5C842;
}
.ditem:hover .dtitle{color:#fff;}
.ditem:hover .darrow{color:rgba(212,175,55,.5);transform:translateX(2px);}

/* Ícone */
.dicon{
  width:40px;height:40px;flex-shrink:0;border-radius:10px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.07);
  display:flex;align-items:center;justify-content:center;
  color:rgba(212,175,55,.6);
  transition:background .22s,border-color .22s,color .22s;
}
.dicon svg{width:18px;height:18px;}

/* Texto */
.d-text{flex:1;min-width:0;}
.dtitle{
  display:block;font-family:'Inter',sans-serif;font-size:.875rem;font-weight:600;
  color:rgba(255,255,255,.85);margin-bottom:3px;letter-spacing:.01em;
  transition:color .22s;
}
.ddesc{
  display:block;font-size:.75rem;color:rgba(255,255,255,.35);
  line-height:1.55;font-weight:400;
}

/* Seta lateral */
.darrow{
  flex-shrink:0;color:rgba(255,255,255,.15);
  transition:color .22s,transform .22s;
}
.darrow svg{width:14px;height:14px;display:block;}



/* ══════════════════════════════════════
   HAMBURGER + MOBILE
══════════════════════════════════════ */
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:8px;}
.hamburger span{width:24px;height:2px;background:#fff;border-radius:2px;display:block;transition:all .3s;}
.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
.hamburger.open span:nth-child(2){opacity:0;}
.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

.mob{display:none;flex-direction:column;padding:8px 28px 24px;border-top:1px solid rgba(255,255,255,.06);}
.mob.open{display:flex;}
.mob a{
  color:rgba(255,255,255,.8);text-decoration:none;font-size:.9rem;font-weight:500;
  letter-spacing:.05em;text-transform:uppercase;padding:14px 0;
  border-bottom:1px solid rgba(255,255,255,.05);transition:color .2s;
}
.mob a:hover{color:#F5A623;}
.mob-user{display:none;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.mob-user.show{display:flex;}
.mob-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#B8860B);color:#111;font-family:'Montserrat',sans-serif;font-size:.75rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}
.mob-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.mob-email{font-size:.75rem;color:rgba(255,255,255,.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;}
.mob-cta{margin-top:18px;text-align:center;background:#F5A623 !important;color:#111 !important;border-radius:50px;font-family:'Montserrat',sans-serif !important;font-weight:700 !important;border-bottom:none !important;padding:14px 0 !important;}
.mob-entrar{text-align:center;color:rgba(255,255,255,.5) !important;font-size:.82rem !important;border-bottom:none !important;padding:10px 0 !important;text-transform:none !important;letter-spacing:.02em !important;margin-top:6px;}
.mob-entrar.hide{display:none !important;}
.mob-sair{display:none !important;text-align:center;color:rgba(255,255,255,.35) !important;font-size:.8rem !important;border-bottom:none !important;padding:10px 0 4px !important;text-transform:none !important;letter-spacing:.01em !important;}
.mob-sair.show{display:block !important;}

@media(max-width:900px){
  .links,.right{display:none;}
  .hamburger{display:flex;}
}
</style>

<nav id="nav">
  <div class="container">
    <div class="inner">
      <a href="/" class="logo">ASSENT</a>

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
            <!-- Header -->
            <div class="d-header">
              <span class="d-header-label">O que fazemos</span>
              <span class="d-header-line"></span>
            </div>

            <!-- Itens -->
            <div class="d-list">
              <a href="/trafego" class="ditem">
                <div class="dicon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div class="d-text">
                  <span class="dtitle">Gestão de Tráfego Pago</span>
                  <span class="ddesc">Anúncios estratégicos para empresas que querem resultados previsíveis.</span>
                </div>
                <span class="darrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </span>
              </a>

              <a href="/aplicativos" class="ditem">
                <div class="dicon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5"/>
                  </svg>
                </div>
                <div class="d-text">
                  <span class="dtitle">Aplicativos</span>
                  <span class="ddesc">Soluções digitais personalizadas para escalar o seu negócio.</span>
                </div>
                <span class="darrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </span>
              </a>

              <a href="/fotografia" class="ditem">
                <div class="dicon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    <circle cx="12" cy="14" r="3"/>
                  </svg>
                </div>
                <div class="d-text">
                  <span class="dtitle">Fotografia Profissional</span>
                  <span class="ddesc">Imagens que valorizam sua marca e convertem visitantes em clientes.</span>
                </div>
                <span class="darrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </span>
              </a>
            </div>


          </div>
        </li>
        <li><a href="/#provas">Resultados</a></li>
        <li><a href="/#processo">Como Funciona</a></li>
        <li><a href="/#faq">Dúvidas</a></li>
      </ul>

      <!-- CTA + Auth (desktop) -->
      <div class="right" id="rightSide">
        <a href="/membros" class="btn-entrar" id="btnEntrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          Entrar
        </a>
        <div class="sep"></div>
        <div class="avatar" id="avatar" title=""></div>
        <span class="user-name" id="userName"></span>
        <button class="btn-sair" id="btnSair">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>

      <button class="hamburger" id="hamburger"><span></span><span></span><span></span></button>
    </div>

    <div class="mob" id="mob">
      <div class="mob-user" id="mobUser">
        <div class="mob-avatar" id="mobAvatar"></div>
        <span class="mob-email" id="mobEmail"></span>
      </div>
      <a href="/trafego">Tráfego Pago</a>
      <a href="/aplicativos">Aplicativos</a>
      <a href="/fotografia">Fotografia</a>
      <a href="/#provas">Resultados</a>
      <a href="/#processo">Como Funciona</a>
      <a href="/#faq">Dúvidas</a>
      <a href="/membros" class="mob-entrar" id="mobEntrar">👤 Área do Cliente</a>
      <a href="#" class="mob-sair" id="mobSair">↩ Sair da conta</a>
    </div>
  </div>
</nav>`;
  }

  _bindEvents() {
    const sr = this.shadowRoot;

    window.addEventListener('scroll', () => {
      sr.getElementById('nav').classList.toggle('scrolled', window.scrollY > 30);
    });

    const dropWrap = sr.getElementById('dropWrap');
    sr.getElementById('dropBtn').addEventListener('click', e => {
      e.stopPropagation();
      dropWrap.classList.toggle('open');
    });
    document.addEventListener('click', () => dropWrap.classList.remove('open'));

    const ham = sr.getElementById('hamburger');
    const mob = sr.getElementById('mob');
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
    sr.querySelectorAll('.mob a:not(.mob-sair)').forEach(a => {
      a.addEventListener('click', () => {
        ham.classList.remove('open');
        mob.classList.remove('open');
      });
    });

    sr.getElementById('btnSair').addEventListener('click', () => window._logout?.());
    sr.getElementById('mobSair').addEventListener('click', e => { e.preventDefault(); window._logout?.(); });

    const avatar = sr.getElementById('avatar');
    avatar.addEventListener('click', () => { window.location.href = '/membros'; });
    avatar.style.cursor = 'pointer';
  }

  async _onAuth(user) {
    const sr        = this.shadowRoot;
    const right     = sr.getElementById('rightSide');
    const avatar    = sr.getElementById('avatar');
    const userName  = sr.getElementById('userName');
    const mobUser   = sr.getElementById('mobUser');
    const mobAvatar = sr.getElementById('mobAvatar');
    const mobEmail  = sr.getElementById('mobEmail');
    const mobSair   = sr.getElementById('mobSair');
    const mobEntrar = sr.getElementById('mobEntrar');

    if (user) {
      const ini = this._initial(user);
      right.classList.add('logado');
      avatar.title = user.email || '';
      mobUser.classList.add('show');
      mobEmail.textContent = user.email || '';
      mobSair.classList.add('show');
      mobEntrar.classList.add('hide');

      /* ── Foto (users/{uid}/foto/avatar) ── */
      try {
        const snap = await getDoc(doc(_db, 'users', user.uid, 'foto', 'avatar'));
        const foto = snap.exists() ? snap.data()?.base64 : null;
        if (foto) {
          avatar.innerHTML    = `<img src="${foto}" alt="foto"/>`;
          mobAvatar.innerHTML = `<img src="${foto}" alt="foto"/>`;
        } else {
          avatar.textContent    = ini;
          mobAvatar.textContent = ini;
        }
      } catch {
        avatar.textContent    = ini;
        mobAvatar.textContent = ini;
      }

      /* ── Nome (licencas/{uid}) ── */
      try {
        const licSnap = await getDoc(doc(_db, 'licencas', user.uid));
        if (licSnap.exists()) {
          const fullName = licSnap.data()?.name || '';
          /* Exibe apenas o primeiro nome */
          userName.textContent = fullName.split(' ')[0] || '';
        }
      } catch {
        /* Silencia: nome permanece oculto */
      }

    } else {
      right.classList.remove('logado');
      userName.textContent = '';
      mobUser.classList.remove('show');
      mobSair.classList.remove('show');
      mobEntrar.classList.remove('hide');
    }
  }
}

customElements.define('assent-navbar', AssentNavbar);
