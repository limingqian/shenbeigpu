<template>
  <div class="billing-detail">
    <div class="billing-detail__header">
      <Breadcrumb>
        <BreadcrumbItem>模型</BreadcrumbItem>
        <BreadcrumbItem>使用记录</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <!-- 筛选区域 -->
    <Card :bordered="false" dis-hover class="billing-filter">
      <div class="filter-row">
        <!-- 日期选择 -->
        <div class="filter-item">
          <Select v-model="filterForm.dateType" style="width: 80px">
            <Option value="day">按天</Option>
            <Option value="month">按月</Option>
          </Select>
          <DatePicker
            v-show="filterForm.dateType === 'day'"
            v-model="filterForm.dateRange"
            type="daterange"
            placeholder="选择日期范围"
            style="width: 220px; margin-left: 8px"
            @on-change="handleDateChange"
          />
          <DatePicker
            v-show="filterForm.dateType === 'month'"
            v-model="filterForm.monthRange"
            type="month"
            placeholder="选择月份"
            style="width: 220px; margin-left: 8px"
            @on-change="handleMonthChange"
          />
        </div>

        <!-- API密钥 -->
        <div class="filter-item">
          <Select v-model="filterForm.apiKey" placeholder="请选择API密钥" clearable style="width: 220px">
            <Option v-for="item in apiKeyList" :key="item.id" :value="item.id">{{ item.key_name }}</Option>
          </Select>
        </div>

        <!-- 模型名称 -->
        <div class="filter-item">
          <Select v-model="filterForm.modelName" placeholder="请选择模型" clearable style="width: 200px">
            <Option v-for="item in modelList" :key="item.value" :value="item.value">{{ item.label }}</Option>
          </Select>
        </div>

        <!-- 查询按钮 -->
        <Button type="primary" icon="md-search" @click="handleSearch">搜索</Button>
        <Button style="margin-left: 0px;font-size: 13px;" icon="md-refresh" @click="handleReset">重置</Button>
      </div>
    </Card>

    <!-- 金额汇总 -->
    <!-- <Card :bordered="false" dis-hover class="billing-summary">
      <div class="summary-row">
        <div class="summary-item">
          <div class="label">账单金额</div>
          <div class="value">¥ {{ summaryData.billAmount }}</div>
        </div>
        <div class="separator">=</div>
        <div class="summary-item">
          <div class="label">计费金额</div>
          <div class="value">¥ {{ summaryData.chargeAmount }}</div>
        </div>
        <div class="separator">-</div>
        <div class="summary-item">
          <div class="label">折扣优惠金额</div>
          <div class="value">¥ {{ summaryData.discountAmount }}</div>
        </div>
        <div class="separator">-</div>
        <div class="summary-item">
          <div class="label">代金券抵扣金额</div>
          <div class="value">¥ {{ summaryData.voucherAmount }}</div>
        </div>
      </div>
    </Card> -->

    <!-- API 使用记录表格 -->
    <Card :bordered="false" dis-hover class="billing-table-card">
      <div class="table-header">
        <!-- <Tabs v-model="activeTab" @on-click="handleTabChange">
          <TabPane label="明细" name="detail"></TabPane>
          <TabPane label="分摊" name="allocation"></TabPane>
        </Tabs> -->
        <div class="table-actions" style="margin-left: auto;">
          <!-- <Button type="text" @click="handleViewExportRecord">查看导出记录</Button> -->
          <Button icon="md-arrow-round-down" @click="handleExport">导出</Button>
        </div>
      </div>

      <Table
        style="margin: 0px 16px 10px 16px"
        :columns="tableColumns"
        :data="tableData"
        :loading="loading"
        stripe
      />

      <div class="table-footer">
        <Page
          :total="pagination.total"
          :current="pagination.pageNo"
          :page-size="pagination.pageSize"
          show-total
          show-sizer
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
        />
      </div>
    </Card>
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-control-api-buy',
  data() {
    return {
      // 筛选表单
      filterForm: {
        dateType: 'day',
        dateRange: [],
        monthRange: null,
        apiKey: '',
        modelName: ''
      },

      // 下拉选项
      apiKeyList: [],
      modelList: [],

      // 汇总数据
      summaryData: {
        billAmount: '0.00',
        chargeAmount: '0.00',
        discountAmount: '0.00',
        voucherAmount: '0.00'
      },

      // 表格加载状态
      loading: false,

      // 表格列定义（对应后端 Sub2ApiUsageLogVo 脱敏字段）
      tableColumns: [
        { title: 'API密钥', key: 'apiKeyName', minWidth: 160 },
        { title: '模型', key: 'model', minWidth: 170 },
        // { title: '推理强度', key: 'reasoningEffort', minWidth: 100 },
        { title: '入口端点', key: 'inboundEndpoint', minWidth: 190 },
        { title: '请求类型', key: 'requestType', minWidth: 110 },
        { title: '流式', key: 'stream', minWidth: 80 },
        { title: '输入Token', key: 'inputTokens', minWidth: 100 },
        { title: '输出Token', key: 'outputTokens', minWidth: 100 },
        { title: '缓存Token', key: 'cacheReadTokens', minWidth: 120 },
        { title: '耗时(ms)', key: 'durationMs', minWidth: 90 },
        // { title: '首Token(ms)', key: 'firstTokenMs', minWidth: 120 },
        { title: '创建时间', key: 'createdAt', minWidth: 180 }
      ],

      // 表格显示数据（fetchData 请求后端后赋值）
      tableData: [],

      // 分页
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  computed: {},
  watch: {
    'filterForm.dateType'(newVal) {
      if (newVal === 'day') {
        this.filterForm.monthRange = null
        this.initDateRange()
      } else {
        this.filterForm.dateRange = []
        this.filterForm.monthRange = new Date()
      }
    }
  },
  mounted() {
    this.initDateRange()
    this.fetchApiKeyList()
    this.fetchModelList()
    this.fetchData()
  },
  methods: {
    // 初始化日期范围（默认当天）
    initDateRange() {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      this.filterForm.dateRange = [start, end]
    },

    // 日期变化
    handleDateChange(date) {
      this.filterForm.dateRange = date
    },

    // 月份变化
    handleMonthChange(date) {
      this.filterForm.monthRange = date
    },

    // 查询
    handleSearch() {
      this.pagination.pageNo = 1
      this.fetchData()
    },

    // 重置
    handleReset() {
      this.filterForm = {
        dateType: 'day',
        dateRange: [],
        monthRange: null,
        apiKey: '',
        modelName: ''
      }
      this.initDateRange()
      this.handleSearch()
    },

    // 获取模型列表（复用 portalApiService，与 api-list 模型广场同源；后端 SQL 已自动按 del_flag='0' 过滤）
async fetchModelList() {
  try {
    const res = await this.$hdAxios.request({
      url: '/api/ac/shenbeigpuai/portalApiService/listPortalApiIntro',
      method: 'post',
      data: {}
    })
    const resp = { data: res }
    if (resp.data.errcode === 0) {
      const list = Array.isArray(resp.data.data) ? resp.data.data : []
      // 取 modelCode 作为 value（与 sub2ApiStatisticsService 接收的 model 字段对齐）、
      // modelName 作为下拉展示文本；按 modelCode 去重
      const seen = new Set()
      this.modelList = list
        .map(item => ({ value: item.modelCode || '', label: item.modelName || item.modelCode || '' }))
        .filter(item => {
          if (!item.value || seen.has(item.value)) return false
          seen.add(item.value)
          return true
        })
    } else if (resp.data.errcode === 1001) {
      sessionStorage.clear()
      this.$router.push('/login')
    } else {
      this.$Message.error(resp.data.errmsg || '获取模型列表失败')
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
    this.$Message.error('获取模型列表失败')
  }
},

// 获取当前登录人的 API 密钥列表（按 user_id + del_flag=0 过滤）
    async fetchApiKeyList() {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userApiKeyPackageService/listPackageUserApiKey',
          method: 'post',
          data: {}
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          // 后端 listUserApiKey 已自动按当前登录人 userId + del_flag='0' 过滤
          // 下拉只取 id 和 key_name（避免下拉展示过长字段）
          this.apiKeyList = (resp.data.data || []).map(item => ({
            id: item.id,
            key_name: item.key_name
          }))
        } else if (resp.data.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '获取API密钥列表失败')
        }
      } catch (error) {
        console.error('获取API密钥列表失败:', error)
        this.$Message.error('获取API密钥列表失败')
      }
    },

    // 获取数据（对接后端 sub2ApiStatisticsService/queryTokenUsage）
    async fetchData() {
      this.loading = true
      try {
        const params = {
          pageNo: this.pagination.pageNo,
          pageSize: this.pagination.pageSize
        }
        // 筛选条件（仅非空才传，后端收进 page.params）
        if (this.filterForm.modelName) {
          params.model = this.filterForm.modelName
        }
        if (this.filterForm.apiKey && this.filterForm.apiKey.trim()) {
          params.apiKeyId = this.filterForm.apiKey.trim()
        }
        if (this.filterForm.dateType === 'day' && this.filterForm.dateRange.length === 2) {
          params.startDate = this.formatDate(this.filterForm.dateRange[0])
          params.endDate = this.formatDate(this.filterForm.dateRange[1])
        } else if (this.filterForm.dateType === 'month' && this.filterForm.monthRange) {
          const ym = this.formatMonth(this.filterForm.monthRange)
          params.startDate = ym + '-01'
          // 取该月最后一天，避免 2/4/6/9/11 月没有 31 日导致日期滚动到下月
          params.endDate = this.formatMonthLastDay(ym)
        }

        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/sub2ApiStatisticsService/queryTokenUsage',
          method: 'post',
          data: params
        })

        const resp = { data: res }
        if (resp.data.errcode === 0) {
          const pageData = resp.data.data || {}
          const list = Array.isArray(pageData.results) ? pageData.results : []
          // 直接使用后端脱敏 VO 字段（Sub2ApiUsageLogVo）
          this.tableData = list.map(item => ({
            id: item.id,
            apiKeyName: item.apiKeyName || '-',
            model: item.model || '-',
            reasoningEffort: item.reasoningEffort || '-',
            inboundEndpoint: item.inboundEndpoint || '-',
            requestType: item.requestType || '-',
            stream: item.stream === true ? '是' : (item.stream === false ? '否' : '-'),
            inputTokens: item.inputTokens,
            outputTokens: item.outputTokens,
            cacheReadTokens: item.cacheReadTokens,
            durationMs: item.durationMs,
            firstTokenMs: item.firstTokenMs,
            createdAt: item.createdAt || '-'
          }))
          this.pagination.total = pageData.totalRecord || 0
        } else if (resp.data.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '获取使用记录失败')
        }
      } catch (error) {
        console.error('获取使用记录失败:', error)
        this.$Message.error('获取使用记录失败')
      } finally {
        this.loading = false
      }
    },

    // 金额格式化（空值显示 -）
    formatNumber(v) {
      if (v === null || v === undefined || v === '') return '-'
      const n = Number(v)
      return isNaN(n) ? '-' : n
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    // 格式化月份
    formatMonth(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    },

    // 基于"YYYY-MM"算出该月最后一天（YYYY-MM-DD），自动适配 28/29/30/31 天
    formatMonthLastDay(ym) {
      if (!ym || typeof ym !== 'string' || !/^\d{4}-\d{2}$/.test(ym)) return ym ? (ym + '-31') : ''
      const [y, m] = ym.split('-').map(Number)
      // next month 的 0 日 = 本月最后一天
      const lastDay = new Date(y, m, 0).getDate()
      return `${ym}-${String(lastDay).padStart(2, '0')}`
    },


    // 分页变化
    handlePageChange(page) {
      this.pagination.pageNo = page
      this.fetchData()
    },

    // 每页条数变化
    handlePageSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.pageNo = 1
      this.fetchData()
    },

    // 查看导出记录
    handleViewExportRecord() {
      this.$Message.info('查看导出记录')
    },

    // 导出表格（HTML 表格伪装 xls，支持自定义列宽；Excel/WPS 均能识别）
    handleExport() {
      const exportCols = this.tableColumns || []
      const rows = this.tableData || []
      if (exportCols.length === 0) {
        this.$Message.warning('当前表格无可导出列')
        return
      }
      if (rows.length === 0) {
        this.$Message.warning('暂无数据可导出')
        return
      }
      // 自定义列宽：API密钥/端点/时间等文本字段给宽一些
      const getColWidth = (col) => {
        if (col.key === 'apiKey') return 200          // API密钥：较宽
        if (col.key === 'endpoint') return 200        // 端点：URL 较长
        if (col.key === 'time') return 180            // 时间：日期字符串
        if (col.key === 'modelName') return 170       // 模型名称
        if (col.key === 'ip') return 160              // IP
        if (col.key === 'token') return 140           // Token
        if (col.minWidth) return Math.min(260, Math.max(100, Math.ceil(col.minWidth * 1.4)))
        if (col.width) return Math.min(260, Math.max(100, col.width))
        return 110
      }
      // HTML 特殊字符转义，避免表格被破坏
      const escapeHtml = (val) => {
        if (val === null || val === undefined) return ''
        return String(val)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
      }
      // 拼装 HTML（带 Excel 命名空间，Excel/WPS 都能识别列宽和边框样式）
      let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
        + 'xmlns:x="urn:schemas-microsoft-com:office:excel" '
        + 'xmlns="http://www.w3.org/TR/REC-html40">\n'
        + '<head><meta charset="UTF-8">'
        + '<style>'
        + 'table{border-collapse:collapse;table-layout:fixed;}'
        + 'th,td{border:1px solid #d0d0d0;padding:4px 8px;'
        + 'font-family:"Microsoft YaHei",Arial,sans-serif;'
        + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
        + 'th{background-color:#f5f7fa;color:#333;font-weight:bold;}'
        + '</style></head>\n<body>\n<table>\n<colgroup>\n'
      exportCols.forEach(c => {
        html += `<col width="${getColWidth(c)}">\n`
      })
      html += '</colgroup>\n<thead>\n<tr>'
      exportCols.forEach(c => {
        html += `<th>${escapeHtml(c.title)}</th>`
      })
      html += '</tr>\n</thead>\n<tbody>\n'
      rows.forEach(row => {
        html += '<tr>'
        exportCols.forEach(c => {
          html += `<td>${escapeHtml(row[c.key])}</td>`
        })
        html += '</tr>\n'
      })
      html += '</tbody>\n</table>\n</body>\n</html>'
      // .xls 扩展名让浏览器识别为 Excel 文件
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = url
      a.download = `模型使用记录_${date}.xls`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      this.$Message.success(`已导出 ${rows.length} 条数据`)
    }
  }
}
</script>

