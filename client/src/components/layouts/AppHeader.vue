<template>
  <nav class="header-nav z-depth-1">
    <div class="nav-wrapper container">
      <!-- 🌸 Logo -->
      <router-link id="logo-container" to="/" class="brand-logo">Emma Channe</router-link>

      <!-- 📱 Mobile menu icon -->
      <a href="#" data-target="nav-mobile" class="sidenav-trigger">
        <i class="material-icons">menu</i>
      </a>

      <!-- 🌸 Desktop nav -->
      <ul class="right hide-on-med-and-down">
        <!-- 🔍 Search (notranslate) -->
        <li class="notranslate">
          <form @submit.prevent="doSearch" class="header-search">
            <div class="input-wrapper notranslate">
              <i class="material-icons search-icon notranslate">search</i>
              <input
                type="search"
                v-model="search"
                placeholder="Search..."
                class="search-input notranslate"
              />
              <i class="material-icons close-icon notranslate" v-if="search" @click="search = ''">close</i>
            </div>
          </form>
        </li>

        <!-- 🌍 Language Selector -->
        <li class="lang-selector">
          <div class="input-field" style="margin:0">
            <select ref="langSelect" v-model="selectedLang" @change="changeLang" class="browser-default">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="vi">Tiếng Việt</option>
            </select>
            <label>🌍 Language</label>
          </div>
        </li>

        <!-- 🔐 Auth Links -->
        <li v-if="!login">
          <router-link class="nav-link" to="/login">Login</router-link>
        </li>
        <li v-if="!login">
          <router-link class="nav-link" to="/register">Register</router-link>
        </li>

        <!-- Logged-in User Dropdown -->
        <li v-if="user">
          <a
            class="dropdown-trigger nav-link"
            href="javascript:void(0)"
            data-target="dropdown-user"
          >{{ user.name }}</a>
          <ul id="dropdown-user" class="dropdown-content" style="width: 140px;">
            <li>
              <button class="logout-btn" @click="doLogout">Log out</button>
            </li>
          </ul>
        </li>

        <!-- 🛒 Cart (notranslate) -->
        <li class="notranslate">
          <router-link class="nav-link cart-link" to="/cart">
            <span class="cart-icon-wrapper notranslate">
              <i class="material-icons notranslate">shopping_cart</i>
              <span v-if="cartCounter > 0" class="cart-badge notranslate">{{ cartCounter }}</span>
            </span>
          </router-link>
        </li>
      </ul>

      <!-- 📱 Mobile Nav -->
      <ul id="nav-mobile" class="sidenav"></ul>
    </div>
  </nav>
</template>

<script>
import store from "../../vuex/store"
import axios from "axios"
import swal from "sweetalert2"
import { io } from "socket.io-client"

export default {
  name: "AppHeader",
  data() {
    return {
      search: "",
      selectedLang: localStorage.getItem("selectedLang") || "en"
    }
  },
  computed: {
    user() {
      return store.getters.getUser
    },
    login() {
      return store.getters.getLogin
    },
    cartCounter() {
      return store.getters.getCartCounter
    }
  },
  methods: {
    doSearch() {
    store.commit("setSearch", this.search)
    this.$router.push("/") // redirect về Home để load lại với search mới
  },
    changeLang() {
      const to = this.selectedLang
      const googTransValue = `/auto/${to}`

      document.cookie = `googtrans=${googTransValue};path=/`
      localStorage.setItem("selectedLang", this.selectedLang)
      store.commit("setSelectedLang", this.selectedLang)

      window.location.reload()
    },


    async doLogout() {
  try {
    const token = localStorage.getItem(this.$accessTokenKey)

    const response = await axios.post(this.$apiURL + "/logout", null, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })

    if (response.data.status === "success") {
      localStorage.removeItem(this.$accessTokenKey)
      store.commit("setLogin", false)
      store.commit("setUser", null)

      if (global.socketIO && global.socketIO.disconnect) {
        global.socketIO.disconnect()
      }

      window.location.href = "/login"
    } else {
      swal.fire("Logout Failed", response.data.message || "Unknown error", "error")
    }
  } catch (err) {
    console.error("Logout error:", err)
    swal.fire("Oops!", "Something went wrong during logout.", "error")
  }
},
    async getUser() {
      if (localStorage.getItem(this.$accessTokenKey)) {
        const response = await axios.post(this.$apiURL + "/getUser", null, {
          headers: this.$headers
        })
        if (response.data.status === "success") {
          store.commit("setUser", response.data.user)

          global.socketIO.emit("connected", response.data.user.email)
          global.socketIO.on("newMessage", (message) => {
            store.commit("appendMessage", message)
            M.toast({ html: "New message has been received." })
          })

          setTimeout(() => {
            const elems = document.querySelectorAll('.dropdown-trigger')
            M.Dropdown.init(elems, {})
          }, 300)
        } else {
          localStorage.removeItem(this.$accessTokenKey)
        }
        store.commit("setLogin", !!localStorage.getItem(this.$accessTokenKey))
      }
    },
    syncCartFromCookie() {
      try {
        const cookieMap = Object.fromEntries(
          document.cookie.split("; ").map(c => {
            const [k, v] = c.split("=")
            return [k, decodeURIComponent(v)]
          })
        )
        if (cookieMap.products) {
          const cart = JSON.parse(cookieMap.products)
          store.commit("setCartCounter", Array.isArray(cart) ? cart.length : 0)
        } else {
          store.commit("setCartCounter", 0)
        }
      } catch (err) {
        console.warn("🔥 Failed to sync cart from cookie:", err)
        store.commit("setCartCounter", 0)
      }
    }
  },
  mounted() {
    this.syncCartFromCookie()
    global.socketIO = io(this.$apiURL)
    this.getUser()

    const sidenav = document.querySelectorAll('.sidenav')
    M.Sidenav.init(sidenav, {})

    this.$nextTick(() => {
      const langSelect = this.$refs.langSelect
      if (langSelect) {
        M.FormSelect.init(langSelect)
      }
    })

    // 🌐 Apply stored language by setting cookie if missing
    const storedLang = localStorage.getItem("selectedLang") || "en"
    if (!document.cookie.includes(`googtrans=/auto/${storedLang}`)) {
      this.changeLang()
    }
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Parisienne&family=Nunito:wght@500;600&display=swap');

.header-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff0f5;
  font-family: 'Poppins', sans-serif;
  height: 72px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.brand-logo {
  font-family: 'Parisienne', cursive;
  font-size: 3rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: #ff69b4;
  text-shadow:
    0 0 4px #fff,
    0 0 8px #ffd6e8,
    0 0 12px #ff69b4;
  transition: transform 0.3s ease, text-shadow 0.3s ease;
  margin-left: 6px;
}
.brand-logo:hover {
  transform: scale(1.08);
  text-shadow:
    0 0 6px #fff,
    0 0 12px #ffc0cb,
    0 0 20px #ff69b4;
}

.nav-link {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  color: #4b4b4b;
  transition: 0.3s ease;
  line-height: 60px;
  position: relative;
  padding: 4px 6px;
}
.nav-link:hover {
  color: #d63384;
  transform: scale(1.08);
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 0%;
  height: 2px;
  background-color: #d63384;
  transition: width 0.3s ease;
}
.nav-link:hover::after {
  width: 100%;
}
.nav-link:hover::before {
  content: '✨';
  position: absolute;
  top: -8px;
  right: -10px;
  font-size: 12px;
  animation: sparkleFloat 1s ease-in-out infinite;
}

@keyframes sparkleFloat {
  0% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-4px); }
  100% { opacity: 0; transform: translateY(0); }
}

