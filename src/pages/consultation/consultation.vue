<template>
  <view class="consultation-page">
    <!-- 顶部统计卡片 + 主体区域 -->
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

    <!-- 主体区域：当前就诊 + 操作入口 + 队列预览，占据剩余空间（不滚动） -->
    <view class="main-area">
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
      </view>
      <view v-else class="empty-block">
        <text class="empty-text">当前无就诊患者</text>
      </view>
      
      <!-- 操作入口：申请加号按钮放在队列上方 -->
      <view class="inline-actions">
        <button class="btn btn-add" @click="showAddPatient = true">申请加号</button>
      </view>

      <!-- 页面内队列预览列表（只显示候诊，过号放队尾，不显示就诊中） -->
      <view class="inline-queue" v-if="displayQueue && displayQueue.length">
        <view class="inline-header">
          <text class="title">候诊队列</text>
          <text class="link" @click.stop="showQueue = true">查看全部 ></text>
        </view>
        <view class="inline-list">
          <view
            class="inline-item"
            v-for="item in displayQueue"
            :key="item.id"
            :class="['status-' + item.status]"
          >
            <text class="num">{{ item.queueNumber }}</text>
            <view class="info">
              <text class="name">{{ item.name }}</text>
              <text class="desc">{{ item.gender }}｜{{ item.age }}岁</text>
            </view>
            <text :class="['tag', 'tag-' + item.status]">{{ getStatusText(item.status) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位：仅用于与 TabBar 留出安全距离，无按钮 -->
    <view class="bottom-bar"></view>

    <!-- 查看全部：三类分类面板（占2/3高度，可滚动，不显示就诊中） -->
    <view class="full-mask" v-if="showQueue" @click="showQueue = false">
      <view class="full-panel" @click.stop>
        <view class="full-header">
          <text class="title">全部队列</text>
          <text class="close" @click="showQueue = false">✕</text>
        </view>
        <view class="tabs">
          <text :class="['tab', fullTab==='waiting' ? 'active' : '']" @click="fullTab='waiting'">候诊</text>
          <text :class="['tab', fullTab==='completed' ? 'active' : '']" @click="fullTab='completed'">已完成</text>
          <text :class="['tab', fullTab==='invalid' ? 'active' : '']" @click="fullTab='invalid'">作废</text>
        </view>
        <scroll-view scroll-y class="full-content">
          <view v-if="fullTab==='waiting'" class="list">
            <view class="item" v-for="it in listWaiting" :key="it.id">
              <text class="num">{{ it.queueNumber }}</text>
              <view class="info">
                <text class="name">{{ it.name }}</text>
                <text class="desc">{{ it.gender }}｜{{ it.age }}岁</text>
              </view>
              <text class="tag" :class="'tag-' + it.status">{{ getStatusText(it.status) }}</text>
            </view>
            <view v-if="!listWaiting.length" class="empty">暂无候诊</view>
          </view>
          <view v-else-if="fullTab==='completed'" class="list">
            <view v-if="listCompleted.length" class="item" v-for="it in listCompleted" :key="it.id">
              <text class="num">{{ it.queueNumber }}</text>
              <view class="info">
                <text class="name">{{ it.name }}</text>
                <text class="desc">{{ it.gender }}｜{{ it.age }}岁</text>
              </view>
              <text class="tag" :class="'tag-' + it.status">{{ getStatusText(it.status) }}</text>
            </view>
            <view v-else class="empty">暂无已完成</view>
          </view>
          <view v-else class="list">
            <view v-if="listInvalid.length" class="item" v-for="it in listInvalid" :key="it.id">
              <text class="num">{{ it.queueNumber }}</text>
              <view class="info">
                <text class="name">{{ it.name }}</text>
                <text class="desc">{{ it.gender }}｜{{ it.age }}岁</text>
              </view>
              <text class="tag" :class="'tag-' + it.status">{{ getStatusText(it.status) }}</text>
            </view>
            <view v-else class="empty">暂无作废</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 加号弹层（原生实现） -->
    <view class="add-mask" v-if="showAddPatient" @click="closeAddPatientModal">
      <view class="add-panel" @click.stop>
        <view class="add-header">
          <text class="title">申请加号</text>
        </view>
        <view class="add-body">
          <view class="form-item">
            <text class="label">选择患者</text>
            <view class="input-like" @click="openPatientSelectModal">
              <text v-if="addForm.selectedPatient" class="selected-text">{{ addForm.selectedPatient.name }}</text>
              <text v-else class="placeholder">点击选择患者</text>
              <text class="arrow">›</text>
            </view>
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
          <button class="btn btn-cancel" @click="closeAddPatientModal">取消</button>
          <button class="btn btn-confirm" @click="handleAddPatient(addForm)">提交申请</button>
        </view>
      </view>
    </view>

    <!-- 患者选择弹层 -->
    <view class="patient-select-mask" v-if="showPatientSelect" @click="showPatientSelect = false">
      <view class="patient-select-panel" @click.stop>
        <view class="patient-select-header">
          <input class="search-input" v-model="patientSearchKeyword" placeholder="搜索患者姓名/手机号" />
        </view>
        <scroll-view scroll-y class="patient-select-content">
          <view v-if="isSearching" class="loading-text">搜索中...</view>
          <view v-else-if="patientList.length" class="list">
            <view
              class="item"
              v-for="p in patientList"
              :key="p.patient_id"
              @click="handleSelectPatientFromList(p)"
            >
              <view class="info">
                <text class="name">{{ p.name }}</text>
                <text class="desc">{{ p.gender }} | {{ p.age }}岁 | {{ p.phone }}</text>
              </view>
            </view>
          </view>
          <view v-else class="empty-text">无匹配患者</view>
        </scroll-view>
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
import { ref, computed, watch } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { getConsultationQueue, getPatientDetail, searchPatients } from '@/api/consultation'
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
const showPatientSelect = ref(false) // 控制患者选择弹窗

// 加号表单
const addForm = ref({
  gender: '男',
  position: 'end',
  reason: '',
  selectedPatient: null, // 存储选中的患者完整对象
})

// --- 患者选择逻辑 ---
const patientSearchKeyword = ref('')
const patientList = ref([])
const isSearching = ref(false)
let searchTimer = null

// 打开选择器
const openPatientSelectModal = () => {
  showPatientSelect.value = true
  patientSearchKeyword.value = '' // 清空上次的搜索
  patientList.value = []
  // 可以在这里预加载一个默认列表
  searchPatientList('')
}

// 关闭加号弹窗时，重置所有相关状态
const closeAddPatientModal = () => {
  showAddPatient.value = false
  addForm.value = {
    gender: '男',
    position: 'end',
    reason: '',
    selectedPatient: null,
  }
}

// 监听搜索关键词变化，自动搜索（防抖）
watch(patientSearchKeyword, (newKeyword) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchPatientList(newKeyword)
  }, 300)
})

