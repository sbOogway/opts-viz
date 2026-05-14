import '@shoelace-style/shoelace/dist/themes/light.css'
import { setBasePath } from '@shoelace-style/shoelace'
import './style.css'
import './payoff-graph.js'

document.querySelector('#app').innerHTML = `
  <payoff-graph></payoff-graph>
  <input name="price" type="number"></input>
`
