<template>
  <div class="portal-home">
    <!-- Header -->
    <div class="portal-header">
      <div class="portal-header__inner">
        <div class="portal-header__brand" @click="handleNav('home')">
          <sp-image class="portal-header__brand-icon" scp-type="图片" style=""
            :src="logoX"></sp-image>
          <div class="portal-header__title">某基云池<br>算力租赁云平台</div>
        </div>

        <div class="portal-header__tabs">
          <div v-for="item in navTabs" :key="item.key" class="portal-header__tab"
            :class="{ 'is-active': activeTab === item.key }" @click="handleNav(item.key)">
            {{ item.label }}
          </div>
        </div>

        <div class="portal-header__actions">
          <template v-if="isLoggedIn">
            <Dropdown>
              <div class="portal-header__actions-user">
                <img v-if="userPhoto" :src="userPhoto" class="portal-header__actions-avatar" alt="avatar">
                <!-- <svg v-else class="portal-header__actions-avatar" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M512 0C229.23 0 0 229.23 0 512s229.23 512 512 512 512-229.23 512-512S794.77 0 512 0z"
                    fill="#D7E3F8"></path>
                  <path
                    d="M436.315 648.078h157.594v130.116H435.792l0.523-130.116zM336.259 473.896c0 23.142-13.995 41.893-31.619 41.893s-31.618-18.751-31.618-41.893 13.994-41.882 31.618-41.882 31.618 18.751 31.618 41.882"
                    fill="#FFFFFF"></path>
                  <path
                    d="M436.315 666.738s30.071 15.553 73.091 15.553c50.802 2.082 83.979-15.03 83.979-15.03v15.553s-55.979 30.06-80.862 30.06c-25.407 0-76.231-35.271-76.231-35.271z"
                    fill="#D7E3F8"></path>
                  <path
                    d="M720.919 439.797c0 53.623-16.225 126.293-43.463 165.558-37.547 54.113-122.22 79.121-161.826 79.121-40.038 0-116.224-20.4-153.816-68.267-32.04-40.812-51.473-117.726-51.473-176.356 0-127.522 91.762-231.208 205.289-231.208s205.289 103.686 205.289 231.208"
                    fill="#FFFFFF"></path>
                </svg> -->
                <svg v-else style="border-radius:50%;margin-right:8px;height:24px;width:24px;" data-v-39b29ed8=""
                  t="1739343491281" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8201"
                  width="66" height="66" class="icon">
                  <path data-v-39b29ed8=""
                    d="M9.67111111 511.73831111c0 277.34471111 224.98417778 502.32888889 502.32888889 502.32888889s502.32888889-224.98417778 502.32888889-502.32888889S789.34471111 9.40942222 512 9.40942222 9.67111111 234.38222222 9.67111111 511.73831111z"
                    fill="#D7E3F8" p-id="8202"></path>
                  <path data-v-39b29ed8=""
                    d="M436.31502222 648.07822222h157.5936v130.11626667H435.79164445l0.52337777-130.11626667zM336.25884445 473.89582222c0 23.1424-13.99466667 41.89297778-31.61884445 41.89297778S273.06666667 497.03822222 273.06666667 473.89582222s13.99466667-41.8816 31.61884444-41.8816 31.61884445 18.75057778 31.61884444 41.8816M757.76 473.31555555c0 23.13102222-14.00604445 41.8816-31.63022222 41.8816S694.4768 496.41244445 694.4768 473.31555555s13.99466667-41.89297778 31.61884445-41.89297777S757.76 450.7648 757.76 473.31555555"
                    fill="#FFFFFF" p-id="8203"></path>
                  <path data-v-39b29ed8=""
                    d="M436.31502222 666.73777778s30.07146667 15.55342222 73.09084445 15.55342222c50.80177778 2.08213333 83.97937778-15.03004445 83.97937778-15.03004445v15.55342223s-55.97866667 30.06008889-80.86186667 30.06008889c-25.40657778 0-76.23111111-35.27111111-76.23111111-35.27111112z"
                    fill="#D7E3F8" p-id="8204"></path>
                  <path data-v-39b29ed8=""
                    d="M878.50097778 854.91484445c-25.3952-20.21831111-70.76977778-77.36888889-118.46542223-100.19271112-77.24373333-37.84248889-166.65031111-26.80604445-166.6503111-26.80604444V730.45333333c-6.22364445 6.74702222-36.80711111 36.80711111-78.27911112 36.80711112-40.96 0-72.05546667-27.98933333-78.79111111-35.27111112l-0.52337777-3.62951111s-98.62257778-11.54844445-176.35555556 26.29404445c-52.87253333 25.92995555-90.58986667 82.56853333-113.40231111 102.26346666a498.34666667 498.34666667 0 0 0 365.44284444 157.67324445c145.15768889-0.52337778 275.78595555-61.69031111 367.02435556-159.67573333z m0 0"
                    fill="#739DE6" p-id="8205"></path>
                  <path data-v-39b29ed8=""
                    d="M720.91875555 439.79662222c0 53.62346667-16.22471111 126.29333333-43.4631111 165.55804445-37.54666667 54.11271111-122.22008889 79.12106667-161.82613334 79.12106666-40.0384 0-116.224-20.40035555-153.81617778-68.26666666-32.03982222-40.81208889-51.47306667-117.72586667-51.47306666-176.35555556 0-127.52213333 91.76177778-231.20782222 205.28924444-231.20782222s205.28924445 103.68568889 205.28924444 231.20782222"
                    fill="#FFFFFF" p-id="8206"></path>
                  <path data-v-39b29ed8=""
                    d="M739.06631111 333.9264S737.28 254.09991111 691.76888889 197.21102222c-31.78951111-39.7312-133.12-68.57386667-205.68746667-62.86222222 0 0-142.14257778 5.68888889-145.1008 100.12444445-25.97546667 15.55342222-52.66773333 42.38222222-55.52355555 87.47235555-5.68888889 90.7264 10.36515555 114.57422222 10.36515555 114.57422222s22.81244445 0 28.52408889 34.2016c0 0 10.36515555 6.23502222 11.37777778 0 1.54737778-10.36515555-9.32977778-60.13155555 12.43591111-105.74506667 2.68515555-5.76853333 5.37031111-10.91128889 7.96444445-15.49653333 71.2704-79.28035555 280.31431111-71.0656 329.29564444 15.62168889a104.35697778 104.35697778 0 0 1 4.33493333 18.5344c4.14151111 29.58222222 9.32977778 85.53813333 9.32977778 85.53813334s7.77102222 5.17688889 12.95928889-7.25902223c5.18826667-12.95928889 4.15288889-25.3952 8.81777778-29.02471111 26.48746667-17.60142222 19.75182222-91.18151111 18.20444444-98.96391111z"
                    fill="#9BB9ED" p-id="8207"></path>
                </svg>
                <span class="portal-header__actions-name">{{ userInfo.loginName || '用户' }}</span>
                <Icon type="ios-arrow-down" class="portal-header__actions-arrow"></Icon>
              </div>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="goConsole">控制台</DropdownItem>
                <DropdownItem @click.native="confirmLogout">退出登录</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </template>
          <template v-else>
            <a class="portal-header__link" href="javascript:void(0)" @click="handleLogin">登录</a>
            <Button type="primary" @click="handleRegister">注册</Button>
          </template>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <!-- <section class="portal-section portal-about">
      <div class="portal-about__banner">
        <div class="portal-about__banner-inner">
          <div class="portal-about__banner-title">{{ companyIntro.title }}</div>
          <div class="portal-about__banner-desc">{{ companyIntro.description }}</div>
        </div>
      </div>
      <div class="portal-container">
        <div class="about-card">
          <div class="about-card__section">
            <h3 class="about-card__title">集团介绍</h3>
            <p class="about-card__content">
              某基信息技术以沈阳为战略支点，构建起 “立足沈阳、辐射辽宁、面向全国” 的发展格局，依托自有研发平台和快速响应的实施能力，为发改委、教育、科技、公安、民政、财政、人社、交通、营商、纪检监察等超 70
              家委办局机构提供综合解决方案，形成了覆盖数字政务、城市感知、数据治理、行权监督、惠民服务、视频 AI、智慧运维的完备数智城市综合解决方案体系，业务版图已成功覆盖超 20 个地市 /
              区县；公司凭借前瞻性战略布局与卓越的执行力实现跨越式转型发展，聚焦业务细分板块，形成专业领域子公司、区域子公司、合资公司三种发展模式，先后成立某基技术研发、某基商用机器、某基运维服务、某基大数据安全、某基鑫坤达建筑工程、某基智算、某基智创等专业子公司和某基（厦门）、某基（吉林）、某基（山东）、某基（大连）等区域子公司，构建起多元子公司协同矩阵；同时，基于现有市场根基，公司积极整合本地服务商资源，通过标准化合作规范与创新利益共享机制，将分散的服务力量凝聚成高效协同的产业集群，实现从单点合作到深度战略绑定的升级。
            </p>
          </div>
          <div class="about-card__section">
            <h3 class="about-card__title">联系我们</h3>
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-label">电话</span>
                <span class="contact-value phone">024-66666</span>
              </div>
              <div class="contact-item">
                <span class="contact-label">地址</span>
                <span class="contact-value">辽宁省沈阳市浑南区</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- New About Section (按 CoDesign 设计稿 算力平台-关于我们-0823 开发) -->
    <section class="about-new">
      <!-- Hero 流光背景 -->
      <div class="about-new__hero">
        <div class="about-new__hero-bg"></div>
        <div class="about-new__hero-inner">
          <div class="about-new__brand">
            <sp-image class="about-new__brand-img" scp-type="图片" style="width: 410px;"
            :src="aboutLogo"></sp-image>
          </div>
          <a class="about-new__cta" href="" target="_blank" rel="noopener">
            前往官网
            <svg viewBox="0 0 16 24" class="about-new__cta-arrow" aria-hidden="true">
              <path d="M3 5l8 7-8 7" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer (与 home/index.vue 保持一致) -->
    <div class="footer-divider"></div>
    <footer class="portal-footer">
      <div class="portal-container">
        <!-- 顶部导航栏 -->
        <div class="footer-nav">
          <div class="footer-nav-section">
            <h5 class="nav-title">GPU算力</h5>
            <ul class="footer-links">
              <li><a href="javascript:void(0)" @click="handleGoToConsole('console')">控制台</a></li>
            </ul>
          </div>
          <div class="footer-nav-section">
            <h5 class="nav-title">模型广场</h5>
            <ul class="footer-links">
              <li><a href="javascript:void(0)" @click="handleGoToConsole('api')">模型展示</a></li>
            </ul>
          </div>
          <div class="footer-nav-section">
            <h5 class="nav-title">帮助中心</h5>
            <ul class="footer-links">
              <li><a href="javascript:void(0)" @click="handleGoToConsole('help')">帮助文档</a></li>
            </ul>
          </div>
          <!-- <div class="footer-nav-section">
            <h5 class="nav-title">客户案例</h5>
            <ul class="footer-links">
              <li><span>查看案例</span></li>
            </ul>
          </div> -->
          <div class="footer-nav-section">
            <h5 class="nav-title">意见建议</h5>
            <ul class="footer-links">
              <li><a href="javascript:void(0)" @click="handleGoToConsole('feedback')">提交反馈</a></li>
            </ul>
          </div>
        </div>
        <!-- 中间信息行：logo + 公司信息 + 联系方式 -->
        <div class="footer-info">
          <div class="footer-logo-section">
            <div class="footer-logo">
              <div class="logo-block"></div>
            </div>
            <div class="footer-company-name">
              <div class="company-name-cn">{{ footer.companyName }}</div>
              <div class="company-name-en">{{ footer.companyNameEn }}</div>
            </div>
          </div>
          <div class="contact-divider"></div>
          <div class="contact-block">
            <span class="contact-label">联系我们</span>
            <span class="contact-value">{{ footer.contactPhone }}</span>
          </div>
          <div class="contact-divider"></div>
          <div class="contact-block">
            <span class="contact-label">公司邮箱</span>
            <span class="contact-value">{{ footer.contactEmail }}</span>
          </div>
          <div class="contact-divider"></div>
          <div class="contact-block">
            <span class="contact-label">公司地址</span>
            <span class="contact-value">{{ footer.contactAddress }}</span>
          </div>
        </div>
        <!-- 底部版权 -->
        <div class="footer-bottom">
          <p class="footer-copyright">{{ footer.copyrightInfo }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import logoX from '@/assets/file/shenbeigpuai/image/logox.png'
import aboutLogo from '@/assets/file/shenbeigpuai/image/about-logo.png'

export default {
  components: {},
  props: [],
  name: "scp-shenbeigpuai-portal-about",
  data () {
    return {
      logoX,
      aboutLogo,
      footer: {
        companyName: '某基信息技术',
        companyNameEn: 'MOUJI INFORMATION TECHNOLOGY',
        contactPhone: '024-66666',
        contactEmail: 'admin@lnxjit.com',
        contactAddress: '辽宁省沈阳市浑南区',
        copyrightInfo: '版权所有©辽宁某基信息技术股份有限公司 Powered by CloudDream'
      },
      userPhoto: '',
      navTabs: [
        { key: "home", label: "首页" },
        // { key: "gpu", label: "GPU算力" },
        { key: "api", label: "模型广场" },
        { key: "help", label: "帮助中心" },
        { key: "about", label: "关于我们" },
      ],
      activeTab: "about",
      companyIntro: {
        title: "关于我们",
        description: "某基信息技术集团股份有限公司是数智城市解决方案和服务提供商",
      },
      feedbackForm: {
        content: "",
      },
    };
  },
  computed: {
    isLoggedIn () {
      try {
        const vuex = sessionStorage.getItem('vuex')
        if (vuex) {
          const userData = JSON.parse(vuex)
          if (userData.user && userData.user.severUserInfo && userData.user.severUserInfo.data) {
            return true
          }
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      }
      return false
    },
    userInfo () {
      try {
        const vuex = sessionStorage.getItem('vuex')
        if (vuex) {
          const userData = JSON.parse(vuex)
          return userData.user.severUserInfo.data || {}
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
      return {}
    }
  },
  mounted () {
    this.fetchFooter()
    if (this.isLoggedIn) {
      this.getUserPhoto()
    }
    // 进入 portal 页面时记录当前完整路径，供登录成功后回跳
    try { localStorage.setItem('portal_redirect', this.$route.fullPath) } catch (e) { }
  },
  methods: {
    handleRegister () {
      this.$router.push({ path: '/shenbeigpuai/portal/reg' })
    },
    async fetchFooter () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalFooterService/getActiveFooter',
          method: 'post',
          data: {}
        })
        const resp = { data: res }
        if (resp.data.errcode === 0 && resp.data.data) {
          const d = resp.data.data
          this.footer = {
            companyName: d.companyName || this.footer.companyName,
            companyNameEn: d.companyNameEn || this.footer.companyNameEn,
            contactPhone: d.contactPhone || this.footer.contactPhone,
            contactEmail: d.contactEmail || this.footer.contactEmail,
            contactAddress: d.contactAddress || this.footer.contactAddress,
            copyrightInfo: d.copyrightInfo || this.footer.copyrightInfo
          }
        }
      } catch (e) {
        console.error('获取Footer失败:', e)
      }
    },
    goAccountManagement () {
      this.$router.push('/shenbeigpuai/control/account-management')
    },
    async handleLogout () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/sc/loginService/userLogOut',
          method: 'post'
        })
        if (res.errcode === 0 || res.errcode === 1001) {
          sessionStorage.clear()
          window.location.reload()
        } else {
          this.$Message.warning(res.errmsg || '退出登录失败')
        }
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
    // 退出登录二次确认（参考 sysframe/control）
    confirmLogout () {
      this.$Modal.confirm({
        title: '退出登录',
        content: '<div style="padding: 8px 0; font-size: 14px; color: #515a6e; line-height: 22px;">确认退出当前登录状态吗？退出后需要重新登录才能继续操作。</div>',
        okText: '确认退出',
        cancelText: '取消',
        width: 420,
        okButtonProps: { type: 'error', ghost: true },
        className: 'sysframe-logout-confirm',
        onOk: () => {
          this.handleLogout()
        },
        onCancel: () => { }
      })
    },
    async getUserPhoto () {
      const cachedPhoto = sessionStorage.getItem('userPhoto')
      if (cachedPhoto !== null) {
        this.userPhoto = cachedPhoto
        return
      }
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post'
        })
        if (res.errcode === 0 && res.data) {
          const photo = res.data.photo || ''
          this.userPhoto = photo
          sessionStorage.setItem('userPhoto', photo)
        }
      } catch (error) {
        console.error('获取用户头像失败:', error)
      }
    },
    goConsole () {
      this.$router.push('/shenbeigpuai/control/home')
    },
    handleNav (key) {
      if (key === 'gpu') {
        // this.$router.push({ path: '/shenbeigpuai/portal/gpu' });
        return;
      }
      if (key === 'api') {
        this.$router.push({ path: '/shenbeigpuai/portal/api' });
        return;
      }
      if (key === 'help') {
        this.$router.push({ path: '/shenbeigpuai/portal/help' });
        return;
      }
      if (key === 'about') {
        this.$router.push({ path: '/shenbeigpuai/portal/about' });
        return;
      }
      if (key === 'home') {
        this.$router.push({ path: '/shenbeigpuai/portal/home' });
        return;
      }
      this.activeTab = key;
    },
    handleLogin () {
      this.$router.push({ path: '/login' });
    },
    handleSubmit () {
      if (!this.feedbackForm.content) {
        this.$Message.warning('请输入您的意见和建议');
        return;
      }
      this.$Message.success('您的意见已提交，感谢您的反馈！');
      this.feedbackForm.content = '';
    },
    handleGoToConsole (param) {
      if (param === 'console') {
        if (this.isLoggedIn) {
          this.$router.push({ path: '/shenbeigpuai/control/home' });
        } else {
          this.$router.push({ path: '/login' });
          localStorage.setItem('portal_redirect', '/shenbeigpuai/control/home')
        }
      } else if (param === 'api') {
        this.$router.push({ path: '/shenbeigpuai/portal/api' });
      } else if (param === 'help') {
        this.$router.push({ path: '/shenbeigpuai/portal/help' });
      } else if (param === 'feedback') {
        if (this.isLoggedIn) {
          this.$router.push({ path: '/shenbeigpuai/control/platform-intro' });
        } else {
          this.$router.push({ path: '/login' });
          localStorage.setItem('portal_redirect', '/shenbeigpuai/control/platform-intro')
        }
      }
    }
  },
};
</script>

