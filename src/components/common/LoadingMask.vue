<template>
  <div v-if="visible" class="loading-mask">
    <van-loading :type="type" :color="color" :size="size" vertical>
      {{ text }}
    </van-loading>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    text?: string
    type?: 'circular' | 'spinner' | 'ball'
    color?: string
    size?: string
  }>(),
  {
    text: '加载中...',
    type: 'circular',
    color: '#FF6B35',
    size: '36px'
  }
)
</script>

<style scoped lang="scss">
.loading-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 100;
}
</style>