// 执行搜索
const searchPatientList = async (keyword) => {
  isSearching.value = true
  try {
    const res = await searchPatients({ name: keyword })
    if (res.code === 0) {
      patientList.value = res.message.patients
    } else {
      patientList.value = []
    }
  } catch (err) {
    console.error(err)
    patientList.value = []
  } finally {
    isSearching.value = false
  }
}

// 从列表选择一个患者
const handleSelectPatientFromList = (patient) => {
  addForm.value.selectedPatient = patient
  addForm.value.gender = patient.gender
  showPatientSelect.value = false // 关闭选择弹窗
}


// 页面内候诊队列（候诊在前，过号在后，不显示就诊中）
const displayQueue = computed(() => {
  const waiting = queueList.value.filter(it => it.status === 'waiting')
  const passed = queueList.value.filter(it => it.status === 'passed')
  return [...waiting, ...passed]
})

// 全部分类视图数据（不包含就诊中）
const fullTab = ref('waiting')
const listWaiting = computed(() => {
  const waiting = queueList.value.filter(it => it.status === 'waiting')
  const passed = queueList.value.filter(it => it.status === 'passed')
  return [...waiting, ...passed]
})
// 已完成：后完成的在最上面（倒序）
const listCompleted = computed(() => {
  const completed = queueList.value.filter(it => it.status === 'completed')
  return completed.reverse()
})
// 作废：后作废的在最上面（倒序）
const listInvalid = computed(() => {
  const invalid = queueList.value.filter(it => it.status === 'invalid')
  return invalid.reverse()
})

// 定时器
let refreshTimer = null

// --- 业务逻辑层 ---

// 计算统计数据
const recalcStats = () => {
  const waiting = queueList.value.filter(it => it.status === 'waiting').length
  const passed = queueList.value.filter(it => it.status === 'passed').length
  const completed = queueList.value.filter(it => it.status === 'completed').length
  const invalid = queueList.value.filter(it => it.status === 'invalid').length
  
  stats.value.waitingCount = waiting
  stats.value.passedCount = passed
  // 假设初始已完成数量固定，或从API获取
  stats.value.completedCount = (stats.value.completedCount || 15) + completed 
  stats.value.totalSource = waiting + passed + completed + invalid + (currentPatient.value ? 1 : 0)
}

