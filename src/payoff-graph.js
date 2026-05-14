import { LitElement, html } from 'lit'
import Plotly from 'plotly.js-dist-min'
import './payoff-graph.css'

export class PayoffGraph extends LitElement {
  static properties = {
    width: { type: String },
    height: { type: String },
    markerColor: { type: String, attribute: 'marker-color' },
    fontColor: { type: String, attribute: 'font-color' },
  }

  constructor() {
    super()
    this.width = '600px'
    this.height = '400px'
    this.markerColor = '#c084fc'
    this.fontColor = '#9ca3af'
  }

  createRenderRoot() {
    return this
  }

  firstUpdated() {
    const data = [{
      x: [1, 2, 3, 4, 5],
      y: [1, 2, 4, 8, 16],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: this.markerColor },
    }]

    const layout = {
      xaxis: { title: 'Underlying Price' },
      yaxis: { title: 'Profit' },
      margin: { t: 60, r: 20, b: 50, l: 60 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: this.fontColor },
    }

    Plotly.newPlot(this.querySelector('div'), data, layout)
  }

  render() {
    return html`
      <div style="width: ${this.width}; height: ${this.height};"></div>
    `
  }
}

customElements.define('payoff-graph', PayoffGraph)
