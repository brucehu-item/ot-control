import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    login: {
      title: '加班管理系统',
      username: '请输入用户名',
      password: '请输入密码',
      loginButton: '登录',
      copyright: '© 2023 加班管理系统 版权所有',
      success: '登录成功',
      failure: '登录失败',
      validation: {
        username: '请输入用户名',
        password: '请输入密码'
      },
      language: '语言'
    },
    common: {
      language: '语言',
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      search: '搜索',
      reset: '重置',
      submit: '提交',
      back: '返回',
      success: '成功',
      error: '错误',
      loading: '加载中',
      noData: '暂无数据',
      total: '总计',
      operation: '操作',
      view: '查看',
      approve: '通过',
      reject: '拒绝',
      comment: '备注'
    },
    overtime: {
      list: {
        title: '加班列表',
        search: {
          startDate: '开始日期',
          endDate: '结束日期',
          status: '状态',
          department: '部门',
          worker: '员工',
          facility: '场所',
          customer: '客户',
          lastWeek: '最近一周',
          lastMonth: '最近一月',
          lastThreeMonths: '最近三月'
        },
        table: {
          startTime: '开始时间',
          endTime: '结束时间',
          duration: '时长',
          worker: '申请人',
          department: '部门',
          facility: '场所',
          customer: '客户',
          status: '状态',
          reason: '原因',
          operation: '操作',
          hour: '小时',
          createdAt: '创建时间',
          id: '申请编号'
        },
        status: {
          PENDING_SUPERVISOR: '待主管审批',
          SUPERVISOR_APPROVED: '主管已通过',
          PENDING_MANAGER: '待经理审批',
          PENDING_CUSTOMER: '待客户审批',
          APPROVED: '已通过',
          REJECTED: '已拒绝',
          CANCELLED: '已取消'
        },
        action: {
          view: '详情',
          approve: '审批',
          cancel: '取消'
        },
        dialog: {
          detail: {
            title: '加班详情',
            close: '关闭',
            approvalProcess: '审批流程',
            approvalResult: '审批结果'
          },
          approval: {
            title: '加班审批',
            action: '审批操作',
            approve: '通过',
            reject: '拒绝',
            comment: '审批意见',
            commentPlaceholder: '请输入审批意见',
            success: '审批成功',
            error: '审批失败'
          }
        },
        message: {
          cancelSuccess: '取消申请成功',
          cancelError: '取消申请失败',
          fetchError: '获取加班记录失败'
        }
      },
      create: {
        title: '新建加班申请',
        form: {
          startTime: '开始时间',
          endTime: '结束时间',
          reason: '加班原因',
          customer: '客户',
          startTimePlaceholder: '选择开始时间',
          endTimePlaceholder: '选择结束时间',
          reasonPlaceholder: '请输入加班原因',
          customerPlaceholder: '请选择客户'
        },
        validation: {
          startTime: '请选择开始时间',
          endTime: '请选择结束时间',
          reason: '请输入加班原因',
          reasonLength: '加班原因长度应在 5 到 200 个字符之间',
          customer: '请选择客户',
          endTimeBeforeStart: '结束时间不能��于开始时间'
        },
        message: {
          submitSuccess: '加班申请提交成功',
          submitError: '提交加班申请失败',
          fetchCustomerError: '获取客户列表失败',
          noFacility: '未找到用户所属场所',
          noUserInfo: '未获取到用户信息'
        }
      }
    },
    header: {
      title: '加班管理系统',
      role: {
        WORKER: '工人',
        SUPERVISOR: '主管',
        MANAGER: '经理',
        CUSTOMER: '客户',
        SYSTEM_ADMIN: '系统管理员'
      },
      department: '部门',
      facility: '场所',
      none: '无',
      logout: '退出登录',
      logoutSuccess: '退出登录成功',
      logoutError: '退出登录失败',
      fetchUserError: '获取用户信息失败'
    }
  },
  en: {
    login: {
      title: 'Overtime Management System',
      username: 'Please enter username',
      password: 'Please enter password',
      loginButton: 'Login',
      copyright: '© 2023 Overtime Management System. All rights reserved.',
      success: 'Login successful',
      failure: 'Login failed',
      validation: {
        username: 'Please enter username',
        password: 'Please enter password'
      },
      language: 'Language'
    },
    common: {
      language: 'Language',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      reset: 'Reset',
      submit: 'Submit',
      back: 'Back',
      success: 'Success',
      error: 'Error',
      loading: 'Loading',
      noData: 'No Data',
      total: 'Total',
      operation: 'Operation',
      view: 'View',
      approve: 'Approve',
      reject: 'Reject',
      comment: 'Comment'
    },
    overtime: {
      list: {
        title: 'Overtime List',
        search: {
          startDate: 'Start Date',
          endDate: 'End Date',
          status: 'Status',
          department: 'Department',
          worker: 'Employee',
          facility: 'Facility',
          customer: 'Customer',
          lastWeek: 'Last Week',
          lastMonth: 'Last Month',
          lastThreeMonths: 'Last 3 Months'
        },
        table: {
          startTime: 'Start Time',
          endTime: 'End Time',
          duration: 'Duration',
          worker: 'Applicant',
          department: 'Department',
          facility: 'Facility',
          customer: 'Customer',
          status: 'Status',
          reason: 'Reason',
          operation: 'Operation',
          hour: 'hours',
          createdAt: 'Created At',
          id: 'Request ID'
        },
        status: {
          PENDING_SUPERVISOR: 'Pending Supervisor',
          SUPERVISOR_APPROVED: 'Supervisor Approved',
          PENDING_MANAGER: 'Pending Manager',
          PENDING_CUSTOMER: 'Pending Customer',
          APPROVED: 'Approved',
          REJECTED: 'Rejected',
          CANCELLED: 'Cancelled'
        },
        action: {
          view: 'Details',
          approve: 'Approve',
          cancel: 'Cancel'
        },
        dialog: {
          detail: {
            title: 'Overtime Details',
            close: 'Close',
            approvalProcess: 'Approval Process',
            approvalResult: 'Approval Result'
          },
          approval: {
            title: 'Overtime Approval',
            action: 'Approval Action',
            approve: 'Approve',
            reject: 'Reject',
            comment: 'Approval Comment',
            commentPlaceholder: 'Please enter approval comment',
            success: 'Approval successful',
            error: 'Approval failed'
          }
        },
        message: {
          cancelSuccess: 'Request cancelled successfully',
          cancelError: 'Failed to cancel request',
          fetchError: 'Failed to fetch overtime records'
        }
      },
      create: {
        title: 'New Overtime Request',
        form: {
          startTime: 'Start Time',
          endTime: 'End Time',
          reason: 'Reason',
          customer: 'Customer',
          startTimePlaceholder: 'Select start time',
          endTimePlaceholder: 'Select end time',
          reasonPlaceholder: 'Please enter overtime reason',
          customerPlaceholder: 'Please select customer'
        },
        validation: {
          startTime: 'Please select start time',
          endTime: 'Please select end time',
          reason: 'Please enter overtime reason',
          reasonLength: 'Reason length should be between 5 and 200 characters',
          customer: 'Please select customer',
          endTimeBeforeStart: 'End time cannot be earlier than start time'
        },
        message: {
          submitSuccess: 'Overtime request submitted successfully',
          submitError: 'Failed to submit overtime request',
          fetchCustomerError: 'Failed to fetch customer list',
          noFacility: 'User facility not found',
          noUserInfo: 'User information not found'
        }
      }
    },
    header: {
      title: 'Overtime Management System',
      role: {
        WORKER: 'Worker',
        SUPERVISOR: 'Supervisor',
        MANAGER: 'Manager',
        CUSTOMER: 'Customer',
        SYSTEM_ADMIN: 'System Admin'
      },
      department: 'Department',
      facility: 'Facility',
      none: 'None',
      logout: 'Logout',
      logoutSuccess: 'Logged out successfully',
      logoutError: 'Failed to logout',
      fetchUserError: 'Failed to fetch user info'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'zh',
  messages
}) 