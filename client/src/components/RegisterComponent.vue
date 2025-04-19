<template>
    <div class="section no-pad-bot" id="index-banner">
      <div class="container" style="margin-bottom: 50px;">
        <div class="row">
          <div class="col offset-m3 m6">
            <div class="sparkle-wrapper">
              <h1 class="register-heading">🌸 Let's Get You In!</h1>
              <div class="sparkle sparkle-1"></div>
              <div class="sparkle sparkle-2"></div>
              <div class="sparkle sparkle-3"></div>
              <div class="sparkle sparkle-4"></div>
            </div>
  
            <form method="POST" v-on:submit.prevent="doRegister">
              <div class="form-group">
                <label class="text-white">Your Lovely Name</label>
                <input type="text" class="form-control" name="name" autocomplete="off" />
              </div>
  
              <br />
  
              <div class="form-group">
                <label class="text-white">Your Sweet Email</label>
                <input type="email" class="form-control" name="email" autocomplete="off" />
              </div>
  
              <br />
  
              <div class="form-group">
                <label class="text-white">Create a Sparkly Password</label>
                <input type="password" class="form-control" name="password" autocomplete="off" />
              </div>
  
              <br />
  
              <input
                type="submit"
                value="🌟 Register Me!"
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
  
  export default {
    data() {
      return { isLoading: false }
    },
    methods: {
      async doRegister() {
        const form = event.target
        const formData = new FormData(form)
  
        this.isLoading = true
        const response = await axios.post(this.$apiURL + "/registration", formData)
        this.isLoading = false
  
        swal.fire("Registration", response.data.message, response.data.status)
  
        if (response.data.status === "success") {
          form.reset()
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
  
  .sparkle-wrapper {
    position: relative;
    text-align: center;
    margin-bottom: 50px;
  }
  
  .register-heading {
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
  
  /* Emoji sparkles */
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
  
  /* Cute pink button style */
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
  </style>