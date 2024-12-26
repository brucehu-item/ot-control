# 加班列表页面分析

## 1. 页面布局结构
```
- 整体布局
  |- 顶部导航栏 (Header)
  |- 主内容区域
     |- 页面标题区域
        |- 标题文本
        |- 新建按钮 (仅工人可见)
     |- 搜索区域
        |- 搜索表单
           |- 时间范围选择器
           |- 状态选择器
           |- 部门选择器 (仅经理可见)
           |- 搜索/重置按钮
     |- 表格区域
        |- 数据表格
        |- 分页器
     |- 详情弹窗
     |- 审批弹窗
```

## 2. 数据状态管理
```
- 搜索条件 (searchForm)
  - startDate
  - endDate
  - status
  - departmentId
  - workerId
  - facilityId
  - customerId

- 表格数据
  - tableData: 列表数据
  - loading: 加载状态
  - total: 总记录数
  - totalDuration: 总时长

- 分页数据
  - currentPage: 当前页码
  - pageSize: 每页条数

- 用户信息
  - currentUser: 当前登录用户信息

- 弹窗状态
  - detailVisible: 详情弹窗显示状态
  - currentDetail: 当前查看的详情数据
  - approvalVisible: 审批弹窗显示状态
  - approvalForm: 审批表单数据
  - currentApprovalRequest: 当前审批的请求
```

## 3. API 接口对接
```
- 用户相关
  - getCurrentUser(): 获取当前用户信息
  - getDepartments(): 获取部门列表（经理角色使用）

- 加班申请相关
  - getOvertimeRequests(): 获取加班申请列表
  - approveOvertimeRequest(): 审批通过
  - rejectOvertimeRequest(): 审批拒绝
  - cancelOvertimeRequest(): 取消申请
```

## 4. 权限控制逻辑
```
- 按钮权限
  - 新建按钮: 仅工人可见
  - 取消按钮: hasPermissionToCancel()
    - 工人: 仅可取消自己的PENDING_SUPERVISOR状态申请
    - 主管: 可取消部门内PENDING_SUPERVISOR和SUPERVISOR_APPROVED状态申请
    - 经理: 可取消场所内多个状态的申请

- 审批权限: hasPermissionToApprove()
  - 主管: 可审批本部门PENDING_SUPERVISOR状态申请
  - 经理: 可审批本场所PENDING_MANAGER或SUPERVISOR_APPROVED状态申请
  - 客户: 可审批PENDING_CUSTOMER或SUPERVISOR_APPROVED状态申请

- 数据权限
  - 工人: 仅可查看自己的申请
  - 主管: 可查看本部门的申请
  - 经理: 可查看本场所的申请
  - 客户: 可查看与自己相关的申请
```

## 5. 状态流转
```
- 状态定义
  PENDING_SUPERVISOR: 待主管审批
  SUPERVISOR_APPROVED: 主管已审批
  PENDING_MANAGER: 待经理审批
  PENDING_CUSTOMER: 待客户审批
  APPROVED: 已通过
  REJECTED: 已拒绝
  CANCELLED: 已取消
```

## 6. 交互功能
```
- 搜索功能
  - 时间范围快捷选项
  - 状态筛选
  - 部门筛选（经理角色）
  - 搜索/重置

- 表格功能
  - 分页
  - 查看详情
  - 取消申请
  - 审批操作

- 弹窗交互
  - 详情弹窗：显示申请详情和审批记录
  - 审批弹窗：提供审批意见和操作选项
```

## 7. 样式主题
```
- 主题色
  - 主色: #6B238E (紫色)
  - 悬浮色: #9B4BC3
  
- 布局样式
  - 响应式布局
  - 卡片式设计
  - 表格固定列
  - 合理的内边距和外边距
```

## 8. 错误处理
```
- API错误处理
  - 请求失败提示
  - token失效处理
  - 权限不足处理

- 表单验证
  - 必填项验证
  - 时间范围验证
  - 审批意见验证
```

## 9. 国际化支持
```
- 使用vue-i18n
```

## 10. 性能优化
```
- 分页加载
- 合理的搜索防抖
- 表格固定列优化
- 按需加载组件
```