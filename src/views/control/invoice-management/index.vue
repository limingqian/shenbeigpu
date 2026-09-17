<template>
  <div class="invoice-management">
    <!-- 顶部面包屑 -->
    <div class="invoice-management__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>充值中心</BreadcrumbItem>
        <BreadcrumbItem>发票管理</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <Row :gutter="16">
      <!-- 左侧：统计与抬头信息 -->
      <Col :span="5">
        <!-- 发票金额统计 -->
        <div class="sidebar-section">
          <div class="section-header">
            <span class="title">发票金额</span>
            <span class="unit">(单位：元)</span>
          </div>
          <div class="stats-card">
            <div class="stats-item">
              <span class="label">累计充值</span>
              <span class="value">{{ stats.totalRecharge.toFixed(2) }}</span>
            </div>
            <div class="stats-item">
              <span class="label">充值已开票</span>
              <span class="value">{{ stats.totalInvoiced.toFixed(2) }}</span>
            </div>
            <div class="stats-item highlight">
              <span class="label">可开票金额</span>
              <span class="value">{{ stats.availableAmount.toFixed(2) }}</span>
            </div>
            <div class="stats-footer">
              <a class="action-link" @click="handleApply">去开票</a>
            </div>
          </div>
        </div>

        <!-- 发票抬头信息 -->
        <div class="sidebar-section" style="margin-top: 16px">
          <div class="section-header">
            <span class="title">发票信息</span>
          </div>
          <div class="info-card">
            <div class="info-item">
              <span class="label">发票抬头</span>
              <span class="value empty">未设置</span>
            </div>
            <div class="info-item">
              <span class="label">税号</span>
              <span class="value empty">未设置</span>
            </div>
            <div class="info-item">
              <span class="label">寄送地址</span>
              <span class="value empty">未设置</span>
            </div>
            <div class="info-item">
              <span class="label">电子邮箱</span>
              <span class="value empty">未设置</span>
            </div>
            <div class="info-footer">
              <a class="action-link" @click="handleEditConfig">编辑</a>
            </div>
          </div>
        </div>
      </Col>

      <!-- 右侧：开票记录表格 -->
      <Col :span="19">
        <div class="main-content">
          <div class="content-title">开票记录</div>
          <Table
            :columns="columns"
            :data="tableData"
            :loading="loading"
            no-data-text="暂无数据"
            class="custom-table"
          >
            <!-- 发票总额槽 -->
            <template slot-scope="{ row }" slot="amount">
              <span class="amount-text">¥{{ row.amount.toFixed(2) }}</span>
            </template>

            <!-- 发票状态槽 -->
            <template slot-scope="{ row }" slot="statusText">
              <span :class="['status-tag', row.status]">{{ row.status }}</span>
            </template>

            <!-- 账户余额槽 -->
            <template slot-scope="{ row }" slot="balance">
              <span class="balance-text">¥{{ row.balance.toFixed(2) }}</span>
            </template>

            <!-- 操作槽 -->
            <template slot-scope="{ row }" slot="action">
              <a class="action-link" @click="handleView(row)">查看</a>
            </template>
          </Table>
          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="total > 0">
            <Page :total="total" :current="pageNo" :page-size="pageSize" @on-change="handlePageChange" />
          </div>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  name: 'InvoiceManagement',
  data() {
    return {
      loading: false,
      userId: 'user_001', // 测试用户ID
      total: 0,
      pageNo: 1,
      pageSize: 15,
      columns: [
        { title: '开票内容', key: 'content', minWidth: 150 },
        { title: '发票抬头', key: 'title', minWidth: 200 },
        { title: '发票总额', slot: 'amount', width: 120, align: 'right' },
        { title: '发票性质', key: 'nature', width: 120, align: 'center' },
        { title: '发票状态', slot: 'statusText', width: 120, align: 'center' },
        { title: '申请时间', key: 'createTime', width: 170, align: 'center' },
        { title: '账户余额', slot: 'balance', width: 120, align: 'right' },
        { title: '操作', slot: 'action', width: 100, align: 'center' }
      ],
      tableData: [],
      allInvoices: [],
      stats: {
        totalRecharge: 0,
        totalInvoiced: 0,
        availableAmount: 0
      }
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/financeInvoiceService/listFinanceInvoice',
          method: 'post',
          data: { userId: this.userId }
        });

        const resp = { data: res };
        if (resp.data.errcode === 0) {
          const list = Array.isArray(resp.data.data) ? resp.data.data : [];
          this.allInvoices = list.map(item => {
            return {
              id: item.id,
              content: item.content || '-',
              title: item.title || '-',
              amount: parseFloat(item.amount || 0),
              nature: item.invoice_type || '-',
              status: item.status || '-',
              createTime: item.create_time || '-',
              balance: parseFloat(item.balance || 0),
              _rawData: item
            };
          });
          this.total = this.allInvoices.length;
          this.handlePageChange(this.pageNo);
          this.calculateStats();
        } else {
          this.$Message.error(resp.data.errmsg || '获取发票列表失败');
        }
      } catch (error) {
        console.error('获取发票列表失败:', error);
        this.$Message.error('获取发票列表失败');
      } finally {
        this.loading = false;
      }
    },
    calculateStats() {
      this.stats.totalRecharge = 10000.00;
      this.stats.totalInvoiced = this.allInvoices.reduce((sum, item) => sum + item.amount, 0);
      this.stats.availableAmount = this.stats.totalRecharge - this.stats.totalInvoiced;
    },
    handlePageChange(page) {
      this.pageNo = page;
      const start = (page - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.tableData = this.allInvoices.slice(start, end);
    },
    handleApply() {
      this.$Message.info('触发申请发票操作');
    },
    handleEditConfig() {
      this.$Message.info('触发编辑发票抬头操作');
    },
    handleView(row) {
      this.$Message.info('查看发票：' + row.title);
    }
  }
}
</script>

