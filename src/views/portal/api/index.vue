<template>
  <div class="portal-home">
    <!-- Header - 与portal/index.vue相同 -->
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

    <!-- API调用页面内容 -->
    <section class="portal-section portal-api-call">
      <!-- API Banner图片区域 -->
      <!-- <div class="api-banner">
        <div class="api-banner__inner">
          <div class="api-banner__title">模型广场</div>
          <div class="api-banner__subtitle">简易高效的模型，轻松上手，助力开发团队高效开发</div>
        </div>
      </div> -->
      <!-- Token Plan 相关功能 -->
      <div class="token-plan">
        <!-- ========== 1. 套餐标准 ========== -->
        <section class="tp-section">
          <div class="portal-container" style="max-width: 1500px;">
            <!-- 图片下方文字 -->
            <div class="model-showcase-banner__text">
              <h2 class="model-showcase-banner__title">Token Plan 套餐标准</h2>
              <p class="model-showcase-banner__subtitle">切换计费周期查看对应价格与限制。所有套餐按「调用次数」计量，调用上限以日/周滚动窗口约束，防止突发流量击穿服务
              </p>
            </div>

            <!-- 计费周期切换 -->
            <div class="tp-period-toggle">
              <button v-for="p in tokenPlan.periods" :key="p.id" type="button"
                :class="['tp-period-btn', { active: tokenPlan.activePeriod === p.id }]"
                @click="setTokenPlanPeriod(p.id)">
                {{ p.label }}
              </button>
            </div>

            <!-- 套餐卡片 -->
            <div class="tp-plans">
              <div v-for="plan in tokenPlanCards" :key="plan.id" class="tp-plan"
                :class="{ 'tp-plan--featured': plan.isHot === '1' }">
                <div v-if="plan.isHot === '1'" class="tp-plan__ribbon">最受欢迎</div>
                <div class="tp-plan__name">{{ plan.levelLabel }}</div>
                <!-- <div class="tp-plan__tag">{{ plan.tag }}</div> -->
                <div class="tp-plan__tag">{{ plan.testlabelprice }} CPC/月</div>
                <div class="tp-plan__price">
                  <span class="tp-plan__cur">¥</span>
                  <span class="tp-plan__amt">{{ formatMoney(plan.price) }}</span>
                  <span class="tp-plan__per">/ {{ getActivePeriodUnit() }}</span>
                </div>
                <div class="tp-divider"></div>
                <div class="tp-feat">
                  <span class="tp-feat__ic">✓</span>
                  <!-- <span class="tp-feat__lbl">日限制</span>
                  <span class="tp-feat__val">{{ formatMoney(plan.daily) }} <small>积分</small></span> -->
                  <span class="tp-feat__lbl">{{ plan.testlabel.tag1 }}</span>
                </div>
                <div class="tp-feat">
                  <span class="tp-feat__ic">✓</span>
                  <!-- <span class="tp-feat__lbl">周限制</span>
                  <span class="tp-feat__val">{{ formatMoney(plan.weekly) }} <small>积分</small></span> -->
                  <span class="tp-feat__lbl">{{ plan.testlabel.tag2 }}</span>
                </div>
                <div class="tp-feat">
                  <span class="tp-feat__ic">✓</span>
                  <!-- <span class="tp-feat__lbl">月限制</span>
                  <span class="tp-feat__val">{{ formatMoney(plan.monthly) }} <small>积分</small></span> -->
                  <span class="tp-feat__lbl">{{ plan.testlabel.tag3 }}</span>
                </div>
                <div class="tp-feat">
                  <span class="tp-feat__ic">✓</span>
                  <!-- <span class="tp-feat__lbl">API Key</span>
                  <span class="tp-feat__val">支付立即生成</span> -->
                  <span class="tp-feat__lbl">{{ plan.testlabel.tag4 }}</span>
                </div>
                <div class="tp-plan__cta">
                  <Button class="portal-token-card__buy portal-token-card__buy--ghost" type="primary" long
                    @click="goBuyTokenPlan(plan)">
                    <div style="display: flex;align-items: center;">
                      <span class="portal-token-card__buy-text">立即购买</span>
                      <svg class="portal-product-card__arrow" style="margin-left: 160px;" viewBox="0 0 24 24" width="14"
                        height="14" aria-hidden="true">
                        <path d="M6 18L18 6M9 6h9v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" fill="none" />
                      </svg>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- ========== 4. 使用说明 ========== -->
        <section class="tp-section">
          <div class="portal-container" style="max-width: 1138px;">
            <!-- 图片下方文字 -->
            <div class="model-showcase-banner__text">
              <h2 class="model-showcase-banner__title">使用说明</h2>
              <p class="model-showcase-banner__subtitle">四步即可接入：选购套餐 → 支付 → 获取 API Key → 在请求头携带 Key 发起调用</p>
            </div>
            <div class="tp-steps">
              <div v-for="s in tokenPlan.usageSteps" :key="s.n" class="tp-step">
                <div class="tp-step__n">{{ s.n }}</div>
                <h4 class="tp-step__title">{{ s.title }}</h4>
                <p class="tp-step__desc">{{ s.desc }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="portal-container">
        <!-- API介绍内容区域 -->
        <div class="api-intro-section">
          <div class="api-intro__content">
            <h1 class="api-intro__title">{{ apiIntro.title }}</h1>
            <p class="api-intro__subtitle">{{ apiIntro.subtitle }}</p>
          </div>
        </div>
        <!-- 手风琴图片展示区域 -->
        <div class="accordion-gallery">
          <div v-for="(item, index) in accordionItems" :key="index" class="accordion-item"
            :class="{ 'active': activeAccordionIndex === index }" :style="getAccordionItemStyle(index)"
            @click="handleAccordionClick(index)">
            <div class="accordion-item__bg" :style="{ backgroundImage: `url(${item.image})` }"></div>
            <div class="accordion-item__overlay"></div>
            <div class="accordion-item__content">
              <h3 class="accordion-item__title">{{ item.title }}</h3>
              <p v-if="activeAccordionIndex === index" class="accordion-item__desc">{{ item.content }}</p>
            </div>
          </div>
        </div>

        <!-- 图片下方文字 -->
        <!-- <div class="model-showcase-banner__text">
          <h2 class="model-showcase-banner__title">模型展示</h2>
          <p class="model-showcase-banner__subtitle">弹性计费零成本，使用弹性GPU部署让成本100%只用于业务本身，无惧算力空闲压力</p>
        </div> -->

        <!-- 模型展示区域 -->
        <div class="model-showcase" style="display: none;">
          <!-- 模型列表 -->
          <div class="model-list">
            <div v-for="model in filteredModels" :key="model.id" class="model-card" @click="handleModelClick(model)">
              <!-- New标签 - 红色三角形 -->
              <div v-if="model.isNew" class="model-card__new-badge">
                <span class="model-card__new-text">New</span>
              </div>

              <!-- 顶部：图标、标题同一行 -->
              <div class="model-card__header">
                <!-- 模型图片/图标 -->
                <div class="model-card__media">
                  <img v-if="model.image" :src="model.image" :alt="model.name" class="model-card__image" />
                  <div v-else class="model-card__icon" :style="{ backgroundColor: model.iconColor || '#8B5CF6' }"></div>
                </div>

                <!-- 标题 -->
                <div class="model-card__title-group">
                  <h3 class="model-card__name">{{ model.name }}</h3>
                  <span class="model-card__platform" v-if="model.platformLabel || model.platform">{{ model.platformLabel
                    ||
                    model.platform }}</span>
                </div>
              </div>
              <p class="model-card__subtitle">{{ model.title }}</p>
              <!-- 描述（hover 浮层显示完整内容） -->
              <div class="model-card__description-wrap">
                <p class="model-card__description">{{ model.description }}</p>
                <div v-if="model.description" class="model-card__description-popover">{{ model.description }}</div>
              </div>

              <!-- 属性 chips -->
              <div class="model-card__chips"
                v-if="model.paramCount || model.contextLength || model.modelArch || model.isMultimodal === '1' || model.supportsPrefix === '1' || model.supportsTools === '1'">
                <span v-if="model.paramCount" class="chip chip--blue">{{ model.paramCount }}</span>
                <span v-if="model.contextLength" class="chip chip--green">{{ model.contextLength }}</span>
                <span v-if="model.modelArch" class="chip">{{ model.modelArch.toUpperCase() }}</span>
                <span v-if="model.isMultimodal === '1'" class="chip chip--purple">多模态</span>
                <span v-if="model.supportsPrefix === '1'" class="chip chip--cyan">前缀缓存</span>
                <span v-if="model.supportsTools === '1'" class="chip chip--orange">工具调用</span>
              </div>

              <!-- 分割线 -->
              <div class="model-card__divider"></div>
              <div class="model-card__pricing">
                <div class="model-card__price-item">
                  <span class="model-card__price-label">输入：</span>
                  <span class="model-card__price-value">{{ model.inputPriceDisplayText || '--' }}</span>
                </div>
                <div class="model-card__price-item">
                  <span class="model-card__price-label">输出：</span>
                  <span class="model-card__price-value">{{ model.outputPriceDisplayText || '--' }}</span>
                </div>
                <div class="model-card__price-item" v-if="hasCachePrice(model)">
                  <span class="model-card__price-label">缓存：</span>
                  <span class="model-card__price-value">
                    <span v-if="model.cacheReadPrice !== null && model.cacheReadPrice !== undefined">
                      {{ model.cacheReadPriceDisplayText }}
                    </span>
                    <span
                      v-if="model.cacheReadPrice !== null && model.cacheReadPrice !== undefined && model.cacheWritePrice !== null && model.cacheWritePrice !== undefined">/</span>
                    <span v-if="model.cacheWritePrice !== null && model.cacheWritePrice !== undefined">
                      {{ model.cacheWritePriceDisplayText }}
                    </span>
                  </span>
                </div>
                <div class="model-card__price-item" v-if="hasMultimodalPrice(model)">
                  <span class="model-card__price-label">多模态：</span>
                  <span class="model-card__price-value">
                    <span
                      v-if="model.imageInputPrice !== null && model.imageInputPrice !== undefined && model.imageInputPrice !== 0">
                      {{ model.imageInputPriceDisplayText }}
                    </span>
                    <span
                      v-if="(model.imageInputPrice !== null && model.imageInputPrice !== 0) && (model.imageOutputPrice !== null && model.imageOutputPrice !== 0)">
                      /
                    </span>
                    <span
                      v-if="model.imageOutputPrice !== null && model.imageOutputPrice !== undefined && model.imageOutputPrice !== 0">
                      {{ model.imageOutputPriceDisplayText }}
                    </span>
                    <span v-if="hasAudioPrice(model) && hasImagePrice(model)">/</span>
                    <span
                      v-if="model.audioInputPrice !== null && model.audioInputPrice !== undefined && model.audioInputPrice !== 0">
                      {{ model.audioInputPriceDisplayText }}
                    </span>
                    <span
                      v-if="(model.audioInputPrice !== null && model.audioInputPrice !== 0) && (model.audioOutputPrice !== null && model.audioOutputPrice !== 0)">
                      /
                    </span>
                    <span
                      v-if="model.audioOutputPrice !== null && model.audioOutputPrice !== undefined && model.audioOutputPrice !== 0">
                      {{ model.audioOutputPriceDisplayText }}
                    </span>
                  </span>
                </div>
                <div class="model-card__price-item"
                  v-if="model.perRequestPrice !== null && model.perRequestPrice !== undefined && model.perRequestPrice !== 0">
                  <span class="model-card__price-label">每次请求：</span>
                  <span class="model-card__price-value">{{ model.perRequestPriceDisplayText || '--' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="model-pagination" v-if="filteredModels.length > 0">
            <Page :current="currentPage" :total="totalModels" :page-size="pageSize" show-total show-elevator
              @on-change="handlePageChange" />
          </div>
        </div>
      </div>
    </section>

    <!-- 模型详情抽屉 -->
    <Drawer v-model="drawerVisible" width="640" :closable="false" class-name="model-detail-drawer">
      <div v-if="currentModel" class="model-detail">
        <!-- 头部信息 -->
        <div class="model-detail__header">
          <div class="header-main">
            <div class="icon-box">
              <img v-if="currentModel.image" :src="currentModel.image" :alt="currentModel.name" />
              <Icon v-else type="md-planet" size="48" color="#2d8cf0" />
            </div>
            <div class="title-box">
              <div class="title-row">
                <h2>{{ currentModel.name }}</h2>
                <Tag v-if="currentModel.status === 'pro'" color="warning" size="small" style="margin-left: 8px">Pro
                </Tag>
                <Tag v-else-if="currentModel.status === 'deprecated'" color="default" size="small"
                  style="margin-left: 8px">
                  已弃用</Tag>
                <Tag v-else-if="currentModel.isNew" color="error" size="small" style="margin-left: 8px">New</Tag>
              </div>
              <p class="subtitle">模型标识：{{ currentModel.modelCode || '-' }}</p>
            </div>
          </div>
          <div class="header-desc">
            {{ currentModel.description }}
          </div>
        </div>

        <Divider />

        <Tabs v-model="detailTab" class="model-detail-tabs">
          <TabPane label="模型信息" name="info">
            <div class="model-detail__section">
              <ul class="info-list">
                <li>
                  <span class="label">平台</span>
                  <span class="value">{{ currentModel.platformLabel || currentModel.platform || '-' }}</span>
                </li>
                <li v-if="currentModel.modelArch">
                  <span class="label">架构</span>
                  <span class="value">{{ archLabel(currentModel.modelArch) }}</span>
                </li>
                <li v-if="currentModel.paramCount">
                  <span class="label">参数规模</span>
                  <span class="value">{{ currentModel.paramCount }}</span>
                </li>
                <li v-if="currentModel.contextLength">
                  <span class="label">上下文长度</span>
                  <span class="value">{{ currentModel.contextLength }}</span>
                </li>
                <li v-if="currentModel.releaseDate">
                  <span class="label">发布日期</span>
                  <span class="value">{{ formatDate(currentModel.releaseDate) }}</span>
                </li>
                <li v-if="currentModel.status">
                  <span class="label">状态</span>
                  <span class="value">{{ statusLabel(currentModel.status) }}</span>
                </li>
                <li>
                  <span class="label">能力</span>
                  <span class="value value--chips">
                    <span v-if="currentModel.isMultimodal === '1'" class="detail-chip detail-chip--purple">多模态</span>
                    <span v-if="currentModel.supportsPrefix === '1'" class="detail-chip detail-chip--cyan">前缀缓存</span>
                    <span v-if="currentModel.supportsTools === '1'" class="detail-chip detail-chip--orange">工具调用</span>
                    <span
                      v-if="currentModel.isMultimodal !== '1' && currentModel.supportsPrefix !== '1' && currentModel.supportsTools !== '1'"
                      style="color:#909399;">-</span>
                  </span>
                </li>
              </ul>
            </div>
          </TabPane>

          <TabPane label="计费详情" name="price">
            <div class="model-detail__section">
              <ul class="info-list">
                <li>
                  <span class="label">计费单位</span>
                  <span class="value">{{ currentModel.priceUnitDisplayText || currentModel.priceUnitLabel ||
                    currentModel.priceUnit || '-' }}</span>
                </li>
                <li>
                  <span class="label">货币</span>
                  <span class="value">{{ currentModel.currencyDisplayText || currentModel.currencyLabel ||
                    currentModel.currency || '-' }}</span>
                </li>
                <li>
                  <span class="label">输入</span>
                  <span class="value price-val">{{ currentModel.inputPriceDisplayText || '-' }}</span>
                </li>
                <li>
                  <span class="label">输出</span>
                  <span class="value price-val">{{ currentModel.outputPriceDisplayText || '-' }}</span>
                </li>
                <li v-if="currentModel.cacheReadPrice !== null && currentModel.cacheReadPrice !== undefined">
                  <span class="label">缓存读取</span>
                  <span class="value price-val">{{ currentModel.cacheReadPriceDisplayText || '-' }}</span>
                </li>
                <li v-if="currentModel.cacheWritePrice !== null && currentModel.cacheWritePrice !== undefined">
                  <span class="label">缓存写入</span>
                  <span class="value price-val">{{ currentModel.cacheWritePriceDisplayText || '-' }}</span>
                </li>
                <li
                  v-if="currentModel.imageInputPrice !== null && currentModel.imageInputPrice !== undefined && currentModel.imageInputPrice !== currentModel.inputPrice">
                  <span class="label">图像输入</span>
                  <span class="value price-val">{{ currentModel.imageInputPriceDisplayText || '-' }}</span>
                </li>
                <li
                  v-if="currentModel.imageOutputPrice !== null && currentModel.imageOutputPrice !== undefined && currentModel.imageOutputPrice !== currentModel.outputPrice">
                  <span class="label">图像输出</span>
                  <span class="value price-val">{{ currentModel.imageOutputPriceDisplayText || '-' }}</span>
                </li>
                <li
                  v-if="currentModel.audioInputPrice !== null && currentModel.audioInputPrice !== undefined && currentModel.audioInputPrice !== 0">
                  <span class="label">音频输入</span>
                  <span class="value price-val">{{ currentModel.audioInputPriceDisplayText || '-' }}</span>
                </li>
                <li
                  v-if="currentModel.audioOutputPrice !== null && currentModel.audioOutputPrice !== undefined && currentModel.audioOutputPrice !== 0">
                  <span class="label">音频输出</span>
                  <span class="value price-val">{{ currentModel.audioOutputPriceDisplayText || '-' }}</span>
                </li>
                <li
                  v-if="currentModel.perRequestPrice !== null && currentModel.perRequestPrice !== undefined && currentModel.perRequestPrice !== 0">
                  <span class="label">每次请求</span>
                  <span class="value price-val">{{ currentModel.perRequestPriceDisplayText || '-' }}</span>
                </li>
              </ul>
            </div>
          </TabPane>

          <TabPane label="接入说明" name="api">
            <div class="model-detail__section">
              <div class="doc-intro">
                <p>通过 OpenAI 或 Anthropic 兼容接口调用本模型，baseUrl 为 <code>http://api.power.xjit.com/v1</code>，apiKey
                  请在控制台「API 密钥」页面创建并妥善保管。</p>
              </div>
              <ul class="info-list">
                <li>
                  <span class="label">鉴权方式</span>
                  <span class="value">HTTP Header：<code>Authorization: Bearer &lt;YOUR_API_KEY&gt;</code></span>
                </li>
                <li>
                  <span class="label">限流</span>
                  <span class="value">单 key 默认 60 次/秒，超出返回 429；按 token 维度另有限流</span>
                </li>
                <li>
                  <span class="label">错误码</span>
                  <span class="value">401 鉴权失败 / 403 余额不足 / 429 触发限流 / 5xx 服务异常</span>
                </li>
                <li>
                  <span class="label">模型标识</span>
                  <span class="value value--code">
                    <code>{{ currentModel.modelCode || '-' }}</code>
                    <Icon v-if="currentModel.modelCode" type="md-copy" class="copy-icon"
                      @click="copyText(currentModel.modelCode)" />
                  </span>
                </li>
                <li>
                  <span class="label">支持能力</span>
                  <span class="value value--chips">
                    <span v-if="currentModel.isMultimodal === '1'" class="detail-chip detail-chip--purple">多模态</span>
                    <span v-if="currentModel.supportsPrefix === '1'" class="detail-chip detail-chip--cyan">前缀缓存</span>
                    <span v-if="currentModel.supportsTools === '1'" class="detail-chip detail-chip--orange">工具调用</span>
                    <span
                      v-if="currentModel.isMultimodal !== '1' && currentModel.supportsPrefix !== '1' && currentModel.supportsTools !== '1'"
                      style="color:#909399;">标准文本对话</span>
                  </span>
                </li>
              </ul>
              <div class="code-block">
                <div class="code-block__header">
                  <span>OpenAI 格式 - cURL</span>
                  <Icon type="md-copy" class="copy-icon" @click="copyText(apiDocCurl)" />
                </div>
                <pre><code>{{ apiDocCurl }}</code></pre>
              </div>
              <div class="code-block">
                <div class="code-block__header">
                  <span>OpenAI 格式 - Python</span>
                  <Icon type="md-copy" class="copy-icon" @click="copyText(apiDocPython)" />
                </div>
                <pre><code>{{ apiDocPython }}</code></pre>
              </div>
              <div class="code-block">
                <div class="code-block__header">
                  <span>Anthropic 格式 - cURL</span>
                  <Icon type="md-copy" class="copy-icon" @click="copyText(apiDocCurlClaude)" />
                </div>
                <pre><code>{{ apiDocCurlClaude }}</code></pre>
              </div>
              <div class="code-block">
                <div class="code-block__header">
                  <span>Anthropic 格式 - Python</span>
                  <Icon type="md-copy" class="copy-icon" @click="copyText(apiDocPythonClaude)" />
                </div>
                <pre><code>{{ apiDocPythonClaude }}</code></pre>
              </div>
              <div class="doc-note">
                <p class="doc-note__title">使用说明</p>
                <ul>
                  <li>所有示例中的 <code>&lt;YOUR_API_KEY&gt;</code> 请替换为控制台「API 密钥」页面创建的有效密钥。</li>
                  <li>OpenAI 格式走 <code>/v1/chat/completions</code>，Anthropic 格式走 <code>/v1/messages</code>，多模态请求仅 OpenAI
                    格式支持 <code>image_url</code>。</li>
                  <li>请求体里的 <code>model</code> 字段必须填写本页展示的「模型标识」。</li>
                  <li>计费按「输入 + 输出」实际 token 用量结算，缓存命中的 token 按对应缓存价结算，详见上方「计费详情」Tab。</li>
                  <li>上下文长度（context length）请参考「模型信息」Tab 里的字段，长上下文会触发额外计费。</li>
                </ul>
              </div>
              <div class="doc-action">
                <div class="doc-action__text">
                  <p class="doc-action__title">还没有 API Key？</p>
                  <p class="doc-action__desc">前往「账户管理」页面创建 API Key，并妥善保管。</p>
                </div>
                <Button type="primary" @click="jumpToApiKey">立即前往</Button>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Drawer>

    <!-- 页脚分隔线 -->
    <div class="footer-divider"></div>

    <!-- 页脚 - 与 home/index.vue 保持一致 -->
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
import api1 from '@/assets/file/shenbeigpuai/image/api-1.png'
import api2 from '@/assets/file/shenbeigpuai/image/api-2.png'
import api3 from '@/assets/file/shenbeigpuai/image/api-3.png'
import api4 from '@/assets/file/shenbeigpuai/image/api-4.png'
import api5 from '@/assets/file/shenbeigpuai/image/api-5.png'

export default {
  name: 'api-call',
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
      navTabs: [
        { key: 'home', label: '首页' },
        // { key: 'gpu', label: 'GPU算力' },
        { key: 'api', label: '模型广场' },
        { key: 'help', label: '帮助中心' },
        { key: 'about', label: '关于我们' }
      ],
      activeTab: 'api',
      modelShowcaseImage: '',
      // 手风琴图片数据
      activeAccordionIndex: 0,
      accordionItems: [
        {
          title: '互联网',
          content: '提供高效智能的内容生成与个性化推荐服务，支持快速切换模型加速AI生成速度，优化GPU算力使用效率助力平台突破性能瓶颈，全面提升用户体验与运营效率',
          image: api1
        },
        {
          title: '教育',
          content: '为教育行业提供智能化教学辅助，支持个性化学习路径推荐，智能批改和答疑，提升教学效率和学习体验',
          image: api2
        },
        {
          title: '政务',
          content: '助力政府数字化转型，提供智能客服、文档处理、数据分析等服务，提升政务服务效率和公众满意度',
          image: api3
        },
        {
          title: '智算',
          content: '提供高性能AI算力服务，支持大规模模型训练和推理，满足企业级AI应用需求',
          image: api4
        },
        {
          title: 'AI硬件',
          content: '与AI硬件深度优化，充分发挥GPU、NPU等加速芯片性能，提供极致的AI推理体验',
          image: api5
        }
      ],
      apiIntro: {
        title: '面向不同行业及需求场景，提供灵活的解决方案',
        subtitle: '弹性计费零成本，使用弹性GPU部署让成本100%只用于业务本身，无惧算力空闲压力',
        content: '我们提供丰富的AI模型API接口，支持多种场景应用。通过简单的API调用，即可快速集成AI能力到您的应用中。',
        imageUrl: '',
        requiresLogin: false
      },
      modelSquareIntro: {
        title: '模型广场',
        subtitle: '探索丰富的AI模型资源',
        content: '模型广场汇集了各类优秀的AI模型，包括自然语言处理、计算机视觉、语音识别等多个领域。登录后即可查看完整的模型列表和使用文档。',
        imageUrl: '',
        requiresLogin: true
      },
      models: [],
      searchKeyword: '',
      currentPage: 1,
      pageSize: 12,
      drawerVisible: false,
      currentModel: null,
      detailTab: 'api',
      // ========== Token Plan 模块（套餐标准 / 完整计费矩阵 / 费率倍数 / 使用说明） ==========
      // 当前为假数据占位，后续后端接口就绪后再替换
      tokenPlan: {
        // 当前选中的计费周期（从接口数据动态设置）
        activePeriod: '',
        // 计费周期英文原值 ↔ label 映射（从接口数据动态更新）
        periodLabelMap: {},
        // 套餐档位英文原值 ↔ label 映射（从接口数据动态更新）
        levelLabelMap: { standard: '标准版', professional: '专业版', ultimate: '旗舰版' },
        // 后端返回的分组/套餐原始列表（listSub2ApiGroupPage 返回的 results 数组）
        // 每条形如 { id, rateMultiplier, dailyLimitUsd, weeklyLimitUsd, monthlyLimitUsd,
        //              tokenplanPrice, tokenplanBillingCycle, tokenplanLevel,
        //              tokenplanBillingCycleLabel, tokenplanLevelLabel }
        groups: [],
        // 计费周期配置（从接口数据动态生成）
        periods: [],
        // 计费周期单位映射
        periodUnitMap: {
          monthly: '月',
          quarterly: '季',
          yearly: '年'
        },
        // 费率倍数（按次调用，与所选套餐无关）
        rateTiers: [
          { name: 'Lite 轻量', scene: '文本分类 · Embedding · 简单补全', mult: 0.5, consume: '0.5 次 / 调用', pillClass: 'rate-pill--lite' },
          { name: 'Standard 标准', scene: '通用对话 · 摘要 · 翻译', mult: 1.0, consume: '1.0 次 / 调用', pillClass: 'rate-pill--std' },
          { name: 'Pro 高级', scene: '复杂推理 · 代码生成 · Agent', mult: 2.0, consume: '2.0 次 / 调用', pillClass: 'rate-pill--pro' },
          { name: 'Max 旗舰', scene: '多模态 · 超长上下文 · 最强能力', mult: 5.0, consume: '5.0 次 / 调用', pillClass: 'rate-pill--max' }
        ],
        // 使用说明：四步接入
        usageSteps: [
          { n: 1, title: '选择套餐', desc: '按月 / 季 / 年与版本组合，确认调用限制。' },
          { n: 2, title: '登录并支付', desc: '仅登录后可支付，支持平台余额或微信支付。' },
          { n: 3, title: '获取 API Key', desc: '支付成功即时生成 Key，在控制台可随时查看与重置。' },
          { n: 4, title: '发起调用', desc: '请求头携带 Key，按模型档位 × 倍数扣减次数。' }
        ],
        // 使用说明：示例代码（纯文本展示）
        usageCode: '# 在请求头携带 API Key，model 决定费率倍数\ncurl https://api.your-platform.com/v1/chat \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "standard",\n    "messages": [{"role":"user","content":"你好"}]\n  }\''
      }
    }
  },
  created () {
    this.fetchApiData()
    this.fetchFooter()
    this.fetchTokenPlans()
    if (this.isLoggedIn) {
      this.getUserPhoto()
    }
    // 进入 portal 页面时记录当前完整路径，供登录成功后回跳
    try { localStorage.setItem('portal_redirect', this.$route.fullPath) } catch (e) { }
  },
  computed: {
    // Token Plan 卡片：按 tokenplanLevel 匹配当前 activePeriod 的数据
    // 用于"套餐标准"模块的套餐卡片 × 当前周期
    tokenPlanCards () {
      const groups = (this.tokenPlan && this.tokenPlan.groups) || []
      const activePeriod = this.tokenPlan.activePeriod
      // 按 level 聚合（key 用英文 tokenplanLevel）
      const map = {}
      groups.forEach(g => {
        if (!g || !g.tokenplanLevel || !g.tokenplanBillingCycle) return
        if (g.tokenplanBillingCycle === activePeriod) {
          map[g.tokenplanLevel] = g
        }
      })

      // 从接口数据中提取所有level并按顺序排列（优先用固定顺序：standard/professional/ultimate，没有的话按接口返回顺序）
      const fixedOrder = ['standard', 'professional', 'ultimate']
      const levelInData = []
      groups.forEach(g => {
        if (g && g.tokenplanLevel && !levelInData.includes(g.tokenplanLevel)) {
          levelInData.push(g.tokenplanLevel)
        }
      })
      // 合并顺序：先fixedOrder中存在的，再追加levelInData中不在fixedOrder中的
      const order = []
      fixedOrder.forEach(lv => {
        if (levelInData.includes(lv)) {
          order.push(lv)
        }
      })
      levelInData.forEach(lv => {
        if (!fixedOrder.includes(lv)) {
          order.push(lv)
        }
      })

      const orderWord = ['个人开发者与轻量业务验证', '成长团队与生产级稳定调用', '企业高并发与全模型能力']
      const levelLabel = this.tokenPlan.levelLabelMap || {}
      // monthlyLimitUsd
      let testlabel = {
        standard: {
          price: '3,000 CPC/月',
          tag1: '支持旗舰模型',
          tag2: '同时支持3-4个Agent并发运行',
          tag3: '支持主流编程工具并持续拓展',
          tag4: '基础等级服务运行保障',
        },
        professional: {
          price: '12,000 CPC/月',
          tag1: '支持旗舰模型',
          tag2: '同时支持4-5个Agent并发运行',
          tag3: '支持主流编程工具并持续拓展',
          tag4: '1M长上下文，长文档/大代码库',
        },
        ultimate: {
          price: '48,000 CPC/月',
          tag1: '支持旗舰模型',
          tag2: '同时支持6-7个Agent并发运行',
          tag3: '支持主流编程工具并持续拓展',
          tag4: '1M长上下文，长文档/大代码库',
        }
      }
      let a = order.map((lv, index) => {
        const g = map[lv] || {}
        return {
          id: g.id || lv,
          level: lv,
          levelLabel: g.tokenplanLevelLabel || levelLabel[lv] || lv,
          tag: orderWord[index] || (g.description || ''),
          // 后端返回 isHot === '1' 表示该套餐为"最受欢迎"，用于显示 ribbon 角标
          isHot: g.isHot || '',
          // 当前周期价格 / 限额（来自后端）
          price: Number(g.tokenplanPrice || 0),
          daily: Number(g.dailyLimitUsd || 0),
          weekly: Number(g.weeklyLimitUsd || 0),
          monthly: Number(g.monthlyLimitUsd || 0),
          rateMultiplier: Number(g.rateMultiplier || 1),
          testlabelprice: g.monthlyLimitUsd,
          testlabel: testlabel[lv] || {}
        }
      })
      return a
    },
    apiDocCurl () {
      const code = this.currentModel && this.currentModel.modelCode ? this.currentModel.modelCode : 'your-model-code'
      return `curl http://api.power.xjit.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '{
    "model": "${code}",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`
    },
    apiDocCurlClaude () {
      const code = this.currentModel && this.currentModel.modelCode ? this.currentModel.modelCode : 'your-model-code'
      return `curl http://api.power.xjit.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "${code}",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`
    },
    apiDocPython () {
      const code = this.currentModel && this.currentModel.modelCode ? this.currentModel.modelCode : 'your-model-code'
      return `from openai import OpenAI

client = OpenAI(
    base_url="http://api.power.xjit.com/v1",
    api_key="<YOUR_API_KEY>"
)

completion = client.chat.completions.create(
    model="${code}",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(completion.choices[0].message.content)`
    },
    apiDocPythonClaude () {
      const code = this.currentModel && this.currentModel.modelCode ? this.currentModel.modelCode : 'your-model-code'
      return `import anthropic

client = anthropic.Anthropic(
    base_url="http://api.power.xjit.com/v1",
    api_key="<YOUR_API_KEY>"
)

message = client.messages.create(
    model="${code}",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)

print(message.content[0].text)`
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
    },
    filteredModels () {
      let models = this.models

      // 按搜索关键词筛选（模型名 / sub2api 标识 / 描述）
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        models = models.filter(m =>
          (m.name || '').toLowerCase().includes(keyword) ||
          (m.modelCode || '').toLowerCase().includes(keyword) ||
          (m.description || '').toLowerCase().includes(keyword)
        )
      }

      // 分页
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return models.slice(start, end)
    },
    totalModels () {
      let models = this.models

      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        models = models.filter(m =>
          (m.name || '').toLowerCase().includes(keyword) ||
          (m.modelCode || '').toLowerCase().includes(keyword) ||
          (m.description || '').toLowerCase().includes(keyword)
        )
      }

      return models.length
    }
  },
  methods: {
    // ========== Token Plan 模块辅助方法 ==========
    // 点击"立即购买"：跳转到我的套餐页面（路由前缀已含 shenbeigpuai）
    // 跳转到 token-plan-list 后会自动打开续费/升级弹框，并通过 query 选中对应档位/周期
    // 已登录：直接跳转 + query 参数
    // 未登录：跳转到登录页，并把目标路径与关键参数存到 localStorage，便于登录回调时还原
    goBuyTokenPlan (plan) {
      // 当前选中的计费周期（monthly / quarterly / yearly 等）
      const billingCycle = (this.tokenPlan && this.tokenPlan.activePeriod) || ''
      // 当前套餐档位（standard / professional / ultimate 等），从 plan.tokenplanLevel 取
      const planLevel = (plan && plan.level) || ''
      const planId = (plan && plan.id) || ''

      // 目标路径改为 token-plan-list，并通过 autoOpen=1 触发页面加载后自动打开续费/升级弹框
      if (this.isLoggedIn) {
        this.$router.push({
          path: '/shenbeigpuai/control/token-plan-list',
          query: { autoOpen: '1', billingCycle, level: planLevel, planId }
        })
      } else {
        this.$router.push({
          path: '/login'
        })
        // 把跳转目标 + 关键 query 也存到 localStorage，
        // 便于其他页（如登录回调、拦截页）取到 portal_redirect 后，
        // 拼上 billingCycle / level / planId 一起跳转，避免参数丢失
        localStorage.setItem('portal_redirect', '/shenbeigpuai/control/token-plan-list')
        localStorage.setItem('portal_redirect_autoOpen', '1')
        localStorage.setItem('portal_redirect_billingCycle', billingCycle)
        localStorage.setItem('portal_redirect_level', planLevel)
        localStorage.setItem('portal_redirect_planId', planId)
      }
    },
    // 当前周期下，相对于月付价的节省金额（用于"已省"标签）
    // 卡片数据结构已扁平化，通过 tokenPlan.groups 全量数据反查月付价
    cardSaveAmount (card) {
      if (!card || !card.level) return 0
      const groups = (this.tokenPlan && this.tokenPlan.groups) || []
      const activePeriod = this.tokenPlan.activePeriod
      // 月付周期key
      const monthlyKey = 'monthly'
      const monthly = groups.find(g => g && g.tokenplanLevel === card.level && g.tokenplanBillingCycle === monthlyKey)
      const m = Number((monthly && monthly.tokenplanPrice) || 0)
      const cur = Number(card.price || 0)
      // 获取当前周期的天数配置
      const currentPeriod = (this.tokenPlan.periods || []).find(p => p.id === activePeriod)
      const days = (currentPeriod && currentPeriod.days) || 30
      // 计算节省金额：月单价 × 月数 - 当前价
      const months = days / 30
      if (months > 1) {
        return Math.max(0, m * months - cur)
      }
      return 0
    },
    // 金额格式化：两位小数 + 千分位逗号
    formatMoney (n) {
      return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    // 数字格式化：千分位逗号
    formatNumber (n) {
      return Number(n || 0).toLocaleString('en-US')
    },
    // 获取当前选中周期的单位（空值保护）
    getActivePeriodUnit () {
      const periods = (this.tokenPlan && this.tokenPlan.periods) || []
      const active = periods.find(p => p.id === this.tokenPlan.activePeriod)
      return (active && active.unit) || ''
    },
    // 切换 Token Plan 计费周期
    setTokenPlanPeriod (periodId) {
      this.tokenPlan.activePeriod = periodId
    },
    // 按套餐卡片生成计费明细行（3 行）：用于 <template v-for> 内层 tr
    // 价格 / 优惠金额统一两位小数、千分位用英文逗号，与设计图一致
    // 数据来源：tokenPlan.groups（listSub2ApiGroupPage 返回的原始列表）
    // 后端返回的 tokenplanLevel / tokenplanBillingCycle 是字典中文 label，需转换后再比较
    cardMatrixRowsFor (card) {
      const periods = (this.tokenPlan && this.tokenPlan.periods) || []
      const groups = (this.tokenPlan && this.tokenPlan.groups) || []
      const levelLabelMap = (this.tokenPlan && this.tokenPlan.levelLabelMap) || {}
      const periodLabelMap = (this.tokenPlan && this.tokenPlan.periodLabelMap) || {}
      const money = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const num = n => Number(n || 0).toLocaleString('en-US')
      // 卡片 level 是英文原值，需转为中文 label 才能与后端比较
      const levelCN = levelLabelMap[card.level] || card.level
      // 月付中文 label = '月付'
      const monthlyCN = periodLabelMap.monthly || '月付'
      const monthly = groups.find(g => g && g.tokenplanLevel === levelCN && g.tokenplanBillingCycle === monthlyCN)
      const m = Number((monthly && monthly.tokenplanPrice) || 0)
      return periods.map(p => {
        const periodCN = periodLabelMap[p.id] || p.id
        const cur = groups.find(g => g && g.tokenplanLevel === levelCN && g.tokenplanBillingCycle === periodCN)
        const price = Number((cur && cur.tokenplanPrice) || 0)
        const r5h = Number((cur && cur.dailyLimitUsd) || 0)
        const r7d = Number((cur && cur.weeklyLimitUsd) || 0)
        let save = 0
        if (p.id === 'quarterly') save = m * 3 - price
        else if (p.id === 'yearly') save = m * 12 - price
        if (save < 0) save = 0
        return {
          key: card.id + '-' + p.id,
          periodLabel: p.label,
          price: price,
          priceText: money(price),
          r5hText: num(r5h),
          r7dText: num(r7d),
          saveAmount: save,
          saveAmountText: save > 0 ? money(save) : '0.00'
        }
      })
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
    // 手风琴点击事件
    handleAccordionClick (index) {
      this.activeAccordionIndex = index
    },
    // 获取手风琴项样式
    getAccordionItemStyle (index) {
      const isActive = this.activeAccordionIndex === index
      const totalItems = this.accordionItems.length
      const activeWidth = 50 // 激活项占50%
      const inactiveWidth = (100 - activeWidth) / (totalItems - 1) // 其他项平分剩余空间

      return {
        width: isActive ? activeWidth + '%' : inactiveWidth + '%'
      }
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
    // 调用 tokenPlan / listSub2ApiGroupPage 获取套餐列表
    async fetchTokenPlans () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/listSub2ApiGroupPage',
          method: 'post',
          data: { pageNumber: 1, pageSize: 20, params: {} }
        })
        if (res && res.errcode === 0 && res.data) {
          const page = res.data
          const list = page.results || []
          this.tokenPlan.groups = list

          // 从接口数据动态提取计费周期（去重）
          const periodMap = {}
          const periodDaysMap = { monthly: 30, quarterly: 90, yearly: 365 }
          list.forEach(item => {
            const cycle = item.tokenplanBillingCycle
            const cycleLabel = item.tokenplanBillingCycleLabel
            if (cycle && !periodMap[cycle]) {
              periodMap[cycle] = {
                id: cycle,
                label: cycleLabel || cycle,
                days: periodDaysMap[cycle] || 30,
                unit: this.tokenPlan.periodUnitMap[cycle] || cycle
              }
            }
          })
          // 按固定顺序排序：月付 -> 季付 -> 年付（如果存在的话）
          const order = ['monthly', 'quarterly', 'yearly']
          const periods = []
          order.forEach(key => {
            if (periodMap[key]) {
              periods.push(periodMap[key])
            }
          })
          // 如果有其他未在order中的周期，追加到后面
          Object.keys(periodMap).forEach(key => {
            if (!order.includes(key)) {
              periods.push(periodMap[key])
            }
          })
          this.tokenPlan.periods = periods

          // 默认选中第一个周期
          if (periods.length > 0 && !periods.find(p => p.id === this.tokenPlan.activePeriod)) {
            this.tokenPlan.activePeriod = periods[0].id
          }

          // 动态更新periodLabelMap（使用接口返回的label）
          const newPeriodLabelMap = {}
          periods.forEach(p => {
            newPeriodLabelMap[p.id] = p.label
          })
          this.tokenPlan.periodLabelMap = { ...this.tokenPlan.periodLabelMap, ...newPeriodLabelMap }

          // 动态更新levelLabelMap（使用接口返回的label）
          const newLevelLabelMap = {}
          list.forEach(item => {
            const level = item.tokenplanLevel
            const levelLabel = item.tokenplanLevelLabel
            if (level && levelLabel) {
              newLevelLabelMap[level] = levelLabel
            }
          })
          if (Object.keys(newLevelLabelMap).length > 0) {
            this.tokenPlan.levelLabelMap = { ...this.tokenPlan.levelLabelMap, ...newLevelLabelMap }
          }
        }
      } catch (e) {
        console.error('[TokenPlan/listSub2ApiGroupPage] 失败:', e)
      }
    },
    async fetchApiData () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalApiService/listPortalApiIntro',
          method: 'post',
          data: {
            // 门户未登录可传 companyCode，登录后可由 _user.company_code 过滤
          }
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          const list = Array.isArray(resp.data.data) ? resp.data.data : []

          this.models = list.map(item => ({
            id: item.id || item.modelId || item.title,
            modelId: item.modelId || '',
            name: item.modelName || '',
            modelCode: item.modelCode || '',
            platform: item.platform || '',
            platformLabel: item.platformLabel || '',
            title: item.title || '',
            image: item.modelImage || item.imageUrl || '',
            iconColor: '#165dff',
            paramCount: item.paramCount || '',
            contextLength: item.contextLength || '',
            modelArch: item.modelArch || '',
            isMultimodal: item.isMultimodal || '0',
            supportsPrefix: item.supportsPrefix || '0',
            supportsTools: item.supportsTools || '0',
            status: item.status || 'active',
            inputPrice: this.toNumber(item.inputPrice),
            outputPrice: this.toNumber(item.outputPrice),
            cacheReadPrice: this.toNumber(item.cacheReadPrice),
            cacheWritePrice: this.toNumber(item.cacheWritePrice),
            imageInputPrice: this.toNumber(item.imageInputPrice),
            imageOutputPrice: this.toNumber(item.imageOutputPrice),
            audioInputPrice: this.toNumber(item.audioInputPrice),
            audioOutputPrice: this.toNumber(item.audioOutputPrice),
            perRequestPrice: this.toNumber(item.perRequestPrice),
            inputPriceDisplayText: item.inputPriceDisplayText || '',
            outputPriceDisplayText: item.outputPriceDisplayText || '',
            cacheReadPriceDisplayText: item.cacheReadPriceDisplayText || '',
            cacheWritePriceDisplayText: item.cacheWritePriceDisplayText || '',
            imageInputPriceDisplayText: item.imageInputPriceDisplayText || '',
            imageOutputPriceDisplayText: item.imageOutputPriceDisplayText || '',
            audioInputPriceDisplayText: item.audioInputPriceDisplayText || '',
            audioOutputPriceDisplayText: item.audioOutputPriceDisplayText || '',
            perRequestPriceDisplayText: item.perRequestPriceDisplayText || '',
            currency: item.currency || '',
            currencyLabel: item.currencyLabel || '',
            currencyDisplayText: item.currencyDisplayText || '',
            priceUnit: item.priceUnit || '',
            priceUnitLabel: item.priceUnitLabel || '',
            priceUnitDisplayText: item.priceUnitDisplayText || '',
            description: item.content || item.description || '',
            isNew: item.isNew === '1' || item.isNew === 1 || false
          }))
        } else {
          this.models = []
          this.apiIntro = { title: '', subtitle: '', content: '', imageUrl: '', requiresLogin: false }
          this.$Message && this.$Message.error(resp.data.errmsg || '获取API介绍失败')
        }
      } catch (e) {
        this.models = []
        this.apiIntro = { title: '', subtitle: '', content: '', imageUrl: '', requiresLogin: false }
        this.$Message && this.$Message.error('网络异常，获取API介绍失败')
      }
    },
    /**
     * 转 number，失败/null/空 返回 null
     */
    toNumber (value) {
      if (value === null || value === undefined || value === '') return null
      const num = Number(value)
      return isNaN(num) ? null : num
    },
    /**
     * 是否存在缓存价格（读或写）
     */
    hasCachePrice (model) {
      if (!model) return false
      return (model.cacheReadPrice !== null && model.cacheReadPrice !== undefined) ||
        (model.cacheWritePrice !== null && model.cacheWritePrice !== undefined)
    },
    /**
     * 是否存在多模态/音频价格（任一存在即视为有效）
     */
    hasMultimodalPrice (model) {
      return this.hasImagePrice(model) || this.hasAudioPrice(model)
    },
    hasImagePrice (model) {
      if (!model) return false
      return (model.imageInputPrice !== null && model.imageInputPrice !== undefined && model.imageInputPrice !== 0) ||
        (model.imageOutputPrice !== null && model.imageOutputPrice !== undefined && model.imageOutputPrice !== 0)
    },
    hasAudioPrice (model) {
      if (!model) return false
      return (model.audioInputPrice !== null && model.audioInputPrice !== undefined && model.audioInputPrice !== 0) ||
        (model.audioOutputPrice !== null && model.audioOutputPrice !== undefined && model.audioOutputPrice !== 0)
    },
    /**
     * 打开接入说明抽屉
     */
    showApiDocTab (model) {
      this.currentModel = model
      this.detailTab = 'api'
      this.drawerVisible = true
    },
    /**
     * 打开详情抽屉
     */
    showDetailDrawer (model) {
      this.currentModel = model
      this.detailTab = 'info'
      this.drawerVisible = true
    },
    /**
     * 跳转到 API 密钥管理页
     */
    jumpToApiKey () {
      this.drawerVisible = false
      // 进入 portal 页面时记录当前完整路径，供登录成功后回跳
      if (this.isLoggedIn) {
        this.$router.push({ path: '/shenbeigpuai/control/account-management' })
      } else {
        this.$router.push({ path: '/login' })
        localStorage.setItem('portal_redirect', '/shenbeigpuai/control/account-management')
      }
    },
    /**
     * 复制到剪贴板
     */
    copyText (text) {
      if (!text) return
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$Message && this.$Message.success('已复制到剪贴板')
        }).catch(() => {
          this.$Message && this.$Message.warning('复制失败，请手动复制')
        })
      } else {
        const input = document.createElement('textarea')
        input.value = text
        document.body.appendChild(input)
        input.select()
        try {
          document.execCommand('copy')
          this.$Message && this.$Message.success('已复制到剪贴板')
        } catch (err) {
          this.$Message && this.$Message.warning('复制失败，请手动复制')
        }
        document.body.removeChild(input)
      }
    },
    /**
     * 能力标签映射
     */
    archLabel (arch) {
      const map = { dense: 'Dense 稠密', moe: 'MoE 混合专家' }
      return map[arch] || arch
    },
    /**
     * 格式化发布日期：毫秒时间戳 → YYYY-MM-DD
     */
    formatDate (value) {
      if (value === null || value === undefined || value === '') return '-'
      const num = Number(value)
      if (isNaN(num)) return value
      const d = new Date(num)
      if (isNaN(d.getTime())) return value
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    /**
     * 状态标签映射
     */
    statusLabel (status) {
      const map = { active: '在售', pro: '付费 Pro', deprecated: '已弃用' }
      return map[status] || status
    },
    /**
     * 跳转到登录页
     */
    handleLogin () {
      this.$router.push({ path: '/login' })
    },
    handleNav (key) {
      if (key === 'gpu') {
        this.$router.push({ path: '/shenbeigpuai/portal/gpu' })
        return
      }
      if (key === 'api') {
        // 当前页面，不需要跳转
        return
      }
      if (key === 'help') {
        this.$router.push({ path: '/shenbeigpuai/portal/help' })
        return
      }
      if (key === 'about') {
        this.$router.push({ path: '/shenbeigpuai/portal/about' })
        return
      }
      if (key === 'home') {
        this.$router.push({ path: '/shenbeigpuai/portal/home' })
        return
      }
      this.activeTab = key
    },
    handleModelClick (model) {
      // 点击模型卡片打开详情
      this.showDetailDrawer(model)
    },
    handleViewDetail (model) {
      // 查看模型详情
      this.showDetailDrawer(model)
    },
    handleViewApiDoc (model) {
      // 打开接入说明 Tab
      this.showApiDocTab(model)
    },
    handleRegister () {
      this.$router.push({ path: '/shenbeigpuai/portal/reg' })
    },
    handlePageChange (page) {
      this.currentPage = page
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
  }
}
</script>

