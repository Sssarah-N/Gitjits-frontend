---
name: ""
overview: ""
todos: []
isProject: false
---

# Park Detail Editor - Implementation Plan

## Overview

扩展 Admin Dashboard 的 Park 编辑功能，支持编辑完整的公园详情（电话、地址、营业时间等）以及图片上传。

## Current State

- AdminDashboard 已有基础编辑功能（name, park_code, description）
- 后端 Park 数据结构已包含完整字段：
  - 基本信息：name, full_name, park_code, state_code, designation
  - 位置：latitude, longitude, addresses
  - 联系方式：contacts (phone, email)
  - 详情：description, directions_info, directions_url, url
  - 媒体：images (url, title, caption)
  - 运营：operating_hours, activities, weather_info

---

## Phase 1: Expand Park Edit Form (Frontend Only)

**目标：** 让管理员能编辑更多 Park 字段

### To-Do

- **[expand-form]** 扩展 Park 编辑表单
  - 添加以下字段的编辑能力：
    - `full_name` (完整名称)
    - `designation` (类型，如 National Park, National Monument)
    - `url` (官方网站)
    - `latitude` / `longitude` (坐标)
    - `directions_info` / `directions_url` (方向指引)
    - `weather_info` (天气信息)
- **[contacts-editor]** 添加联系方式编辑器
  - contacts 是对象数组：`[{phone_number, email_address, type}]`
  - UI：可增删的联系方式列表
  - 字段：电话号码、邮箱、类型（Visitor Center, Headquarters 等）
- **[addresses-editor]** 添加地址编辑器
  - addresses 是对象数组：`[{line1, line2, city, state_code, postal_code, type}]`
  - UI：物理地址 + 邮寄地址
- **[hours-editor]** 添加营业时间编辑器
  - operating_hours 是复杂对象
  - 简化版：文本区域输入 JSON 或纯文本描述
- **[activities-editor]** 添加活动编辑器
  - activities 是字符串数组
  - UI：tag 输入或 checkbox 列表（从现有活动列表选择）

---

## Phase 2: Image Management

**目标：** 支持查看、编辑、上传公园图片

### Option A: URL-Based (简单方案)

只编辑图片 URL，不实际上传文件

#### To-Do

- **[images-url-editor]** 图片 URL 编辑器
  - images 是对象数组：`[{url, title, caption, credit, altText}]`
  - UI：可增删的图片列表
  - 每项包含：URL 输入框、标题、描述、图片预览

### Option B: File Upload (完整方案)

支持实际文件上传到云存储

#### Backend To-Do

- **[backend-upload-endpoint]** 创建图片上传 API
  - `POST /parks/<park_code>/images` - 上传图片
  - `DELETE /parks/<park_code>/images/<image_id>` - 删除图片
  - 使用 Cloudinary / AWS S3 / 本地存储
- **[backend-upload-config]** 配置云存储
  - 选择存储方案（推荐 Cloudinary - 免费额度足够）
  - 设置环境变量
  - 安装依赖 (cloudinary / boto3)

#### Frontend To-Do

- **[frontend-upload-ui]** 创建图片上传组件
  - 拖拽上传 / 点击选择
  - 上传进度显示
  - 图片预览
  - 删除功能
- **[frontend-image-gallery]** 图片管理画廊
  - 显示所有现有图片
  - 编辑 title, caption
  - 设置封面图
  - 拖拽排序

---

## Phase 3: UX Improvements

**目标：** 提升编辑体验

### To-Do

- **[detail-edit-page]** 创建独立的 Park 详情编辑页面
  - 路由：`/admin/parks/:parkCode/edit`
  - 分区显示：基本信息、联系方式、地址、图片等
  - 比 modal 更适合复杂编辑
- **[form-validation]** 添加表单验证
  - 必填字段提示
  - URL 格式验证
  - 坐标范围验证
- **[auto-save]** 自动保存草稿
  - localStorage 暂存
  - 未保存提示
- **[change-preview]** 变更预览
  - 保存前显示将要改变的内容
  - diff 视图

---

## Recommended Implementation Order

### MVP (最小可用版本)

1. `expand-form` - 扩展基本字段
2. `contacts-editor` - 联系方式（用户最常需要改的）
3. `images-url-editor` - 图片 URL 编辑（不需要后端改动）

### Full Version

1. `addresses-editor`
2. `activities-editor`
3. `hours-editor`
4. `detail-edit-page`
5. `backend-upload-endpoint` + `frontend-upload-ui` (如果需要真正上传)

---

## Technical Notes

### Park 数据结构示例

```json
{
  "_id": "...",
  "name": "Yellowstone",
  "full_name": "Yellowstone National Park",
  "park_code": "yell",
  "state_code": ["WY", "MT", "ID"],
  "designation": "National Park",
  "description": "...",
  "latitude": 44.59824417,
  "longitude": -110.5471695,
  "url": "https://www.nps.gov/yell",
  "contacts": {
    "phone_numbers": [
      {"phone_number": "307-344-7381", "type": "Voice"}
    ],
    "email_addresses": [
      {"email_address": "yell_info@nps.gov"}
    ]
  },
  "addresses": [
    {
      "line1": "2 Officers Row",
      "city": "Yellowstone National Park",
      "state_code": "WY",
      "postal_code": "82190",
      "type": "Physical"
    }
  ],
  "operating_hours": [...],
  "images": [
    {
      "url": "https://...",
      "title": "Grand Prismatic Spring",
      "caption": "...",
      "credit": "NPS"
    }
  ],
  "activities": ["Hiking", "Camping", "Wildlife Watching", ...],
  "weather_info": "..."
}
```

### 图片上传方案对比


| 方案             | 优点            | 缺点             |
| -------------- | ------------- | -------------- |
| URL Only       | 无需后端改动，简单     | 依赖外部图床         |
| Cloudinary     | 免费额度，CDN，图片处理 | 需要账号           |
| AWS S3         | 可靠，可控         | 需要 AWS 账号，配置复杂 |
| PythonAnywhere | 已有部署环境        | 存储有限，无 CDN     |


---

## Questions to Decide

1. 图片上传是否是必须的？还是只需要 URL 编辑？
2. 是否需要独立的编辑页面？还是继续用 modal？
3. 是否需要批量编辑功能？