input[type="search"] {
  appearance: none;
  -webkit-appearance: none;
  border: none !important;
  box-shadow: none !important;
  background: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.header-search {
  display: flex;
  align-items: center;
  height: 60px;
  margin: 0 12px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 4px 12px;
  box-shadow: 0 0 0 2px #ffd3e3;
  height: 36px;
  width: 200px;
  transition: width 0.3s ease, box-shadow 0.2s ease;
}
.input-wrapper:focus-within {
  width: 260px;
  box-shadow: 0 0 0 2.5px #ffcde3;
}

.search-input {
  all: unset;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  color: #333;
  flex: 1;
  padding: 6px 8px;
  height: 30px;
  line-height: 30px;
}

.search-icon,
.close-icon {
  font-size: 20px;
  color: #d63384;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, color 0.2s ease;
}
.search-icon {
  margin-right: 8px;
}
.search-icon:hover,
.close-icon:hover {
  transform: scale(1.15);
  color: #b91e66;
}

.material-icons {
  color: #555;
  vertical-align: middle;
}

.sidenav-trigger i {
  transition: transform 0.2s ease;
}
.sidenav-trigger:hover i {
  transform: scale(1.15);
}

.dropdown-trigger {
  cursor: pointer;
}

.cart-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 40px;
}

.cart-icon-wrapper i {
  font-size: 24px;
}

.cart-badge {
  position: absolute;
  top: 2px;
  right: -4px;
  background-color: #d63384;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 2px 6px;
  line-height: 1;
  min-width: 18px;
  text-align: center;
}

ul.right > li {
  margin-left: 16px;
}
.nav-link {
  padding: 0 16px;
  font-size: 1.2rem;
}

.input-field label {
  color: transparent;
  font-size: 0;
  height: 0;
}

/* 💥 Google Translate style fixes */
body > .goog-te-banner-frame.skiptranslate,
body > .skiptranslate {
  display: none !important;
}
body {
  top: 0px !important;
}
#google_translate_element {
  all: unset;
  display: inline-block;
  width: auto;
  height: auto;
  font-size: 0;
  position: absolute;
  visibility: hidden;
}
.goog-logo-link,
.goog-te-gadget span,
#goog-gt-tt,
.goog-te-balloon-frame,
.goog-text-highlight {
  display: none !important;
}

.lang-selector select.browser-default {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  color: #4b4b4b;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 1.2rem;
  height: 60px;
  line-height: 60px;
  padding: 0 16px;
  margin: 0;
  cursor: pointer;
  position: relative;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.lang-selector select.browser-default:hover,
.lang-selector select.browser-default:focus {
  color: #d63384;
  border-bottom: 2px solid #d63384;
  outline: none;
}

.lang-selector select.browser-default:hover::before {
  content: '✨';
  position: absolute;
  top: -8px;
  right: -10px;
  font-size: 12px;
  animation: sparkleFloat 1s ease-in-out infinite;
}

@keyframes sparkleFloat {
  0% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-4px); }
  100% { opacity: 0; transform: translateY(0); }
}

.lang-selector {
  display: flex;
  align-items: center;
  height: 60px;
}

.lang-selector .input-field {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
  display: flex;
  align-items: center;
}

.lang-selector label {
  display: none !important;
}

.logout-btn {
  width: 100%;
  background: #fff0f5;
  color: #d63384;
  border: 1px solid #ffb6c1;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.logout-btn:hover {
  background-color: #ffddea;
  color: #b3266e;
  transform: scale(1.03);
}


</style>