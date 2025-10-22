class RoutineStep extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          text-align: center;
        }
        h2 {
          font-size: 3rem;
          margin: 10px 0;
          color: ${color};
        }
        p {
          font-size: 2.5rem;
          margin: 10px 0;
        }
      </style>
      <h2>Étape : ${name}</h2>
      ${recommended ? `<p>Temps recommandé : ${recommended}</p>` : ''}
    `;
  }
}

customElements.define('routine-step', RoutineStep);
