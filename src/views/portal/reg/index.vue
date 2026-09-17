<template>
  <div class="portal-register">
    <div class="portal-header">
      <div class="portal-header__inner">
        <div class="portal-header__brand" @click="goHome">
          <sp-image class="portal-header__brand-icon" scp-type="图片" style=""
            src="@/assets/file/shenbeigpuai/image/logox.png"></sp-image>
          <div class="portal-header__title">某基云池<br>算力租赁云平台</div>
        </div>

        <div class="portal-header__tabs">
          <div v-for="item in navTabs" :key="item.key" class="portal-header__tab"
            :class="{ 'is-active': activeTab === item.key }" @click="handleNav(item.key)">
            {{ item.label }}
          </div>
        </div>

        <div class="portal-header__actions">
          <span class="portal-header__text">已有账号？</span>
          <a class="portal-header__link" href="javascript:void(0)" @click="goLogin">立即登录</a>
        </div>
      </div>
    </div>

    <div class="register-container">
      <div class="register-box">
        <div class="register-box__header">
          <h2 class="register-box__title">用户注册</h2>
          <p class="register-box__subtitle">创建您的账号，开始使用某基云池算力租赁云平台</p>
        </div>

        <Form ref="registerForm" :model="formData" :rules="formRules" class="register-form">

          <FormItem prop="mobile">
            <Input v-model="formData.mobile" placeholder="请输入手机号" @on-keyup="handleNoChinese" size="large" prefix="ios-phone-portrait"
              autocomplete="off" />
          </FormItem>

          <FormItem v-show="false" prop="loginName">
            <Input v-model="formData.loginName" placeholder="请输入登录用户名" @on-keyup="handleNoChinese1" size="large" prefix="ios-person-outline" />
          </FormItem>

          <FormItem prop="password">
            <Input v-model="formData.password" type="password" placeholder="请输入密码（8-16位，含大小写字母和数字）" @on-keyup="handleNoChinese2" size="large"
              prefix="ios-lock-outline" password autocomplete="new-password" />
          </FormItem>

          <FormItem prop="confirmPassword">
            <Input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码确认" @on-keyup="handleNoChinese3" size="large"
              prefix="ios-lock-outline" password autocomplete="new-password" />
          </FormItem>

          <FormItem prop="smsCode">
            <div class="sms-code-wrapper">
              <Input v-model="formData.smsCode" placeholder="请输入验证码" @on-keyup="handleNoChinese4" size="large" style="flex: 1;"
                autocomplete="one-time-code" />
              <Button size="large" :disabled="smsCountdown > 0" @click="sendSmsCode" class="sms-btn">
                {{ smsCountdown > 0 ? `${smsCountdown}秒后重发` : '获取验证码' }}
              </Button>
            </div>
          </FormItem>

          <FormItem prop="agreement">
            <Checkbox v-model="formData.agreement">
              <span class="agreement-text">我已阅读并同意</span>
              <a href="javascript:void(0)" @click.stop="showAgreement">《用户注册协议》</a>
            </Checkbox>
          </FormItem>

          <FormItem>
            <Button type="primary" size="large" long :loading="submitting" @click="handleRegister" class="register-btn">
              {{ submitting ? '注册中...' : '立即注册' }}
            </Button>
          </FormItem>
        </Form>

        <div class="register-box__footer">
          <!-- <p>注册即表示您同意我们的 <a href="javascript:void(0)">服务条款</a> 和 <a href="javascript:void(0)">隐私政策</a></p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-portal-register',
  data () {
    // 自定义校验：密码强度（8-16 位，含大小写字母 + 数字）
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 8) {
        callback(new Error('密码长度必须大于8位'))
      } else if (value.length > 16) {
        callback(new Error('密码长度不能超过16位'))
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        callback(new Error('密码必须包含大写字母、小写字母和数字'))
      } else {
        callback()
      }
    }

    // 自定义校验：确认密码
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.formData.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    // 自定义校验：手机号格式
    const validateMobile = (rule, value, callback) => {
      if (!value || value === '') {
        callback() // 选填，为空时不校验
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }

    // 自定义校验：协议同意
    const validateAgreement = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请阅读并同意用户注册协议'))
      } else {
        callback()
      }
    }

    return {
      submitting: false,
      smsCountdown: 0,
      navTabs: [
        { key: 'home', label: '首页' },
        { key: 'api', label: '模型广场' },
        { key: 'help', label: '帮助中心' },
        { key: 'about', label: '关于我们' }
      ],
      activeTab: '',
      formData: {
        loginName: '',
        mobile: '',
        smsCode: '',
        password: '',
        confirmPassword: '',
        agreement: false
      },
      formRules: {
        // loginName: [
        //   { required: true, message: '请输入登录用户名', trigger: 'blur' },
        //   { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
        // ],
        mobile: [
          { validator: validateMobile, trigger: 'blur' }
        ],
        smsCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        agreement: [
          { validator: validateAgreement, trigger: 'change' }
        ]
      },

      // 用户协议正文 HTML（含《用户注册协议》《服务条款》《隐私政策》三部分）
      // 注：iView Modal 会把 content 通过 transfer 渲染到 body 节点，
      // scoped 样式无法命中，所以排版样式全部内联到 style 属性里
      agreementContentHtml: '<div style="max-height: 60vh; overflow-y: auto; padding: 4px 8px; color: #303133; line-height: 1.7; font-size: 13px;">' +
        '<h3 style="font-size: 15px; font-weight: 600; margin: 14px 0 8px; color: #1f2937; padding-left: 8px; border-left: 3px solid #4079ff;">用户注册协议</h3>' +
        '<p style="margin: 6px 0; text-indent: 2em;">用户在注册、登录、使用本算力服务平台（含算力服务器、Token套餐、裸金属服务器）前，请认真阅读本协议。任何注册及使用行为，即视为您已阅读、理解并自愿接受本协议全部条款，同意受其法律约束。若不同意任一条款，请立即停止使用平台全部服务。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">1. 协议主体与适用范围</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">本协议为用户与【某基云池算力租赁云平台】就平台账号注册、登录及算力相关服务使用订立的有效合约，适用于所有注册、使用本平台算力服务的自然人、法人及其他组织用户。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">2. 账号注册资质</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">用户需具备完全民事行为能力，企业用户需具备合法经营资质。注册时须提交真实、准确、完整的主体及身份信息，不得虚假填报、冒用他人信息、批量恶意注册账号。信息变更后需及时更新。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">3. 账号使用权责</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">平台账号使用权归注册用户，所有权归平台所有。用户需妥善保管账号、密码、密钥及登录设备，对账号下全部操作（算力购买、套餐开通/续费/升级、服务使用等）承担全部责任。严禁转借、出租、出售、共享账号，严禁利用账号从事违法违规、恶意薅量、攻击平台等行为。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">4. 账号管理与处置</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">平台有权核验用户注册信息及使用行为，对信息不实、违规使用、恶意操作、长期闲置的账号，有权采取警告、限流、冻结、注销、终止服务等处置措施，且无需承担赔偿责任。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">5. 协议生效与变更</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">本协议自用户注册使用平台服务之日起生效。平台可根据业务及法规要求更新协议，更新后通过平台公告公示即生效，用户继续使用服务视为认可最新条款。</p>' +

        '<h3 style="font-size: 15px; font-weight: 600; margin: 18px 0 8px; color: #1f2937; padding-left: 8px; border-left: 3px solid #4079ff;">服务条款</h3>' +
        '<p style="margin: 6px 0; text-indent: 2em;">本条款规范本平台算力服务器、Token套餐、裸金属服务器等全部算力相关服务的购买、开通、使用及售后事宜，为平台与用户的服务履约依据。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">1. 服务内容</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">平台为合规用户提供算力资源租赁、Token算力套餐售卖、裸金属服务器、算力运维配套等技术服务，用户可根据自身需求自主选购对应服务产品。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">2. 服务订购与履约</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">用户确认选购服务、完成付费后，平台将按照订单约定规格、时限开通对应算力服务。用户需确保服务用途合法合规，不得将平台算力资源用于黑客攻击、爬虫抓取、违规算力挖矿、违法数据处理等违规违法场景。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">3. 用户服务义务</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">用户需遵守国家网络安全、数据安全相关法律法规，合理合规使用算力资源，不得超规格占用资源、恶意占用带宽、干扰平台正常运营及其他用户正常使用。因用户违规使用导致的故障、处罚、损失，由用户自行承担，造成平台损失的需全额赔偿。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">4. 服务变更与终止</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">平台有权基于系统升级、运维检修、合规整改需求，临时调整、暂停部分服务，并提前公示或临时告知。用户违规使用服务、欠费逾期的，平台有权单方终止服务、关停算力资源、不予退费。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">5. 免责说明</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">因网络故障、运营商问题、不可抗力、用户自身操作失误、第三方原因导致的服务中断、延迟、数据异常，平台不承担违约责任；平台仅提供算力技术服务，用户业务数据、业务成果由用户自行负责。</p>' +

        '<h3 style="font-size: 15px; font-weight: 600; margin: 18px 0 8px; color: #1f2937; padding-left: 8px; border-left: 3px solid #4079ff;">隐私政策</h3>' +
        '<p style="margin: 6px 0; text-indent: 2em;">本政策依据《中华人民共和国个人信息保护法》《网络安全法》制定，用于告知用户本平台算力服务过程中个人及企业信息的收集、使用、存储、保护规则。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">1. 信息收集范围</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">为保障账号注册、算力服务开通、订单履约、售后运维，平台仅收集必要信息：包括用户账号信息、手机号、企业主体信息、订单付费信息、服务使用日志、设备登录信息，不收集无关敏感信息。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">2. 信息使用用途</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">收集的信息仅用于账号核验、算力服务交付、订单结算、故障排查、安全风控、合规监管、用户咨询反馈处理，不会用于无关商业推广。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">3. 信息存储与保护</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">平台采用加密存储、权限管控、数据备份等安全技术措施保护用户信息安全，严格管控内部数据访问权限。用户数据仅在服务存续期间及法规要求留存期限内保存。</p>' +
        '<h4 style="font-size: 14px; font-weight: 600; margin: 12px 0 6px; color: #1f2937;">4. 信息共享与披露</h4>' +
        '<p style="margin: 4px 0; text-indent: 2em;">未经用户明确同意，平台不会向第三方出售、泄露、转让用户信息。仅在法律法规、监管部门要求或用户主动授权的情况下，可依法依规提供相关信息。</p>' +
        '</div>'
    }
  },
  methods: {
    // 返回首页
    goHome () {
      this.$router.push({ path: '/shenbeigpuai/portal/home' })
    },
    // 去登录页
    goLogin () {
      this.$router.push({ path: '/login' })
    },
    // header 导航 tab 跳转
    handleNav (key) {
      if (key === 'home') {
        this.$router.push({ path: '/shenbeigpuai/portal/home' })
      } else if (key === 'api') {
        this.$router.push({ path: '/shenbeigpuai/portal/api' })
      } else if (key === 'help') {
        this.$router.push({ path: '/shenbeigpuai/portal/help' })
      } else if (key === 'about') {
        this.$router.push({ path: '/shenbeigpuai/portal/about' })
      }
    },
    // 实时过滤中文输入
    handleNoChinese() {
      this.formData.mobile = this.formData.mobile.replace(/[\u4e00-\u9fa5]/g, '');
    },
    handleNoChinese1() {
      this.formData.loginName = this.formData.loginName.replace(/[\u4e00-\u9fa5]/g, '');
    },
    handleNoChinese2() {
      this.formData.password = this.formData.password.replace(/[\u4e00-\u9fa5]/g, '');
    },
    handleNoChinese3() {
      this.formData.confirmPassword = this.formData.confirmPassword.replace(/[\u4e00-\u9fa5]/g, '');
    },
    handleNoChinese4() {
      this.formData.smsCode = this.formData.smsCode.replace(/[\u4e00-\u9fa5]/g, '');
    },
    // 发送验证码（调用后端 sendVerifyCode 接口）
    async sendSmsCode () {
      if (!this.formData.mobile) {
        this.$Message.warning('请先输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.formData.mobile)) {
        this.$Message.warning('请输入正确的手机号')
        return
      }
      if (!this.formData.agreement) {
        this.$Message.warning('请先阅读并同意用户注册协议')
        return
      }
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/smsVerifyCodeService/sendVerifyCode',
          method: 'post',
          data: {
            functionCode: 'user_reg',
            phone: this.formData.mobile
          }
        })
        if (res.errcode === 0) {
          this.$Message.success('验证码已发送')
          this.smsCountdown = 60
          const timer = setInterval(() => {
            this.smsCountdown--
            if (this.smsCountdown <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        } else {
          this.$Message.error(res.errmsg || '验证码发送失败，请稍后再试')
        }
      } catch (e) {
        this.$Message.error(e.message || '网络异常，请稍后再试')
      }
    },
    // 显示注册协议（含：用户注册协议 / 服务条款 / 隐私政策 三部分）
    showAgreement () {
      this.$Modal.info({
        title: '用户注册协议、服务条款、隐私政策',
        content: this.agreementContentHtml,
        width: 720,
        // 让弹框 body 内容可滚动，避免内容过长撑爆视口
        styles: { top: '60px' }
      })
    },
    // 处理注册
    handleRegister () {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          this.doRegister()
        } else {
          this.$Message.error('请完善注册信息')
        }
      })
    },
    // 执行注册请求
    async doRegister () {
      this.submitting = true
      try {
        const res = await this.$hdAxios.request({
          // 原接口名: registerService/register (保留用于排查)
          url: '/api/ac/shenbeigpuai/registerService/addUserRegister',
          method: 'post',
          data: {
            // loginName: this.formData.loginName,
            loginName: this.formData.mobile,
            password: this.$aesEncrypt(this.formData.password),
            confirmPassword: this.$aesEncrypt(this.formData.confirmPassword),
            mobile: this.formData.mobile || undefined,
            smsCode: this.formData.smsCode || undefined
          }
        })

        const resp = { data: res }
        if (resp.data.errcode === 0) {
          this.$Message.success('注册成功！正在跳转到登录页...')
          setTimeout(() => {
            this.goLogin()
          }, 1500)
        } else {
          this.$Message.error(resp.data.errmsg || '注册失败，请重试')
        }
      } catch (e) {
        this.$Message.error(e.message || '注册失败，请检查网络连接')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped lang="less">
.portal-register {
  min-height: 100vh;
  background: url('~@/assets/file/shenbeigpuai/image/register-bg.png') no-repeat center / cover;
  display: flex;
  flex-direction: column;
}

.portal-header {
  width: 100%;
  height: 70px;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.portal-header__inner {
  height: 70px;
  width: 96%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.portal-header__brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.portal-header__brand-icon {
  width: 46px;
  height: 32px;
  background: transparent;
  margin-right: 10px;
  flex-shrink: 0;
}

.portal-header__title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  line-height: 18px;
  white-space: normal;
}

.portal-header__tabs {
  display: flex;
  align-items: center;
  gap: 34px;
  margin-left: 60px;
}

.portal-header__tab {
  font-size: 14px;
  color: #1d2129;
  line-height: 20px;
  cursor: pointer;
  position: relative;
  padding: 6px 0;
}

.portal-header__tab.is-active {
  color: #165dff;
}

.portal-header__tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10px;
  height: 2px;
  background: #165dff;
}

.portal-header__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  flex-shrink: 0;
}

.portal-header__text {
  font-size: 14px;
  color: #4e5969;
}

.portal-header__link {
  font-size: 14px;
  color: #165dff;
  font-weight: 500;
}

.register-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-box {
  width: 420px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.register-box__header {
  text-align: center;
  margin-bottom: 32px;
}

.register-box__title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.register-box__subtitle {
  font-size: 14px;
  color: #86909c;
}

.register-form {
  .agreement-text {
    font-size: 13px;
    color: #4e5969;
  }

  a {
    font-size: 13px;
    color: #165dff;
  }

  .sms-code-wrapper {
    display: flex;
    gap: 8px;

    .sms-btn {
      font-size: 14px;
      width: 120px;
      flex-shrink: 0;
    }
  }
}

.register-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #165dff 0%, #00b8d9 100%);
  border: none;

  &:hover {
    background: linear-gradient(135deg, #1456e6 0%, #00a5c2 100%);
  }
}

.register-box__footer {
  margin-top: 24px;
  text-align: center;

  p {
    font-size: 12px;
    color: #86909c;

    a {
      color: #165dff;
    }
  }
}

.register-footer {
  padding: 20px;
  text-align: center;

  p {
    font-size: 12px;
    color: #86909c;
  }
}
</style>
