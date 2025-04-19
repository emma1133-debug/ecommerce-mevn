<template>
  <div class="layout-wrapper">
    <app-header/>
    
    <main class="main-content">
      <router-view/>
    </main>
    
    <app-footer/>
  </div>
</template>

<script>
import AppHeader from './components/layouts/AppHeader.vue'
import AppFooter from './components/layouts/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  }
}
</script>

<style>
/* 🔧 Dàn layout để giữ footer luôn ở đáy */
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* chiều cao toàn màn */
}

.main-content {
  flex: 1; /* phần main co giãn tự động */
}
</style>
