<template>
  <div class="layout">
    <Header />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Header from './Header.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style> 