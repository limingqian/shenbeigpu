<template>
  <div class="transaction-details">
    <!-- 顶部面包屑 -->
    <div class="transaction-details__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>订单管理</BreadcrumbItem>
        <BreadcrumbItem>交易明细</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="transaction-details__panel">
      <!-- 筛选栏 -->
      <div class="transaction-details__filter">
        <DatePicker type="daterange" v-model="searchForm.dateRange" placeholder="请选择时间范围" style="width: 220px"
          class="filter-item"></DatePicker>

        <Select v-model="searchForm.type" placeholder="请选择交易类型" style="width: 180px" class="filter-item">
          <Option value="all">全部类型</Option>
          <Option value="recharge">充值</Option>
          <Option value="payment">消费</Option>
          <Option value="refund">退款</Option>
          <Option value="adjustment">调整</Option>
        </Select>

        <Button type="primary" icon="md-search" class="search-btn1" @click="handleSearch">搜索</Button>
        <Button style="margin-left: 0px" class="search-btn1" icon="md-refresh" @click="handleReset">重置</Button>
      </div>

      <!-- 交易表格 -->
      <div class="transaction-details__content">
        <Table :columns="columns" :data="tableData" :loading="loading" no-data-text="暂无数据" class="custom-table">
          <!-- 金额槽 -->
          <template slot-scope="{ row }" slot="amount">
            <span :class="['amount-text', row.amount >= 0 ? 'plus' : 'minus']">
              {{ row.amount >= 0 ? '+' : '' }}{{ formatMoney(row.amount) }}
            </span>
          </template>

          <!-- 余额槽 -->
          <template slot-scope="{ row }" slot="balance">
            <span>{{ formatMoney(row.afterBalance) }}</span>
          </template>
        </Table>

        <!-- 分页 -->
        <div class="transaction-details__page" v-if="total > 0">
          <Page :total="total" :current="pageNo" :page-size="pageSize" :page-size-opts="[10, 20, 30]" show-sizer
            show-total @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransactionDetails',
  data () {
    return {
      loading: false,
      searchForm: {
        type: '',
        dateRange: []
      },
      columns: [
        { title: '流水号', key: 'tradeNo', width: 260 },
        { title: '实例名称', key: 'instanceName', width: 160 },
        { title: '收支类型', key: 'incomeType', width: 100 },
        { title: '交易类型', key: 'typeName', width: 100 },
        { title: '交易渠道', key: 'channel', width: 120 },
        { title: '金额', slot: 'amount', width: 130 },
        { title: '余额金额', key: 'useBalanceAmount', width: 120, render: (h, params) => h('span', this.formatMoney(params.row.useBalanceAmount)) },
        { title: '第三方金额', key: 'useThirdAmount', width: 120, render: (h, params) => h('span', this.formatMoney(params.row.useThirdAmount)) },
        { title: '账户余额', slot: 'balance', width: 130 },
        { title: '交易时间', key: 'createTime', width: 180 },
        { title: '备注', key: 'remark', minWidth: 500 }
      ],
      tableData: [],
      allTransactions: [],
      total: 0,
      pageNo: 1,
      pageSize: 10
    }
  },
  mounted () {
    const query = this.$route.query;
    if (query.transactionType) {
      this.searchForm.type = query.transactionType;
    }
    this.loadData();
  },
  methods: {
    formatMoney (n) {
      // console.log(n, "===n====")
      return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    // 转换支付渠道显示名称
    translateChannel (channel) {
      if (!channel || channel === '-') return '-'
      const channelMap = {
        'balance': '账户余额',
        'hybrid': '混合支付',
        // 'balance/wechat': '账户余额/微信支付',
        'wechat': '微信支付',
        'refund': '余额退款',
        'refundWechat': '微信退款',
        'refundAlipay': '支付宝退款',
        'alipay': '支付宝支付',
        // 运营端批量充值/扣减写入的渠道
        'adminAdjust': '后台调整',
        // 兼容历史数据：批量充值旧版本写入 other
        'other': '后台调整'
      }
      return channelMap[channel] || channel
    },
    // 转换收支类型显示名称
    translateIncomeType (incomeType) {
      if (!incomeType || incomeType === '-') return '-'
      const incomeTypeMap = {
        'income': '收入',
        'expense': '支出'
      }
      return incomeTypeMap[incomeType] || incomeType
    },
    // 转换交易类型显示名称
    translateTypeName (typeName) {
      if (!typeName || typeName === '-') return '-'
      const typeNameMap = {
        'recharge': '充值',
        'payment': '消费',
        'refund': '退款',
        // 运营端批量扣减（负数调整）写入的类型
        'adjustment': '调整'
      }
      return typeNameMap[typeName] || typeName
    },
    async loadData () {
      this.loading = true;
      try {
        const data = {};
        if (this.searchForm.type && this.searchForm.type !== 'all') {
          // data.transactionType = this.getTransactionType(this.searchForm.type);
          data.transactionType = this.searchForm.type;
        }
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          data.createTimeStart = this.formatDate(this.searchForm.dateRange[0]);
          data.createTimeEnd = this.formatDate(this.searchForm.dateRange[1]);
        }

        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/financeTransactionService/listFinanceTransaction',
          method: 'post',
          data
        });

        const resp = { data: res };
        if (resp.data.errcode === 0) {
          const list = Array.isArray(resp.data.data) ? resp.data.data : [];
          this.allTransactions = list.map(item => {
            return {
              id: item.id,
              tradeNo: item.transaction_no || '',
              instanceName: item.instance_name || '-',
              createTime: item.create_time || '-',
              incomeType: this.translateIncomeType(item.income_type),
              typeName: this.translateTypeName(item.type_name),
              channel: this.translateChannel(item.channel),
              useBalanceAmount: item.use_balance_amount || 0,
              useThirdAmount: item.use_third_amount || 0,
              amount: parseFloat(item.amount || 0),
              afterBalance: parseFloat(item.balance || 0),
              remark: item.remark || '-',
              _rawData: item
            };
          });
          this.total = this.allTransactions.length;
          this.handlePageChange(this.pageNo);
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '获取交易明细失败');
        }
      } catch (error) {
        console.error('获取交易明细失败:', error);
        this.$Message.error('获取交易明细失败');
      } finally {
        this.loading = false;
      }
    },
    handleSearch () {
      this.pageNo = 1;
      this.loadData();
    },
    // 重置交易明细筛选条件并重新查询
    handleReset () {
      this.searchForm = {
        type: '',
        dateRange: []
      }
      this.pageNo = 1;
      this.loadData();
    },
    handlePageChange (page) {
      this.pageNo = page;
      const start = (page - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.tableData = this.allTransactions.slice(start, end);
    },
    handlePageSizeChange (pageSize) {
      this.pageSize = pageSize;
      this.pageNo = 1;
      this.handlePageChange(1);
    },
    getTransactionType (type) {
      const typeMap = {
        'recharge': '充值',
        'consumption': '消费',
        'refund': '退款'
      };
      return typeMap[type] || '';
    },
    formatDate (date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
}
</script>

<style lang="less" scoped>
.transaction-details {
  padding: 16px 16px 100px 16px;
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

  &__filter {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 12px;

    .filter-item {

      /deep/ .ivu-input,
      /deep/ .ivu-select-selection {
        border-radius: 2px;
      }

      // 下拉/输入 13px（iView 默认 14px）
      /deep/ .ivu-select-placeholder,
      /deep/ .ivu-select-selected-value,
      /deep/ .ivu-select-input,
      /deep/ .ivu-select-selection,
      /deep/ .ivu-input {
        font-size: 13px !important;
      }
    }

    .search-btn {
      background: #4a7afb;
      border-color: #4a7afb;
      padding: 0 24px;
      border-radius: 2px;
      font-size: 13px;
    }

    .search-btn1 {
      font-size: 13px;
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

      /deep/ .ivu-table-tip {
        height: 200px;
        line-height: 200px;

        span {
          color: #c5c8ce;
          font-size: 14px;
        }
      }

      .amount-text {
        font-weight: 500;

        &.plus {
          color: #19be6b;
        }

        &.minus {
          color: #ed4014;
        }
      }
    }
  }

  &__page {
    margin-top: 24px;
    text-align: right;
  }
}
</style>
