import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

// Initialize Firebase (imported but not executed here - handled in firebase/config.js)
import './firebase/config'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme store after Pinia is installed
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore(pinia)
themeStore.initializeTheme()

app.mount('#app')
