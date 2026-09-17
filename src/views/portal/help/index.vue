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
    <section class="portal-section portal-about">
      <div class="portal-about__banner">
        <div class="portal-about__banner-inner">
          <div class="portal-about__banner-title">{{ companyIntro.title }}</div>
          <div class="help-center-search-wrapper">
            <!-- <div class="help-center-search">
              <Input v-model="searchKeyword" class="help-center-search__input" placeholder="搜索文档标题、内容或标签"
                @on-enter="handleSearch" clearable />
              <div class="help-center-search__btn" @click="handleSearch">
                <Icon type="ios-search" size="20">
                </Icon>
              </div>
            </div> -->
          </div>
        </div>
      </div>
      <div class="portal-container">
        <Card class="help-center-card">
          <div class="help-center-content">
            <div class="help-center-sidebar">
              <ul class="help-center-sidebar__list">
                <li v-for="item in flatCategories" :key="item.id" :class="['help-center-sidebar__item', {
                  'help-center-sidebar__item--child': item.depth === 1,
                  'help-center-sidebar__item--grandchild': item.depth === 2,
                  'is-active': selectedCategoryId === item.id
                }]" @click="handleCategoryClick(item)">
                  {{ item.categoryName }}
                  <span v-if="item.hasChildren" class="expand-icon" @click.stop="toggleCategory(item.id)">
                    <Icon :type="expandedCategories[item.id] ? 'ios-arrow-down' : 'ios-arrow-forward'" size="14" />
                  </span>
                </li>
              </ul>
            </div>
            <div class="help-center-main">
              <!-- 文档列表 -->
              <div v-if="!selectedDocument && selectedCategoryName !== '服务协议'" class="help-center-docs">
                <div v-if="searchKeyword" class="search-result-count">
                  找到 <strong>{{ filteredDocuments.length }}</strong> 个相关文档
                </div>
                <div v-for="doc in filteredDocuments" :key="doc.id" class="help-center-doc-item"
                  @click="handleDocumentClick(doc)">
                  <h3 class="help-center-doc-item__title">{{ doc.title }}</h3>
                  <!-- <p class="help-center-doc-item__summary">{{ doc.summary }}</p> -->
                  <div class="help-center-doc-item__meta"><span class="help-center-doc-item__time">{{ doc.publishTime
                  }}</span>
                    <!-- <span class="help-center-doc-item__views">浏览 {{ doc.viewCount }}</span> -->
                  </div>
                </div>
                <div v-if="filteredDocuments.length === 0 && !(!selectedDocument && loadingDocs)"
                  class="help-center-empty">
                  <p>暂无相关文档</p>
                </div>
              </div>
              <!-- 文档详情 -->
              <div v-if="selectedDocument" class="help-center-detail">
                <div class="help-center-detail__header">
                  <Button v-if="selectedCategoryName !== '服务协议'" type="text" icon="ios-arrow-back"
                    @click="handleBackToList" style="margin-bottom: 16px; padding-left: 0;">
                    返回列表
                  </Button>
                  <h2 class="help-center-detail__title">{{ selectedDocument.title }}</h2>
                  <div class="help-center-detail__meta"><span class="help-center-detail__time">发布时间：{{
                    selectedDocument.publishTime }}</span>
                    <!-- <span class="help-center-detail__views">浏览次数：{{
                        selectedDocument.viewCount }}</span> -->
                  </div>
                </div>
                <div class="help-center-detail__content" v-html="formatContent(selectedDocument.content)"></div>
              </div>

              <!-- 加载状态 -->
              <div v-if="!selectedDocument && loadingDocs" class="help-center-empty">
                <p>加载中...</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>

    <!-- Footer (migrated from home/index.vue) -->
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

