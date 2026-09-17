<template>
  <div class="network-list">
    <div class="network-list__header1">
      <Breadcrumb>
        <BreadcrumbItem>网络</BreadcrumbItem>
        <BreadcrumbItem>专有网络</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <!-- 页面头部 -->
    <Card class="network-list__header" :bordered="false" dis-hover>
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">专有网络</h2>
          <p class="page-desc">管理您的专有网络，控制网络访问权限</p>
        </div>
        <div class="header-right">
          <Button icon="md-add" @click="handleCreate">创建专有网络</Button>
        </div>
      </div>
    </Card>

    <!-- 筛选区域 -->
    <Card class="network-list__filter" :bordered="false" dis-hover>
      <Form ref="filterForm" :model="filterForm" :label-width="80" inline>
        <FormItem label="网络名称" style="margin-bottom: 0px;margin-right: 0px;">
           <!-- @on-keyup="handleVnetNameKeyup" -->
          <Input v-model="filterForm.vnetName" placeholder="请输入网络名称" clearable style="width: 200px" />
        </FormItem>
        <FormItem label="地域" style="margin-bottom: 0px;margin-right: 0px;">
          <Select v-model="filterForm.regionId" placeholder="请选择地域" clearable style="width: 200px">
            <Option v-for="item in regionList" :key="item.id" :value="item.id">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem :label-width="0" style="margin-bottom: 0px;margin-left: 8px;">
          <Button type="primary" icon="md-search" @click="handleSearch">搜索</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="handleReset">重置</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 列表区域 -->
    <Card class="network-list__table" :bordered="false" dis-hover>
      <Table
        :columns="tableColumns"
        :data="pagedData"
        :loading="loading"
        stripe
      >
        <template slot-scope="{ row }" slot="action">
          <div class="action-btns">
            <!-- <a class="action-link" @click="handleView(row)">详情</a> -->
            <a v-if="row.isDefault !== '1'" class="action-link" @click="handleEdit(row)">编辑</a>
            <!-- <a class="action-link" @click="handleConfig(row)">配置</a> -->
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
      <Form ref="networkForm" :model="networkForm" :rules="networkRules" :label-width="100">
        <FormItem label="网络名称" prop="vnetName">
          <Input v-model="networkForm.vnetName" placeholder="请输入网络名称（仅支持英文和数字）" maxlength="50" />
        </FormItem>
        <FormItem label="所属地域" prop="regionId">
          <Select v-model="networkForm.regionId" :disabled="networkForm.id !== ''" placeholder="请选择地域">
            <Option v-for="item in regionList" :key="item.id" :value="item.id">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="描述">
          <Input
            v-model="networkForm.description"
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
    <Modal v-model="showDetailModal" title="专有网络详情" width="700" :footer-hide="true">
      <div v-if="currentNetwork" class="detail-content">
        <Descriptions :column="1" border>
          <DescriptionsItem label="网络ID">{{ currentNetwork.id }}</DescriptionsItem>
          <DescriptionsItem label="网络名称">{{ currentNetwork.vnetName }}</DescriptionsItem>
          <DescriptionsItem label="所属地域">{{ currentNetwork.regionId }}</DescriptionsItem>
          <DescriptionsItem label="创建时间">{{ currentNetwork.createTime }}</DescriptionsItem>
          <DescriptionsItem label="描述">{{ currentNetwork.description || '-' }}</DescriptionsItem>
        </Descriptions>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-control-network-list',
  data() {
    return {
      loading: false,
      submitting: false,
      filterForm: {
        vnetName: '',
        regionId: ''
      },
      tableColumns: [
        {
          title: '网络ID',
          key: 'id',
          minWidth: 180
        },
        {
          title: '网络名称',
          key: 'vnetName',
          minWidth: 150
        },
        {
          title: '所属地域',
          key: 'regionId',
          minWidth: 100,
          render: (h, params) => {
            const region = this.regionList.find(item => item.id === params.row.regionId);
            return h('span', region ? region.label : params.row.regionId);
          }
        },
        {
          title: '交换机',
          key: 'subnetCount',
          width: 100,
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  this.$router.push({
                    path: '/shenbeigpuai/control/switch',
                    query: { vnetId: params.row.id }
                  });
                }
              }
            }, params.row.subnetCount || 0);
          }
        },
        {
          title: '创建时间',
          key: 'createTime',
          minWidth: 160
        },
        {
          title: '操作',
          align: 'center',
          slot: 'action',
          width: 200,
          // fixed: 'right'
        }
      ],
      tableData: [],
      allTableData: [],
      pagination: {
        pageNo: 1,
        pageSize: 10,
        totalRecord: 0
      },
      regionList: [],
      showModal: false,
      modalTitle: '创建专有网络',
      networkForm: {
        id: '',
        vnetName: '',
        regionId: '',
        description: ''
      },
      networkRules: {
        vnetName: [
          { required: true, message: '请输入网络名称', trigger: 'blur' },
          { type: 'string', min: 2, max: 50, message: '网络名称长度在2-50个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '网络名称仅支持英文和数字', trigger: 'blur' }
        ],
        regionId: [
          { required: true, message: '请选择地域', trigger: 'change' }
        ]
      },
      showDetailModal: false,
      currentNetwork: null
    };
  },
  computed: {
    // 分页后的数据
    pagedData() {
      const start = (this.pagination.pageNo - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return this.tableData.slice(start, end);
    }
  },
  mounted() {
    this.fetchRegionList();
    this.loadData();
  },
  methods: {
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
        console.log(this.regionList)
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
    // 加载数据
    async loadData() {
      this.loading = true;
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/vnetService/listVNet',
          method: 'post',
          data: {
            ...this.filterForm,
          }
        });
        res = { data: res }
        if (res.data.errcode === 0) {
          const list = res.data.data || [];
          this.allTableData = list;
          this.handleSearch();
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(res.data.errmsg || '加载数据失败');
        }
      } catch (error) {
        console.error('加载网络列表失败:', error);
        this.$Message.error('加载数据失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },
    // 搜索
    handleSearch() {
      this.pagination.pageNo = 1;
      let filteredData = [...this.allTableData];

      // 按网络名称过滤
      if (this.filterForm.vnetName) {
        const keyword = this.filterForm.vnetName.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.vnetName && item.vnetName.toLowerCase().includes(keyword)
        );
      }
      console.log(this.filterForm)
      // 按地域过滤
      if (this.filterForm.regionId) {
        filteredData = filteredData.filter(item =>
          item.regionId === this.filterForm.regionId
        );
      }

      this.tableData = filteredData;
      this.pagination.totalRecord = filteredData.length;
    },
    // 限制网络名称输入：只允许英文和数字（搜索框过滤）
    handleVnetNameKeyup() {
      ['filterForm.vnetName'].forEach((path) => {
        const [form, key] = path.split('.')
        const value = this[form] && this[form][key]
        if (value == null) return
        const filtered = String(value).replace(/[^a-zA-Z0-9]/g, '')
        if (filtered !== value) {
          this.$set(this[form], key, filtered)
        }
      })
    },
    // 重置
    handleReset() {
      this.filterForm = {
        vnetName: '',
        regionId: ''
      };
      this.pagination.pageNo = 1;
      this.tableData = [...this.allTableData];
      this.pagination.totalRecord = this.allTableData.length;
    },
    // 分页变化
    handlePageChange(page) {
      this.pagination.pageNo = page;
    },
    // 分页大小变化
    handlePageSizeChange(pageSize) {
      this.pagination.pageSize = pageSize;
      this.pagination.pageNo = 1;
    },
    // 创建
    handleCreate() {
      this.modalTitle = '创建专有网络';
      this.networkForm = {
        id: '',
        vnetName: '',
        regionId: '',
        description: ''
      };
      this.showModal = true;
      this.$nextTick(() => {
        this.$refs.networkForm.resetFields();
      });
    },
    // 提交
    async handleSubmit() {
      this.$refs.networkForm.validate(async valid => {
        if (!valid) return;
        this.submitting = true;
        try {
          const url = this.networkForm.id
            ? '/api/ac/shenbeigpuai/vnetService/updateVNet'
            : '/api/ac/shenbeigpuai/vnetService/insertVNet';
          let res = await this.$hdAxios.request({
            url: url,
            method: 'post',
            data: this.networkForm
          });
          res = { data: res }
          if (res.data.errcode === 0) {
            this.$Message.success(this.networkForm.id ? '修改成功' : '创建成功');
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
      this.currentNetwork = row;
      this.showDetailModal = true;
    },
    // 编辑
    handleEdit(row) {
      this.modalTitle = '编辑专有网络';
      this.networkForm = {
        id: row.id,
        vnetName: row.vnetName,
        regionId: row.regionId,
        description: row.description
      };
      this.showModal = true;
    },
    // 配置
    handleConfig(row) {
      this.$Message.info('配置功能开发中...');
    },
    // 删除
    handleDelete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `确定要删除专有网络"${row.vnetName}"吗？`,
        onOk: async () => {
          try {
            let res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/vnetService/deleteVNet',
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
.network-list {
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

    // 搜索/重置按钮：13px（iView 默认 14px）
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

    /deep/ .ivu-table-cell > span {
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

    .cidr-text {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
    }

    .pagination-wrapper {
      margin-top: 20px;
      text-align: right;
    }
  }

  .detail-content {
    padding: 10px 0;
  }

  .form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}
</style>
