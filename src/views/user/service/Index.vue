<template>
  <div class="service-page">
    <AppHeader title="客服中心" show-back />

    <!-- 顶部客服卡片 -->
    <div class="service-card">
      <van-image
        :src="defaultAvatar"
        width="56"
        height="56"
        round
        fit="cover"
      />
      <div class="info">
        <h2 class="title">在线客服</h2>
        <p class="desc">7x24小时为您服务</p>
      </div>
      <van-button type="primary" round size="small" icon="chat-o" @click="onChat">
        立即咨询
      </van-button>
    </div>

    <!-- 联系方式 -->
    <van-cell-group inset title="其他联系方式">
      <van-cell title="客服电话" is-link value="400-888-8888" @click="callService" />
      <van-cell title="客服邮箱" is-link value="service@weizhenzu.com" @click="emailService" />
      <van-cell title="微信公众号" is-link value="味真足外卖" @click="onWechat" />
      <van-cell title="官方微博" is-link value="@味真足" @click="onWeibo" />
    </van-cell-group>

    <!-- 常见问题 -->
    <div class="faq-section">
      <h3 class="section-title">常见问题</h3>
      <van-cell-group inset>
        <van-cell
          v-for="(faq, idx) in faqList"
          :key="idx"
          :title="faq.q"
          is-link
          @click="onFaqClick(faq)"
        />
      </van-cell-group>
    </div>

    <!-- 反馈 -->
    <van-cell-group inset title="意见反馈">
      <van-field
        v-model="feedback"
        type="textarea"
        placeholder="请描述您遇到的问题或建议，我们会尽快处理"
        rows="3"
        maxlength="500"
        show-word-limit
        autosize
      />
      <div class="submit-wrap">
        <van-button type="primary" round block @click="onSubmitFeedback">提交反馈</van-button>
      </div>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showSuccessToast, showDialog } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'

const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect width="56" height="56" fill="%23ff6b35"/><text x="50%25" y="50%25" font-size="20" fill="%23fff" text-anchor="middle" dy=".3em">客服</text></svg>'

const feedback = ref('')

const faqList = [
  { q: '如何下单？', a: '在首页选择商家，进入商家详情页选择菜品加入购物车，然后点击购物车进行结算即可。' },
  { q: '如何取消订单？', a: '在订单详情页，待支付或商家未接单状态下可以取消订单。已接单订单需联系商家协商。' },
  { q: '如何申请退款？', a: '在订单详情页点击"申请退款"，选择退款原因并提交，等待商家审核。' },
  { q: '配送费如何计算？', a: '配送费根据距离和商家设置收取，具体以订单结算页显示为准。' },
  { q: '优惠券如何使用？', a: '在确认订单页面点击"优惠券"选择可用优惠券，系统会自动抵扣相应金额。' },
  { q: '如何联系骑手？', a: '在订单配送中，可在订单详情或配送跟踪页点击"联系骑手"拨打电话。' },
  { q: '如何评价订单？', a: '订单完成后，在订单详情页点击"去评价"即可对商家和菜品进行评价。' },
  { q: '如何修改收货地址？', a: '在"我的-地址管理"中可以新增、编辑或删除收货地址。' }
]

function onChat() {
  showSuccessToast('正在为您接入客服...')
}

function callService() {
  window.location.href = 'tel:4008888888'
}

function emailService() {
  window.location.href = 'mailto:service@weizhenzu.com'
}

function onWechat() {
  showDialog({ title: '微信公众号', message: '请搜索"味真足外卖"关注我们' })
}

function onWeibo() {
  showDialog({ title: '官方微博', message: '请搜索"@味真足"关注我们' })
}

function onFaqClick(faq: { q: string; a: string }) {
  showDialog({ title: faq.q, message: faq.a })
}

function onSubmitFeedback() {
  if (!feedback.value.trim()) {
    showSuccessToast('请填写反馈内容')
    return
  }
  showSuccessToast('反馈已提交，感谢您的支持')
  feedback.value = ''
}
</script>

<style scoped lang="scss">
.service-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}
.service-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  margin-bottom: 10px;
  .info {
    flex: 1;
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .desc {
      margin: 4px 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
  }
}
.faq-section {
  margin-top: 10px;
  .section-title {
    margin: 0 16px 8px;
    font-size: 14px;
    color: #666;
    font-weight: normal;
  }
}
.submit-wrap {
  padding: 12px;
}
</style>
