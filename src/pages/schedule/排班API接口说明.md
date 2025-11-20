# 排班管理模块 API 接口文档

## 1. 获取医生排班列表

获取指定医生在日期范围内的所有排班。

- **接口地址**: `/schedule/doctors/{doctor_id}/schedules`
- **请求方式**: `GET`
- **请求参数**:
  - `doctor_id`: 路径参数，医生ID
  - `start_date`: 查询参数，开始日期 (格式: YYYY-MM-DD)
  - `end_date`: 查询参数，结束日期 (格式: YYYY-MM-DD)

- **响应数据**:
```json
{
  "code": 0,
  "message": {
    "doctorId": "10001",
    "startDate": "2025-11-17",
    "endDate": "2025-11-23",
    "schedules": [
      {
        "id": 1,
        "date": "2025-11-17",
        "dayOfWeek": "一",
        "shifts": [
          {
            "id": 101,
            "name": "上午门诊",
            "period": "morning",      // morning: 上午, afternoon: 下午, night: 晚上
            "startTime": "08:00",
            "endTime": "11:30",
            "location": "门诊 3 诊室",
            "department": "心内科",
            "status": "scheduled",    // scheduled: 正常, completed: 已结束, cancelled: 停诊
            "capacity": 30,           // 总号源
            "registered": 15,         // 已挂号
            "consultationCount": 5    // 已就诊
          }
        ]
      }
      // ... 更多日期数据
    ]
  }
}
```

## 2. 获取排班详情

获取单个排班班次的详细统计信息。

- **接口地址**: `/schedule/shifts/{shift_id}`
- **请求方式**: `GET`
- **请求参数**:
  - `shift_id`: 路径参数，排班班次ID

- **响应数据**:
```json
{
  "code": 0,
  "message": {
    "id": 101,
    "name": "上午门诊",
    "date": "2025-11-17",
    "period": "morning",
    "startTime": "08:00",
    "endTime": "11:30",
    "location": "门诊 3 诊室",
    "department": "心内科",
    "status": "scheduled",
    "stats": {
      "totalSource": 30,
      "usedSource": 15,
      "remainingSource": 15,
      "consultationRate": "33%"
    }
  }
}
```