<style scoped lang="less">
// @import url('https://at.alicdn.com/t/font_2345678_abcde123.css');

.portal-home {
  background: #f7f8fa;
  height: 100%;
  overflow: scroll;
  // overflow-x: hidden;
  // min-height: 100vh;
  // display: flex;
  // flex-direction: column;
}

.portal-container {
  max-width: 1800px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.portal-section {
  width: 100%;
  min-height: 70vh;
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
  // max-width: 1800px;
  width: 96%;
  margin: 0 auto;
  // padding: 0 20px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.portal-header__brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.portal-header__tabs {
  margin-left: 28px;
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

.portal-header__actions-user {
  display: flex;
  align-items: center;
  cursor: pointer;
  max-width: 220px;
  min-width: 0;
}

.portal-header__actions-avatar {
  border-radius: 50%;
  margin-right: 8px;
  height: 24px;
  width: 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.portal-header__actions-name {
  font-size: 14px;
  color: #333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
}

.portal-header__actions-arrow {
  margin-left: 4px;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .portal-header__actions-name {
    display: none;
  }

  .portal-header__actions-user {
    max-width: 60px;
  }
}

.portal-header__search {
  display: flex;
  align-items: center;
  width: 220px;
  height: 32px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 0 4px 0 12px;
}

.portal-header__search-input {
  border: none;
  box-shadow: none;
  flex: 1;
  padding: 0;
  height: 30px;
  line-height: 30px;
}

.portal-header__search-input /deep/ .ivu-input {
  border: none;
  box-shadow: none !important;
  height: 30px;
  line-height: 30px;
  padding: 0;
}

.portal-header__search-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4e5969;
  font-size: 16px;
}

.portal-header__link {
  color: #1d2129;
  font-size: 14px;
}

.portal-about {
  background: #f7f8fa;
}

.portal-about__banner {
  width: 100%;
  height: 380px;
  background: url('~@/assets/file/shenbeigpuai/image/about.png') no-repeat center;
  background-size: cover;
  // color: #fff;
  display: flex;
  align-items: center;
}

.portal-about__banner-inner {
  width: 1400px;
  margin: 0 auto;
}

.portal-about__banner-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 50px;
  margin-bottom: 8px;
}

.portal-about__banner-desc {
  font-size: 16px;
  line-height: 24px;
  max-width: 600px;
}

.about-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 40px;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: -80px auto 60px auto;
  max-width: 1800px;
  width: 90%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .portal-about__banner {
    height: 240px;
  }

  .portal-about__banner-title {
    font-size: 24px;
    line-height: 32px;
  }

  .portal-about__banner-desc {
    font-size: 14px;
    line-height: 20px;
  }

  .about-card {
    padding: 24px;
    margin: -60px auto 40px auto;
  }

  .contact-info .contact-item {
    flex-wrap: wrap;
  }
}

