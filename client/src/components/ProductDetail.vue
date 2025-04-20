<template>
	<div class="product-detail-wrapper" v-if="product">
	  <div class="container">
		<div class="row product-detail">
		  <!-- 🖼 Product Images -->
		  <div class="col m6 product-image-box">
			<img
			  v-for="(image, index) in product.images"
			  :key="index"
			  :src="`${$apiURL}/${image}`"
			  class="main-image"
			  alt="Product image"
			/>
		  </div>
  
		  <!-- 🧾 Product Information -->
		  <div class="col m6 product-info">
			<h1 class="product-title">{{ product.name }}</h1>
  
			<div class="product-price-wrapper">
			  <span class="discounted-price">${{ product.price.toFixed(2) }}</span>
			  <span class="original-price">${{ (product.price * 1.2).toFixed(2) }}</span>
			  <span class="sale-badge">-20%</span>
			</div>
  
			<div class="voucher-box">
			  <span class="voucher-tag">🔥 5% Off</span>
			  <span class="voucher-tag">✨ 10% Off</span>
			  <span class="voucher-tag">💖 Free Shipping</span>
			</div>
  
			<!-- 📝 Product Description -->
			<div v-if="product.description" class="product-description">
			  <p :class="{ 'clamped': !showFullDesc }">{{ product.description }}</p>
			  <button class="toggle-btn" @click="showFullDesc = !showFullDesc">
				{{ showFullDesc ? 'Show Less' : 'Show More' }}
			  </button>
			</div>
  
			<p class="delivery-info">
			  🚚 Estimated Delivery: April 28 - April 30 &nbsp;
			  <small class="note">Free shipping on orders over $30</small>
			</p>
  
			<p class="stock-line">Available stock: <strong>{{ product.itemsInStock }}</strong></p>
  
			<!-- 🔢 Quantity Controls -->
			<div class="quantity-box">
			  <button class="qty-btn" @click="decreaseQty">−</button>
			  <span class="qty-display">{{ qty }}</span>
			  <button class="qty-btn" @click="increaseQty">+</button>
			</div>
  
			<!-- 🛍️ Action Buttons -->
			<div class="product-action-buttons">
			  <button class="btn-cart" @click="addToCart">🛒 Add to Cart</button>
			  <button class="btn-buy">
				Check Out <br />
				<strong>${{ totalPrice }}</strong>
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
  import store from "../vuex/store"
  
  export default {
	data() {
	  return {
		_id: this.$route.params._id,
		product: null,
		isInCart: false,
		qty: 1,
		showFullDesc: false
	  }
	},
	computed: {
	  totalPrice() {
		if (!this.product) return "0.00"
		return (this.product.price * this.qty).toFixed(2)
	  }
	},
	methods: {
	  increaseQty() {
		if (this.qty < this.product.itemsInStock) this.qty++
	  },
	  decreaseQty() {
		if (this.qty > 1) this.qty--
	  },
	  addToCart() {
		if (!this.product) return
		let products = []
		const cookieParts = document.cookie.split("; ")
		for (let part of cookieParts) {
		  const [key, val] = part.split("=")
		  if (key === "products") {
			try {
			  products = JSON.parse(decodeURIComponent(val))
			} catch {
			  products = []
			}
		  }
		}
  
		const index = products.findIndex(p => p._id === this._id)
		if (index !== -1) {
		  products[index].units += this.qty
		} else {
		  products.push({
			_id: this._id,
			name: this.product.name,
			price: this.product.price,
			units: this.qty
		  })
		}
  
		document.cookie = "products=" + encodeURIComponent(JSON.stringify(products))
		const totalUnits = products.reduce((sum, p) => sum + p.units, 0)
		store.commit("setCartCounter", totalUnits)
  
		this.isInCart = true
		swal.fire("Added to cart", `You added ${this.qty} item(s)`, "success")
	  },
	  async getData() {
		const formData = new FormData()
		formData.append("_id", this._id)
		const res = await axios.post(this.$apiURL + "/products/fetchSingle", formData)
		if (res.data.status === "success") {
		  this.product = res.data.product
		} else {
		  swal.fire("Error", res.data.message, "error")
		}
	  },
	  syncQtyFromCart() {
		const cookieParts = document.cookie.split("; ")
		for (let part of cookieParts) {
		  const [key, val] = part.split("=")
		  if (key === "products") {
			try {
			  const products = JSON.parse(decodeURIComponent(val))
			  const found = products.find(p => p._id === this._id)
			  if (found) this.qty = found.units
			} catch {}
		  }
		}
	  }
	},
	mounted() {
	  this.getData()
	  this.syncQtyFromCart()
	}
  }
  </script>
  
  <style scoped>
  .product-detail-wrapper {
	background: #fff;
	padding: 50px 20px;
	border-radius: 12px;
  }
  
  .product-detail {
	display: flex;
	flex-wrap: wrap;
	gap: 40px;
	align-items: flex-start;
  }
  
  .product-image-box {
	width: 100%;
	background: #fff0f5;
	padding: 16px;
	border-radius: 16px;
	box-shadow: 0 4px 12px rgba(255, 182, 193, 0.15);
  }
  
  .main-image {
	width: 100%;
	border-radius: 12px;
	object-fit: contain;
	border: 2px dashed #ffc2d9;
	background: #fff;
  }
  
  .product-info {
	flex: 1;
	background: #fff;
	padding: 20px;
	border-radius: 12px;
	box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  }
  
  .product-title {
	font-size: 1.8rem;
	font-weight: 700;
	color: #d63384;
	margin-bottom: 12px;
  }
  
  .product-price-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;
  }
  
  .discounted-price {
	font-size: 1.6rem;
	color: #e6005c;
	font-weight: bold;
  }
  
  .original-price {
	font-size: 1rem;
	color: #aaa;
	text-decoration: line-through;
  }
  
  .sale-badge {
	background: #ffdadf;
	color: #d63384;
	font-size: 0.75rem;
	padding: 3px 8px;
	border-radius: 6px;
	font-weight: 600;
  }
  
  .voucher-box {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
	margin-bottom: 16px;
  }
  
  .voucher-tag {
	background: #fff4f7;
	color: #d63384;
	border: 1px dashed #ffaec9;
	border-radius: 6px;
	padding: 5px 10px;
	font-size: 0.8rem;
	font-weight: 600;
  }
  
  /* ✅ Product Description */
  .product-description {
	margin-top: 16px;
	font-size: 0.95rem;
	color: #555;
	line-height: 1.6;
	background: #fff7fb;
	padding: 12px 16px;
	border-left: 4px solid #ffaad4;
	border-radius: 8px;
  }
  
  .product-description .clamped {
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
  }
  
  .toggle-btn {
	background: none;
	border: none;
	color: #d63384;
	font-weight: 600;
	cursor: pointer;
	padding-top: 8px;
	font-size: 0.85rem;
	text-decoration: underline;
  }
  .toggle-btn:hover {
	color: #b3266e;
  }
  
  .delivery-info {
	margin: 14px 0;
	font-size: 0.95rem;
	color: #444;
  }
  
  .note {
	font-size: 0.8rem;
	color: #888;
  }
  
  .stock-line {
	font-size: 0.95rem;
	margin-bottom: 14px;
  }
  
  .quantity-box {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 20px;
  }
  
  .qty-btn {
	padding: 6px 12px;
	border: none;
	background: #ffe4f0;
	border-radius: 8px;
	color: #d63384;
	font-weight: bold;
	font-size: 1.1rem;
	transition: 0.2s ease;
  }
  .qty-btn:hover {
	background-color: #ffcce0;
  }
  
  .qty-display {
	font-weight: bold;
	font-size: 1.1rem;
	min-width: 30px;
	text-align: center;
	color: #d63384;
  }
  
  .product-action-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
  }
  
  .btn-cart {
	flex: 1;
	background: #fff0f5;
	color: #d63384;
	border: 1px solid #ffb6c1;
	padding: 12px;
	border-radius: 10px;
	font-weight: 600;
	transition: all 0.3s ease;
  }
  .btn-cart:hover {
	background: #ffdce9;
  }
  
  .btn-buy {
	flex: 1;
	background: #d63384;
	color: #fff;
	border: none;
	padding: 12px;
	border-radius: 10px;
	font-weight: 600;
	text-align: center;
	transition: all 0.3s ease;
  }
  .btn-buy:hover {
	background: #b3266e;
  }
  </style>
  