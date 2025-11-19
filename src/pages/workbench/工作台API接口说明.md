# 工作台模块 API 接口

## 1. 获取工作台数据
**接口**: `GET /workbench/dashboard`

**请求参数**: 无（需要token认证）

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "doctor": {
      "id": "number",
      "name": "string",
      "title": "string",
      "department": "string",
      "photo_path": "string"
    },
    "shiftStatus": {
      "status": "string",  // not_checkin | checked_in | checkout_pending | checked_out
      "currentShift": {
        "id": "number",
        "name": "string",
        "startTime": "string",  // HH:mm
        "endTime": "string",    // HH:mm
        "location": "string",
        "countdown": "string"   // 可选，未签到时显示
      },
      "checkinTime": "string|null",    // HH:mm
      "checkoutTime": "string|null",   // HH:mm
      "workDuration": "string|null",   // 如: "2小时30分钟"
      "timeToCheckout": "string|null"  // 如: "距离下班1小时30分钟"，仅checked_in状态
    },
    "todayData": {
      "pendingConsultation": "number",
      "ongoingConsultation": "number",
      "completedConsultation": "number",
      "totalConsultation": "number"
    },
    "reminders": [
      {
        "id": "number",
        "type": "string",
        "title": "string",
        "icon": "string",
        "time": "string"
      }
    ],
    "recentRecords": [
      {
        "id": "number",
        "patientName": "string",
        "consultationTime": "string",  // HH:mm
        "diagnosis": "string"
      }
    ]
  }
}
```

---

## 2. 签到
**接口**: `POST /workbench/checkin`

**请求参数**:
```json
{
  "shiftId": "number",
  "latitude": "number",
  "longitude": "number"
}
```

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "checkinTime": "string",  // HH:mm
    "status": "checked_in",
    "message": "string",
    "workDuration": "string"  // 初始为"0"
  }
}
```

**失败返回**:
```json
{
  "code": 1,
  "message": "定位不在允许范围内"  // 或其他错误信息
}
```

---

## 3. 签退
**接口**: `POST /workbench/checkout`

**请求参数**:
```json
{
  "shiftId": "number",
  "latitude": "number",
  "longitude": "number"
}
```

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "checkoutTime": "string",  // HH:mm
    "workDuration": "string",  // 如: "3小时47分钟"
    "status": "checked_out",
    "message": "string"
  }
}
```

**失败返回**:
```json
{
  "code": 1,
  "message": "定位不在允许范围内"  // 或其他错误信息
}
```

---

## 4. 获取班次信息
**接口**: `GET /workbench/shifts`

**请求参数**:
- `doctorId`: number (必需)
- `date`: string (可选，格式: YYYY-MM-DD，默认今天)

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "shifts": [
      {
        "id": "number",
        "name": "string",
        "startTime": "string",  // HH:mm
        "endTime": "string",    // HH:mm
        "location": "string",
        "status": "string"      // not_started | checking_in | checkout_pending | checked_out
      }
    ]
  }
}
```

---

## 5. 获取接诊统计
**接口**: `GET /workbench/consultation-stats`

**请求参数**:
- `doctorId`: number (必需)

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "pending": "number",
    "ongoing": "number",
    "completed": "number",
    "total": "number"
  }
}
```
---

## 7. 获取最近接诊记录
**接口**: `GET /workbench/recent-consultations`

**请求参数**:
- `doctorId`: number (必需)
- `limit`: number (可选，默认3)

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "records": [
      {
        "id": "number",
        "patientName": "string",
        "consultationTime": "string",  // HH:mm
        "diagnosis": "string"
      }
    ]
  }
}
```