.about-card__section {
  margin-bottom: 35px;

  &:last-child {
    margin-bottom: 0;
  }
}

.about-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  line-height: 26px;
  margin-bottom: 16px;
  padding-left: 12px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    background-color: #165dff;
    border-radius: 2px;
  }
}

.about-card__content {
  font-size: 14px;
  color: #4e5969;
  line-height: 2.0;
  text-indent: 2em;
}

.contact-info {
  .contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    color: #4e5969;

    .contact-label {
      width: 60px;
      color: #86909c;
    }

    .contact-value.phone {
      font-size: 18px;
      font-weight: 500;
      color: #165dff;
    }
  }
}

.feedback-form {
  .submit-btn {
    margin-top: 16px;
    width: 120px;
  }
}

// 页脚分隔线
.footer-divider {
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, transparent 0%, #d9d9d9 10%, #d9d9d9 90%, transparent 100%);
  margin: 0;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent 0%, rgba(255, 153, 0, 0.3) 50%, transparent 100%);
  }
}

// 页脚
.portal-footer {
  background-color: #f5f5f5;
  color: #262626;
  padding: 48px 0 24px;
  // margin-bottom: auto;

  // 顶部导航栏：4 列居中分布
  .footer-nav {
    display: flex;
    justify-content: center;
    gap: 160px;
    padding: 16px 0 32px;

    .footer-nav-section {
      flex: 0 0 auto;
      text-align: center;

      .nav-title {
        font-size: 16px;
        font-weight: 700;
        margin: 0 0 16px;
        color: #262626;
      }

      .footer-links {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 8px;

          span,
          a {
            color: #595959;
            font-size: 14px;
            text-decoration: none;
            cursor: pointer;
          }

          a:hover {
            color: #165dff;
          }
        }
      }
    }
  }

  // 中间信息行：logo + 联系方式 单行均匀分布
  .footer-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 0;
    border-top: 1px solid #e8e8e8;

    .footer-logo-section {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 0 0 auto;
      min-width: 0;

      .footer-logo {
        flex-shrink: 0;

        .logo-block {
          width: 40px;
          height: 40px;
          background: url('~@/assets/file/shenbeigpuai/image/logox.png') no-repeat center / contain;
        }
      }

      .footer-company-name {
        display: flex;
        flex-direction: column;
        white-space: nowrap;

        .company-name-cn {
          font-size: 13px;
          font-weight: 700;
          color: #262626;
          line-height: 18px;
        }

        .company-name-en {
          font-size: 10px;
          color: #8c8c8c;
          letter-spacing: 0.5px;
          line-height: 14px;
          margin-top: 2px;
        }
      }
    }

    .contact-block {
      flex: 1;
      text-align: center;
      white-space: nowrap;

      .contact-label {
        font-size: 13px;
        font-weight: 600;
        color: #595959;
        line-height: 20px;
        margin-right: 6px;
      }

      .contact-value {
        font-size: 13px;
        font-weight: 700;
        color: gray;
        line-height: 20px;
      }
    }

    .contact-divider {
      width: 1px;
      height: 28px;
      background-color: #d9d9d9;
      flex: 0 0 auto;
    }
  }
  .footer-bottom {
    padding-top: 30px;
    text-align: center;

    .footer-copyright {
      font-size: 14px;
      color: #8c8c8c;
      margin: 0;
    }
  }
}

