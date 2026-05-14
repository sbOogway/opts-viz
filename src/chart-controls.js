import { LitElement, html } from 'lit'

export class ChartControls extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <div style="font-size:12px;color:#000;">
        Interactive options strategy visualizer. Zoom: scroll wheel &middot; Move around: Shift + click drag 
      </div>
    `
  }
}

customElements.define('chart-controls', ChartControls)
