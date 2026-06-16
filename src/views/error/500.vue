<template>
  <div class="error-page">
    <van-empty image="network" description="服务器开小差了">
      <van-button type="primary" round @click="reload">重新加载</van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
function reload() {
  window.location.reload()
}
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
</style>
