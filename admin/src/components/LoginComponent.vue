<template>
  <div class="page-header align-items-start min-vh-100" style="background-image: url('https://watermark.lovepik.com/photo/40098/0739.jpg_wh1200.jpg');">
    <span class="mask bg-gradient-dark opacity-6"></span>

    <!-- Sakura Falling Effect -->
    <div class="sakura-wrapper">
      <div v-for="n in 30" :key="n" class="sakura" :style="getSakuraStyle(n)"></div>
    </div>

    <div class="container my-auto">
      <div class="row">
        <div class="col-lg-4 col-md-8 col-12 mx-auto">
          <div class="card z-index-0 fadeIn3 fadeInBottom">
            <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
              <div class="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">Sign in</h4>
              </div>
            </div>
            <div class="card-body px-4 pb-4">
              <form id="login-form" class="text-start" v-on:submit.prevent="doLogin">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" autocomplete="off" class="custom-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input type="password" name="password" autocomplete="off" class="custom-input" />
                </div>
                <div class="text-center">
                  <button type="submit" name="submit" class="btn bg-gradient-primary w-100 my-4 mb-2">Sign in</button>
                </div>
              </form>
            </div>
          </div>
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
    return {
      sakuraIcons: [
        "https://cdn-icons-png.flaticon.com/512/6629/6629916.png",
        "https://cdn-icons-png.flaticon.com/512/7096/7096435.png",
        "https://cdn-icons-png.flaticon.com/512/5479/5479885.png"
      ]
    }
  },
  methods: {
    doLogin: async function () {
      const form = event.target
      const formData = new FormData(form)

      form.submit.setAttribute("disabled", "disabled")

      const response = await axios.post(this.$apiURL + "/admin/login", formData)

      form.submit.removeAttribute("disabled")

      if (response.data.status == "success") {
        const accessToken = response.data.accessToken
        localStorage.setItem(this.$accessTokenKey, accessToken)
        form.reset()
        this.$headers.Authorization = "Bearer " + accessToken
        store.commit("setAdmin", response.data.admin)
        store.commit("setLogin", true)
        this.$router.push({ path: "/" })
      } else {
        swal.fire("Error", response.data.message, "error")
      }
    },

    getSakuraStyle(n) {
      const size = Math.floor(Math.random() * 20) + 10;
      const duration = Math.random() * 10 + 5;
      const delay = Math.random() * 5;
      const left = Math.random() * 100;
      const icon = this.sakuraIcons[Math.floor(Math.random() * this.sakuraIcons.length)];

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}vw`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        backgroundImage: `url('${icon}')`
      }
    }
  },

  mounted: function () {
    setTimeout(() => {
      const form = document.getElementById("login-form")
      if (form) {
        form.email.value = ""
        form.password.value = ""
      }
    }, 500)
  }
}
</script>

<style scoped>
.sakura-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.sakura {
  position: absolute;
  top: -10px;
  background-size: contain;
  background-repeat: no-repeat;
  animation: fall linear infinite;
  opacity: 0.85;
  will-change: transform;
}

@keyframes fall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
  }
  100% {
    transform: translateY(120vh) rotate(360deg);
  }
}

.card {
  border-radius: 20px;
  background-color: #fff9fb;
  box-shadow: 0 10px 30px rgba(255, 192, 203, 0.4);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-header {
  border-radius: 20px 20px 0 0;
  background: linear-gradient(90deg, #ffb6c1, #ff8fc3);
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
}

.card-header h4 {
  font-family: 'Dancing Script', cursive;
  font-size: 2.2rem;
  letter-spacing: 1px;
}

.input-group .form-control {
  background-color: #fff0f7;
  border: 1px solid #ffcae0;
  border-radius: 12px;
  padding: 10px 15px;
  color: #333;
  font-size: 1rem;
}

.input-group .form-control:focus {
  border-color: #ff99cc;
  box-shadow: 0 0 0 2px rgba(255, 153, 204, 0.2);
}

.btn.bg-gradient-primary {
  background: linear-gradient(90deg, #ff85b3, #ff66cc);
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn.bg-gradient-primary:hover {
  background: linear-gradient(90deg, #ff66cc, #ff85b3);
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 105, 180, 0.3);
}

.form-label {
  color: #d63384;
  font-weight: 600;
}

.page-header {
  background-size: cover;
  background-position: center;
  position: relative;
}

.page-header::before {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(3px);
  z-index: 0;
}

.card,
.card-body {
  z-index: 2;
  position: relative;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 600;
  color: #d63384;
  margin-bottom: 8px;
  font-size: 1rem;
  display: block;
}

.custom-input {
  padding: 12px 16px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid #ffcce6;
  background-color: #fff0f7;
  font-size: 1rem;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.custom-input:focus {
  outline: none;
  border-color: #ff66b2;
  background-color: #fff5fb;
  box-shadow: 0 0 0 4px rgba(255, 105, 180, 0.2);
}


</style>
