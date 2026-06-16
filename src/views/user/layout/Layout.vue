<template>
  <div class="user-layout">
    <router-view v-slot="{ Component }">
      <keep-alive :include="['UserHome', 'UserOrders']">
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <van-tabbar v-if="showTabbar" v-model="active" route safe-area-inset-bottom>
      <van-tabbar-item to="/user/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/user/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item to="/user/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)
const showTabbar = computed(() => route.meta.tabbar === true)
</script>

<style scoped lang="scss">
.user-layout {
  min-height: 100vh;
  padding-bottom: 50px;
}
</style>