<style lang="less" scoped>
 /deep/ .ivu-table {
    color: #000000;
  }
.billing-detail {
  padding: 16px;
  background: #f5f7f9;
  min-height: calc(100vh - 100px);

  &__header {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }
}

// 筛选区域
.billing-filter {
  margin-bottom: 16px;

  .filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    // 统一筛选区字号 13px（iView 默认 14px，需穿透到子组件并 !important 覆盖）
    /deep/ .ivu-select-placeholder,
    /deep/ .ivu-select-selected-value,
    /deep/ .ivu-select-input,
    /deep/ .ivu-select-selection,
    /deep/ .ivu-input,
    /deep/ .ivu-input-placeholder,
    /deep/ .ivu-date-picker-header,
    /deep/ .ivu-date-picker-cells-cell,
    /deep/ .ivu-btn {
      font-size: 13px !important;
    }
  }

  .filter-item {
    display: flex;
    align-items: center;
  }
}

// 金额汇总
.billing-summary {
  margin-bottom: 16px;

  /deep/ .ivu-card-body {
    padding: 20px 24px;
  }

  .summary-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }

  .summary-item {
    text-align: center;

    .label {
      font-size: 14px;
      color: #808695;
      margin-bottom: 8px;
    }

    .value {
      font-size: 24px;
      font-weight: 600;
      color: #17233d;
    }
  }

  .separator {
    font-size: 20px;
    color: #c5c8ce;
    font-weight: 500;
  }
}

