import { LitElement, html } from 'lit'

const inputStyle = 'padding:6px;font-size:14px;border:1px solid #ccc;border-radius:4px;'

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
    const defaultPrice = 1
    this.underlyingPrice = defaultPrice
    this.defaultStrike = defaultPrice
    this.defaultPremium = defaultPrice
  }

  createRenderRoot() {
    return this
  }

  syncDefaults() {
    this.defaultStrike = this.underlyingPrice
    this.defaultPremium = this.underlyingPrice
  }

  addLeg() {
    const type = this.querySelector('#leg-type').value
    const direction = this.querySelector('#leg-direction').value
    const strike = Number(this.querySelector('#leg-strike').value)
    const premium = Number(this.querySelector('#leg-premium').value)

    if (!strike || !premium) return

    this.legs = [...this.legs, { type, direction, strike, premium }]
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
  }

  removeLeg(index) {
    this.legs = this.legs.filter((_, i) => i !== index)
    this.dispatchEvent(new CustomEvent('legs-change', { detail: this.legs }))
  }

  render() {
    return html`
      <div class="leg-form" style="border:1px solid var(--adecbe);border-radius:6px;padding:10px;margin-bottom:12px;">
        <div style="margin-bottom:10px;">
          <label for="underlying-price" style="font-size:14px;margin-right:8px;">Underlying Price</label>
          <input id="underlying-price" type="number" step=${this.step} .value=${this.underlyingPrice}
            @input=${e => { this.underlyingPrice = Number(e.target.value); this.syncDefaults(); this.dispatchEvent(new CustomEvent('underlying-change', { detail: this.underlyingPrice })) }}
            style="${inputStyle}width:150px;">
        </div>

        <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap;">
          <select id="leg-type" style="${inputStyle}">
            <option value="call" selected>Call</option>
            <option value="put">Put</option>
          </select>
          <select id="leg-direction" style="${inputStyle}">
            <option value="long" selected>Long</option>
            <option value="short">Short</option>
          </select>
          <input id="leg-strike" type="number" step=${this.step} .value=${this.defaultStrike} style="${inputStyle}width:110px;">
          <input id="leg-premium" type="number" step=${this.step} .value=${this.defaultPremium} style="${inputStyle}width:110px;">
          <button class="btn-add" @click=${this.addLeg}>Add Leg</button>
        </div>
      </div>

      <div>
        ${this.legs.length === 0 ? html`<span style="color:#9ca3af;">No legs added</span>` : ''}
        ${this.legs.map((leg, i) => html`
          <div style="border:1px solid var(--adecbe);border-radius:6px;padding:6px 10px;margin-bottom:6px;display:flex;gap:8px;align-items:center;">
            <span><b>${String.fromCharCode(65 + i)}</b> &mdash; ${leg.direction} ${leg.type} &mdash; Strike: ${leg.strike}, Premium: ${leg.premium}</span>
            <button class="btn-remove" @click=${() => this.removeLeg(i)}>X</button>
          </div>
        `)}
      </div>
    `
  }
}

customElements.define('strategy-builder', StrategyBuilder)
