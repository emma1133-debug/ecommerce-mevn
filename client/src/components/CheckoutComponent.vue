<template>
	<div class="section no-pad-bot" id="index-banner">
	  <div class="container">
		<div class="row">
		  <div class="col m8">
			<h1 class="checkout-title">🌸 Checkout</h1>
		  </div>
		</div>
  
		<div class="row">
		  <div class="col m8">
			<div class="card">
			  <div class="card-body">
				<p v-if="cartEmpty" style="padding: 20px;">The cart is empty.</p>
				<form v-else @submit.prevent="cashOnDelivery">
				  <div class="row">
					<div class="input-field col m6">
					  <input id="name" name="name" type="text" v-model="name" />
					  <label for="name">Name</label>
					</div>
					<div class="input-field col m6">
					  <input id="email" name="email" type="email" v-model="email" />
					  <label for="email">E-mail</label>
					</div>
					<div class="input-field col m6">
					  <input id="mobile" name="mobile" type="text" v-model="mobile" />
					  <label for="mobile">Mobile</label>
					</div>
					<div class="input-field col m6">
					  <input id="country" name="country" type="text" v-model="country" />
					  <label for="country">Country</label>
					</div>
					<div class="input-field col m12">
					  <textarea id="address" name="address" class="materialize-textarea" v-model="address"></textarea>
					  <label for="address">Address</label>
					</div>
				  </div>
  
				  <!-- Error List -->
				  <ul class="pink-text" v-if="validationErrors.length">
					<li v-for="(err, i) in validationErrors" :key="i">❗ {{ err }}</li>
				  </ul>
				</form>
			  </div>
			</div>
		  </div>
  
		  <div class="col m4">
			<div class="card" style="padding: 20px;">
			  <div class="card-body">
				<div class="table-responsive">
				  <table class="table align-items-center justify-content-center mb-0" id="products-table">
					<thead>
					  <tr>
						<th>Item</th>
						<th>Details</th>
						<th>Total</th>
					  </tr>
					</thead>
					<tbody>
					  <tr v-for="product in products" :key="product._id">
						<td>{{ product.name }}</td>
						<td>{{ '$' + product.price + ' x ' + product.units }}</td>
						<td>{{ '$' + (product.price * product.units) }}</td>
					  </tr>
					</tbody>
					<tfoot>
					  <tr>
						<td colspan="3" style="text-align: right;">
						  <div style="margin-right: 20px;">
							<b>Total: </b>
							$<span>{{ total }}</span>
						  </div>
						</td>
					  </tr>
					</tfoot>
				  </table>
				</div>
			  </div>
			  <div class="card-footer" v-if="!cartEmpty">
				<div class="row">
				  <div class="col s12 center-align">
					<button type="submit" class="btn" @click="cashOnDelivery" :disabled="paymentLoading">
					  Order now
					</button>
				  </div>
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
  import store from "../vuex/store"
  
  export default {
	data() {
	  return {
		products: [],
		total: 0,
		name: "",
		email: "",
		mobile: "",
		country: "",
		address: "",
		paymentStatus: "",
		paymentLoading: false,
		validationErrors: []
	  }
	},
	computed: {
	  cartEmpty() {
		return this.products.length === 0
	  }
	},
	methods: {
	  formatPrice(val) {
		return Number(val).toLocaleString(undefined, {
		  minimumFractionDigits: 2,
		  maximumFractionDigits: 2
		})
	  },
	  validateForm() {
		this.validationErrors = []
  
		if (!this.name) this.validationErrors.push("Name is required.")
		if (!this.email) this.validationErrors.push("Email is required.")
		if (!this.mobile) this.validationErrors.push("Mobile number is required.")
		if (!this.country) this.validationErrors.push("Country is required.")
		if (!this.address) this.validationErrors.push("Address is required.")
  
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (this.email && !emailPattern.test(this.email))
		  this.validationErrors.push("Invalid email format.")
  
		const phonePattern = /^[0-9]{6,15}$/
		if (this.mobile && !phonePattern.test(this.mobile))
		  this.validationErrors.push("Mobile must be 6–15 digits.")
  
		return this.validationErrors.length === 0
	  },
	  async cashOnDelivery() {
		if (!this.validateForm()) return
  
		this.paymentLoading = true
		try {
		  const res = await axios.post(this.$apiURL + "/cashOnDelivery", {
			products: JSON.stringify(this.products), // 👈 phải stringify để backend parse
			total: this.total,
			name: this.name,
			email: this.email,
			mobile: this.mobile,
			country: this.country,
			address: this.address
})	

  
		  if (res.data.status === "success") {
			M.toast({ html: "🎉 Order placed successfully!" })
			document.cookie = "products=; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
			store.commit("setCartCounter", 0)
			this.$router.push("/")
		  } else {
			M.toast({ html: "❌ Failed to place order. Try again later." })
		  }
		} catch (err) {
		  console.error(err)
		  M.toast({ html: "🚨 Something went wrong!" })
		} finally {
		  this.paymentLoading = false
		}
	  }
	},
	mounted() {
	  const cookieParts = document.cookie.split("; ")
	  this.total = 0
	  for (let a = 0; a < cookieParts.length; a++) {
		const keyValue = cookieParts[a].split("=")
		if (keyValue[0] === "products") {
		  try {
			const products = JSON.parse(decodeURIComponent(keyValue[1]))
			this.products = products
			for (let p of products) {
			  this.total += (p.units * p.price)
			}
		  } catch (e) {
			console.error("Invalid cookie format", e)
		  }
		  break
		}
	  }
	}
  }
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');
  
  * {
	font-family: 'Quicksand', sans-serif;
  }
  
  .checkout-title {
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
  .checkout-title::before,
  .checkout-title::after {
	content: '✨';
	position: absolute;
	font-size: 1.8rem;
	animation: sparkleMove 2s infinite ease-in-out alternate;
  }
  .checkout-title::before { top: 0; left: -35px; }
  .checkout-title::after { bottom: 0; right: -35px; }
  
  @keyframes ultraShine {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
  }
  
  @keyframes sparkleMove {
	0% { transform: translateY(0) rotate(0deg); opacity: 1; }
	50% { transform: translateY(-5px) rotate(10deg); opacity: 0.9; }
	100% { transform: translateY(0) rotate(0deg); opacity: 1; }
  }
  
  .card {
	border-radius: 14px;
	box-shadow: 0 8px 20px rgba(255, 192, 203, 0.2);
	background: #fffafd;
  }
  .card-body {
	padding: 24px 30px;
  }
  .card-footer {
	background: #fff0f8;
	border-top: 1px solid #ffe4ef;
	border-radius: 0 0 14px 14px;
	padding: 20px;
  }
  
  .input-field input,
  .input-field textarea {
	border: 1px solid #ffcfe6 !important;
	background: #fff;
	border-radius: 8px;
	padding-left: 12px;
  }
  .input-field input:focus,
  .input-field textarea:focus {
	border-color: #ff69b4 !important;
	box-shadow: 0 0 0 2px #ffdce9;
  }
  .input-field label {
	color: #d63384 !important;
	font-weight: 500;
  }
  .input-field.col label {
	left: 1rem;
  }
  
  .btn {
	background: linear-gradient(45deg, #d63384, #ff69b4);
	color: white;
	border-radius: 8px;
	font-weight: 600;
	padding: 10px 20px;
	box-shadow: 0 0 10px #ffd6ea, 0 0 20px #ff69b4;
	transition: all 0.3s ease;
	display: inline-flex;
	align-items: center;
	justify-content: center;
  }
  .btn:hover {
	background: linear-gradient(45deg, #b91e66, #ff1493);
	transform: scale(1.05);
	box-shadow: 0 0 15px #ffadd8, 0 0 25px #ff69b4;
  }
  
  .table th {
	background-color: #ffe3f1;
	color: #d63384;
	font-size: 0.95rem;
	padding: 12px;
	font-weight: 600;
  }
  .table td {
	font-size: 0.92rem;
	padding: 12px 14px;
	border-bottom: 1px solid #fbe3ef;
  }
  tfoot td {
	font-weight: bold;
	font-size: 1rem;
	color: #d63384;
  }
  </style>
  