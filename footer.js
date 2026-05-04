/**
 * footer.js — ASSENT Agência
 * ─────────────────────────────────────────────────────────
 * Rodapé global.
 *
 * USO — coloque no <head> ou antes de </body>:
 *   <script type="module" src="/footer.js"></script>
 *   <assent-footer></assent-footer>
 *
 * ATRIBUTOS OPCIONAIS:
 *   wa-text="Mensagem personalizada"  — texto no WhatsApp (ícone social)
 * ─────────────────────────────────────────────────────────
 */

class AssentFooter extends HTMLElement {

  connectedCallback() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._inject());
    } else {
      this._inject();
    }
  }

  _inject() {
    this.style.display = 'none';

    const waText = this.getAttribute('wa-text')
      || 'Olá! Vim pelo site da Assent Agência e gostaria de saber mais sobre os serviços.';
    const waHref = `https://wa.me/5562991383079?text=${encodeURIComponent(waText)}`;

    if (!document.getElementById('assent-footer-styles')) {
      const style = document.createElement('style');
      style.id = 'assent-footer-styles';
      style.textContent = `
        assent-footer-el {
          display: block;
          background: #0a0a0a;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 48px 0 32px;
          font-family: 'Inter', sans-serif;
          color: #fff;
        }
        assent-footer-el .ft-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }
        assent-footer-el .ft-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        assent-footer-el .ft-logo {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          color: #fff;
          text-decoration: none;
          letter-spacing: .06em;
        }
        assent-footer-el .ft-logo span { color: #F5A623; }

        assent-footer-el .ft-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        assent-footer-el .ft-links a {
          color: #777;
          text-decoration: none;
          font-size: .83rem;
          transition: color .2s;
        }
        assent-footer-el .ft-links a:hover { color: #fff; }

        assent-footer-el .ft-social {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        assent-footer-el .ft-social a {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          color: #777;
          text-decoration: none;
          transition: border-color .2s, color .2s, background .2s;
        }
        assent-footer-el .ft-social a:hover {
          border-color: rgba(245,166,35,.4);
          color: #F5A623;
          background: rgba(245,166,35,.06);
        }
        assent-footer-el .ft-social svg { width: 16px; height: 16px; }

        assent-footer-el .ft-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 32px 0 24px;
        }
        assent-footer-el .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        assent-footer-el .ft-copy {
          color: #777;
          font-size: .78rem;
          line-height: 1.7;
        }
        assent-footer-el .ft-copy span { font-size: .72rem; }
        assent-footer-el .ft-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .72rem;
          color: #555;
          letter-spacing: .04em;
        }
        assent-footer-el .ft-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #F5A623;
          box-shadow: 0 0 6px rgba(245,166,35,.5);
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          assent-footer-el .ft-inner { flex-direction: column; align-items: flex-start; gap: 24px; }
          assent-footer-el .ft-bottom { flex-direction: column; align-items: flex-start; }
          assent-footer-el .ft-links { gap: 16px; }
        }
      `;
      document.head.appendChild(style);
    }

    const footer = document.createElement('assent-footer-el');
    footer.innerHTML = `
      <div class="ft-container">
        <div class="ft-inner">
          <a href="/" class="ft-logo">ASSENT <span>AGÊNCIA</span></a>
          <nav class="ft-links">
            <a href="/trafego">Tráfego Pago</a>
            <a href="/aplicativos">Aplicativos</a>
            <a href="/fotografia">Fotografia</a>
            <a href="/#provas">Resultados</a>
            <a href="/#processo">Como Funciona</a>
            <a href="/#faq">FAQ</a>
          </nav>
          <div class="ft-social">
            <a href="https://instagram.com/assentagencia" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="${waHref}" target="_blank" rel="noopener" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="ft-divider"></div>

        <div class="ft-bottom">
          <div class="ft-copy">
            © 2025 ASSENT AGÊNCIA — Especialistas em crescimento de negócios locais.<br>
            <span>Todos os direitos reservados. CNPJ: 00.000.000/0001-00</span>
          </div>
          <div class="ft-badge">
            <div class="ft-badge-dot"></div>
            Feito com propósito em Goiânia, GO
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(footer);
  }
}

customElements.define('assent-footer', AssentFooter);