<style lang="less" scoped>
.portal-token-card__buy {
  flex-shrink: 0;
  height: 40px;
  width: 100%;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(131.98deg, #3d5bcb 0%, #ba50d8 100%);
  border-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.portal-token-card__buy-text {
  flex: 0 0 auto;
  // font-size: 12px;
}

.portal-token-card__buy-arrow {
  width: 12px;
  height: 18px;
  flex: 0 0 auto;
  color: #7b5cff;
}

/* 选中卡按钮 hover 保持不变 */
.portal-token-card__buy:hover {
  filter: none;
  background: linear-gradient(131.98deg, #3d5bcb 0%, #ba50d8 100%);
}

/* iView 内置 primary hover 覆盖 */
.portal-token-card__buy.ivu-btn-primary:hover,
.portal-token-card__buy.ivu-btn-primary:focus {
  background: linear-gradient(131.98deg, #3d5bcb 0%, #ba50d8 100%) !important;
  border-color: transparent !important;
  color: #fff !important;
}

.portal-token-card__buy--ghost {
  background: #f3f0ff !important;
  color: #000 !important;
  border: 1px solid #e3dcff !important;
}

.portal-token-card__buy--ghost:hover {
  background: #ebe5ff !important;
  color: #7b5cff !important;
  filter: none;
}

/* "最受欢迎"卡 hover 时，按钮变紫实心 */
.tp-plan--featured:hover .portal-token-card__buy,
.tp-plan--featured:hover .portal-token-card__buy--ghost {
  background: linear-gradient(131.98deg, #3d5bcb 0%, #ba50d8 100%) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  filter: none !important;
}

.portal-home {
  background: #ffffff;
  // 以下是需要单独加的滚动样式
  overflow: scroll;
  height: 100%;
}

.portal-container {
  max-width: 1700px;
  width: 100%;
  margin: 0 auto;
  padding: 0 clamp(12px, 7.8vw, 100px);
  box-sizing: border-box;
}

.portal-section {
  width: 100%;
}

// 手风琴图片展示样式
.accordion-gallery {
  display: flex;
  width: 80%;
  height: 360px;
  margin: 0 auto 40px auto;
  // border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .accordion-item {
    position: relative;
    height: 100%;
    cursor: pointer;
    overflow: hidden;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    &__bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &__overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
      transition: background 0.3s ease;
    }

    &__content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 30px;
      color: #fff;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &__title {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }

    &__desc {
      font-size: 18px;
      line-height: 1.6;
      opacity: 0;
      width: 400px;
      margin-top: 12px;
      visibility: hidden;
    }

    // 激活状态
    &.active {
      .accordion-item__bg {
        transform: scale(1.05);
      }

      .accordion-item__overlay {
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.7) 100%);
      }

      .accordion-item__content {
        justify-content: flex-start;
        align-items: flex-start;
        padding-top: 40px;
      }

      .accordion-item__title {
        font-size: 36px;
        margin-bottom: 16px;
        text-align: left;
      }

      .accordion-item__desc {
        opacity: 1;
        visibility: visible;
        text-align: left;
      }
    }

    // 非激活状态hover效果
    &:not(.active):hover {
      .accordion-item__overlay {
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%);
      }
    }
  }
}

