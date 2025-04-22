<template>
    <!-- End Navbar -->
    <div class="container-fluid py-4" v-if="order" v-cloak>
      <!-- 🛒 Order Detail -->
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h2 class="font-weight-bolder">Order Detail</h2>
            </div>
  
            <div class="card-body">
              <div class="table-responsive p-0">
                <table class="table align-items-center mb-0" id="order-table">
                  <thead>
                    <tr>
                      <th class="text-uppercase text-secondary">Name</th>
                      <th class="text-uppercase text-secondary">Price</th>
                      <th class="text-uppercase text-secondary">Units</th>
                      <th class="text-uppercase text-secondary">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order.cart" :key="item._id">
                      <td>{{ item.name }}</td>
                      <td>${{ item.price }}</td>
                      <td>{{ item.units }}</td>
                      <td>${{ parseInt(item.price) * item.units }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  
            <div class="card-footer">
              <h3>Total: ${{ totalOrder }}</h3>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 👤 Customer Info -->
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h2 class="font-weight-bolder">Customer Detail</h2>
            </div>
  
            <div class="card-body">
              <div class="row">
                <div class="col-md-6" v-if="order.paidVia === 'COD'">
                  <p>{{ order.name }}</p>
                  <p>{{ order.email }}</p>
                  <p>{{ order.mobile }}</p>
                  <p>{{ order.country }}</p>
                </div>
  
                <div class="col-md-6">
                  <span v-if="order.paidVia === 'COD'" class="text-dark">Cash on Delivery</span>
                  <p class="mt-2">{{ order.status }}</p>
                </div>
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
  
  export default {
    data() {
      return {
        order: null,
        orderId: this.$route.params._id,
      }
    },
  
    computed: {
      totalOrder() {
        return this.order
          ? this.order.cart.reduce((sum, item) => sum + parseInt(item.price) * item.units, 0)
          : 0
      }
    },
  
    methods: {
      async getData() {
        try {
          const formData = new FormData()
          formData.append("orderId", this.orderId)
  
          const response = await axios.post(`${this.$apiURL}/admin/orders/fetchSingle`, formData, {
            headers: this.$headers
          })
  
          if (response.data.status === "success") {
            this.order = response.data.order
          } else {
            swal.fire("Error", response.data.message, "error")
          }
        } catch (err) {
          swal.fire("Network Error", "Failed to fetch order details", "error")
        }
      }
    },
  
    mounted() {
      this.getData()
    }
  }
  </script>
  
<style>
  #order-table th,
  #order-table td {
    padding: 12px 16px;
    vertical-align: middle;
  }
  
  [v-cloak] {
    display: none;
  }
</style>
  