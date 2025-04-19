<template>
  <nav class="navbar navbar-main navbar-expand px-4 py-2 bg-pink-50 shadow-sm rounded-xl mt-3 mx-3">
    <div class="container-fluid justify-content-between align-items-center">
      
      <!-- Left: Brand -->
      <div class="d-flex align-items-center">
        <i class="material-icons text-pink-400 me-2">spa</i>
        <h6 class="m-0 text-pink-600 fw-semibold">Emma Dashboard</h6>
      </div>

      <!-- Right: Admin + Logout -->
      <div class="d-flex align-items-center">
        <div class="me-3 text-end">
          <div class="fw-semibold text-pink-700">{{ admin?.name || 'Admin' }}</div>
          <small class="text-muted">{{ admin?.email }}</small>
        </div>

        <img
          :src="admin?.avatar || defaultAvatar"
          alt="Avatar"
          class="rounded-circle"
          width="40"
          height="40"
          style="object-fit: cover;"
        />

        <button
          class="btn btn-sm btn-outline-danger ms-3"
          @click="doLogout"
        >
          <i class="material-icons me-1">logout</i> Logout
        </button>
      </div>

    </div>
  </nav>
</template>

<script>
import store from "@/vuex/store"
import axios from "axios"

export default {
  data() {
    return {
      defaultAvatar: "https://shopemilym.com/cdn/shop/products/il_fullxfull.5410254897_7wbv.jpg?v=1699382024&width=1600" // cute fallback avatar
    }
  },
  computed: {
    admin() {
      return store.getters.getAdmin
    }
  },
  methods: {
    async doLogout() {
      await axios.post(this.$apiURL + "/admin/logout", null, {
        headers: this.$headers
      })
      localStorage.removeItem(this.$accessTokenKey)
      store.commit("setLogin", false)
      store.commit("setAdmin", null)
      this.$router.push({ path: "/login" })
    }
  }
}
</script>

<style scoped>
.navbar {
  border-radius: 1rem;
}
</style>
