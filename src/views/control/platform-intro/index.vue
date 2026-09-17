<template>
  <div class="platform-intro">
    <!-- 顶部面包屑 -->
    <div class="platform-intro__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>帮助中心</BreadcrumbItem>
        <BreadcrumbItem>工单提交</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <Row :gutter="16">
      <!-- 左侧内容区 -->
      <!-- <Col span="16"> -->
        <Col span="24">
        <!-- 工单提交部分 -->
        <Card :bordered="false" dis-hover class="ticket-card">
          <h3 class="card-title">工单提交</h3>
          <Form ref="ticketFormRef" :model="ticketForm" :rules="ticketRules" :label-width="100" class="ticket-form">
            <FormItem label="紧急程度" prop="urgency">
              <RadioGroup v-model="ticketForm.urgency">
                <Radio v-for="item in ticketPriorityList" :key="item.value" :label="item.value">
                  <span class="radio-title">{{ item.label }}</span>
                </Radio>
              </RadioGroup>
            </FormItem>

            <FormItem label="工单类型" prop="category">
              <Select v-model="ticketForm.category" placeholder="请选择工单类型" style="width: 260px">
                <Option v-for="item in ticketTypeList" :key="item.value" :value="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>

            <FormItem label="联系方式" prop="contact">
              <Input v-model="ticketForm.contact" placeholder="请输入联系方式" style="width: 260px" />
            </FormItem>

            <FormItem label="问题描述" prop="description">
              <div class="description-container">
                <Input
                  v-model="ticketForm.description"
                  type="textarea"
                  :autosize="{minRows: 6, maxRows: 10}"
                  placeholder="请描述您的问题"
                />
              </div>
            </FormItem>

            <FormItem label="附件上传">
              <div class="attachment-container">
                <sp-upload
                  v-model="ticketForm.attachments"
                  :max-num="5"
                  :max-size="50"
                  :show-name="false"
                  :format="['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx','txt','zip','rar','7z','mp4']">
                </sp-upload>
                <div class="upload-tip">支持图片、文档、视频等格式，单个文件最大50M，最多上传5个附件</div>
              </div>
            </FormItem>

            <FormItem>
              <Button type="primary" size="large" @click="handleSubmit" class="submit-btn">提交</Button>
            </FormItem>
          </Form>
        </Card>
      </Col>

      <!-- 右侧导航列表 -->
      <!-- <Col span="8">
        <div class="nav-list">
          <div v-for="(item, index) in navItems" :key="index" class="nav-item" @click="handleNav(item)">
            <div class="nav-item__icon" :style="{ color: item.color }">
              <Icon :type="item.icon" size="24" />
            </div>
            <div class="nav-item__content">
              <h4 class="nav-item__title">{{ item.title }}</h4>
              <p class="nav-item__desc">{{ item.desc }}</p>
            </div>
            <Icon type="ios-arrow-forward" class="nav-item__arrow" />
          </div>
        </div>
      </Col> -->
    </Row>
  </div>
</template>