export default {
  components: {},
  props: [],
  name: "scp-shenbeigpuai-portal-help",
  data () {
    return {
      logoX,
      footer: {
        companyName: '某基信息技术',
        companyNameEn: 'MOUJI INFORMATION TECHNOLOGY',
        contactPhone: '024-66666',
        contactEmail: 'admin@lnxjit.com',
        contactAddress: '辽宁省沈阳市浑南区',
        copyrightInfo: '版权所有©辽宁某基信息技术股份有限公司 Powered by CloudDream'
      },
      userPhoto: '',
      "documentCategories": [],
      "documentsByCategory": {},  // 按分类存储所有文档
      "selectedCategoryName": "",
      "selectedDocument": null,
      "loadingDocs": false,
      "selectedCategoryId": "",
      "expandedCategories": {},  // 展开的分类
      "searchKeyword": "",
      "selectedDocumentId": "",
      navTabs: [
        { key: "home", label: "首页" },
        // { key: "gpu", label: "GPU算力" },
        { key: "api", label: "模型广场" },
        { key: "help", label: "帮助中心" },
        { key: "about", label: "关于我们" },
      ],
      activeTab: "help",
      companyIntro: {
        title: "帮助中心",
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
    },
    filteredDocuments () {
      let documents = []

      // 如果有搜索关键词,搜索所有文档,不限制分类
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        // 遍历所有分类的文档进行搜索
        for (const categoryId in this.documentsByCategory) {
          const categoryDocs = this.documentsByCategory[categoryId] || []
          documents = documents.concat(categoryDocs.filter(doc =>
            (doc.title || '').toLowerCase().includes(keyword) ||
            (doc.summary || '').toLowerCase().includes(keyword) ||
            (doc.content || '').toLowerCase().includes(keyword) ||
            (doc.tags && doc.tags.some(tag => (tag || '').toLowerCase().includes(keyword)))
          ))
        }
      } else {
        // 没有搜索关键词时,只显示当前分类的文档
        if (this.selectedCategoryId) {
          documents = this.documentsByCategory[this.selectedCategoryId] || []
        }
      }

      documents.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

      return documents
    },
    flatCategories () {
      const result = []
      const flatten = (categories, depth = 0) => {
        for (const category of categories) {
          result.push({
            id: category.id,
            categoryName: category.categoryName,
            depth: depth,
            hasChildren: category.children && category.children.length > 0
          })
          if (category.children && category.children.length > 0) {
            if (this.expandedCategories[category.id]) {
              flatten(category.children, depth + 1)
            }
          }
        }
      }
      flatten(this.documentCategories, 0)
      return result
    },
  },
  watch: {
    'searchKeyword' (newVal) {
      if (newVal || newVal === '') {
        // 搜索时清空选中的文档,显示列表
        this.selectedDocument = null
      }
    },
  },
  mounted () {
    this.fetchHelpCategories()
    this.fetchFooter()
    if (this.isLoggedIn) {
      this.getUserPhoto()
    }
  },
  methods: {
    handleRegister () {
      this.$router.push({ path: '/shenbeigpuai/portal/reg' })
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
    async fetchHelpCategories () {
      try {
        this.loadingDocs = true
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/helpCategoryService/listHelpCategory',
          method: 'post',
          data: {
            isTree: '1'
          }
        })
        res = {
          data: res
        }
        if (res.data.errcode === 0) {
          const list = Array.isArray(res.data.data) ? res.data.data : []
          this.documentCategories = list
          if (!this.selectedCategoryId && this.documentCategories.length > 0) {
            this.selectedCategoryId = this.documentCategories[0].id
            if (this.documentCategories[0].children && this.documentCategories[0].children.length > 0) {
              this.$set(this.expandedCategories, this.documentCategories[0].id, true)
            }
          }
          await this.fetchAllDocuments()
        } else {
          this.$Message.error(res.data.errmsg || '获取分类失败')
          this.documentCategories = []
        }
      } catch (e) {
        this.$Message.error('网络异常')
        this.documentCategories = []
      } finally {
        this.loadingDocs = false
      }
    },
    async fetchAllDocuments () {
      const fetchRecursive = async (categories) => {
        for (const category of categories) {
          await this.fetchHelpDocuments(category.id)
          if (category.children && category.children.length > 0) {
            await fetchRecursive(category.children)
          }
        }
      }
      await fetchRecursive(this.documentCategories)
      this.$forceUpdate()
    },
    async fetchHelpDocuments (categoryId) {
      if (!categoryId) return
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/helpDocumentService/listHelpDocument',
          method: 'post',
          data: {
            categoryId: categoryId
          }
        })
        res = {
          data: res
        }
        if (res.data.errcode === 0) {
          const list = Array.isArray(res.data.data) ? res.data.data : []
          // 使用 $set 确保响应式更新
          this.$set(this.documentsByCategory, categoryId, list.map(it => {
            // 从content中提取summary作为简介
            const textContent = it.content || ''
              .replace(/#+\s+/g, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .replace(/-\s+/g, '')
              .replace(/\n/g, ' ')
              .trim()
            // let a = `# Vue2 Markdown 演示
            //         ## 二级标题
            //         普通文本内容
            //         - 列表项1
            //         - 列表项2

            //         ### 代码块
            //         \`\`\`javascript
            //         function test() {
            //           console.log('vue2 渲染md')
            //         }
            //         \`\`\`

            //         > 引用文本
            //         **加粗文字** *斜体文字*
            //         `

            const summary = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')

            return {
              id: it.id,
              title: it.title,
              content: it.content,
              // content: a,
              categoryId: it.categoryId,
              summary: summary,
              tags: it.tags ? it.tags.split(',').filter(s => s) : [],
              viewCount: it.viewCount || 0,
              publishTime: it.createTime,
              sortOrder: it.sortOrder || 0,
              isEnabled: it.isEnabled
            }
          }))
        }
      } catch (e) {
        console.error('获取文档失败:', e)
      }
    },
    handleLogin () {
      // 跳转到登录页前，先记录当前 portal 完整路径（含 query），登录成功后回跳
      try { localStorage.setItem('portal_redirect', this.$route.fullPath) } catch (e) { }
      this.$router.push({ path: '/login' })
    },
    handleNav (key) {
      if (key === 'gpu') {
        this.$router.push({
          path: '/shenbeigpuai/portal/gpu'
        })
        return
      }
      if (key === 'api') {
        this.$router.push({
          path: '/shenbeigpuai/portal/api'
        })
        return
      }
      if (key === 'help') {
        return
      }
      if (key === 'about') {
        this.$router.push({
          path: '/shenbeigpuai/portal/about'
        })
        return
      }
      if (key === 'home') {
        this.$router.push({
          path: '/shenbeigpuai/portal/home'
        })
        return
      }
      this.activeTab = key
    },
    handleCategoryClick (category) {
      this.selectedCategoryName = category.categoryName
      this.selectedCategoryId = category.id
      this.searchKeyword = ''
      this.selectedDocument = null
      this.selectedDocumentId = ''
      if (this.selectedCategoryName === '服务协议') {
        this.handleDocumentClick(this.filteredDocuments[0])
      }
    },
    toggleCategory (categoryId) {
      this.$set(this.expandedCategories, categoryId, !this.expandedCategories[categoryId])
    },
    handleDocumentClick (doc) {
      console.log(doc)
      this.selectedDocument = doc
      this.selectedDocumentId = doc.id
    },
    handleBackToList () {
      this.selectedDocument = null
      this.selectedDocumentId = ''
    },
    handleSearch () {
      // 清空选中的文档,显示列表
      this.selectedDocument = null
    },
    formatContent (content) {
      if (!content) return ''
      let html = content
        .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^-\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (match) => {
          return '<ul>' + match + '</ul>'
        })
        .split(/\n\s*\n/)
        .map(para => {
          para = para.trim()
          if (!para) return ''
          if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<li')) {
            return para
          }
          return '<p>' + para + '</p>'
        })
        .join('\n')
        .replace(/\n/g, '<br>')

      return html
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
@import url('https://at.alicdn.com/t/font_2345678_abcde123.css');