// Header样式 - 与portal/index.vue相同
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
  cursor: pointer;
}

// API调用页面
.portal-api-call {
  padding: 0 0 80px;
  background: #ffffff;
  min-height: calc(100vh - 70px);
}

// API Banner图片区域
.api-banner {
  position: relative;
  width: 100%;
  margin-bottom: 60px;
  overflow: hidden;
  height: 380px;
  background: url('~@/assets/file/shenbeigpuai/image/api-banner.png') no-repeat center top;
  background-size: cover;
}

@media (max-width: 768px) {
  .api-banner {
    height: 240px;
    margin-bottom: 32px;
  }

  .api-banner__title {
    font-size: 24px;
    line-height: 32px;
  }

  .api-banner__subtitle {
    font-size: 14px;
    line-height: 22px;
  }

  .api-intro__title,
  .model-showcase-banner__title {
    font-size: 24px;
    line-height: 32px;
  }

  .api-intro__subtitle,
  .model-showcase-banner__subtitle {
    font-size: 14px;
  }

  .accordion-gallery {
    width: 95%;
    height: 280px;
  }

  .model-filter {
    padding: 16px;
  }
}

.api-banner__inner {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.api-banner__title {
  font-size: 36px;
  font-weight: 700;
  line-height: 50px;
  margin-bottom: 8px;
}

.api-banner__subtitle {
  font-size: 18px;
  line-height: 28px;
}

.api-banner__image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

// API介绍区域
.api-intro-section {
  margin-bottom: 60px;
}

.api-intro__content {
  text-align: center;
}

.api-intro__title {
  font-size: 36px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.api-intro__subtitle {
  font-size: 18px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0;
}

// 模型展示区域上方图片
.model-showcase-banner {
  width: 80%;
  margin: 0 auto 100px auto;
  overflow: hidden;
}

.model-showcase-banner__image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  margin-bottom: 40px;
}

.model-showcase-banner__text {
  text-align: center;
}

.model-showcase-banner__title {
  font-size: 36px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.model-showcase-banner__subtitle {
  font-size: 18px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0;
}

// 模型广场介绍
.model-square-intro {
  margin-bottom: 40px;
  padding: 32px;
  background: #f7f8fa;
  border-radius: 12px;
}

.model-square-intro__header {
  margin-bottom: 16px;
}

.model-square-intro__title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.model-square-intro__subtitle {
  font-size: 16px;
  color: #4e5969;
  margin: 0;
}

.model-square-intro__content {
  font-size: 14px;
  color: #4e5969;
  line-height: 24px;
}

// 登录提示
.login-prompt {
  margin: 60px 0;
  padding: 80px 0;
  text-align: center;
  background: #f7f8fa;
  border-radius: 12px;
}

.login-prompt__content {
  display: inline-block;
}

.login-prompt__content .ivu-icon {
  color: #86909c;
  margin-bottom: 24px;
}

.login-prompt__title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
}

.login-prompt__desc {
  font-size: 14px;
  color: #4e5969;
  margin-bottom: 24px;
}

// 模型展示区域
.model-showcase {
  margin-top: 40px;
}

// 筛选区域
.model-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: #f7f8fa;
  border-radius: 8px;
}

