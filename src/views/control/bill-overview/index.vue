<template>
  <div class="bill-overview">
    <div class="bill-overview__header1">
      <Breadcrumb>
        <BreadcrumbItem>账单</BreadcrumbItem>
        <BreadcrumbItem>账单概览</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <!-- 页面标题 -->
    <div class="bill-overview__title">
      <span style="font-size: 24px;">月账单概览</span>
    </div>
    <div class="bill-overview__panel">
      <!-- 统计信息 -->
      <div class="bill-overview__summary-card" :bordered="true">
        <div style="display: flex;justify-content: space-between;align-items: center;padding: 0 16px;">
          <div class="card-header">
            <span class="month-title">{{ formatMonthText(selectedMonth) }}概览</span>
            <span class="billing-period">账单周期 {{ formatMonthPeriod(selectedMonth) }}</span>
          </div>
          <DatePicker v-model="selectedMonth" type="month" format="yyyy-MM" placeholder="选择月份" style="width: 200px"
            :options="dateOptions" @on-change="handleMonthChange" />
          <!-- <div class="bill-overview__filter">
            
          </div> -->
        </div>
        <Spin fix v-if="loading">
          <Icon type="ios-loading" size=18 class="spin-icon-load"></Icon>
          <div>加载中...</div>
        </Spin>
        <div class="summary-content" v-else>
          <div class="summary-item">
            <div class="label">已付金额</div>
            <div style="display: flex;align-items: center;">
              <div class="mark" style="color:#234BDA">¥</div>
              <div class="value" style="color:#234BDA">{{ formatAmount(totalPaid) }}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="label">欠款金额</div>
            <div style="display: flex;align-items: center;">
              <div class="mark" style="color:#DE001A">¥</div>
              <div class="value" style="color:#DE001A">{{ formatAmount(totalPending) }}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="label">退款金额</div>
            <div style="display: flex;align-items: center;">
              <div class="mark" style="color:#06B93D">¥</div>
              <div class="value" style="color:#06B93D">{{ formatAmount(totalRefund) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bill-overview__panel" style="margin-top: 16px;">
      <!-- 历史账单列表 -->
      <div class="bill-overview__history">
        <!-- Tab 切换 -->
        <Tabs v-model="activeTab" @on-click="handleTabChange" style="margin-bottom: 16px;">
          <TabPane label="按产品" name="product"></TabPane>
          <TabPane label="按计费类型" name="billingType"></TabPane>
        </Tabs>

        <!-- 按产品维度 -->
        <Table v-if="activeTab === 'product'" :columns="productColumns" :data="productAggregatedData"
          :loading="historyLoading" class="custom-table" style="width: 100%">
          <template slot-scope="{ row }" slot="dimension">
            <span>{{ row.productName || '-' }}</span>
          </template>
          <template slot-scope="{ row }" slot="itemCount">
            <span>{{ row.itemCount }} 笔</span>
          </template>
          <template slot-scope="{ row }" slot="originalAmount">
            <span class="amount">¥{{ formatAmount(row.originalAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="discountAmount">
            <span class="amount discount">¥{{ formatAmount(row.discountAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="amount">
            <span class="amount">¥{{ formatAmount(row.amount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="paidAmount">
            <span class="amount" style="color: red;">¥{{ formatAmount(row.paidAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="pendingAmount">
            <span class="amount">¥{{ formatAmount(row.pendingAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="refundAmount">
            <span class="amount" style="color: green;">¥{{ formatAmount(row.refundAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="action">
            <Button type="text" size="small" @click="goToDetail(row)">详情</Button>
          </template>
        </Table>

        <!-- 按计费类型维度 -->
        <Table v-if="activeTab === 'billingType'" :columns="billingTypeColumns" :data="billingTypeAggregatedData"
          :loading="historyLoading" class="custom-table" style="width: 100%">
          <template slot-scope="{ row }" slot="dimension">
            <span :class="['type-tag', row.billingType]">{{ getBillingTypeText(row.billingType) }}</span>
          </template>
          <template slot-scope="{ row }" slot="itemCount">
            <span>{{ row.itemCount }} 笔</span>
          </template>
          <template slot-scope="{ row }" slot="originalAmount">
            <span class="amount">¥{{ formatAmount(row.originalAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="discountAmount">
            <span class="amount discount">¥{{ formatAmount(row.discountAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="amount">
            <span class="amount">¥{{ formatAmount(row.amount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="paidAmount">
            <span class="amount" style="color: red;">¥{{ formatAmount(row.paidAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="pendingAmount">
            <span class="amount">¥{{ formatAmount(row.pendingAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="refundAmount">
            <span class="amount" style="color: green;">¥{{ formatAmount(row.refundAmount) }}</span>
          </template>
          <template slot-scope="{ row }" slot="action">
            <Button type="text" size="small" @click="goToDetail(row)">详情</Button>
          </template>
        </Table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillOverview',
  data () {
    return {
      loading: false,
      selectedMonth: new Date(),
      filterBillType: '',
      cards: [],
      historyLoading: false,
      historyData: [],
      // 新增：Tab 切换
      activeTab: 'product', // 默认按产品
      // 原始列表数据
      rawListData: [],
      // 聚合后的列表数据
      productAggregatedData: [],
      billingTypeAggregatedData: [],
      // 按产品维度聚合的列配置
      productColumns: [
        { title: '产品名称', slot: 'dimension', minWidth: 150 },
        { title: '交易记录数', slot: 'itemCount', width: 150 },
        { title: '原始金额', key: 'originalAmount', width: 150 },
        { title: '优惠金额', key: 'discountAmount', width: 150 },
        { title: '已付金额', key: 'amount', width: 150 }, // 原应付金额
        // { title: '已付金额', slot: 'paidAmount', width: 140, align: 'center' },
        { title: '欠款金额', key: 'pendingAmount', width: 150 },
        { title: '退款金额', slot: 'refundAmount', width: 150 },
        { title: '操作', slot: 'action', width: 120 }
      ],
      // 按计费类型维度聚合的列配置
      billingTypeColumns: [
        { title: '计费类型', slot: 'dimension', minWidth: 150 },
        { title: '交易记录数', slot: 'itemCount', width: 150 },
        { title: '原始金额', key: 'originalAmount', width: 150 },
        { title: '优惠金额', key: 'discountAmount', width: 150 },
        { title: '应付金额', key: 'amount', width: 150 },
        { title: '已付金额', slot: 'paidAmount', width: 150 },
        { title: '待付金额', key: 'pendingAmount', width: 150 },
        { title: '退款金额', slot: 'refundAmount', width: 150 },
        { title: '操作', slot: 'action', width: 120, align: 'center' }
      ],
      dateOptions: {
        disabledDate (date) {
          // 禁用未来月份
          const now = new Date()
          now.setHours(0, 0, 0, 0)
          return date > now
        }
      }
    }
  },
  computed: {
    // 当前卡片数据（当月概览）
    currentCard () {
      return this.cards.length > 0 ? this.cards[0] : {
        paidAmount: 0,
        pendingAmount: 0,
        totalPayable: 0
      }
    },
    // 应付金额 = 已付 + 待付
    totalPayable () {
      return this.currentCard.totalPayable || 0
    },
    // 已付金额
    totalPaid () {
      return this.currentCard.paidAmount || 0
    },
    // 待付金额
    totalPending () {
      return this.currentCard.pendingAmount || 0
    },
    // 退款金额
    totalRefund () {
      return this.currentCard.totalRefund || 0
    },
    isCurrentMonth () {
      const currentMonth = this.formatMonth(new Date())
      const selectedMonthStr = this.formatMonth(this.selectedMonth)
      return currentMonth === selectedMonthStr
    },
    filteredHistory () {
      // 按选择的月份筛选历史账单
      const selectedMonthStr = this.formatMonth(this.selectedMonth)
      return this.historyData.filter(item => item.billMonth === selectedMonthStr)
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    async loadData () {
      this.loading = true
      this.historyLoading = true
      try {
        // 加载当月概览
        await this.loadCurrentMonthOverview()
        // 加载历史月度账单
        // await this.loadMonthlyBills()
      } catch (error) {
        console.error('获取账单概览失败:', error)
        this.$Message.error('获取账单概览失败')
      } finally {
        this.loading = false
        this.historyLoading = false
      }
    },

    // 加载当月账单概览（新接口）
    async loadCurrentMonthOverview () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/billService/getCurrentMonthBillOverview',
          method: 'post',
          data: {
            selectedMonth: this.formatMonth(this.selectedMonth)
          }
        })

        if (res.errcode === 0 && res.data) {
          // 保存原始列表数据用于聚合
          this.rawListData = res.data.list || []

          // 调试用：打印原始数据结构
          console.log('原始列表数据:', this.rawListData)

          // 执行聚合
          this.doAggregation()

          // 直接使用接口返回的统计数据
          this.cards = [
            {
              type: 'all',
              title: '全部账单',
              itemCount: this.rawListData.length,
              paidAmount: res.data.totalPaid || 0,
              pendingAmount: res.data.totalPending || 0,
              totalPayable: res.data.totalPayable || 0,
              totalRefund: res.data.totalRefund || 0
            }
          ]
          console.log('当月账单概览:', res.data)
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          console.warn('获取当月账单概览失败:', res.errmsg)
        }
      } catch (error) {
        console.error('获取当月账单概览失败:', error)
      }
    },

    // 加载历史月度账单（新接口）
    async loadMonthlyBills () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/billService/listMonthlyBills',
          method: 'post',
          data: {}
        })

        if (res.errcode === 0 && res.data) {
          // 转换数据格式
          this.historyData = (res.data || []).map(item => ({
            billMonth: item.billMonth,
            billType: 'all',
            itemCount: item.orderCount || 0,
            paidAmount: item.totalPaid || 0,
            totalAmount: item.totalAmount || 0,
            pendingAmount: item.totalPending || 0,
            discountAmount: 0  // 新表结构暂无优惠金额字段
          }))
          console.log('历史月度账单:', this.historyData)
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          console.warn('获取历史月度账单失败:', res.errmsg)
        }
      } catch (error) {
        console.error('获取历史月度账单失败:', error)
      }
    },

    // 数据处理方法已合并到 load 方法中

    handleMonthChange (date) {
      this.selectedMonth = date || new Date()
      this.loadData()
    },

    handleFilterChange () {
      // 前端筛选，不需要重新请求
    },

    formatMonth (date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    },

    formatMonthText (date) {
      if (!date) return ''
      const d = new Date(date)
      const month = d.getMonth() + 1
      return `${month}月`
    },

    formatMonthPeriod (date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const lastDay = new Date(year, month, 0).getDate()
      return `${year}-${String(month).padStart(2, '0')}-01 至 ${year}-${String(month).padStart(2, '0')}-${lastDay}`
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

    goToDetail (row) {
      const query = {
        billMonth: this.formatMonth(this.selectedMonth)
      };

      // 根据当前Tab添加对应参数
      if (this.activeTab === 'product') {
        // 按产品统计：传递产品ID和产品名称
        query.productId = row.productId;
        query.productName = row.productName;
      } else if (this.activeTab === 'billingType') {
        // 按计费类型：传递计费类型
        query.billingType = row.billingType;
      }

      this.$router.push({
        path: '/shenbeigpuai/control/bill-detail',
        query: query
      });
    },

    // Tab 切换处理
    handleTabChange (tabName) {
      this.activeTab = tabName
      // Tab 切换时重新聚合数据
      this.doAggregation()
    },

    // 执行数据聚合
    doAggregation () {
      if (!this.rawListData || this.rawListData.length === 0) {
        this.productAggregatedData = []
        this.billingTypeAggregatedData = []
        return
      }

      this.productAggregatedData = this.aggregateByProduct()
      this.billingTypeAggregatedData = this.aggregateByBillingType()
    },

    // 按产品维度聚合
    aggregateByProduct () {
      const map = new Map()

      this.rawListData.forEach(item => {
        const key = item.productId || 'unknown'

        if (!map.has(key)) {
          map.set(key, {
            productId: item.productId,
            productName: item.productName || '未知产品',
            itemCount: 0,
            originalAmount: 0,  // 原始金额
            discountAmount: 0,  // 优惠金额
            amount: 0,          // 应付金额
            paidAmount: 0,     // 已付金额
            pendingAmount: 0,  // 待付金额
            refundAmount: 0    // 退款金额
          })
        }

        const agg = map.get(key)
        agg.itemCount += 1

        const originalAmount = Math.abs(Number(item.originalAmount) || 0)
        const discountAmount = Math.abs(Number(item.discountAmount) || 0)
        const amount = Math.abs(Number(item.amount) || 0)
        const needRepaidAmount = Math.abs(Number(item.needRepaidAmount) || 0)
        const refundAmt = Math.abs(Number(item.refundAmount) || 0)

        agg.originalAmount += originalAmount
        agg.discountAmount += discountAmount
        agg.amount += amount
        agg.paidAmount += amount - needRepaidAmount;  // 已付金额 = 应付金额 - 待付金额
        agg.pendingAmount += needRepaidAmount;  // 待付金额
        agg.refundAmount += refundAmt;  // 退款金额
      })
      let arr = Array.from(map.values())
      arr.forEach(item => {
        item.originalAmount = Number(item.originalAmount.toFixed(2))
        item.discountAmount = Number(item.discountAmount.toFixed(2))
        item.amount = Number(item.amount.toFixed(2))
        item.paidAmount = Number(item.paidAmount.toFixed(2))
        item.pendingAmount = Number(item.pendingAmount.toFixed(2))
        item.refundAmount = Number(item.refundAmount.toFixed(2))
      })
      return arr
    },

    // 按计费类型维度聚合
    aggregateByBillingType () {
      const map = new Map()

      this.rawListData.forEach(item => {
        const key = item.billingType || 'unknown'

        if (!map.has(key)) {
          map.set(key, {
            orderType: key,
            billingType: key,
            itemCount: 0,
            originalAmount: 0,  // 原始金额
            discountAmount: 0,  // 优惠金额
            amount: 0,          // 应付金额
            paidAmount: 0,     // 已付金额
            pendingAmount: 0,  // 待付金额
            refundAmount: 0    // 退款金额
          })
        }

        const agg = map.get(key)
        agg.itemCount += 1

        const originalAmount = Math.abs(Number(item.originalAmount) || 0)
        const discountAmount = Math.abs(Number(item.discountAmount) || 0)
        const amount = Math.abs(Number(item.amount) || 0)
        const needRepaidAmount = Math.abs(Number(item.needRepaidAmount) || 0)
        const refundAmt = Math.abs(Number(item.refundAmount) || 0)

        agg.originalAmount += Number(originalAmount.toFixed(2))
        agg.discountAmount += Number(discountAmount.toFixed(2))
        agg.amount += Number(amount.toFixed(2))
        agg.paidAmount += Number((amount - needRepaidAmount).toFixed(2))  // 已付金额 = 应付金额 - 待付金额
        agg.pendingAmount += Number(needRepaidAmount.toFixed(2))  // 待付金额
        agg.refundAmount += Number(refundAmt.toFixed(2))  // 退款金额
      })
      let arr = Array.from(map.values())
      arr.forEach(item => {
        item.originalAmount = Number(item.originalAmount.toFixed(2))
        item.discountAmount = Number(item.discountAmount.toFixed(2))
        item.amount = Number(item.amount.toFixed(2))
        item.paidAmount = Number(item.paidAmount.toFixed(2))
        item.pendingAmount = Number(item.pendingAmount.toFixed(2))
        item.refundAmount = Number(item.refundAmount.toFixed(2))
      })
      return arr
    },

    // 计费类型文本转换
    getBillingTypeText (type) {
      const map = {
        'hourly': '按量计费',
        'monthly': '包月',
        'tokenplan': '套餐'
      }
      return map[type] || type || '-'
    },

    getBillTypeText (type) {
      const map = {
        'instance_purchase': '实例购买',
        'storage_expansion': '数据盘购买'
      }
      return map[type] || type || '-'
    }
  }
}
</script>

<style lang="less" scoped>
.bill-overview {
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

  &__header1 {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  &__alert {
    margin-bottom: 16px;
  }

  &__filter {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  &__cards {
    display: flex;
    gap: 20px;
    margin-bottom: 32px;

    .stat-card {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      color: #fff;

      &.storage_expansion {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .card-title {
          font-size: 16px;
          font-weight: 500;
        }

        .card-count {
          font-size: 12px;
          opacity: 0.8;
        }
      }

      .card-body {
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;

          .label {
            opacity: 0.9;
          }

          .value {
            font-weight: 600;
            font-size: 16px;

            &.pending {
              color: #ffe58f;
            }

            &.discount {
              color: #b7eb8f;
            }

            &.refund {
              color: rgba(255, 255, 255, 0.6);
            }
          }
        }
      }
    }
  }

  &__history {
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

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

    .amount {
      color: #333;
      font-weight: 500;

      &.discount {
        color: #52c41a;
      }
    }
  }
}

.bill-overview__summary-card {
  // margin-bottom: 24px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;

    .month-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .billing-period {
      font-size: 12px;
      color: #999;
    }

    .billing-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #1890ff;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #1890ff;
      }

      &.is-history {
        color: #52c41a;

        .status-dot {
          background: #52c41a;
        }
      }
    }
  }

  .summary-content {
    display: flex;
    justify-content: space-between;
    padding: 16px 20px 0px 20px;

    .summary-item {
      width: 530px;
      height: 87px;
      border-radius: 8px;
      background: linear-gradient(133.23deg, #fffcfa 0%, #f4f4ff 100%);
      padding: 14px 16px;

      .label {
        font-size: 14px;
        font-weight: 600;
        color: #000;
        margin-bottom: 8px;
      }

      .mark {
        font-size: 16px;
        font-weight: 700;
        margin-right: 4px;
      }

      .value {
        font-size: 24px;
        font-weight: 700;
        color: #333;

        &.pending {
          color: #fa8c16;
        }

        .detail-link {
          font-size: 12px;
          color: #4a7afb;
          margin-left: 8px;
          cursor: pointer;
        }
      }
    }
  }
}

.spin-icon-load {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>