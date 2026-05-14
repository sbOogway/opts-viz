import { LitElement, html } from 'lit'
import './leg-input.js'

const inputStyle = 'padding:6px;font-size:14px;border:1px solid #ccc;border-radius:4px;'

const presetStrats = {
  Butterfly: (u) => [
    { type: 'call', direction: 'long', strike: +(u * 0.95).toFixed(5), premium: 0.5 },
    { type: 'call', direction: 'short', strike: +u.toFixed(5), premium: 1.0 },
    { type: 'call', direction: 'short', strike: +u.toFixed(5), premium: 1.0 },
    { type: 'call', direction: 'long', strike: +(u * 1.05).toFixed(5), premium: 0.3 },
  ],
  'Iron Condor': (u) => [
    { type: 'put', direction: 'long', strike: +(u * 2 / 3).toFixed(5), premium: 0.03 },
    { type: 'put', direction: 'short', strike: +(u * 5 / 6).toFixed(5), premium: 0.05 },
    { type: 'call', direction: 'short', strike: +(u * 7 / 6).toFixed(5), premium: 0.05 },
    { type: 'call', direction: 'long', strike: +(u * 4 / 3).toFixed(5), premium: 0.03 },
  ],
  Straddle: (u) => [
    { type: 'call', direction: 'long', strike: +u.toFixed(5), premium: 1.0 },
    { type: 'put', direction: 'long', strike: +u.toFixed(5), premium: 1.0 },
  ],
  Strangle: (u) => [
    { type: 'put', direction: 'long', strike: +(u * 0.95).toFixed(5), premium: 0.5 },
    { type: 'call', direction: 'long', strike: +(u * 1.05).toFixed(5), premium: 0.5 },
  ],
}

export class StrategyBuilder extends LitElement {
  static properties = {
    legs: { type: Array },
    underlyingPrice: { type: Number, attribute: 'underlying-price' },
    defaultStrike: { type: Number, attribute: 'default-strike' },
    defaultPremium: { type: Number, attribute: 'default-premium' },
    step: { type: String },
  }

  constructor() {
    super()
    this.legs = []
    this.step = '0.00001'
    const defaultPrice = 1.5
    this.underlyingPrice = defaultPrice
    this.defaultStrike = defaultPrice
    this.defaultPremium = defaultPrice
  }

  createRenderRoot() {
    return this
  }

  firstUpdated() {
    this.loadStrategy('Iron Condor')
  }

  syncDefaults() {
    this.defaultStrike = this.underlyingPrice
    this.defaultPremium = this.underlyingPrice
  }

  addLeg() {
    const el = this.querySelector('#new-leg-input')
    const { direction, type, strike, premium } = el
    if (!strike || !premium) return
    this.legs = [...this.legs, { type, direction, strike, premium }]
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
  }

  removeLeg(index) {
    this.legs = this.legs.filter((_, i) => i !== index)
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
  }

  updateLeg(index, field, value) {
    this.legs = this.legs.map((leg, i) =>
      i === index ? { ...leg, [field]: value } : leg
    )
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
  }

  replaceLeg(index, data) {
    this.legs = this.legs.map((leg, i) => i === index ? { ...data } : leg)
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
  }

  loadStrategy(name) {
    const fn = presetStrats[name]
    if (!fn) return
    this.legs = fn(this.underlyingPrice)
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
  }

  render() {
    return html`
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;flex-shrink:0;">
        ${Object.keys(presetStrats).map(name => html`
          <button class="btn-add" style="white-space:nowrap;flex-shrink:0;" @click=${() => this.loadStrategy(name)}>${name}</button>
        `)}
      </div>

      <div class="leg-form" style="border:1px solid var(--adecbe);border-radius:6px;padding:10px;margin-bottom:12px;flex-shrink:0;">
        <div style="margin-bottom:10px;">
          <label for="underlying-price" style="font-size:14px;margin-right:8px;">Underlying Price</label>
          <input id="underlying-price" type="number" step=${this.step} .value=${this.underlyingPrice}
            @input=${e => { this.underlyingPrice = Number(e.target.value); this.syncDefaults(); this.dispatchEvent(new CustomEvent('underlying-change', { detail: this.underlyingPrice })) }}
            style="${inputStyle}width:150px;">
        </div>

        <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap;">
          <leg-input id="new-leg-input" .direction=${'long'} .type=${'call'} .strike=${this.defaultStrike} .premium=${this.defaultPremium} .step=${this.step}></leg-input>
          <button class="btn-add" @click=${this.addLeg}>Add Leg</button>
        </div>
      </div>

      <div style="flex:1;overflow-y:auto;">
        ${this.legs.length === 0 ? html`<span style="color:#9ca3af;">No legs added</span>` : ''}
        ${this.legs.map((leg, i) => html`
          <div style="border:1px solid var(--adecbe);border-radius:6px;padding:8px 10px;margin-bottom:6px;">
            <div style="display:flex;gap:3px;align-items:center;">
              <b>${String.fromCharCode(65 + i)}</b>
              <leg-input .direction=${leg.direction} .type=${leg.type} .strike=${leg.strike} .premium=${leg.premium} .step=${this.step}
                @leg-input-change=${e => this.replaceLeg(i, e.detail)}>
              </leg-input>
              <button class="btn-remove" @click=${() => this.removeLeg(i)}>X</button>
            </div>
          </div>
        `)}
      </div>
    `
  }
}

customElements.define('strategy-builder', StrategyBuilder)
