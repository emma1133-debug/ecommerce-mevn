<template>
    <!-- End Navbar -->
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h4 class="font-weight-bolder">Add product</h4>
            </div>
  
            <div class="card-body">
              <form v-on:submit.prevent="addProduct" enctype="multipart/form-data">
                <!--  Name -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Name</label>
                  <input type="text" class="form-control" name="name" autocomplete="off" required />
                </div>
  
                <!-- Description -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Description</label>
                  <textarea name="description" class="form-control" style="margin-top: 50px;" required></textarea>
                </div>
  
                <!-- Price -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Price ($)</label>
                  <input type="number" min="0" autocomplete="off" name="price" class="form-control" required />
                </div>
  
                <!-- Stock -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Items in stock (0 means unlimited, for digital products)</label>
                  <input type="number" min="0" name="itemsInStock" autocomplete="off" class="form-control" required />
                </div>
  
                <!-- Category -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Category</label>
                  <select v-model="category" class="form-control" required> <!-- 👈 KHÔNG có name -->
                    <option disabled value="">-- Select Category --</option>
                    <option>Monster High</option>
                    <option>Hey Bestie</option>
                    <option>Barbie</option>
                    <option>Sylvanian Families</option>
                    <option>Disney </option>
                    
                  </select>
                </div>
  
                <!-- Upload Images -->
                <div class="input-group input-group-outline mb-3">
                  <label class="form-label no-left-margin">Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    name="images"
                    class="form-control"
                    v-on:change="previewImages"
                    ref="images"
                    required
                  />
                </div>
  
                <!-- Image Preview -->
                <div v-for="(image, index) in images" class="row" style="margin-top: 20px;">
                  <div class="col-md-8">
                    <img :src="image.src" style="width: 100%;" />
                  </div>
                </div>
  
                <!-- Submit -->
                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-lg bg-gradient-primary btn-lg w-100 mt-4 mb-0"
                    ref="btnAddProduct"
                  >
                    Add product
                  </button>
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
        images: [],
        category: ""
      }
    },
  
    methods: {
      previewImages() {
        const files = this.$refs["images"].files
        this.images = []
  
        for (let i = 0; i < files.length; i++) {
          const fileReader = new FileReader()
          fileReader.onload = (e) => {
            this.images.push({
              src: e.target.result,
              size: files[i].size
            })
          }
          fileReader.readAsDataURL(files[i])
        }
      },
  
      addProduct: async function () {
        const form = event.target
        const formData = new FormData(form)
  
        // 💣 Nếu thiếu dòng này => category không có trong req.fields
        formData.append("category", this.category)
  
        console.log("📦 category sending:", this.category)
  
        this.$refs["btnAddProduct"].setAttribute("disabled", "disabled")
  
        const response = await axios.post(
          this.$apiURL + "/admin/products/add",
          formData,
          {
            headers: {
              Authorization: this.$headers["Authorization"] // 👈 KHÔNG truyền Content-Type
            }
          }
        )
  
        this.$refs["btnAddProduct"].removeAttribute("disabled")
  
        if (response.data.status === "success") {
          form.reset()
          this.category = ""
          this.images = []
        }
  
        swal.fire("Add product", response.data.message, response.data.status)
      }
    }
  }
  </script>
  
  <style>
  .no-left-margin::before {
    width: auto !important;
  }
  </style>
  