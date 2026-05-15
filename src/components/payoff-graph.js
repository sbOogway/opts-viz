import { LitElement, html } from 'lit'
import Plotly from 'plotly.js-dist-min'
import { longCallPayoff, longPutPayoff, shortCallPayoff, shortPutPayoff } from '../lib/options.js'
import '../styles/payoff-graph.css'

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

    const xMin = 0
    const xMax = this.underlyingPrice * 3
    const numPoints = 200
    const xs = Array.from({ length: numPoints }, (_, i) =>
      xMin + (xMax - xMin) * i / (numPoints - 1)
    )

    const payoffFn = (price, leg) => {
      const { type, side, strike, premium } = leg
      return side === 'long'
        ? type === 'call' ? longCallPayoff(price, strike, premium) : longPutPayoff(price, strike, premium)
        : type === 'call' ? shortCallPayoff(price, strike, premium) : shortPutPayoff(price, strike, premium)
    }

    const ys = xs.map(price =>
      this.legs.reduce((total, leg) => total + payoffFn(price, leg), 0)
    )

    const breakevens = []

    for (let i = 1; i < xs.length; i++) {
      if (Math.sign(ys[i]) !== Math.sign(ys[i - 1]) && ys[i] !== 0 && ys[i - 1] !== 0) {
        const x0 = xs[i - 1] - ys[i - 1] * (xs[i] - xs[i - 1]) / (ys[i] - ys[i - 1])
        breakevens.push(x0)
      }
    }

    const segments = []
    let cur = null
    for (let i = 0; i < xs.length; i++) {
      const sign = ys[i] >= 0 ? 1 : -1
      if (!cur || cur.sign !== sign) {
        cur = { sign, x: [xs[i]], y: [ys[i]] }
        segments.push(cur)
      } else {
        cur.x.push(xs[i]); cur.y.push(ys[i])
      }
    }

    breakevens.forEach((x, j) => {
      segments[j].x.push(x); segments[j].y.push(0)
      segments[j + 1].x.unshift(x); segments[j + 1].y.unshift(0)
    })

    const payoffAtPrice = this.legs.reduce((total, leg) => total + payoffFn(this.underlyingPrice, leg), 0)

    const traceOpts = { showlegend: false, type: 'scatter', mode: 'lines+markers' }
    const data = []
    segments.forEach(seg => {
      data.push({
        ...traceOpts,
        x: seg.x, y: seg.y,
        line: { color: seg.sign === 1 ? this.posColor : this.negColor, width: this.lineWidth },
        marker: { color: seg.sign === 1 ? this.posColor : this.negColor, size: 3 },
      })
    })

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

    data.push({
      x: this.legs.map(l => l.strike),
      y: this.legs.map(() => 0),
      text: this.legs.map((_, i) => String.fromCharCode(65 + i)),
      textposition: 'top center',
      type: 'scatter',
      mode: 'markers+text',
      name: 'Strikes',
      marker: { color: '#000', size: 7, symbol: 'diamond' },
      textfont: { size: 16, color: '#000' },
      showlegend: false,
    })

    const axisTitle = text => ({ text, standoff: 10 })
    const maxAbsY = Math.max(...ys.map(Math.abs))

    const el = this.querySelector('div')
    el.style.overflow = 'hidden'
    Plotly.react(el, data, {
      autosize: true,
      xaxis: { title: axisTitle('Underlying Price'), range: [0, this.underlyingPrice * 3] },
      yaxis: { title: axisTitle('Profit'), range: [-maxAbsY * 1.15, maxAbsY * 1.15] },
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
    }, { scrollZoom: true, responsive: true })
  }

  render() {
    return html`
      <div style="width: ${this.width}; height: ${this.height};"></div>
    `
  }
}

customElements.define('payoff-graph', PayoffGraph)
