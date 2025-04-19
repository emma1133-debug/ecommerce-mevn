<template>
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-md-12">
          <div class="card shadow-sm rounded-lg">
            <div class="card-header border-bottom pb-3">
              <h4 class="font-weight-bolder text-pink-600">🛍️ All Products</h4>
            </div>
  
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" id="products-table">
                  <thead class="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>In Stock</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
  
                  <tbody>
                    <tr v-for="product in products" :key="product._id">
                      <td class="fw-medium text-dark">{{ product.name }}</td>
                      <td>${{ product.price }}</td>
                      <td>{{ product.itemsInStock || 0 }}</td>
                      <td class="text-center">
                        <router-link
                          :to="'/product/edit/' + product._id"
                          class="btn btn-sm btn-outline-primary me-2"
                        >
                          ✏️ Edit
                        </router-link>
  
                        <form @submit.prevent="deleteProduct" class="d-inline">
                          <input type="hidden" name="_id" :value="product._id" />
                          <button type="submit" class="btn btn-sm btn-outline-danger">
                            🗑️ Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  
            <div class="card-footer border-top pt-3">
              <button
                type="button"
                @click="loadMore"
                class="btn btn-lg btn-primary w-100"
                ref="btnLoadMore"
              >
                Load More
              </button>
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
        page: 1,
        products: []
      }
    },
  
    methods: {
      deleteProduct: async function () {
        const self = this
        const form = event.target
        const formData = new FormData(form)
  
        swal
          .fire({
            title: "Are you sure?",
            text: "This product will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          })
          .then(async function (result) {
            if (result.isConfirmed) {
              const response = await axios.post(
                self.$apiURL + "/admin/products/destroy",
                formData,
                {
                  headers: self.$headers
                }
              )
  
              if (response.data.status == "success") {
                self.products = self.products.filter(p => p._id !== form._id.value)
                swal.fire("Success", response.data.message, "success")
              } else {
                swal.fire("Error", response.data.message, "error")
              }
            }
          })
      },
  
      loadMore: async function () {
        this.$refs.btnLoadMore.setAttribute("disabled", "disabled")
        this.page++
        this.getData()
      },
  
      getData: async function () {
        const formData = new FormData()
        formData.append("page", this.page)
  
        const response = await axios.post(
          this.$apiURL + "/admin/products/fetch",
          formData,
          {
            headers: this.$headers
          }
        )
  
        this.$refs.btnLoadMore.removeAttribute("disabled")
  
        if (response.data.status == "success") {
          if (response.data.products.length > 0) {
            this.products.push(...response.data.products)
          }
        } else {
          swal.fire("Error", response.data.message, "error")
        }
      }
    },
  
    mounted() {
      this.getData()
    }
  }
  </script>
  
  <style scoped>
  #products-table th,
  #products-table td {
    padding: 12px 16px;
    vertical-align: middle;
  }
  
  .card {
    border-radius: 1rem;
  }
  
  .card-header h4 {
    margin-bottom: 0;
  }
  </style>
  