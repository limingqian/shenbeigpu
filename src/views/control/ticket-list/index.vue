<template>
  <div class="ticket-list">
    <div class="ticket-list__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>帮助中心</BreadcrumbItem>
        <BreadcrumbItem>工单列表</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="ticket-list__panel">
      <div class="ticket-list__filter">
        <Input v-model="searchForm.ticketNo" placeholder="工单编号..." style="width: 180px" class="filter-item"
          clearable="" />
        <Select v-model="searchForm.status" placeholder="工单状态" style="width: 140px" class="filter-item" clearable="">
          <Option value="pending">待处理</Option>
          <Option value="processing">处理中</Option>
          <Option value="resolved">已解决</Option>
          <Option value="closed">已关闭</Option>
        </Select>
        <Select v-model="searchForm.type" placeholder="工单类型" style="width: 160px" class="filter-item" clearable="">
          <Option v-for="item in ticketTypeList" :key="item.value" :value="item.value">{{ item.label }}</Option>
        </Select>
        <Select v-model="searchForm.priority" placeholder="紧急程度" style="width: 120px" class="filter-item" clearable="">
          <Option value="low">低</Option>
          <Option value="medium">中</Option>
          <Option value="high">高</Option>
          <Option value="urgent">紧急</Option>
        </Select>
        <DatePicker type="daterange" v-model="searchForm.dateRange" placeholder="请选择时间范围" style="width: 220px"
          class="filter-item" clearable=""></DatePicker>
        <Button type="primary" icon="md-search" class="search-btn1" @click="handleSearch">搜索</Button>
        <Button style="margin-left: 0px;font-size: 13px;" icon="md-refresh" @click="handleReset">重置</Button>
      </div>
      <div class="ticket-list__content">
        <Table :columns="columns" :data="tableData" :loading="loading" class="custom-table"><template
            slot-scope="{ row }" slot="status"><span :class="['status-tag', row.status]">{{ getStatusText(row.status)
              }}</span></template><template slot-scope="{ row }" slot="priority"><span
              :class="['priority-tag', row.priority]">{{ getPriorityText(row.priority) }}</span></template><template
            slot-scope="{ row }" slot="type"><span>{{ getTypeText(row.type) }}</span></template><template
            slot-scope="{ row }" slot="description"><span class="description-text" :title="row.description">{{
              row.description }}</span></template><template slot-scope="{ row }" slot="action">
            <div class="action-btns"><a class="action-link" @click="handleView(row)">查看详情</a></div>
          </template>
        </Table>
        <div class="ticket-list__page" v-if="total > 0">
          <Page :total="total" :current="pageNo" :page-size="pageSize" :page-size-opts="[10, 20, 30]" show-sizer=""
            show-total="" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange">
          </Page>
        </div>
      </div>
    </div>
    <Modal v-model="detailModalVisible" :closable="true" :mask-closable="true" :footer-hide="true" width="640"
      class="ticket-detail-modal">
      <div slot="header" class="ticket-detail-modal__header">
        <Icon type="md-document-text" class="ticket-detail-modal__icon" />
        <span>工单详情</span>
      </div>
      <div v-if="currentTicket" class="detail-content">
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>工单信息</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">工单编号</span>
                <span class="value">{{ currentTicket.ticketNo || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">工单状态</span>
                <span class="value">
                  <span :class="['status-tag', currentTicket.status]">{{ getStatusText(currentTicket.status) }}</span>
                </span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">紧急程度</span>
                <span class="value">
                  <span :class="['priority-tag', currentTicket.priority]">{{ getPriorityText(currentTicket.priority)
                    }}</span>
                </span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">工单类型</span>
                <span class="value">{{ getTypeText(currentTicket.type) || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">联系方式</span>
                <span class="value">{{ currentTicket.contact || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">提交时间</span>
                <span class="value">{{ currentTicket.createTime || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="24">
              <div class="detail-item detail-item--full">
                <span class="label">问题描述</span>
                <div class="detail-desc">{{ currentTicket.description || '--' }}</div>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;" v-if="currentTicket.attachments">
              <Col span="24">
              <div class="detail-item detail-item--full">
                <span class="label">附件</span>
                <div class="attachment-container">
                  <sp-upload
                    :disabled="$data.$check([{ 'judge': { 'next': '&&', 'after': '1', 'conditions': '==', 'before': '1' } }])"
                    v-model="currentTicket.attachments" :max-num="5" :max-size="50" :show-name="false"
                    :format="['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar', '7z', 'mp4']">
                  </sp-upload>
                </div>
              </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
export default {
  components: {}, props: [], name: "scp-shenbeigpuai-control-ticket-list", data () { return { "loading": false, "searchForm": { "ticketNo": "", "status": "", "type": "", "priority": "", "dateRange": [] }, "columns": [{ "title": "工单编号", "key": "ticketNo", "minWidth": 180 }, { "title": "工单状态", "slot": "status", "width": 120 }, { "title": "紧急程度", "slot": "priority", "width": 100 }, { "title": "工单类型", "slot": "type", "width": 140 }, { "title": "问题描述", "slot": "description", "minWidth": 200 }, { "title": "提交时间", "key": "createTime", "width": 180 }, { "title": "操作", "slot": "action", "width": 100, align: 'center' }], "tableData": [], "allTickets": [], "total": 0, "pageNo": 1, "pageSize": 10, "detailModalVisible": false, "currentTicket": null, "ticketTypeList": [] } }, computed: {}, watch: {}, created () {
    this.fetchTicketTypeDict()
  }, beforeMount () { }, mounted () {
    this.loadData()
  }, destroyed () { }, methods: {
    async loadData () {
      this.loading = true
      try {
        // 处理日期范围
        let startTime, endTime
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          startTime = this.formatDate(this.searchForm.dateRange[0])
          endTime = this.formatDate(this.searchForm.dateRange[1])
        }

        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/consultTicketService/listConsultTicket',
          method: 'post',
          data: {
            ticketNo: this.searchForm.ticketNo || undefined,
            status: this.searchForm.status || undefined,
            type: this.searchForm.type || undefined,
            priority: this.searchForm.priority || undefined,
            startTime: startTime || undefined,
            endTime: endTime || undefined
          }
        })

        const resp = { data: res }
        if (resp.data.errcode === 0) {
          const list = Array.isArray(resp.data.data) ? resp.data.data : []
          this.allTickets = list.map(item => {
            return {
              id: item.id,
              ticketNo: item.ticketNo || '',
              status: item.status || 'pending',
              priority: item.priority || 'low',
              type: item.type || '',
              description: item.description || '',
              contact: item.contact || '',
              createTime: item.createTime || '',
              updateTime: item.updateTime || '',
              attachments: this.parseAttachments(item.attachments),
              _rawData: item
            }
          })
          this.total = this.allTickets.length
          this.handlePageChange(this.pageNo)
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '获取工单列表失败')
        }
      } catch (error) {
        console.error('获取工单列表失败:', error)
        this.$Message.error('获取工单列表失败')
      } finally {
        this.loading = false
      }
    }, async fetchTicketTypeDict () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/as/sc/dict/getDictInfoList',
          method: 'post',
          data: { type: 'ticket_type' }
        })
        if (res.errcode === 0 && res.data) {
          this.ticketTypeList = res.data || []
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        }
      } catch (e) {
        console.error('获取工单类型字典失败:', e)
        this.ticketTypeList = [
          { value: 'usage', label: '产品使用咨询' },
          { value: 'business', label: '业务受理' },
          { value: 'complaint', label: '投诉建议' },
          { value: 'bug', label: '功能异常' },
          { value: 'other', label: '其他' }
        ]
      }
    }, handleSearch () {
      this.pageNo = 1
      this.loadData()
    }, handleReset () {
      // 整体替换对象保证响应式生效
      this.searchForm = {
        ticketNo: '',
        status: '',
        type: '',
        priority: '',
        dateRange: []
      }
      this.pageNo = 1
      this.loadData()
    }, handlePageChange (page) {
      this.pageNo = page
      const start = (page - 1) * this.pageSize
      const end = start + this.pageSize
      this.tableData = this.allTickets.slice(start, end)
    }, handlePageSizeChange (pageSize) {
      this.pageSize = pageSize
      this.pageNo = 1
      const start = 0
      const end = this.pageSize
      this.tableData = this.allTickets.slice(start, end)
    }, handleView (row) {
      this.currentTicket = row
      this.detailModalVisible = true
    }, getStatusText (status) {
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'resolved': '已解决',
        'closed': '已关闭'
      }
      return statusMap[status] || status || '-'
    }, getPriorityText (priority) {
      const priorityMap = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'urgent': '紧急'
      }
      return priorityMap[priority] || priority || '-'
    }, getTypeText (type) {
      const typeItem = this.ticketTypeList.find(t => t.value === type)
      return typeItem ? typeItem.label : type || '-'
    }, parseAttachments (attachments) {
      if (!attachments) return ''
      try {
        // 尝试解析JSON数组
        if (attachments.startsWith('[')) {
          const arr = JSON.parse(attachments)
          return arr.join(', ')
        }
        return attachments
      } catch (e) {
        return attachments
      }
    }, formatDate (date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
  }, config: {}, provideData: {}, canvasConfig: { "scale": "100", "type": "16-9--2" }
}
</script>
<style scoped lang="less">
.ticket-list {
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

  &__filter {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 12px;

    .filter-item {
      /deep/ .ivu-input {
        border-radius: 2px;
      }

      // 下拉选 13px
      /deep/ .ivu-select-placeholder,
      /deep/ .ivu-select-selected-value,
      /deep/ .ivu-select-input,
      /deep/ .ivu-select-selection {
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

      .status-tag {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &.pending,
        &.待处理 {
          background: #fff7e6;
          color: #fa8c16;
        }

        &.processing,
        &.处理中 {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.resolved,
        &.已解决 {
          background: #f6ffed;
          color: #52c41a;
        }

        &.closed,
        &.已关闭 {
          background: #f5f5f5;
          color: #999;
        }
      }

      .priority-tag {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;

        &.low,
        &.低 {
          background: #f5f5f5;
          color: #999;
        }

        &.medium,
        &.中 {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.high,
        &.高 {
          background: #fff7e6;
          color: #fa8c16;
        }

        &.urgent,
        &.紧急 {
          background: #fff1f0;
          color: #ff4d4f;
        }
      }

      .description-text {
        display: inline-block;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
      }

      .action-btns {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;

        .action-link {
          color: #2d8cf0;
          font-size: 12px;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  &__page {
    margin-top: 24px;
    text-align: right;
  }
}

.ticket-detail-modal {
  &__header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #1f2937;

    .ticket-detail-modal__icon {
      font-size: 18px;
      color: #4079ff;
      margin-right: 8px;
    }
  }

  /deep/ .ivu-modal-body {
    padding: 20px 28px 28px;
  }

  .detail-content {
    .detail-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 14px;
        letter-spacing: 0.5px;

        .section-title__bar {
          display: inline-block;
          width: 3px;
          height: 14px;
          background: linear-gradient(180deg, #4079ff 0%, #2b5fd9 100%);
          border-radius: 2px;
          margin-right: 8px;
        }
      }

      .detail-grid-self {
        background: #fafbfc;
        border: 1px solid #eef0f4;
        border-radius: 6px;
        padding: 14px 18px;
      }

      .detail-item {
        display: flex;
        align-items: center;
        font-size: 13px;
        line-height: 28px;
        min-width: 0;

        &--full {
          flex-direction: column;
          align-items: stretch;

          .label {
            margin-bottom: 6px;
          }
        }

        .label {
          color: #6b7280;
          min-width: 88px;
          margin-right: 8px;
          font-weight: 400;
          flex-shrink: 0;
        }

        .value {
          color: #1f2937;
          font-weight: 500;
          word-break: break-all;
        }

        .status-tag,
        .priority-tag {
          display: inline-block;
          // padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .detail-desc {
          margin: 0;
          padding: 10px 12px;
          background: #f8f8f9;
          border-radius: 4px;
          font-size: 12px;
          line-height: 22px;
          color: #1d2129;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
  }
}
</style>