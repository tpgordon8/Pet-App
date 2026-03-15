import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

// Initialize Firebase (imported but not executed here - handled in firebase/config.js)
import './firebase/config'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