.model-filter__search {
  flex: 1;
  max-width: 400px;
}

.model-filter__categories {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

// 模型列表
.model-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
  max-width: 1400px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.model-card {
  background: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  max-width: none;
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  z-index: 1;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
    transform: translateY(-2px);
    z-index: 10;
  }
}

@media (max-width: 1200px) {
  .model-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .model-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .model-list {
    grid-template-columns: 1fr;
  }
}

.model-card__new-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 60px 60px 0;
  border-color: transparent #ff4d4f transparent transparent;
  z-index: 1;

  .model-card__new-text {
    position: absolute;
    top: 10px;
    right: -52px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    transform: rotate(45deg);
    white-space: nowrap;
    line-height: 1;
  }
}

// 属性 chips
.model-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  background: #f5f7fa;
  color: #606266;
  line-height: 16px;
}

.chip--blue {
  background: #ecf5ff;
  color: #1890ff;
}

.chip--green {
  background: #f0f9eb;
  color: #67c23a;
}

.chip--purple {
  background: #f4eafe;
  color: #7c3aed;
}

.chip--cyan {
  background: #e6fffb;
  color: #13c2c2;
}

.chip--orange {
  background: #fff7e6;
  color: #fa8c16;
}

.model-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.model-card__media {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.model-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.model-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #8B5CF6;
  flex-shrink: 0;
}

