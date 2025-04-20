<template>
  <div class="container">

    <!-- 🌸 Carousel Banner -->
    <Carousel
      :autoplay="3000"
      :autoplayTimeout="80000"
      :transition="8000"
      :wrapAround="true"
      :pauseAutoplayOnHover="true"
      :mouseDrag="false"
      :touchDrag="true"
      :snapAlign="'center'"
    >
      <Slide v-for="(banner, i) in heroBanners" :key="i">
        <img :src="banner" class="hero-img" />
      </Slide>
    </Carousel>

    <!-- 🎀 Category Highlights -->
    <div class="category-highlights">
      <div
        class="category-box"
        v-for="(promo, i) in promoBanners"
        :key="i"
        @click="onclickCategory(promoTitles[i])"
      >
        <img :src="promo" class="category-img" />
        <p class="category-label"><u>{{ promoTitles[i] }}</u></p>
      </div>
    </div>

    <!-- ✨ Boutique Title -->
    <div class="sparkle-wrapper">
      <h1 class="page-title sparkle-text">🛍 Emma Channe's Boutique</h1>
      <span class="sparkle sparkle-1"></span>
      <span class="sparkle sparkle-2"></span>
      <span class="sparkle sparkle-3"></span>
      <span class="sparkle sparkle-4"></span>
    </div>

    <!-- 🔽 Sort Sidebar + Product Grid -->
    <div v-if="isShowingAllProducts" class="filter-sort-row">
      <div class="filter-sidebar">
        <h6 class="filter-title">Sort by</h6>
        <ul class="sort-options">
          <li>
            <label>
              <input type="radio" value="newestToOldest" v-model="sortBy" @change="onchangeSortBy" />
              <span>Newest to oldest</span>
            </label>
          </li>
          <li>
            <label>
              <input type="radio" value="oldestToNewest" v-model="sortBy" @change="onchangeSortBy" />
              <span>Oldest to newest</span>
            </label>
          </li>
          <li>
            <label>
              <input type="radio" value="priceDescending" v-model="sortBy" @change="onchangeSortBy" />
              <span>Price (high to low)</span>
            </label>
          </li>
          <li>
            <label>
              <input type="radio" value="priceAscending" v-model="sortBy" @change="onchangeSortBy" />
              <span>Price (low to high)</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="product-grid-wrapper">
        <div class="product-grid">
          <div class="card product-card hoverable" v-for="product in products" :key="product._id">
            <div class="card-image zoom-img" @click="goToProduct(product._id)">
              <img :src="$apiURL + '/' + product.images[0]" :id="'product-img-' + product._id" class="product-image" />
              <span class="badge sale-badge" v-if="product.itemsInStock <= 5">Low Stock</span>
            </div>
            <div class="card-content">
              <div class="card-title">{{ product.name }}</div>
              <div class="pink-text">${{ formatPrice(product.price) }}</div>
            </div>
            <div class="card-action">
              <div v-if="getAddedCount(product._id) === 0">
                <button class="mini-cart-btn" @click.stop="addToCart(product, $event)">Add to Cart</button>
              </div>
              <div v-else class="quantity-controls" @click.stop>
                <button class="qty-btn" @click="decreaseQty(product)">−</button>
                <span class="qty-text">{{ getAddedCount(product._id) }}</span>
                <button class="qty-btn" @click="increaseQty(product)">+</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 🧁 Horizontal Sliders -->
    <div v-if="!isShowingAllProducts" v-for="(section, idx) in sliderSections" :key="idx">
      <div class="section-logo">
        <img :src="section.logo" alt="Section Logo" style="height: 80px; margin: 30px auto; display: block" />
      </div>
      <div class="slider-container">
        <div class="horizontal-scroll-wrapper">
          <button class="scroll-btn left" @click="scrollLeft(idx)">‹</button>
          <div class="scroll-track" :ref="'sliderTrack' + idx">
            <div class="scroll-item" v-for="product in products" :key="product._id + idx">
              <div class="card product-card hoverable">
                <div class="card-image zoom-img" @click="goToProduct(product._id)">
                  <img :src="$apiURL + '/' + product.images[0]" :id="'slider-img-' + product._id" class="product-image" />
                  <span class="badge sale-badge" v-if="product.itemsInStock <= 5">Low Stock</span>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ product.name }}</div>
                  <div class="pink-text">${{ formatPrice(product.price) }}</div>
                </div>
                <div class="card-action">
                  <div v-if="getAddedCount(product._id) === 0">
                    <button class="mini-cart-btn" @click.stop="addToCart(product, $event)">Add to Cart</button>
                  </div>
                  <div v-else class="quantity-controls" @click.stop>
                    <button class="qty-btn" @click="decreaseQty(product)">−</button>
                    <span class="qty-text">{{ getAddedCount(product._id) }}</span>
                    <button class="qty-btn" @click="increaseQty(product)">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button class="scroll-btn right" @click="scrollRight(idx)">›</button>
        </div>
      </div>
      <hr class="horizontal-line" />
    </div>

    <!-- 🛒 Cart Position Target -->
    <div id="cart-icon" style="position: fixed; top: 20px; right: 40px; z-index: 9999;"></div>

    <!-- ✨ Show More Button -->
    <div class="show-more-wrapper" v-if="!isShowingAllProducts">
      <button class="show-more-btn" @click="isShowingAllProducts = true">✨ Show All Products</button>
    </div>

    <!-- 👈 Chỉ hiện khi đang ở chế độ xem all -->
    <!-- 👇 Hiện khi đang ở chế độ xem all -->
    <div v-if="isShowingAllProducts" class="back-pagination-wrapper">
      <button class="show-more-btn" @click="goBackHome">← Back to Home</button>

      <div class="pagination-wrapper" v-if="totalPages > 1">
        <ul class="pagination">
          <li @click="goToPage(page - 1)" :class="{ disabled: page === 1 }">‹</li>
          <li
            v-for="i in visiblePages"
            :key="i"
            @click="i !== '...' && goToPage(i)"
            :class="{ active: page === i, ellipsis: i === '...' }"
          >
            {{ i }}
          </li>
          <li @click="goToPage(page + 1)" :class="{ disabled: page === totalPages }">›</li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios"
