// 接诊页面 Mock：仅提供初始静态数据
function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// 初始数据（种子）- 匹配真实后端API结构
const seed = {
    stats: {
        totalSlots: 50,
        confirmedCount: 30,
        waitlistCount: 5,
        completedCount: 15,
        waitingCount: 4,
        passedCount: 2
    },
    scheduleInfo: {
        scheduleId: 5669,
        doctorId: 6,
        date: '2025-11-21',
        timeSection: '上午'
    },
    currentPatient: {
        orderId: 101,
        patientId: 1001,
        patientName: '张三',
        gender: '男',
        age: 35,
        queueNumber: 'A016',
        status: 'confirmed',
        isCall: true,
        callTime: '2025-11-21 09:30:00',
        visitTime: '2025-11-21 09:30',
        passCount: 0,
        priority: 0
    },
    nextPatient: {
        orderId: 102,
        patientId: 1002,
        patientName: '李四',
        gender: '女',
        age: 28,
        queueNumber: 'A017',
        status: 'confirmed',
        isCall: false,
        callTime: null,
        visitTime: '2025-11-21 09:45',
        passCount: 0,
        priority: 0
    },
    queue: [
        { orderId: 103, patientId: 1003, patientName: '王五', gender: '男', age: 45, queueNumber: 'A018', status: 'confirmed', isCall: false, callTime: null, visitTime: '2025-11-21 10:00', passCount: 0, priority: 0 },
        { orderId: 104, patientId: 1004, patientName: '赵六', gender: '女', age: 62, queueNumber: 'A019', status: 'confirmed', isCall: false, callTime: null, visitTime: '2025-11-21 10:15', passCount: 0, priority: 0 },
        { orderId: 105, patientId: 1005, patientName: '钱七', gender: '男', age: 18, queueNumber: 'A020', status: 'confirmed', isCall: false, callTime: null, visitTime: '2025-11-21 10:30', passCount: 0, priority: 0 },
    ],
    waitlist: [
        { orderId: 106, patientId: 1006, patientName: '孙八', gender: '女', age: 25, queueNumber: 'A010', status: 'confirmed', isCall: false, callTime: null, visitTime: '2025-11-21 10:45', passCount: 1, priority: 1 },
        { orderId: 107, patientId: 1007, patientName: '周九', gender: '男', age: 30, queueNumber: 'A005', status: 'confirmed', isCall: false, callTime: null, visitTime: '2025-11-21 11:00', passCount: 1, priority: 1 },
    ],
    // 详情数据可以单独提供
    details: {
        '1001': { patientId: 1001, name: '张三', gender: '男', age: 35, phone: '13800138000', idCard: '110101199001011234', queueNumber: 'A016', visitTime: '2025-11-21 09:30', department: '内科', doctor: '王医生', symptoms: '头痛，发热3天，伴有咳嗽。', history: '无既往病史', status: 'confirmed' },
        '1002': { patientId: 1002, name: '李四', gender: '女', age: 28, phone: '13800138001', idCard: '110101199001011235', queueNumber: 'A017', visitTime: '2025-11-21 09:45', department: '内科', doctor: '王医生', symptoms: '腹泻', history: '无', status: 'confirmed' },
        '1003': { patientId: 1003, name: '王五', gender: '男', age: 45, phone: '13800138002', idCard: '110101199001011236', queueNumber: 'A018', visitTime: '2025-11-21 10:00', department: '内科', doctor: '王医生', symptoms: '皮肤瘙痒', history: '过敏史', status: 'confirmed' },
    }
}

// 对外导出：查询
export function mockGetInitialData() {
    return Promise.resolve({
        code: 0, message: clone(seed)
    })
}

export function mockGetPatientDetail(patientId) {
    const detail = seed.details[patientId]
    if (!detail) return Promise.resolve({ code: 404, message: '未找到患者' })

    return Promise.resolve({
        code: 0, message: clone(detail)
    })
}

export function mockSearchPatients(params) {
    const allPatients = [
        {
            "patient_id": 12345,
            "name": "王小明",
            "phone": "13812345678",
            "gender": "男",
            "age": 28,
            "id_card": "110101199501011234"
        },
        {
            "patient_id": 12346,
            "name": "王丽",
            "phone": "13898765432",
            "gender": "女",
            "age": 32,
            "id_card": "110102198901012345"
        },
        {
            "patient_id": 12347,
            "name": "张伟",
            "phone": "13912345678",
            "gender": "男",
            "age": 45,
            "id_card": "110103197801011234"
        },
        {
            "patient_id": 12348,
            "name": "李娜",
            "phone": "13712345678",
            "gender": "女",
            "age": 50,
            "id_card": "110104197301011234"
        },
        {
            "patient_id": 12349,
            "name": "刘强",
            "phone": "13612345678",
            "gender": "男",
            "age": 35,
            "id_card": "110105198801011234"
        }
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
