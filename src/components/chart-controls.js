import { LitElement, html } from 'lit'

export class ChartControls extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <div style="display: flex; align-items: baseline;">
        <div class="label" style="font-size:12px;">
        Interactive options strategy visualizer. Zoom: scroll wheel &middot; Move around: Shift + click drag 
        </div>
        <div style="margin-left: auto">
          <a class="label" href="https://github.com/sbOogway/opts-viz">source code</a>
        </div>
      </div>
    `
  }
}

customElements.define('chart-controls', ChartControls)