// 计算下一位患者
const computeNexts = () => {
  const next = queueList.value.find(it => it.status === 'waiting' || it.status === 'passed') || null
  nextPatient.value = next ? { id: next.id, name: next.name, queueNumber: next.queueNumber, status: next.status } : null
}

// 获取队列数据
const fetchQueueData = async (isAuto = false) => {
  try {
    if (!isAuto) loading('加载中...')
    const res = await getConsultationQueue()
    if (res.code === 0) {
      const data = res.message
      stats.value = data.stats
      currentPatient.value = data.currentPatient
      // 把当前患者也加入到 queueList，方便统一管理
      const allPatients = [...data.queue]
      if (data.currentPatient && !allPatients.find(p => p.id === data.currentPatient.id)) {
        allPatients.unshift(data.currentPatient)
      }
      queueList.value = allPatients
      
      recalcStats()
      computeNexts()
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
        // 1. 将当前患者标记为 completed
        const currentIdx = queueList.value.findIndex(p => p.id === patient.id)
        if (currentIdx > -1) {
          queueList.value[currentIdx].status = 'completed'
        }
        
        // 2. 从队列中找到下一位 (waiting or passed)
        const nextIdx = queueList.value.findIndex(p => p.status === 'waiting' || p.status === 'passed')
        
        if (nextIdx > -1) {
          // 3. 将下一位设为 consulting
          const nextP = queueList.value[nextIdx]
          nextP.status = 'consulting'
          currentPatient.value = nextP
        } else {
          currentPatient.value = null
        }

        // 4. 重新计算统计和下一位预览
        recalcStats()
        computeNexts()
        success('操作成功')
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
        const pIndex = queueList.value.findIndex(p => p.id === patient.id)
        if (pIndex === -1) return error('未找到患者')

        const targetPatient = queueList.value[pIndex]

        // 使用 passCount 来判断是第几次过号
        if (targetPatient.passCount && targetPatient.passCount >= 1) {
          // 只要 passCount >= 1，再次过号就作废
          targetPatient.status = 'invalid'
          warning('该患者已作废')
        } else {
          // 第一次过号
          targetPatient.passCount = 1
          targetPatient.status = 'passed'
          // 移动到队尾
          const [moved] = queueList.value.splice(pIndex, 1)
          queueList.value.push(moved)
          warning('已过号')
        }

        // 如果过号的是当前患者，则需要叫下一位
        if (currentPatient.value && currentPatient.value.id === patient.id) {
            const nextIdx = queueList.value.findIndex(p => p.status === 'waiting' || p.status === 'passed')
            if (nextIdx > -1) {
                const nextP = queueList.value[nextIdx]
                nextP.status = 'consulting'
                currentPatient.value = nextP
            } else {
                currentPatient.value = null
            }
        }
        
        recalcStats()
        computeNexts()
      }
    }
  })
}

