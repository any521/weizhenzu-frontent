<template>
  <div class="placeholder-page">
    <AppHeader :title="title" show-back />
    <EmptyState :description="`${title} - 开发中`" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const title = computed(() => (route.meta.title as string) || '页面')
</script>

<style scoped lang="scss">
.placeholder-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
