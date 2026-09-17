<template>
  <div class="switch-list">
    <div class="switch-list__header1">
      <Breadcrumb>
        <BreadcrumbItem>网络</BreadcrumbItem>
        <BreadcrumbItem>交换机</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <!-- 页面头部 -->
    <Card class="switch-list__header" :bordered="false" dis-hover>
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">交换机</h2>
          <p class="page-desc">管理您的交换机设备，控制网络连接</p>
        </div>
        <div class="header-right">
          <Button icon="md-add" @click="handleCreate">创建交换机</Button>
        </div>
      </div>
    </Card>

    <!-- 筛选区域 -->
    <Card class="switch-list__filter" :bordered="false" dis-hover>
      <Form ref="filterForm" :model="filterForm" :label-width="80" inline>
        <FormItem label="名称" style="margin-bottom: 0px;margin-right: 0px;">
          <Input v-model="filterForm.subnetName" placeholder="请输入交换机名称" clearable style="width: 200px" />
        </FormItem>
        <!-- <FormItem label="子网地址段">
          <Input v-model="filterForm.cidr" placeholder="如：192.168.1.0/24" clearable style="width: 200px" />
        </FormItem> -->
        <FormItem label="所属网络" style="margin-bottom: 0px;margin-right: 0px;">
          <Select v-model="filterForm.vnetId" placeholder="请选择专有网络" clearable style="width: 200px">
            <Option v-for="net in networkList" :key="net.id" :value="net.id">
              {{ net.vnetName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem :label-width="0" style="margin-bottom: 0px;margin-left: 8px;">
          <Button type="primary" icon="md-search" @click="handleSearch">搜索</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="handleReset">重置</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 列表区域 -->
    <Card class="switch-list__table" :bordered="false" dis-hover>
      <Table
        :columns="tableColumns"
        :data="tableData"
        :loading="loading"
        stripe
      >
        <template slot-scope="{ row }" slot="status">
          <Tag :color="getStatusColor(row.status)">
            {{ getStatusText(row.status) }}
          </Tag>
        </template>
        <template slot-scope="{ row }" slot="vnetId">
          <span>{{ getVnetName(row.vnetId) }}</span>
        </template>
        <template slot-scope="{ row }" slot="action">
          <div class="action-btns">
            <!-- <a class="action-link" @click="handleView(row)">详情</a> -->
            <!-- <a class="action-link" @click="handleEdit(row)">编辑</a> -->
            <a v-if="row.isDefault !== '1'" class="action-link delete" @click="handleDelete(row)">删除</a>
          </div>
        </template>
      </Table>
      <div class="pagination-wrapper">
        <Page
          :current="pagination.pageNo"
          :total="pagination.totalRecord"
          :page-size="pagination.pageSize"
          :page-size-opts="[10, 20, 50, 100]"
          show-sizer
          show-total
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
        />
      </div>
    </Card>

    <!-- 创建/编辑弹窗 -->
    <Modal
      v-model="showModal"
      :title="modalTitle"
      width="600"
      :mask-closable="false"
    >
      <Form ref="switchForm" :model="switchForm" :rules="switchRules" :label-width="120">
        <FormItem label="交换机名称" prop="subnetName">
          <Input v-model="switchForm.subnetName" placeholder="请输入交换机名称" maxlength="50" />
        </FormItem>
        <FormItem label="所属网络" prop="vnetId">
          <Select v-model="switchForm.vnetId" placeholder="请选择专有网络" @on-change="handleVnetChange">
            <Option v-for="net in networkList" :key="net.id" :value="net.id">
              {{ net.vnetName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="子网地址段" prop="cidr">
          <Input v-model="switchForm.cidr" placeholder="请输入子网地址段，如：192.168.2.0/24" maxlength="50" />
          <div class="form-tip">CIDR格式，例如：192.168.2.0/24，注意网段不能重复！</div>
        </FormItem>
        <FormItem label="描述">
          <Input
            v-model="switchForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
            maxlength="200"
            show-word-limit
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="showModal = false">取消</Button>
        <Button type="primary" :loading="submitting" @click="handleSubmit">确定</Button>
      </div>
    </Modal>

    <!-- 详情弹窗 -->
    <Modal v-model="showDetailModal" title="交换机详情" width="700" :footer-hide="true">
      <div v-if="currentSwitch" class="detail-content">
        <Descriptions :column="2" border>
          <DescriptionsItem label="交换机ID">{{ currentSwitch.id }}</DescriptionsItem>
          <DescriptionsItem label="交换机名称">{{ currentSwitch.subnetName }}</DescriptionsItem>
          <DescriptionsItem label="子网地址段">{{ currentSwitch.cidr || '-' }}</DescriptionsItem>
          <DescriptionsItem label="所属网络">{{ currentSwitch.vnetId }}</DescriptionsItem>
          <DescriptionsItem label="内网IP">{{ currentSwitch.privateIp || '-' }}</DescriptionsItem>
          <DescriptionsItem label="创建时间">{{ currentSwitch.createTime }}</DescriptionsItem>
          <DescriptionsItem label="描述" :span="2">{{ currentSwitch.description || '-' }}</DescriptionsItem>
        </Descriptions>

        <div class="port-info">
          <h4 class="section-title">端口配置</h4>
          <Table
            :columns="portColumns"
            :data="currentSwitch.ports || []"
            size="small"
            :border="true"
          />
        </div>
      </div>
    </Modal>

    <!-- 端口配置弹窗 -->
    <Modal
      v-model="showPortConfigModal"
      title="端口配置"
      width="800"
      :mask-closable="false"
    >
      <div class="port-config-content">
        <Table
          :columns="portConfigColumns"
          :data="portConfigList"
          size="small"
          :border="true"
        >
          <template slot-scope="{ row }" slot="portStatus">
            <Tag :color="row.enabled ? 'success' : 'default'">
              {{ row.enabled ? '启用' : '禁用' }}
            </Tag>
          </template>
          <template slot-scope="{ row }" slot="action">
            <Switch
              v-model="row.enabled"
              size="small"
              @on-change="handlePortStatusChange(row)"
            />
          </template>
        </Table>
      </div>
      <div slot="footer">
        <Button @click="showPortConfigModal = false">取消</Button>
        <Button type="primary" :loading="savingPorts" @click="handleSavePorts">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-control-switch-list',
  data() {
    return {
      loading: false,
      submitting: false,
      savingPorts: false,
      filterForm: {
        subnetName: '',
        vnetId: '',
        status: ''
      },
      networkList: [],
      regionList: [],
      tableColumns: [
        {
          title: '交换机ID',
          key: 'id',
          minWidth: 180
        },
        {
          title: '交换机名称',
          key: 'subnetName',
          minWidth: 150
        },
        {
          title: '子网地址段',
          key: 'cidr',
          minWidth: 150,
          render: (h, params) => {
            return h('span', {
              class: 'cidr-text'
            }, params.row.cidr || '-');
          }
        },
        {
          title: '所属网络',
          slot: 'vnetId',
          minWidth: 150
        },
        {
          title: '创建时间',
          key: 'createTime',
          minWidth: 160
        },
        {
          title: '操作',
          slot: 'action',
          align: 'center',
          width: 200,
          // fixed: 'right'
        }
      ],
      tableData: [],
      pagination: {
        pageNo: 1,
        pageSize: 10,
        totalRecord: 0
      },
      showModal: false,
      modalTitle: '创建交换机',
      switchForm: {
        id: '',
        companyCode: 'test',
        subnetName: '',
        cidr: '',
        vnetId: '',
        description: ''
      },
      // 当前专有网络下已存在的 cidr 集合（用于校验 cidr 在数据库层面不重复）
      cidrList: [],
      switchRules: {
        subnetName: [
          { required: true, message: '请输入交换机名称', trigger: 'blur' },
          { type: 'string', min: 2, max: 50, message: '交换机名称长度在2-50个字符', trigger: 'blur' }
        ],
        cidr: [
          { required: true, message: '请输入子网地址段', trigger: 'blur' },
          { pattern: /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, message: 'CIDR格式不正确，如：192.168.1.0/24', trigger: 'blur' },
          { validator: this.validateCidrUnique, trigger: 'blur' }
        ],
        vnetId: [
          { required: true, message: '请选择专有网络', trigger: 'change' }
        ]
      },
      showDetailModal: false,
      currentSwitch: null,
      portColumns: [
        {
          title: '端口编号',
          key: 'portNumber',
          width: 100
        },
        {
          title: '状态',
          key: 'enabled',
          width: 80,
          render: (h, params) => {
            return h('Tag', {
              props: { color: params.row.enabled ? 'success' : 'default' }
            }, params.row.enabled ? '启用' : '禁用');
          }
        },
        {
          title: '连接设备',
          key: 'connectedDevice',
          minWidth: 150
        },
        {
          title: 'IP地址',
          key: 'ipAddress',
          minWidth: 120
        }
      ],
      showPortConfigModal: false,
      portConfigList: [],
      portConfigColumns: [
        {
          title: '端口编号',
          key: 'portNumber',
          width: 100
        },
        {
          title: '状态',
          slot: 'portStatus',
          width: 80
        },
        {
          title: '连接设备',
          key: 'connectedDevice',
          minWidth: 150
        },
        {
          title: 'IP地址',
          key: 'ipAddress',
          minWidth: 150
        },
        {
          title: '启用/禁用',
          slot: 'action',
          width: 100
        }
      ]
    };
  },
  mounted() {
    this.fetchRegionList();
    this.loadNetworkList();
    const query = this.$route.query;
    if (query.vnetId) {
      this.filterForm.vnetId = query.vnetId;
    }
    this.loadData();
  },
  methods: {
    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        running: 'success',
        stopped: 'default',
        error: 'error'
      };
      return colorMap[status] || 'default';
    },
    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        running: '运行中',
        stopped: '已停止',
        error: '故障'
      };
      return textMap[status] || status;
    },
    // 校验子网地址段在数据库层面是否已存在（依据当前专有网络下后端返回的 cidrList）。
    // 编辑模式下忽略当前行的 cidr（保留同一值不视为重复）。
    validateCidrUnique(rule, value, callback) {
      if (!value) {
        callback();
        return;
      }
      const list = Array.isArray(this.cidrList) ? this.cidrList : [];
      const exists = list.some(item => {
        if (!item || item.cidr === undefined || item.cidr === null) return false;
        // 编辑模式下：找到与当前 switchForm.id 对应的原 cidr，不算重复
        if (this.switchForm.id && item.id && item.id === this.switchForm.id) return false;
        return String(item.cidr).trim() === String(value).trim();
      });
      if (exists) {
        callback(new Error('该子网地址段已存在，请更换'));
      } else {
        callback();
      }
    },
    // 获取VNet名称
    getVnetName(vnetId) {
      if (!vnetId) return '-';
      const vnet = this.networkList.find(item => item.id === vnetId);
      return vnet ? vnet.vnetName : vnetId;
    },
    // 获取地区列表
    async fetchRegionList() {
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/regionService/listRegionTree',
          method: 'post',
          data: {}
        });
        res = { data: res }
        if (res.data.errcode === 0 && res.data.data) {
          this.regionList = this.convertRegionData(res.data.data);
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.regionList = [];
        }
      } catch (error) {
        console.error('获取地区列表失败:', error);
        this.regionList = [];
      }
    },
    // 转换地区数据为 Select 组件需要的格式
    convertRegionData(tree) {
      if (!tree || !Array.isArray(tree) || tree.length === 0) {
        return [];
      }
      const result = [];
      const flatten = (nodes) => {
        nodes.forEach(node => {
          result.push({
            value: node.regionName,
            label: node.regionName,
            id: node.id,
            regionCode: node.regionCode
          });
          if (node.children && node.children.length > 0) {
            flatten(node.children);
          }
        });
      };
      flatten(tree);
      return result;
    },
    // 加载网络列表
    async loadNetworkList() {
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/vnetService/listVNet',
          method: 'post'
        });
        res = { data: res }
        if (res.data.errcode === 0) {
          this.networkList = res.data.data || [];
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('加载网络列表失败:', error);
      }
    },
    // 加载数据
    async loadData() {
      this.loading = true;
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/vnetSubnetService/listSubnet',
          method: 'post',
          data: {
            ...this.filterForm,
            // pageNo: this.pagination.pageNo,
            // pageSize: this.pagination.pageSize
          }
        });
        console.log(res)
        res = { data: res }
        if (res.data.errcode === 0) {
          const page = res.data.data;
          this.tableData = page || [];
          this.pagination.totalRecord = page.totalRecord || 0;
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(res.data.errmsg || '加载数据失败');
        }
      } catch (error) {
        console.error('加载交换机列表失败:', error);
        this.$Message.error('加载数据失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },
    // 搜索
    handleSearch() {
      this.pagination.pageNo = 1;
      this.loadData();
    },
    // 重置
    handleReset() {
      this.filterForm = {
        subnetName: '',
        cidr: '',
        vnetId: '',
        status: ''
      };
      this.pagination.pageNo = 1;
      this.loadData();
    },
    // 分页变化
    handlePageChange(page) {
      this.pagination.pageNo = page;
      this.loadData();
    },
    // 分页大小变化
    handlePageSizeChange(pageSize) {
      this.pagination.pageSize = pageSize;
      this.pagination.pageNo = 1;
      this.loadData();
    },
    // 根据专有网络加载已存在的 cidr 列表（用于校验重复）
    async loadCidrListByVnetId(vnetId) {
      if (!vnetId) {
        this.cidrList = [];
        return;
      }
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/vnetSubnetService/listCidrByVnetId',
          method: 'post',
          data: { vnetId: vnetId }
        });
        res = { data: res };
        if (res.data.errcode === 0) {
          this.cidrList = res.data.data || [];
        } else {
          this.cidrList = [];
        }
      } catch (error) {
        console.error('加载子网地址段列表失败:', error);
        this.cidrList = [];
      }
    },
    // 所属网络变化时重新加载 cidr 列表
    handleVnetChange(vnetId) {
      // this.loadCidrListByVnetId(vnetId); // 据我观察都不能重复
    },
    // 创建
    handleCreate() {
      this.modalTitle = '创建交换机';
      // 默认选第一个专有网络（如果有），并清空 cidrList
      const firstVnet = (this.networkList && this.networkList.length > 0) ? this.networkList[0] : null;
      const defaultVnetId = firstVnet ? firstVnet.id : '';
      this.switchForm = {
        id: '',
        subnetName: '',
        cidr: '',
        vnetId: defaultVnetId,
        description: '',
        companyCode: 'test'
      };
      this.cidrList = [];
      this.showModal = true;
      this.$nextTick(() => {
        if (this.$refs.switchForm) {
          this.$refs.switchForm.resetFields();
        }
        // 弹框打开后立即加载默认网络下的 cidr 列表
        if (defaultVnetId) {
          this.loadCidrListByVnetId(defaultVnetId);
        }
      });
    },
    // 提交
    async handleSubmit() {
      this.$refs.switchForm.validate(async valid => {
        if (!valid) return;
        this.submitting = true;
        try {
          const url = this.switchForm.id
            ? '/api/ac/shenbeigpuai/vnetSubnetService/updateSubnet'
            : '/api/ac/shenbeigpuai/vnetSubnetService/insertSubnet';
          let res = await this.$hdAxios.request({
            url: url,
            method: 'post',
            data: this.switchForm
          });
          res = { data: res }
          if (res.data.errcode === 0) {
            this.$Message.success(this.switchForm.id ? '修改成功' : '创建成功');
            this.showModal = false;
            this.loadData();
          } else {
            this.$Message.error(res.data.errmsg || '操作失败');
          }
        } catch (error) {
          console.error('提交失败:', error);
          this.$Message.error('操作失败，请稍后重试');
        } finally {
          this.submitting = false;
        }
      });
    },
    // 详情
    handleView(row) {
      this.currentSwitch = row;
      this.showDetailModal = true;
    },
    // 编辑
    handleEdit(row) {
      this.modalTitle = '编辑交换机';
      this.switchForm = {
        id: row.id,
        subnetName: row.subnetName,
        cidr: row.cidr,
        vnetId: row.vnetId,
        description: row.description
      };
      this.cidrList = [];
      this.showModal = true;
      this.$nextTick(() => {
        // 编辑时加载该专有网络下的 cidr 列表（保留当前行的 cidr，不算重复）
        if (row.vnetId) {
          this.loadCidrListByVnetId(row.vnetId);
        }
      });
    },
    // 端口状态变化
    handlePortStatusChange(row) {
      console.log('端口状态变化:', row.portNumber, row.enabled);
    },
    // 保存端口配置
    async handleSavePorts() {
      this.savingPorts = true;
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/switchService/configPorts',
          method: 'post',
          data: {
            switchId: this.currentSwitch.id,
            ports: this.portConfigList
          }
        });
        if (res.data.errcode === 0) {
          this.$Message.success('保存成功');
          this.showPortConfigModal = false;
          this.loadData();
        } else {
          this.$Message.error(res.data.errmsg || '保存失败');
        }
      } catch (error) {
        console.error('保存端口配置失败:', error);
        this.$Message.error('保存失败，请稍后重试');
      } finally {
        this.savingPorts = false;
      }
    },
    // 删除
    handleDelete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `确定要删除交换机"${row.subnetName}"吗？`,
        onOk: async () => {
          try {
            let res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/vnetSubnetService/deleteSubnet',
              method: 'post',
              data: { id: row.id }
            });
            res = { data: res }
            if (res.data.errcode === 0) {
              this.$Message.success('删除成功');
              this.loadData();
            } else {
              this.$Message.error(res.data.errmsg || '删除失败');
            }
          } catch (error) {
            console.error('删除失败:', error);
            this.$Message.error('删除失败，请稍后重试');
          }
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.switch-list {
  padding: 16px;
  background-color: #f5f7f9;
  min-height: 100vh;
  &__header1 {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        .page-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin: 0 0 8px 0;
        }

        .page-desc {
          font-size: 14px;
          color: #999;
          margin: 0;
        }
      }
    }
  }

  &__filter {
    margin-bottom: 20px;

    // 筛选区下拉/输入：13px（iView 默认 14px）
    /deep/ .ivu-select-placeholder,
    /deep/ .ivu-select-selected-value,
    /deep/ .ivu-select-input,
    /deep/ .ivu-select-selection,
    /deep/ .ivu-input {
      font-size: 13px !important;
    }

    // 查询/重置按钮：13px（iView 默认 14px）
    /deep/ .ivu-btn {
      font-size: 13px !important;
    }
  }

  &__table {
    /deep/ .ivu-table {
      font-size: 12px;
      color: #000000;
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

    /deep/ .ivu-table-cell > span,
    /deep/ .ivu-table-cell > .ivu-tag {
      display: inline-block;
    }

    .action-btns {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .action-link {
        cursor: pointer;
        color: #2d8cf0;
        font-size: 12px;

        &.delete {
          color: #ed4014;
        }

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      text-align: right;
    }
  }

  .detail-content {
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin: 24px 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8eaec;
    }

    .port-info {
      margin-top: 20px;
    }
  }

  .port-config-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}
</style>
