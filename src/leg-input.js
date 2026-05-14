import { LitElement, html } from 'lit'

const inputStyle = 'padding:6px;font-size:14px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;'

const labeledInput = (step, value, label, width, onInput) => html`
  <div style="display:flex;flex-direction:column;gap:0;">
    <label style="font-size:9px;color:#555;">${label}</label>
    <input type="number" step=${step} .value=${value} style="${inputStyle}width:${width};" @input=${onInput}>
  </div>
`

export class LegInput extends LitElement {
  static properties = {
    direction: { type: String },
    type: { type: String },
    strike: { type: Number },
    premium: { type: Number },
    step: { type: String },
  }

  constructor() {
    super()
    this.direction = 'long'
    this.type = 'call'
    this.strike = 0
    this.premium = 0
    this.step = '0.00001'
  }

  createRenderRoot() {
    return this
  }

  emitChange() {
    this.dispatchEvent(new CustomEvent('leg-input-change', {
      detail: { direction: this.direction, type: this.type, strike: this.strike, premium: this.premium },
    }))
  }

  render() {
    return html`
      <div style="display:flex;gap:3px;align-items:center;">
        <select style="${inputStyle}" .value=${this.direction}
          @change=${e => { this.direction = e.target.value; this.emitChange() }}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
        <select style="${inputStyle}" .value=${this.type}
          @change=${e => { this.type = e.target.value; this.emitChange() }}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
        ${labeledInput(this.step, this.strike, 'Strike', '70px', e => { this.strike = Number(e.target.value); this.emitChange() })}
        ${labeledInput(this.step, this.premium, 'Premium', '70px', e => { this.premium = Number(e.target.value); this.emitChange() })}
      </div>
    `
  }
}

customElements.define('leg-input', LegInput)
