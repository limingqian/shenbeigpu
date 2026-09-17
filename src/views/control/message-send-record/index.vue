<template>
  <div class="message-send-record">
    <!-- 面包屑/标题 -->
    <div class="message-send-record__header">
      <Breadcrumb>
        <BreadcrumbItem>消息管理</BreadcrumbItem>
        <BreadcrumbItem>预警发送记录</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 搜索栏 -->
    <Card :bordered="false" dis-hover class="message-send-record__search-card">
      <Form :model="searchForm" inline>
        <FormItem label="消息类型">
          <Select v-model="searchForm.messageType" placeholder="请选择" clearable style="width: 150px">
            <Option value="release">到期释放预警</Option>
            <Option value="balance">余额预警</Option>
          </Select>
        </FormItem>
        <FormItem label="发送渠道">
          <Select v-model="searchForm.channel" placeholder="请选择" clearable style="width: 150px">
            <Option value="email">站内信</Option>
            <Option value="sms">短信</Option>
            <Option value="wx">微信</Option>
          </Select>
        </FormItem>
        <!-- <FormItem label="发送状态">
          <Select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <Option value="SUCCESS">成功</Option>
            <Option value="PENDING">待发送</Option>
            <Option value="FAILED">失败</Option>
          </Select>
        </FormItem> -->
        <FormItem>
          <Button type="primary" icon="ios-search" @click="handleSearch">查询</Button>
          <Button icon="md-refresh" @click="handleReset">重置</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card :bordered="false" dis-hover class="message-send-record__table-card">
      <Table :columns="columns" :data="data" :loading="loading" size="small">
        <!-- 消息类型列 -->
        <template slot-scope="{ row }" slot="messageType">
          <Tag :color="row.message && row.message.messageType === 'release' ? 'blue' : 'green'">
            {{ row.message ? getMessageTypeText(row.message.messageType) : '--' }}
          </Tag>
        </template>

        <!-- 消息标题列 -->
        <template slot-scope="{ row }" slot="title">
          <span>{{ row.message ? row.message.title : '--' }}</span>
        </template>

        <!-- 发送渠道列 -->
        <template slot-scope="{ row }" slot="channel">
          <Tag>{{ getChannelText(row.channel) }}</Tag>
        </template>

        <!-- 状态列 -->
        <!-- <template slot-scope="{ row }" slot="status">
          <Tag :color="getStatusColor(row.status)">
            {{ getStatusText(row.status) }}
          </Tag>
        </template> -->

        <!-- 发送时间列 -->
        <template slot-scope="{ row }" slot="sendTime">
          <span>{{ row.sendTime || '--' }}</span>
        </template>

        <!-- 操作列 -->
        <template slot-scope="{ row }" slot="action">
          <a @click="handleViewDetail(row)">查看详情</a>
        </template>
      </Table>

      <div class="message-send-record__pagination">
        <Page :total="total" :current="pageNo" :page-size="pageSize" show-total show-sizer size="small"
          @on-change="changePage" @on-page-size-change="changePageSize" />
      </div>
    </Card>

    <!-- 详情弹框 -->
    <Modal v-model="detailModalVisible" title="发送记录详情" width="700" :footer-hide="true">
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-section">
          <div class="section-title">发送信息</div>
          <Row :gutter="16">
            <Col span="12">
            <div class="detail-item">
              <span class="label">记录ID:</span>
              <span class="value">{{ currentRecord.id }}</span>
            </div>
            </Col>
            <Col span="12">
            <div class="detail-item">
              <span class="label">用户ID:</span>
              <span class="value">{{ currentRecord.userId }}</span>
            </div>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col span="12">
            <div class="detail-item">
              <span class="label">发送渠道:</span>
              <span class="value">{{ getChannelText(currentRecord.channel) }}</span>
            </div>
            </Col>
            <Col span="12">
            <div class="detail-item">
              <span class="label">发送状态:</span>
              <span class="value">
                <Tag :color="getStatusColor(currentRecord.status)">{{ getStatusText(currentRecord.status) }}</Tag>
              </span>
            </div>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col span="12">
            <div class="detail-item">
              <span class="label">发送时间:</span>
              <span class="value">{{ currentRecord.sendTime || '--' }}</span>
            </div>
            </Col>
            <Col span="12">
            <div class="detail-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ currentRecord.createTime }}</span>
            </div>
            </Col>
          </Row>
        </div>

        <Divider />

        <div class="detail-section" v-if="currentRecord.message">
          <div class="section-title">关联消息</div>
          <Row :gutter="16">
            <Col span="12">
            <div class="detail-item">
              <span class="label">消息ID:</span>
              <span class="value">{{ currentRecord.message.id }}</span>
            </div>
            </Col>
            <Col span="12">
            <div class="detail-item">
              <span class="label">消息类型:</span>
              <span class="value">
                <Tag :color="currentRecord.message.messageType === 'release' ? 'blue' : 'green'">
                  {{ getMessageTypeText(currentRecord.message.messageType) }}
                </Tag>
              </span>
            </div>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col span="24">
            <div class="detail-item">
              <span class="label">消息标题:</span>
              <span class="value">{{ currentRecord.message.title }}</span>
            </div>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col span="24">
            <div class="detail-item">
              <span class="label">消息内容:</span>
              <div class="content-box">{{ currentRecord.message.content }}</div>
            </div>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col span="12">
            <div class="detail-item">
              <span class="label">发送目标:</span>
              <span class="value">{{ currentRecord.message.target || '--' }}</span>
            </div>
            </Col>
            <Col span="12">
            <div class="detail-item">
              <span class="label">消息状态:</span>
              <span class="value">{{ currentRecord.message.status }}</span>
            </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'MessageSendRecord',
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
      searchForm: {
        messageType: '',
        channel: '',
        status: ''
      },
      columns: [
        {
          title: '记录ID',
          key: 'id',
          width: 180,
          tooltip: true
        },
        {
          title: '消息类型',
          slot: 'messageType',
          width: 140,
          align: 'center'
        },
        {
          title: '消息标题',
          slot: 'title',
          minWidth: 200,
          tooltip: true
        },
        {
          title: '发送渠道',
          slot: 'channel',
          width: 100,
          align: 'center'
        },
        // {
        //   title: '发送状态',
        //   slot: 'status',
        //   width: 100,
        //   align: 'center'
        // },
        {
          title: '发送时间',
          slot: 'sendTime',
          width: 180
        },
        {
          title: '创建时间',
          key: 'createTime',
          width: 180
        },
        {
          title: '操作',
          slot: 'action',
          width: 100,
          align: 'center',
          fixed: 'right'
        }
      ],
      detailModalVisible: false,
      currentRecord: null
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loading = true
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        messageType: this.searchForm.messageType,
        channel: this.searchForm.channel,
        // status: this.searchForm.status
        status: 'SUCCESS'
      }
      this.$hdAxios.request({
        url: '/api/ac/shenbeigpuai/messageSendRecordService/listMessageSendRecordPage',
        method: 'post',
        data: params
      }).then(res => {
        this.loading = false
        console.log('res', res)
        if (res.errcode === 0) {
          const page = res.data
          this.data = page.results || []
          this.total = page.totalRecord || 0
        } else {
          this.$Message.error(res.errmsg || '查询失败')
        }
      }).catch(() => {
        this.loading = false
        this.$Message.error('网络异常')
      })
    },
    changePage(page) {
      this.pageNo = page
      this.loadData()
    },
    changePageSize(size) {
      this.pageSize = size
      this.pageNo = 1
      this.loadData()
    },
    handleSearch() {
      this.pageNo = 1
      this.loadData()
    },
    handleReset() {
      this.searchForm = {
        messageType: '',
        channel: '',
        status: ''
      }
      this.pageNo = 1
      this.loadData()
    },
    handleViewDetail(row) {
      this.currentRecord = row
      this.detailModalVisible = true
    },
    getMessageTypeText(type) {
      const map = {
        'release': '到期释放预警',
        'balance': '余额预警'
      }
      return map[type] || type
    },
    getChannelText(channel) {
      const map = {
        'email': '站内信',
        'sms': '短信',
        'wx': '微信'
      }
      return map[channel] || channel
    },
    getStatusText(status) {
      const map = {
        'SUCCESS': '成功',
        'PENDING': '待发送',
        'FAILED': '失败'
      }
      return map[status] || status
    },
    getStatusColor(status) {
      const map = {
        'SUCCESS': 'success',
        'PENDING': 'warning',
        'FAILED': 'error'
      }
      return map[status] || 'default'
    }
  }
}
</script>

