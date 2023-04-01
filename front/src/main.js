import "@/bootstrap.js";
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import VueKonva from 'vue-konva';
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faSquare} from '@fortawesome/free-regular-svg-icons'

import './assets/main.css'
library.add(faPaintBrush,faCircle,faSquare)

const app = createApp(App)

app.use(createPinia())
app.use(VueKonva);
app.use(router)


.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app')

