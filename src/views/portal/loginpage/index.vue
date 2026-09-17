<template>
  <div class="sms-login">
    <div class="sms-login__panel">
      <div class="sms-login__brand">
        <sp-image class="sms-login__logo" scp-type="图片" :src="brandInfo.logoUrl"></sp-image>
        <div class="sms-login__brand-text">
          <div class="sms-login__title">{{ brandInfo.title }}</div>
          <div class="sms-login__subtitle">
            {{ brandInfo.subtitle }}
            <!-- <span class="sms-login__version">v1.0</span> -->
          </div>
          <div class="sms-login__pinyin">{{ brandInfo.loginNameEn }}</div>
        </div>
      </div>

      <!-- 右上角：内嵌于登录框的三角切换按钮，融入面板 -->
      <div
        class="sms-login__mode-toggle"
        :class="{ 'is-password-mode': loginMode === 'password' }"
        @click="toggleLoginMode"
        :title="loginMode === 'password' ? '切换为验证码登录' : '切换为密码登录'"
      >
        <Icon :type="loginMode === 'password' ? 'ios-phone-portrait' : 'ios-lock-outline'" size="22" />
      </div>

      <Form ref="loginForm" :model="formData" :rules="formRules" class="sms-login__form" @keydown.enter.native="handleLogin">
        <FormItem prop="phone">
          <Input
            v-model="formData.phone"
            placeholder="请输入手机号"
            @on-keyup="handleNoChinese"
            size="large"
            :maxlength="11"
            class="sms-login__input"
            autocomplete="one-time-code"
          />
        </FormItem>

        <!-- 密码登录模式 -->
        <template v-if="loginMode === 'password'">
          <FormItem prop="password">
            <Input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              @on-keyup="handleNoChinese1"
              size="large"
              class="sms-login__input"
              password
              autocomplete="current-password"
            />
          </FormItem>
        </template>

        <!-- 短信验证码登录模式 -->
        <template v-else>
          <FormItem prop="smsCode">
            <div class="sms-login__code-row">
              <Input
                v-model="formData.smsCode"
                placeholder="请输入短信验证码"
                @on-keyup="handleNoChinese2"
                size="large"
                :maxlength="6"
                class="sms-login__code-input"
                autocomplete="one-time-code"
              />
              <Button
                size="large"
                :disabled="smsCountdown > 0 || sendingSms"
                :loading="sendingSms"
                @click="sendSmsCode"
                class="sms-login__code-btn"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s后重发` : '获取验证码' }}
              </Button>
            </div>
          </FormItem>
        </template>

        <FormItem>
          <Button
            type="primary"
            size="large"
            long
            :loading="submitting"
            @click="handleLogin"
            class="sms-login__submit"
          >
            {{ submitting ? '登录中...' : '登录' }}
          </Button>
        </FormItem>

        <div class="sms-login__footer">
          <a href="javascript:void(0)" @click="goRegister">还没有账号？立即注册</a>
          <span class="sms-login__footer-divider" v-if="loginMode === 'password'">|</span>
          <a v-if="loginMode === 'password'" href="javascript:void(0)" class="sms-login__forgot" @click="goResetPwd">忘记密码</a>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-portal-loginpage',
  data() {
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入短信验证码'))
      } else {
        callback()
      }
    }
    // 自定义校验：密码（密码登录模式下必填，长度 > 0 即可，具体强度在服务端校验）
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    return {
      submitting: false,
      sendingSms: false,
      smsCountdown: 0,
      smsTimer: null,
      // 登录方式：'password' = 账号密码，'smsCode' = 短信验证码
      // loginMode: 'password',
      loginMode: 'smsCode',
      // 品牌信息（logo / 标题 / 副标题）
      // 默认值：取自当前页面静态资源，created 钩子会从接口覆盖
      brandInfo: {
        logoUrl: '@/assets/file/shenbeigpuai/image/logox.png',
        title: '某基云池',
        subtitle: '算力租赁云平台',
        loginNameEn: 'XINJIYUNCHISUANLIZULINYUNPINGTAI'
      },
      formData: {
        phone: '16602410013',
        smsCode: '1',
        password: '1'
      },
      formRules: {
        phone: [{ validator: validatePhone, trigger: 'blur' }],
        smsCode: [{ validator: validateCode, trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }]
      }
    }
  },
  async created() {
    // 优先调用 portalFooterService.getActiveFooter（system_type=sales）覆盖登录页 logo/大小标题/英文名
    // 旧 portalBrandService.getBrandInfo 兜底保留，避免接口异常时品牌信息全空
    await this.fetchActiveFooter()
    // try {
    //   const res = await this.$hdAxios.request({
    //     url: '/api/ac/shenbeigpuai/portalBrandService/getBrandInfo',
    //     method: 'post'
    //   })
    //   const data = res && res.data && res.data.data
    //   if (data) {
    //     if (data.logoUrl) this.brandInfo.logoUrl = data.logoUrl
    //     if (data.title) this.brandInfo.title = data.title
    //     if (data.subtitle) this.brandInfo.subtitle = data.subtitle
    //   }
    // } catch (e) {
    //   console.warn('加载品牌信息失败，使用默认值:', e)
    // }
  },
  beforeDestroy() {
    if (this.smsTimer) {
      clearInterval(this.smsTimer)
      this.smsTimer = null
    }
  },
  methods: {
    // 从 portalFooterService 拉取登录页 logo / 大小标题 / 英文名
    async fetchActiveFooter() {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalFooterService/getActiveFooter',
          method: 'post',
          data: {}
        })
        const data = res && res.data
        if (data) {
          if (data.loginLogo) this.brandInfo.logoUrl = data.loginLogo
          if (data.loginTitle) this.brandInfo.title = data.loginTitle
          if (data.loginSubtitle) this.brandInfo.subtitle = data.loginSubtitle
          if (data.loginNameEn) this.brandInfo.loginNameEn = data.loginNameEn
        }
      } catch (e) {
        console.warn('加载 Footer 品牌信息失败，使用默认值:', e)
      }
    },
    async sendSmsCode() {
      if (this.smsCountdown > 0 || this.sendingSms) return
      if (!this.formData.phone) {
        this.$Message.warning('请先输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        this.$Message.warning('请输入正确的手机号')
        return
      }
      this.sendingSms = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/smsVerifyCodeService/sendVerifyCode',
          method: 'post',
          data: {
            functionCode: 'user_login',
            phone: this.formData.phone
          }
        })
        if (res.errcode === 0) {
          this.$Message.success('验证码已发送')
          this.smsCountdown = 60
          this.smsTimer = setInterval(() => {
            this.smsCountdown--
            if (this.smsCountdown <= 0) {
              clearInterval(this.smsTimer)
              this.smsTimer = null
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
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          if (this.loginMode === 'password') {
            this.doPasswordLogin()
          } else {
            this.doLogin()
          }
        } else {
          this.$Message.error('请完善登录信息')
        }
      })
    },
    // 切换登录方式：密码 <-> 短信验证码
    // 切换时清掉当前 formData 的非共享字段（短信验证码/密码互斥，避免交叉污染）
    toggleLoginMode() {
      if (this.loginMode === 'password') {
        // 切到验证码登录：清密码
        this.formData.password = ''
        this.loginMode = 'smsCode'
      } else {
        // 切到密码登录：清短信验证码（不清短信倒计时，避免蓝屏时被中断）
        this.formData.smsCode = ''
        this.loginMode = 'password'
      }
    },
    // 账号密码登录
    async doPasswordLogin() {
      this.submitting = true
      try {
        const res = await this.$hdAxios.request({
          // url: '/api/uc/sc/passwordLoginService/userLogin_password',
          url: '/api/uc/sc/loginService/userLogin_encrypt',
          // /api/uc/sc/loginService/userLogin_encrypt
          method: 'post',
          data: {
            username: this.formData.phone,
            password: this.$aesEncrypt(this.formData.password)
            // loginMobile: this.formData.phone,
            // password: this.$aesEncrypt(this.formData.password)
          }
        })
        const success = res && res.data && res.data.errcode === 0
        if (success) {
          await this.fetchAndStoreUserInfo()
          this.$Message.success(res.data.errmsg || res.errmsg || '登录成功')
          if (res.data && res.data.redirect) {
            window.location.href = res.data.redirect
            return
          }
          const queryRedirect = this.$route && this.$route.query && this.$route.query.redirect
          if (queryRedirect) {
            this.$router.replace(typeof queryRedirect === 'string' ? queryRedirect : '/shenbeigpuai/portal/home')
            return
          }
          let storedRedirect = ''
          try { storedRedirect = localStorage.getItem('portal_redirect') || '' } catch (e) {}
          if (storedRedirect) {
            try { localStorage.removeItem('portal_redirect') } catch (e) {}
            this.$router.replace(storedRedirect)
          } else {
            this.$router.replace('/shenbeigpuai/portal/home')
          }
        } else {
          const msg = (res && res.data && res.data.errmsg) || (res && res.errmsg) || '登录失败，请检查账号或密码'
          this.$Message.error(msg)
        }
      } catch (e) {
        this.$Message.error(e.message || '登录失败，请检查网络连接')
      } finally {
        this.submitting = false
      }
    },
    async doLogin() {
      this.submitting = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/uc/sc/smsLoginService/userLogin_sms',
          method: 'post',
          data: {
            loginMobile: this.formData.phone,
            SMScode: this.formData.smsCode
          }
        })
        // 接口实际成功判断：嵌套 data.errcode === 0（外层 errcode 可能非 0）
        const success = res && res.data && res.data.errcode === 0
        if (success) {
          // 沿用 sp-login-button 流程：登录成功后立即拉取完整用户信息
          await this.fetchAndStoreUserInfo()
          this.$Message.success(res.data.errmsg || res.errmsg || '登录成功')
          // 优先使用后端返回的跳转地址
          if (res.data && res.data.redirect) {
            window.location.href = res.data.redirect
            return
          }
          // 其次从 query.redirect 读取（直接访问 /login?redirect=xxx）
          const queryRedirect = this.$route && this.$route.query && this.$route.query.redirect
          if (queryRedirect) {
            this.$router.replace(typeof queryRedirect === 'string' ? queryRedirect : '/shenbeigpuai/portal/home')
            return
          }
          // 最后从 localStorage 中读取 portal 页面记录的来源路径
          let storedRedirect = ''
          try { storedRedirect = localStorage.getItem('portal_redirect') || '' } catch (e) {}
          if (storedRedirect) {
            try { localStorage.removeItem('portal_redirect') } catch (e) {}
            this.$router.replace(storedRedirect)
          } else {
            this.$router.replace('/shenbeigpuai/portal/home')
          }
        } else {
          const msg = (res && res.data && res.data.errmsg) || (res && res.errmsg) || '登录失败，请检查验证码'
          this.$Message.error(msg)
        }
      } catch (e) {
        this.$Message.error(e.message || '登录失败，请检查网络连接')
      } finally {
        this.submitting = false
      }
    },
    // 拉取并存储完整用户信息（参考 sp-login-button.vue 的 getUserInfo 逻辑）
    async fetchAndStoreUserInfo() {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/sc/systemUserService/info',
          method: 'post'
        })
        if (!res || res.errcode !== 0) {
          // 拉取失败时不阻塞登录跳转，只是不写入 vuex
          return
        }
        // 沿用 sp-login-button 的 vuex 结构：severUserInfo 直接是 res 整体
        // portal 页面通过 userData.user.severUserInfo.data.loginName 读取用户字段
        const vuex = {
          user: {
            severUserInfo: res
          }
        }
        // 填充 window.userInfo.data（兼容 header 等组件直接读 window.userInfo 的场景）
        if (typeof window !== 'undefined') {
          if (!window.userInfo) {
            window.userInfo = {
              data: {
                id: '', name: '', phone: '', loginName: '',
                company_name: '', company_code: '', company_id: '',
                company_grade: '', parent_id: '', parent_ids: ''
              }
            }
          }
          const data = (res && res.data) || {}
          for (const k in window.userInfo.data) {
            if (data[k] !== undefined && data[k] !== null) {
              window.userInfo.data[k] = data[k]
            }
          }
        }
        try { sessionStorage.setItem('vuex', JSON.stringify(vuex)) } catch (e) {}
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }
    },
    goRegister() {
      this.$router.push({ path: '/shenbeigpuai/portal/reg' })
    },
    // 跳到重置密码页（复用 portal/pwd/index.vue，后续会把该页改成真正的改密逻辑）
    goResetPwd() {
      this.$router.push({ path: '/shenbeigpuai/portal/pwd' })
    },
    // 实时过滤中文输入
    handleNoChinese() {
      this.formData.phone = this.formData.phone.replace(/[\u4e00-\u9fa5]/g, '');
    },
    handleNoChinese1() {
      this.formData.password = this.formData.password.replace(/[\u4e00-\u9fa5]/g, '');
    },
    handleNoChinese2() {
      this.formData.smsCode = this.formData.smsCode.replace(/[\u4e00-\u9fa5]/g, '');
    },
  }
}
</script>

<style scoped lang="less">
.sms-login {
  position: relative;
  width: 100%;
  height: 100vh;
  background-image: url('~@/assets/file/shenbeigpuai/image/background.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 8%;
  box-sizing: border-box;
}

.sms-login__panel {
  position: relative;
  width: 400px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 36px 32px;
  box-shadow: 0 8px 32px rgba(5, 47, 167, 0.12);
}

.sms-login__mode-toggle {
  position: absolute;
  border-radius: 0 8px 0 0;
  padding-top: 3px;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  display: flex;
  // align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  color: #ffffff;
  background: linear-gradient(213.29deg, #b14fda 0%, #4c54f5 100%);
  // 直角在右上角，从右上向左下展开 → 等腰直角三角形
  clip-path: polygon(100% 0, 100% 100%, 0 0);
  // 仅命中三角形区域，左下空白三角不受影响
  pointer-events: auto;
  transition: filter 0.15s ease, transform 0.15s ease;
  z-index: 2;

  i {
    // 三角形很小（44x44 但有效区域是左上角的直角一半），
    // 图标贴近水平居中略偏左下
    margin-top: 6px;
    margin-right: 6px;
    color: #ffffff;
  }

  &:hover {
    filter: brightness(1.08);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }

  // 密码 / 验证码模式统一使用同一渐变
  &.is-password-mode,
  &:not(.is-password-mode) {
    background: linear-gradient(213.29deg, #b14fda 0%, #4c54f5 100%);
  }
}

.sms-login__brand {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.sms-login__logo {
  width: 70px;
  // height: 70px;
  height: 50px;
  border-radius: 10px;
  margin-right: 14px;
  flex-shrink: 0;
}

.sms-login__brand-text {
  flex: 1;
}

.sms-login__title {
  color: #052fa7;
  font-size: 22px;
  font-weight: bold;
  line-height: 28px;
}

.sms-login__subtitle {
  color: #052fa7;
  font-size: 18px;
  font-weight: bold;
  line-height: 26px;
}

.sms-login__version {
  color: #052fa7;
  font-size: 12px;
  font-weight: bold;
  margin-left: 4px;
}

.sms-login__pinyin {
  color: #052fa7;
  font-size: 12px;
  font-weight: bold;
  line-height: 18px;
  letter-spacing: 0.5px;
}

.sms-login__form {
  .sms-login__code-row {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .sms-login__code-input {
    flex: 1;
  }

  .sms-login__code-btn {
    width: 130px;
    font-size: 14px;
    flex-shrink: 0;
    color: #052fa7;
    background: #ffffff;
    border-color: #052fa7;
  }

  .sms-login__code-btn:hover:not(:disabled) {
    color: #ffffff;
    // background: #052fa7;
  }

  .sms-login__submit {
    height: 40px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 6px;
    background: linear-gradient(251.30deg, #b250da 0%, #4b55f5 100%);
    border-color: transparent;
  }

  .sms-login__submit:hover {
    filter: brightness(1.05);
    border-color: transparent;
  }
}

.sms-login__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  margin-top: 8px;

  a {
    color: #052fa7;
    font-size: 13px;
  }

  a:hover {
    text-decoration: underline;
  }
}

.sms-login__footer-divider {
  color: #c2c8d5;
  font-size: 13px;
  user-select: none;
}
</style>