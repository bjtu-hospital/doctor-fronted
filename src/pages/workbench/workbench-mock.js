// 工作台模块 Mock 数据
// 包含：未签到场景、已签到工作中场景

const mockData = {
  // 场景 1: 未签到
  notCheckinScenario: {
    code: 0,
    message: {
      doctor: {
        id: 1,
        name: '陈明哲',
        title: '教授、主任医师',
        department: '心内科',
        photo_path: '/static/images/doctor/doctor_1.jpg'
      },
      shiftStatus: {
        status: 'not_checkin', // 未签到
        currentShift: {
          id: 1,
          name: '上午门诊',
          startTime: '08:30',
          endTime: '12:00',
          location: '门诊 3 诊室',
          countdown: '距离开始还有 15 分钟'
        },
        checkinTime: null,
        checkoutTime: null,
        workDuration: null
      },
      todayData: {
        pendingConsultation: 3,
        ongoingConsultation: 2,
        completedConsultation: 15,
        totalConsultation: 20
      },
      reminders: [
        {
          id: 1,
          type: 'patient_arrival',
          title: '3 位患者即将到达',
          icon: '🚨',
          time: '10:30'
        },
        {
          id: 2,
          type: 'meeting',
          title: '医学讨论会',
          icon: '📅',
          time: '14:00'
        }
      ],
      recentRecords: [
        {
          id: 1,
          patientName: '李明',
          consultationTime: '09:30',
          diagnosis: '高血压，需控制饮食'
        },
        {
          id: 2,
          patientName: '王芳',
          consultationTime: '09:50',
          diagnosis: '心律不齐，建议复查'
        },
        {
          id: 3,
          patientName: '张三',
          consultationTime: '10:15',
          diagnosis: '心力衰竭，需加强监测'
        }
      ]
    }
  },

  // 场景 2: 已签到工作中
  checkedInScenario: {
    code: 0,
    message: {
      doctor: {
        id: 1,
        name: '陈明哲',
        title: '教授、主任医师',
        department: '心内科',
        photo_path: '/static/images/doctor/doctor_1.jpg'
      },
      shiftStatus: {
        status: 'checked_in', // 已签到
        currentShift: {
          id: 1,
          name: '上午门诊',
          startTime: '08:30',
          endTime: '12:00',
          location: '门诊 3 诊室'
        },
        checkinTime: '08:28',
        checkoutTime: null,
        workDuration: '2小时 30 分钟',
        timeToCheckout: '距离下班 1小时 30 分钟'
      },
      todayData: {
        pendingConsultation: 5,
        ongoingConsultation: 3,
        completedConsultation: 8,
        totalConsultation: 16
      },
      reminders: [
        {
          id: 1,
          type: 'patient_arrival',
          title: '5 位患者在等待',
          icon: '⏳',
          time: '当前'
        }
      ],
      recentRecords: [
        {
          id: 1,
          patientName: '李明',
          consultationTime: '09:30',
          diagnosis: '高血压，需控制饮食'
        },
        {
          id: 2,
          patientName: '王芳',
          consultationTime: '09:50',
          diagnosis: '心律不齐，建议复查'
        },
        {
          id: 3,
          patientName: '张三',
          consultationTime: '10:15',
          diagnosis: '心力衰竭，需加强监测'
        }
      ]
    }
  },

  // 场景 3: 工作结束待签退
  checkoutPendingScenario: {
    code: 0,
    message: {
      doctor: {
        id: 1,
        name: '陈明哲',
        title: '教授、主任医师',
        department: '心内科',
        photo_path: '/static/images/doctor/doctor_1.jpg'
      },
      shiftStatus: {
        status: 'checkout_pending', // 待签退
        currentShift: {
          id: 1,
          name: '上午门诊',
          startTime: '08:30',
          endTime: '12:00',
          location: '门诊 3 诊室'
        },
        checkinTime: '08:28',
        checkoutTime: null,
        workDuration: '3小时 47 分钟'
      },
      todayData: {
        pendingConsultation: 0,
        ongoingConsultation: 0,
        completedConsultation: 18,
        totalConsultation: 18
      },
      reminders: [],
      recentRecords: [
        {
          id: 1,
          patientName: '李明',
          consultationTime: '09:30',
          diagnosis: '高血压，需控制饮食'
        },
        {
          id: 2,
          patientName: '王芳',
          consultationTime: '09:50',
          diagnosis: '心律不齐，建议复查'
        },
        {
          id: 3,
          patientName: '张三',
          consultationTime: '10:15',
          diagnosis: '心力衰竭，需加强监测'
        }
      ]
    }
  },

  // 场景 4: 已签退
  checkedOutScenario: {
    code: 0,
    message: {
      doctor: {
        id: 1,
        name: '陈明哲',
        title: '教授、主任医师',
        department: '心内科',
        photo_path: '/static/images/doctor/doctor_1.jpg'
      },
      shiftStatus: {
        status: 'checked_out', // 已签退
        currentShift: {
          id: 1,
          name: '上午门诊',
          startTime: '08:30',
          endTime: '12:00',
          location: '门诊 3 诊室'
        },
        checkinTime: '08:28',
        checkoutTime: '12:15',
        workDuration: '3小时 47 分钟'
      },
      todayData: {
        pendingConsultation: 0,
        ongoingConsultation: 0,
        completedConsultation: 18,
        totalConsultation: 18
      },
      reminders: [],
      recentRecords: [
        {
          id: 1,
          patientName: '李明',
          consultationTime: '09:30',
          diagnosis: '高血压，需控制饮食'
        },
        {
          id: 2,
          patientName: '王芳',
          consultationTime: '09:50',
          diagnosis: '心律不齐，建议复查'
        },
        {
          id: 3,
          patientName: '张三',
          consultationTime: '10:15',
          diagnosis: '心力衰竭，需加强监测'
        }
      ]
    }
  }
}

