/**
 * navbar.js — ASSENT Agência
 * ─────────────────────────────────────────────────────────
 * COMO FUNCIONA:
 *
 *  1. Define o Web Component <assent-navbar>
 *  2. Inicializa Firebase (Auth + Firestore) via ESM
 *  3. Dispara `assent:authchange` → as páginas escutam isso
 *  4. Exibe avatar + SAIR *depois* do CTA quando logado
 *
 * ⚙️  CONFIGURAÇÃO: troque os valores de FIREBASE_CONFIG.
 * ─────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, getApp }
  from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, EmailAuthProvider,
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

/* ── Helpers globais (usados pelas páginas via window._*) ── */
window._auth            = _auth;
window._signInWithEmailAndPassword    = signInWithEmailAndPassword;
window._createUserWithEmailAndPassword= createUserWithEmailAndPassword;
window._sendPasswordResetEmail        = sendPasswordResetEmail;
window._signOut                       = signOut;
window._EmailAuthProvider             = EmailAuthProvider;
window._reauthenticateWithCredential  = reauthenticateWithCredential;
window._updatePassword                = updatePassword;

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

    /* Escuta auth para atualizar avatar/sair */
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
  letter-spacing:-.01em;text-decoration:none;
  background:linear-gradient(90deg,#D4AF37 0%,#EAEAEA 25%,#D4AF37 50%,#EAEAEA 75%,#B8860B 100%);
  background-size:250% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:shimmer 4s ease-in-out infinite;
}
@keyframes shimmer{0%{background-position:0% center}50%{background-position:100% center}100%{background-position:0% center}}

nav{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  background:#1c1a14;border-bottom:1px solid rgba(255,255,255,.1);
  font-family:'Inter',sans-serif;transition:background .3s,box-shadow .3s;
}
nav.scrolled{background:rgba(28,26,20,.97);backdrop-filter:blur(16px);box-shadow:0 2px 24px rgba(0,0,0,.5);}
.container{max-width:1200px;margin:0 auto;padding:0 28px;}
.inner{display:flex;align-items:center;justify-content:space-between;height:68px;}

