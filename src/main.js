export const SPACING = '16px'

import './styles/style.css'
import './components/payoff-graph.js'
import './components/strategy-builder.js'
import './components/chart-controls.js'

document.querySelector('#app').innerHTML = `
  <div style="display:flex;gap:${SPACING};padding:${SPACING};width:100%;height:100vh;box-sizing:border-box;overflow:hidden;">
    <div style="flex:4;display:flex;flex-direction:column;gap:${SPACING};min-width:0;">
      <div class="panel" style="flex:1;display:flex;flex-direction:column;min-height:0;">
        <payoff-graph style="flex:1;min-height:0;"></payoff-graph>
      </div>
      <div class="panel" style="flex-shrink:0;">
        <chart-controls></chart-controls>
      </div>
    </div>
    <div class="panel" style="flex:1.5;display:flex;flex-direction:column;min-width:0;min-height:0;">
      <strategy-builder style="display:flex;flex-direction:column;flex:1;min-height:0;"></strategy-builder>
    </div>
  </div>
`

const builder = document.querySelector('strategy-builder')
const graph = document.querySelector('payoff-graph')

builder.addEventListener('legs-change', e => {
  graph.legs = e.detail
})

builder.addEventListener('underlying-change', e => {
  graph.underlyingPrice = e.detail
})

builder.addEventListener('decimals-change', e => {
  graph.decimals = e.detail
})
