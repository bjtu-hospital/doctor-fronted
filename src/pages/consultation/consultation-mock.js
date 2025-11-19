// 接诊页面 Mock 数据

export const mockQueueData = {
    code: 0,
    message: {
        stats: {
            totalSource: 50, // 总号源
            waitingCount: 12, // 候诊人数
            completedCount: 15, // 已就诊人数
            passedCount: 2 // 过号人数
        },
        currentPatient: {
            id: '1001',
            name: '张三',
            gender: '男',
            age: 35,
            queueNumber: 'A016',
            status: 'consulting', // consulting
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
            { id: '1006', name: '孙八', gender: '女', age: 25, queueNumber: 'A010', status: 'passed', passCount: 1 }, // 过号
            { id: '1007', name: '周九', gender: '男', age: 30, queueNumber: 'A005', status: 'passed', passCount: 2 }, // 过号>=2
        ]
    }
}

export const mockPatientDetailData = {
    code: 0,
    message: {
        id: '1001',
        name: '张三',
        gender: '男',
        age: 35,
        phone: '13800138000',
        idCard: '110101199001011234',
        queueNumber: 'A016',
        visitTime: '2023-10-27 09:30',
        department: '内科',
        doctor: '王医生',
        symptoms: '头痛，发热3天，伴有咳嗽。体温最高38.5℃。',
        history: '无既往病史，无药物过敏史。',
        status: 'consulting'
    }
}

export const mockOperationResult = {
    code: 0,
    message: '操作成功'
}
