class TestControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.customTime = localStorage.getItem('customTime');
    
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
    const indicatorDisplay = this.customTime ? 'block' : 'none';
    
    let container = this.shadowRoot.querySelector('.test-controls-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'test-controls-container';
      this.shadowRoot.appendChild(container);
    }
    
    container.innerHTML = `
      <div class="controls-container">
        <button id="toggle-test-settings" class="test-button">Configurations</button>
        <div id="test-settings" class="test-settings">
          <input type="time" id="custom-time" step="60" value="${this.customTime || ''}">
          <button id="set-custom-time" class="test-button">Définir l'heure</button>
          <button id="reset-custom-time" class="test-button">Réinitialiser l'heure</button>
          <p id="custom-time-indicator" style="display: ${indicatorDisplay}">Mode heure personnalisée activé</p>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const toggleButton = this.shadowRoot.querySelector('#toggle-test-settings');
    const testSettings = this.shadowRoot.querySelector('#test-settings');
    const setButton = this.shadowRoot.querySelector('#set-custom-time');
    const resetButton = this.shadowRoot.querySelector('#reset-custom-time');
    const input = this.shadowRoot.querySelector('#custom-time');
    
    toggleButton.onclick = () => {
      testSettings.classList.toggle('visible');
    };
    
    setButton.onclick = () => {
      this.customTime = input.value;
      this.render();
      this.setupEventListeners();
      
      this.dispatchEvent(new CustomEvent('custom-time-set', {
        detail: { customTime: this.customTime },
        bubbles: true,
        composed: true
      }));
    };
    
    resetButton.onclick = () => {
      this.customTime = null;
      this.render();
      this.setupEventListeners();
      
      this.dispatchEvent(new CustomEvent('custom-time-set', {
        detail: { customTime: null },
        bubbles: true,
        composed: true
      }));
    };
  }
}

customElements.define('test-controls', TestControls);