// 提交加号
const handleAddPatient = async (formData) => {
  if (!formData.selectedPatient) {
    return error('请先搜索并选择一位患者')
  }
  
  const nextId = () => String(Math.max(...queueList.value.map(p => Number(p.id))) + 1)
  const nextQueueNumber = () => 'A' + String(Math.max(...queueList.value.map(p => parseInt(String(p.queueNumber).slice(1)))) + 1).padStart(3, '0')

  const newPatient = {
    id: nextId(),
    patient_id: formData.selectedPatient.patient_id,
    name: formData.selectedPatient.name,
    age: formData.selectedPatient.age,
    gender: formData.selectedPatient.gender,
    queueNumber: nextQueueNumber(),
    status: 'waiting',
    passCount: 0,
  }

  if (formData.position === 'next' && currentPatient.value) {
    const currentIdx = queueList.value.findIndex(p => p.id === currentPatient.value.id)
    queueList.value.splice(currentIdx + 1, 0, newPatient)
  } else {
    queueList.value.push(newPatient)
  }

  recalcStats()
  computeNexts()
  
  // 先关闭弹窗，再显示提示
  closeAddPatientModal()
  success('加号成功')
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
    // 真实场景下这里应该是 fetchQueueData(true)，但因为现在是纯前端逻辑，所以注释掉
    // fetchQueueData(true) 
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
  display: flex;
  flex-direction: column;
  padding: 30rpx 30rpx 150rpx;
  overflow: hidden; // 禁止页面滚动

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

  .main-area {
    flex: 1;
    margin-top: 24rpx;
    overflow: hidden; // 禁止滚动，超出裁切
  }

  .bottom-bar {
    height: 120rpx; // 仅作为与 TabBar 的间隔
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
    border-radius: 999rpx;
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
  .detail-mask,
  .full-mask {
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
        position: relative; // 为了搜索结果定位

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

        .input-like {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1rpx solid #e5e5e5;
          border-radius: 8rpx;
          padding: 12rpx 16rpx;
          font-size: 28rpx;
          min-height: 40rpx; // 确保有高度

          .placeholder {
            color: #999;
          }
          
          .selected-text {
            color: #333;
          }

          .arrow {
            font-size: 32rpx;
            color: #ccc;
          }
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1rpx solid #e5e5e5;
          border-top: none;
          border-radius: 0 0 8rpx 8rpx;
          max-height: 300rpx;
          overflow-y: auto;
          z-index: 1001;

          .result-item {
            padding: 16rpx;
            font-size: 28rpx;
            border-bottom: 1rpx solid #f5f5f5;
            &:last-child {
              border-bottom: none;
            }
          }
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

  /* 全部列表面板（占2/3页面高度，内容可滚动） */
  .full-panel {
    width: 100%;
    height: 66.67vh; // 占页面2/3高度
    background: #fff;
    border-top-left-radius: 16rpx;
    border-top-right-radius: 16rpx;
    display: flex;
    flex-direction: column;
  }

  .full-header {
    padding: 24rpx 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .title {
      font-size: 32rpx;
      font-weight: 600;
    }

    .close {
      font-size: 28rpx;
      color: #999;
    }
  }

  .tabs {
    padding: 0 20rpx 12rpx;
    display: flex;
    gap: 16rpx;
    flex-shrink: 0;

    .tab {
      padding: 10rpx 16rpx;
      background: #f5f5f5;
      color: #666;
      border-radius: 999rpx;
      font-size: 26rpx;
    }

    .tab.active {
      background: #2979ff;
      color: #fff;
    }
  }

  .full-content {
    flex: 1;
    padding: 0 20rpx 20rpx;
    /* 可滚动区域 */

    .list {
      .item {
        display: flex;
        align-items: center;
        padding: 16rpx 4rpx;
        border-bottom: 1rpx solid #f5f5f5;

        .num {
          width: 110rpx;
          font-size: 30rpx;
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

        .tag-waiting {
          background: #e6f7ff;
          color: #1890ff;
        }

        .tag-passed {
          background: #fff7e6;
          color: #fa8c16;
        }

        .tag-completed {
          background: #f6ffed;
          color: #52c41a;
        }

        .tag-invalid {
          background: #f5f5f5;
          color: #999;
        }
      }

      .empty {
        text-align: center;
        color: #999;
        padding: 40rpx 0;
      }
    }
  }

  .inline-actions {
    margin-top: 16rpx;
    margin-bottom: 24rpx;
  }

  .inline-queue {
    margin-top: 24rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 20rpx 12rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    .inline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      .title {
        font-size: 30rpx;
        font-weight: 600;
      }

      .link {
        font-size: 24rpx;
        color: #2979ff;
      }
    }

    .inline-list {
      .inline-item {
        flex-direction: row;
        display: flex;
        align-items: center;
        padding: 16rpx 4rpx;
        border-bottom-width: 1rpx;
        border-bottom-style: solid;
        border-bottom-color: #f5f5f5;

        .num {
          width: 110rpx;
          font-size: 30rpx;
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

        .tag-waiting {
          background: #e6f7ff;
          color: #1890ff;
        }

        .tag-passed {
          background: #fff7e6;
          color: #fa8c16;
        }

        .tag-completed {
          background: #f6ffed;
          color: #52c41a;
        }

        .tag-invalid {
          background: #f5f5f5;
          color: #999;
        }

        &.status-consulting {
          background: #f0f9eb;
        }

        &.status-passed {
          opacity: 0.7;
        }
      }
    }
  }

  .patient-select-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001; // 要比 add-mask 高
  }

  .patient-select-panel {
    width: 90%;
    height: 70vh;
    background: #fff;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;

    .patient-select-header {
      padding: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;

      .search-input {
        background: #f5f5f5;
        border-radius: 999rpx;
        padding: 12rpx 24rpx;
        font-size: 26rpx;
        border: none;
      }
    }

    .patient-select-content {
      flex: 1;
      min-height: 0;

      .loading-text,
      .empty-text {
        text-align: center;
        color: #999;
        padding: 40rpx 0;
      }

      .list {
        .item {
          padding: 24rpx 20rpx;
          border-bottom: 1rpx solid #f5f5f5;
          display: flex;
          align-items: center;

          .info {
            flex: 1;
            .name {
              font-size: 30rpx;
              font-weight: 500;
              margin-bottom: 8rpx;
            }
            .desc {
              font-size: 24rpx;
              color: #999;
            }
          }
        }
      }
    }
  }
}
</style>
