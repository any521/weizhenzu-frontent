<template>
  <div class="empty-state">
    <van-empty :image="image" :description="description">
      <template v-if="$slots.action" #default>
        <slot name="action" />
      </template>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    image?: 'default' | 'error' | 'network' | 'search'
    description?: string
  }>(),
  {
    image: 'default',
    description: '暂无数据'
  }
)
</script>

<style scoped lang="scss">
.empty-state {
  padding: 32px 0;
}
</style>