<style lang="less" scoped>
.invoice-management {
  padding: 12px 20px;
  background: #f8f9fa;
  min-height: 100vh;

  &__breadcrumb {
    margin-bottom: 20px;
    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  // 侧边栏部分
  .sidebar-section {
    background: #fff;
    border-radius: 4px;
    padding: 16px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 16px;

      .title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      .unit {
        font-size: 11px;
        color: #999;
      }
    }

    .stats-card, .info-card {
      background: #f8f9fb;
      padding: 12px;
      border-radius: 4px;

      .stats-item, .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 12px;

        .label { color: #808695; }
        .value { color: #333; font-weight: 500; }
        .value.empty { color: #c5c8ce; }

        &.highlight {
          .label { color: #333; font-weight: 600; }
          .value { color: #333; font-weight: 700; }
        }
      }

      .stats-footer, .info-footer {
        text-align: right;
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid #eee;
        
        .action-link {
          font-size: 12px;
          color: #2d8cf0;
          &:hover { text-decoration: underline; }
        }
      }
    }
  }

  // 主内容部分
  .main-content {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    min-height: 500px;

    .content-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .custom-table {
      /deep/ .ivu-table-header thead tr th {
        background-color: #f2f5f9;
        color: #515a6e;
        font-weight: 600;
        height: 44px;
        border-bottom: none;
      }

      /deep/ .ivu-table-tip {
        height: 300px;
        line-height: 300px;
        span {
          color: #c5c8ce;
          font-size: 14px;
        }
      }

      .amount-text {
        font-weight: 600;
        color: #333;
      }

      .balance-text {
        font-weight: 600;
        color: #333;
      }

      .status-tag {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 2px;
        font-size: 12px;

        &.待开具 {
          background: #fff7e6;
          color: #fa8c16;
        }

        &.已开具 {
          background: #f6ffed;
          color: #52c41a;
        }

        &.已驳回 {
          background: #fff1f0;
          color: #f5222d;
        }
      }

      .action-link {
        color: #2d8cf0;
        font-size: 12px;
        cursor: pointer;
        &:hover { text-decoration: underline; }
      }
    }

    .pagination-wrapper {
      margin-top: 24px;
      text-align: center;
    }
  }
}
</style>
