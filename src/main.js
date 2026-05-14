import '@shoelace-style/shoelace/dist/themes/light.css'
import { setBasePath } from '@shoelace-style/shoelace'
import './style.css'
import './payoff-graph.js'
import './strategy-builder.js'
import './chart-controls.js'

setBasePath('/node_modules/@shoelace-style/shoelace/dist')

document.querySelector('#app').innerHTML = `
  <div style="display:flex;gap:16px;padding:16px;width:100%;height:100vh;box-sizing:border-box;">
    <div style="flex:4;display:flex;flex-direction:column;gap:16px;">
      <div class="panel" style="flex:1;display:flex;flex-direction:column;">
        <payoff-graph style="flex:1;"></payoff-graph>
      </div>
      <div class="panel">
        <chart-controls></chart-controls>
      </div>
    </div>
    <div class="panel" style="flex:1;">
      <strategy-builder style="display:block;height:100%;"></strategy-builder>
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
