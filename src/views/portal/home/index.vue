<template>
  <div class="portal-home">
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
    <section ref="home" class="portal-section portal-hero">
      <div class="portal-hero__inner">
        <template v-if="banners && banners.length === 1">
          <div class="portal-hero__single">
            <div class="portal-hero__slide" :style="getBannerStyle(banners[0].imageUrl)"
              @click="handleBannerClick(banners[0])">
              <div class="portal-hero__content">
                <button type="button" class="portal-hero__btn" @click.stop="handleNav('gpu', banners[0])">
                  立即体验
                  <svg class="portal-hero__btn-arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M6 18L18 6M9 6h9v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>
        <Carousel v-else v-model="bannerIndex" :autoplay="true" :autoplay-speed="3000" :radius-dot="true" loop
          class="portal-hero__carousel">
          <CarouselItem v-for="b in banners" :key="b.id">
            <div class="portal-hero__slide" :style="getBannerStyle(b.imageUrl)" @click="handleBannerClick(b)">
              <div class="portal-hero__content">
                <button type="button" class="portal-hero__btn" @click.stop="handleNav('gpu', b)">
                  立即体验
                  <svg class="portal-hero__btn-arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M6 18L18 6M9 6h9v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
          </CarouselItem>
        </Carousel>
      </div>
    </section>
    <section ref="gpu" class="portal-section portal-products">
      <div class="portal-container">
        <div class="portal-section__header">
          <div class="portal-section__title">机型配置价格</div>
          <div class="portal-section__subtitle">根据业务需求选择实例配置，价格一目了然</div>
        </div>
        <!-- 切换类型：GPU 服务器 / CPU 服务器 / 裸金属服务器 -->
        <!-- 三个 Tab 各自循环一次卡片（同一份数据填充，后续按 cloudPlatform 差异化时只改 updateCurrentProducts 即可） -->
        <div class="portal-products__tabs">
          <!-- 手写 TabBar：等宽均分 + 浅灰底 + 激活态浅紫底，与设计图一致 -->
          <div class="pp-tabbar">
            <div v-for="cat in categoryList" :key="cat.id" class="pp-tab"
              :class="{ 'is-active': activeCategoryId === cat.id }" @click="handleCategoryTabClick(cat.id)">{{
                cat.categoryName }}</div>
          </div>

          <!-- 当前分类 SKU 内容（loading / empty / grid 三态） -->
          <div class="portal-products__pane">
            <div v-if="isCategoryLoading" class="portal-products__loading">
              <Icon type="ios-loading" class="spin-icon-load" size="24" />
              <span>加载中...</span>
            </div>
            <div v-else-if="currentProducts.length === 0" class="portal-products__empty">
              <Icon type="ios-information-circle-outline" size="24" color="#2d8cf0" />
              <span>暂无产品</span>
            </div>
            <div v-else class="portal-products__grid">
              <div v-for="p in currentProducts" :key="p.id" class="portal-product-card"
                :class="{ 'is-recommended': p.isRecommended }">
                <!-- 右上角柔和渐变装饰 -->
                <div class="portal-product-card__decoration"></div>
                <!-- 标题：纯文本 -->
                <div class="portal-product-card__title">{{ p.modelName || 'GPU计算' }}</div>
                <!-- 规格区：2x2 网格，标签在上值在下 -->
                <div class="portal-product-card__specs">
                  <div class="portal-product-card__specs-row">
                    <div class="portal-product-card__spec-item">
                      <div class="portal-product-card__spec-label">CPU型号</div>
                      <div class="portal-product-card__spec-value" style="min-height: 44px;">{{ p.cpuName || '-' }}
                      </div>
                    </div>
                    <div class="portal-product-card__spec-item">
                      <div class="portal-product-card__spec-label">GPU型号</div>
                      <div class="portal-product-card__spec-value" style="min-height: 44px;">{{ p.gpuName || '-' }}
                      </div>
                    </div>
                  </div>
                  <div class="portal-product-card__specs-row">
                    <div class="portal-product-card__spec-item">
                      <div class="portal-product-card__spec-label">CPU核心</div>
                      <div class="portal-product-card__spec-value">{{ p.cpuCoreCount || '-' }}核</div>
                    </div>
                    <div class="portal-product-card__spec-item">
                      <div class="portal-product-card__spec-label">GPU数量</div>
                      <div class="portal-product-card__spec-value">{{ p.gpuCount || '-' }}块</div>
                    </div>
                  </div>
                </div>
                <!-- 底部：长按钮 = 价格 + 立即购买（整体可点击） -->
                <button class="portal-product-card__footer" type="button" @click="handleBuy(p)">
                  <div class="portal-product-card__price">
                    <span class="portal-product-card__price-currency">￥</span>
                    <span class="portal-product-card__price-num">{{ formatPrice(p) }}</span>
                    <span class="portal-product-card__price-unit">/{{ formatPriceUnit(p) }}</span>
                  </div>
                  <span class="portal-product-card__buy">
                    立即购买
                    <svg class="portal-product-card__arrow" viewBox="0 0 24 24" width="14" height="14"
                      aria-hidden="true">
                      <path d="M6 18L18 6M9 6h9v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" fill="none" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section ref="product" class="portal-section portal-intros">
      <div class="portal-container">
        <div class="portal-section__header">
          <div class="portal-section__title">产品介绍</div>
          <div class="portal-section__subtitle">自研 GPU 算力租赁平台，支持按需弹性计费，搭载超强并行计算算力，为各类高性能计算场景提供稳定、高效的 IaaS 级算力服务。</div>
        </div>
        <div class="portal-intros__content">
          <div class="custom-collapse">
            <div v-for="(item, index) in collapseItems" :key="index"
              :class="['custom-collapse-item', { 'is-active': activePanel === index }]">
              <div class="custom-collapse-header" @click="handlePanelClick(index)">
                <span class="custom-collapse-title">{{ item.title }}</span>
                <Icon :type="activePanel === index ? 'ios-arrow-up' : 'ios-arrow-down'" class="custom-collapse-icon" />
              </div>
              <div :class="['custom-collapse-content-wrapper', { 'is-open': activePanel === index }]">
                <div class="custom-collapse-content">
                  <div class="portal-collapse__desc" v-html="item.description"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="portal-intros__right">
            <div class="portal-intro-card">
              <div class="portal-intro-features">
                <div class="portal-collapse__desc content-height" v-html="currentselect.content"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section ref="gpu1" class="portal-section portal-partners">
      <div class="portal-container">
        <div class="portal-section__header">
          <div class="portal-section__title">合作伙伴</div>
          <div class="portal-section__subtitle">千行百业的公司，与某基一起开拓创新</div>
        </div>
        <div class="portal-partners__grid">
          <div v-for="it in partners" :key="it.id" class="portal-partner">
            <img v-if="it.logoUrl" class="portal-partner__logo" :src="it.logoUrl" alt="" />
            <img v-else class="portal-partner__logo" :src="getPartnerLogoStyle(it.partnerName)" alt="" />
          </div>
        </div>
      </div>
    </section>
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
  components: {}, props: [], name: "scp-shenbeigpuai-portal-home", data () {
    return {
      logoX,
      currentselect: '',
      "logoUrl": "", "bannerImage": "", "userPhoto": "", "navTabs": [{ "key": "home", "label": "首页" },
      // { key: 'gpu', label: 'GPU算力' },
      { "key": "api", "label": "模型广场" }, { "key": "help", "label": "帮助中心" }, { "key": "about", "label": "关于我们" }], "activeTab": "home", "bannerIndex": 0, "banners": [],
      // 顶级产品分类（从 productCategoryService/listTopCategory 动态拉取）
      "categoryList": [],
      // 当前激活的分类 id（顶级分类 id）
      "activeCategoryId": "",
      // 按分类缓存的 SKU：{ [categoryId]: { list, loading, loaded } }
      "categorySkuMap": {},
      // 当前展示的 SKU 列表（当前激活分类的 SKU）
      "currentProducts": [], "productIntros": [], "partners": [], "multiClouds": [], "footer": { "companyName": "某基信息技术", "companyNameEn": "MOUJI INFORMATION TECHNOLOGY", "contactPhone": "024-66666", "contactEmail": "admin@lnxjit.com", "contactAddress": "辽宁省沈阳市浑南区", "copyrightInfo": "版权所有©辽宁某基信息技术股份有限公司 Powered by CloudDream" }, "activePanel": 0, "collapseItems": [
        {
          title: "",
          description: ""
        }
      ]
    }
  }, computed: {
    /**
     * 当前激活分类是否正在加载（用于模板 loading 占位）
     */
    isCategoryLoading () {
      if (!this.activeCategoryId) return false
      const bucket = this.categorySkuMap[this.activeCategoryId]
      return !!(bucket && bucket.loading)
    },
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
  }, created () { }, beforeMount () { }, mounted () {
    this.fetchData()
    if (this.isLoggedIn) {
      this.getUserPhoto()
    }
    // 进入 portal 页面时记录当前完整路径，供登录成功后回跳
    try { localStorage.setItem('portal_redirect', this.$route.fullPath) } catch (e) { }
    window.addEventListener('scroll', this.handleScroll, {
      passive: true
    })
    this.$nextTick(() => {
      this.handleScroll()
      // 检查路由参数，如果有section参数，跳转到对应section
      if (this.$route.query.section) {
        this.handleNav(this.$route.query.section)
      }
    })
  }, destroyed () { }, watch: {
    // 监听激活分类切换：仅刷新展示列表，懒加载由 handleCategoryTabClick 显式触发
    activeCategoryId (newVal) {
      if (!newVal) {
        this.currentProducts = []
        return
      }
      const bucket = this.categorySkuMap[newVal]
      this.currentProducts = bucket && bucket.loaded ? bucket.list : []
    }
  }, methods: {
    /**
     * 拉取顶级产品分类（用于动态渲染门户首页产品 Tab）
     */
    async fetchTopCategories () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productCategoryService/listTopCategory',
          method: 'post',
          data: {}
        })
        console.log(res)
        
        if (res.errcode === 0) {
          this.categoryList = Array.isArray(res.data) ? res.data : []
          if (this.categoryList.length > 0 && !this.activeCategoryId) {
            this.activeCategoryId = this.categoryList[0].id
          }
        } else if (res.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.categoryList = []
          console.error('获取顶级产品分类失败:', res.errmsg)
        }
      } catch (e) {
        console.error('获取顶级产品分类失败:', e)
        this.categoryList = []
      }
    },
    /**
     * 点击分类 Tab：切换激活态 + 触发懒加载（不依赖 watch）
     */
    handleCategoryTabClick (categoryId) {
      if (categoryId === this.activeCategoryId) return
      this.activeCategoryId = categoryId
      // 直接触发懒加载，不依赖 watch（避免 watch 在某些 Vue 版本下不触发的问题）
      const bucket = this.categorySkuMap[categoryId]
      if (!bucket) {
        this.$set(this.categorySkuMap, categoryId, { list: [], loading: false, loaded: false })
      }
      if (!this.categorySkuMap[categoryId].loaded && !this.categorySkuMap[categoryId].loading) {
        this.fetchSkusByCategory(categoryId)
      }
    },
    /**
     * 按分类加载 SKU 列表（懒加载核心；与购买页保持同口径）
     */
    async fetchSkusByCategory (categoryId) {
      if (!categoryId) return
      if (!this.categorySkuMap[categoryId]) {
        this.$set(this.categorySkuMap, categoryId, { list: [], loading: false, loaded: false })
      }
      const bucket = this.categorySkuMap[categoryId]
      bucket.loading = true
      bucket.loaded = false
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productSkuService/listGpuPurchaseSku',
          method: 'post',
          data: {
            categoryId: categoryId
            // 门户场景无登录也可访问，因此不传 regionId（购买页会按地域过滤）
            // 不传 billingTypeParam，让 SKU 价格字段保留原始值，前端按 has-value 决定展示
            // 不传 isRecommended：库里 SKU 均未标记推荐，传 '1' 会导致全部分类返回空，门户应展示该分类下全部可购买产品
          }
        })
        if (res.errcode === 0) {
          const data = Array.isArray(res.data) ? res.data : []
          // 字段映射与 fetchProducts 保持一致
          bucket.list = data.map(item => this.mapSkuToPortal(item))
          bucket.loaded = true
          // 如果仍是当前激活分类，更新展示列表
          if (this.activeCategoryId === categoryId) {
            this.currentProducts = bucket.list
          }
        } else if (res.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          bucket.list = []
          if (this.activeCategoryId === categoryId) {
            this.currentProducts = []
          }
          console.error('获取产品SKU失败:', res.errmsg)
        }
      } catch (e) {
        console.error('获取产品SKU失败:', e)
        bucket.list = []
        if (this.activeCategoryId === categoryId) {
          this.currentProducts = []
        }
      } finally {
        bucket.loading = false
      }
    },
    /**
     * 后端 SKU 原始对象 → 门户展示对象（字段归一化）
     */
    mapSkuToPortal (item) {
      return {
        id: item.id,
        modelName: item.modelName || item.model_name || '',
        singlePrecision: item.singlePrecision || item.single_precision || '-',
        halfPrecision: item.halfPrecision || item.half_precision || '-',
        cpuConfig: item.cpuConfig || item.cpu_config || '',
        gpuCount: item.gpuCount || '',
        cpuCoreCount: item.cpuCoreCount || '',
        gpuName: item.gpuName || '',
        cpuName: item.cpuName || '',
        memoryConfig: item.memoryConfig || item.memory_config || '',
        priceHourly: Number(item.priceHourly || 0),
        priceMonthly: Number(item.priceMonthly || 0),
        priceYearly: Number(item.priceYearly || 0),
        gpuModel: item.gpuModel || item.gpu_model || '',
        billingType: item.billingType || item.billing_type || '',
        price: Number(item.price || 0),
        isRecommended: item.isRecommended === '1' || item.isRecommended === 1 || item.is_recommended === '1',
        regionId: item.regionId || item.region_id || '',
        cloudPlatform: item.cloudPlatform || item.cloud_platform || ''
      }
    },
    goConsole () {
      this.$router.push('/shenbeigpuai/control/home')
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
    // 格式化价格数值，按优先级选择非空价格
    formatPrice (product) {
      if (product.priceHourly && product.priceHourly !== '0') {
        return product.priceHourly
      } else if (product.priceMonthly && product.priceMonthly !== '0') {
        return product.priceMonthly
      } else if (product.priceYearly && product.priceYearly !== '0') {
        return product.priceYearly
      } else {
        return product.price || '0'
      }
    },
    // 格式化价格单位，按优先级选择非空价格的单位
    formatPriceUnit (product) {
      if (product.priceHourly && product.priceHourly !== '0') {
        return '小时'
      } else if (product.priceMonthly && product.priceMonthly !== '0') {
        return '月'
      } else if (product.priceYearly && product.priceYearly !== '0') {
        return '年'
      } else {
        return '次'
      }
    },
    handlePanelClick (index) {
      // 点击已展开的面板不允许收起
      if (this.activePanel === index) {
        return;
      }
      this.activePanel = index;
      this.currentselect = this.collapseItems[index]
    },

    /**
     * 处理折叠面板切换事件
     * @param {String/Array} key 点击的面板 key
     */
    async fetchData () {
      try {
        await Promise.all([
          this.fetchBanners(),
          // 替换旧的 fetchProducts：先拉顶级分类，再激活首个 Tab 触发懒加载
          this.fetchTopCategories(),
          this.fetchPartners(),
          this.fetchProductIntros(),
          this.fetchFooter()
        ])
        // 顶级分类加载完成后，主动触发当前 Tab 的 SKU 加载
        if (this.activeCategoryId) {
          this.fetchSkusByCategory(this.activeCategoryId)
        }
      } catch (e) {
        this.$Message.error('数据加载失败')
      }
    }, async fetchFooter () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalFooterService/getActiveFooter',
          method: 'post',
          data: {}
        })
        const resp = { data: res }
        if (resp.data.errcode === 0 && resp.data.data) {
          const d = resp.data.data
          if (d.companyName) this.footer.companyName = d.companyName
          if (d.companyNameEn) this.footer.companyNameEn = d.companyNameEn
          if (d.contactPhone) this.footer.contactPhone = d.contactPhone
          if (d.contactEmail) this.footer.contactEmail = d.contactEmail
          if (d.contactAddress) this.footer.contactAddress = d.contactAddress
          if (d.copyrightInfo) this.footer.copyrightInfo = d.copyrightInfo
        }
      } catch (e) {
        console.error('获取Footer失败:', e)
      }
    }, async fetchBanners () {
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalBannerService/listPortalBanner',
          method: 'post',
          data: {}
        })
        // 接口返回格式兼容
        res = { data: res }
        if (res.data.errcode === 0) {
          const data = Array.isArray(res.data.data) ? res.data.data : []
          this.banners = data
        } else {
          this.banners = []
          this.$Message.error(res.data.errmsg || '获取Banner失败')
        }
      } catch (e) {
        this.banners = []
        this.$Message.error('获取Banner失败')
      }
    }, async fetchPartners () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalPartnerService/listPortalPartner',
          method: 'post',
          data: {

          }
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          const data = Array.isArray(resp.data.data) ? resp.data.data : []
          this.partners = data.map(item => ({
            id: item.id,
            partnerName: item.partnerName || item.partner_name || '',
            logoUrl: item.logoUrl || item.logo_url || '',
            // linkUrl: item.linkUrl || item.link_url || '',
            partnerType: item.partnerType || item.partner_type || '',
            sortOrder: item.sortOrder || item.sort_order || 0
          })).sort((a, b) => a.sortOrder - b.sortOrder)
        } else {
          this.partners = []
          this.$Message.error(resp.data.errmsg || '获取合作伙伴失败')
        }
      } catch (e) {
        this.partners = []
        this.$Message.error('获取合作伙伴失败')
      }
    }, async fetchProductIntros () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalProductIntroService/listTopProductIntro',
          method: 'post',
          data: {}
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          const data = Array.isArray(resp.data.data) ? resp.data.data : []
          // 将接口返回的数据映射到 collapseItems
          if (data.length > 0) {
            this.collapseItems = data.map(item => ({
              title: item.title || '',
              description: item.description || '',
              content: item.content || ''
            }))
            this.currentselect = this.collapseItems[0]
            // console.log(this.currentselect)
            // this.currentselect.content = `<p><img src="https://cloudstor.tripln.top/TEST:xinjioss/house/wl/a70414bce8dbe16da6537fde4344e21c.jpeg" alt="" width="2730" height="1535"></p>`

          }
        } else {
          // 接口调用失败时使用默认数据
          this.$Message.error(resp.data.errmsg || '获取产品介绍失败')
        }
      } catch (e) {
        // 接口异常时使用默认数据，不显示错误提示
        console.error('获取产品介绍失败', e)
      }
    },
    convertUrl (rawUrl) {
      const arr = rawUrl.split('/');
      const filename = arr.pop();
      // 完整编码文件名
      let encodedName = encodeURIComponent(filename);
      // 把括号还原，不编码 ()
      encodedName = encodedName.replace(/%28/g, '(').replace(/%29/g, ')');
      arr.push(encodedName);
      return arr.join('/');
    },
    getBannerStyle (bannerImage) {
      if (!bannerImage) {
        return {
          backgroundImage: 'none'
        }
      }
      // // 如果已经是完整的 data URI，直接使用；否则添加 url() 包装
      // if (bannerImage.startsWith('data:') || bannerImage.startsWith('http://') || bannerImage.startsWith('https://')) {
      //   return {
      //     // encodeURI 处理文件名中的空格、中文、# 等特殊字符，避免 url() 解析失败
      //     // backgroundImage: `url(${encodeURI(bannerImage)})`
      //     backgroundImage: `url("${this.convertUrl(bannerImage)}")`
      //   }
      // }
      // // 如果是纯 base64 字符串，添加 data URI 前缀
      // return {
      //   backgroundImage: `url(data:image/png;base64,${bannerImage})`
      // }
      return {
        backgroundImage: `url("${this.convertUrl(bannerImage)}")`
      }
    }, handleBannerClick (b) {
      if (!b || !b.linkUrl || b.linkUrl === '#') return
      window.open(b.linkUrl, '_blank')
    },
    handleBuy (p) {
      // 跳转到GPU算力购买页面，传递产品参数（含所属顶级分类，便于购买页定位到正确 Tab）
      const regionId = p.regionId || ''
      const skuId = p.id || ''
      const categoryId = this.activeCategoryId || ''
      if (this.isLoggedIn) {
        this.$router.push({
          path: '/shenbeigpuai/control/instance-buy',
          query: { regionId, skuId, categoryId }
        })
      } else {
        this.$router.push({
          path: '/login'
        })
        // 把跳转目标 + 关键 query 也存到 localStorage，
        // 便于其他页（如登录回调、拦截页）取到 portal_redirect 后，
        // 拼上 regionId / skuId / categoryId 一起跳转，避免参数丢失
        localStorage.setItem('portal_redirect', '/shenbeigpuai/control/instance-buy')
        localStorage.setItem('portal_redirect_regionId', regionId)
        localStorage.setItem('portal_redirect_skuId', skuId)
        localStorage.setItem('portal_redirect_categoryId', categoryId)
      }
    },
    handleNav (key, item) {
      if (key === 'gpu') {
        if (this.isLoggedIn) {
          this.$router.push({
            path: '/shenbeigpuai/control/instance-buy'
          })
        } else {
          this.$router.push({
            path: '/login'
          })
          localStorage.setItem('portal_redirect', '/shenbeigpuai/control/instance-buy')
        }
        return
        // if (this.isLoggedIn) {
        //   if (item && item.linkUrl) {
        //     this.$router.push({
        //       path: item.linkUrl
        //     })
        //   } else {
        //     this.$router.push({
        //       path: '/shenbeigpuai/control/instance-buy'
        //     })
        //   }
        // } else {
        //   // 未登录跳到登录页前，记录当前 portal 路径，登录成功后回跳
        //   try { localStorage.setItem('portal_redirect', this.$route.fullPath) } catch (e) { }
        //   this.$router.push({
        //     path: '/login'
        //   })
        // }
        // return
      }
      if (key === 'api') {
        // API调用跳转到API调用页面
        this.$router.push({
          path: '/shenbeigpuai/portal/api'
        })
        return
      }
      if (key === 'help') {
        // 帮助中心跳转到帮助中心页面
        this.$router.push({
          path: '/shenbeigpuai/portal/help'
        })
        return
      }
      if (key === 'about') {
        // 关于我们跳转到关于我们页面
        this.$router.push({
          path: '/shenbeigpuai/portal/about'
        })
        return
      }
      if (key === 'home') {
        // 首页，滚动到顶部
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
        this.activeTab = key
        return
      }
      // partner和cloud在首页有对应的section，滚动到对应位置
      const el = this.$refs[key]
      if (!el || !el.offsetTop) {
        this.activeTab = key
        return
      }
      this.activeTab = key
      const top = el.offsetTop - 70
      window.scrollTo({
        top,
        behavior: 'smooth'
      })
    }, handleScroll () {
      const sections = ['home', 'gpu', 'product', 'partner']
      const y = window.pageYOffset || document.documentElement.scrollTop || 0
      const base = y + 80

      for (let i = sections.length - 1; i >= 0; i--) {
        const k = sections[i]
        const el = this.$refs[k]
        if (!el) continue
        if (el.offsetTop <= base) {
          if (this.activeTab !== k) this.activeTab = k
          return
        }
      }
      this.activeTab = 'home'
    }, handleIntroItemClick (type) {
      this.$Message && this.$Message.info(`${type === 'cpu' ? 'CPU计算' : '算力服务器'}功能开发中`)
    }, handleLogin () {
      // 跳转到登录页前，先记录当前 portal 完整路径（含 query），登录成功后回跳
      try { localStorage.setItem('portal_redirect', this.$route.fullPath) } catch (e) { }
      this.$router.push({ path: '/login' })
    },
    handleRegister () {
      this.$router.push({ path: '/shenbeigpuai/portal/reg' })
    },
    getPartnerLogoStyle (partnerName) {
      // 生成一个简单的文本图片data URI
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 60
      const ctx = canvas.getContext('2d')

      // 背景透明
      ctx.clearRect(0, 0, 200, 60)

      // 绘制文字
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(partnerName || '合作伙伴', 100, 30)

      return canvas.toDataURL('image/png')
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
  }, config: {}, provideData: {}, canvasConfig: { "scale": "100", "type": "16-9--2" }
}
</script>
<style scoped lang="less">
.portal-home {
  background: #ffffff;
  // 浏览器放大或窄屏时阻止内容溢出产生横向滚动条
  overflow-x: hidden;
  // 让父级 sysframe 的 overflow:scroll 接管滚动（不要 min-height:100vh，否则会撑破滚动容器）
  height: 100%;
}

