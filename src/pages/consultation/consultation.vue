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
            :key="item.orderId"
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
            <view class="item" v-for="it in listWaiting" :key="it.orderId">
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
            <view v-if="listCompleted.length" class="item" v-for="it in listCompleted" :key="it.orderId">
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
            <view v-if="listInvalid.length" class="item" v-for="it in listInvalid" :key="it.orderId">
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
import { onShow, onHide, onLoad } from '@dcloudio/uni-app'
import { getConsultationQueue, getPatientDetail, searchPatients, callNextPatient, passPatient, completeConsultation, applyAddPatient } from '@/api/consultation'
import { success, error, warning, loading, hideToast } from '@/utils/toast'
import { useAuthStore } from '@/store/auth'

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
const scheduleId = ref(null)

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

// 获取队列数据
const fetchQueueData = async (isAuto = false) => {
  console.log('========== fetchQueueData 开始 ==========')
  console.log('scheduleId.value:', scheduleId.value)
  console.log('isAuto:', isAuto)
  
  if (!scheduleId.value) {
    console.error('❌ scheduleId 为空，无法请求数据')
    if (!isAuto) error('缺少排班ID')
    return
  }
  
  try {
    if (!isAuto) loading('加载中...')
    
    console.log('🚀 准备请求 /doctor/consultation/queue，参数:', { schedule_id: scheduleId.value })
    const res = await getConsultationQueue(scheduleId.value)
    console.log('✅ 接口响应:', res)
    
    if (res.code === 0) {
      const data = res.message
      console.log('📦 响应数据:', data)
      
      // 1. 映射统计数据
      stats.value = {
        totalSource: data.stats.totalSlots || 0,
        waitingCount: data.stats.waitingCount || 0,
        completedCount: data.stats.completedCount || 0,
        passedCount: data.stats.passedCount || 0
      }

      // 2. 映射当前患者（正在就诊的患者 isCall: true）
      if (data.currentPatient) {
        currentPatient.value = {
          orderId: data.currentPatient.orderId,
          patientId: data.currentPatient.patientId,
          name: data.currentPatient.patientName,
          queueNumber: data.currentPatient.queueNumber,
          gender: data.currentPatient.gender,
          age: data.currentPatient.age,
          visitTime: data.currentPatient.visitTime,
          passCount: data.currentPatient.passCount,
          status: 'consulting' // 前端状态映射
        }
      } else {
        currentPatient.value = null
      }

      // 3. 映射下一位患者
      if (data.nextPatient) {
        nextPatient.value = {
          orderId: data.nextPatient.orderId,
          patientId: data.nextPatient.patientId,
          name: data.nextPatient.patientName,
          queueNumber: data.nextPatient.queueNumber,
          status: 'waiting'
        }
      } else {
        nextPatient.value = null
      }

      // 4. 映射队列列表（queue + waitlist）
      queueList.value = []
      
      // 将queue和waitlist合并，映射状态
      const allQueue = [...(data.queue || []), ...(data.waitlist || [])]
      
      queueList.value = allQueue.map(item => ({
        orderId: item.orderId,
        patientId: item.patientId,
        name: item.patientName,
        queueNumber: item.queueNumber,
        gender: item.gender,
        age: item.age,
        visitTime: item.visitTime,
        passCount: item.passCount,
        priority: item.priority,
        // 根据实际状态和passCount判断显示状态
        status: item.status === 'completed' ? 'completed' 
              : item.status === 'invalid' ? 'invalid'
              : item.passCount > 0 ? 'passed'
              : 'waiting'
      }))
      
      console.log('✅ 数据映射完成')
      console.log('currentPatient:', currentPatient.value)
      console.log('nextPatient:', nextPatient.value)
      console.log('queueList 长度:', queueList.value.length)
      
      if (!isAuto) hideToast()
      console.log('========== fetchQueueData 成功结束 ==========')
    } else {
      console.error('❌ 接口返回错误 code:', res.code, 'message:', res.message)
      if (!isAuto) error(res.message || '获取数据失败')
    }
  } catch (err) {
    console.error('❌ fetchQueueData 异常:', err)
    if (!isAuto) error('网络异常')
  }
}

