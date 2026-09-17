<template>
  <div class="portal-register">
    <div class="portal-header">
      <div class="portal-header__inner">
        <div class="portal-header__brand" @click="goHome">
          <sp-image class="portal-header__brand-icon" scp-type="图片" style=""
            :src="logox"></sp-image>
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
          <h2 class="register-box__title">重置登录密码</h2>
          <!-- <p class="register-box__subtitle">创建您的账号，开始使用某基云池算力租赁云平台</p> -->
        </div>

        <Form ref="registerForm" :model="formData" :rules="formRules" class="register-form">

          <FormItem prop="mobile">
            <Input v-model="formData.mobile" placeholder="请输入手机号" @on-keyup="handleNoChinese" size="large" prefix="ios-phone-portrait" />
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
              <Input v-model="formData.smsCode" placeholder="请输入验证码" @on-keyup="handleNoChinese4" size="large" style="flex: 1;" />
              <Button size="large" :loading="sendingSms" :disabled="smsCountdown > 0 || sendingSms" @click="sendSmsCode" class="sms-btn">
                {{ smsCountdown > 0 ? `${smsCountdown}秒后重发` : '获取验证码' }}
              </Button>
            </div>
          </FormItem>

          <FormItem>
            <Button type="primary" size="large" long :loading="submitting" @click="handleReset" class="register-btn">
              {{ submitting ? '重置密码中...' : '重置密码' }}
            </Button>
          </FormItem>
        </Form>
      </div>
    </div>
  </div>
</template>

<script>
import logox from '@/assets/file/shenbeigpuai/image/logox.png'
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

    return {
      logox,
      submitting: false,
      sendingSms: false,
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
        confirmPassword: ''
      },
      formRules: {
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
      }
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
    // 发送验证码（调用后端 sendVerifyCode 接口）
    async sendSmsCode () {
      if (this.smsCountdown > 0 || this.sendingSms) return
      if (!this.formData.mobile) {
        this.$Message.warning('请先输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.formData.mobile)) {
        this.$Message.warning('请输入正确的手机号')
        return
      }
      this.sendingSms = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/smsVerifyCodeService/sendVerifyCode',
          method: 'post',
          data: {
            functionCode: 'reset_password',
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
      } finally {
        this.sendingSms = false
      }
    },
    // 处理重置密码
    handleReset () {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          this.doReset()
        } else {
          this.$Message.error('请完善重置信息')
        }
      })
    },
    // 执行重置密码请求
    async doReset () {
      this.submitting = true
      try {
        const res = await this.$hdAxios.request({
          // 重置登录密码接口：与后端 RegisterServiceImpl.forgotPassword 配套
          // （重置后端已合并进 RegisterServiceImpl；包路径 /api/ac/shenbeigpuai/...）
          url: '/api/ac/shenbeigpuai/registerService/updateForgotPassword',
          method: 'post',
          data: {
            loginMobile: this.formData.mobile,
            smsCode: this.formData.smsCode,
            // 密码仍走前端 AES 加密传输，与注册写入字段一致
            password: this.$aesEncrypt(this.formData.password),
            confirmPassword: this.$aesEncrypt(this.formData.confirmPassword)
          }
        })

        const resp = { data: res }
        if (resp.data.errcode === 0) {
          this.$Message.success('密码已重置，正在跳转到登录页...')
          setTimeout(() => {
            this.goLogin()
          }, 1500)
        } else {
          this.$Message.error(resp.data.errmsg || '密码重置失败，请重试')
        }
      } catch (e) {
        this.$Message.error(e.message || '密码重置失败，请检查网络连接')
      } finally {
        this.submitting = false
      }
    },
    // 实时过滤中文输入
    handleNoChinese() {
      this.formData.mobile = this.formData.mobile.replace(/[\u4e00-\u9fa5]/g, '');
    },
    // 实时过滤中文输入
    handleNoChinese1() {
      this.formData.loginName = this.formData.loginName.replace(/[\u4e00-\u9fa5]/g, '');
    },
    // 实时过滤中文输入
    handleNoChinese2() {
      this.formData.password = this.formData.password.replace(/[\u4e00-\u9fa5]/g, '');
    },
    // 实时过滤中文输入
    handleNoChinese3() {
      this.formData.confirmPassword = this.formData.confirmPassword.replace(/[\u4e00-\u9fa5]/g, '');
    },
    // 实时过滤中文输入
    handleNoChinese4() {
      this.formData.smsCode = this.formData.smsCode.replace(/[\u4e00-\u9fa5]/g, '');
    },
  }
}
</script>

<style scoped lang="less">
.portal-register {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
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
      width: 120px;
      flex-shrink: 0;
      font-size: 14px;
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
