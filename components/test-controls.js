class TestControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.customTime = localStorage.getItem('customTime');
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const indicatorDisplay = this.customTime ? 'block' : 'none';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: absolute;
          top: 10px;
          right: 10px;
        }
        button {
          padding: 10px 20px;
          font-size: 1.5rem;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background-color: #007BFF;
          color: white;
          transition: background-color 0.3s;
          margin: 5px;
        }
        button:hover {
          background-color: #0056b3;
        }
        #test-settings {
          display: none;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-top: 10px;
        }
        #test-settings.visible {
          display: block;
        }
        input {
          padding: 8px;
          font-size: 1.2rem;
          margin: 5px;
        }
        p {
          color: blue;
          font-size: 1.2rem;
        }
      </style>
      <button id="toggle-test-settings">Configurations</button>
      <div id="test-settings">
        <input type="time" id="custom-time" step="60" value="${this.customTime || ''}">
        <button id="set-custom-time">Définir l'heure</button>
        <button id="reset-custom-time">Réinitialiser l'heure</button>
        <p id="custom-time-indicator" style="display: ${indicatorDisplay}">Mode heure personnalisée activé</p>
      </div>
    `;
  }

  setupEventListeners() {
    const toggleButton = this.shadowRoot.querySelector('#toggle-test-settings');
    const testSettings = this.shadowRoot.querySelector('#test-settings');
    const setButton = this.shadowRoot.querySelector('#set-custom-time');
    const resetButton = this.shadowRoot.querySelector('#reset-custom-time');
    const input = this.shadowRoot.querySelector('#custom-time');
    
    toggleButton.addEventListener('click', () => {
      testSettings.classList.toggle('visible');
    });
    
    setButton.addEventListener('click', () => {
      this.customTime = input.value;
      this.render();
      this.setupEventListeners();
      
      this.dispatchEvent(new CustomEvent('custom-time-set', {
        detail: { customTime: this.customTime },
        bubbles: true,
        composed: true
      }));
    });
    
    resetButton.addEventListener('click', () => {
      this.customTime = null;
      this.render();
      this.setupEventListeners();
      
      this.dispatchEvent(new CustomEvent('custom-time-set', {
        detail: { customTime: null },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('test-controls', TestControls);
