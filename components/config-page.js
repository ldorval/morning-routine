class ConfigPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.customTime = localStorage.getItem('customTime');
    this.steps = JSON.parse(localStorage.getItem('routineSteps')) || this.getDefaultSteps();
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../app.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);
  }

  getDefaultSteps() {
    return [
      { name: "Prendre la pilule", timings: ["7:00", "7:05"], recommended: "6:55 - 7:00" },
      { name: "Manger", timings: ["7:10", "7:15"], recommended: "7:00 - 7:10" },
      { name: "Habiller", timings: ["7:15", "7:20"], recommended: "7:10 - 7:15" },
      { name: "Dents", timings: ["7:20", "7:25"], recommended: "7:15 - 7:20" },
      { name: "Habillage pour dehors", timings: ["7:30", "7:30"], recommended: "7:20 - 7:30" }
    ];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const indicatorDisplay = this.customTime ? 'block' : 'none';
    const stepsHtml = this.steps.map((step, index) => `
      <div class="step-config">
        <input type="text" class="step-name" data-index="${index}" value="${step.name}" placeholder="Nom de l'étape">
        <input type="time" class="step-time-green" data-index="${index}" value="${step.timings[0]}" title="Limite verte">
        <input type="time" class="step-time-orange" data-index="${index}" value="${step.timings[1]}" title="Limite orange">
        <input type="text" class="step-recommended" data-index="${index}" value="${step.recommended}" placeholder="Temps recommandé">
        <button class="test-button remove-step" data-index="${index}">🗑️</button>
      </div>
    `).join('');
    
    let container = this.shadowRoot.querySelector('.config-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'config-container';
      this.shadowRoot.appendChild(container);
    }
    
    container.innerHTML = `
      <div class="config-header">
        <h1>⚙️ Configurations</h1>
        <a href="index.html" class="test-button">← Retour à la routine</a>
      </div>
      
      <div class="config-section">
        <h2>Heure personnalisée</h2>
        <div class="config-content">
          <input type="time" id="custom-time" step="60" value="${this.customTime || ''}">
          <button id="set-custom-time" class="test-button">Définir l'heure</button>
          <button id="reset-custom-time" class="test-button">Réinitialiser l'heure</button>
          <p id="custom-time-indicator" style="display: ${indicatorDisplay}">Mode heure personnalisée activé</p>
        </div>
      </div>
      
      <div class="config-section">
        <h2>Étapes de la routine</h2>
        <div class="config-content">
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
          <div class="config-actions">
            <button id="add-step" class="test-button">➕ Ajouter une étape</button>
            <button id="save-steps" class="test-button">💾 Sauvegarder les étapes</button>
            <button id="reset-steps" class="test-button">🔄 Réinitialiser les étapes</button>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const setButton = this.shadowRoot.querySelector('#set-custom-time');
    const resetButton = this.shadowRoot.querySelector('#reset-custom-time');
    const input = this.shadowRoot.querySelector('#custom-time');
    const addStepButton = this.shadowRoot.querySelector('#add-step');
    const saveStepsButton = this.shadowRoot.querySelector('#save-steps');
    const resetStepsButton = this.shadowRoot.querySelector('#reset-steps');
    
    setButton.onclick = () => {
      this.customTime = input.value;
      localStorage.setItem('customTime', this.customTime);
      this.render();
      this.setupEventListeners();
    };
    
    resetButton.onclick = () => {
      this.customTime = null;
      localStorage.removeItem('customTime');
      this.render();
      this.setupEventListeners();
    };

    addStepButton.onclick = () => {
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
      alert('Étapes sauvegardées avec succès !');
    };

    resetStepsButton.onclick = () => {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser les étapes ?')) {
        this.steps = this.getDefaultSteps();
        localStorage.removeItem('routineSteps');
        this.render();
        this.setupEventListeners();
      }
    };

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

customElements.define('config-page', ConfigPage);

