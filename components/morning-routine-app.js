import './routine-timer.js';
import './routine-step.js';
import './routine-controls.js';
import './test-controls.js';

class MorningRoutineApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Charger le CSS avec un link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../app.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);
    
    this.steps = [
      { name: "Prendre la pilule", timings: ["7:00", "7:05"], recommended: "6:55 - 7:00" },
      { name: "Manger", timings: ["7:10", "7:15"], recommended: "7:00 - 7:10" },
      { name: "Habiller", timings: ["7:15", "7:20"], recommended: "7:10 - 7:15" },
      { name: "Dents", timings: ["7:20", "7:25"], recommended: "7:15 - 7:20" },
      { name: "Habillage pour dehors", timings: ["7:30", "7:30"], recommended: "7:20 - 7:30" }
    ];
    
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
      <h1>Routine Matinale</h1>
      <routine-timer></routine-timer>
      <routine-step></routine-step>
      <routine-controls></routine-controls>
      <test-controls></test-controls>
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

    this.shadowRoot.addEventListener('custom-time-set', (e) => {
      this.customTime = e.detail.customTime;
      if (this.customTime) {
        localStorage.setItem('customTime', this.customTime);
      } else {
        localStorage.removeItem('customTime');
      }
      this.updateDisplay();
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
    
    if (currentTime >= this.timeToMinutes("6:30") && currentTime <= this.timeToMinutes("7:40")) {
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
    } else {
      timerElement.setAttribute('time', `${formattedTime} - Routine terminée`);
      timerElement.setAttribute('color', 'black');
      stepElement.setAttribute('visible', 'false');
      this.isRoutineCompleted = false; // Réinitialiser pour le lendemain
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
    if (!this.isMuted) this.audio.play();
    
    const now = new Date();
    const currentTime = this.customTime && this.customTime.includes(':')
      ? this.customTime.split(':').map(Number)[0] * 60 + this.customTime.split(':').map(Number)[1]
      : now.getHours() * 60 + now.getMinutes();
    
    const currentStep = this.steps[this.currentStepIndex];
    const isLastStep = this.currentStepIndex === this.steps.length - 1;
    const completedInGreen = currentTime < this.timeToMinutes(currentStep.timings[1]);
    
    if (isLastStep && completedInGreen) {
      const stepElement = this.shadowRoot.querySelector('routine-step');
      stepElement.setAttribute('name', 'Bravo, la routine est terminée dans les temps !');
      stepElement.setAttribute('recommended', '');
      stepElement.setAttribute('color', 'green');
      stepElement.setAttribute('visible', 'true');
      this.isRoutineCompleted = true; // Marquer la routine comme terminée
    } else if (!isLastStep) {
      this.currentStepIndex++;
      this.updateDisplay();
    }
  }
}

customElements.define('morning-routine-app', MorningRoutineApp);
