<template>
  <footer class="footer bg-light-sakura text-muted py-4">
    <div class="container">
      <div class="footer-flex">

        <!-- Brand -->
        <div class="footer-section">
          <h5 class="footer-brand">🌸 Emma Sakura</h5>
          <p class="footer-desc">
            Handcrafted gifts infused with the beauty of cherry blossoms.<br />
            Inspired by Kyoto, made with love.
          </p>
        </div>

        <!-- 🔗 Quick Links -->
        <div class="footer-section">
          <h6 class="footer-title">Quick Links</h6>
          <ul class="footer-list">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Shipping & Returns</a></li>
          </ul>
        </div>

        <!-- ☎ Contact Info -->
        <div class="footer-section">
          <h6 class="footer-title">Contact</h6>
          <ul class="footer-contact">
            <li><i class="bi bi-geo-alt-fill me-2"></i> 123 Blossom St, Kyoto</li>
            <li><i class="bi bi-phone-fill me-2"></i> +81 90-1234-5678</li>
            <li><i class="bi bi-envelope-fill me-2"></i> hello@emmasakura.jp</li>
          </ul>
        </div>

        <!-- Subscribe -->
        <div class="footer-section">
          <h6 class="footer-title">Subscribe</h6>
          <form @submit.prevent="subscribe">
            <div class="input-group input-group-sm">
              <input
                type="email"
                class="form-control border-end-0 rounded-start"
                placeholder="Your email address"
                required
              />
              <button type="submit" class="btn btn-pink rounded-end">Join</button>
            </div>
            <small class="d-block mt-2">We send only sweet updates. No spam 🍡</small>
          </form>
        </div>

      </div>

      <hr class="my-3" />

      <div class="footer-bottom">
        <span>&copy; 2025 Emma Sakura. All rights reserved.</span>
        <span>Made with <span class="text-heart">♥</span> in Kyoto</span>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
  methods: {
    subscribe() {
      alert("Thanks for subscribing to Emma Sakura!");
    }
  }
}
</script>

<style scoped>
/* General */
.bg-light-sakura {
  background-color: #fff1f6;
}

.footer-flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  flex-direction: row;
}

.footer-section {
  flex: 1;
  min-width: 220px;
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.85rem;
  color: #6c757d;
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}

/* 🌸 Branding */
.footer-brand {
  font-size: 1.4rem;
  font-weight: bold;
  color: #d63384;
  margin-bottom: 1rem;
}

.footer-title {
  font-weight: 600;
  font-size: 1rem;
  color: #343a40;
  margin-bottom: 1rem;
}

.footer-desc {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.6;
}

/* 🌸 List styles */
.footer-list,
.footer-contact {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.footer-list li,
.footer-contact li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.footer-list a {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-list a:hover {
  color: #d63384;
}

/* 🌸 Buttons */
.btn-pink {
  background-color: #d63384;
  color: white;
  border: none;
  padding-inline: 1rem;
  transition: background-color 0.3s ease;
}

.btn-pink:hover {
  background-color: #c12770;
}

/* 🌸 Other */
.text-heart {
  color: #f78fb3;
  font-weight: 600;
}
</style>
