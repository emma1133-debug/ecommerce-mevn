<template>
    <div class="container-fluid py-4">
      <div class="card shadow-sm rounded-3">
        <div class="card-header border-bottom d-flex justify-content-between align-items-center">
          <h4 class="fw-bold text-pink-600 m-0">📦 All Orders</h4>
          <input
            type="text"
            class="form-control w-50"
            placeholder="🔍 Search by user, email, address..."
            v-model="search"
          />
        </div>
  
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover align-middle text-nowrap" id="table">
              <thead class="table-light">
                <tr>
                  <th>User Info</th>
                  <th>Address</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
  
              <tbody>
                <tr v-for="order in orders" :key="order._id">
                  <td>
                    <div class="fw-semibold">{{ order.name }}</div>
                    <small>{{ order.email }}</small><br />
                    <small>{{ order.mobile }}</small><br />
                    <small>{{ order.country }}</small>
                  </td>
  
                  <td>{{ order.address }}</td>
  
                  <td class="fw-semibold text-dark">
                    ${{ getTotal(order.cart, order.shippingCharges || 0) }}
                  </td>
  
                  <td>
                    <span class="badge bg-info text-dark">Cash on delivery</span>
                  </td>
  
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-warning text-dark': order.status === 'Processing',
                        'bg-success': order.status === 'Completed',
                        'bg-secondary': !order.status
                      }"
                    >
                      {{ order.status || 'Pending' }}
                    </span>
                  </td>
  
                  <td class="text-center">
                    <router-link
                      :to="'/orderDetail/' + order._id"
                      class="btn btn-sm btn-outline-secondary me-2"
                    >
                      Detail
                    </router-link>
  
                    <form
                      v-if="!order.status || order.status === 'Processing'"
                      @submit.prevent="markAsCompleted(order._id, $event)"
                      class="d-inline"
                    >
                      <button type="submit" class="btn btn-sm btn-outline-primary">
                        Mark as Complete
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <div class="card-footer text-center">
          <button
            type="button"
            @click="loadMore"
            ref="btnLoadMore"
            class="btn btn-primary w-100"
          >
            Load More
          </button>
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
        page: 1,
        orders: [],
        originalOrders: [],
        search: ""
      }
    },
  
    methods: {
      getTotal(items, shippingCharges) {
        return items.reduce((total, item) => {
          return total + item.price * item.units
        }, shippingCharges)
      },
  
      async markAsCompleted(orderId, event) {
        const btn = event.target
        const self = this
  
        swal
          .fire({
            title: "Are you sure?",
            text: "Do you want to mark this order as completed?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes"
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              btn.setAttribute("disabled", "disabled")
  
              const formData = new FormData()
              formData.append("_id", orderId)
  
              const response = await axios.post(
                self.$apiURL + "/admin/orders/markAsCompleted",
                formData,
                { headers: self.$headers }
              )
  
              if (response.data.status === "success") {
                const order = self.orders.find((o) => o._id === orderId)
                if (order) order.status = "Completed"
                swal.fire("Success", "Order marked as completed", "success")
              } else {
                swal.fire("Error", response.data.message, "error")
              }
  
              btn.removeAttribute("disabled")
            }
          })
      },
  
      async loadMore() {
        this.$refs.btnLoadMore.setAttribute("disabled", "disabled")
        this.page++
        this.getOrders()
      },
  
      async getOrders() {
        const formData = new FormData()
        formData.append("page", this.page)
  
        const response = await axios.post(
          this.$apiURL + "/admin/orders/fetch",
          formData,
          { headers: this.$headers }
        )
  
        this.$refs.btnLoadMore.removeAttribute("disabled")
  
        if (response.data.status === "success") {
          this.orders.push(...response.data.orders)
          this.originalOrders = [...this.orders]
          store.commit("setUnReadOrderNotifications", 0)
        } else {
          swal.fire("Error", response.data.message, "error")
        }
      }
    },
  
    watch: {
      async search(value) {
        if (value.length < 2) {
          this.orders = this.originalOrders
          return
        }
  
        const formData = new FormData()
        formData.append("search", value)
  
        const response = await axios.post(
          this.$apiURL + "/admin/orders/search",
          formData,
          { headers: this.$headers }
        )
  
        if (response.data.status === "success") {
          this.orders = response.data.orders
        } else {
          swal.fire("Error", response.data.message, "error")
        }
      }
    },
  
    mounted() {
      this.getOrders()
    }
  }
  </script>
  
  <style scoped>
  .table td,
  .table th {
    vertical-align: middle;
  }
  
  .badge {
    font-size: 0.85rem;
    padding: 0.45em 0.75em;
  }
  </style>
  