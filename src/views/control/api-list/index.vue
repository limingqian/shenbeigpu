<template>
  <div class="model-plaza">
    <div class="model-plaza__header">
      <Breadcrumb>
        <BreadcrumbItem>模型</BreadcrumbItem>
        <BreadcrumbItem>模型广场</BreadcrumbItem>
      </Breadcrumb>

      <div class="model-plaza__search-bar">
        <Input v-model="searchKeyword" placeholder="搜索模型..." class="model-plaza__search-input"
          @on-enter="handleSearch" />
        <Button type="primary" icon="md-search" class="model-plaza__search-btn" @click="handleSearch">搜索</Button>
      </div>
    </div>

    <!-- 筛选面板 -->
    <Card class="filter-panel" :bordered="false" dis-hover>
      <div class="filter-row">
        <div class="filter-row__label">平台</div>
        <div class="filter-row__content">
          <div
            class="filter-item"
            :class="{ 'filter-item--active': filters.platform === 'all' }"
            @click="filters.platform = 'all'"
          >全部</div>
          <div
            v-for="option in platformOptions"
            :key="option"
            class="filter-item"
            :class="{ 'filter-item--active': filters.platform === option }"
            @click="filters.platform = option"
          >{{ option }}</div>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-row__label">状态</div>
        <div class="filter-row__content">
          <div
            v-for="opt in statusOptions"
            :key="opt.value"
            class="filter-item"
            :class="{ 'filter-item--active': filters.status === opt.value }"
            @click="filters.status = (filters.status === opt.value ? 'all' : opt.value)"
          >{{ opt.label }}</div>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-row__label">能力</div>
        <div class="filter-row__content">
          <div
            v-for="opt in capabilityOptions"
            :key="opt.value"
            class="filter-item"
            :class="{ 'filter-item--active': filters.capability === opt.value }"
            @click="filters.capability = (filters.capability === opt.value ? 'all' : opt.value)"
          >{{ opt.label }}</div>
        </div>
      </div>
    </Card>

    <div class="model-plaza__content">
      <div v-if="!loading" class="model-grid">
        <Card
          v-for="(model, index) in modelList"
          :key="model.id || index"
          class="model-card"
          :bordered="false"
          dis-hover
          @click.native="showDetail(model)"
        >            <!-- 状态徽标：Pro / New / Deprecated -->
            <div v-if="model.status === 'pro'" class="model-card__badge model-card__badge--pro">Pro</div>
            <div v-else-if="model.isNew || model.status === 'active'" class="model-card__badge model-card__badge--new">New</div>
            <div v-else-if="model.status === 'deprecated'" class="model-card__badge model-card__badge--deprecated">Deprecated</div>

            <div class="model-card__top">
              <div class="model-card__icon">
                <img v-if="model.image" :src="model.image" :alt="model.name" />
                <Icon v-else type="md-planet" size="32" color="#2d8cf0" />
              </div>
              <div class="model-card__info">
                <h3 class="title">{{ model.name }}</h3>
                <div class="meta">
                  <span class="platform">{{ model.platformLabel || model.platform || '其他' }}</span>
                  <span class="divider">|</span>
                  <span class="price">{{ model.inputPriceDisplayText || '-' }}</span>
                </div>
              </div>
            </div>

            <div class="model-card__desc">
              {{ model.description }}
            </div>

            <!-- 属性 chips -->
            <div class="model-card__chips">
              <span v-if="model.paramCount" class="chip chip--blue">{{ model.paramCount }}</span>
              <span v-if="model.contextLength" class="chip chip--green">{{ model.contextLength }}</span>
              <span v-if="model.modelArch" class="chip">{{ model.modelArch.toUpperCase() }}</span>
              <span v-if="model.isMultimodal === '1'" class="chip chip--purple">多模态</span>
              <span v-if="model.supportsPrefix === '1'" class="chip chip--cyan">前缀缓存</span>
              <span v-if="model.supportsTools === '1'" class="chip chip--orange">工具调用</span>
            </div>
          </Card>
      </div>
      <div v-if="loading" class="loading-container">
        <Spin size="large" fix></Spin>
      </div>
      <div v-else-if="modelList.length === 0" class="empty-container">
        <Icon type="md-planet" size="64" color="#dcdee2" />
        <p>暂无数据</p>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <Drawer
      v-model="drawerVisible"
      width="640"
      :closable="false"
      class-name="model-detail-drawer"
    >
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
                <Tag v-if="currentModel.status === 'pro'" color="warning" size="small" style="margin-left: 8px">Pro</Tag>
                <Tag v-else-if="currentModel.status === 'deprecated'" color="default" size="small" style="margin-left: 8px">已弃用</Tag>
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
                    <span v-if="currentModel.isMultimodal !== '1' && currentModel.supportsPrefix !== '1' && currentModel.supportsTools !== '1'" style="color:#909399;">-</span>
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
                  <span class="value">{{ currentModel.priceUnitDisplayText || currentModel.priceUnitLabel || currentModel.priceUnit || '-' }}</span>
                </li>
                <li>
                  <span class="label">货币</span>
                  <span class="value">{{ currentModel.currencyDisplayText || currentModel.currencyLabel || currentModel.currency || '-' }}</span>
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
                <li v-if="currentModel.imageInputPrice !== null && currentModel.imageInputPrice !== undefined && currentModel.imageInputPrice !== currentModel.inputPrice">
                  <span class="label">图像输入</span>
                  <span class="value price-val">{{ currentModel.imageInputPriceDisplayText || '-' }}</span>
                </li>
                <li v-if="currentModel.imageOutputPrice !== null && currentModel.imageOutputPrice !== undefined && currentModel.imageOutputPrice !== currentModel.outputPrice">
                  <span class="label">图像输出</span>
                  <span class="value price-val">{{ currentModel.imageOutputPriceDisplayText || '-' }}</span>
                </li>
                <li v-if="currentModel.audioInputPrice !== null && currentModel.audioInputPrice !== undefined && currentModel.audioInputPrice !== 0">
                  <span class="label">音频输入</span>
                  <span class="value price-val">{{ currentModel.audioInputPriceDisplayText || '-' }}</span>
                </li>
                <li v-if="currentModel.audioOutputPrice !== null && currentModel.audioOutputPrice !== undefined && currentModel.audioOutputPrice !== 0">
                  <span class="label">音频输出</span>
                  <span class="value price-val">{{ currentModel.audioOutputPriceDisplayText || '-' }}</span>
                </li>
                <li v-if="currentModel.perRequestPrice !== null && currentModel.perRequestPrice !== undefined && currentModel.perRequestPrice !== 0">
                  <span class="label">每次请求</span>
                  <span class="value price-val">{{ currentModel.perRequestPriceDisplayText || '-' }}</span>
                </li>
              </ul>
            </div>
          </TabPane>

          <TabPane label="接入说明" name="api">
            <div class="model-detail__section">
              <div class="doc-intro">
                <p>通过 OpenAI 或 Anthropic 兼容接口调用本模型，baseUrl 为 <code>http://api.power.xjit.com/v1</code>，apiKey 请在控制台「API 密钥」页面创建并妥善保管。</p>
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
                    <Icon
                      v-if="currentModel.modelCode"
                      type="md-copy"
                      class="copy-icon"
                      @click="copyText(currentModel.modelCode)"
                    />
                  </span>
                </li>
                <li>
                  <span class="label">支持能力</span>
                  <span class="value value--chips">
                    <span v-if="currentModel.isMultimodal === '1'" class="detail-chip detail-chip--purple">多模态</span>
                    <span v-if="currentModel.supportsPrefix === '1'" class="detail-chip detail-chip--cyan">前缀缓存</span>
                    <span v-if="currentModel.supportsTools === '1'" class="detail-chip detail-chip--orange">工具调用</span>
                    <span v-if="currentModel.isMultimodal !== '1' && currentModel.supportsPrefix !== '1' && currentModel.supportsTools !== '1'" style="color:#909399;">标准文本对话</span>
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
                  <li>OpenAI 格式走 <code>/v1/chat/completions</code>，Anthropic 格式走 <code>/v1/messages</code>，多模态请求仅 OpenAI 格式支持 <code>image_url</code>。</li>
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
  </div>