.model-card__title-group {
  flex: 1;
  min-width: 0;
}

.model-card__name {
  font-size: 14px;
  color: gray;
  line-height: 1;
  word-break: break-word;
}

.model-card__price {
  font-size: 14px;
  color: #4e5969;
  font-weight: 500;
  margin: 0;
}

.model-card__divider {
  height: 1px;
  width: 100%;
  background: #e5e6eb;
  margin: 0 auto 10px auto;
}

.model-card__price-value,
.model-card__price-symbol {
  color: #f5222d;
}

.model-card__description-wrap {
  position: relative;
  margin: 0 0 16px 0;
}

.model-card__description {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
}

.model-card__description-popover {
  display: none;
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 999;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  font-size: 13px;
  line-height: 1.6;
  color: #1d2129;
  white-space: normal;
  word-break: break-word;
  pointer-events: none;
}

.model-card__description-wrap:hover .model-card__description-popover {
  display: block;
}

.model-card__subtitle {
  font-size: 18px;
  font-weight: 700;
  color: #1d2129;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  -webkit-box-orient: unset;
  display: block;
  margin: 0 0 12px 0;
}

.model-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  width: 100%;
}

.model-card__tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  line-height: 1.5;
  cursor: default;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.model-card__tag--blue {
  color: #165dff;
  background: #e8f3ff;
  border: 1px solid #b3d8ff;
}

