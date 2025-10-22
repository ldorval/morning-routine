class RoutineTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../app.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);
  }

  static get observedAttributes() {
    return ['time', 'color'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const time = this.getAttribute('time') || '00:00';
    const color = this.getAttribute('color') || 'black';
    
    const timeDiv = this.shadowRoot.querySelector('.time') || document.createElement('div');
    timeDiv.className = 'time';
    timeDiv.style.color = color;
    timeDiv.textContent = time;
    
    if (!this.shadowRoot.querySelector('.time')) {
      this.shadowRoot.appendChild(timeDiv);
    }
  }
}

customElements.define('routine-timer', RoutineTimer);
