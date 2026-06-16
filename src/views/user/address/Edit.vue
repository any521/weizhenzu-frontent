<template>
  <div class="address-edit-page">
    <AppHeader :title="isEdit ? '编辑地址' : '新增地址'" show-back />

    <van-form @submit="onSubmit">
      <van-cell-group inset title="联系人">
        <van-field
          v-model="form.contactName"
          label="姓名"
          placeholder="请输入收货人姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="form.contactPhone"
          label="电话"
          type="tel"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: phonePattern, message: '手机号格式错误' }]"
        />
      </van-cell-group>

      <van-cell-group inset title="地址信息">
        <van-cell
          title="所在地区"
          is-link
          clickable
          @click="showAreaPicker = true"
          :value="areaText || '请选择'"
        />
        <van-field
          v-model="form.detail"
          label="详细地址"
          type="textarea"
          placeholder="请输入楼栋/门牌号等详细地址"
          rows="2"
          autosize
          :rules="[{ required: true, message: '请输入详细地址' }]"
        />
        <van-cell title="地图定位" is-link clickable @click="goMapPicker">
          <template #value>
            <span v-if="form.longitude && form.latitude" class="located">
              <van-icon name="location-o" color="#FF6B35" /> 已定位
            </span>
            <span v-else class="not-located">点击选择位置</span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="标签">
        <div class="tag-list">
          <van-tag
            v-for="t in tags"
            :key="t"
            :plain="form.tag !== t"
            round
            :color="form.tag === t ? '#FF6B35' : '#fff5ed'"
            :text-color="form.tag === t ? '#fff' : '#FF6B35'"
            size="large"
            @click="form.tag = form.tag === t ? '' : t"
          >{{ t }}</van-tag>
        </div>
      </van-cell-group>

      <van-cell-group inset>
        <van-cell title="设为默认地址">
          <template #right-icon>
            <van-switch v-model="isDefault" size="22" active-color="#FF6B35" />
          </template>
        </van-cell>
      </van-cell-group>

      <div v-if="isEdit" class="del-btn-wrap">
        <van-button plain block round type="danger" @click.prevent="onDelete">删除地址</van-button>
      </div>

      <div class="bottom-bar">
        <van-button type="primary" round block native-type="submit" :loading="submitting">
          保存
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showAreaPicker" position="bottom">
      <van-area
        title="选择地区"
        :area-list="areaList"
        @confirm="onAreaConfirm"
        @cancel="showAreaPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import {
  getAddressDetail,
  createAddress,
  updateAddress,
  deleteAddress,
  type AddressDTO
} from '@/api/user/address.api'
import { phonePattern } from '@/utils/validator'

const route = useRoute()
const router = useRouter()

const addressId = route.params.id ? Number(route.params.id) : 0
const isEdit = computed(() => addressId > 0)
const submitting = ref(false)
const showAreaPicker = ref(false)
const isDefault = ref(false)

const tags = ['家', '公司', '学校', '酒店']

const form = reactive<AddressDTO & { id?: number }>({
  contactName: '',
  contactPhone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  longitude: 0,
  latitude: 0,
  tag: '',
  isDefault: 0
})

const areaText = computed(() => {
  if (form.province || form.city || form.district) {
    return `${form.province}${form.city}${form.district}`
  }
  return ''
})

// 简化的地区数据，实际项目应使用完整地区数据
const areaList = {
  province_list: {
    110000: '北京市',
    120000: '天津市',
    310000: '上海市',
    440000: '广东省',
    330000: '浙江省',
    320000: '江苏省'
  },
  city_list: {
    110100: '北京市',
    310100: '上海市',
    440100: '广州市',
    440300: '深圳市',
    330100: '杭州市',
    320100: '南京市'
  },
  county_list: {
    110101: '东城区',
    110102: '西城区',
    310104: '徐汇区',
    310105: '长宁区',
    440103: '荔湾区',
    440304: '福田区'
  }
}

function onAreaConfirm(values: any[]) {
  values.forEach((v, i) => {
    if (i === 0) form.province = v.name
    else if (i === 1) form.city = v.name
    else if (i === 2) form.district = v.name
  })
  showAreaPicker.value = false
}

function goMapPicker() {
  router.push('/user/address/map')
}

async function loadDetail() {
  if (!addressId) return
  try {
    const detail = await getAddressDetail(addressId)
    Object.assign(form, {
      id: detail.id,
      contactName: detail.contactName,
      contactPhone: detail.contactPhone,
      province: detail.province,
      city: detail.city,
      district: detail.district,
      detail: detail.detail,
      longitude: detail.longitude,
      latitude: detail.latitude,
      tag: detail.tag,
      isDefault: detail.isDefault
    })
    isDefault.value = detail.isDefault === 1
  } catch {
    // ignore
  }
}

async function onSubmit() {
  submitting.value = true
  try {
    form.isDefault = isDefault.value ? 1 : 0
    if (isEdit.value) {
      await updateAddress(addressId, form)
    } else {
      await createAddress(form)
    }
    showSuccessToast('保存成功')
    setTimeout(() => router.back(), 500)
  } catch (e: any) {
    showFailToast(e?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

async function onDelete() {
  try {
    await showConfirmDialog({ title: '提示', message: '确定删除该地址吗？' })
    await deleteAddress(addressId)
    showSuccessToast('已删除')
    setTimeout(() => router.back(), 500)
  } catch {
    // 取消
  }
}

onMounted(loadDetail)
</script>

<style scoped lang="scss">
.address-edit-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
}
.located {
  color: #ff6b35;
  display: flex;
  align-items: center;
  gap: 4px;
}
.not-located {
  color: #999;
}
.del-btn-wrap {
  padding: 12px;
}
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  z-index: 99;
  .van-button {
    height: 44px;
  }
}
</style>