.model-card__tag--green {
  color: #00b42a;
  background: #e8f8f0;
  border: 1px solid #b3e6d0;
}

// 分页
.model-pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

// 模型详情抽屉样式
.model-detail {
  padding: 0 16px;

  &__header {
    .header-main {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .icon-box {
        width: 64px;
        height: 64px;
        background: #f0faff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .title-box {
        flex: 1;
        min-width: 0;

        .title-row {
          display: flex;
          align-items: center;

          h2 {
            font-size: 20px;
            color: #17233d;
          }
        }

        .subtitle {
          color: #808695;
          font-size: 13px;
          margin-top: 4px;
        }
      }
    }

    .header-desc {
      font-size: 13px;
      color: #515a6e;
      line-height: 1.8;
      margin-bottom: 12px;
    }
  }

  &__section {
    .doc-intro {
      font-size: 13px;
      color: #515a6e;
      line-height: 1.8;
      margin-bottom: 16px;
      padding: 12px;
      background: #f7f8fa;
      border-radius: 4px;

      p {
        margin: 0;
      }
    }

    .info-list {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        margin-bottom: 16px;
        font-size: 13px;

        &::before {
          content: '•';
          color: #2d8cf0;
          margin-right: 8px;
          font-weight: bold;
        }

        .label {
          color: #808695;
          width: 80px;
          flex-shrink: 0;
        }

        .value {
          color: #17233d;
          flex: 1;

          &.value--chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            align-items: center;
          }

          &.value--code {
            display: flex;
            align-items: center;
            gap: 8px;

            code {
              font-family: 'Courier New', monospace;
              background: #f5f7fa;
              padding: 4px 8px;
              border-radius: 3px;
              font-size: 13px;
            }
          }

          .detail-chip {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 3px;
            font-size: 12px;
            line-height: 18px;
            background: #f5f7fa;
            color: #606266;

            &--purple {
              background: #f4eafe;
              color: #7c3aed;
            }

            &--cyan {
              background: #e6fffb;
              color: #13c2c2;
            }

            &--orange {
              background: #fff7e6;
              color: #fa8c16;
            }
          }
        }
      }
    }

    .code-block {
      margin-top: 16px;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      overflow: hidden;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f5f7fa;
        font-size: 13px;
        color: #606266;
        border-bottom: 1px solid #e8e8e8;
      }

      pre {
        margin: 0;
        padding: 12px;
        background: #fafafa;
        overflow-x: auto;

        code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #17233d;
          white-space: pre;
        }
      }
    }

    .copy-icon {
      cursor: pointer;
      color: #808695;
      font-size: 16px;
      transition: color 0.2s;

      &:hover {
        color: #2d8cf0;
      }
    }

    .doc-intro {
      font-size: 13px;
      color: #515a6e;
      line-height: 1.8;
      margin-bottom: 16px;
      padding: 12px;
      background: #f7f8fa;
      border-radius: 4px;

      p {
        margin: 0;
      }

      code {
        font-family: 'Courier New', monospace;
        background: #eef0f3;
        padding: 1px 6px;
        border-radius: 3px;
        font-size: 12px;
      }
    }

    .doc-note {
      margin-top: 16px;
      padding: 12px 16px;
      background: #fffbe6;
      border: 1px solid #ffe58f;
      border-radius: 4px;
      font-size: 12px;
      color: #595959;
      line-height: 1.8;

      &__title {
        margin: 0 0 8px 0;
        font-weight: 600;
        color: #d48806;
      }

      ul {
        margin: 0;
        padding-left: 18px;
      }

      li {
        margin-bottom: 4px;
      }

      code {
        font-family: 'Courier New', monospace;
        background: #fff7d4;
        padding: 1px 5px;
        border-radius: 3px;
        font-size: 12px;
        color: #874d00;
      }
    }

    .doc-action {
      margin-top: 16px;
      padding: 12px 16px;
      background: #f0f7ff;
      border: 1px solid #adc8ff;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      &__text {
        flex: 1;
        min-width: 0;
      }

      &__title {
        margin: 0 0 4px 0;
        font-size: 13px;
        font-weight: 600;
        color: #17233d;
      }

      &__desc {
        margin: 0;
        font-size: 12px;
        color: #606266;
      }
    }

    .value code {
      font-family: 'Courier New', monospace;
      background: #f5f7fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
    }
  }
}

