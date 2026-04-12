/**
 * footer.js — ASSENT Agência
 * ─────────────────────────────────────────────────────────────
 * Web Component <assent-footer> — Rodapé global do site.
 *
 * Uso nas páginas:
 *   <script type="module" src="/footer.js"></script>
 *   <assent-footer></assent-footer>
 *
 * Atributos opcionais (para personalizar por página):
 *   wa-text="Olá! Vim pelo site..."   — Texto pré-preenchido do WhatsApp
 *   hide-wa-float                     — Oculta o botão flutuante do WA
 *
 * Exemplo:
 *   <assent-footer wa-text="Vim da página de cursos"></assent-footer>
 *   <assent-footer hide-wa-float></assent-footer>
 * ─────────────────────────────────────────────────────────────
 */

class AssentFooter extends HTMLElement {

  static get observedAttributes() {
    return ['wa-text', 'hide-wa-float'];
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this._render();
  }

  _render() {
    const waText = this.getAttribute('wa-text')
      || 'Olá! Vim pelo site da Assent Agência e gostaria de saber mais sobre os serviços.';
    const waHref = `https://wa.me/5562991383079?text=${encodeURIComponent(waText)}`;
    const hideWa = this.hasAttribute('hide-wa-float');

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        :host { display: block; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── TOKENS ── */
        :host {
          --bg:       #111111;
          --bg-ft:    #0a0a0a;
          --gold:     #F5A623;
          --gold-dk:  #B8841C;
          --white:    #FFFFFF;
          --muted:    #777777;
          --border:   rgba(255,255,255,0.07);
          --wa:       #25D366;
          --heading:  'Montserrat', sans-serif;
          --body:     'Inter', sans-serif;
        }

        /* ── FOOTER ── */
        footer {
          background: var(--bg-ft);
          border-top: 1px solid var(--border);
          padding: 48px 0 32px;
          font-family: var(--body);
          color: var(--white);
        }

        .container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Linha superior: logo + links */
        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        /* Logo */
        .footer-logo {
          font-family: var(--heading);
          font-weight: 800;
          font-size: 1rem;
          color: var(--white);
          text-decoration: none;
          letter-spacing: .06em;
        }
        .footer-logo span { color: var(--gold); }

        /* Links */
        .footer-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .footer-links a {
          color: var(--muted);
          text-decoration: none;
          font-size: .83rem;
          transition: color .2s;
          font-family: var(--body);
        }
        .footer-links a:hover { color: var(--white); }

        /* Ícones sociais */
        .footer-social {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .social-link {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--muted);
          text-decoration: none;
          transition: border-color .2s, color .2s, background .2s;
        }
        .social-link:hover {
          border-color: rgba(245,166,35,.4);
          color: var(--gold);
          background: rgba(245,166,35,.06);
        }
        .social-link svg { width: 16px; height: 16px; }

        /* Divider */
        .footer-divider {
          height: 1px;
          background: var(--border);
          margin: 32px 0 24px;
        }

        /* Linha inferior: copy + badge */
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-copy {
          color: var(--muted);
          font-size: .78rem;
          line-height: 1.7;
        }
        .footer-copy span { font-size: .72rem; }

        /* Badge "feito com" */
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .72rem;
          color: var(--muted);
          letter-spacing: .04em;
        }
        .footer-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 6px rgba(245,166,35,.5);
          flex-shrink: 0;
        }

        /* ── WA FLOAT ── */
        .wa-float {
          position: fixed;
          bottom: 28px; right: 28px;
          z-index: 999;
          width: 60px; height: 60px;
          background: var(--wa);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 24px rgba(37,211,102,0.4);
          animation: waFloat 2.5s ease-in-out infinite;
          cursor: pointer;
          text-decoration: none;
        }
        .wa-float.hidden { display: none; }
        .wa-float svg { width: 30px; height: 30px; fill: #fff; }

        @keyframes waFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-6px) scale(1.04); }
        }

        .wa-tooltip {
          position: absolute;
          right: 72px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,.08);
          color: var(--white);
          padding: 10px 16px;
          border-radius: 10px;
          font-size: .82rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity .3s;
          font-family: var(--body);
        }
        .wa-float:hover .wa-tooltip { opacity: 1; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .footer-inner { flex-direction: column; align-items: flex-start; gap: 24px; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
          .footer-links { gap: 16px; }
          .wa-float { bottom: 20px; right: 20px; width: 52px; height: 52px; }
          .wa-float svg { width: 26px; height: 26px; }
        }
      </style>

      <!-- ══ RODAPÉ ══ -->
      <footer>
        <div class="container">

          <!-- Linha superior -->
          <div class="footer-inner">

            <!-- Logo -->
            <a href="/" class="footer-logo">ASSENT <span>AGÊNCIA</span></a>

            <!-- Links de navegação -->
            <nav class="footer-links">
              <a href="/trafego">Tráfego Pago</a>
              <a href="/aplicativos">Aplicativos</a>
              <a href="/fotografia">Fotografia</a>
              <a href="/#provas">Resultados</a>
              <a href="/#processo">Como Funciona</a>
              <a href="/#faq">FAQ</a>
            </nav>

            <!-- Ícones sociais -->
            <div class="footer-social">
              <!-- Instagram -->
              <a href="https://instagram.com/assentagencia" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <!-- WhatsApp -->
              <a href="${waHref}" target="_blank" rel="noopener" class="social-link" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>

          </div>

          <!-- Divider -->
          <div class="footer-divider"></div>

          <!-- Linha inferior -->
          <div class="footer-bottom">
            <div class="footer-copy">
              © 2025 ASSENT AGÊNCIA — Especialistas em crescimento de negócios locais.<br>
              <span>Todos os direitos reservados. CNPJ: 00.000.000/0001-00</span>
            </div>
            <div class="footer-badge">
              <div class="footer-badge-dot"></div>
              Feito com propósito em Goiânia, GO
            </div>
          </div>

        </div>
      </footer>

      <!-- ══ BOTÃO FLUTUANTE WHATSAPP ══ -->
      <a href="${waHref}"
         class="wa-float ${hideWa ? 'hidden' : ''}"
         target="_blank"
         rel="noopener"
         aria-label="Falar no WhatsApp">
        <div class="wa-tooltip">Fale com a gente agora 👋</div>
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    `;
  }
}

customElements.define('assent-footer', AssentFooter);
