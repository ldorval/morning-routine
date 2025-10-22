import './routine-timer.js';
import './routine-step.js';
import './routine-controls.js';

class MorningRoutineApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Charger le CSS avec un link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../app.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);

    // Charger les étapes depuis localStorage uniquement
    const savedSteps = localStorage.getItem('routineSteps');
    this.steps = savedSteps ? JSON.parse(savedSteps) : [];

    this.currentStepIndex = 0;
    this.customTime = localStorage.getItem('customTime');
    this.isMuted = JSON.parse(localStorage.getItem('isMuted')) || false;
    this.isRoutineCompleted = false;

    this.audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
    this.notificationAudio = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.startTimer();
  }

  render() {
    // Ne pas écraser innerHTML qui supprimerait le <link> CSS
    const container = this.shadowRoot.querySelector('.app-container') || document.createElement('div');
    container.className = 'app-container';
    
    container.innerHTML = `
      <a href="configurations.html" class="config-link">⚙️</a>
      <h1>Routine Matinale</h1>
      <routine-timer></routine-timer>
      <routine-step></routine-step>
      <routine-controls></routine-controls>
    `;
    
    if (!this.shadowRoot.querySelector('.app-container')) {
      this.shadowRoot.appendChild(container);
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        this.handleNextStep();
      }
    });

    this.shadowRoot.addEventListener('mute-toggle', (e) => {
      this.isMuted = e.detail.isMuted;
      localStorage.setItem('isMuted', JSON.stringify(this.isMuted));
    });

    // Écouter les changements dans localStorage pour recharger automatiquement
    window.addEventListener('storage', (e) => {
      if (e.key === 'routineSteps') {
        const savedSteps = localStorage.getItem('routineSteps');
        this.steps = savedSteps ? JSON.parse(savedSteps) : [];
        this.currentStepIndex = 0;
        this.isRoutineCompleted = false;
        this.updateDisplay();
      }
      if (e.key === 'customTime') {
        this.customTime = localStorage.getItem('customTime');
        this.updateDisplay();
      }
    });
  }

  startTimer() {
    this.updateDisplay();
    setInterval(() => this.updateDisplay(), 1000);
  }

  // Convertir "HH:MM" en minutes depuis minuit
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  updateDisplay() {
    const now = new Date();
    let hours, minutes;

    if (this.customTime && this.customTime.includes(':')) {
      [hours, minutes] = this.customTime.split(':').map(Number);
    } else {
      hours = now.getHours();
      minutes = now.getMinutes();
    }

    const currentTime = hours * 60 + minutes;
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const timerElement = this.shadowRoot.querySelector('routine-timer');
    const stepElement = this.shadowRoot.querySelector('routine-step');

    // Si pas d'étapes configurées
    if (this.steps.length === 0) {
      timerElement.setAttribute('time', formattedTime);
      timerElement.setAttribute('color', 'black');
      stepElement.setAttribute('name', 'Aucune étape configurée');
      stepElement.setAttribute('recommended', 'Cliquez sur ⚙️ pour configurer vos étapes');
      stepElement.setAttribute('visible', 'true');
      stepElement.setAttribute('color', 'orange');
      return;
    }

    // Calculer la fenêtre de routine dynamiquement
    const firstStepGreenTime = this.timeToMinutes(this.steps[0].timings[0]);
    const routineStartTime = firstStepGreenTime - 60; // 1h avant le vert de la première étape

    // Si la routine n'a pas encore commencé
    if (currentTime < routineStartTime) {
      timerElement.setAttribute('time', `${formattedTime} - Routine pas encore commencée`);
      timerElement.setAttribute('color', 'black');
      stepElement.setAttribute('visible', 'false');
      return;
    }

    // Si la routine est en cours ou en retard (pas de limite de temps max)
    timerElement.setAttribute('time', formattedTime);
    timerElement.setAttribute('color', 'black');

    // Ne pas mettre à jour l'étape si la routine est terminée
    if (this.isRoutineCompleted) {
      return;
    }

    const currentStep = this.steps[this.currentStepIndex];
    stepElement.setAttribute('name', currentStep.name);
    stepElement.setAttribute('recommended', currentStep.recommended);
    stepElement.setAttribute('visible', 'true');

    const color = this.getStepColor(currentTime);
    stepElement.setAttribute('color', color);

    if (color === '#b22222' && !this.isMuted && stepElement.getAttribute('color') !== '#b22222') {
      this.notificationAudio.play();
    }
  }

  getStepColor(currentTime) {
    const step = this.steps[this.currentStepIndex];
    const greenTime = this.timeToMinutes(step.timings[0]);
    const yellowTime = this.timeToMinutes(step.timings[1]);

    if (currentTime < greenTime) return 'green';
    if (currentTime < yellowTime) return '#f29913';
    return '#b22222';
  }

  handleNextStep() {
    if (this.steps.length === 0) return;
    
    if (!this.isMuted) this.audio.play();

    const now = new Date();
    const currentTime = this.customTime && this.customTime.includes(':')
      ? this.customTime.split(':').map(Number)[0] * 60 + this.customTime.split(':').map(Number)[1]
      : now.getHours() * 60 + now.getMinutes();

    const currentStep = this.steps[this.currentStepIndex];
    const isLastStep = this.currentStepIndex === this.steps.length - 1;
    const completedInGreen = currentTime < this.timeToMinutes(currentStep.timings[1]);

    if (isLastStep) {
      // Compléter la dernière étape peu importe l'heure
      const stepElement = this.shadowRoot.querySelector('routine-step');
      stepElement.setAttribute('recommended', ''); // Enlever le temps recommandé
      stepElement.setAttribute('visible', 'true');
      
      if (completedInGreen) {
        stepElement.setAttribute('name', 'Bravo, la routine est terminée dans les temps !');
        stepElement.setAttribute('color', 'green');
      } else {
        stepElement.setAttribute('name', 'Routine terminée (avec du retard)');
        stepElement.setAttribute('color', 'orange');
      }
      
      this.isRoutineCompleted = true;
    } else {
      this.currentStepIndex++;
      this.updateDisplay();
    }
  }
}

customElements.define('morning-routine-app', MorningRoutineApp);
