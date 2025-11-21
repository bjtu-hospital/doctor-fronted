// 接诊页面 Mock：纯内存数据，刷新即重置
function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// 初始数据
const initialData = {
    stats: {
        totalSlots: 3,
        confirmedCount: 3,
        waitlistCount: 0,
        completedCount: 0,
        waitingCount: 3,
        passedCount: 0
    },
    scheduleInfo: {
        scheduleId: 2971,
        doctorId: 100,
        doctorName: '于博',
        date: '2025-11-21',
        timeSection: '上午'
    },
    currentPatient: null,
    nextPatient: null,
    // 候诊队列 (未过号)
    queue: [
        { orderId: 301, patientId: 3001, patientName: '测试用户11', gender: '男', age: 25, queueNumber: 'A011', status: 'confirmed', isCall: false, visitTime: '09:00', passCount: 0, priority: 0 },
        { orderId: 302, patientId: 3002, patientName: '测试用户12', gender: '女', age: 30, queueNumber: 'A012', status: 'confirmed', isCall: false, visitTime: '09:15', passCount: 0, priority: 0 },
        { orderId: 303, patientId: 3003, patientName: '测试用户13', gender: '男', age: 40, queueNumber: 'A013', status: 'confirmed', isCall: false, visitTime: '09:30', passCount: 0, priority: 0 },
    ],
    // 过号队列 (过号1次)
    waitlist: [],
    // 已完成队列
    completedList: [],
    // 作废队列 (过号2次)
    invalidList: [],
    // 详情数据
    details: {
        '3001': { patientId: 3001, name: '测试用户11', gender: '男', age: 25, phone: '13800000011', idCard: '110101199901011011', queueNumber: 'A011', visitTime: '2025-11-21 09:00', department: '内科', doctor: '于博', symptoms: '头痛，发热2天', history: '无既往病史', status: 'confirmed' },
        '3002': { patientId: 3002, name: '测试用户12', gender: '女', age: 30, phone: '13800000012', idCard: '110101199601011002', queueNumber: 'A012', visitTime: '2025-11-21 09:15', department: '内科', doctor: '于博', symptoms: '咽喉疼痛', history: '无', status: 'confirmed' },
        '3003': { patientId: 3003, name: '测试用户13', gender: '男', age: 40, phone: '13800000013', idCard: '110101197901011003', queueNumber: 'A013', visitTime: '2025-11-21 09:30', department: '内科', doctor: '于博', symptoms: '腹部不适', history: '慢性胃炎', status: 'confirmed' },
    }
}

// 当前内存数据
let mockData = clone(initialData)

// 更新统计信息和下一位患者
function updateState() {
    // 更新统计
    mockData.stats.waitingCount = mockData.queue.length
    mockData.stats.waitlistCount = mockData.waitlist.length
    mockData.stats.completedCount = mockData.completedList.length
    mockData.stats.passedCount = mockData.waitlist.length
    mockData.stats.confirmedCount = mockData.queue.length + mockData.waitlist.length + mockData.completedList.length + (mockData.currentPatient ? 1 : 0)

    // 更新下一位 (优先从正常队列取，然后是过号队列)
    if (mockData.queue.length > 0) {
        mockData.nextPatient = clone(mockData.queue[0])
    } else if (mockData.waitlist.length > 0) {
        mockData.nextPatient = clone(mockData.waitlist[0])
    } else {
        mockData.nextPatient = null
    }
}

// 初始化状态
updateState()

// 重置数据
export function resetMockData() {
    mockData = clone(initialData)
    updateState()
    return mockData
}

// 获取队列数据
export function mockGetInitialData() {
    updateState()
    return Promise.resolve({
        code: 0,
        message: clone(mockData)
    })
}

// 获取患者详情
export function mockGetPatientDetail(patientId) {
    const detail = mockData.details[patientId]
    if (!detail) return Promise.resolve({ code: 404, message: '未找到患者' })
    return Promise.resolve({ code: 0, message: clone(detail) })
}

// 呼叫下一位
export function mockCallNextPatient() {
    // 1. 如果有当前患者，将其移入已完成
    if (mockData.currentPatient) {
        const completed = mockData.currentPatient
        completed.status = 'completed'
        completed.isCall = false
        mockData.completedList.unshift(completed) // 最新完成的在最前
        mockData.currentPatient = null
    }

    // 2. 取出下一位
    let next = null
    if (mockData.queue.length > 0) {
        next = mockData.queue.shift()
    } else if (mockData.waitlist.length > 0) {
        next = mockData.waitlist.shift()
    }

    if (next) {
        next.status = 'consulting'
        next.isCall = true
        next.callTime = new Date().toLocaleString()
        mockData.currentPatient = next
    }

    updateState()
    return Promise.resolve({ code: 0, message: '呼叫成功' })
}