.portal-container {
  // 两侧留白随视口宽度变化：
  // - 最小 12px（极窄屏/浏览器放大 200%+ 时也能保留布局不被压垮）
  // - 视口 1280px 时约为 40px（让 pricing 等固定宽度区域在大屏更"撑满"）
  // - 最大 40px（避免内容被拉到屏幕中心但两侧空白过大）
  // 配合 max-width: 1700px + margin: 0 auto 保证整体布局不跑偏
  padding: 0 clamp(12px, 3vw, 40px);
  max-width: 1700px;
  margin: 0 auto;
  box-sizing: border-box;
}

.portal-section {
  width: 100%;
}

.portal-section__header {
  width: 1138px;
  text-align: left;
  margin: 0 auto 40px auto;
}

.portal-section__title {
  font-size: 36px;
  font-weight: 700;
  color: #1d2129;
  line-height: 40px;
  margin: 0 0 12px 0;
}

.portal-section__subtitle {
  font-size: 14px;
  color: #4e5969;
  line-height: 22px;
  margin: 0;
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

.portal-hero {
  background: #0b1b42;
}

.portal-hero__single {
  width: 100%;
  height: 420px;
}

.portal-hero__carousel {
  width: 100%;
  height: 520px;
}

.portal-hero__slide {
  width: 100%;
  height: 420px;
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;
}

.portal-hero__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.portal-hero__content {
  position: absolute;
  /* 左偏移与下方 .portal-container 的内边距保持一致（clamp(12px, 3vw, 40px)），
     保证"立即体验"按钮左缘与"机型配置价格"标题左缘在不同视口下都对齐 */
  left: clamp(12px, 3vw, 40px);
  right: clamp(12px, 3vw, 40px);
  top: 70%;
  /* 不再使用 translate(-50%) 居中，保持左对齐 */
  width: auto;
  max-width: 1138px;
  margin: 0 auto;
  text-align: left;
  box-sizing: border-box;
}

.portal-hero__title {
  font-size: 44px;
  font-weight: 700;
  color: #ffffff;
  line-height: 60px;
  margin-bottom: 16px;
}

.portal-hero__sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 24px;
  margin-bottom: 24px;
}

