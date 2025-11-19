<template>
  <u-popup :show="show" @close="$emit('close')" mode="center" round="16" :customStyle="{width: '80%'}">
    <view class="add-patient-modal">
      <view class="modal-header">
        <text class="title">申请加号</text>
      </view>
      
      <view class="modal-body">
        <u-form :model="form" ref="uForm" label-width="80">
          <u-form-item label="姓名" prop="name" borderBottom>
            <u-input v-model="form.name" placeholder="请输入患者姓名" border="none"></u-input>
          </u-form-item>
          <u-form-item label="年龄" prop="age" borderBottom>
            <u-input v-model="form.age" type="number" placeholder="请输入年龄" border="none"></u-input>
          </u-form-item>
          <u-form-item label="性别" prop="gender" borderBottom>
            <u-radio-group v-model="form.gender">
              <u-radio label="男" name="男" :customStyle="{marginRight: '20px'}"></u-radio>
              <u-radio label="女" name="女"></u-radio>
            </u-radio-group>
          </u-form-item>
          <u-form-item label="位置" prop="position" borderBottom>
            <u-radio-group v-model="form.position">
              <u-radio label="队尾" name="end" :customStyle="{marginRight: '20px'}"></u-radio>
              <u-radio label="下一位" name="next"></u-radio>
            </u-radio-group>
          </u-form-item>
          <u-form-item label="原因" prop="reason">
            <u-textarea v-model="form.reason" placeholder="请输入加号原因" count></u-textarea>
          </u-form-item>
        </u-form>
      </view>

      <view class="modal-footer">
        <u-button text="取消" @click="$emit('close')" :customStyle="{marginRight: '20rpx', width: '45%'}"></u-button>
        <u-button type="primary" text="提交申请" @click="submit" :customStyle="{width: '45%'}"></u-button>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  name: '',
  age: '',
  gender: '男',
  position: 'end',
  reason: ''
})

const submit = () => {
  if (!form.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  emit('submit', { ...form })
}
</script>

<style lang="scss" scoped>
.add-patient-modal {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;

  .modal-header {
    text-align: center;
    margin-bottom: 30rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
    }
  }

  .modal-body {
    margin-bottom: 30rpx;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
  }
}
</style>