<script>
export default {
  name: 'PlatformIntro',
  data() {
    return {
      a: '',
      ticketForm: {
        urgency: 'low',
        category: '',
        contact: '',
        description: '',
        attachments: ''  // 附件路径，多个用逗号分隔
      },
      ticketRules: {
        urgency: [
          { required: true, message: '请选择紧急程度', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择工单类型', trigger: 'change' }
        ],
        contact: [
          { required: true, message: '请输入联系方式', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入问题描述', trigger: 'blur' },
          { type: 'string', min: 10, message: '问题描述至少需要10个字符', trigger: 'blur' }
        ]
      },
      // 字典数据
      ticketPriorityList: [],  // 工单优先级
      ticketTypeList: [],     // 工单类型
      navItems: [
        { title: '操作说明', desc: '平台各类工具使用说明与教程', icon: 'md-bulb', color: '#2d8cf0' },
        { title: '服务条款', desc: '服务条款，免责声明', icon: 'md-document', color: '#19be6b' },
        { title: '隐私政策', desc: '服务条款，免责声明', icon: 'md-warning', color: '#2d8cf0' },
        { title: '充值与计费', desc: '服务条款，免责声明', icon: 'logo-yen', color: '#2d8cf0' },
        { title: '发票服务', desc: '服务条款，免责声明', icon: 'md-paper', color: '#2d8cf0' },
        { title: '常见问题', desc: '服务条款，免责声明', icon: 'md-help-circle', color: '#2d8cf0' },
        { title: '第三方工具', desc: '服务条款，免责声明', icon: 'md-settings', color: '#2d8cf0' }
      ]
    }
  },
  created() {
    this.fetchTicketPriorityDict()
    this.fetchTicketTypeDict()
    // 默认联系方式取当前登录用户的手机号
    try {
      const vuex = sessionStorage.getItem('vuex')
      if (vuex) {
        const userData = JSON.parse(vuex)
        const mobile = userData.user && userData.user.severUserInfo && userData.user.severUserInfo.data && userData.user.severUserInfo.data.mobile
        if (mobile) {
          this.ticketForm.contact = mobile
        }
      }
    } catch (e) {
      console.error('获取当前用户手机号失败:', e)
    }
  },
  methods: {
    // 获取工单优先级字典
    async fetchTicketPriorityDict() {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/as/sc/dict/getDictInfoList',
          method: 'post',
          data: { type: 'ticket_priority' }
        })
        if (res.errcode === 0 && res.data) {
          this.ticketPriorityList = res.data || []
          // 设置默认值（取第一个）
          if (this.ticketPriorityList.length > 0) {
            this.ticketForm.urgency = this.ticketPriorityList[0].value
          }
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        }
      } catch (e) {
        console.error('获取工单优先级字典失败:', e)
        // 备用默认值
        this.ticketPriorityList = [
          { value: 'low', label: '低' },
          { value: 'medium', label: '中' },
          { value: 'high', label: '高' },
          { value: 'urgent', label: '紧急' }
        ]
      }
    },

    // 获取工单类型字典
    async fetchTicketTypeDict() {
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
        // 备用默认值
        this.ticketTypeList = [
          { value: 'usage', label: '产品使用咨询' },
          { value: 'business', label: '业务受理' },
          { value: 'complaint', label: '投诉建议' },
          { value: 'bug', label: '功能异常' },
          { value: 'other', label: '其他' }
        ]
      }
    },

    async handleSubmit() {
      this.$refs.ticketFormRef.validate(async (valid) => {
        if (valid) {
          try {
            // 调用后端接口提交工单
            const res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/consultTicketService/addConsultTicket',
              method: 'post',
              data: {
                priority: this.ticketForm.urgency,
                type: this.ticketForm.category,
                contact: this.ticketForm.contact,
                description: this.ticketForm.description,
                attachments: this.ticketForm.attachments
              }
            });

            if (res.errcode === 0) {
              this.$Message.success('工单提交成功，我们将尽快处理');

              // 重置表单
              this.ticketForm = {
                urgency: this.ticketPriorityList.length > 0 ? this.ticketPriorityList[0].value : 'low',
                category: '',
                contact: '',
                description: '',
                attachments: ''
              };
              this.$refs.ticketFormRef.resetFields();

              // 跳转到工单列表页
              this.$router.push('/shenbeigpuai/control/ticket-list');
            } else {
              this.$Message.error(res.errmsg || '工单提交失败');
            }
          } catch (error) {
            console.error('工单提交失败:', error);
            this.$Message.error('工单提交失败，请重试');
          }
        } else {
          this.$Message.error('请完善表单信息');
        }
      });
    },
    handleNav(item) {
      this.$Message.info(`跳转至：${item.title}`);
    }
  }
}
</script>

<style lang="less" scoped>
.platform-intro {
  position: relative;
  padding: 16px;
  background: #f5f7f9;
  min-height: 95vh;
  background: linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('~@/assets/file/shenbeigpuai/image/gondan.png') no-repeat center center;
  background-size: cover;

  > * {
    position: relative;
    z-index: 1;
  }

  &__breadcrumb {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #17233d;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #2d8cf0;
  }

  .intro-card {
    margin-bottom: 16px;
    border-radius: 4px;
    
    .intro-content {
      color: #515a6e;
      line-height: 1.8;
      font-size: 14px;
      text-align: justify;
    }
  }

  .ticket-card {
    width:50%;
    height: 80vh;
    // margin: 0 auto;
    border-radius: 4px;
    
    .ticket-form {
      margin-top: 10px;

      /deep/ .ivu-form-item-label {
        font-weight: 500;
        color: #808695;
      }

      .radio-title {
        font-weight: 600;
        margin-left: 4px;
      }

      .radio-desc {
        font-size: 12px;
        color: #999;
        margin-left: 24px;
        margin-top: 4px;
      }

      .description-container {
        border: 1px solid #dcdee2;
        border-radius: 4px;
        overflow: hidden;

        /deep/ .ivu-input {
          border: none;
          box-shadow: none;
          &:focus {
            box-shadow: none;
          }
        }
      }

      .attachment-container {
        .upload-tip {
          font-size: 12px;
          color: #ed4014;
          margin-top: 8px;
        }
      }

      .submit-btn {
        width: 100px;
        margin-top: 10px;
      }
    }
  }

  .nav-list {
    .nav-item {
      background: #fff;
      margin-bottom: 12px;
      padding: 16px 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      position: relative;

      &:hover {
        box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }

      &__icon {
        margin-right: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #f0faff;
        border-radius: 8px;
      }

      &__content {
        flex: 1;
      }

      &__title {
        font-size: 15px;
        font-weight: 600;
        color: #17233d;
        margin-bottom: 4px;
      }

      &__desc {
        font-size: 12px;
        color: #808695;
      }

      &__arrow {
        color: #c5c8ce;
        font-size: 18px;
      }
    }
  }
}
</style>
