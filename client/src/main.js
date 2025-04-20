import { createApp } from 'vue'
import App from './App.vue'
import VueTidio from 'vue-tidio'
import { createRouter, createWebHistory } from "vue-router"

// 📦 Import Materialize
import 'materialize-css/dist/js/materialize.min.js'
import 'materialize-css/dist/css/materialize.min.css'
import * as M from 'materialize-css'
window.M = M

// 🧠 Vuex store
import store from './vuex/store'

// 📦 Components
import HomeComponent from "./components/HomeComponent.vue"
import ProductDetail from "./components/ProductDetail.vue"
import CartComponent from "./components/CartComponent.vue"
import CheckoutComponent from "./components/CheckoutComponent.vue"
import RegisterComponent from "./components/RegisterComponent.vue"
import LoginComponent from "./components/LoginComponent.vue"
import PremiumComponent from "./components/PremiumComponent.vue"

// 🚦 Routes
const routes = [
  { path: "/", component: HomeComponent },
  { path: "/product/:_id", component: ProductDetail },
  { path: "/cart", component: CartComponent },
  { path: "/checkout", component: CheckoutComponent },
  { path: "/register", component: RegisterComponent },
  { path: "/login", component: LoginComponent },
  { path: "/premium", component: PremiumComponent }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🚀 Init Vue app
const app = createApp(App)

app.use(router)
app.use(store)
app.use(VueTidio, { appKey: 'kapdevnmnkvcubnn6z7zpiatypsbunjr' })

// 🔄 Show/hide Tidio per route
router.afterEach((to) => {
  if (window.tidioChatApi) {
    window.tidioChatApi.display(to.meta?.showChat ?? true)
  }
})

// 🌍 Global config
const currentHost = window.location.hostname
app.config.globalProperties.$apiURL = `http://${currentHost}:3000`
app.config.globalProperties.$accessTokenKey = "accessTokenKey" // phải trùng key
app.config.globalProperties.$headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem("accessTokenKey")
}

app.config.globalProperties.$months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]
app.config.globalProperties.$headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem("accessTokenKey")
}

// ⛳ Mount the app
app.mount('#app')
