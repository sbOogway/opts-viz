import { LitElement, html } from 'lit'
import './leg-input.js'
import { encodeToUrl, decodeFromUrl } from '../lib/leg-parser.js'

const inputStyle = 'padding:6px;font-size:14px;border:1px solid #ccc;border-radius:4px;'

const presetStrats = {
  Butterfly: (u) => [
    { type: 'call', side: 'long', strike: +(u * 0.95).toFixed(5), premium: 0.5 },
    { type: 'call', side: 'short', strike: +u.toFixed(5), premium: 1.0 },
    { type: 'call', side: 'short', strike: +u.toFixed(5), premium: 1.0 },
    { type: 'call', side: 'long', strike: +(u * 1.05).toFixed(5), premium: 0.3 },
  ],
  'Iron Condor': (u) => [
    { type: 'put', side: 'long', strike: +(u * 2 / 3).toFixed(5), premium: 0.03 },
    { type: 'put', side: 'short', strike: +(u * 5 / 6).toFixed(5), premium: 0.05 },
    { type: 'call', side: 'short', strike: +(u * 7 / 6).toFixed(5), premium: 0.05 },
    { type: 'call', side: 'long', strike: +(u * 4 / 3).toFixed(5), premium: 0.03 },
  ],
  Straddle: (u) => [
    { type: 'call', side: 'long', strike: +u.toFixed(5), premium: 1.0 },
    { type: 'put', side: 'long', strike: +u.toFixed(5), premium: 1.0 },
  ],
  Strangle: (u) => [
    { type: 'put', side: 'long', strike: +(u * 0.95).toFixed(5), premium: 0.5 },
    { type: 'call', side: 'long', strike: +(u * 1.05).toFixed(5), premium: 0.5 },
  ],
}

export class StrategyBuilder extends LitElement {
  static properties = {
    legs: { type: Array },
    underlyingPrice: { type: Number, attribute: 'underlying-price' },
    defaultStrike: { type: Number, attribute: 'default-strike' },
    defaultPremium: { type: Number, attribute: 'default-premium' },
    step: { type: String },
    decimals: { type: Number },
  }

  constructor() {
    super()
    this.legs = []
    this.step = '0.001'
    this.decimals = 5
    const defaultPrice = 1.5
    this.underlyingPrice = defaultPrice
    this.defaultStrike = defaultPrice
    this.defaultPremium = defaultPrice
  }

  createRenderRoot() {
    return this
  }

  syncUrl() {
    if (!this.legs.length) {
      history.replaceState(null, '', location.pathname)
      return
    }
    const qs = encodeToUrl(this.legs, this.underlyingPrice)
    history.replaceState(null, '', '?' + qs)
  }

  firstUpdated() {
    const parsed = decodeFromUrl(location.search)
    if (parsed) {
      this.underlyingPrice = parsed.underlyingPrice
      this.legs = parsed.legs
      this.dispatchEvent(new CustomEvent('underlying-change', { detail: this.underlyingPrice }))
      this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
    } else {
      this.loadStrategy('Iron Condor')
    }
  }

  syncDefaults() {
    this.defaultStrike = this.underlyingPrice
    this.defaultPremium = this.underlyingPrice
  }

  addLeg() {
    const el = this.querySelector('#new-leg-input')
    const { side, type, strike, premium } = el
    if (!strike || !premium) return
    this.legs = [...this.legs, { type, side, strike, premium }]
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
    this.syncUrl()
  }

  removeLeg(index) {
    this.legs = this.legs.filter((_, i) => i !== index)
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
    this.syncUrl()
  }

  replaceLeg(index, data) {
    this.legs = this.legs.map((leg, i) => i === index ? { ...data } : leg)
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
    this.syncUrl()
  }

  loadStrategy(name) {
    const fn = presetStrats[name]
    if (!fn) return
    this.legs = fn(this.underlyingPrice)
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
    this.syncUrl()
  }

  render() {
    return html`
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;flex-shrink:0;">
        ${Object.keys(presetStrats).map(name => html`
          <button class="btn-add" style="white-space:nowrap;flex-shrink:0;" @click=${() => this.loadStrategy(name)}>${name}</button>
        `)}
      </div>

      <div class="leg-form" style="border:1px solid var(--adecbe);border-radius:6px;padding:10px;margin-bottom:12px;flex-shrink:0;">
        <div style="margin-bottom:10px;display:flex;gap:12px;align-items:end;flex-wrap:wrap;">
          <div style="display:flex;flex-direction:column;gap:1px;">
            <label class="label">Underlying Price</label>
            <input id="underlying-price" type="number" step=${this.step} .value=${this.underlyingPrice}
              @input=${e => { this.underlyingPrice = Number(e.target.value); this.syncDefaults(); this.dispatchEvent(new CustomEvent('underlying-change', { detail: this.underlyingPrice })); this.syncUrl() }}
              style="padding:6px;font-size:14px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;width:100px;">
          </div>
          <div style="display:flex;flex-direction:column;gap:1px;">
            <label class="label">Step</label>
            <input id="step-size" type="number" step="0.001" .value=${this.step}
              @input=${e => { this.step = String(Number(e.target.value)); }}
              style="padding:6px;font-size:14px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;width:80px;">
          </div>
          <div style="display:flex;flex-direction:column;gap:1px;">
            <label class="label">Decimals</label>
            <input id="decimals" type="number" step="1" min="0" max="15" .value=${this.decimals}
              @input=${e => { this.decimals = Number(e.target.value); this.dispatchEvent(new CustomEvent('decimals-change', { detail: this.decimals })) }}
              style="padding:6px;font-size:14px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;width:70px;">
          </div>
        </div>

        <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap;">
          <leg-input id="new-leg-input" .side=${'long'} .type=${'call'} .strike=${this.defaultStrike} .premium=${this.defaultPremium} .step=${this.step}></leg-input>
          <button class="btn-add" @click=${this.addLeg}>Add Leg</button>
        </div>
      </div>

      <div style="flex:1;overflow-y:auto;">
        ${this.legs.length === 0 ? html`<span style="color:#9ca3af;">No legs added</span>` : ''}
        ${this.legs.map((leg, i) => html`
          <div style="border:1px solid var(--adecbe);border-radius:6px;padding:8px 10px;margin-bottom:6px;">
            <div style="display:flex;gap:3px;align-items:stretch;min-width:0;">
              <div style="display:flex;flex-direction:column;">
                <div style="height:9px;flex-shrink:0;"></div>
                <span style="display:flex;align-items:center;justify-content:center;min-width:24px;border:1px solid var(--adecbe);border-radius:4px;font-weight:bold;font-size:14px;flex:1;">${String.fromCharCode(65 + i)}</span>
              </div>
              <leg-input .side=${leg.side} .type=${leg.type} .strike=${leg.strike} .premium=${leg.premium} .step=${this.step}
                @leg-input-change=${e => this.replaceLeg(i, e.detail)}>
              </leg-input>
              <div style="display:flex;flex-direction:column;">
                <div style="height:9px;flex-shrink:0;"></div>
                <button class="btn-remove" style="flex:1;" @click=${() => this.removeLeg(i)}>X</button>
              </div>
            </div>
          </div>
        `)}
      </div>
    `
  }
}

customElements.define('strategy-builder', StrategyBuilder)
