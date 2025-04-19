<template>
	<div class="section no-pad-bot" id="index-banner">
	  <div class="container">
		<div class="sparkle-title">
		  <span class="sparkle-text">🌸 Your Cart</span>
		  <span class="sparkle sparkle-1">✨</span>
		  <span class="sparkle sparkle-2">✨</span>
		</div>
  
		<div v-if="products.length === 0" class="empty-cart center-align">
		  <p>Your cart is empty 😢</p>
		</div>
  
		<div v-else class="card">
		  <div class="cart-table">
			<table>
			  <thead>
				<tr>
				  <th>Image</th>
				  <th>Name</th>
				  <th>Price</th>
				  <th>Qty</th>
				  <th>Total</th>
				  <th></th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="(product, index) in products" :key="product._id">
				  <td>
					<img
					  v-if="product.images && product.images[0]"
					  :src="$apiURL + '/' + product.images[0]"
					  class="cart-img"
					/>
					<span v-else>—</span>
				  </td>
				  <td>{{ product.name }}</td>
				  <td>${{ formatPrice(product.price) }}</td>
				  <td>
					<div class="qty-control">
					  <button @click="decreaseQty(product)">−</button>
					  <span>{{ product.units }}</span>
					  <button @click="increaseQty(product)">+</button>
					</div>
				  </td>
				  <td>${{ formatPrice(product.price * product.units) }}</td>
				  <td>
					<button class="btn red lighten-1 btn-small" @click="removeItem(product._id)">
					  Remove
					</button>
				  </td>
				</tr>
			  </tbody>
			  <tfoot>
				<tr>
				  <td colspan="4" class="right-align"><strong>Total:</strong></td>
				  <td><strong>${{ formatPrice(total) }}</strong></td>
				  <td></td>
				</tr>
			  </tfoot>
			</table>
		  </div>
		  <div class="cart-footer center-align">
			<router-link to="/checkout" class="btn sparkle-btn">✨ Proceed to Checkout</router-link>
		  </div>
		</div>
	  </div>
	</div>
  </template>
  
  <script>
  import store from "../vuex/store"
  
  export default {
	data() {
	  return {
		products: []
	  }
	},
	computed: {
	  total() {
		return this.products.reduce((sum, item) => sum + item.price * item.units, 0)
	  }
	},
	methods: {
	  formatPrice(value) {
		return Number(value).toFixed(2)
	  },
	  getCartFromCookie() {
		const parts = document.cookie.split("; ")
		for (const part of parts) {
		  const [key, val] = part.split("=")
		  if (key === "products") {
			try {
			  return JSON.parse(decodeURIComponent(val))
			} catch (e) {
			  console.warn("❌ Failed to parse cart cookie:", e)
			  return []
			}
		  }
		}
		return []
	  },
	  updateCart(products) {
		this.products = products
		document.cookie = "products=" + encodeURIComponent(JSON.stringify(products))
		const totalUnits = products.reduce((sum, p) => sum + p.units, 0)
		store.commit("setCartCounter", totalUnits)
	  },
	  increaseQty(product) {
		const index = this.products.findIndex(p => p._id === product._id)
		if (index !== -1) {
		  this.products[index].units++
		  this.updateCart(this.products)
		}
	  },
	  decreaseQty(product) {
		const index = this.products.findIndex(p => p._id === product._id)
		if (index !== -1) {
		  if (this.products[index].units <= 1) {
			this.products.splice(index, 1)
		  } else {
			this.products[index].units--
		  }
		  this.updateCart(this.products)
		}
	  },
	  removeItem(id) {
		this.products = this.products.filter(p => p._id !== id)
		this.updateCart(this.products)
	  }
	},
	mounted() {
	  const cart = this.getCartFromCookie()
	  this.updateCart(cart)
	}
  }
  </script>
 
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');
  
  * {
	font-family: 'Quicksand', sans-serif;
  }
  
  .sparkle-title {
	position: relative;
	text-align: center;
	margin-top: 50px;
	margin-bottom: 30px;
  }
  .sparkle-text {
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
  @keyframes titleGlow {
	0% { text-shadow: 0 0 5px #fff, 0 0 10px #ffcce6, 0 0 20px #ff69b4; }
	50% { text-shadow: 0 0 10px #fff, 0 0 20px #ff69b4, 0 0 40px #ff1493; }
	100% { text-shadow: 0 0 5px #fff, 0 0 10px #ffcce6, 0 0 20px #ff69b4; }
  }
  
  .sparkle {
	position: absolute;
	font-size: 1.5rem;
	color: #ffccf2;
	animation: sparkleFloat 2s infinite ease-in-out;
  }
  .sparkle-1 {
	top: -10px;
	left: 120px;
	animation-delay: 0s;
  }
  .sparkle-2 {
	top: -10px;
	right: 120px;
	animation-delay: 1s;
  }
  @keyframes sparkleFloat {
	0% { transform: translateY(0) rotate(0deg); opacity: 1; }
	50% { transform: translateY(-8px) rotate(15deg); opacity: 0.8; }
	100% { transform: translateY(0) rotate(0deg); opacity: 1; }
  }
  
  .cart-table table {
	width: 100%;
	border-collapse: collapse;
  }
  .cart-table th,
  .cart-table td {
	padding: 12px;
	text-align: center;
	border-bottom: 1px solid #fce4ec;
  }
  .cart-table th {
	color: #d63384;
	font-weight: bold;
  }
  .cart-table tbody tr:hover {
	background-color: #fff6fb;
	box-shadow: 0 0 6px #ffddee;
  }
  
  .cart-img {
	width: 60px;
	height: 60px;
	object-fit: contain;
	border-radius: 6px;
	background: #fdf3f8;
	padding: 4px;
  }
  
  .qty-control {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
  }
  .qty-control button {
	background: #fff0f7;
	border: 1px solid #ffcce6;
	color: #d63384;
	font-size: 1rem;
	width: 30px;
	height: 30px;
	border-radius: 6px;
	cursor: pointer;
	font-weight: bold;
	box-shadow: 0 0 5px #ffb3d9;
	transition: all 0.2s ease;
  }
  .qty-control button:hover {
	background-color: #ffcce6;
	transform: scale(1.1);
  }
  
  .cart-footer {
	padding: 30px 0;
	text-align: center;
  }
  .sparkle-btn {
	background: linear-gradient(45deg, #d63384, #ff69b4);
	color: white;
	border-radius: 8px;
	font-weight: 600;
	box-shadow: 0 0 10px #ffd6ea, 0 0 20px #ff69b4;
	transition: all 0.3s ease;
  }
  .sparkle-btn:hover {
	transform: scale(1.05);
	box-shadow: 0 0 15px #ffadd8, 0 0 25px #ff69b4;
  }
  
  .empty-cart {
	font-size: 1.2rem;
	margin: 80px 0;
  }
  </style>
  