.help-center-search-wrapper {
  display: flex;
  justify-content: flex-start;
  // margin-bottom: 10px;
}

.help-center-search {
  display: flex;
  align-items: center;
  width: 765px;
  max-width: 100%;
  height: 40px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 0 4px 0 16px;
  background: #ffffff;
}

.help-center-search__input {
  border: none;
  box-shadow: none;
  flex: 1;
  padding: 0;
  height: 48px;
  width: 765px;
  line-height: 38px;
  // iview Input wrapper 内部含有 ivu-input-prefix / ivu-input-suffix 绝对定位图标，
  // wrapper 需 flex + 垂直居中才能让清空图标贴着输入框垂直居中
  display: flex;
  align-items: center;
}

.help-center-search__input /deep/ .ivu-input {
  border: none;
  box-shadow: none !important;
  height: 38px;
  line-height: 38px;
  padding: 0;
}

.help-center-search__input /deep/ .ivu-input-suffix {
  display: flex;
  align-items: center;
  height: 100%;
}

.help-center-search__btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4e5969;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f7f8fa;
    color: #165dff;
  }
}

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
  display: block;
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
  background: url('~@/assets/file/shenbeigpuai/image/help.png') no-repeat center;
  background-size: cover;
  // color: #fff;
  display: flex;
  align-items: center;
}

