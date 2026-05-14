import '@shoelace-style/shoelace/dist/themes/light.css'
import { setBasePath } from '@shoelace-style/shoelace'
import './style.css'
import './payoff-graph.js'
import './strategy-builder.js'

setBasePath('/node_modules/@shoelace-style/shoelace/dist')

document.querySelector('#app').innerHTML = `
  <strategy-builder></strategy-builder>
  <payoff-graph></payoff-graph>
`

const builder = document.querySelector('strategy-builder')
const graph = document.querySelector('payoff-graph')

builder.addEventListener('legs-change', e => {
  graph.legs = e.detail
})

builder.addEventListener('underlying-change', e => {
  graph.underlyingPrice = e.detail
})