// 查看详情
const handleViewDetail = async (patient) => {
  loading('获取详情...')
  try {
    const res = await getPatientDetail(patient.patientId) // 使用 patientId
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
  const content = currentPatient.value 
    ? `确认完成 ${currentPatient.value.name} 的就诊并呼叫下一位？`
    : '确认呼叫下一位患者？'

  uni.showModal({
    title: '确认',
    content: content,
    success: async (res) => {
      if (res.confirm) {
        try {
          loading('处理中...')
          
          // 1. 如果有当前患者，先完成就诊
          if (currentPatient.value) {
            const completeRes = await completeConsultation(currentPatient.value.patientId, scheduleId.value)
            if (completeRes.code !== 0) {
              throw new Error(completeRes.message || '完成就诊失败')
            }
          }

          // 2. 呼叫下一位
          const nextRes = await callNextPatient(scheduleId.value)
          if (nextRes.code === 0) {
            success('操作成功')
            // 刷新数据
            fetchQueueData()
          } else {
            throw new Error(nextRes.message || '呼叫下一位失败')
          }
        } catch (err) {
          console.error(err)
          error(err.message || '操作失败')
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
          loading('处理中...')
          const passRes = await passPatient(patient.orderId) // 使用 orderId
          if (passRes.code === 0) {
            success('已过号')
            fetchQueueData()
          } else {
            error(passRes.message || '操作失败')
          }
        } catch (err) {
          console.error(err)
          error('网络异常')
        }
      }
    }
  })
}

// 提交加号
const handleAddPatient = async (formData) => {
  if (!formData.selectedPatient) {
    return error('请先搜索并选择一位患者')
  }
  
  try {
    loading('提交中...')
    const data = {
      schedule_id: scheduleId.value,
      patient_id: formData.selectedPatient.patient_id,
      priority: formData.position === 'end' ? 1 : 0, // 0 优先，1 普通
      reason: formData.reason || '医生申请加号'
    }
    
    const res = await applyAddPatient(data)
    if (res.code === 0) {
      success('加号申请已提交')
      closeAddPatientModal()
      // 刷新队列数据
      fetchQueueData()
    } else {
      error(res.message || '申请失败')
    }
  } catch (err) {
    console.error(err)
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

const authStore = useAuthStore()

onLoad((options) => {
  console.log('接诊页面 onLoad, options:', options)
  
  // 优先级：URL参数 > Store
  if (options.scheduleId) {
    scheduleId.value = options.scheduleId
    authStore.setScheduleId(options.scheduleId) // 同步到 store
    console.log('从 URL 获取 scheduleId:', scheduleId.value)
  } else if (authStore.scheduleId) {
    scheduleId.value = authStore.scheduleId
    console.log('从 Store 获取 scheduleId:', scheduleId.value)
  } else {
    console.warn('没有 scheduleId，请先在工作台签到')
  }
})

onShow(() => {
  console.log('接诊页面 onShow, 当前 scheduleId:', scheduleId.value)
  
  // 确保使用 Store 中最新的 scheduleId
  if (authStore.scheduleId && !scheduleId.value) {
    scheduleId.value = authStore.scheduleId
    console.log('onShow 从 Store 同步 scheduleId:', scheduleId.value)
  }
  
  // 只有有 scheduleId 时才请求数据
  if (scheduleId.value) {
    console.log('onShow 中准备调用 fetchQueueData')
    fetchQueueData()
    // 开启自动刷新 (每30秒)
    if (!refreshTimer) {
      refreshTimer = setInterval(() => {
        fetchQueueData(true) 
      }, 30000)
    }
  } else {
    console.warn('onShow: 没有 scheduleId，无法获取队列数据')
    // 提示用户先签到
    uni.showModal({
      title: '提示',
      content: '请先在工作台签到后再进入接诊页面',
      showCancel: true,
      cancelText: '留在此页',
      confirmText: '去签到',
      success: (res) => {
        if (res.confirm) {
          uni.switchTab({
            url: '/pages/workbench/workbench'
          })
        }
      }
    })
  }
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
