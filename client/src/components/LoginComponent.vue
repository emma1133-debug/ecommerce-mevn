<template>
  <div class="section no-pad-bot" id="index-banner">
    <div class="container" style="margin-bottom: 50px;">
      <div class="row">
        <!-- 🔥 Cập nhật row bự hơn -->
        <div class="col s12 m8 offset-m2 l6 offset-l3">
          <div class="sparkle-wrapper">
            <h1 class="login-heading">🌸 Welcome Back, Lovely!</h1>
            <div class="sparkle sparkle-1"></div>
            <div class="sparkle sparkle-2"></div>
            <div class="sparkle sparkle-3"></div>
            <div class="sparkle sparkle-4"></div>
          </div>

          <form method="POST" v-on:submit.prevent="doLogin">
            <div class="form-group">
              <label class="text-white">Your Sweet Email</label>
              <input type="email" class="form-control" name="email" autocomplete="off" />
            </div>

            <br />

            <div class="form-group">
              <label class="text-white">Secret Sparkle Password</label>
              <input type="password" class="form-control" name="password" autocomplete="off" />
            </div>

            <br />

            <input
              type="submit"
              value="✨ LET ME IN!"
              v-bind:disabled="isLoading"
              name="submit"
              class="btn btn-primary"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import swal from "sweetalert2"
import store from "../vuex/store"

export default {
  data() {
    return { isLoading: false }
  },
  methods: {
    async doLogin() {
      const form = event.target
      const formData = new FormData(form)

      this.isLoading = true
      const response = await axios.post(this.$apiURL + "/login", formData)
      this.isLoading = false

      swal.fire("Login", response.data.message, response.data.status)

      if (response.data.status == "success") {
        form.reset()
        const accessToken = response.data.accessToken
        localStorage.setItem(this.$accessTokenKey, accessToken)
        this.$headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }

        store.commit("setLogin", true)
        store.commit("setUser", response.data.user)

        setTimeout(() => {
          const elems = document.querySelectorAll('.dropdown-trigger')
          M.Dropdown.init(elems, {})
        }, 500)

        this.$router.push("/")
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap');

label {
  font-size: initial;
}

.form-group input {
  padding: 14px 16px;
  font-size: 1.2rem;
  border-radius: 8px;
  border: 1px solid #ffc1e3;
  background-color: #fff0f7;
  color: #333;
}

.form-group label {
  font-size: 1.1rem;
  color: #d63384;
}

.sparkle-wrapper {
  position: relative;
  text-align: center;
  margin-bottom: 50px;
}

.login-heading {
  font-family: 'Dancing Script', cursive;
  font-size: 4.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 50px;
  letter-spacing: 1.5px;
  background: linear-gradient(90deg, #ff4d88, #ff6ec7, #ff4d88);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 6px rgba(255, 105, 180, 0.4));
  animation: ultraShine 3s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

@keyframes ultraShine {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ✨ Emoji sparkles */
.sparkle {
  position: absolute;
  font-size: 20px;
  animation: sparkleSpin 3s infinite ease-in-out;
  opacity: 0.8;
  pointer-events: none;
}
.sparkle::before {
  content: "✨";
  display: block;
}
.sparkle-1 { top: -20px; left: 10%; animation-delay: 0s; }
.sparkle-2 { top: -25px; right: 10%; animation-delay: 1s; }
.sparkle-3 { bottom: -15px; left: 20%; animation-delay: 2s; }
.sparkle-4 { bottom: -25px; right: 15%; animation-delay: 3s; }

@keyframes sparkleSpin {
  0%   { transform: scale(1) rotate(0deg); opacity: 0.8; }
  50%  { transform: scale(1.5) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 0.8; }
}

/* 💖 Cute button */
.btn.btn-primary {
  background-color: #ff69b4 !important;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 1px;
  color: white;
  transition: background 0.3s ease;
}
.btn.btn-primary:hover {
  background-color: #ff1493 !important;
}
.row {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 32px;
}

</style>