// API 调用模拟函数
export const workbenchAPI = {
  /**
   * 获取工作台首页数据
   * @param {string} scenario - 场景：'notCheckin' | 'checkedIn' | 'checkoutPending'
   * @returns {Promise}
   */
  getDashboard(scenario = 'notCheckin') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scenarioMap = {
          notCheckin: mockData.notCheckinScenario,
          checkedIn: mockData.checkedInScenario,
          checkoutPending: mockData.checkoutPendingScenario,
          checkedOut: mockData.checkedOutScenario
        }
        resolve(scenarioMap[scenario] || mockData.notCheckinScenario)
      }, 300)
    })
  },

  /**
   * 签到
   * @param {Object} params - { latitude, longitude, shiftId }
   * @returns {Promise}
   */
  checkin(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: {
            checkinTime: '08:28',
            status: 'checked_in',
            message: '签到成功',
            workDuration: '0'
          }
        })
      }, 800)
    })
  },

  /**
   * 签退
   * @param {Object} params - { latitude, longitude, shiftId }
   * @returns {Promise}
   */
  checkout(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: {
            checkoutTime: '12:15',
            workDuration: '3小时47分钟',
            status: 'checked_out',
            message: '签退成功'
          }
        })
      }, 800)
    })
  },

  /**
   * 获取班次信息
   * @param {Object} params - { doctorId, date }
   * @returns {Promise}
   */
  getShifts(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: {
            shifts: [
              {
                id: 1,
                name: '上午门诊',
                startTime: '08:30',
                endTime: '12:00',
                location: '门诊 3 诊室',
                status: 'not_started'
              },
              {
                id: 2,
                name: '下午门诊',
                startTime: '14:00',
                endTime: '17:30',
                location: '门诊 5 诊室',
                status: 'not_started'
              }
            ]
          }
        })
      }, 300)
    })
  },

  /**
   * 获取接诊统计
   * @param {Object} params - { doctorId }
   * @returns {Promise}
   */
  getConsultationStats(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: {
            pending: 3,
            ongoing: 2,
            completed: 15,
            total: 20
          }
        })
      }, 300)
    })
  },

  /**
   * 获取待办提醒
   * @param {Object} params - { doctorId }
   * @returns {Promise}
   */
  getReminders(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: {
            reminders: [
              {
                id: 1,
                type: 'patient_arrival',
                title: '3 位患者即将到达',
                icon: '🚨',
                time: '10:30'
              }
            ]
          }
        })
      }, 300)
    })
  },

  /**
   * 获取最近接诊记录
   * @param {Object} params - { doctorId, limit }
   * @returns {Promise}
   */
  getRecentConsultations(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: {
            records: [
              {
                id: 1,
                patientName: '李明',
                consultationTime: '09:30',
                diagnosis: '高血压，需控制饮食'
              },
              {
                id: 2,
                patientName: '王芳',
                consultationTime: '09:50',
                diagnosis: '心律不齐，建议复查'
              }
            ]
          }
        })
      }, 300)
    })
  }
}

export default mockData
