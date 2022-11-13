import { createApp } from 'vue'
import App from './App.vue'
import '~/styles'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@okiss/vbtf/style.css'

createApp(App).use(ElementPlus).mount('#app')
