class RoutineControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isMuted = JSON.parse(localStorage.getItem('isMuted')) || false;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../app.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const icon = this.isMuted ? '🔇' : '🔊';
    const text = this.isMuted ? ' Activer le son' : ' Couper le son';
    
    let button = this.shadowRoot.querySelector('#mute-toggle');
    if (!button) {
      button = document.createElement('button');
      button.id = 'mute-toggle';
      button.className = 'controls-button';
      this.shadowRoot.appendChild(button);
    }
    
    button.innerHTML = `<span class="mute-icon">${icon}</span>${text}`;
  }

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('#mute-toggle');
    button.onclick = () => {
      this.isMuted = !this.isMuted;
      this.render();
      
      this.dispatchEvent(new CustomEvent('mute-toggle', {
        detail: { isMuted: this.isMuted },
        bubbles: true,
        composed: true
      }));
    };
  }
}

customElements.define('routine-controls', RoutineControls);
