class RoutineStep extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../app.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);
  }

  static get observedAttributes() {
    return ['name', 'recommended', 'color', 'visible'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute('name') || 'Prendre la pilule';
    const recommended = this.getAttribute('recommended') || '6:55 - 7:00';
    const color = this.getAttribute('color') || 'black';
    const visible = this.getAttribute('visible');
    
    if (visible === 'false') {
      this.style.display = 'none';
    } else {
      this.style.display = 'block';
    }
    
    let container = this.shadowRoot.querySelector('.step-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'step-container';
      this.shadowRoot.appendChild(container);
    }
    
    container.innerHTML = `
      <h2 style="color: ${color}">Étape : ${name}</h2>
      ${recommended ? `<p>Temps recommandé : ${recommended}</p>` : ''}
    `;
  }
}

customElements.define('routine-step', RoutineStep);
