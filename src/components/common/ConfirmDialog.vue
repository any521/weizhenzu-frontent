<template>
  <van-dialog
    v-model:show="show"
    :title="title"
    :show-confirm-button="false"
    :close-on-click-overlay="closable"
    class="confirm-dialog"
  >
    <div class="dialog-content">{{ message }}</div>
    <div class="dialog-footer">
      <van-button v-if="showCancel" block plain @click="onCancel">{{ cancelText }}</van-button>
      <van-button
        block
        type="primary"
        :loading="loading"
        @click="onConfirm"
      >{{ confirmText }}</van-button>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
    closable?: boolean
    loading?: boolean
  }>(),
  {
    title: '提示',
    confirmText: '确定',
    cancelText: '取消',
    showCancel: true,
    closable: true,
    loading: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const show = ref(props.modelValue)

watch(
  () => props.modelValue,
  v => {
    show.value = v
  }
)

watch(show, v => {
  emit('update:modelValue', v)
})

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  show.value = false
  emit('cancel')
}
</script>

<style scoped lang="scss">
.dialog-content {
  padding: 20px 16px;
  text-align: center;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}
.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 0 16px 16px;
  :deep(.van-button) {
    border-radius: 8px;
  }
}
</style>
