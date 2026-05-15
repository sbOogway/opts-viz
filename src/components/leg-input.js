import { LitElement, html } from 'lit'

const inputBase = 'padding:6px;font-size:14px;border-radius:4px;box-sizing:border-box;width:100%;'
const inputStyle = `${inputBase}border:1px solid #ccc;`

const selectStyle = (value, greenValue) =>
  `${inputBase}border:2px solid ${value === greenValue ? '#00ff00' : '#ff0000'};`

const labeledInput = (step, value, label, onInput) => html`
  <div style="display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;">
    <label class="label">${label}</label>
    <input type="number" step=${step} .value=${value} style="${inputStyle}" @input=${onInput}>
  </div>
`

export class LegInput extends LitElement {
  static properties = {
    side: { type: String },
    type: { type: String },
    strike: { type: Number },
    premium: { type: Number },
    quantity: { type: Number },
    step: { type: String },
  }

  constructor() {
    super()
    this.side = 'long'
    this.type = 'call'
    this.strike = 0
    this.premium = 0
    this.quantity = 1
    this.step = '0.00001'
  }

  createRenderRoot() {
    return this
  }

  emitChange() {
    this.dispatchEvent(new CustomEvent('leg-input-change', {
      detail: { side: this.side, type: this.type, strike: this.strike, premium: this.premium, quantity: this.quantity },
    }))
  }

  render() {
    return html`
      <div style="display:flex;gap:3px;align-items:stretch;min-width:0;">
        <div style="display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;">
          <label class="label">Side</label>
          <select style="${selectStyle(this.side, 'long')}" .value=${this.side}
            @change=${e => { this.side = e.target.value; this.emitChange() }}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;">
          <label class="label">Type</label>
          <select style="${selectStyle(this.type, 'call')}" .value=${this.type}
            @change=${e => { this.type = e.target.value; this.emitChange() }}>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </div>
        ${labeledInput(this.step, this.strike, 'Strike', e => { this.strike = Number(e.target.value); this.emitChange() })}
        ${labeledInput(this.step, this.premium, 'Premium', e => { this.premium = Number(e.target.value); this.emitChange() })}
        ${labeledInput('1', this.quantity, 'Qty', e => { this.quantity = Math.max(1, Math.round(Number(e.target.value))); this.emitChange() })}
      </div>
    `
  }
}

customElements.define('leg-input', LegInput)