// 表格卡片
.billing-table-card {
  /deep/ .ivu-card-body {
    padding: 0;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    // border-bottom: 1px solid #e8eaec;

    /deep/ .ivu-tabs {
      margin-bottom: 0;
    }

    /deep/ .ivu-tabs-bar {
      margin-bottom: 0;
      border-bottom: none;
    }

    .table-actions {
      padding: 10px;
      display: flex;
      gap: 8px;

      // 导出按钮：13px（iView 默认 14px）
      /deep/ .ivu-btn {
        font-size: 13px !important;
      }
    }
  }

  /deep/ .ivu-table-wrapper {
    border: none;
  }

  /deep/ .ivu-table {
    font-size: 12px;
  }

  /deep/ .ivu-table-header th {
    font-size: 13px;
    font-weight: bold;
    // color: #666;
    color: #000000;
    background-color: #f2f5fa;
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

  /deep/ .ivu-table-cell > span {
    display: inline-block;
  }

  .table-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px;
    // border-top: 1px solid #e8eaec;
  }

  // 分摊维度筛选
  .allocation-filter {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e8eaec;

    .filter-label {
      font-size: 14px;
      color: #515a6e;
      margin-right: 16px;
      font-weight: 500;
    }

    /deep/ .ivu-checkbox-group {
      display: flex;
      gap: 24px;
    }

    /deep/ .ivu-checkbox-wrapper {
      font-size: 13px;
    }
  }
}
</style>
