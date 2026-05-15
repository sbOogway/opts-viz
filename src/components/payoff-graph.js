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
    decimals: { type: Number },
  }

  constructor() {
    super()
    this.width = '100%'
    this.height = '100%'
    this.fontColor = 'inherit'
    this.legs = []
    this.underlyingPrice = 1
    this.lineWidth = 1.5
    this.decimals = 5
  }

  createRenderRoot() {
    return this
  }

  firstUpdated() {
    const style = getComputedStyle(this)
    this.posColor = style.getPropertyValue('--positive-color').trim()
    this.negColor = style.getPropertyValue('--negative-color').trim()
    this.fontColor = style.color
    this.lineColor = style.getPropertyValue('--chart-accent').trim()
    this.gridColor = 'rgba(128,128,128,0.25)'
    this._autoRange = true
    this._savedRange = null
    const el = this.querySelector('div')
    el.addEventListener('plotly_relayout', e => {
      if (e && e['xaxis.range[0]'] !== undefined) {
        this._savedRange = {
          x: [e['xaxis.range[0]'], e['xaxis.range[1]']],
          y: [e['yaxis.range[0]'], e['yaxis.range[1]']],
        }
      }
    })
    if (this.legs.length) this.updateChart()
  }

  updated(changedProperties) {
    if (changedProperties.has('underlyingPrice')) this._autoRange = true
    if (changedProperties.has('legs') || changedProperties.has('underlyingPrice') || changedProperties.has('lineWidth')) {
      this.updateChart()
    }
  }

  updateChart() {
    if (!this.legs.length) return

    const xMin = 0
    const xMax = this.underlyingPrice * 10
    const numPoints = 1000
    const xs = Array.from({ length: numPoints }, (_, i) =>
      xMin + (xMax - xMin) * i / (numPoints - 1)
    )

    const payoffFn = (price, leg) => {
      const { type, side, strike, premium, quantity = 1 } = leg
      return side === 'long'
        ? type === 'call' ? longCallPayoff(price, strike, premium, quantity) : longPutPayoff(price, strike, premium, quantity)
        : type === 'call' ? shortCallPayoff(price, strike, premium, quantity) : shortPutPayoff(price, strike, premium, quantity)
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
        hovertemplate: `Underlying: %{x:.${this.decimals}f}<br>Profit: %{y:.${this.decimals}f}<extra></extra>`,
      })
    })

    data.push({
      ...traceOpts,
      x: [this.underlyingPrice],
      y: [payoffAtPrice],
      type: 'scatter',
      mode: 'markers',
      marker: { color: this.lineColor, size: 8, opacity: 0.6 },
      hovertemplate: `Underlying: ${this.underlyingPrice.toFixed(this.decimals)}<br>Profit: %{y:.${this.decimals}f}<extra></extra>`,
    })

    breakevens.forEach(x => {
      data.push({
        x: [x],
        y: [0],
        type: 'scatter',
        mode: 'markers',
        name: `Breakeven: ${x.toFixed(this.decimals)}`,
        marker: { color: this.lineColor, size: 6 },
        hovertemplate: `Breakeven: ${x.toFixed(this.decimals)}<extra></extra>`,
      })
    })

    this.legs.forEach((leg, i) => {
      const letter = String.fromCharCode(65 + i)
      data.push({
        x: [leg.strike],
        y: [0],
        text: letter,
        textposition: 'top center',
        type: 'scatter',
        mode: 'markers+text',
        name: `${letter}: ${leg.strike.toFixed(this.decimals)}`,
        marker: { color: this.lineColor, size: 9, symbol: 'diamond' },
        textfont: { size: 14, color: this.lineColor },
        showlegend: true,
      })
    })

    const axisTitle = text => ({ text, standoff: 10 })
    const maxAbsY = Math.max(...ys.map(Math.abs))

    const el = this.querySelector('div')
    el.style.overflow = 'hidden'

    const xaxis = { title: axisTitle('Underlying Price'), gridcolor: this.gridColor, zerolinecolor: this.lineColor, zerolinewidth: 2, autorange: false }
    const yaxis = { title: axisTitle('Profit'), gridcolor: this.gridColor, zerolinecolor: this.lineColor, zerolinewidth: 2, autorange: false }
    if (this._autoRange) {
      xaxis.range = [0, this.underlyingPrice * 3]
      yaxis.range = [-maxAbsY * 1.15, maxAbsY * 1.15]
    } else if (this._savedRange) {
      xaxis.range = this._savedRange.x
      yaxis.range = this._savedRange.y
    }

    Plotly.react(el, data, {
      autosize: true,
      xaxis, yaxis,
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
          line: { color: this.lineColor, width: 1, dash: 'dash', opacity: 0.5 },
        },
        ...breakevens.map(x => ({
          type: 'line',
          x0: x, x1: x, y0: 0, y1: 1, yref: 'paper',
          line: { color: this.lineColor, width: 1, dash: 'dot' },
        })),
      ],
    }, { scrollZoom: true, responsive: true }).then(gd => {
      if (this._autoRange) {
        this._savedRange = {
          x: gd.layout.xaxis.range,
          y: gd.layout.yaxis.range,
        }
        this._autoRange = false
      }
    })
  }

  render() {
    return html`
      <div style="width: ${this.width}; height: ${this.height};"></div>
    `
  }
}

customElements.define('payoff-graph', PayoffGraph)
