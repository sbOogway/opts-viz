import { LitElement, html } from 'lit'
import Plotly from 'plotly.js-dist-min'
import { longCallPayoff, longPutPayoff, shortCallPayoff, shortPutPayoff } from './options.js'
import './payoff-graph.css'

const traceStyle = { type: 'scatter', mode: 'lines+markers' }

export class PayoffGraph extends LitElement {
  static properties = {
    width: { type: String },
    height: { type: String },
    fontColor: { type: String, attribute: 'font-color' },
    legs: { type: Array },
    underlyingPrice: { type: Number, attribute: 'underlying-price' },
    lineWidth: { type: Number, attribute: 'line-width' },
  }

  constructor() {
    super()
    this.width = '600px'
    this.height = '400px'
    this.fontColor = 'black'
    this.legs = []
    this.underlyingPrice = 1
    this.lineWidth = 0.00001
  }

  createRenderRoot() {
    return this
  }

  firstUpdated() {
    const style = getComputedStyle(this)
    this.posColor = style.getPropertyValue('--positive-color').trim()
    this.negColor = style.getPropertyValue('--negative-color').trim()
    if (this.legs.length) this.updateChart()
  }

  updated(changedProperties) {
    if (changedProperties.has('legs') || changedProperties.has('underlyingPrice') || changedProperties.has('lineWidth')) {
      this.updateChart()
    }
  }

  updateChart() {
    if (!this.legs.length) return

    const strikes = this.legs.map(l => l.strike)
    const minStrike = Math.min(...strikes)
    const maxStrike = Math.max(...strikes)
    const xMin = Math.max(0, minStrike * 0.5)
    const xMax = maxStrike * 1.5
    const numPoints = 200
    const xs = Array.from({ length: numPoints }, (_, i) =>
      xMin + (xMax - xMin) * i / (numPoints - 1)
    )

    const payoffFn = (price, leg) => {
      const { type, direction, strike, premium } = leg
      return direction === 'long'
        ? type === 'call' ? longCallPayoff(price, strike, premium) : longPutPayoff(price, strike, premium)
        : type === 'call' ? shortCallPayoff(price, strike, premium) : shortPutPayoff(price, strike, premium)
    }

    const ys = xs.map(price =>
      this.legs.reduce((total, leg) => total + payoffFn(price, leg), 0)
    )

    const posX = [], posY = [], negX = [], negY = []

    for (let i = 0; i < xs.length; i++) {
      if (ys[i] >= 0) { posX.push(xs[i]); posY.push(ys[i]) }
      if (ys[i] <= 0) { negX.push(xs[i]); negY.push(ys[i]) }
      if (i > 0 && Math.sign(ys[i]) !== Math.sign(ys[i - 1]) && ys[i] !== 0 && ys[i - 1] !== 0) {
        const x0 = xs[i - 1] - ys[i - 1] * (xs[i] - xs[i - 1]) / (ys[i] - ys[i - 1])
        posX.push(x0); posY.push(0)
        negX.push(x0); negY.push(0)
      }
    }

    const makeTrace = (x, y, color) => ({
      ...traceStyle, x, y,
      line: { color, width: this.lineWidth },
      marker: { color },
    })

    const payoffAtPrice = this.legs.reduce((total, leg) => total + payoffFn(this.underlyingPrice, leg), 0)

    const data = []
    if (posX.length) data.push(makeTrace(posX, posY, this.posColor))
    if (negX.length) data.push(makeTrace(negX, negY, this.negColor))

    data.push({
      x: [this.underlyingPrice],
      y: [payoffAtPrice],
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#666', size: 8 },
      hovertemplate: `Underlying: ${this.underlyingPrice}<br>Profit: %{y}<extra></extra>`,
    })

    const axisTitle = text => ({ text, standoff: 10 })

    Plotly.react(this.querySelector('div'), data, {
      xaxis: { title: axisTitle('Underlying Price') },
      yaxis: { title: axisTitle('Profit') },
      margin: { t: 60, r: 20, b: 60, l: 70 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: this.fontColor },
      shapes: [{
        type: 'line',
        x0: this.underlyingPrice,
        x1: this.underlyingPrice,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#666', width: 1, dash: 'dash' },
      }],
    })
  }

  render() {
    return html`
      <div style="width: ${this.width}; height: ${this.height};"></div>
    `
  }
}

customElements.define('payoff-graph', PayoffGraph)
