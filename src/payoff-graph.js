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
    this.width = '100%'
    this.height = '100%'
    this.fontColor = 'black'
    this.legs = []
    this.underlyingPrice = 1
    this.lineWidth = 1.5
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
    const xMin = 0
    const xMax = this.underlyingPrice * 3
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

    const posX = [], posY = [], negX = [], negY = [], breakevens = []

    for (let i = 0; i < xs.length; i++) {
      if (ys[i] >= 0) { posX.push(xs[i]); posY.push(ys[i]) }
      if (ys[i] <= 0) { negX.push(xs[i]); negY.push(ys[i]) }
      if (i > 0 && Math.sign(ys[i]) !== Math.sign(ys[i - 1]) && ys[i] !== 0 && ys[i - 1] !== 0) {
        const x0 = xs[i - 1] - ys[i - 1] * (xs[i] - xs[i - 1]) / (ys[i] - ys[i - 1])
        breakevens.push(x0)
        posX.push(x0); posY.push(0)
        negX.push(x0); negY.push(0)
      }
    }

    const makeTrace = (x, y, color) => ({
      ...traceStyle, x, y,
      line: { color, width: this.lineWidth },
      marker: { color, size: 3 },
    })

    const payoffAtPrice = this.legs.reduce((total, leg) => total + payoffFn(this.underlyingPrice, leg), 0)

    const traceOpts = { showlegend: false }
    const data = []
    if (posX.length) data.push({ ...makeTrace(posX, posY, this.posColor), ...traceOpts })
    if (negX.length) data.push({ ...makeTrace(negX, negY, this.negColor), ...traceOpts })

    data.push({
      ...traceOpts,
      x: [this.underlyingPrice],
      y: [payoffAtPrice],
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#666', size: 8 },
      hovertemplate: `Underlying: ${this.underlyingPrice}<br>Profit: %{y}<extra></extra>`,
    })

    breakevens.forEach(x => {
      data.push({
        x: [x],
        y: [0],
        type: 'scatter',
        mode: 'markers',
        name: `Breakeven: ${x}`,
        marker: { color: '#000', size: 6 },
        hovertemplate: `Breakeven: ${x}<extra></extra>`,
      })
    })

    const axisTitle = text => ({ text, standoff: 10 })
    const maxAbsY = Math.max(...ys.map(Math.abs))

    Plotly.react(this.querySelector('div'), data, {
      xaxis: { title: axisTitle('Underlying Price'), range: [0, this.underlyingPrice * 3] },
      yaxis: { title: axisTitle('Profit'), range: [-maxAbsY, maxAbsY] },
      showlegend: true,
      margin: { t: 60, r: 20, b: 60, l: 70 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: this.fontColor },
      shapes: [
        {
          type: 'line',
          x0: this.underlyingPrice,
          x1: this.underlyingPrice,
          y0: 0,
          y1: 1,
          yref: 'paper',
          line: { color: '#666', width: 1, dash: 'dash' },
        },
        ...breakevens.map(x => ({
          type: 'line',
          x0: x, x1: x, y0: 0, y1: 1, yref: 'paper',
          line: { color: '#000', width: 1, dash: 'dot' },
        })),
      ],
    }, { scrollZoom: true })
  }

  render() {
    return html`
      <div style="width: ${this.width}; height: ${this.height};"></div>
    `
  }
}

customElements.define('payoff-graph', PayoffGraph)