</template>

<script>
/**
 * 控制台 - 模型广场
 * 调整日期：2026-07-17
 * 调整说明：
 *   - 删除基于 modelTags 的筛选（tags 字段在 shenbeigpuai_model 中已废弃）
 *   - 删除 categoryName/apiDocUrl/ruleName/billingType 字段读取
 *   - 价格改用后端返回的 inputPrice / outputPrice / cacheReadPrice / cacheWritePrice
 *   - 新增按 platform 筛选
 *   - 卡片固定每行 4 个，点击卡片直接进详情
 *   - 移除卡片与抽屉头部的"接入说明"按钮
 *   - 详情抽屉"接入说明"Tab 内置真实 baseUrl 与 OpenAI/Anthropic 双格式示例
 */
export default {
  name: 'scp-shenbeigpuai-control-model-plaza',
  data() {
    return {
      drawerVisible: false,
      currentModel: null,
      detailTab: 'info',
      loading: false,
      searchKeyword: '',
      filters: {
        platform: 'all',
        status: 'all',
        capability: 'all'
      },
      // 平台可选项由接口返回动态生成
      platformOptions: [],
      // 状态固定三档
      statusOptions: [
        { value: 'active', label: '在售' },
        { value: 'pro', label: '付费 Pro' },
        { value: 'deprecated', label: '已弃用' }
      ],
      // 能力筛选
      capabilityOptions: [
        { value: 'multimodal', label: '多模态' },
        { value: 'tools', label: '工具调用' },
        { value: 'prefix', label: '前缀缓存' }
      ],
      models: []
    }
  },
  computed: {
    apiDocCurl() {
      const code = this.currentModel && this.currentModel.modelCode ? this.currentModel.modelCode : 'your-model-code'
      return `curl http://api.power.xjit.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '{
    "model": "${code}",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`
    },
    apiDocCurlClaude() {
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
    apiDocPython() {
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
    apiDocPythonClaude() {
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
    modelList() {
      let models = this.models

      // 按平台筛选
      if (this.filters.platform !== 'all') {
        models = models.filter(m => m.platform === this.filters.platform)
      }

      // 按状态筛选
      if (this.filters.status !== 'all') {
        models = models.filter(m => (m.status || 'active') === this.filters.status)
      }

      // 按能力筛选
      if (this.filters.capability !== 'all') {
        const cap = this.filters.capability
        models = models.filter(m => {
          if (cap === 'multimodal') return m.isMultimodal === '1'
          if (cap === 'tools') return m.supportsTools === '1'
          if (cap === 'prefix') return m.supportsPrefix === '1'
          return true
        })
      }

      // 按关键字搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        models = models.filter(m =>
          (m.name || '').toLowerCase().includes(keyword) ||
          (m.modelCode || '').toLowerCase().includes(keyword) ||
          (m.description || '').toLowerCase().includes(keyword)
        )
      }

      return models
    }
  },
  created() {
    this.fetchApiData()
  },
  methods: {
    async fetchApiData() {
      this.loading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalApiService/listPortalApiIntro',
          method: 'post',
          data: {}
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          const list = Array.isArray(resp.data.data) ? resp.data.data : []
          this.models = list.map(item => ({
            id: item.id,
            name: item.modelName || item.title || '',
            modelCode: item.modelCode || '',
            platform: item.platform || '',
            platformLabel: item.platformLabel || '',
            image: item.modelImage || item.imageUrl || '',
            description: (item.content || '').replace(/\n+/g, ' ').trim(),
            paramCount: item.paramCount || '',
            contextLength: item.contextLength || '',
            modelArch: item.modelArch || '',
            isMultimodal: item.isMultimodal || '0',
            supportsPrefix: item.supportsPrefix || '0',
            supportsTools: item.supportsTools || '0',
            status: item.status || 'active',
            releaseDate: item.releaseDate || '',
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
            isNew: item.isNew === '1' || item.isNew === 1 || false
          }))

          // 动态生成平台筛选选项
          const platformSet = new Set()
          this.models.forEach(m => {
            if (m.platform) platformSet.add(m.platform)
          })
          this.platformOptions = Array.from(platformSet)
        } else {
          this.$Message.error(resp.data.errmsg || '获取数据失败')
        }
      } catch (error) {
        console.error('获取API数据失败:', error)
        this.$Message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },
    showDetail(model) {
      this.currentModel = model
      this.detailTab = 'info'
      this.drawerVisible = true
    },
    // 搜索按钮 / 输入框 enter：modelList computed 已基于 searchKeyword 响应式过滤，这里只是给模板一个明确的点击事件
    handleSearch() {
      // noop：实际过滤由 computed modelList 自动重算
    },
    jumpToApiKey() {
      // 关闭抽屉，跳转到 API 密钥管理页
      this.drawerVisible = false
      this.$router.push({ path: '/shenbeigpuai/control/account-management' })
    },
    copyText(text) {
      if (!text) return
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$Message.success('已复制到剪贴板')
        }).catch(() => {
          this.$Message.warning('复制失败，请手动复制')
        })
      } else {
        const input = document.createElement('textarea')
        input.value = text
        document.body.appendChild(input)
        input.select()
        try {
          document.execCommand('copy')
          this.$Message.success('已复制到剪贴板')
        } catch (err) {
          this.$Message.warning('复制失败，请手动复制')
        }
        document.body.removeChild(input)
      }
    },
    toNumber(value) {
      if (value === null || value === undefined || value === '') return null
      const num = Number(value)
      return isNaN(num) ? null : num
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
    archLabel (arch) {
      const map = { dense: 'Dense 稠密', moe: 'MoE 混合专家' }
      return map[arch] || arch
    },
    statusLabel (status) {
      const map = { active: '在售', pro: '付费 Pro', deprecated: '已弃用' }
      return map[status] || status
    },
  }
}
</script>

