<template>
  <view class="consultation-page">
    <!-- 顶部统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="num">{{ stats.totalSource }}</text>
        <text class="label">总号源</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ stats.waitingCount }}</text>
        <text class="label">候诊</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ stats.completedCount }}</text>
        <text class="label">已诊</text>
      </view>
      <view class="stat-item">
        <text class="num warning">{{ stats.passedCount }}</text>
        <text class="label">过号</text>
      </view>
    </view>

    <!-- 当前就诊卡片（原生实现） -->
    <view class="current-card" v-if="currentPatient" @click="handleViewDetail(currentPatient)">
      <view class="card-header">
        <text class="card-title">当前就诊</text>
        <text class="next-text" v-if="nextPatient">下一位：{{ nextPatient.name }}（{{ nextPatient.queueNumber }}）</text>
      </view>
      <view class="card-main">
        <text class="queue-number">{{ currentPatient.queueNumber }}</text>
        <view class="patient-info">
          <text class="name">{{ currentPatient.name }}</text>
          <text class="sub">{{ currentPatient.gender }}｜{{ currentPatient.age }}岁</text>
        </view>
      </view>
      <view class="card-actions">
        <button class="btn btn-pass" @click.stop="handlePass(currentPatient)">过号</button>
        <button class="btn btn-next" @click.stop="handleNext(currentPatient)">下一位</button>
      </view>
      <view class="view-queue" @click.stop="showQueue = true">
        <text>查看完整队列 ></text>
      </view>
    </view>
    <view v-else class="empty-block">
      <text class="empty-text">当前无就诊患者</text>
      <button class="btn btn-refresh" @click="fetchQueueData()">刷新队列</button>
    </view>

    <!-- 功能按钮区 -->
    <view class="action-area">
      <button class="btn btn-add" @click="showAddPatient = true">申请加号</button>
    </view>

    <!-- 队列弹层（原生实现） -->
    <view class="queue-mask" v-if="showQueue" @click="showQueue = false">
      <view class="queue-panel" @click.stop>
        <view class="queue-header">
          <text class="title">候诊队列</text>
          <text class="close" @click="showQueue = false">✕</text>
        </view>
        <scroll-view scroll-y class="queue-scroll">
          <view
            class="queue-item"
            v-for="item in queueList"
            :key="item.id"
            :class="['status-' + item.status]"
          >
            <text class="num">{{ item.queueNumber }}</text>
            <view class="info">
              <text class="name">{{ item.name }}</text>
              <text class="desc">{{ item.gender }}｜{{ item.age }}岁</text>
            </view>
            <text class="tag">{{ getStatusText(item.status) }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 加号弹层（原生实现） -->
    <view class="add-mask" v-if="showAddPatient" @click="showAddPatient = false">
      <view class="add-panel" @click.stop>
        <view class="add-header">
          <text class="title">申请加号</text>
        </view>
        <view class="add-body">
          <view class="form-item">
            <text class="label">姓名</text>
            <input class="input" v-model="addForm.name" placeholder="请输入患者姓名" />
          </view>
          <view class="form-item">
            <text class="label">年龄</text>
            <input class="input" v-model="addForm.age" type="number" placeholder="请输入年龄" />
          </view>
          <view class="form-item">
            <text class="label">性别</text>
            <view class="radio-group">
              <label class="radio" @click="addForm.gender = '男'">
                <view class="radio-dot" :class="{ active: addForm.gender === '男' }" />
                <text>男</text>
              </label>
              <label class="radio" @click="addForm.gender = '女'">
                <view class="radio-dot" :class="{ active: addForm.gender === '女' }" />
                <text>女</text>
              </label>
            </view>
          </view>
          <view class="form-item">
            <text class="label">位置</text>
            <view class="radio-group">
              <label class="radio" @click="addForm.position = 'end'">
                <view class="radio-dot" :class="{ active: addForm.position === 'end' }" />
                <text>队尾</text>
              </label>
              <label class="radio" @click="addForm.position = 'next'">
                <view class="radio-dot" :class="{ active: addForm.position === 'next' }" />
                <text>下一位</text>
              </label>
            </view>
          </view>
          <view class="form-item">
            <text class="label">原因</text>
            <textarea class="textarea" v-model="addForm.reason" placeholder="请输入加号原因" />
          </view>
        </view>
        <view class="add-footer">
          <button class="btn btn-cancel" @click="showAddPatient = false">取消</button>
          <button class="btn btn-confirm" @click="handleAddPatient(addForm)">提交申请</button>
        </view>
      </view>
    </view>

    <!-- 简单详情弹层 -->
    <view class="detail-mask" v-if="showDetail" @click="showDetail = false">
      <view class="detail-panel" @click.stop>
        <view class="detail-header">
          <text class="title">{{ detailPatient?.name }} 详细信息</text>
        </view>
        <view class="detail-content" v-if="detailPatient">
          <view class="detail-item"><text class="label">就诊号：</text>{{ detailPatient.queueNumber }}</view>
          <view class="detail-item"><text class="label">性别：</text>{{ detailPatient.gender }}</view>
          <view class="detail-item"><text class="label">年龄：</text>{{ detailPatient.age }}岁</view>
          <view class="detail-item"><text class="label">手机号：</text>{{ detailPatient.phone }}</view>
          <view class="detail-item"><text class="label">身份证：</text>{{ detailPatient.idCard }}</view>
          <view class="detail-item"><text class="label">主诉：</text>{{ detailPatient.symptoms }}</view>
          <view class="detail-item"><text class="label">既往史：</text>{{ detailPatient.history }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { getConsultationQueue, getPatientDetail, callNextPatient, passPatient, applyAddPatient } from '@/api/consultation'
import { success, error, warning, loading, hideToast } from '@/utils/toast'

// 状态数据
const stats = ref({
  totalSource: 0,
  waitingCount: 0,
  completedCount: 0,
  passedCount: 0
})
const currentPatient = ref(null)
const nextPatient = ref(null)
const queueList = ref([])
const detailPatient = ref(null)

// 弹窗控制
const showQueue = ref(false)
const showAddPatient = ref(false)
const showDetail = ref(false)

// 加号表单
const addForm = ref({
  name: '',
  age: '',
  gender: '男',
  position: 'end',
  reason: ''
})

// 定时器
let refreshTimer = null

// 获取队列数据
const fetchQueueData = async (isAuto = false) => {
  try {
    if (!isAuto) loading('加载中...')
    const res = await getConsultationQueue()
    if (res.code === 0) {
      const data = res.message
      stats.value = data.stats
      currentPatient.value = data.currentPatient
      nextPatient.value = data.nextPatient
      queueList.value = data.queue
      if (!isAuto) hideToast()
    } else {
      if (!isAuto) error(res.message || '获取数据失败')
    }
  } catch (err) {
    console.error(err)
    if (!isAuto) error('网络异常')
  }
}

// 查看详情
const handleViewDetail = async (patient) => {
  loading('获取详情...')
  try {
    const res = await getPatientDetail(patient.id)
    if (res.code === 0) {
      detailPatient.value = res.message
      showDetail.value = true
      hideToast()
    } else {
      error(res.message || '获取详情失败')
    }
  } catch (err) {
    error('网络异常')
  }
}

// 下一位
const handleNext = async (patient) => {
  uni.showModal({
    title: '确认',
    content: `确认完成 ${patient.name} 的就诊并呼叫下一位？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const apiRes = await callNextPatient(patient.id)
          if (apiRes.code === 0) {
            success('操作成功')
            fetchQueueData()
          } else {
            error(apiRes.message || '操作失败')
          }
        } catch (err) {
          error('网络异常')
        }
      }
    }
  })
}

// 过号
const handlePass = async (patient) => {
  uni.showModal({
    title: '确认过号',
    content: `确认将 ${patient.name} 标记为过号？`,
    confirmColor: '#ff0000',
    success: async (res) => {
      if (res.confirm) {
        try {
          const apiRes = await passPatient(patient.id)
          if (apiRes.code === 0) {
            warning('已过号')
            fetchQueueData()
          } else {
            error(apiRes.message || '操作失败')
          }
        } catch (err) {
          error('网络异常')
        }
      }
    }
  })
}

// 提交加号
const handleAddPatient = async (formData) => {
  try {
    const res = await applyAddPatient(formData)
    if (res.code === 0) {
      success('申请提交成功')
      showAddPatient.value = false
      fetchQueueData()
    } else {
      error(res.message || '提交失败')
    }
  } catch (err) {
    error('网络异常')
  }
}

// 队列状态文案
const getStatusText = (status) => {
  const map = {
    waiting: '候诊中',
    consulting: '就诊中',
    completed: '已完成',
    passed: '已过号',
    invalid: '已作废'
  }
  return map[status] || status
}

onShow(() => {
  fetchQueueData()
  // 开启自动刷新 (每30秒)
  refreshTimer = setInterval(() => {
    fetchQueueData(true)
  }, 30000)
})

onHide(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style lang="scss" scoped>
.consultation-page {
  min-height: 100vh;
  background: #f8faff;
  padding: 30rpx;
  padding-bottom: 120rpx;

  .stats-card {
    display: flex;
    justify-content: space-around;
    background: #fff;
    padding: 30rpx 0;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .num {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
        
        &.warning {
          color: #ff9900;
        }
      }

      .label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .action-area {
    margin-top: 40rpx;
  }

  .detail-content {
    padding: 20rpx;
    
    .detail-item {
      margin-bottom: 16rpx;
      font-size: 28rpx;
      color: #333;
      
      .label {
        color: #999;
        display: inline-block;
        width: 140rpx;
      }
    }
  }

  .current-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 30rpx;

    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .card-title {
        font-size: 32rpx;
        font-weight: 600;
      }

      .next-text {
        font-size: 24rpx;
        color: #999;
      }
    }

    .card-main {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .queue-number {
        font-size: 56rpx;
        font-weight: 700;
        color: #2979ff;
        margin-right: 24rpx;
      }

      .patient-info {
        display: flex;
        flex-direction: column;

        .name {
          font-size: 34rpx;
          font-weight: 600;
        }

        .sub {
          margin-top: 6rpx;
          font-size: 24rpx;
          color: #666;
        }
      }
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 10rpx;

      .btn {
        flex: 1;
        margin: 0 10rpx;
        padding: 16rpx 0;
        border-radius: 8rpx;
        font-size: 28rpx;
        border: none;
      }

      .btn-pass {
        background: #ffecec;
        color: #ff4d4f;
      }

      .btn-next {
        background: #e6fffb;
        color: #13c2c2;
      }
    }

    .view-queue {
      margin-top: 16rpx;
      text-align: center;
      font-size: 24rpx;
      color: #999;
    }
  }

  .empty-block {
    background: #fff;
    border-radius: 16rpx;
    padding: 60rpx 30rpx;
    text-align: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    .empty-text {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
  }

  .btn-add {
    width: 100%;
    padding: 20rpx 0;
    border-radius: 8rpx;
    background: #2979ff;
    color: #fff;
    border: none;
    font-size: 30rpx;
  }

  .btn-refresh {
    padding: 16rpx 40rpx;
    border-radius: 8rpx;
    background: #2979ff;
    color: #fff;
    border: none;
    font-size: 28rpx;
  }

  .queue-mask,
  .add-mask,
  .detail-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 1000;
  }

  .queue-panel {
    width: 100%;
    max-height: 70vh;
    background: #fff;
    border-top-left-radius: 16rpx;
    border-top-right-radius: 16rpx;

    .queue-header {
      padding: 24rpx 30rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 32rpx;
        font-weight: 600;
      }

      .close {
        font-size: 28rpx;
        color: #999;
      }
    }

    .queue-scroll {
      max-height: 60vh;
      padding: 0 30rpx 30rpx;
    }

    .queue-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom-width: 1rpx;
      border-bottom-style: solid;
      border-bottom-color: #f5f5f5;

      .num {
        width: 120rpx;
        font-size: 32rpx;
        font-weight: 600;
      }

      .info {
        flex: 1;

        .name {
          font-size: 28rpx;
          font-weight: 500;
        }

        .desc {
          margin-top: 4rpx;
          font-size: 24rpx;
          color: #999;
        }
      }

      .tag {
        font-size: 22rpx;
        padding: 4rpx 10rpx;
        border-radius: 20rpx;
        background: #f5f5f5;
        color: #666;
      }

      &.status-consulting {
        background: #f0f9eb;
      }

      &.status-passed {
        opacity: 0.7;
      }
    }
  }

  .add-panel {
    width: 90%;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 30rpx 30rpx;

    .add-header {
      text-align: center;
      margin-bottom: 20rpx;

      .title {
        font-size: 32rpx;
        font-weight: 600;
      }
    }

    .add-body {
      .form-item {
        margin-bottom: 20rpx;

        .label {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 8rpx;
          display: block;
        }

        .input {
          border-width: 1rpx;
          border-style: solid;
          border-color: #e5e5e5;
          border-radius: 8rpx;
          padding: 12rpx 16rpx;
          font-size: 28rpx;
        }

        .textarea {
          min-height: 120rpx;
          border-width: 1rpx;
          border-style: solid;
          border-color: #e5e5e5;
          border-radius: 8rpx;
          padding: 12rpx 16rpx;
          font-size: 28rpx;
        }

        .radio-group {
          flex-direction: row;
          display: flex;

          .radio {
            margin-right: 30rpx;
            flex-direction: row;
            display: flex;
            align-items: center;

            .radio-dot {
              width: 28rpx;
              height: 28rpx;
              border-radius: 50%;
              border-width: 2rpx;
              border-style: solid;
              border-color: #ccc;
              margin-right: 10rpx;
            }

            .radio-dot.active {
              border-color: #2979ff;
              background: #2979ff;
            }
          }
        }
      }
    }

    .add-footer {
      margin-top: 10rpx;
      flex-direction: row;
      display: flex;
      justify-content: space-between;

      .btn {
        flex: 1;
        margin: 0 10rpx;
        padding: 18rpx 0;
        border-radius: 8rpx;
        border: none;
        font-size: 28rpx;
      }

      .btn-cancel {
        background: #f5f5f5;
        color: #666;
      }

      .btn-confirm {
        background: #2979ff;
        color: #fff;
      }
    }
  }

  .detail-panel {
    width: 90%;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 30rpx 30rpx;

    .detail-header {
      margin-bottom: 16rpx;

      .title {
        font-size: 30rpx;
        font-weight: 600;
      }
    }
  }
}
</style>