.links{display:flex;align-items:center;gap:32px;list-style:none;}
.links a,.drop-trigger{
  color:rgba(255,255,255,.75);text-decoration:none;font-size:.84rem;font-weight:500;
  letter-spacing:.06em;text-transform:uppercase;transition:color .2s;
  background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;
  padding:0;display:flex;align-items:center;gap:5px;
}
.links a:hover,.drop-trigger:hover{color:#fff;}

/* Lado direito agrupa CTA + auth */
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

/* Botão ENTRAR — visível quando deslogado, some quando logado */
.btn-entrar{
  display:inline-flex;align-items:center;gap:7px;
  padding:9px 20px;border-radius:50px;
  border:1px solid rgba(255,255,255,.2);background:transparent;
  color:rgba(255,255,255,.75);
  font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;
  letter-spacing:.05em;text-transform:uppercase;
  text-decoration:none;white-space:nowrap;
  transition:border-color .2s,color .2s,background .2s;
}
.btn-entrar svg{width:14px;height:14px;flex-shrink:0;}
.btn-entrar:hover{border-color:rgba(255,255,255,.4);color:#fff;background:rgba(255,255,255,.05);}
/* Some e fica não-clicável quando logado */
.right.logado .btn-entrar{opacity:0;pointer-events:none;width:0;padding:0;border:none;overflow:hidden;margin:0;}

/* Separador vertical — só aparece quando logado */
.sep{
  width:1px;height:22px;background:rgba(255,255,255,.12);
  opacity:0;pointer-events:none;transition:opacity .3s;
}

/* Avatar */
.avatar{
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,#D4AF37,#B8860B);
  color:#111;font-family:'Montserrat',sans-serif;font-size:.82rem;font-weight:800;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 14px rgba(212,175,55,.3);cursor:default;
  opacity:0;pointer-events:none;transform:scale(.8);
  transition:opacity .3s,transform .3s;
}

/* Botão sair — invisível E não clicável quando deslogado */
.btn-sair{
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 16px;border-radius:50px;
  border:1px solid rgba(255,255,255,.15);background:transparent;
  color:rgba(255,255,255,.6);
  font-family:'Inter',sans-serif;font-size:.75rem;font-weight:600;
  letter-spacing:.05em;text-transform:uppercase;cursor:pointer;
  opacity:0;pointer-events:none;transform:translateX(-4px);
  transition:opacity .3s,transform .3s,border-color .2s,color .2s,background .2s;
  white-space:nowrap;
}
.btn-sair svg{width:13px;height:13px;flex-shrink:0;}
.btn-sair:hover{border-color:rgba(224,85,85,.5);color:#ff8a80;background:rgba(224,85,85,.06);}

/* Quando logado — revela E reativa os elementos de auth */
.right.logado .sep,
.right.logado .avatar,
.right.logado .btn-sair{opacity:1;pointer-events:auto;transform:none;}

/* Dropdown */
.drop-wrap{position:relative;}
.arrow{display:inline-flex;transition:transform .25s;}
.drop-wrap.open .arrow{transform:rotate(180deg);}
.dropdown{
  display:none;position:absolute;top:calc(100% + 16px);left:50%;
  transform:translateX(-50%);background:#fff;border-radius:14px;padding:18px;
  box-shadow:0 8px 40px rgba(0,0,0,.22);min-width:420px;
  border:1px solid rgba(0,0,0,.06);z-index:10;
}
.dropdown::before{
  content:'';position:absolute;top:-7px;left:50%;
  transform:translateX(-50%) rotate(45deg);
  width:13px;height:13px;background:#fff;
  border-left:1px solid rgba(0,0,0,.06);border-top:1px solid rgba(0,0,0,.06);
}
.drop-wrap.open .dropdown{display:block;}
.ditem{display:flex;align-items:flex-start;gap:14px;padding:18px;border-radius:10px;text-decoration:none;transition:background .2s;}
.ditem+.ditem{margin-top:6px;}
.ditem:hover{background:rgba(245,166,35,.07);}
.dicon{width:42px;height:42px;flex-shrink:0;border-radius:10px;background:rgba(245,166,35,.1);display:flex;align-items:center;justify-content:center;color:#B8841C;}
.dicon svg{width:22px;height:22px;}
.dtitle{display:block;font-family:'Montserrat',sans-serif;font-size:.87rem;font-weight:700;color:#B8841C;margin-bottom:6px;}
.ddesc{font-size:.77rem;color:#666;line-height:1.6;}

/* Hamburger */
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:8px;}
.hamburger span{width:24px;height:2px;background:#fff;border-radius:2px;display:block;transition:all .3s;}
.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
.hamburger.open span:nth-child(2){opacity:0;}
.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

/* Mobile menu */
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
.mob-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#B8860B);color:#111;font-family:'Montserrat',sans-serif;font-size:.75rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
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
            <a href="/trafego" class="ditem">
              <div class="dicon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <div><span class="dtitle">Gestão de Tráfego Pago</span><span class="ddesc">Anúncios estratégicos para empresas que querem resultados previsíveis.</span></div>
            </a>
            <a href="/aplicativos" class="ditem">
              <div class="dicon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5"/></svg></div>
              <div><span class="dtitle">Aplicativos</span><span class="ddesc">Soluções digitais personalizadas para escalar o seu negócio.</span></div>
            </a>
            <a href="/fotografia" class="ditem">
              <div class="dicon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="12" cy="14" r="3"/></svg></div>
              <div><span class="dtitle">Fotografia Profissional</span><span class="ddesc">Imagens que valorizam sua marca e convertem visitantes em clientes.</span></div>
            </a>
          </div>
        </li>
        <li><a href="/#provas">Resultados</a></li>
        <li><a href="/#processo">Como Funciona</a></li>
        <li><a href="/#faq">Dúvidas</a></li>
      </ul>

      <!-- CTA + Entrar/Avatar + Sair (desktop) -->
      <div class="right" id="rightSide">
        <a href="https://wa.me/5562991383079?text=Olá!" class="cta" target="_blank">Análise Gratuita</a>
        <!-- Botão Entrar — visível quando deslogado -->
        <a href="/membros" class="btn-entrar" id="btnEntrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          Entrar
        </a>
        <div class="sep"></div>
        <div class="avatar" id="avatar" title=""></div>
        <button class="btn-sair" id="btnSair">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
      <a href="https://wa.me/5562991383079?text=Olá!" class="mob-cta" target="_blank">Análise Gratuita</a>
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
      e.stopPropagation(); dropWrap.classList.toggle('open');
    });
    document.addEventListener('click', () => dropWrap.classList.remove('open'));

    const ham = sr.getElementById('hamburger');
    const mob = sr.getElementById('mob');
    ham.addEventListener('click', () => {
      ham.classList.toggle('open'); mob.classList.toggle('open');
    });
    sr.querySelectorAll('.mob a:not(.mob-sair)').forEach(a => {
      a.addEventListener('click', () => { ham.classList.remove('open'); mob.classList.remove('open'); });
    });
    sr.getElementById('btnSair').addEventListener('click', () => window._logout?.());
    sr.getElementById('mobSair').addEventListener('click', e => { e.preventDefault(); window._logout?.(); });
    sr.getElementById('avatar').addEventListener('click', () => { window.location.href = '/membros'; });
    sr.getElementById('avatar').style.cursor = 'pointer';
  }

  _onAuth(user) {
    const sr = this.shadowRoot;
    const right      = sr.getElementById('rightSide');
    const avatar     = sr.getElementById('avatar');
    const btnEntrar  = sr.getElementById('btnEntrar');
    const mobUser    = sr.getElementById('mobUser');
    const mobAvatar  = sr.getElementById('mobAvatar');
    const mobEmail   = sr.getElementById('mobEmail');
    const mobSair    = sr.getElementById('mobSair');
    const mobEntrar  = sr.getElementById('mobEntrar');

    if (user) {
      const ini = this._initial(user);
      // Desktop: modo logado (esconde Entrar, mostra avatar+sair)
      right.classList.add('logado');
      avatar.textContent   = ini;
      avatar.title         = user.email || '';
      // Mobile: mostra info + sair, esconde entrar
      mobUser.classList.add('show');
      mobAvatar.textContent = ini;
      mobEmail.textContent  = user.email || '';
      mobSair.classList.add('show');
      mobEntrar.classList.add('hide');
    } else {
      // Desktop: modo deslogado
      right.classList.remove('logado');
      // Mobile: esconde info + sair, mostra entrar
      mobUser.classList.remove('show');
      mobSair.classList.remove('show');
      mobEntrar.classList.remove('hide');
    }
  }
}

customElements.define('assent-navbar', AssentNavbar);