.portal-about__banner-inner {
  max-width: 1138px;
  width: 100%;
  margin: 0 auto;
  // padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.portal-about__banner-title {
  font-size: 26px;
  color: #000;
  font-weight: 700;
  line-height: 50px;
  margin-bottom: 14px;
  width: 100%;
  text-align: left;
}

.portal-about__banner-desc {
  font-size: 16px;
  line-height: 24px;
  max-width: 600px;
  text-align: left;
}

.about-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 40px;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: -80px auto 60px auto;
  width: 80%;
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
  margin-top: auto;

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

// 帮助中心卡片样式
.help-center-card {
  /deep/ .ivu-card-body {
    padding: 22px;
    height: 600px;
  }

  background: #ffffff;
  border-radius: 8px;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: -100px auto 60px auto;
  max-width: 1138px;
  width: 100%;
}

.help-center-content {
  display: flex;
  gap: 40px;
  height: 100%;
  flex-wrap: wrap;
}

.help-center-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.help-center-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.help-center-search {
  display: flex;
  align-items: center;
  width: 100%;
  // max-width: 400px;
  height: 40px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 0 4px 0 12px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .help-center-sidebar {
    width: 100%;
  }

  .portal-about__banner {
    height: 240px;
  }

  .portal-about__banner-title {
    font-size: 24px;
    line-height: 32px;
  }

  .help-center-card {
    width: 95%;
    margin: -60px auto 40px auto;
  }

  .help-center-card /deep/ .ivu-card-body {
    padding: 16px;
    height: auto;
  }

  .help-center-content {
    gap: 16px;
  }
}

.help-center-sidebar__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-center-sidebar__item {
  padding: 12px 16px;
  font-size: 14px;
  color: #4e5969;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .expand-icon {
    color: #86909c;
  }

  &:hover {
    background: #f7f8fa;
    color: #165dff;
  }

  &.is-active {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 12px 16px;
    border-radius: 6px;
    background: linear-gradient(251.30deg, #f7ecff 0%, #e9f0ff 100%);
    color: #1d2129;
    font-weight: 500;
  }

  &--child {
    padding-left: 32px;
    font-size: 16px;
  }

  &--grandchild {
    padding-left: 48px;
    font-size: 14px;
  }
}

.help-center-main {
  flex: 1;
  min-width: 0;
}

.help-center-docs {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;

  .search-result-count {
    padding: 12px 16px;
    background: #e8f3ff;
    border-radius: 4px;
    font-size: 14px;
    color: #4e5969;
    margin-bottom: 8px;

    strong {
      color: #165dff;
      font-size: 18px;
      margin: 0 4px;
    }
  }
}

.help-center-doc-item {
  padding: 20px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e8f3ff;
    transform: translateY(-2px);
  }
}

.help-center-doc-item__title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
}

.help-center-doc-item__summary {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.help-center-doc-item__meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 10px;
  color: #86909c;
}

.help-center-doc-item__time,
.help-center-doc-item__views {
  display: flex;
  align-items: center;
}

.help-center-empty {
  text-align: center;
  padding: 60px 0;
  color: #86909c;
  font-size: 14px;
}

.help-center-detail {
  animation: fadeIn 0.3s ease;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.help-center-detail__header {
  border-bottom: 1px solid #e5e6eb;
  padding-bottom: 20px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.help-center-detail__title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 16px 0 12px 0;
}

.help-center-detail__meta {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 13px;
  color: #86909c;
}

.help-center-detail__time,
.help-center-detail__views {
  display: flex;
  align-items: center;
}

.help-center-detail__content {
  font-size: 16px;
  color: #4e5969;
  line-height: 1.8;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;

  /deep/ h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1d2129;
    margin: 24px 0 16px 0;
  }

  /deep/ h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    margin: 20px 0 14px 0;
  }

  /deep/ h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1d2129;
    margin: 18px 0 12px 0;
  }

  /deep/ p {
    margin: 12px 0;
  }

  /deep/ strong {
    font-weight: 600;
    color: #1d2129;
  }

  /deep/ ul {
    margin: 12px 0;
    padding-left: 24px;
  }

  /deep/ li {
    margin: 8px 0;
  }
}
</style>