import store from "../vuex/store"
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide } from 'vue3-carousel'

export default {
  components: { Carousel, Slide },
  data() {
    return {
      page: 1,
      totalPages: 1, // ✅ Thêm phân trang
      products: [],
      sortBy: "",
      categories: [],
      category: "",
      cartMap: {},
      isShowingAllProducts: false,

      heroBanners: [
        "https://new-cdn.mamamia.com.au/mamamia-pwa.appspot.com/cms_images/variations/1200x800-531713588395.jpg",
        "https://i0.wp.com/www.thewrap.com/wp-content/uploads/2023/06/062923-Barbie-Artwork-V1.jpg?w=1200&quality=89&ssl=1",
        "https://cdn.logojoy.com/wp-content/uploads/20230717163512/Barbie-logo-header-image.jpg"
      ],
      promoBanners: [
        "https://static.wixstatic.com/media/14399c_29dff8d97def44fc978b73a78a086a23~mv2.webp",
        "https://static.wixstatic.com/media/14399c_04730f20185b4b10bccdf0b96fdfcd57~mv2.webp",
        "https://static.wixstatic.com/media/14399c_27ccba1236574bb29502af706b39e798~mv2.jpg"
      ],
      promoTitles: ["Disney", "Barbie", "Sylvanian Families"],

      sliderSections: [
        {
          logo: "https://static.wixstatic.com/media/14399c_0cf501ab23f84ccebb664a7d74a764d4~mv2.png/v1/fill/w_352,h_78,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/hhl.png"
        },
        {
          logo: "https://static.wixstatic.com/media/14399c_936fcc38875d40ab81db919ee7944b60~mv2.png/v1/fill/w_203,h_101,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/bestie.png"
        },
        {
          logo: "https://static.wixstatic.com/media/14399c_262d3bbef0034f9babc9ad2053c685c6~mv2.png/v1/fill/w_203,h_101,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/barbie%20logo.png"
        }
      ]
    }
  },
  computed: {
    search() {
      return store.getters.getSearch
    }, 
    visiblePages() {
      const pages = []

      if (this.totalPages <= 7) {
        for (let i = 1; i <= this.totalPages; i++) pages.push(i)
      } else {
        pages.push(1)

        if (this.page > 3) pages.push("left-ellipsis")
        for (let i = Math.max(2, this.page - 1); i <= Math.min(this.totalPages - 1, this.page + 1); i++) {
          pages.push(i)
        }
        if (this.page < this.totalPages - 2) pages.push("right-ellipsis")

        pages.push(this.totalPages)
      }

      return pages
    }
  },
  methods: {
    goToProduct(id) {
      this.$router.push(`/product/${id}`)
    },
    formatPrice(val) {
      return Number(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    getCartList() {
      const cookieParts = document.cookie.split("; ")
      for (const part of cookieParts) {
        const [key, value] = part.split("=")
        if (key === "products") {
          try {
            return JSON.parse(decodeURIComponent(value))
          } catch (e) {
            console.warn("❌ Failed to parse products cookie", e)
            return []
          }
        }
      }
      return []
    },
    updateCartCookie(products) {
      document.cookie = "products=" + JSON.stringify(products)
      const totalUnits = products.reduce((sum, p) => sum + p.units, 0)
      store.commit("setCartCounter", totalUnits)
      this.refreshCartMap()
    },
    refreshCartMap() {
      const map = {}
      const list = this.getCartList()
      list.forEach(item => {
        map[item._id] = item.units
      })
      this.cartMap = map
    },
    getAddedCount(id) {
      return this.cartMap[id] || 0
    },
    addToCart(product, event) {
      const list = this.getCartList()
      const found = list.find(p => p._id === product._id)
      if (found) found.units++
      else list.push({ ...product, units: 1 })
      this.updateCartCookie(list)
      M.toast({ html: "Added to cart! 🛒" })

      const img = document.getElementById("product-img-" + product._id) || document.getElementById("slider-img-" + product._id)
      if (!img) return
      const clone = img.cloneNode()
      const cart = document.getElementById("cart-icon")
      const rect = img.getBoundingClientRect()
      clone.style.position = "fixed"
      clone.style.left = rect.left + "px"
      clone.style.top = rect.top + "px"
      clone.style.width = img.offsetWidth + "px"
      clone.style.height = img.offsetHeight + "px"
      clone.style.zIndex = 999
      clone.style.transition = "all 0.9s ease"
      document.body.appendChild(clone)
      setTimeout(() => {
        clone.style.left = cart.offsetLeft + "px"
        clone.style.top = cart.offsetTop + "px"
        clone.style.opacity = "0.2"
        clone.style.transform = "scale(0.1)"
      }, 10)
      setTimeout(() => {
        document.body.removeChild(clone)
      }, 1000)
    },
    increaseQty(product) {
      const list = this.getCartList()
      const found = list.find(p => p._id === product._id)
      if (found) found.units++
      this.updateCartCookie(list)
    },
    decreaseQty(product) {
      const list = this.getCartList()
      const index = list.findIndex(p => p._id === product._id)
      if (index !== -1) {
        if (list[index].units <= 1) list.splice(index, 1)
        else list[index].units--
        this.updateCartCookie(list)
      }
    },
    async getData() {
      const formData = new FormData()
      formData.append("page", this.page)
      formData.append("sortBy", this.sortBy)
      formData.append("category", this.category)
      formData.append("search", this.search)

      const res = await axios.post(this.$apiURL + "/products/fetch", formData)
      if (res.data.status === "success") {
        let productList = res.data.products
        this.totalPages = res.data.totalPages || 1
        if (this.sortBy === "newestToOldest") {
          productList.sort((a, b) => b.createdAt - a.createdAt)
        } else if (this.sortBy === "oldestToNewest") {
          productList.sort((a, b) => a.createdAt - b.createdAt)
        } else if (this.sortBy === "priceAscending") {
          productList.sort((a, b) => a.price - b.price)
        } else if (this.sortBy === "priceDescending") {
          productList.sort((a, b) => b.price - a.price)
        }
        this.products = productList
      }
    },
    async getConfigurations() {
      const res = await axios.post(this.$apiURL + "/getConfigurations", null)
      if (res.data.status === "success") {
        this.categories = res.data.configurations.categories || []
      }
    },
    onchangeSortBy(event) {
      this.sortBy = event.target.value
      this.page = 1
      this.getData()
    },
    onclickCategory(cat) {
      this.category = cat
      this.page = 1
      this.getData()
    },
    scrollLeft(idx) {
      const track = this.$refs["sliderTrack" + idx]
      if (track && track.scrollBy) {
        track.scrollBy({ left: -300, behavior: "smooth" })
      }
    },
    scrollRight(idx) {
      const track = this.$refs["sliderTrack" + idx]
      if (track && track.scrollBy) {
        track.scrollBy({ left: 300, behavior: "smooth" })
      }
    },
    goBackHome() {
    this.isShowingAllProducts = false
    this.sortBy = ""
    this.page = 1
    store.commit("setSearch", "") // 🧼 clear search keyword
    this.getData()
  },
    goToPage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.getData()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  },
  mounted() {
    this.getConfigurations()
    this.getData()
    this.refreshCartMap()
    const elems = document.querySelectorAll("select")
    M.FormSelect.init(elems, {})
    const tips = document.querySelectorAll(".tooltipped")
    M.Tooltip.init(tips, {})
  },
  watch: {
    search(newVal) {
      if (newVal && !this.isShowingAllProducts) {
        this.isShowingAllProducts = true
      }
      this.getData()
    }
  }
}
</script>


<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');

  * {
    font-family: 'Quicksand', sans-serif;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
  }

  /* 🔥 Carousel banner */
  .hero-img {
    width: 100%;
    height: 520px;
    object-fit: cover;
    margin-bottom: 0;
    border-radius: 0;
  }

  /* 💫 Category Highlights */
  .category-highlights {
    display: flex;
    justify-content: space-between;
    gap: 0px;
    flex-wrap: wrap;
    margin-top: 0px;
  }

  .category-box {
    flex: 1;
    min-width: 280px;
    cursor: pointer;
    text-align: center;
    border-radius: 0;
    overflow: hidden;
    background: white;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease;
  }

  .category-box:hover {
    transform: translateY(-6px);
  }

  .category-img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-bottom: 1px solid #ffd6e3;
  }

  .category-label {
    padding: 12px 0;
    font-size: 1.25rem;
    font-weight: bold;
    color: #d63384;
  }

  .category-label:hover {
    color: #ff85a2;
  }

  /* ✨ Boutique Title */
  .page-title {
    margin-top: 30px;
    font-family: 'Dancing Script', cursive;
    font-size: 4.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
    letter-spacing: 1.5px;
    background: linear-gradient(90deg, #ff4d88, #ff6ec7, #ff4d88);
    background-size: 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 6px rgba(255, 105, 180, 0.4));
    animation: ultraShine 3s ease-in-out infinite;
  }

  @keyframes ultraShine {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .section-subtitle {
    font-size: 2.3rem;
    font-weight: bold;
    color: #d63384;
    margin: 12px 0 40px;
    text-align: center;
    letter-spacing: 1px;
  }

  /* ✨ Sparkles */
  .sparkle-wrapper {
    position: relative;
    text-align: center;
    margin-bottom: 10px;
  }
  .sparkle {
    position: absolute;
    font-size: 20px;
    animation: sparkleSpin 3s infinite ease-in-out;
    opacity: 0.8;
    pointer-events: none;
  }
  .sparkle::before {
    content: "✨";
    display: block;
  }
  .sparkle-1 { top: -20px; left: 10%; animation-delay: 0s; }
  .sparkle-2 { top: -25px; right: 10%; animation-delay: 1s; }
  .sparkle-3 { bottom: -15px; left: 20%; animation-delay: 2s; }
  .sparkle-4 { bottom: -25px; right: 15%; animation-delay: 3s; }

  @keyframes sparkleSpin {
    0%   { transform: scale(1) rotate(0deg); opacity: 0.8; }
    50%  { transform: scale(1.5) rotate(180deg); opacity: 1; }
    100% { transform: scale(1) rotate(360deg); opacity: 0.8; }
  }

  .slider-container {
  width: 100%;
  max-width: 1050px; /* 👈 giới hạn khung nhìn để vừa 4 item + gap */
  margin: 0 auto;
  padding: 0 40px;
  overflow: hidden;
  position: relative;
}

.horizontal-scroll-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
  width: 100%;
  min-height: 360px;
}

.scroll-track {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 24px;
  padding: 15px 0;
}

.scroll-item {
  flex: 0 0 auto;
  width: 220px; /* 👈 cố định chiều rộng item */
}


  .scroll-track::-webkit-scrollbar {
    display: none;
  }


  /* 🛒 CARD */
  .product-card {
    width: 100%;
  padding: 0;
  background: #fff; /* ✨ nền trắng sạch */
  border: none;     /* bỏ viền màu mè */
  box-shadow: none; /* không đổ bóng */
  border-radius: 0; /* bo vuông */
  text-align: center;
  transition: transform 0.2s ease;
  }

  .product-card:hover {
    transform: scale(1.01);
    box-shadow: 0 10px 24px rgba(255, 133, 162, 0.25);
  }

  .product-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #ffd6e3;
    background-color: #fff0f5;
  }
  .card-content {
    background-color: #fff8fb;
    padding: 16px 12px;
    text-align: center;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    border-top: 1px dashed #ffc2d9;
  }
  .card-title {
    font-size: 2rem;
    color: #d63384;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .card-action {
    background: #fff0f5;
    padding: 16px 0;
    margin-top: auto;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 98px; /* ✅ Giữ ổn định chiều cao */
  }

  .mini-cart-btn {
    background: linear-gradient(135deg, #ff85a2, #ffa4c1);
    color: white;
    font-size: 0.9rem;
    padding: 14px 24px;
    border-radius: 10px;
    border: none;
    box-shadow: 0 2px 6px rgba(255, 133, 162, 0.3);
    transition: all 0.3s ease;
  }
  .mini-cart-btn:hover {
    background: linear-gradient(135deg, #ffa4c1, #ff85a2);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 133, 162, 0.4);
  }

  /* ➕ ➖ Quantity Buttons */
  .qty-btn {
    font-size: 2rem;        /* 👉 chữ to hơn */
    padding: 10px 18px;        /* 👉 nút bự ra */
    border-radius: 10px;       /* 👉 bo mềm hơn */
    background-color: #ffe4f0;
    border: none;
    color: #d63384;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  .qty-btn:hover {
    background-color: #ffcae0;
    transform: scale(1.05);
  }
  .qty-text {
    font-weight: bold;
    font-size: 1.4rem;
    color: #d63384;
    min-width: 24px;
    text-align: center;
  }
  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* 🏷️ SALE BADGE */
  .sale-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #ff85a2;
    color: white;
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    z-index: 5;
  }

  /* 💖 Heart effect */
  .product-card::before,
  .product-card::after {
    content: "💖";
    position: absolute;
    font-size: 1.2rem;
    opacity: 0;
    transition: all 0.6s ease;
    pointer-events: none;
    z-index: 1;
  }
  .product-card::before {
    top: -10px;
    left: -10px;
    transform: scale(0.5);
  }
  .product-card::after {
    bottom: -10px;
    right: -10px;
    transform: scale(0.5);
  }
  .product-card:hover::before,
  .product-card:hover::after {
    opacity: 1;
    transform: scale(1.2) rotate(20deg);
    animation: floatHearts 2s infinite ease-in-out;
  }
  @keyframes floatHearts {
    0%   { transform: scale(1.2) rotate(20deg); opacity: 1; }
    50%  { transform: scale(1.4) rotate(40deg); opacity: 0.6; }
    100% { transform: scale(1.2) rotate(20deg); opacity: 1; }
  }

  /* ⬅️➡️ BUTTONS */
  .scroll-btn {
    background: #fff0f5;
    border: 2px solid #ffb6c1;
    color: #d63384;
    font-size: 2rem;
    font-weight: bold;
    padding: 10px 18px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
    z-index: 5;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .scroll-btn.left {
    left: -60px;
  }
  .scroll-btn.right {
    right: -60px;
  }
  .scroll-btn:hover {
    background: #ffe4ef;
    transform: scale(1.1);
  }

  .show-more-wrapper {
  text-align: center;
  margin: 30px 0 50px;
}

.show-more-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #ff85a2, #ffa4c1);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 133, 162, 0.4);
  transition: all 0.3s ease;
}

.show-more-btn:hover {
  background: linear-gradient(135deg, #ffa4c1, #ff85a2);
  transform: scale(1.05);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 👈 luôn 4 item */
  gap: 30px;
  padding: 30px 10px;
  max-width: 1340px;
  margin: 0 auto;
}

.filter-sort-row {
  display: flex;
  max-width: 1340px;
  margin: 0 auto;
  gap: 40px;
  padding: 30px 10px;
}

.filter-sidebar {
  width: 240px;
  background: #fffafc;
  border: 1px solid #ffd6e3;
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
  height: fit-content;
  box-shadow: 0 4px 12px rgba(255, 133, 162, 0.1);
}

.filter-title {
  font-size: 1.5rem;
  color: #d63384;
  margin-bottom: 10px;
  font-weight: bold;
}

.sort-options {
  list-style: none;
  padding: 0;
}

.sort-options li {
  margin-bottom: 12px;
}

.sort-options input[type="radio"] {
  margin-right: 8px;
  accent-color: #ff85a2;
}

.product-grid-wrapper {
  flex: 1;
}

.horizontal-line {
  max-width: 1050px;   /* 👈 khớp với slider-container */
  margin: 30px auto 60px;
  height: 1px;
  background-color: #b66e85;
  border: none;
  opacity: 0.8;
}

.pink-text {
  color: #ee90b0 !important;
  font-size: 1.5rem;
}
.pagination li {
  padding: 8px 16px;
  background-color: transparent;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4b3f4e;
  font-size: 1.1rem;
  border-bottom: 2px solid transparent;
}

.pagination li:hover {
  color: #d63384;
  border-bottom: 2px solid #ff85a2;
}

.pagination li.active {
  color: #d63384;
  border-bottom: 2px solid #d63384;
}

.pagination li.disabled {
  pointer-events: none;
  opacity: 0.3;
}

.pagination li.ellipsis {
  cursor: default;
  font-weight: normal;
  color: #999;
}

.back-pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin: 40px 0 60px;
}



</style>

