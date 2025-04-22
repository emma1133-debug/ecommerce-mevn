<template>
    <div class="container-fluid py-4">
  
      <!-- Config -->
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header"><h4 class="font-weight-bolder">Configurations</h4></div>
            <div class="card-body">
              <form @submit.prevent="saveConfigurations">
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Admin email</label>
                  <input type="email" class="form-control" name="adminEmail" :value="configurations?.adminEmail || ''" />
                </div>
                <div class="text-center">
                  <button type="submit" class="btn btn-lg bg-gradient-primary w-100 mt-4 mb-0">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Order List -->
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header"><h4 class="font-weight-bolder"> Orders</h4></div>
            <div class="card-body table-responsive">
                <table class="table table-striped">
                <thead>
                    <tr>
                    <th>Order ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Total</th>
                    <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in orders" :key="order._id">
                    <td>{{ order._id.slice(-6).toUpperCase() }}</td>
                    <td>{{ order.name }}</td>
                    <td>{{ order.email }}</td>
                    <td>{{ order.mobile }}</td>
                    <td>{{ order.address }}</td>
                    <td>${{ formatPrice(order.total) }}</td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                    </tr>
                </tbody>
                </table>
              <p v-if="orders.length === 0" class="text-muted">No orders yet.</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Sales Chart -->
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header"><h4 class="font-weight-bolder">Sales in Last 7 Days</h4></div>
            <div class="card-body">
              <canvas id="salesChart"></canvas>
              <p v-if="salesStats.length === 0" class="text-muted text-center mt-2">No data available for the last 7 days.</p>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </template>
  
  <script>
  import axios from "axios"
  import swal from "sweetalert2"
  import { Chart, registerables } from "chart.js"
  
  Chart.register(...registerables)
  
  export default {
    data() {
      return {
        configurations: null,
        orders: [],
        chart: null,
        salesStats: []
      }
    },
    methods: {
      formatPrice(val) {
        return Number(val).toFixed(2)
      },
      formatDate(ts) {
        return new Date(ts).toLocaleDateString()
      },
      async saveConfigurations() {
        const form = event.target
        const formData = new FormData(form)
  
        const response = await axios.post(
          this.$apiURL + "/admin/saveConfigurations",
          formData,
          { headers: this.$headers }
        )
  
        swal.fire("Configurations", response.data.message, response.data.status)
      },
      async getOrders() {
        const res = await axios.post(this.$apiURL + "/admin/orders/fetch", null, {
          headers: this.$headers
        })
        if (res.data.status === "success") {
          this.orders = res.data.orders || []
        }
      },
      async renderSalesChart() {
        try {
            const res = await axios.post(this.$apiURL + "/admin/orders/salesChart", null, {
            headers: this.$headers
            })

            if (res.data.status === "success" && Array.isArray(res.data.stats)) {
            const stats = res.data.stats
            this.salesStats = stats

            const ctx = document.getElementById("salesChart").getContext("2d")
            if (this.chart) this.chart.destroy()

            this.chart = new Chart(ctx, {
                type: "bar",
                data: {
                labels: stats.map(s => s.date),
                datasets: [{
                    label: "Completed Orders",
                    data: stats.map(s => s.count), // lấy số lượng đơn mỗi ngày
                    backgroundColor: "#4caf50"
                }]
                },
                options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // vì đây là số lượng đơn, nên step = 1
                    }
                    }
                }
                }
            })
            } else {
            this.salesStats = []
            }
        } catch (err) {
            console.error("⚠️ Failed to load sales chart:", err)
            this.salesStats = []
        }
        }
    },
    async mounted() {
      const res = await axios.post(this.$apiURL + "/getConfigurations", null)
      if (res.data.status === "success") {
        this.configurations = res.data.configurations
      }
  
      await this.getOrders()
      await this.renderSalesChart()
    }
  }
  </script>
  
  <style scoped>
  .no-left-margin::before {
    width: auto !important;
  }
  </style>
  