// 过号
export function mockPassPatient(orderId) {
    let patient = null

    // 查找患者 (可能在当前就诊，也可能在队列中)
    if (mockData.currentPatient?.orderId === orderId) {
        patient = mockData.currentPatient
        mockData.currentPatient = null
    } else {
        // 检查正常队列
        const qIdx = mockData.queue.findIndex(p => p.orderId === orderId)
        if (qIdx !== -1) {
            patient = mockData.queue[qIdx]
            mockData.queue.splice(qIdx, 1)
        } else {
            // 检查过号队列
            const wIdx = mockData.waitlist.findIndex(p => p.orderId === orderId)
            if (wIdx !== -1) {
                patient = mockData.waitlist[wIdx]
                mockData.waitlist.splice(wIdx, 1)
            }
        }
    }

    if (!patient) return Promise.resolve({ code: 404, message: '未找到该患者' })

    // 业务逻辑：
    // 第一次过号 (passCount 0 -> 1): 放入过号队列(waitlist)队尾
    // 第二次过号 (passCount >= 1): 作废，放入 invalidList

    if (patient.passCount === 0) {
        patient.passCount = 1
        patient.status = 'passed' // 标记为过号状态
        patient.isCall = false
        mockData.waitlist.push(patient)
        updateState()
        return Promise.resolve({ code: 0, message: '已过号，移至队尾' })
    } else {
        patient.passCount++
        patient.status = 'invalid'
        patient.isCall = false
        mockData.invalidList.unshift(patient)
        updateState()
        return Promise.resolve({ code: 0, message: '二次过号，资格已取消' })
    }
}

// 完成就诊
export function mockCompleteConsultation(patientId) {
    if (mockData.currentPatient?.patientId === patientId) {
        const completed = mockData.currentPatient
        completed.status = 'completed'
        completed.isCall = false
        mockData.completedList.unshift(completed)
        mockData.currentPatient = null

        updateState()
        return Promise.resolve({ code: 0, message: '就诊完成' })
    }
    return Promise.resolve({ code: 404, message: '未找到该患者' })
}

// 申请加号
export function mockApplyAddPatient(data) {
    const newOrderId = 300 + Object.keys(mockData.details).length
    const newPatient = {
        orderId: newOrderId,
        patientId: data.patient_id,
        patientName: `测试用户${String(newOrderId).slice(-2)}`,
        gender: '男',
        age: 30,
        queueNumber: `A${String(newOrderId).slice(-3).padStart(3, '0')}`,
        status: 'confirmed',
        isCall: false,
        callTime: null,
        visitTime: new Date().toLocaleString(),
        passCount: 0,
        priority: data.priority || 1
    }

    // 补充详情
    mockData.details[data.patient_id] = {
        ...newPatient,
        name: newPatient.patientName,
        phone: '13800000000',
        idCard: '110101199001010000',
        department: '内科',
        doctor: '于博',
        symptoms: data.reason,
        history: '无'
    }

    if (data.priority === 0) {
        mockData.queue.unshift(newPatient)
    } else {
        mockData.queue.push(newPatient)
    }

    updateState()
    return Promise.resolve({ code: 0, message: '加号成功' })
}

// 搜索患者
export function mockSearchPatients(params) {
    const allPatients = [
        { patient_id: 3001, name: '测试用户11', phone: '13800000011', gender: '男', age: 25, id_card: '110101199901011011' },
        { patient_id: 3002, name: '测试用户12', phone: '13800000012', gender: '女', age: 30, id_card: '110101199401011012' },
        { patient_id: 3003, name: '测试用户13', phone: '13800000013', gender: '男', age: 40, id_card: '110101198401011013' },
        { patient_id: 3004, name: '测试用户14', phone: '13800000014', gender: '女', age: 35, id_card: '110101198901011014' },
        { patient_id: 3005, name: '测试用户15', phone: '13800000015', gender: '男', age: 50, id_card: '110101197401011015' },
        { patient_id: 3006, name: '测试用户16', phone: '13800000016', gender: '女', age: 28, id_card: '110101199601011016' },
        { patient_id: 3007, name: '测试用户17', phone: '13800000017', gender: '男', age: 33, id_card: '110101199101011017' },
        { patient_id: 3008, name: '测试用户18', phone: '13800000018', gender: '女', age: 42, id_card: '110101198201011018' },
    ];

    // 根据关键词过滤患者
    let filteredPatients = allPatients;
    if (params.name && params.name.trim()) {
        const keyword = params.name.trim().toLowerCase();
        filteredPatients = allPatients.filter(p => {
            return p.name.toLowerCase().includes(keyword) ||
                (p.phone && p.phone.includes(keyword));
        });
    }

    return {
        code: 0,
        message: {
            patients: filteredPatients
        }
    };
}
