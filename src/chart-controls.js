import { LitElement, html } from 'lit'

export class ChartControls extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <div style="font-size:12px;color:#000;">
        Zoom: scroll wheel &middot; Pan: <kbd>Alt</kbd> + click drag &middot; Box zoom: click drag &middot; Reset: double-click
      </div>
    `
  }
}

customElements.define('chart-controls', ChartControls)