<style lang="less" scoped>
.message-send-record {
  padding: 12px 24px;
  background: #fff;
  min-height: 100vh;

  &__header {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__search-card {
    margin-bottom: 20px;

    /deep/ .ivu-card-body {
      padding: 16px;
    }

    /deep/ .ivu-form {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    /deep/ .ivu-form-item {
      margin-bottom: 0;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    /deep/ .ivu-form-item-label {
      color: #666;
      font-size: 13px;
      padding: 0 12px 0 0;
    }

    /deep/ .ivu-select,
    /deep/ .ivu-select-selection {
      border-radius: 4px;
    }

    /deep/ .ivu-btn {
      border-radius: 4px;
      font-size: 13px;
      padding: 4px 15px;
      margin-left: 8px;
    }

    /deep/ .ivu-btn-primary {
      background-color: #4079ff;
      border-color: #4079ff;
    }
  }

  &__table-card {
    /deep/ .ivu-card-body {
      padding: 0;
    }

    /deep/ .ivu-table {
      font-size: 13px;
    }

    /deep/ .ivu-table-header th {
      background-color: #f2f5fa;
      color: #666;
      font-weight: normal;
      font-size: 12px;
      border-bottom: none;
    }

    /deep/ .ivu-table-td {
      font-size: 12px;
      color: #333;
    }

    /deep/ .ivu-table-wrapper {
      border: none;
    }

    /deep/ .ivu-table:before,
    /deep/ .ivu-table:after {
      display: none;
    }

    /deep/ .ivu-tag {
      border-radius: 2px;
      font-size: 12px;
    //   padding: 2px 8px;
    }

    /deep/ .ivu-table-cell a {
      color: #4079ff;
      font-size: 12px;
    }

    /deep/ .ivu-table-cell a:hover {
      text-decoration: underline;
    }
  }

  &__pagination {
    margin-top: 20px;
    text-align: right;
    padding: 16px 0;

    /deep/ .ivu-page {
      font-size: 12px;
    }

    /deep/ .ivu-page-item,
    /deep/ .ivu-page-options-elevator {
      border-radius: 2px;
    }
  }
}

.detail-content {
  padding: 0 8px;

  .detail-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
      padding-left: 8px;
      border-left: 3px solid #4079ff;
    }

    .detail-item {
      margin-bottom: 12px;
      line-height: 28px;

      .label {
        display: inline-block;
        width: 90px;
        color: #666;
        font-size: 13px;
        text-align: right;
        margin-right: 12px;
      }

      .value {
        color: #333;
        font-size: 13px;
      }

      .content-box {
        margin-top: 12px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 4px;
        line-height: 1.8;
        color: #333;
        font-size: 13px;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }

  /deep/ .ivu-tag {
    border-radius: 2px;
    font-size: 12px;
  }
}
</style>
