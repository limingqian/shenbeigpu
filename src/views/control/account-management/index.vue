<template>
  <div class="account-management">
    <!-- 顶部面包屑 -->
    <div class="account-management__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>账号管理</BreadcrumbItem>
        <BreadcrumbItem>账号管理</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 基本信息（占满整行） -->
    <Card :bordered="false" dis-hover class="info-card">
      <div slot="title" class="card-title">
        <span class="card-title__bar"></span>基本信息
      </div>
      <Spin fix v-if="authLoading" />
      <div class="user-profile">
        <div class="avatar-wrapper">
          <sp-upload class="avatar-upload" :max-num="1" scp-type="上传文件" v-model="userPhoto"
            :format="['jpg', 'jpeg', 'pdf', 'doc']"></sp-upload>

          <span class="auth-tag" :class="{
            'certified-personal': authInfo && (authInfo.authStatus === '已认证' || authInfo.authStatus === 'PASSED') && (authInfo.userType === 'PERSONAL'),
            'certified-enterprise': authInfo && (authInfo.authStatus === '已认证' || authInfo.authStatus === 'PASSED') && (authInfo.userType === 'ENTERPRISE'),
            'auditing-personal': authInfo && (authInfo.authStatus === '认证审核中' || authInfo.authStatus === 'AUDITING') && (authInfo.userType === 'PERSONAL'),
            'auditing-enterprise': authInfo && (authInfo.authStatus === '认证审核中' || authInfo.authStatus === 'AUDITING') && (authInfo.userType === 'ENTERPRISE'),
            'failed': authInfo && (authInfo.authStatus === '认证失败' || authInfo.authStatus === 'FAILED'),
            'uncertified': !authInfo || (authInfo.authStatus !== '已认证' && authInfo.authStatus !== 'PASSED' && authInfo.authStatus !== '认证审核中' && authInfo.authStatus !== 'AUDITING' && authInfo.authStatus !== '认证失败' && authInfo.authStatus !== 'FAILED')
          }">
            {{ getAuthStatusText(authInfo && authInfo.authStatus, authInfo && authInfo.userType) }}
          </span>
        </div>
        <div class="user-details">
          <div class="detail-item">
            <span class="label">账号</span>
            <span class="value">{{ authInfo && authInfo.mobile ? authInfo.mobile : '-' }}</span>
          </div>
          <div class="detail-item" style="margin-top: 12px;">
            <span class="label">账户余额</span>
            <div class="balance-wrapper">
              <span class="value balance">¥{{ balance || '0.00' }}</span>
              <span v-if="frozenBalance && parseFloat(frozenBalance) > 0" class="frozen-hint">（其中冻结金额：¥{{ frozenBalance
                }}）</span>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 账号安全 + API密钥 同一行 -->
    <Row :gutter="24" style="margin-top: 16px;height: 72vh;">
      <!-- 左侧：账号安全（占 1/3） -->
      <Col :span="8">
      <Card :bordered="false" dis-hover class="section-card">
        <div slot="title" class="card-title">
          <span class="card-title__bar"></span>账号安全
        </div>
        <div class="security-list">
          <!-- 登录密码 -->
          <div class="security-item">
            <div class="security-item__main">
              <div class="security-icon">
                <Icon type="md-lock" size="20" />
              </div>
              <div class="security-content">
                <h4 class="title">登录密码</h4>
                <p class="desc">建议您定期更换密码，密码要求包含特殊字符和大小写字母数字且长度超过8位</p>
              </div>
            </div>
            <div class="security-item__footer">
              <a class="action-link" @click="handleSecurityAction({ title: '登录密码', actionText: '立即修改' })">立即修改</a>
            </div>
          </div>
          <!-- 支付密码 -->
          <div class="security-item">
            <div class="security-item__main">
              <div class="security-icon">
                <Icon type="md-card" size="20" />
              </div>
              <div class="security-content">
                <h4 class="title">支付密码</h4>
                <p class="desc">{{ payPwdDesc }}</p>
              </div>
            </div>
            <div class="security-item__footer">
              <template v-if="payPwdStatus === 'bound'">
                <span class="status-success">
                  <Icon type="md-checkmark-circle" /> 已设置
                </span>
                <span class="divider">|</span>
                <a class="action-link"
                  @click="handleSecurityAction({ title: '支付密码', status: 'bound', actionText: '修改密码' })">修改密码</a>
              </template>
              <a v-else class="action-link" @click="handleSecurityAction({ title: '支付密码', actionText: '立即设置' })">立即设置</a>
            </div>
          </div>
          <!-- 个人/企业认证 -->
          <div class="security-item">
            <div class="security-item__main">
              <div class="security-icon">
                <Icon type="md-person" size="20" />
              </div>
              <div class="security-content">
                <h4 class="title">个人/企业认证</h4>
                <p class="desc">{{ authDesc }}</p>
              </div>
            </div>
            <div class="security-item__footer">
              <template v-if="authStatus === 'bound'">
                <span class="status-success">
                  <Icon type="md-checkmark-circle" /> 已认证
                </span>
              </template>
              <a v-else class="action-link"
                @click="handleSecurityAction({ title: '个人/企业认证', actionText: '立即认证' })">立即认证</a>
            </div>
          </div>
        </div>
      </Card>
      </Col>

      <!-- 右侧：API密钥（占 2/3） -->
      <Col :span="16">
      <Card :bordered="false" dis-hover class="section-card">
        <div slot="title" class="card-title">
          <span class="card-title__bar"></span>API密钥
        </div>
        <a slot="extra" class="action-link" @click="showCreateModal = true">新建密钥</a>
        <div class="api-content" style="position: relative; min-height: 100px;">
          <Spin fix v-if="loading" />
          <div v-if="apiKeys.length === 0 && !loading" class="empty-state">
            <p>暂无API密钥</p>
          </div>
          <div class="api-grid" v-else>
            <Card :bordered="false" dis-hover class="api-card" v-for="apiKey in apiKeys" :key="apiKey.id">
              <div class="api-card__header">
                <span class="status-dot"
                  :class="{ 'enabled': apiKey.isEnabled === '1', 'disabled': apiKey.isEnabled === '0' || apiKey.isEnabled === '' }"></span>
                <h4 class="api-title">{{ apiKey.keyName }}</h4>
              </div>
              <div class="api-info-row">
                <p class="api-key" :title="apiKey.apiKey">API密钥：{{ apiKey.apiKey }}</p>
                <a class="copy-btn" @click="copyApiKey(apiKey.apiKey)">
                  <Icon type="md-copy" />
                  <span>复制</span>
                </a>
                <p class="api-time">创建时间：{{ apiKey.createTime }}</p>
                <div class="api-actions">
                  <a class="action-link" @click="handleEditApiKey(apiKey)">编辑</a>
                  <span class="divider">|</span>
                  <a class="action-link danger" @click="handleDeleteApiKey(apiKey)">删除</a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
      </Col>
    </Row>

    <!-- 新建API密钥弹框 -->
    <Modal v-model="showCreateModal" title="新建API密钥" :mask-closable="false" @on-ok="handleCreateApiKey">
      <Form :model="createForm" :rules="createFormRules" ref="createFormRef" :label-width="120">
        <FormItem label="API密钥名称" prop="keyName">
          <Input v-model="createForm.keyName" placeholder="请输入API密钥名称" />
        </FormItem>
      </Form>
    </Modal>

    <!-- 编辑API密钥弹框 -->
    <Modal v-model="showEditModal" title="编辑API密钥" :mask-closable="false" @on-ok="handleUpdateApiKey">
      <Form :model="editForm" :rules="editFormRules" ref="editFormRef" :label-width="120">
        <FormItem label="API密钥名称" prop="keyName">
          <Input v-model="editForm.keyName" placeholder="请输入API密钥名称" />
        </FormItem>
      </Form>
    </Modal>
    <!-- 修改登录密码弹框 -->
    <Modal v-model="showLoginPwdModal" title="修改登录密码" :mask-closable="false" @on-cancel="handleLoginPwdCancel">
      <Form :model="loginPwdForm" :rules="loginPwdRules" ref="loginPwdFormRef" :label-width="160">
        <FormItem label="旧密码" prop="oldPassword">
          <Input v-model="loginPwdForm.oldPassword" style="width: 70%;" type="password" placeholder="请输入旧密码"
            maxlength="20" autocomplete="new-password" />
        </FormItem>
        <FormItem label="新密码" prop="newPassword">
          <Input v-model="loginPwdForm.newPassword" style="width: 70%;" type="password" placeholder="请输入新密码"
            maxlength="20" autocomplete="new-password" />
        </FormItem>
        <FormItem label="确认密码" prop="confirmPassword">
          <Input v-model="loginPwdForm.confirmPassword" style="width: 70%;" type="password" placeholder="请再次输入密码"
            maxlength="20" autocomplete="new-password" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleLoginPwdCancel">取消</Button>
        <Button type="primary" :loading="loginPwdLoading" @click="handleLoginPwdOk">确定</Button>
      </div>
    </Modal>
    <!-- 设置/修改支付密码弹框 -->
    <Modal v-model="showPayPwdModal" :title="payPwdIsEdit ? '修改支付密码' : '设置支付密码'" :mask-closable="false"
      @on-cancel="handlePayPwdCancel">
      <Form :model="payPwdForm" :rules="payPwdRules" ref="payPwdFormRef" :label-width="160">
        <FormItem v-if="payPwdIsEdit" label="旧支付密码" prop="oldPassword">
          <Input v-model="payPwdForm.oldPassword" style="width: 70%;" type="password" placeholder="请输入旧支付密码"
            maxlength="6" autocomplete="new-password" />
        </FormItem>
        <FormItem v-else label="支付密码" prop="newPassword">
          <Input v-model="payPwdForm.newPassword" style="width: 70%;" type="password" placeholder="请输入6位支付密码"
            maxlength="6" autocomplete="new-password" />
        </FormItem>
        <FormItem v-if="!payPwdIsEdit" label="确认密码" prop="confirmPassword">
          <Input v-model="payPwdForm.confirmPassword" style="width: 70%;" type="password" placeholder="请再次输入密码"
            maxlength="6" autocomplete="new-password" />
        </FormItem>
        <FormItem v-if="payPwdIsEdit" label="新支付密码" prop="newPassword">
          <Input v-model="payPwdForm.newPassword" style="width: 70%;" type="password" placeholder="请输入新支付密码"
            maxlength="6" autocomplete="new-password" />
        </FormItem>
        <FormItem v-if="payPwdIsEdit" label="确认密码" prop="confirmPassword">
          <Input v-model="payPwdForm.confirmPassword" style="width: 70%;" type="password" placeholder="请再次输入密码"
            maxlength="6" autocomplete="new-password" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handlePayPwdCancel">取消</Button>
        <Button type="primary" :loading="payPwdLoading" @click="handlePayPwdOk">确定</Button>
      </div>
    </Modal>

    <!-- 微信绑定二维码弹窗 -->
    <Modal v-model="showWxQrModal" title="微信绑定" width="400" :footer-hide="true" :mask-closable="false"
      @on-cancel="handleWxQrCancel">
      <div class="wx-qr-modal-content">
        <div class="wx-qr-tip">请使用微信扫描下方二维码进行绑定</div>
        <div class="wx-qr-code-wrapper">
          <img v-if="wxQrCode" :src="wxQrCode" alt="微信绑定二维码" class="wx-qr-code" />
          <Spin v-else fix>加载中...</Spin>
        </div>
        <div class="wx-qr-status" v-if="wxBindStatus === '绑定中'">
          <Icon type="ios-time" />
          <span>等待扫码中...</span>
        </div>
        <div class="wx-qr-status success" v-else-if="wxBindStatus === '已绑定'">
          <Icon type="md-checkmark-circle" />
          <span>绑定成功！</span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'AccountManagement',
  data () {
    return {
      userPhoto: '',
      isPhotoInitialized: false,  // 头像是否已初始化
      userInfo: {
        userId: 'user_001'
      },
      authInfo: null,  // 用户认证信息
      balance: '',     // 账户余额
      frozenBalance: '', // 冻结余额
      payPasswordOldTemp: '',  // 临时旧支付密码（修改时使用）
      payPasswordTemp: '',  // 临时支付密码（设置/修改时使用）
      payPasswordConfirmTemp: '',  // 临时确认支付密码
      loginPasswordOldTemp: '',  // 临时旧登录密码（修改时使用）
      loginPasswordTemp: '',  // 临时登录密码（修改时使用）
      loginPasswordConfirmTemp: '',  // 临时确认登录密码
      apiKeys: [],
      loading: false,
      authLoading: false,  // 认证信息加载状态
      showCreateModal: false,
      showLoginPwdModal: false,
      loginPwdLoading: false,
      showPayPwdModal: false,
      payPwdLoading: false,
      payPwdIsEdit: false,
      payPwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      payPwdRules: {
        oldPassword: [
          { required: true, message: '请输入旧支付密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入支付密码', trigger: 'blur' },
          { type: 'string', len: 6, message: '支付密码必须为6位数字', trigger: 'blur' },
          { pattern: /^\d{6}$/, message: '支付密码必须为6位数字', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: this.validatePayPwdConfirm, trigger: 'blur' }
        ]
      },
      loginPwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      loginPwdRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { type: 'string', min: 8, message: '登录密码长度不能少于8位', trigger: 'blur' },
          { validator: this.validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      createForm: {
        keyName: ''
      },
      createFormRules: {
        keyName: [
          { required: true, message: 'API密钥名称不能为空', trigger: 'blur' }
        ]
      },
      showEditModal: false,
      editForm: {
        id: '',
        keyName: ''
      },
      editFormRules: {
        keyName: [
          { required: true, message: 'API密钥名称不能为空', trigger: 'blur' }
        ]
      },
      securityItems: [
        {
          title: '登录密码',
          desc: '建议您定期更换密码，密码要求包含特殊字符和大小写字母数字且长度超过8位',
          icon: 'md-lock',
          actionText: '立即修改',
          statusText: '已修改'
        },
        {
          title: '手机绑定',
          desc: '您已绑定手机号码',
          icon: 'md-phone-portrait',
          status: 'bound',
          actionText: '修改',
          statusText: '已绑定'
        },
        {
          title: '个人/企业认证',
          desc: '认证后可以购买产品以及使用更多更完整的功能',
          icon: 'md-person',
          actionText: '立即认证',
          hideEditWhenBound: true,
          statusText: '已认证'
        },
        {
          title: '微信绑定',
          desc: '扫码绑定，可快速登录',
          icon: 'logo-whatsapp',
          actionText: '去绑定',
          statusText: '已绑定'
        },
        {
          title: '支付密码',
          desc: '设置支付密码，保障账户资金安全',
          icon: 'md-card',
          actionText: '立即设置',
          statusText: '已设置'
        }
      ],
      mobileDesc: '您已绑定手机号码',
      mobileStatus: '',
      authDesc: '认证后可以购买产品以及使用更多更完整的功能',
      authStatus: '',
      wxDesc: '扫码绑定，可快速登录',
      wxStatus: '',
      payPwdDesc: '设置支付密码，保障账户资金安全',
      payPwdStatus: '',
      // 微信绑定二维码相关
      showWxQrModal: false,
      wxQrCode: '',
      wxBindStatus: '', // '等待扫码中' | '绑定中' | '已绑定'
      wxPollingTimer: null,
      wxPollingCount: 0,
      maxWxPollingCount: 300, // 最大轮询次数（约15分钟）
      wxPollingInterval: 3000 // 轮询间隔（3秒）
    }
  },
  watch: {
    userPhoto (newVal, oldVal) {
      // 初始化完成后，只要新旧值不同就同步到后端（含置空场景）
      if (this.isPhotoInitialized && newVal !== oldVal) {
        this.updateUserPhoto(newVal || '');
      }
    }
  },
  mounted () {
    this.loadAuthInfo();
    this.loadApiKeys();
    // 检查是否有微信授权回调的code
    this.handleWxCallbackFromUrl()
  },
  beforeDestroy () {
    // 组件销毁时清除微信绑定轮询定时器
    this.stopWxPolling();
  },
  methods: {
    // 检查URL中是否有微信授权回调的code
    handleWxCallbackFromUrl () {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      if (code) {
        // 有code，说明是从微信授权页面返回的，清除URL中的code参数
        this.handleWechatCallback(code)
        // 清除URL中的code和state参数（不跳转，避免重复触发）
        const cleanUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      }
    },

    // 校验密码格式（必须包含大小写字母和特殊字符）
    validatePassword (rule, value, callback) {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (value.length < 8) {
        callback(new Error('登录密码长度不能少于8位'))
      } else {
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        // const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
        // if (!hasUpperCase || !hasLowerCase || !hasSpecialChar) {
        if (!hasUpperCase || !hasLowerCase) {
          callback(new Error('登录密码必须同时包含大小写字母和特殊字符'))
        } else {
          callback()
        }
      }
    },
    // 校验确认密码
    validateConfirmPassword (rule, value, callback) {
      if (!value) {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.loginPwdForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    // 校验支付密码确认
    validatePayPwdConfirm (rule, value, callback) {
      if (!value) {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.payPwdForm.newPassword) {
        callback(new Error('两次输入的支付密码不一致'))
      } else {
        callback()
      }
    },
    // 修改登录密码确认
    async handleLoginPwdOk () {
      this.loginPwdLoading = true
      const valid = await new Promise((resolve) => {
        this.$refs.loginPwdFormRef.validate((v) => resolve(v))
      })
      if (!valid) {
        this.loginPwdLoading = false
        return
      }
      try {
        const vuexData = JSON.parse(sessionStorage.getItem('vuex') || '{}')
        const userName = vuexData.user.severUserInfo.data.loginName
        const res = await this.$hdAxios.request({
          url: '/api/ac/sc/systemUserService/updatePwd',
          method: 'post',
          data: {
            userName: userName,
            oldpassword: this.$aesEncrypt(this.loginPwdForm.oldPassword),
            newpassword: this.$aesEncrypt(this.loginPwdForm.newPassword),
            repassword: this.$aesEncrypt(this.loginPwdForm.confirmPassword)
          }
        })
        if (res.errcode === 0) {
          this.$Message.success('登录密码修改成功，请重新登录')
          this.showLoginPwdModal = false
          this.loginPwdLoading = false
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(res.errmsg || '操作失败')
          this.loginPwdLoading = false
        }
      } catch (e) {
        console.error('更新登录密码失败:', e)
        this.$Message.error('操作失败，请稍后重试')
        this.loginPwdLoading = false
      }
    },
    // 修改登录密码取消
    handleLoginPwdCancel () {
      this.$refs.loginPwdFormRef.resetFields()
      this.loginPwdLoading = false
      this.showLoginPwdModal = false
    },
    // 支付密码确认
    async handlePayPwdOk () {
      this.payPwdLoading = true
      const valid = await new Promise((resolve) => {
        this.$refs.payPwdFormRef.validate((v) => resolve(v))
      })
      if (!valid) {
        this.payPwdLoading = false
        return
      }
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/updatePayPassword',
          method: 'post',
          data: {
            oldPayPassword: this.payPwdIsEdit ? this.$aesEncrypt(this.payPwdForm.oldPassword) : '',
            newPayPassword: this.$aesEncrypt(this.payPwdForm.newPassword),
            confirmPayPassword: this.$aesEncrypt(this.payPwdForm.confirmPassword)
          }
        })
        if (res.errcode === 0) {
          this.$Message.success(this.payPwdIsEdit ? '支付密码修改成功' : '支付密码设置成功')
          this.showPayPwdModal = false
          this.loadAuthInfo()
        } else {
          this.$Message.error(res.errmsg || '操作失败')
          this.payPwdLoading = false
        }
      } catch (e) {
        console.error('更新支付密码失败:', e)
        this.$Message.error('操作失败，请稍后重试')
        this.payPwdLoading = false
      }
    },
    // 支付密码取消
    handlePayPwdCancel () {
      this.$refs.payPwdFormRef.resetFields()
      this.payPwdLoading = false
      this.showPayPwdModal = false
    },
    // 更新用户头像
    async updateUserPhoto (photoUrl) {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/updateUserPhoto',
          method: 'post',
          data: { photo: photoUrl }
        });
        if (res.errcode === 0) {
          if (photoUrl) {
            this.$Message.success('头像更新成功');
          } else {
            this.$Message.success('头像已清除');
          }
          // 通知系统外框刷新头像
          this.$root.$emit('refreshUserPhoto');
        } else {
          this.$Message.error(res.errmsg || '头像更新失败');
        }
      } catch (error) {
        console.error('更新头像失败:', error);
        this.$Message.error('头像更新失败');
      }
    },
    // 加载用户认证信息
    async loadAuthInfo () {
      this.authLoading = true;
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        });

        if (res.errcode === 0) {
          const data = res.data || {};
          this.authInfo = data;
          this.userInfo.userId = data.userId || '';
          this.balance = data.accountBalance || '0.00';
          this.frozenBalance = data.frozenBalance || '';
          this.userPhoto = data.photo || '';
          // 标记头像已初始化，此时 watch 才会触发接口调用
          this.$nextTick(() => {
            this.isPhotoInitialized = true;
          })

          // 更新实名认证状态
          if (data.authStatus === 'PASSED' && data.userType === 'ENTERPRISE') {
            this.authDesc = '已完成企业认证';
            this.authStatus = 'bound';
          } else if (data.authStatus === '已认证') {
            this.authDesc = `已认证：${data.realName || ''}`;
            this.authStatus = 'bound';
          }
          // 更新手机绑定状态
          if (data.mobile) {
            this.mobileDesc = `您已绑定手机号码 ${data.mobile || ''}`;
            this.mobileStatus = 'bound';
          }

          // 更新微信绑定状态
          if (data.wxBindStatus === '1') {
            this.wxDesc = `已绑定：${data.wxNickname || '微信用户'}`;
            this.wxStatus = 'bound';
          }

          // 更新支付密码状态
          if (data.payPasswordSet === true || data.payPasswordSet === '1') {
            this.payPwdDesc = '已设置：••••';
            this.payPwdStatus = 'bound';
          } else {
            this.payPwdDesc = '未设置：设置支付密码保障账户资金安全';
          }
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(res.errmsg || '加载用户信息失败');
        }
      } catch (e) {
        console.error('加载用户信息失败:', e);
        this.$Message.error('加载用户信息失败，请稍后重试');
      } finally {
        this.authLoading = false;
      }
    },

    // 获取认证状态文本
    getAuthStatusText (status, userType) {
      if (!status) return '未认证';
      if (status === '已认证' || status === 'PASSED') {
        if (userType === 'ENTERPRISE') return '企业已认证';
        if (userType === 'PERSONAL') return '个人已认证';
        return '已认证';
      }
      if (status === '认证审核中' || status === 'AUDITING') {
        if (userType === 'ENTERPRISE') return '企业认证审核中';
        if (userType === 'PERSONAL') return '个人认证审核中';
        return '认证审核中';
      }
      if (status === '认证失败' || status === 'FAILED') return '认证失败';
      return '未认证';
    },

    async loadApiKeys () {
      this.loading = true;
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/listPayAsYouGoUserApiKey',
          method: 'post',
          data: {}
        });
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          // 转换后端数据为前端驼峰命名
          this.apiKeys = (resp.data.data || []).map(item => ({
            id: item.id,
            keyName: item.key_name,
            userId: item.user_id,
            apiKey: item.api_key,
            description: item.description,
            permissions: item.permissions,
            isEnabled: item.is_enabled,
            createTime: item.create_time ? item.create_time.split(' ')[0] : '',
            balance: item.balance
          }));
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '加载API密钥失败');
        }
      } catch (e) {
        this.$Message.error('加载API密钥失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    handleSecurityAction (item) {
      console.log('handleSecurityAction', item)
      if (item.title === '支付密码') {
        this.payPwdIsEdit = item.status === 'bound'
        this.$nextTick(() => {
          if (this.$refs.payPwdFormRef) {
            this.$refs.payPwdFormRef.resetFields()
          }
        })
        this.showPayPwdModal = true
      } else if (item.title === '登录密码') {
        this.$nextTick(() => {
          if (this.$refs.loginPwdFormRef) {
            this.$refs.loginPwdFormRef.resetFields()
          }
        })
        // this.loginPwdLoading = true
        this.showLoginPwdModal = true
      } else if (item.title === '个人/企业认证') {
        // 认证状态判断
        if (this.authInfo) {
          // 企业已认证：提示认证已完成
          if (this.authInfo.authStatus === 'PASSED' && this.authInfo.userType === 'ENTERPRISE') {
            this.$Message.info('企业认证已完成')
            return
          }
          // 企业认证审核中：提示认证审核中
          if (this.authInfo.authStatus === 'AUDITING' && this.authInfo.userType === 'ENTERPRISE') {
            this.$Message.info('认证审核中，请耐心等待')
            return
          }
          // 个人已认证：跳转到认证申请页面（升级为企业）
          if (this.authInfo.authStatus === 'PASSED' && this.authInfo.userType === 'PERSONAL') {
            this.$router.push('/shenbeigpuai/control/auth-apply')
            return
          }
        }
        // 未认证或个人认证审核中或认证失败：跳转到认证申请页面
        this.$router.push('/shenbeigpuai/control/auth-apply')
      } else if (item.title === '微信绑定') {
        this.handleWechatBind()
      } else {
        this.$Message.info(`触发操作：${item.title}`)
      }
    },

    // 微信绑定 - 显示二维码供扫码
    async handleWechatBind () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/wechatAuthService/getQrCode',
          method: 'post',
          data: {}
        });
        const resp = res.data;
        if (resp.errcode === 0 && resp.qrCode) {
          // 显示二维码弹窗
          this.wxQrCode = resp.qrCode;
          this.showWxQrModal = true;
          this.wxBindStatus = '等待扫码中';
          this.wxBindSuccessCallback = null; // 清空之前的回调
          // 开始轮询绑定状态
          this.startWxPolling();
        } else if (resp.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.errmsg || '获取微信授权二维码失败');
        }
      } catch (e) {
        console.error('获取微信授权二维码失败:', e);
        this.$Message.error('获取微信授权二维码失败，请稍后重试');
      }
    },

    // 开始轮询微信绑定状态
    startWxPolling () {
      this.wxBindStatus = '等待扫码中';
      this.wxPollingCount = 0;

      this.wxPollingTimer = setInterval(async () => {
        this.wxPollingCount++;

        // 检查是否超过最大轮询次数
        if (this.wxPollingCount > this.maxWxPollingCount) {
          this.stopWxPolling();
          this.$Message.warning('二维码已过期，请重新获取');
          this.showWxQrModal = false;
          return;
        }

        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/wechatAuthService/getBindStatus',
            method: 'post',
            data: {}
          });

          if (res.errcode === 0 && res.data) {
            const isBound = res.data.bound === true || res.data.bound === 'true';
            if (isBound) {
              // 绑定成功
              this.stopWxPolling();
              this.wxBindStatus = '已绑定';
              this.showWxQrModal = false;
              this.$Message.success('微信绑定成功！');
              // 刷新认证信息和微信状态
              this.loadAuthInfo();
              // 调用成功回调（如果有）
              if (this.wxBindSuccessCallback) {
                this.wxBindSuccessCallback();
                this.wxBindSuccessCallback = null;
              }
            }
          } else if (res.errcode === 1001) {
            // 跳转到登录页
            sessionStorage.clear()
            this.$router.push('/login')
          }
        } catch (error) {
          console.error('查询微信绑定状态失败:', error);
          // 不中断轮询，继续下一次查询
        }
      }, this.wxPollingInterval);
    },

    // 停止轮询微信绑定状态
    stopWxPolling () {
      if (this.wxPollingTimer) {
        clearInterval(this.wxPollingTimer);
        this.wxPollingTimer = null;
      }
    },

    // 关闭微信绑定弹窗
    handleWxQrCancel () {
      this.stopWxPolling();
      this.showWxQrModal = false;
      this.wxQrCode = '';
      this.wxBindStatus = '';
    },

    // 处理微信授权回调
    async handleWechatCallback (code) {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/wechatAuthService/callback',
          method: 'post',
          data: { code }
        })

        if (res.errcode === 0) {
          this.$Message.success('微信绑定成功')
          // 刷新认证信息
          this.loadAuthInfo()
        } else {
          this.$Message.error(res.errmsg || '微信绑定失败')
        }
      } catch (e) {
        console.error('微信绑定失败:', e)
        this.$Message.error('微信绑定失败，请稍后重试')
      }
    },

    handleCreateApiKey () {
      this.$refs.createFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }

        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/createPayAsYouGoUserApiKey',
            method: 'post',
            data: {
              keyName: this.createForm.keyName,
              apiKey: this.generateRandomString(10)
            }
          });

          const resp = { data: res };
          if (resp.data.errcode === 0) {
            this.$Message.success('API密钥创建成功');
            this.showCreateModal = false;
            this.createForm.keyName = '';
            this.loadApiKeys();
          } else {
            this.$Message.error(resp.data.errmsg || '创建API密钥失败');
          }
        } catch (e) {
          this.$Message.error('创建API密钥失败，请稍后重试');
        }
      });
    },

    generateRandomString (length) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },

    handleEditApiKey (apiKey) {
      this.editForm.id = apiKey.id;
      this.editForm.keyName = apiKey.keyName;
      this.showEditModal = true;
    },

    async handleUpdateApiKey () {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }

        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/updatePayAsYouGoUserApiKey',
            method: 'post',
            data: {
              id: this.editForm.id,
              keyName: this.editForm.keyName
            }
          });

          const resp = { data: res };
          console.log(resp, '0000000')
          if (resp.data.errcode === 0) {
            this.$Message.success('API密钥更新成功');
            this.showEditModal = false;
            this.editForm.keyName = '';
            this.loadApiKeys();
          } else {
            this.$Message.error(resp.data.errmsg || '更新API密钥失败');
          }
        } catch (e) {
          this.$Message.error('更新API密钥失败，请稍后重试');
        }
      });
    },

    handleDeleteApiKey (apiKey) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `确定要删除密钥"${apiKey.keyName}"吗？`,
        onOk: async () => {
          try {
            const res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/deletePayAsYouGoUserApiKey',
              method: 'post',
              data: {
                id: apiKey.id
              }
            });

            const resp = { data: res };
            if (resp.data.errcode === 0) {
              this.$Message.success('API密钥删除成功');
              this.loadApiKeys();
            } else {
              this.$Message.error(resp.data.errmsg || '删除API密钥失败');
            }
          } catch (e) {
            this.$Message.error('删除API密钥失败，请稍后重试');
          }
        }
      });
    },

    copyApiKey (apiKey) {
      if (!apiKey) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(apiKey).then(() => {
          this.$Message && this.$Message.success('API密钥已复制到剪贴板');
        }).catch(() => {
          this.$Message && this.$Message.warning('复制失败，请手动复制');
        });
      } else {
        const input = document.createElement('textarea');
        input.value = apiKey;
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand('copy');
          this.$Message && this.$Message.success('API密钥已复制到剪贴板');
        } catch (err) {
          this.$Message && this.$Message.warning('复制失败，请手动复制');
        }
        document.body.removeChild(input);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.account-management {
  padding: 16px;
  background: #f8f9fa;
  min-height: 95vh;

  &__breadcrumb {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #17233d;
    margin-bottom: 12px;
  }

  // Card 内部标题（带蓝色竖条）
  .card-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #17233d;
    line-height: 1;

    &__bar {
      display: inline-block;
      width: 5px;
      height: 14px;
      background: #2d8cf0;
      border-radius: 2px;
      margin-right: 8px;
    }
  }

  .action-link {
    font-size: 12px;
    color: #2d8cf0;
    cursor: pointer;

    &:hover {
      color: #57a3f3;
    }
  }

  // 左侧卡片样式
  .info-card {
    border-radius: 4px;

    // 去掉 Card 标题下方的横线
    ::v-deep .ivu-card-head {
      border-bottom: none;
      padding: 14px 16px 0;
    }

    .user-profile {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 4px 0 14px 40px;

      .avatar-wrapper {
        position: relative;
        margin-right: 32px;
        flex-shrink: 0;

        .avatar-upload {

          ::v-deep .ivu-upload,
          ::v-deep .demo-upload-list {
            border-radius: 50% !important;
            overflow: hidden;
          }

          ::v-deep .demo-upload-list img {
            border-radius: 50% !important;
            object-fit: cover;
          }
        }

        .auth-tag {
          width: auto;
          min-width: 48px;
          text-align: center;
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 2px 8px;
          font-size: 10px;
          border-radius: 10px;
          color: #fff;
          white-space: nowrap;

          &.uncertified {
            background: #808695;
          }

          &.certified-personal {
            background: #19be6b;
          }

          &.certified-enterprise {
            background: #2db7f5;
          }

          &.auditing {
            background: #ff9900;
          }

          &.auditing-personal {
            background: #ff9900;
          }

          &.auditing-enterprise {
            background: #ff9900;
          }

          &.failed {
            background: #ed4014;
          }
        }
      }

      .user-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-top: 0;

        .detail-item {
          display: grid;
          grid-template-columns: 70px 1fr;
          column-gap: 8px;
          align-items: center;
          font-size: 12px;

          .label {
            color: #808695;
            white-space: nowrap;
          }

          .value {
            color: #515a6e;
            font-weight: 800;
            font-size: 14px;
          }

          .balance {
            color: #ed4014;
            font-size: 16px;
            font-weight: 600;
          }

          .balance-wrapper {
            display: flex;
            // flex-direction: column;
            // align-items: flex-start;
            align-items: center;

            .frozen-hint {
              color: #808695;
              font-size: 10px;
              font-weight: 400;
              margin-top: 2px;
            }
          }

          .id-group {
            .truncate {
              max-width: 320px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }

    .registration-time {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding-bottom: 4px;

      .label {
        color: #808695;
      }

      .value {
        color: #515a6e;
      }
    }
  }

  // 账号安全外层 Card（与 API 密钥外层共用 section-card）
  .section-card {
    border-radius: 4px;
    height: 100%;

    // 去掉 Card 标题下方的横线
    ::v-deep .ivu-card-head {
      border-bottom: none;
      padding: 14px 16px 0;
    }
  }

  // 账号安全列表
  .security-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  // 账号安全子卡片
  .security-item {
    background: #f8f9fb;
    border-radius: 4px;
    padding: 12px 16px;
    position: relative;

    &__main {
      display: flex;
      align-items: flex-start;

      .security-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e8f3ff;
        color: #2d8cf0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .security-content {
        flex: 1;
        min-width: 0;

        .title {
          font-size: 14px;
          color: #17233d;
          margin-bottom: 4px;
          font-weight: 600;
          line-height: 22px;
        }

        .desc {
          font-size: 12px;
          color: #808695;
          line-height: 1.5;
        }
      }
    }

    &__footer {
      margin-top: 8px;
      text-align: right;
      font-size: 12px;

      .status-success {
        color: #19be6b;
        font-weight: 500;
      }

      .divider {
        color: #dcdee2;
        margin: 0 8px;
      }
    }
  }

  // API密钥列表
  .api-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 70vh;
    overflow: scroll;
  }

  // API密钥卡片
  .api-card {
    border-radius: 4px;
    background: #f0f5ff;
    border: 1px solid #e1eaff;

    &__header {
      display: flex;
      align-items: center;
      padding: 12px 16px 6px;

      .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
        flex-shrink: 0;

        &.enabled {
          background: #19be6b;
        }

        &.disabled {
          background: #ed4014;
        }
      }

      .api-title {
        font-size: 14px;
        color: #17233d;
        font-weight: 600;
        margin-bottom: 0;
      }
    }

    .api-info-row {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      padding: 0 16px 8px;
      gap: 8px;
    }

    .api-key {
      flex: 0.8;
      min-width: 0;
      font-size: 12px;
      color: #515a6e;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 0;
    }

    .copy-btn {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      color: #2d8cf0;
      cursor: pointer;
      transition: color 0.2s;
      text-decoration: none;

      i {
        margin-right: 4px;
        font-size: 14px;
      }

      &:hover {
        color: #57a3f3;
      }
    }

    .api-time {
      flex: 0 0 auto;
      margin-left: 10px;
      font-size: 12px;
      color: #808695;
      margin-bottom: 0;
      white-space: nowrap;
    }

    .api-actions {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      margin-left: auto;
      font-size: 12px;

      .action-link {
        color: #2d8cf0;
        cursor: pointer;

        &:hover {
          color: #57a3f3;
        }

        &.danger {
          color: #ed4014;

          &:hover {
            color: #f86e51;
          }
        }
      }

      .divider {
        color: #dcdee2;
        margin: 0 10px;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #808695;
    font-size: 14px;
  }
}

// 微信绑定二维码弹窗
.wx-qr-modal-content {
  text-align: center;
  padding: 20px 0;

  .wx-qr-tip {
    font-size: 14px;
    color: #515a6e;
    margin-bottom: 20px;
  }

  .wx-qr-code-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    margin: 20px 0;

    .wx-qr-code {
      width: 280px;
      height: 280px;
      border: 1px solid #eee;
      padding: 10px;
      border-radius: 4px;
      background: #fff;
    }
  }

  .wx-qr-status {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #808695;

    i {
      margin-right: 5px;
      animation: spin 1s linear infinite;
    }

    &.success {
      color: #19be6b;

      i {
        animation: none;
      }
    }
  }
}
</style>
