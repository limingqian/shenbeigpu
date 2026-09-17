<template>
  <div class="mirror-management">
    <!-- 页面标题 -->
    <div class="mirror-management__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>镜像</BreadcrumbItem>
        <BreadcrumbItem>镜像管理</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 顶部操作按钮 -->
    <div class="action-bar">
      <div class="action-item" @click="handleUpdateMirror">
        <div class="action-icon">
          <Icon type="md-refresh-circle" size="32" color="#ff6a00" />
        </div>
        <span class="action-text">刷新镜像</span>
      </div>
      <div class="action-item" v-if="activeTab === 'custom'" @click="handleCreateMirror">
        <div class="action-icon">
          <Icon type="md-add-circle" size="32" color="#ff6a00" />
        </div>
        <span class="action-text">创建镜像</span>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="tab-section">
      <Tabs v-model="activeTab" @on-click="handleTabChange">
        <TabPane label="自定义镜像" name="custom">
          <span slot="label">
            自定义镜像
            <Tooltip content="计费提示" placement="top">
              <Icon type="ios-alert" color="#ff9900" />
            </Tooltip>
          </span>
        </TabPane>
        <!-- <TabPane label="公共镜像" name="public"></TabPane>
        <TabPane label="云市场镜像" name="market"></TabPane> -->
      </Tabs>
    </div>

    <!-- 筛选区域 -->
    <!-- <div class="filter-section">
      <div class="filter-left">
        <Select v-model="filterForm.regionId" placeholder="请选择地域" style="width: 180px" clearable
          @on-change="handleRegionFilterChange">
          <Option v-for="region in regionList" :key="region.id" :value="region.id">{{ region.regionName }}</Option>
        </Select>
        <Select v-model="filterForm.poolId" placeholder="请选择资源池" style="width: 180px" clearable
          :disabled="!filterForm.regionId" @on-change="handleSearch">
          <Option v-for="pool in poolOptions" :key="pool.id" :value="pool.id">{{ pool.poolName }}</Option>
        </Select>
        <Input v-model="filterForm.keyword" placeholder="请输入您要搜索的内容" style="width: 250px" search
          @on-search="handleSearch" />
      </div>
    </div> -->

    <!-- 数据表格 -->
    <div class="table-section">
      <Table :columns="tableColumns" :data="tableData" :loading="loading" stripe
        @on-selection-change="handleSelectionChange">
        <!-- 镜像名称列 -->
        <template slot="mirrorName" slot-scope="{ row }">
          <div class="mirror-name">
            <span class="desc">{{ row.mirrorName }}</span>
            <span class="name">{{ row.mirrorId }}</span>
          </div>
        </template>

        <!-- 状态列 -->
        <template slot="status" slot-scope="{ row }">
          <div class="status-cell">
            <Badge status="success" />
            <span>{{ row.status }}</span>
          </div>
        </template>

        <!-- 操作系统列 -->
        <template slot="os" slot-scope="{ row }">
          <div class="os-cell">
            <img v-if="row.osIcon" :src="row.osIcon" class="os-icon" />
            <span>{{ row.osName }}</span>
          </div>
        </template>

        <!-- 平台列 -->
        <template slot="platform" slot-scope="{ row }">
          <div class="platform-cell">
            <span>{{ row.platform }}</span>
            <Icon v-if="row.platformIcon" :type="row.platformIcon" />
          </div>
        </template>

        <!-- 操作列 -->
        <template slot="action" slot-scope="{ row }">
          <div class="action-group">
            <!-- <a class="action-link" @click="handleCreateInstance(row)">创建实例</a> -->
            <template v-if="activeTab === 'custom'">
              <a class="action-link" v-if="!deleteLoadingMap[row.id]" @click="handleDeleteMirror(row)">删除</a>
              <span class="action-link" v-else style="color: #999; cursor: not-allowed;">
                <Icon type="ios-loading" class="ivu-load-loop" /> 删除中
              </span>
            </template>
          </div>
        </template>
      </Table>
    </div>

    <!-- 批量操作和分页 -->
    <div class="footer-section">
      <div class="batch-actions">

      </div>
      <div class="pagination">
        <span class="total">共 {{ pagination.total }} 条</span>
        <Page :total="pagination.total" :current="pagination.pageNo" :page-size="pagination.pageSize" show-sizer
          :page-size-opts="[10, 20, 50, 100]" @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange" />
      </div>
    </div>

    <!-- 创建镜像弹框 -->
    <Modal v-model="showCreateModal" title="创建镜像" width="500" :mask-closable="false" :footer-hide="true">
      <Form ref="createForm" :model="createForm" style="margin-right: 30px;" :rules="createRules" :label-width="120">
        <FormItem label="镜像名称" prop="mirrorName">
          <Input v-model="createForm.mirrorName" placeholder="请输入镜像名称，如：自定义镜像-CentOS-7.9" maxlength="200"
            show-word-limit />
        </FormItem>
        <FormItem label="操作系统" prop="osName">
          <Select v-model="createForm.osName" placeholder="请选择操作系统">
            <Option value="CentOS">CentOS</Option>
            <Option value="Ubuntu">Ubuntu</Option>
            <Option value="Debian">Debian</Option>
            <Option value="Windows">Windows</Option>
            <Option value="Fedora">Fedora</Option>
            <Option value="openEuler">openEuler</Option>
            <Option value="Other">其他</Option>
          </Select>
        </FormItem>
        <FormItem label="操作系统版本" prop="osVersion">
          <Input v-model="createForm.osVersion" placeholder="请输入操作系统版本，如：7.9、20.04、2019" maxlength="50" />
        </FormItem>
        <FormItem label="系统架构" prop="architecture">
          <Select v-model="createForm.architecture" placeholder="请选择系统架构">
            <Option value="x86_64">x86_64</Option>
            <Option value="ARM64">ARM64</Option>
          </Select>
        </FormItem>
        <FormItem label="区域" prop="regionId">
          <Select v-model="createForm.regionId" placeholder="请选择区域" @on-change="handleCreateRegionChange">
            <Option v-for="region in regionList" :key="region.id" :value="region.id">{{ region.regionName }}</Option>
          </Select>
        </FormItem>
        <FormItem label="平台" prop="platform">
          <Select v-model="createForm.platform" placeholder="请选择平台">
            <Option value="x86_64">x86_64</Option>
            <Option value="ARM64">ARM64</Option>
          </Select>
        </FormItem>
        <FormItem label="镜像文件" prop="imageUrl">
          <div v-if="createForm.imageUrl" class="uploaded-file">
            <Icon type="ios-document" color="#2d8cf0" />
            <span>{{ getFileName(createForm.imageUrl) }}</span>
            <Icon type="ios-close-circle" color="#ed4014" class="remove-icon" @click="handleRemoveFile" />
          </div>
          <Upload v-else ref="upload" :before-upload="handleBeforeUpload" :max-size="102400"
            accept=".iso" action="#">
            <Button icon="ios-cloud-upload-outline">选择镜像文件</Button>
          </Upload>
          <div class="upload-tip">支持格式：.iso ，最大10GB</div>
        </FormItem>
        <FormItem label="镜像大小" prop="imageSize">
          <InputNumber disabled v-model="createForm.imageSize" :min="0" :max="107374182400" placeholder="请输入镜像大小(字节)"
            style="width: 40%;" />
          <span class="unit-text" style="margin-left: 8px;">字节</span>
        </FormItem>
        <FormItem label="镜像描述" prop="description">
          <Input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入镜像描述信息" maxlength="500"
            show-word-limit />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" maxlength="200"
            show-word-limit />
        </FormItem>
        <FormItem label="是否启用" prop="isEnabled">
          <RadioGroup v-model="createForm.isEnabled">
            <Radio label="1">启用</Radio>
            <Radio label="0">禁用</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem>
          <div class="form-footer-buttons">
            <Button style="margin-left: auto;" @click="handleCreateCancel">取消</Button>
            <Button type="primary" :loading="createLoading" :disabled="!isCreateFormValid"
              @click="handleCreateSubmit">确定</Button>
          </div>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'MirrorManagement',
  data() {
    return {
      // 当前激活的Tab
      activeTab: 'custom',

      // 筛选表单
      filterForm: {
        autoRecognize: '',
        keyword: '',
        regionId: '',
        poolId: ''
      },

      // 地域树数据
      regionList: [],

      // 资源池列表（根据选中的地域筛选）
      poolOptions: [],

      // 当前选中的地域ID
      selectedRegionId: null,

      // 镜像族系视图开关
      isFamilyView: false,

      // 表格加载状态
      loading: false,

      // 创建镜像弹框
      showCreateModal: false,
      createLoading: false, // 创建镜像提交加载状态
      deleteLoadingMap: {}, // 删除镜像加载状态映射
      createFile: null, // 创建镜像时选择的文件对象
      createForm: {
        mirrorName: '',
        mirrorId: '',
        mirrorType: 'custom',
        osName: '',
        osVersion: '',
        osIcon: '',
        architecture: 'x86_64',
        platform: 'x86_64',
        platformIcon: '',
        regionId: '',
        poolId: '',
        imageUrl: '',
        imagePath: '',
        imageSize: null,
        imageFormat: '',
        description: '',
        remark: '',
        isEnabled: '1',
        isShared: '0',
        isRecommended: '0',
        sortOrder: 0
      },
      createRules: {
        mirrorName: [
          { required: true, message: '请输入镜像名称', trigger: 'blur' },
          { type: 'string', min: 2, max: 200, message: '镜像名称长度在2-200个字符', trigger: 'blur' }
        ],
        osName: [
          { required: true, message: '请选择操作系统', trigger: 'change' }
        ],
        osVersion: [
          { required: true, message: '请输入操作系统版本', trigger: 'blur' }
        ],
        architecture: [
          { required: true, message: '请选择系统架构', trigger: 'change' }
        ],
        platform: [
          { required: true, message: '请选择平台', trigger: 'change' }
        ],
        imageUrl: [
          { required: true, message: '请上传镜像文件', trigger: 'change' }
        ],
        imageFormat: [
          { required: false, message: '请选择镜像格式', trigger: 'change' }
        ],
        regionId: [
          { required: true, message: '请选择区域', trigger: 'change' }
        ]
      },

      // 计算属性
      isCreateFormValid() {
        const f = this.createForm
        return !!(
          f.mirrorName && f.mirrorName.length >= 2 &&
          f.osName &&
          f.osVersion &&
          f.architecture &&
          f.platform &&
          f.regionId &&
          f.poolId &&
          f.imageUrl
        )
      },

      // 表格列定义
      tableColumns: [
        {
          title: '名称 / 镜像 ID',
          key: 'mirrorId',
          minWidth: 280,
          slot: 'mirrorName'
        },
        {
          title: '状态',
          key: 'status',
          width: 100,
          slot: 'status'
        },
        {
          title: '区域',
          key: 'regionName',
          width: 120,
          render: (h, params) => {
            return h('span', params.row.regionName || '-')
          }
        },
        {
          title: '操作系统',
          key: 'osName',
          width: 150,
          slot: 'os'
        },
        {
          title: '平台',
          key: 'platform',
          width: 100,
          slot: 'platform'
        },
        {
          title: '系统架构',
          key: 'architecture',
          width: 100
        },
        {
          title: '镜像大小',
          key: 'imageSize',
          width: 120,
          render: (h, params) => {
            return h('span', this.formatImageSize(params.row.imageSize))
          }
        },
        {
          title: '镜像地址',
          key: 'imagePath',
          width: 200
        },
        {
          title: '创建时间',
          key: 'createTime',
          width: 160
        },
        {
          title: '操作',
          key: 'action',
          width: 100,
          // fixed: 'right',
          align: 'center',
          slot: 'action'
        }
      ],

      // 表格数据
      tableData: [],

      // 全选状态
      selectAll: false,

      // 选中的行
      selectedRows: [],

      // 分页配置
      pagination: {
        total: 0,
        pageNo: 1,
        pageSize: 20
      },

      // 完整数据列表（前端分页用）
      allTableData: []
    }
  },
  mounted() {
    this.loadRegionList()
    this.loadMirrorList()
  },
  methods: {
    // 格式化镜像大小
    formatImageSize(bytes) {
      if (!bytes) return '-'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(2)} ${units[unitIndex]}`
    },

    // 格式化镜像类型
    formatMirrorType(type) {
      const map = {
        'custom': '自定义镜像',
        'public': '公共镜像',
        'market': '云市场镜像'
      }
      return map[type] || type || '-'
    },

    // 格式化状态
    formatStatus(status) {
      const map = {
        'available': '可用',
        'creating': '创建中',
        'importing': '导入中',
        'deleting': '删除中',
        'failed': '失败'
      }
      return map[status] || status || '-'
    },

    // 加载镜像列表
    async loadMirrorList() {
      this.loading = true
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/mirrorService/listMirrorPage',
          method: 'post',
          data: {
            mirrorType: this.activeTab,
            delFlag: '0',
            poolId: this.filterForm.poolId || null
          }
        })
        res = { data: res }

        if (res.data.errcode === 0) {
          const list = res.data.data || []

          // 转换数据格式
          this.allTableData = list.map(item => {
            return {
              id: item.id,
              mirrorId: item.mirrorId || '-',
              mirrorName: item.mirrorName || '-',
              status: this.formatStatus(item.status),
              hasTag: !!item.tags && item.tags.trim() !== '',
              osName: item.osName,
              osIcon: item.osIcon || '',
              platform: item.platform || item.architecture || '-',
              platformIcon: item.platformIcon || '',
              architecture: item.architecture || '-',
              imageSize: item.imageSize || 0,
              mirrorType: item.mirrorType || '-',
              price: item.price,
              imageUrl: item.imageUrl || '-',
              imagePath: item.imagePath || '-',
              createTime: item.createTime || '-',
              regionName: item.regionName || '-',
              // 保留原始数据
              _raw: item
            }
          })

          // 前端分页
          this.pagination.total = this.allTableData.length
          this.handlePageChange(1)
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(res.data.errmsg || '加载镜像列表失败')
          this.tableData = []
          this.allTableData = []
          this.pagination.total = 0
        }
      } catch (e) {
        console.error('加载镜像列表异常:', e)
        this.$Message.error('网络异常，请稍后重试')
        this.tableData = []
        this.allTableData = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    // Tab切换
    handleTabChange(name) {
      this.activeTab = name
      this.pagination.pageNo = 1
      this.loadMirrorList()
    },

    // 加载地域树
    async loadRegionList() {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/regionService/listRegionTree',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0 && res.data) {
          this.regionList = this.flattenRegionTree(res.data)
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.regionList = []
        }
      } catch (e) {
        console.error('加载地域列表失败:', e)
        this.regionList = []
      }
    },

    // 将地域树形结构平铺为列表
    flattenRegionTree(tree) {
      if (!tree || !Array.isArray(tree) || tree.length === 0) {
        return []
      }
      const result = []
      const flatten = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return
        for (const node of nodes) {
          result.push({
            id: node.id,
            regionName: node.regionName,
            regionCode: node.regionCode,
            resourcePools: node.resourcePools || []
          })
          if (node.children && node.children.length > 0) {
            flatten(node.children)
          }
        }
      }
      flatten(tree)
      return result
    },

    // 地域筛选变化
    handleRegionFilterChange(regionId) {
      this.filterForm.poolId = ''
      this.poolOptions = []
      if (regionId) {
        const region = this.regionList.find(item => item.id === regionId)
        if (region && region.resourcePools) {
          this.poolOptions = region.resourcePools
        }
      }
      this.handleSearch()
    },

    // 搜索
    handleSearch() {
      this.pagination.pageNo = 1
      this.loadMirrorList()
    },

    // 刷新
    handleRefresh() {
      this.loadMirrorList()
    },

    // 设置
    handleSettings() {
      this.$Message.info('打开设置')
    },

    // 创建镜像
    handleCreateMirror() {
      this.showCreateModal = true
      this.createFile = null
      // 重置表单
      this.$refs.createForm && this.$refs.createForm.resetFields()
      this.createForm = {
        mirrorName: '',
        mirrorId: '',
        mirrorType: 'custom',
        osName: '',
        osVersion: '',
        osIcon: '',
        architecture: 'x86_64',
        platform: 'x86_64',
        platformIcon: '',
        regionId: '',
        poolId: '',
        imageUrl: '',
        imagePath: '',
        imageSize: null,
        imageFormat: '',
        description: '',
        remark: '',
        isEnabled: '1',
        isShared: '0',
        isRecommended: '0',
        sortOrder: 0
      }
    },

    // 创建镜像时选择区域变化，自动取该区域下第一个资源池
    handleCreateRegionChange(regionId) {
      this.createForm.poolId = ''
      if (!regionId) {
        return
      }
      const region = this.regionList.find(item => item.id === regionId)
      if (region && region.resourcePools && region.resourcePools.length > 0) {
        this.createForm.poolId = region.resourcePools[0].id
      } else {
        this.$Message.warning('该区域下没有可用的资源池')
      }
    },

    // 获取文件名
    getFileName(path) {
      if (!path) return ''
      const parts = path.split('/')
      return parts[parts.length - 1]
    },

    // 上传前校验
    handleBeforeUpload(file) {
      // 文件类型校验
      const validFormats = ['qcow2', 'vmdk', 'raw', 'img', 'iso', 'vhd']
      const fileExt = file.name.split('.').pop().toLowerCase()
      if (!validFormats.includes(fileExt)) {
        this.$Message.error('不支持的文件格式，请选择：' + validFormats.join(', '))
        return false
      }

      // 文件大小校验（100GB = 102400MB）
      const maxSize = 100 * 1024 * 1024 * 1024
      if (file.size > maxSize) {
        this.$Message.error('文件大小超过100GB限制')
        return false
      }

      // 保存文件对象
      this.createFile = file
      // 设置镜像文件路径（用于显示）
      this.createForm.imageUrl = file.name
      this.createForm.imageSize = file.size
      this.createForm.imageFormat = fileExt

      this.$Message.success('文件选择成功')

      // 返回false阻止自动上传
      return false
    },

    // 移除文件
    handleRemoveFile() {
      this.createForm.imageUrl = ''
      this.createForm.imageSize = null
      this.createForm.imageFormat = ''
      this.createFile = null
      this.$refs.upload.clearFiles()
    },

    // 提交创建镜像
    handleCreateSubmit() {
      this.$refs.createForm.validate(async (valid) => {
        if (!valid) {
          this.$Message.warning('请填写必填项')
          return false
        }
        this.createLoading = true
        // 弹窗保持打开，显示上传中提示
        const uploadHint = this.$Message.loading('镜像上传中...请勿刷新页面', 0)
        try {
          // 构建FormData发送文件和表单数据
          const formData = new FormData()
          if (this.createFile) {
            formData.append('file', this.createFile)
          }
          // 添加表单字段
          const fields = [
            'mirrorName', 'mirrorId', 'mirrorType', 'osName', 'osVersion',
            'osIcon', 'architecture', 'platform', 'platformIcon',
            'regionId', 'poolId',
            'imageUrl', 'imagePath', 'imageSize', 'imageFormat',
            'description', 'remark', 'isEnabled', 'isShared',
            'isRecommended', 'sortOrder'
          ]
          fields.forEach(key => {
            if (this.createForm[key] !== undefined && this.createForm[key] !== null) {
              formData.append(key, this.createForm[key])
            }
          })
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/mirrorService/insertMirror',
            method: 'post',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })

          uploadHint()

          if (res.errcode === 0) {
            this.$Message.success('新增成功')
            this.showCreateModal = false
            this.loadMirrorList()
            // 上传成功后重置表单和文件
            // this.$refs.createForm && this.$refs.createForm.resetFields()
            this.createFile = null
          } else {
            this.$Message.error(res.errmsg || '创建失败')
          }
        } catch (e) {
          uploadHint()
          console.error('创建镜像异常:', e)
          this.$Message.error('创建失败，请稍后重试')
        } finally {
          this.createLoading = false
        }
      })
    },

    // 取消创建镜像
    handleCreateCancel() {
      this.showCreateModal = false
      this.$refs.createForm && this.$refs.createForm.resetFields()
      this.createFile = null
    },

    // 更新镜像
    handleUpdateMirror() {
      this.pagination.pageNo = 1
      this.loadMirrorList()
    },

    // 复制镜像
    handleCopyMirror() {
      this.$Message.info('复制镜像')
    },

    // 导入镜像
    handleImportMirror() {
      this.$Message.info('导入镜像')
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.selectAll = selection.length === this.tableData.length && this.tableData.length > 0
    },

    // 全选
    handleSelectAll(value) {
      this.$refs.table.selectAll(value)
    },

    // 批量删除
    async handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要删除的镜像')
        return
      }
      const ids = this.selectedRows.map(row => row.id)

      this.$Modal.confirm({
        title: '确认删除',
        content: `确定要删除选中的 ${this.selectedRows.length} 个镜像吗？`,
        onOk: async () => {
          try {
            const res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/mirrorService/batchDeleteMirror',
              method: 'post',
              data: ids
            })

            if (res.errcode === 0) {
              this.$Message.success('删除成功')
              this.loadMirrorList()
            } else {
              this.$Message.error(res.errmsg || '删除失败')
            }
          } catch (e) {
            console.error('批量删除镜像异常:', e)
            this.$Message.error('删除失败，请稍后重试')
          }
        }
      })
    },

    // 批量确定标签
    handleBatchConfirmTag() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要操作的镜像')
        return
      }
      this.$Message.info('确定标签')
    },

    // 批量解除标签
    handleBatchRemoveTag() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要操作的镜像')
        return
      }
      this.$Message.info('解除标签')
    },

    // 创建实例
    handleCreateInstance(row) {
      // 跳转到实例购买页面，并传递镜像ID
      this.$router.push({
        path: '/shenbeigpuai/control/instance-buy',
        query: {
          imageId: row.id,
          imageName: row.mirrorName
        }
      })
    },

    // 删除镜像
    async handleDeleteMirror(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `确定要删除镜像 ${row.mirrorId} 吗？`,
        onOk: async () => {
          // 设置删除loading状态
          this.$set(this.deleteLoadingMap, row.id, true)
          try {
            const res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/mirrorService/deleteMirror',
              method: 'post',
              data: { id: row.id }
            })

            if (res.errcode === 0) {
              this.$Message.success('删除成功')
              this.loadMirrorList()
            } else {
              this.$Message.error(res.errmsg || '删除失败')
            }
          } catch (e) {
            console.error('删除镜像异常:', e)
            this.$Message.error('删除失败，请稍后重试')
          } finally {
            // 清除loading状态
            this.$delete(this.deleteLoadingMap, row.id)
          }
        }
      })
    },

    // 复制镜像（行内操作）
    handleCopyMirrorRow(row) {
      this.$Message.info(`复制镜像 ${row.mirrorId}`)
    },

    // 导出镜像
    handleExportMirror(row) {
      this.$Message.info(`导出镜像 ${row.mirrorId}`)
    },

    // 共享镜像
    handleShareMirror(row) {
      this.$Message.info(`共享镜像 ${row.mirrorId}`)
    },

    // 编辑镜像
    handleEditMirror(row) {
      this.$Message.info(`编辑镜像 ${row.mirrorId}`)
    },

    // 查看详情
    handleViewDetail(row) {
      this.$Message.info(`查看镜像 ${row.mirrorId} 详情`)
    },

    // 页码变化（前端分页）
    handlePageChange(page) {
      this.pagination.pageNo = page
      this.tableData = this.allTableData.slice(
        (this.pagination.pageNo - 1) * this.pagination.pageSize,
        this.pagination.pageNo * this.pagination.pageSize
      )
    },

    // 每页条数变化（前端分页）
    handlePageSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.pageNo = 1
      this.tableData = this.allTableData.slice(0, size)
    }
  }
}
</script>

<style lang="less" scoped>
 /deep/ .ivu-table {
    color: #000000;
  }
.form-footer-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 8px;
}

.mirror-management {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;

  &__breadcrumb {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  .page-header {
    margin-bottom: 16px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #17233d;
      margin: 0;
    }
  }

  // 顶部操作按钮
  .action-bar {
    display: flex;
    gap: 32px;
    margin-bottom: 24px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;

    .action-item {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background 0.2s;

      &:hover {
        background: #f8f9fa;
      }

      .action-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .action-text {
        font-size: 14px;
        color: #515a6e;
      }
    }
  }

  // Tab 区域
  .tab-section {
    background: #fff;
    padding: 0 16px;
    border-radius: 4px 4px 0 0;
    // border-bottom: 1px solid #e8eaec;
    /deep/ .ivu-tabs-bar {
      margin-bottom: 0;
      border-bottom: none;
    }
  }

  // 筛选区域
  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e8eaec;

    .filter-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .filter-btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .filter-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .view-label {
        font-size: 13px;
        color: #515a6e;
      }
    }
  }

  // 表格区域
  .table-section {
    background: #fff;
    padding: 16px 16px 16px 16px;

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

    .mirror-name,
    .status-cell,
    .os-cell,
    .platform-cell,
    .action-group {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mirror-name {
      flex-direction: column;

      .name {
        color: #000;
        // cursor: pointer;

        &:hover {
          // text-decoration: underline;
        }
      }

      .desc {
        font-weight: 600;
        font-size: 12px;
        color: #000;
      }
    }

    .status-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .os-cell {
      display: flex;
      align-items: center;
      gap: 6px;

      .os-icon {
        width: 16px;
        height: 16px;
      }
    }

    .platform-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .link-text {
      color: #2d8cf0;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .success {
      color: #19be6b;
    }

    .fail {
      color: #ed4014;
    }

    .action-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .action-link {
        color: #2d8cf0;
        cursor: pointer;
        font-size: 12px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  // 底部区域
  .footer-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-radius: 0 0 4px 4px;
    // border-top: 1px solid #e8eaec;

    .batch-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: 16px;

      .total {
        font-size: 13px;
        color: #515a6e;
      }
    }
  }

  // 创建镜像弹框样式
  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }

  .unit-text {
    margin-left: 8px;
    font-size: 13px;
    color: #515a6e;
  }

  .uploaded-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f8f9fa;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    margin-bottom: 8px;
    font-size: 13px;
    color: #515a6e;

    >div {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .remove-icon {
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #ed4014;
      }
    }
  }

  .upload-file-name {
    margin-top: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #515a6e;

    .ivu-icon {
      color: #2d8cf0;
    }
  }
}
</style>
