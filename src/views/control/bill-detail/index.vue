<template>
  <div class="bill-detail">
    <!-- 面包屑 -->
    <div class="bill-detail__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>账单</BreadcrumbItem>
        <BreadcrumbItem>账单详情</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <div class="bill-detail__panel">
      <!-- 页面标题和筛选 -->
      <div class="bill-detail__header">
        <div class="title">
          <span>{{ detailTitle }}</span>
        </div>
        <div class="filter">
          <Input v-model="searchOrderNo" placeholder="订单编号" style="width: 180px; margin-right: 12px;" clearable
            @on-change="handleFilterChange" />
          <Select v-model="searchProductName" placeholder="产品名称" style="width: 180px; margin-right: 12px;" clearable
            filterable @on-change="handleFilterChange">
            <Option v-for="item in productNameList" :key="item" :value="item">{{ item }}</Option>
          </Select>
          <DatePicker v-model="filterMonth" type="month" format="yyyy-MM" placeholder="选择月份"
            style="width: 140px; margin-right: 12px;" @on-change="handleMonthChange" />
          <Select v-model="filterOrderType" placeholder="计费类型" style="width: 140px" clearable
            @on-change="handleFilterChange">
            <Option value="monthly">包月</Option>
            <Option value="hourly">按量计费</Option>
            <Option value="tokenplan">套餐</Option>
          </Select>
        </div>
      </div>

      <!-- 订单明细表格 -->
      <div class="bill-detail__content">
        <Table :columns="columns" :data="tableData" :loading="loading" class="custom-table">
          <!-- 交易类型 -->
          <template slot-scope="{ row }" slot="itemType">
            <span :class="['type-tag', row.itemType]">{{ row.itemTypeText }}</span>
          </template>

          <!-- 订单号 -->
          <template slot-scope="{ row }" slot="orderNo">
            <span class="order-no">{{ row.orderNo || '-' }}</span>
          </template>

          <!-- 产品名称 -->
          <template slot-scope="{ row }" slot="productName">
            <span>{{ row.productName || '-' }}</span>
          </template>

          <!-- 原始金额 -->
          <template slot-scope="{ row }" slot="originalAmount">
            <span>¥{{ formatAmount(row.originalAmount) }}</span>
          </template>

          <!-- 优惠金额 -->
          <template slot-scope="{ row }" slot="discountAmount">
            <span class="discount">¥{{ formatAmount(row.discountAmount) }}</span>
          </template>

          <!-- 应付金额 -->
          <template slot-scope="{ row }" slot="amount">
            <span>¥{{ formatAmount(row.amount) }}</span>
          </template>

          <!-- 已付金额 -->
          <template slot-scope="{ row }" slot="paidAmount">
            <span class="paid">¥{{ formatAmount(row.paidAmount) }}</span>
          </template>

          <!-- 余额金额 -->
          <template slot-scope="{ row }" slot="useBalanceAmount">
            <span>¥{{ formatAmount(row.useBalanceAmount) }}</span>
          </template>

          <!-- 第三方金额 -->
          <template slot-scope="{ row }" slot="useThirdAmount">
            <span>{{ row.itemType === 'hourly' ? '-' : '¥' + formatAmount(row.useThirdAmount) }}</span>
          </template>

          <!-- 待付金额 -->
          <template slot-scope="{ row }" slot="pendingAmount">
            <span class="pending">¥{{ formatAmount(row.pendingAmount) }}</span>
          </template>

          <!-- 退款金额 -->
          <template slot-scope="{ row }" slot="refundAmount">
            <span>{{ row.refundAmount ? '¥' + formatAmount(row.refundAmount) : '-' }}</span>
          </template>

          <!-- 余额退款金额 -->
          <template slot-scope="{ row }" slot="refundUseBalanceAmount">
            <span>{{ row.refundUseBalanceAmount ? '¥' + formatAmount(row.refundUseBalanceAmount) : '-' }}</span>
          </template>

          <!-- 第三方退款金额 -->
          <template slot-scope="{ row }" slot="refundUseThirdAmount">
            <span>{{ row.refundUseThirdAmount ? '¥' + formatAmount(row.refundUseThirdAmount) : '-' }}</span>
          </template>

          <!-- 备注 -->
          <template slot-scope="{ row }" slot="remark">
            <span class="spec-desc">{{ row.remark || '-' }}</span>
          </template>

          <!-- 订单金额 -->
          <template slot-scope="{ row }" slot="finalAmount">
            <span class="amount">¥{{ formatAmount(row.finalAmount) }}</span>
          </template>

          <!-- 状态 -->
          <template slot-scope="{ row }" slot="status">
            <span :class="['status-tag', row.status]">{{ row.statusText }}</span>
          </template>

          <!-- 创建时间 -->
          <template slot-scope="{ row }" slot="createTime">
            <span>{{ formatDate(row.createTime) }}</span>
          </template>
        </Table>
        <Page :total="totalCount" :current="currentPage" :page-size="pageSize" show-total show-sizer
          @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"
          style="margin-top: 16px; text-align: right;" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillDetail',
  data () {
    return {
      loading: false,
      billMonth: '',
      billType: '',
      searchOrderNo: '',
      searchProductName: '',
      filterMonth: new Date(),
      filterOrderType: '',
      productNameList: [],
      // 从概览页传来的查询参数
      queryProductId: '',
      queryProductName: '',
      queryBillingType: '',
      columns: [
        { title: '交易类型', slot: 'itemType', width: 120 },
        { title: '订单号', slot: 'orderNo', minWidth: 250 },
        { title: '产品名称', slot: 'productName', width: 220 },
        { title: '实例名称', key: 'instanceName', width: 200 },
        { title: '原始金额', slot: 'originalAmount', width: 120 },
        { title: '优惠金额', slot: 'discountAmount', width: 120 },
        { title: '应付金额', slot: 'amount', width: 120 },
        { title: '已付金额', slot: 'paidAmount', width: 120 },
        { title: '余额金额', slot: 'useBalanceAmount', width: 120 },
        { title: '第三方金额', slot: 'useThirdAmount', width: 120 },
        { title: '待付金额', slot: 'pendingAmount', width: 120 },
        { title: '退款金额', slot: 'refundAmount', width: 120 },
        { title: '余额退款金额', slot: 'refundUseBalanceAmount', width: 130 },
        { title: '第三方退款金额', slot: 'refundUseThirdAmount', width: 160 },

        { title: '创建时间', slot: 'createTime', width: 220 },
        { title: '备注', slot: 'remark', minWidth: 240 },
      ],
      tableData: [],
      allData: [],
      filteredData: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    detailTitle () {
      let title = this.billMonth + ' 账单详情'
      return title
    },
    billTypeText () {
      if (!this.billType) return ''
      const map = {
        'instance_purchase': '实例购买',
        'storage_expansion': '数据盘购买'
      }
      return map[this.billType] || ''
    },
    billTypeClass () {
      if (!this.billType) return ''
      return this.billType === 'instance_purchase' ? 'instance' : 'storage'
    },
    totalPaid () {
      return this.allData
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0)
    },
    totalPending () {
      return this.allData
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0)
    },
    totalDiscount () {
      return this.allData
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + (parseFloat(item.discountAmount) || 0), 0)
    },
    totalRefund () {
      return this.allData
        .filter(item => item.status === 'cancel')
        .reduce((sum, item) => sum + (parseFloat(item.finalAmount) || 0), 0)
    }
  },
  mounted () {
    this.billMonth = this.$route.query.billMonth || this.formatCurrentMonth()
    this.filterMonth = this.billMonth
    // 获取从概览页传来的查询参数
    this.queryProductId = this.$route.query.productId || ''
    this.queryProductName = this.$route.query.productName || ''
    this.queryBillingType = this.$route.query.billingType || ''

    // 如果有计费类型参数，自动设置筛选条件
    if (this.queryBillingType) {
      this.filterOrderType = this.queryBillingType
    }
    // 如果有产品名称参数，自动设置筛选条件
    if (this.queryProductName) {
      this.searchProductName = this.queryProductName
    }

    this.loadData()
  },
  methods: {
    async loadData () {
      this.loading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/billService/getCurrentMonthBillOverview',
          method: 'post',
          data: {
            selectedMonth: this.billMonth
          }
        })

        if (res.errcode === 0 && res.data) {
          const list = res.data.list || []
          this.allData = list.map(item => ({
            id: item.id,
            orderId: item.orderId,
            orderNo: item.orderNo || item.orderId,
            instanceName: item.instance_name || '-',
            itemType: item.billingType,
            itemTypeText: this.getBillingTypeText(item.billingType),
            productName: item.productName,
            remark: item.remark || '-',
            quantity: item.quantity || 1,
            originalAmount: Math.abs(Number(item.originalAmount) || 0),
            discountAmount: Math.abs(Number(item.discountAmount) || 0),
            finalAmount: Math.abs(Number(item.amount) || 0),
            needRepaidAmount: Math.abs(Number(item.needRepaidAmount) || 0),
            amount: Math.abs(Number(item.amount) || 0),
            paidAmount: Math.abs(Number(item.amount) || 0) - Math.abs(Number(item.needRepaidAmount) || 0),
            useBalanceAmount: Math.abs(Number(item.useBalanceAmount) || 0),
            useThirdAmount: Math.abs(Number(item.useThirdAmount) || 0),
            pendingAmount: Math.abs(Number(item.needRepaidAmount) || 0),
            status: item.needRepaidAmount > 0 ? 'pending' : 'completed',
            statusText: this.getStatusText(item.needRepaidAmount > 0 ? 'pending' : 'completed'),
            refundAmount: item.refundAmount,
            refundUseBalanceAmount: item.refundUseBalanceAmount,
            refundUseThirdAmount: item.refundUseThirdAmount,
            createTime: item.createTime
          }))
          // 提取产品名称列表用于筛选
          const productNames = [...new Set(list.map(item => item.productName).filter(name => name))]
          this.productNameList = productNames

          this.applyFilter()
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(res.errmsg || '获取账单详情失败')
        }
      } catch (error) {
        console.error('获取账单详情失败:', error)
        this.$Message.error('获取账单详情失败')
      } finally {
        this.loading = false
      }
    },

    handleFilterChange () {
      this.currentPage = 1
      this.applyFilter()
    },

    handleMonthChange (date) {
      this.billMonth = date || this.formatCurrentMonth()
      this.loadData()
    },

    applyFilter () {
      let data = this.allData
      // 筛选订单编号
      if (this.searchOrderNo) {
        const orderNo = this.searchOrderNo.trim().toLowerCase()
        data = data.filter(item => item.orderNo && item.orderNo.toLowerCase().includes(orderNo))
      }
      // 筛选产品名称
      if (this.searchProductName) {
        const productName = this.searchProductName.trim().toLowerCase()
        data = data.filter(item => item.productName && item.productName.toLowerCase() === productName)
      }
      // 筛选计费类型
      if (this.filterOrderType) {
        data = data.filter(item => item.itemType === this.filterOrderType)
      }
      this.filteredData = data
      this.totalCount = data.length
      this.updateTableData()
    },

    updateTableData () {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      this.tableData = this.filteredData.slice(start, end)
    },

    handlePageChange (page) {
      this.currentPage = page
      this.updateTableData()
    },

    handlePageSizeChange (pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.updateTableData()
    },

    formatDate (dateStr) {
      if (!dateStr) return '-'
      // 如果是时间戳（数字或数字字符串），先转换为日期
      if (typeof dateStr === 'number' || /^\d+$/.test(dateStr)) {
        const timestamp = parseInt(dateStr)
        if (!isNaN(timestamp)) {
          const date = new Date(timestamp)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hour = String(date.getHours()).padStart(2, '0')
            const minute = String(date.getMinutes()).padStart(2, '0')
            const second = String(date.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hour}:${minute}:${second}`
          }
        }
      }
      // 如果是字符串格式，直接截取到秒
      if (typeof dateStr === 'string' && dateStr.length >= 19) {
        return dateStr.substring(0, 19)
      }
      if (typeof dateStr === 'string' && dateStr.length >= 10) {
        return dateStr.substring(0, 10)
      }
      return dateStr
    },

    goBack () {
      this.$router.push('/shenbeigpuai/control/bill-overview')
    },

    formatCurrentMonth () {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    },

    formatAmount (amount) {
      if (amount === null || amount === undefined || amount === '') {
        return '0.00'
      }
      const num = parseFloat(amount)
      if (isNaN(num)) {
        return '0.00'
      }
      return num.toFixed(2)
    },

    getItemTypeText (type) {
      const map = {
        'instance_purchase': '包月',
        // 'storage_expansion': '数据盘购买',
        'hourly_billing': '按量计费'
      }
      return map[type] || type || '-'
    },

    getBillingTypeText (type) {
      const map = {
        'hourly': '按量计费',
        'monthly': '包月',
        'tokenplan': '套餐'
      }
      return map[type] || type || '-'
    },

    getStatusText (status) {
      const map = {
        'completed': '已完成',
        'pending': '待支付',
        'cancel': '已取消/已退款'
      }
      return map[status] || status || '-'
    }
  }
}
</script>

<style lang="less" scoped>
.bill-detail {
  padding: 16px;
  background: #f5f7f9;
  min-height: 100vh;
  // 主白色卡片：包住工具栏 + 表格 + 分页（与 instance-buy 的 Card 风格保持一致）
  &__panel {
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }

  &__breadcrumb {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    // 筛选区下拉/日期：13px（iView 默认 14px）
    .filter {

      /deep/ .ivu-select-placeholder,
      /deep/ .ivu-select-selected-value,
      /deep/ .ivu-select-input,
      /deep/ .ivu-select-selection,
      /deep/ .ivu-input,
      /deep/ .ivu-datepicker-input {
        font-size: 13px !important;
      }
    }

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #333;

      .bill-type-tag {
        margin-left: 12px;
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: normal;

        &.instance {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.storage {
          background: #fff7e6;
          color: #fa8c16;
        }
      }
    }
  }

  &__summary {
    display: flex;
    gap: 24px;
    padding: 20px;
    background: #f8f8f9;
    border-radius: 8px;
    margin-bottom: 20px;

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .label {
        font-size: 12px;
        color: #666;
      }

      .value {
        font-size: 20px;
        font-weight: 600;
        color: #333;

        &.pending {
          color: #fa8c16;
        }

        &.discount {
          color: #52c41a;
        }

        &.refund {
          color: #999;
        }
      }
    }
  }

  &__content {
    .custom-table {
      /deep/ .ivu-table {
        font-size: 12px;
        color: #000000;
      }

      /deep/ .ivu-table-header thead tr th {
        background-color: #f2f5f9;
        // color: #666;
        color: #000000;
        font-weight: bold;
        font-size: 13px;
        // height: 44px;
        border-bottom: none;
        text-align: center;
      }

      /deep/ .ivu-table-td {
        font-size: 12px;
        color: #333;
        text-align: center;
      }

      /deep/ .ivu-table-cell {
        text-align: center;
      }

      /deep/ .ivu-table-cell>span {
        display: inline-block;
      }
    }

    .type-tag {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;

      &.monthly {
        background: #e6f7ff;
        color: #1890ff;
      }

      &.hourly {
        background: #fff7e6;
        color: #fa8c16;
      }

      &.tokenplan {
        background: #f0f5ff;
        color: #2f54eb;
      }
    }

    .order-no {
      // color: #4a7afb;
      font-size: 12px;
    }

    .spec-desc {
      font-size: 12px;
      color: #666;
    }

    .amount {
      color: #ff4d4f;
      font-weight: 500;
    }

    .status-tag {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;

      &.completed {
        background: #f6ffed;
        color: #52c41a;
      }

      &.pending {
        background: #fff7e6;
        color: #fa8c16;
      }

      &.cancel {
        background: #f5f5f5;
        color: #999;
      }
    }
  }
}
</style>
