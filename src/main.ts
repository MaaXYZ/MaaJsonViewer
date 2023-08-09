import { createApp } from 'vue'

import './main.css'

import Wrapper from './Wrapper.vue'

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

const app = createApp(Wrapper)

app.mount('#app')
