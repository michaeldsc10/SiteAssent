class AssentNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        :host {
          display: block;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
	.ddesc {
	  line-height: 1.6;
 	 font-size: .8rem;
	}
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

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
        }
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
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 18px;
          border-radius: 10px;
          text-decoration: none;
          transition: background .2s;
        }
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
          line-height: 1.5;
        }
	.ditem + .ditem {
	  margin-top: 6px;
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

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .links, .cta { display: none; }
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
            <a href="https://wa.me/5562991383079?text=Olá!" class="mobile-cta" target="_blank">Análise Gratuita</a>
          </div>
        </div>
      </nav>
    `;

    // Scroll
    const nav = this.shadowRoot.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    });

    // Dropdown
    const dropWrap = this.shadowRoot.getElementById('dropWrap');
    const dropBtn  = this.shadowRoot.getElementById('dropBtn');
    dropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropWrap.classList.toggle('open');
    });
    document.addEventListener('click', () => dropWrap.classList.remove('open'));

    // Hamburger
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
  }
}

customElements.define('assent-navbar', AssentNavbar);
