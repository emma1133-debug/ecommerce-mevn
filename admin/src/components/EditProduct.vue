<template>
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h4 class="font-weight-bolder">Edit product</h4>
            </div>
  
            <div class="card-body">
              <form v-on:submit.prevent="editProduct($event)" enctype="multipart/form-data" v-if="product != null">
                <!-- 📝 Name -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Name</label>
                  <input type="text" class="form-control" autocomplete="off" name="name" :value="product.name" required />
                </div>
  
                <!-- 📝 Description -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Description</label>
                  <textarea name="description" style="margin-top: 40px;" class="form-control" required>{{ product.description }}</textarea>
                </div>
  
                <!-- 💵 Price -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Price ($)</label>
                  <input type="number" min="0" name="price" autocomplete="off" class="form-control" :value="product.price" required />
                </div>
  
                <!-- 📦 Items in Stock -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Items in stock</label>
                  <input type="number" min="0" autocomplete="off" name="itemsInStock" class="form-control" :value="product.itemsInStock || 0" required />
                </div>
  
                <!-- 🆕 Category -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Category</label>
                  <select name="category" v-model="category" class="form-control" required>
                    <option disabled value="">-- Select Category --</option>
                    <option>Barbie</option>
                    <option>Monster High</option>
                    <option>Sylvanian Families</option>
                    <option>Hey Bestie</option>
                    <option>Disney</option>
                  </select>
                </div>
  
                <!-- 🖼️ Upload Images -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Upload New Images</label>
                  <input type="file" multiple accept="image/*" name="images" class="form-control" />
                </div>
  
                <!-- 🖼️ Preview Old Images -->
                <div v-if="product.images && product.images.length > 0">
                  <img
                    v-for="(image, index) in product.images"
                    :key="index"
                    :src="$apiURL + '/' + image"
                    style="width: 150px; margin: 10px; border-radius: 8px; border: 1px solid #eee;"
                  />
                </div>
  
                <!-- ✅ Submit Button -->
                <div class="text-center">
                  <button type="submit" class="btn btn-lg bg-gradient-primary btn-lg w-100 mt-4 mb-0">Edit product</button>
                </div>
              </form>
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
        _id: this.$route.params._id,
        product: null,
        category: "", // bind with select
        categories: [] // (for dynamic config if needed)
      }
    },
  
    methods: {
      getData: async function () {
        const formData = new FormData()
        formData.append("_id", this._id)
  
        const response = await axios.post(this.$apiURL + "/admin/products/fetchSingle", formData, {
          headers: this.$headers
        })
  
        if (response.data.status === "success") {
          this.product = response.data.product
          this.category = this.product.category || ""
        } else {
          swal.fire("Error", response.data.message, "error")
        }
  
        // Optional: Fetch dynamic categories (if used)
        const res = await axios.post(this.$apiURL + "/getConfigurations", null)
        if (res.data.status === "success") {
          this.categories = res.data.configurations.categories || []
        }
      },
  
      editProduct: async function (event) {
        const form = event.target
        const formData = new FormData(form)
        formData.append("_id", this._id)
        formData.append("category", this.category)
  
        const response = await axios.post(this.$apiURL + "/admin/products/update", formData, {
          headers: this.$headers
        })
  
        swal.fire("Edit product", response.data.message, response.data.status)
      }
    },
  
    mounted() {
      this.getData()
    }
  }
  </script>
  
  <style>
  .no-left-margin::before {
    width: auto !important;
  }
  </style>
  