.model-detail-tabs {
  /deep/ .ivu-tabs-bar {
    margin-bottom: 16px;
  }
}

/deep/ .model-detail-drawer {
  .ivu-drawer-body {
    padding: 24px 0;
  }
}

.model-detail-tabs {
  /deep/ .ivu-tabs-bar {
    margin-bottom: 16px;
  }
}

/deep/ .model-detail-drawer {
  .ivu-drawer-body {
    padding: 24px 0;
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

/* ============ Token Plan 模块样式 ============ */
.token-plan {
  background: #ffffff;
}

/* 通用 section */
.tp-section {
  padding: 50px 0;
  // border-bottom: 1px solid #e7ebf2;
}

.tp-section:last-child {
  border-bottom: none;
}

.tp-section--soft {
  background: #f6f8fb;
}

/* 区块标题 */
.tp-section__head {
  margin-bottom: 28px;
  max-width: 720px;
}

.tp-tag {
  font-size: 13px;
  font-weight: 800;
  color: #ff7a45;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.tp-section__title {
  font-size: clamp(24px, 3vw, 32px);
  letter-spacing: -.025em;
  margin: 8px 0 10px;
  font-weight: 820;
  color: #0f1b33;
}

.tp-section__desc {
  color: #5b6577;
  font-size: 15.5px;
  line-height: 1.6;
}

/* 计费周期切换 */
.tp-period-toggle {
  display: flex;
  width: 193px;
  margin: 26px auto 26px auto;
  background: linear-gradient(131.98deg, #3d5bcb 0%, #ba50d8 100%);
  border: none;
  border-radius: 6px;
  padding: 0;
  gap: 0;
}

.tp-period-btn {
  flex: 1;
  width: auto;
  height: 39px;
  padding: 0;
  margin: 5px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 18px;
  color: #ffffff;
  transition: .18s;
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
}

.tp-period-btn.active {
  background: #ffffff;
  color: #1d2129;
  box-shadow: none;
}

.tp-period-save {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  color: #ff7a45;
  margin-top: 1px;
}

/* 套餐卡片 */
.tp-plans {
  display: grid;
  grid-template-columns: repeat(3, 316px);
  gap: 16px;
  align-items: stretch;
  justify-content: center;
}

/* 默认卡片：与其他卡保持一致 */
.tp-plan {
  position: relative;
  width: 316px;
  height: 382px;
  background: #ffffff url('~@/assets/file/shenbeigpuai/image/api-background.png') no-repeat right top / 316px 400px;
  border: 1px solid #e7ebf2;
  border-radius: 14px;
  padding: 30px 28px 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(16, 27, 51, .06), 0 1px 3px rgba(16, 27, 51, .04);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease;
}

/* 普通卡 hover：上浮 */
.tp-plan:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 50px rgba(16, 27, 51, .14);
  // border-color: #d8deea;
  border-color: #2354ff;
}

/* "最受欢迎"卡 hover 时才显示选中态（默认与其他卡一致） */
.tp-plan--featured:hover {
  border-color: #2354ff;
  background: #ffffff url('~@/assets/file/shenbeigpuai/image/api-background.png') no-repeat right top / 316px 400px;
  // background: linear-gradient(180deg, #ffffff 0%, #f3f6ff 100%);
  box-shadow: 0 14px 40px rgba(35, 84, 255, .16);
  transform: translateY(-6px);
}

/* "最受欢迎"角标：默认可见，hover 时也保持可见 */
.tp-plan__ribbon {
  position: absolute;
  top: -12px;
  left: 70%;
  // transform: translateX(-10%);
  background: linear-gradient(131.98deg, #3d5bcb 0%, #ba50d8 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 14px;
  border-radius: 999px;
  letter-spacing: .02em;
  box-shadow: 0 4px 10px rgba(123, 92, 255, .3);
  visibility: visible;
  opacity: 1;
}

.tp-plan__name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -.01em;
  color: #0f1b33;
}

.tp-plan__tag {
  font-size: 14px;
  font-weight: 400;
  color: #4e5969;
  margin-top: 4px;
  min-height: 38px;
}

.tp-plan__price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.tp-plan__cur {
  font-size: 24px;
  font-weight: 700;
  line-height: 42px;
  height: 42px;
  align-self: center;
  display: flex;
  align-items: center;
  // color: #1a2942;
  color: #FF5900;
}

.tp-plan__amt {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: -.03em;
  line-height: 1;
  // color: #0f1b33;
  color: #FF5900;
  font-variant-numeric: tabular-nums;
}

.tp-plan__per {
  font-size: 14px;
  color: #000;
  font-weight: 700;
}

.tp-plan__sub {
  font-size: 18px;
  color: #5b6577;
  min-height: 18px;
}

.tp-save-tag {
  color: #ff7a45;
  font-weight: 800;
}

.tp-divider {
  height: 0;
  border-top: 1px dashed #d8deea;
  margin: 8px 0 8px;
}

.tp-feat {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  font-size: 15px;
  align-items: flex-start;
}

.tp-feat__ic {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  // background: #e8f7ef;
  background: linear-gradient(137.80deg, #415bcc 0%, #b850d8 100%);
  // color: #16a36a;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
}

.tp-feat__lbl {
  color: #5b6577;
  min-width: 74px;
  flex: none;
}

.tp-feat__val {
  font-weight: 700;
  color: #1a2942;
  // font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 18px;
}

.tp-feat__val small {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-weight: 600;
  color: #5b6577;
  font-size: 11.5px;
}

.tp-plan__cta {
  margin-top: auto;
  padding-top: 22px;
}

/* 计费矩阵 / 费率倍数表格 */
.tp-table-card {
  background: #ffffff;
  border: 1px solid #e7ebf2;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(16, 27, 51, .06), 0 1px 3px rgba(16, 27, 51, .04);
  /* 表格卡宽度受限并居中，贴近设计图紧凑外观 */
  max-width: 880px;
  margin: 0 auto;
}

.tp-table-scroll {
  overflow-x: auto;
}

table.tp-cmp {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
  table-layout: fixed;
}

/* 列宽控制：版本/周期 较窄，价格/数字 居中且有足够空间 */
table.tp-cmp .tp-col-plan {
  width: 17%;
}

table.tp-cmp .tp-col-price {
  width: 21%;
}

table.tp-cmp .tp-col-num {
  width: 20%;
}

table.tp-cmp .tp-col-discount {
  width: 22%;
}

/* 费率倍数表：适用场景列加宽，承载较长中文描述 */
table.tp-cmp.tp-cmp--rate .tp-col-pill {
  width: 15%;
}

table.tp-cmp.tp-cmp--rate .tp-col-scene {
  width: 40%;
}

table.tp-cmp.tp-cmp--rate .tp-col-mult {
  width: 15%;
}

table.tp-cmp.tp-cmp--rate .tp-col-consume {
  width: 20%;
}

table.tp-cmp th,
table.tp-cmp td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e7ebf2;
  font-size: 13.5px;
  color: #0f1b33;
}

table.tp-cmp thead th {
  background: #f6f8fb;
  font-weight: 800;
  color: #1a2942;
}

table.tp-cmp tbody tr:hover {
  background: #f6f8fb;
}

/* 价格 / 数字列居中显示，贴近设计图 */
table.tp-cmp td:nth-child(2),
table.tp-cmp td:nth-child(3),
table.tp-cmp td:nth-child(4) {
  text-align: left;
}

table.tp-cmp td:nth-child(5) {
  text-align: left;
}

.tp-num {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-weight: 700;
}

.tp-grp {
  background: #eef2f8 !important;
  font-weight: 800;
  color: #1a2942;
  font-size: 12px;
  letter-spacing: .03em;
  text-transform: uppercase;
}

.tp-pill {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
}

.tp-pill--b {
  background: #eef2ff;
  color: #1a3fd6;
}

.tp-pill--g {
  background: #e8f7ef;
  color: #16a36a;
}

.tp-pill--lite {
  background: #eef1f6;
  color: #5b6577;
}

.tp-pill--std {
  background: #eef2ff;
  color: #1a3fd6;
}

.tp-pill--pro {
  background: #f1ecff;
  color: #7a5bff;
}

.tp-pill--max {
  background: #fff1ea;
  color: #ff7a45;
}

/* 使用说明：四步 */
.tp-steps {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.tp-step {
  background: #ffffff;
  border: 1px solid #e7ebf2;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(16, 27, 51, .06), 0 1px 3px rgba(16, 27, 51, .04);
  position: relative;
}

.tp-step__n {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: #e3ebff;
  ;
  color: #4362FF;
  font-weight: 900;
  display: grid;
  place-items: center;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 18px;
}

.tp-step__title {
  font-size: 18px;
  margin: 12px 0 6px;
  font-weight: 800;
  color: #4362FF;
}

.tp-step__desc {
  font-size: 16px;
  color: #5b6577;
  line-height: 1.6;
}

/* 代码块 */
.tp-code-card {
  background: #0f1b33;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(16, 27, 51, .08), 0 1px 4px rgba(16, 27, 51, .05);
}

.tp-code-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #0b1530;
  border-bottom: 1px solid #1d2c4d;
}

.tp-code-dots {
  display: flex;
  gap: 6px;
}

.tp-code-dots i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: block;
}

.tp-code-dots i:nth-child(1) {
  background: #ff5f57;
}

.tp-code-dots i:nth-child(2) {
  background: #febc2e;
}

.tp-code-dots i:nth-child(3) {
  background: #28c840;
}

.tp-code-fname {
  color: #9fb0d0;
  font-size: 12.5px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  margin-left: 6px;
}

.tp-code-copy {
  margin-left: auto;
  background: #1b2c4f;
  color: #cfe0ff;
  border: 1px solid #2a3d63;
  padding: 5px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.tp-code-pre {
  padding: 18px 20px;
  overflow-x: auto;
  color: #d7e3ff;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.75;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式 */
@media (max-width: 980px) {
  .tp-plans {
    grid-template-columns: 1fr;
    max-width: 460px;
    margin: 0 auto;
  }

  .tp-steps {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .tp-steps {
    grid-template-columns: 1fr;
  }
}
</style>
