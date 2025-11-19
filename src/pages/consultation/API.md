# 接诊模块 API 接口文档

## 1. 获取接诊队列信息

获取当前医生的接诊队列状态，包括统计数据、当前患者、下一位患者和完整队列。

- **接口地址**: `/consultation/queue`
- **请求方式**: `GET`
- **请求参数**: 无

- **响应数据**:
```json
{
  "code": 0,
  "message": {
    "stats": {
      "totalSource": 50,      // 总号源
      "waitingCount": 12,     // 候诊人数
      "completedCount": 15,   // 已就诊人数
      "passedCount": 2        // 过号人数
    },
    "currentPatient": {       // 当前就诊人
      "id": "1001",
      "name": "张三",
      "gender": "男",
      "age": 35,
      "queueNumber": "A016",
      "status": "consulting",
      "visitTime": "2023-10-27 09:30",
      "symptoms": "主诉...",
      "passCount": 0
    },
    "nextPatient": {          // 下一位就诊人
      "id": "1002",
      "name": "李四",
      "queueNumber": "A017",
      "status": "waiting"
    },
    "queue": [                // 完整队列
      {
        "id": "1001",
        "name": "张三",
        "gender": "男",
        "age": 35,
        "queueNumber": "A016",
        "status": "consulting", // waiting, consulting, completed, passed, invalid
        "passCount": 0
      }
      // ...
    ]
  }
}
```

## 2. 获取患者详细信息

- **接口地址**: `/consultation/patient/{patientId}`
- **请求方式**: `GET`
- **请求参数**:
  - `patientId`: 路径参数，患者ID

- **响应数据**:
```json
{
  "code": 0,
  "message": {
    "id": "1001",
    "name": "张三",
    "gender": "男",
    "age": 35,
    "phone": "13800138000",
    "idCard": "110101199001011234",
    "queueNumber": "A016",
    "visitTime": "2023-10-27 09:30",
    "department": "内科",
    "doctor": "王医生",
    "symptoms": "...",
    "history": "...",
    "status": "consulting"
  }
}
```

## 3. 叫下一位（完成当前就诊）

将当前患者标记为完成，并呼叫下一位患者。

- **接口地址**: `/consultation/next`
- **请求方式**: `POST`
- **请求参数**:
```json
{
  "currentPatientId": "1001" // 当前结束就诊的患者ID
}
```

- **响应数据**:
```json
{
  "code": 0,
  "message": "操作成功"
}
```

## 4. 过号操作

将当前患者标记为过号，移至队尾。

- **接口地址**: `/consultation/pass`
- **请求方式**: `POST`
- **请求参数**:
```json
{
  "patientId": "1001"
}
```

- **响应数据**:
```json
{
  "code": 0,
  "message": "操作成功"
}
```

## 5. 申请加号

- **接口地址**: `/consultation/add`
- **请求方式**: `POST`
- **请求参数**:
```json
{
  "name": "王小二",
  "gender": "男",
  "age": 20,
  "phone": "139...",
  "reason": "急诊",
  "position": "end" // end: 队尾, next: 插队到下一位
}
```

- **响应数据**:
```json
{
  "code": 0,
  "message": "操作成功"
}
```
