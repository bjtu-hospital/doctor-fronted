/**
 * 排班页面 Mock 数据
 * 包含医生在指定日期范围内的所有排班信息
 */

/**
 * 生成模拟排班数据
 * @param {string} doctorId - 医生ID
 * @param {number} weekOffset - 周偏移量（0=当前周，1=下一周，-1=上一周）
 * @returns {Promise} 返回排班数据
 */
export function mockGetSchedules(doctorId, weekOffset = 0) {
  const today = new Date()
  const startOfWeek = new Date(today)
  const day = today.getDay() || 7
  startOfWeek.setDate(today.getDate() - day + 1 + weekOffset * 7)
  
  const schedules = []
  const clinics = [
    { id: 56, name: '心血管科门诊', type: 0, slotType: '专家', price: 100.0, totalSlots: 15 },
    { id: 55, name: '心血管内科门诊（国疗）', type: 1, slotType: '专家', price: 2000.0, totalSlots: 8 },
    { id: 57, name: '心血管科门诊（特需）', type: 2, slotType: '特需', price: 500.0, totalSlots: 15 }
  ]
  
  const timeSections = ['上午', '下午', '晚上']
  
  let scheduleId = 5667
  
  // 生成7天的数据
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek)
    currentDate.setDate(startOfWeek.getDate() + i)
    
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayNum = String(currentDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayNum}`
    const weekDay = currentDate.getDay() || 7
    
    // 周一至周五排班
    if (weekDay >= 1 && weekDay <= 5) {
      // 上午班次 - 每天都有
      const morningClinic = clinics[i % 3]
      schedules.push({
        schedule_id: scheduleId++,
        doctor_id: parseInt(doctorId) || 6,
        doctor_name: '高炜',
        clinic_id: morningClinic.id,
        clinic_name: morningClinic.name,
        clinic_type: morningClinic.type,
        date: dateStr,
        week_day: weekDay,
        time_section: '上午',
        slot_type: morningClinic.slotType,
        total_slots: morningClinic.totalSlots,
        remaining_slots: morningClinic.totalSlots - (i * 2),
        status: '正常',
        price: morningClinic.price
      })
      
      // 下午班次 - 周三下午休息，其他时间有
      if (weekDay !== 3) {
        const afternoonClinic = clinics[(i + 1) % 3]
        schedules.push({
          schedule_id: scheduleId++,
          doctor_id: parseInt(doctorId) || 6,
          doctor_name: '高炜',
          clinic_id: afternoonClinic.id,
          clinic_name: afternoonClinic.name,
          clinic_type: afternoonClinic.type,
          date: dateStr,
          week_day: weekDay,
          time_section: '下午',
          slot_type: afternoonClinic.slotType,
          total_slots: afternoonClinic.totalSlots,
          remaining_slots: afternoonClinic.totalSlots - (i + 3),
          status: '正常',
          price: afternoonClinic.price
        })
      }
      
      // 晚上班次 - 周二、周四有
      if (weekDay === 2 || weekDay === 4) {
        schedules.push({
          schedule_id: scheduleId++,
          doctor_id: parseInt(doctorId) || 6,
          doctor_name: '高炜',
          clinic_id: 58,
          clinic_name: '急诊科',
          clinic_type: 0,
          date: dateStr,
          week_day: weekDay,
          time_section: '晚上',
          slot_type: '普通',
          total_slots: 10,
          remaining_slots: 8,
          status: '正常',
          price: 50.0
        })
      }
    }
  }

  return Promise.resolve({
    code: 0,
    message: {
      schedules
    }
  })
}

/**
 * 获取指定周的排班数据（别名函数，向后兼容）
 * @param {string} doctorId - 医生ID
 * @param {number} weekOffset - 周偏移量（0=当前周，1=下一周，-1=上一周）
 * @returns {Promise} 返回排班数据
 */
export function mockGetWeekSchedules(doctorId, weekOffset = 0) {
  return mockGetSchedules(doctorId, weekOffset)
}
