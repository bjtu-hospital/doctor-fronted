// 接诊页面 Mock：仅提供初始静态数据
function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// 初始数据（种子）
const seed = {
    stats: {
        totalSource: 50,
        waitingCount: 4,
        completedCount: 15,
        passedCount: 2
    },
    currentPatient: {
        id: '1001',
        name: '张三',
        gender: '男',
        age: 35,
        queueNumber: 'A016',
        status: 'consulting',
        visitTime: '2023-10-27 09:30',
        symptoms: '头痛，发热3天，伴有咳嗽。',
        history: '无既往病史',
        passCount: 0
    },
    nextPatient: {
        id: '1002',
        name: '李四',
        queueNumber: 'A017',
        status: 'waiting'
    },
    queue: [
        { id: '1001', name: '张三', gender: '男', age: 35, queueNumber: 'A016', status: 'consulting', passCount: 0 },
        { id: '1002', name: '李四', gender: '女', age: 28, queueNumber: 'A017', status: 'waiting', passCount: 0 },
        { id: '1003', name: '王五', gender: '男', age: 45, queueNumber: 'A018', status: 'waiting', passCount: 0 },
        { id: '1004', name: '赵六', gender: '女', age: 62, queueNumber: 'A019', status: 'waiting', passCount: 0 },
        { id: '1005', name: '钱七', gender: '男', age: 18, queueNumber: 'A020', status: 'waiting', passCount: 0 },
        { id: '1006', name: '孙八', gender: '女', age: 25, queueNumber: 'A010', status: 'passed', passCount: 1 },
        { id: '1007', name: '周九', gender: '男', age: 30, queueNumber: 'A005', status: 'passed', passCount: 1 },
    ],
    // 详情数据可以单独提供
    details: {
        '1001': { id: '1001', name: '张三', gender: '男', age: 35, phone: '13800138000', idCard: '110101199001011234', queueNumber: 'A016', visitTime: '2023-10-27 09:30', department: '内科', doctor: '王医生', symptoms: '头痛，发热3天，伴有咳嗽。', history: '无既往病史', status: 'consulting' },
        '1002': { id: '1002', name: '李四', gender: '女', age: 28, phone: '13800138001', idCard: '110101199001011235', queueNumber: 'A017', visitTime: '2023-10-27 09:45', department: '内科', doctor: '王医生', symptoms: '腹泻', history: '无', status: 'waiting' },
        '1003': { id: '1003', name: '王五', gender: '男', age: 45, phone: '13800138002', idCard: '110101199001011236', queueNumber: 'A018', visitTime: '2023-10-27 10:00', department: '内科', doctor: '王医生', symptoms: '皮肤瘙痒', history: '过敏史', status: 'waiting' },
    }
}

// 对外导出：查询
export function mockGetInitialData() {
    return Promise.resolve({
        code: 0, message: clone(seed)
    })
}

export function mockGetPatientDetail(patientId) {
    const detail = seed.details[patientId] || seed.queue.find(p => p.id === patientId)
    if (!detail) return Promise.resolve({ code: 404, message: '未找到患者' })

    // 模拟返回一个完整的详情对象
    const fullDetail = {
        ...seed.details['1001'], // 使用一个模板
        ...detail
    }

    return Promise.resolve({
        code: 0, message: clone(fullDetail)
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
