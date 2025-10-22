class RoutineTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    
    this.shadowRoot.innerHTML = `
      <style>
        .time {
          font-size: 8rem;
          margin: 20px 0;
          color: ${color};
        }
      </style>
      <div class="time">${time}</div>
    `;
  }
}

customElements.define('routine-timer', RoutineTimer);