<style lang="less" scoped>
.model-plaza {
  padding: 16px;
  background: #f5f7f9;
  min-height: 100vh;

  &__header {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__search-bar {
    margin-top: 16px;
    background: #fff;
    padding: 12px 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 12px;

    // 搜索输入框：13px（iView 默认 14px，需穿透到子组件并 !important 覆盖）
    /deep/ .ivu-input,
    /deep/ .ivu-input-placeholder {
      font-size: 13px !important;
    }
  }

  &__search-input {
    width: 300px;
  }

  &__search-btn {
    font-size: 13px;
  }

  .filter-panel {
    margin-bottom: 20px;
    .filter-row {
      display: flex;
      align-items: center;
      padding: 8px 0;

      &__label {
        width: 80px;
        color: #808695;
        font-size: 13px;
        flex-shrink: 0;
      }

      &__content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .filter-item {
          padding: 4px 16px;
          border-radius: 2px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          background: transparent;
          border: 1px solid transparent;

          &:hover {
            color: #2d8cf0;
          }

          &--active {
            background: #e8f4ff;
            color: #2d8cf0;
            border: 1px solid #2d8cf0;
          }
        }
      }
    }
  }

  &__content {
    margin-top: 16px;
    min-height: 400px;
  }

  .model-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  @media (max-width: 1200px) {
    .model-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 900px) {
    .model-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .model-grid {
      grid-template-columns: 1fr;
    }
  }

  .loading-container,
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #808695;

    p {
      margin-top: 16px;
      font-size: 14px;
    }
  }

  .model-card {
    position: relative;
    transition: all 0.3s;
    overflow: hidden;
    border: 1px solid transparent;
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #2d8cf0;
    }

    &__badge {
      position: absolute;
      top: 5px;
      right: 0;
      background: #f5222d;
      color: #fff;
      padding: 2px 20px;
      font-size: 12px;
      transform: rotate(45deg) translate(15px, -15px);
      width: 80px;
      text-align: center;
      z-index: 1;

      &--pro {
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      }
      &--new {
        background: #f5222d;
      }
      &--deprecated {
        background: #909399;
      }
    }

    &__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed #f0f0f0;
    }

    .chip {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      background: #f5f7fa;
      color: #606266;
      line-height: 16px;

      &--blue { background: #ecf5ff; color: #1890ff; }
      &--green { background: #f0f9eb; color: #67c23a; }
      &--purple { background: #f4eafe; color: #7c3aed; }
      &--cyan { background: #e6fffb; color: #13c2c2; }
      &--orange { background: #fff7e6; color: #fa8c16; }
    }

    &__top {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    &__icon {
      width: 48px;
      height: 48px;
      background: #f0faff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__info {
      flex: 1;
      min-width: 0;

      .title {
        font-size: 14px;
        font-weight: bold;
        color: #17233d;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .meta {
        font-size: 12px;
        color: #808695;

        .divider {
          margin: 0 8px;
          color: #dcdee2;
        }

        .price {
          color: #ed4014;
        }
      }
    }

    &__desc {
      font-size: 12px;
      color: #515a6e;
      line-height: 1.6;
      height: 40px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

// 抽屉样式
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

    .header-btns {
      display: flex;
      gap: 12px;
      margin-top: 8px;

      .experience-btn {
        background: #2d8cf0;
        width: 120px;
      }
    }
  }

  &__section {
    .section-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 16px;
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

    .value code {
      font-family: 'Courier New', monospace;
      background: #f5f7fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
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

            &--purple { background: #f4eafe; color: #7c3aed; }
            &--cyan { background: #e6fffb; color: #13c2c2; }
            &--orange { background: #fff7e6; color: #fa8c16; }
          }

          .price-row {
            display: flex;
            margin-bottom: 4px;

            .price-key {
              color: #808695;
              width: 80px;
            }

            .price-val {
              color: #2d8cf0;
              font-weight: bold;
            }
          }

          &.desc-block {
            white-space: pre-wrap;
            line-height: 1.8;
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
  }
}

// Tabs 样式微调
.model-detail-tabs {
  /deep/ .ivu-tabs-bar {
    margin-bottom: 16px;
  }
}

// 覆盖 iView 样式
/deep/ .ivu-card-body {
  padding: 20px;
}

/deep/ .model-detail-drawer {
  .ivu-drawer-body {
    padding: 24px 0;
  }
}
</style>