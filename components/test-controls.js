class TestControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.customTime = localStorage.getItem('customTime');
    this.steps = JSON.parse(localStorage.getItem('routineSteps')) || null;
    this.isPanelOpen = false; // Garder l'état du panneau
    
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
    const stepsHtml = this.steps ? this.steps.map((step, index) => `
      <div class="step-config">
        <input type="text" class="step-name" data-index="${index}" value="${step.name}" placeholder="Nom de l'étape">
        <input type="time" class="step-time-green" data-index="${index}" value="${step.timings[0]}" title="Limite verte">
        <input type="time" class="step-time-orange" data-index="${index}" value="${step.timings[1]}" title="Limite orange">
        <input type="text" class="step-recommended" data-index="${index}" value="${step.recommended}" placeholder="Temps recommandé">
        <button class="test-button remove-step" data-index="${index}">🗑️</button>
      </div>
    `).join('') : '';
    
    let container = this.shadowRoot.querySelector('.test-controls-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'test-controls-container';
      this.shadowRoot.appendChild(container);
    }
    
    // Ajouter la classe visible si le panneau est ouvert
    const visibleClass = this.isPanelOpen ? 'visible' : '';
    
    container.innerHTML = `
      <div class="controls-container">
        <button id="toggle-test-settings" class="test-button">Configurations</button>
        <div id="test-settings" class="test-settings ${visibleClass}">
          <h3>Heure personnalisée</h3>
          <input type="time" id="custom-time" step="60" value="${this.customTime || ''}">
          <button id="set-custom-time" class="test-button">Définir l'heure</button>
          <button id="reset-custom-time" class="test-button">Réinitialiser l'heure</button>
          <p id="custom-time-indicator" style="display: ${indicatorDisplay}">Mode heure personnalisée activé</p>
          
          <hr>
          
          <h3>Étapes de la routine</h3>
          <div id="steps-config">
            <div class="step-config-header">
              <span class="header-name">Nom de l'étape</span>
              <span class="header-green">🟢 Limite</span>
              <span class="header-orange">🟠 Limite</span>
              <span class="header-recommended">Recommandé</span>
              <span class="header-actions"></span>
            </div>
            ${stepsHtml}
          </div>
          <button id="add-step" class="test-button">➕ Ajouter une étape</button>
          <button id="save-steps" class="test-button">💾 Sauvegarder les étapes</button>
          <button id="reset-steps" class="test-button">🔄 Réinitialiser les étapes</button>
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
    const addStepButton = this.shadowRoot.querySelector('#add-step');
    const saveStepsButton = this.shadowRoot.querySelector('#save-steps');
    const resetStepsButton = this.shadowRoot.querySelector('#reset-steps');
    
    toggleButton.onclick = () => {
      this.isPanelOpen = !this.isPanelOpen;
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

    addStepButton.onclick = () => {
      if (!this.steps) {
        this.steps = [];
      }
      this.steps.push({
        name: "Nouvelle étape",
        timings: ["7:00", "7:05"],
        recommended: "7:00 - 7:05"
      });
      this.render();
      this.setupEventListeners();
    };

    saveStepsButton.onclick = () => {
      this.saveStepsFromInputs();
      localStorage.setItem('routineSteps', JSON.stringify(this.steps));
      
      this.dispatchEvent(new CustomEvent('steps-updated', {
        detail: { steps: this.steps },
        bubbles: true,
        composed: true
      }));
      
      alert('Étapes sauvegardées avec succès !');
    };

    resetStepsButton.onclick = () => {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser les étapes ?')) {
        this.steps = null;
        localStorage.removeItem('routineSteps');
        this.render();
        this.setupEventListeners();
        
        this.dispatchEvent(new CustomEvent('steps-updated', {
          detail: { steps: null },
          bubbles: true,
          composed: true
        }));
      }
    };

    // Event listeners pour les boutons de suppression
    this.shadowRoot.querySelectorAll('.remove-step').forEach(button => {
      button.onclick = () => {
        const index = parseInt(button.dataset.index);
        this.steps.splice(index, 1);
        this.render();
        this.setupEventListeners();
      };
    });
  }

  saveStepsFromInputs() {
    const names = this.shadowRoot.querySelectorAll('.step-name');
    const greenTimes = this.shadowRoot.querySelectorAll('.step-time-green');
    const orangeTimes = this.shadowRoot.querySelectorAll('.step-time-orange');
    const recommendeds = this.shadowRoot.querySelectorAll('.step-recommended');

    this.steps = Array.from(names).map((nameInput, index) => ({
      name: nameInput.value,
      timings: [greenTimes[index].value, orangeTimes[index].value],
      recommended: recommendeds[index].value
    }));
  }
}

customElements.define('test-controls', TestControls);
