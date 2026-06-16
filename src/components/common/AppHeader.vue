<template>
  <header class="app-header" :class="{ 'has-back': showBack }">
    <div class="left" @click="onBack" v-if="showBack">
      <van-icon name="arrow-left" size="18" />
    </div>
    <div class="left" v-else>
      <slot name="left" />
    </div>
    <h1 class="title">{{ title }}</h1>
    <div class="right">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

withDefaults(
  defineProps<{
    title?: string
    showBack?: boolean
  }>(),
  {
    title: '',
    showBack: false
  }
)

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()

function onBack() {
  emit('back')
  router.back()
}
</script>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  .left,
  .right {
    min-width: 40px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .right {
    margin-left: auto;
    justify-content: flex-end;
  }
  .title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
