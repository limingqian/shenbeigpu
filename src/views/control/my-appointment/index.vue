<template>
  <div class="my-appointment">
    <!-- 顶部面包屑 -->
    <div class="my-appointment__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>订单管理</BreadcrumbItem>
        <BreadcrumbItem>我的预约</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 筛选栏 -->
    <div class="my-appointment__filter">
      <Input v-model="searchForm.appointmentId" placeholder="预约编号..." style="width: 200px" class="filter-item" />
      <Input v-model="searchForm.productName" placeholder="请输入产品名称..." style="width: 200px" class="filter-item" />
      <DatePicker
        type="daterange"
        v-model="searchForm.dateRange"
        placeholder="请选择时间范围"
        style="width: 220px"
        class="filter-item"
      ></DatePicker>
      <Button type="primary" class="search-btn" @click="handleSearch">搜索</Button>
    </div>

    <!-- 预约表格 -->
    <div class="my-appointment__content">
      <Table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        no-data-text="暂无数据"
        class="custom-table"
      >
        <!-- 序号槽 -->
        <template slot-scope="{ index }" slot="index">
          <span>{{ (index + 1).toString().padStart(2, '0') }}</span>
        </template>

        <!-- 订单金额槽 -->
        <template slot-scope="{ row }" slot="amount">
          <span class="amount-text">¥0.00</span>
        </template>

        <!-- 操作槽 -->
        <template slot-scope="{ row }" slot="action">
          <div class="action-btns">
            <a class="action-link" @click="handleView(row)">查看</a>
            <a class="action-link cancel" @click="handleCancel(row)">取消</a>
          </div>
        </template>
      </Table>

      <!-- 分页 -->
      <div class="my-appointment__page" v-if="total > 0">
        <Page 
          :total="total" 
          :current="pageNo" 
          :page-size="pageSize" 
          @on-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyAppointment',
  data() {
    return {
      loading: false,
      searchForm: {
        appointmentId: '',
        productName: '',
        dateRange: []
      },
      columns: [
        { title: '序号', slot: 'index', width: 80, align: 'center' },
        { title: '预约编号', key: 'appointmentNo', minWidth: 160 },
        { title: '预约设备', key: 'deviceName', minWidth: 180 },
        { title: '计费方式', key: 'billingMethod', width: 150, align: 'center' },
        { title: '预约截至时间', key: 'endTime', width: 170, align: 'center' },
        { title: '订单金额', slot: 'amount', width: 120, align: 'center' },
        { title: '下单时间', key: 'createTime', width: 170, align: 'center' },
        { title: '操作', slot: 'action', width: 120, align: 'center' }
      ],
      tableData: [],
      allAppointments: [],
      total: 0,
      pageNo: 1,
      pageSize: 15
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
          url: '/api/ac/shenbeigpuai/orderReservationService/listOrderReservation',
          method: 'post',
          data: {}
        });

        const resp = { data: res };
        if (resp.data.errcode === 0) {
          const list = Array.isArray(resp.data.data) ? resp.data.data : [];
          this.allAppointments = list.map(item => {
            return {
              id: item.id,
              appointmentNo: 'AP' + item.id.substring(0, 8).toUpperCase(),
              deviceName: item.device_name || '-',
              billingMethod: item.billing_method || '-',
              endTime: item.reservation_time || '-',
              amount: '¥0.00',
              createTime: item.create_time || '-',
              status: item.status || '',
              _rawData: item
            };
          });
          this.total = this.allAppointments.length;
          this.handlePageChange(this.pageNo);
        } else {
          this.$Message.error(resp.data.errmsg || '获取预约列表失败');
        }
      } catch (error) {
        console.error('获取预约列表失败:', error);
        this.$Message.error('获取预约列表失败');
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.pageNo = 1;
      this.loadData();
    },
    handlePageChange(page) {
      this.pageNo = page;
      const start = (page - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.tableData = this.allAppointments.slice(start, end);
    },
    handleView(row) {
      this.$Message.info('查看预约：' + row.appointmentNo);
    },
    handleCancel(row) {
      if (row.status !== '待处理') {
        this.$Message.warning('只有待处理的预约可以取消');
        return;
      }
      this.$Modal.confirm({
        title: '确认取消预约',
        content: `确定要取消预约 ${row.appointmentNo} 吗？`,
        onOk: () => {
          this.$Message.success('预约取消成功');
          this.loadData();
        },
        onCancel: () => {
          this.$Message.info('已取消操作');
        }
      });
    }
  }
}
</script>

<style lang="less" scoped>
.my-appointment {
  padding: 12px 20px;
  background: #fff;
  min-height: 100vh;

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
      /deep/ .ivu-input {
        border-radius: 2px;
      }
    }

    .search-btn {
      background: #4a7afb;
      border-color: #4a7afb;
      padding: 0 24px;
      border-radius: 2px;
    }
  }

  &__content {
    .custom-table {
      /deep/ .ivu-table-header thead tr th {
        background-color: #f2f5f9;
        color: #515a6e;
        font-weight: 600;
        height: 44px;
        border-bottom: none;
      }

      .amount-text {
        font-weight: 600;
        color: #333;
      }

      .action-btns {
        display: flex;
        justify-content: center;
        gap: 12px;

        .action-link {
          color: #2d8cf0;
          font-size: 12px;
          cursor: pointer;
          &:hover { text-decoration: underline; }
          &.cancel { color: #2d8cf0; }
        }
      }
    }
  }

  &__page {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
