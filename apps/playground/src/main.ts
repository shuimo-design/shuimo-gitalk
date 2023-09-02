import { createApp } from 'vue'
import { createMUI } from 'shuimo-ui'
import App from './App.vue'
import 'shuimo-ui/dist/style.css'

const app = createApp(App)
app.use(createMUI())
app.mount('#app')