.portal-hero__btns {
  display: flex;
  gap: 16px;
}

// 立即体验按钮：严格按设计稿参数（95×30，圆角 2px，三色渐变）
.portal-hero__btn {
  display: none !important;
  appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 95px;
  height: 30px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  // 三色渐变 -22.30°(337.70deg)：蓝 → 紫 → 深蓝
  background: linear-gradient(337.70deg, #4657f4 0%, #aa51dc 46.91%, #3c5ccb 100%);
  border-radius: 2px;
  transition: opacity 0.25s ease, transform 0.25s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

// 右上箭头 ↗（白色）
.portal-hero__btn-arrow {
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.portal-hero__btn:hover .portal-hero__btn-arrow {
  transform: translate(2px, -2px);
}

.portal-products {
  padding: 80px 0;
  background: #ffffff;
}

.portal-products__tabs {
  // 宽度 = 3 张卡片 + 2 个 gap = 366*3 + 20*2 = 1138px
  // 整体居中显示，避免右侧过长空白
  width: 1138px;
  max-width: 100%;
  margin: 0 auto 24px;
}

// 分类切换时的 loading / empty 占位（与购买页风格一致）
.portal-products__loading,
.portal-products__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 80px 0;
  font-size: 14px;
  color: #808695;
}

.spin-icon-load {
  animation: spin-icon-load 1s linear infinite;
}

@keyframes spin-icon-load {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 手写 TabBar：等宽均分 + 浅灰底 + 激活态浅紫底 + 圆角，与设计图一致 */
.pp-tabbar {
  display: flex;
  background: #f3f4f8;
  border-radius: 10px;
  padding: 10px;
  gap: 4px;
  margin-bottom: 24px;
}

.pp-tab {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #6a7891;
  padding: 14px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: color .2s ease, background .2s ease, box-shadow .2s ease;
  user-select: none;
}

.pp-tab:hover {
  color: #1456e6;
}

.pp-tab.is-active {
  background: #e8ebfb;
  color: #1456e6;
  box-shadow: 0 1px 3px rgba(20, 86, 230, .08);
}

.portal-products__grid {
  display: grid;
  // 固定 3 列 × 366px，与上方 Tab 容器宽度一致（1138px）
  // 容器本身居中显示
  grid-template-columns: repeat(3, 366px);
  gap: 20px;
  width: 1138px;
  max-width: 100%;
  margin: 0 auto;
  justify-content: start;
}

// 卡片：白底圆角 + 右上角柔光渐变 + 底部浅渐变条（固定宽度 366，最小高度 208，按设计稿圆角 8px）
.portal-product-card {
  position: relative;
  width: 366px;
  min-height: 228px;
  background: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

// 右上角柔光渐变装饰（设计稿：#DAE6FF + 30px 模糊）
.portal-product-card__decoration {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at center, #dae6ff 0%, rgba(218, 230, 255, 0) 70%);
  filter: blur(30px);
  pointer-events: none;
  z-index: 0;
}

// 推荐卡片：渐变稍强 + 浅阴影
.portal-product-card.is-recommended {
  border-color: #c9d6ff;
  box-shadow: 0 4px 14px rgba(94, 114, 255, 0.12);
}

.portal-product-card.is-recommended .portal-product-card__decoration {
  background: radial-gradient(circle at center, rgba(120, 140, 255, 0.45) 0%, rgba(120, 140, 255, 0) 70%);
}

// 标题：纯文本，左上角（按设计稿：13px 黑色 bold）
.portal-product-card__title {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 700;
  color: #000000;
  line-height: 18px;
  padding: 14px 18px 8px;
}

// 规格区：2x2 网格
.portal-product-card__specs {
  position: relative;
  z-index: 1;
  padding: 0 18px;
}

.portal-product-card__specs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f1f3;
}

.portal-product-card__specs-row:last-child {
  border-bottom: 1px solid #f0f1f3;
}

.portal-product-card__spec-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.portal-product-card__spec-label {
  font-size: 12px;
  color: #86909c;
  line-height: 16px;
}

.portal-product-card__spec-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  // 增大行高，给 cpuName / gpuName 等长字段换行预留空间
  line-height: 22px;
  // 至少保留单行高度，最多2 行（避免过长字段撑破卡片）
  min-height: 22px;
  max-height: 44px;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 底部：长按钮（固定 330×34，方便自定义 margin / 尺寸）
.portal-product-card__footer {
  position: relative;
  z-index: 1;
  // 重置 button 默认样式
  appearance: none;
  border: none;
  outline: none;
  // 尺寸与边距（按设计稿：330×34，左右18px）
  width: 330px;
  height: 34px;
  margin: 10px auto 17px;
  padding: 0 16px;
  border-radius: 6px;
  // 布局
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-family: inherit;
  // 按设计稿矩形 48：渐变 251° 浅紫 → 浅蓝
  background: linear-gradient(251deg, #f7ecff 0%, #e9f0ff 100%);
  // 按设计稿：阴影 0 3px 6px rgba(159,159,159,.16)
  box-shadow: 0 3px 6px rgba(159, 159, 159, 0.16);
  cursor: pointer;
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

// 普通卡片 hover：按设计稿 hover 状态，深紫 → 深蓝
.portal-product-card__footer:hover {
  background: linear-gradient(251deg, #b750d8 0%, #4855f5 100%);
  box-shadow: 0 6px 14px rgba(159, 159, 159, 0.24);
}

// 推荐卡片：按设计稿矩形 48 实色紫蓝渐变 + 白字 + 阴影
.portal-product-card.is-recommended .portal-product-card__footer {
  background: linear-gradient(251.30deg, #b750d8 0%, #4855f5 100%);
  box-shadow: 0 3px 6px rgba(159, 159, 159, 0.16);

  &:hover {
    background: linear-gradient(251.30deg, #a644cc 0%, #3a48e8 100%);
    box-shadow: 0 6px 14px rgba(72, 85, 245, 0.35);
  }
}

// 价格区
.portal-product-card__price {
  display: flex;
  align-items: baseline;
  flex: 1;
  min-width: 0;
  transition: color 0.25s ease;
}

// 普通卡片默认：货币符号 + 价格数字 橙色
.portal-product-card__price-currency {
  font-size: 13px;
  font-weight: 600;
  color: #ff7d00;
  margin-right: 2px;
  transition: color 0.25s ease;
}

.portal-product-card__price-num {
  font-size: 18px;
  font-weight: 700;
  color: #ff7d00;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.25s ease;
}

// 单位 /小时 灰色
.portal-product-card__price-unit {
  font-size: 12px;
  color: #86909c;
  line-height: 18px;
  margin-left: 2px;
  flex-shrink: 0;
  transition: color 0.25s ease;
}

// 「立即购买」文字标签（默认黑色）
.portal-product-card__buy {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  transition: color 0.25s ease;
}

// 右上箭头 ↗
.portal-product-card__arrow {
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

// 普通卡片 hover：背景变深紫蓝，所有文字统一变白色
.portal-product-card__footer:hover {

  .portal-product-card__price-currency,
  .portal-product-card__price-num,
  .portal-product-card__price-unit,
  .portal-product-card__buy {
    color: #ffffff;
  }
}

// 底部按钮 hover：箭头向右滑
.portal-product-card__footer:hover .portal-product-card__arrow {
  transform: translate(4px, -4px);
}

// 推荐卡片：价格、立即购买 全部为白色
.portal-product-card.is-recommended .portal-product-card__price-currency,
.portal-product-card.is-recommended .portal-product-card__price-num,
.portal-product-card.is-recommended .portal-product-card__price-unit,
.portal-product-card.is-recommended .portal-product-card__buy {
  color: #ffffff;
}

// 推荐卡片 hover：保持白色
.portal-product-card.is-recommended .portal-product-card__footer:hover {

  .portal-product-card__price-currency,
  .portal-product-card__price-num,
  .portal-product-card__price-unit {
    color: #ffffff;
  }

  .portal-product-card__buy {
    color: #ffffff;
    opacity: 0.9;
  }
}

// 悬停：整体上浮 + 阴影
.portal-product-card:hover {
  border-color: #c9d6ff;
  box-shadow: 0 8px 24px rgba(94, 114, 255, 0.18);
  transform: translateY(-2px);
}

.portal-intros {
  // 减小上下内边距，让整体高度更紧凑
  padding: 56px 0;
  background: #f7f8fa;
}

.portal-intros__content {
  // 与 pricing 区域一致：固定 1138px，整体水平居中
  width: 1138px;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  // 左右两侧高度一致：右侧图片决定整体高度，左侧自动拉伸对齐
  align-items: stretch;
}

.custom-collapse {
  flex: 0.5;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-width: 400px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.custom-collapse-item {
  border: none;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &.is-active {
    .custom-collapse-header {
      background: #e8f3ff;
      color: #165dff;
    }
  }
}

.custom-collapse-header {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  border: none;
  transition: all 0.3s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    background: #e8f3ff;
  }

  .custom-collapse-icon {
    color: #165dff;
    font-size: 16px;
    transition: transform 0.3s ease;
  }
}

.custom-collapse-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-open {
    grid-template-rows: 1fr;
  }
}

.custom-collapse-content {
  overflow: hidden;
  min-height: 0;

  &>* {
    padding: 14px 16px;
    // 限制展开内容的最大高度，超过部分可滚动
    max-height: 260px;
    overflow-y: auto;
  }
}

.portal-collapse__title {
  // font-size: 16px;
  // font-weight: 600;
  // color: #1d2129;
}

.portal-collapse__content {
  padding: 20px;
}

.portal-collapse__desc {
  font-size: 16px;
  color: #4e5969;
  line-height: 30px;
  margin-bottom: 12px;

  &:last-child {
    height: 160px;
    overflow-y: auto;
    margin-bottom: 0;
  }

  // 富文本中的图片、表格等元素不允许撑出容器，并按容器宽高进行缩放
  /deep/ img,
  /deep/ video,
  /deep/ iframe,
  /deep/ table {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  /deep/ img {
    display: block;
    margin: 0 auto;
    width: 100%;
    height: 100%;
  }
}

.content-height {
  // 显式 100% 撑满父容器，配合 flex:1 确保拉伸生效
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  // 水平垂直居中显示内容
  display: flex;
  align-items: center;
  justify-content: center;

  /deep/p {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
      object-fit: inherit;
    }
  }

  // 富文本里 p/div 默认外边距会干扰高度计算
  >p,
  >div {
    margin: 0;
    max-width: 100%;
    max-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

&:last-child {
  margin-bottom: 0;
}


.portal-intros__right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.portal-intro-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.portal-intro-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.portal-intro-feature {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
}

.portal-intro-feature--reverse {
  flex-direction: row-reverse;
}

.portal-intro-feature--env {
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  margin-top: 8px;
}

.portal-intro-feature__icon {
  width: 48px;
  height: 48px;
  background: #e6f7ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #165dff;
  flex-shrink: 0;
}

.portal-intro-feature__content {
  flex: 1;
}

.portal-intro-feature__title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 24px;
  margin-bottom: 8px;
}

.portal-intro-feature__desc {
  font-size: 13px;
  color: #4e5969;
  line-height: 20px;
}

.portal-intro-feature__envs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  width: 100%;
}

.portal-intro-feature__env-tag {
  display: inline-block;
  padding: 4px 12px;
  background: #f7f8fa;
  border-radius: 4px;
  font-size: 12px;
  color: #4e5969;
  line-height: 20px;
}

.portal-partners {
  // 按首页——0823 设计稿：上下内边距适中，背景图全幅
  padding: 56px 0 64px;
  background: url('~@/assets/file/shenbeigpuai/image/partner.png') center/cover no-repeat;

  // 标题文字改为白色
  .portal-section__title {
    color: #ffffff;
    font-size: 36px;
  }

  .portal-section__subtitle {
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
  }
}

.portal-partners__panel {
  background: url('~@/assets/file/shenbeigpuai/image/partner.png') center/cover no-repeat;
  width: calc(100vw - 10px);
  margin-left: calc(-50vw + 50%);
  padding: 70px 200px 70px 200px;
}

// 合作伙伴网格：宽度与标题容器对齐（与 .portal-section__header 同宽 1138px）
.portal-partners__grid {
  margin: 36px auto 0;
  width: 1138px;
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
}

// 合作伙伴卡片：按设计稿矩形 54（约 220×130，圆角4，白底 + 浅色虚线描边）
.portal-partner {
  width: 100%;
  justify-self: stretch;
  aspect-ratio: 220 / 130;
  min-height: 96px;
  border-radius: 4px;
  background: #ffffff;
  // 设计稿：浅蓝紫色虚线描边
  border: 1px dashed rgba(67, 98, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    border-color: rgba(67, 98, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(67, 98, 255, 0.12);
  }
}

.portal-partner__logo {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

@media (max-width: 900px) {
  .portal-partners__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

@media (max-width: 600px) {
  .portal-partners__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .portal-partner {
    aspect-ratio: 4 / 3;
    min-height: 72px;
    padding: 10px;
  }
}

.portal-partner__name {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.portal-cloud {
  padding: 80px 0;
  background: #f7f8fa;
}

.portal-cloud__list {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.portal-cloud-item {
  display: flex;
  gap: 40px;
  align-items: center;
}

.portal-cloud-item.is-reverse {
  flex-direction: row-reverse;
}

.portal-cloud-item__img {
  width: 520px;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #e5e6eb;
}

.portal-cloud-item__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portal-cloud-item__content {
  flex: 1;
}

.portal-cloud-item__title {
  font-size: 22px;
  font-weight: 600;
  color: #1d2129;
  line-height: 32px;
  margin-bottom: 12px;
}

.portal-cloud-item__desc {
  font-size: 14px;
  color: #4e5969;
  line-height: 24px;
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
</style>