// 与上方标题同宽（1138px 居中）
.footer-nav,
.footer-info,
.footer-bottom {
  width: 1138px;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

// ============== New About Section（按 CoDesign 算力平台-关于我们-0823） ==============
.about-new {
  width: 100%;
}

.about-new__hero {
  position: relative;
  width: 100%;
  // 按设计稿 1920×937（约 0.49 比例）
  height: 0;
  padding-bottom: 40.8%;
  overflow: hidden;
  background: #0a0a0a;
}

.about-new__hero-bg {
  position: absolute;
  inset: 0;
  background: url('~@/assets/file/shenbeigpuai/image/about-new.png') no-repeat center / cover;
}

.about-new__hero-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  // 设计稿 LOGO 块中心在 50% / 约 35% 高度，按钮在 50% / 约 50% 高度
  padding: 0 24px;
}

.about-new__brand {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: -6.5%;
  margin-bottom: 32px;
}

.about-new__brand-logo {
  width: 120px;
  height: 84px;
  flex-shrink: 0;
  background: transparent;
}

.about-new__brand-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.about-new__brand-cn {
  font-size: 44px;
  font-weight: 700;
  color: #1a1311;
  letter-spacing: 4px;
  line-height: 1.2;
  white-space: nowrap;
}

.about-new__brand-en {
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #1a1311;
  line-height: 1.4;
}

.about-new__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 410px;
  height: 53px;
  padding: 0 36px;
  background: #1a1311;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 4px;
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.about-new__cta:hover {
  background: #000;
  transform: translateY(-1px);
}

.about-new__cta-arrow {
  width: 14px;
  height: 22px;
  margin-left: 2px;
}

@media (max-width: 768px) {
  .about-new__brand {
    flex-direction: column;
    gap: 12px;
    margin-top: -4%;
    margin-bottom: 24px;
  }

  .about-new__brand-logo {
    width: 80px;
    height: 56px;
  }

  .about-new__brand-cn {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .about-new__brand-en {
    font-size: 12px;
    letter-spacing: 2px;
  }

  .about-new__cta {
    min-width: 220px;
    height: 53px;
    font-size: 16px;
    letter-spacing: 2px;
    padding: 0 24px;
  }

  .about-new__cta-arrow {
    width: 10px;
    height: 16px;
  }
}
</style>
