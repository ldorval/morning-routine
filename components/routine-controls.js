class RoutineControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isMuted = JSON.parse(localStorage.getItem('isMuted')) || false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const icon = this.isMuted ? '🔇' : '🔊';
    const text = this.isMuted ? ' Activer le son' : ' Couper le son';
    
    this.shadowRoot.innerHTML = `
      <style>
        button {
          padding: 10px 20px;
          font-size: 1.5rem;
          margin-top: 20px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background-color: #007BFF;
          color: white;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #0056b3;
        }
        #mute-icon {
          margin-right: 10px;
        }
      </style>
      <button id="mute-toggle">
        <span id="mute-icon">${icon}</span>${text}
      </button>
    `;
  }

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('#mute-toggle');
    button.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.render();
      this.setupEventListeners();
      
      this.dispatchEvent(new CustomEvent('mute-toggle', {
        detail: { isMuted: this.isMuted },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('routine-controls', RoutineControls);
