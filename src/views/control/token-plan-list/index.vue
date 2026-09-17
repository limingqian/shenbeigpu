<template>
  <div class="tpl-page">
    <!-- 顶部面包屑 -->
    <div class="tpl-page__header">
      <Breadcrumb>
        <BreadcrumbItem>Token Plan</BreadcrumbItem>
        <BreadcrumbItem>我的套餐</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 页面标题 -->
    <div class="tpl-page__headline">
      <h2 class="tpl-page__title">我的 Token Plan</h2>
    </div>

    <!-- 初始加载占位：避免进入页面就闪一下空状态 -->
    <div v-if="loading && !planLoaded" class="tpl-loading">
      <Spin size="large" />
      <div class="tpl-loading__text">加载中...</div>
    </div>

    <!-- 主体内容 -->
    <div class="tpl-body" v-else-if="hasPlan">
      <!-- 左：窗口限制用量卡 -->
      <div class="tpl-card tpl-quota-card">
        <div class="tpl-card__title tpl-quota-card__title">窗口限制用量</div>

        <div v-for="w in quotaWindows" :key="w.key" class="tpl-quota-row">
          <div class="tpl-quota-row__head">
            <div class="tpl-quota-row__head-left">
              <span class="tpl-quota-row__icon" :class="'tpl-quota-row__icon--' + w.icon">{{ windowIconText(w) }}</span>
              <span class="tpl-quota-row__label">{{ w.label }}</span>
              <span class="tpl-quota-row__used-line">
                已用 <strong>{{ formatNumber(windowUsed(w)) }}</strong>
                <span class="tpl-quota-row__divider">/</span>
                上限 <strong>{{ formatNumber(windowLimit(w)) }}</strong> CPC
              </span>
            </div>
            <span class="tpl-quota-row__percent">
              {{ windowPercent(w) }}<span class="tpl-quota-row__percent-suffix">% 已用</span>
            </span>
          </div>

          <div class="tpl-progress">
            <div class="tpl-progress__bar" :style="{ width: windowPercent(w) + '%' }"
              :class="progressBarClass(windowPercent(w))"></div>
          </div>
        </div>
      </div>

      <!-- 右：当前套餐卡 -->
      <div class="tpl-card tpl-plan-card">
        <div class="tpl-plan-card__head">
          <span class="tpl-card__title">当前套餐</span>
          <Tag color="success">{{ statusText }}</Tag>
        </div>

        <div class="tpl-plan-card__main">
          <div class="tpl-plan-card__version">{{ currentPlan.name }}</div>
          <div class="tpl-plan-card__meta">
            <div class="tpl-plan-card__meta-item">
              <span class="tpl-plan-card__meta-label">计费周期</span>
              <span class="tpl-plan-card__meta-value">{{ currentPlan.period }}</span>
            </div>
            <div class="tpl-plan-card__meta-item">
              <span class="tpl-plan-card__meta-label">生效时间</span>
              <span class="tpl-plan-card__meta-value">{{ currentPlan.startText }} ~ {{ currentPlan.endText }}</span>
            </div>
            <div class="tpl-plan-card__meta-item">
              <span class="tpl-plan-card__meta-label">到期剩余</span>
              <span class="tpl-plan-card__meta-value">
                <strong :class="{ 'is-expired': daysLeft <= 0 }">{{ daysLeftText }}</strong>
              </span>
            </div>
          </div>
        </div>

        <div class="tpl-plan-card__ops">
          <Button @click="goOrders">查看订单</Button>
          <Button type="primary" :loading="renewLoading" :disabled="currentPlan.status === 'expired'"
            @click="openRenewModal">
            {{ currentPlan.status === 'expired' ? '已过期' : '续费或升级' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- TokenPlan KEY 区块 -->
    <div class="tpl-card tpl-key-card" v-if="hasPlan">
      <div class="tpl-key-card__head">
        <span class="tpl-card__title">Token Plan KEY</span>
        <div class="tpl-key-card__head-right">
          <span class="tpl-key-card__usage" @click="showUsageModal = true">
            <Icon type="ios-help-circle-outline" />
            <span>使用说明</span>
          </span>
          <span class="tpl-key-card__action" :class="{ 'is-disabled': tokenPlanKeys.length >= maxKeyCount }"
            @click="openCreateKeyModal">＋ 创建KEY<span v-if="tokenPlanKeys.length >= maxKeyCount" class="tpl-key-card__limit">（{{ tokenPlanKeys.length }}/{{ maxKeyCount }}）</span></span>
        </div>
      </div>

      <div class="tpl-key-content" style="position: relative; min-height: 60px;">
        <Spin fix v-if="keyLoading" />
        <div v-if="tokenPlanKeys.length === 0 && !keyLoading" class="tpl-key-empty">
          <p>暂无TokenPlan KEY</p>
        </div>
        <div v-else>
          <div v-for="k in tokenPlanKeys" :key="k.id" class="tpl-key-row">
            <div class="tpl-key-row__top">
              <span class="tpl-key-row__tag">{{ k.keyName }}</span>
              <span class="tpl-key-row__value" :title="k.apiKey">KEY：{{ k.apiKey }}</span>
              <a class="tpl-key-row__copy" @click="copyApiKey(k.apiKey)">
                <Icon type="md-copy" />
                <span>复制</span>
              </a>
            </div>
            <div class="tpl-key-row__bottom">
              <span class="tpl-key-row__time">创建时间：{{ k.createTime }}</span>
              <div class="tpl-key-row__ops">
                <span class="tpl-key-row__op tpl-key-row__op--edit" @click="onEditKey(k)">编辑</span>
                <span class="tpl-key-row__divider">|</span>
                <span class="tpl-key-row__op tpl-key-row__op--del" @click="onDeleteKey(k)">删除</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无套餐占位（接口已加载完成且确认无套餐） -->
    <div v-else-if="planLoaded && !hasPlan" class="tpl-empty">
      <div class="tpl-empty__icon">
        <Icon type="ios-cube-outline" size="48" />
      </div>
      <div class="tpl-empty__title">您还未购买 Token Plan 套餐</div>
      <div class="tpl-empty__desc">购买后即可查看用量、配额与续费</div>
      <Button type="primary" @click="goBuy">立即购买</Button>
    </div>

    <!-- 创建TokenPlan KEY 弹框 -->
    <Modal v-model="showCreateKeyModal" title="新建TokenPlan KEY" :mask-closable="false" @on-ok="handleCreateKey">
      <Form :model="createKeyForm" :rules="createKeyFormRules" ref="createKeyFormRef" :label-width="120">
        <FormItem label="KEY名称" prop="keyName">
          <Input v-model="createKeyForm.keyName" placeholder="请输入KEY名称" />
        </FormItem>
      </Form>
    </Modal>

    <!-- 编辑TokenPlan KEY 弹框 -->
    <Modal v-model="showEditKeyModal" title="编辑TokenPlan KEY" :mask-closable="false" @on-ok="handleUpdateKey">
      <Form :model="editKeyForm" :rules="editKeyFormRules" ref="editKeyFormRef" :label-width="120">
        <FormItem label="KEY名称" prop="keyName">
          <Input v-model="editKeyForm.keyName" placeholder="请输入KEY名称" />
        </FormItem>
      </Form>
    </Modal>

    <!-- Token Plan 调用说明弹框 -->
    <Modal v-model="showUsageModal" title="Token Plan 调用说明" :mask-closable="false" width="620">
      <div class="tpl-usage">
        <div class="tpl-usage__section">
          <div class="tpl-usage__label">接口地址</div>
          <div class="tpl-usage__value"><code>http://api.power.xjit.com/v1/chat/completions</code></div>
        </div>
        <div class="tpl-usage__section">
          <div class="tpl-usage__label">认证方式</div>
          <div class="tpl-usage__value">在请求头中携带 <code>Authorization: Bearer &lt;TokenPlan KEY&gt;</code>，请将下方示例中的 KEY 替换为您创建的 TokenPlan KEY。</div>
        </div>
        <div class="tpl-usage__section">
          <div class="tpl-usage__label">调用示例</div>
          <div class="tpl-usage__code-wrap">
            <a class="tpl-usage__copy" @click="copyUsageExample">
              <Icon type="md-copy" />
              <span>复制示例</span>
            </a>
            <pre class="tpl-usage__code">{{ usageCurlExample }}</pre>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="showUsageModal = false">我知道了</Button>
      </div>
    </Modal>

    <!-- 续费 / 升级 弹框（融合原 token-plan-buy 业务逻辑，样式按设计图） -->
    <Modal v-model="showRenewModal" :footer-hide="true" :mask-closable="false" :closable="true"
      width="560" class-name="tpl-renew-modal" :title="null" transfer>
      <div class="tpl-renew-modal__inner">
        <div class="tpl-renew-modal__head">
          <h3 class="tpl-renew-modal__title">确认订单并支付</h3>
          <p class="tpl-renew-modal__sub">未支付前可随时调整套餐与周期，生效周期将根据所选周期自动计算。</p>
        </div>

        <Spin fix v-if="renewInitLoading"></Spin>

        <div class="tpl-renew-modal__body">
          <!-- 上：选择套餐 -->
          <div class="tpl-renew-modal__section">
            <div class="tpl-renew-modal__section-title">选择套餐</div>

            <!-- 计费周期（先选） -->
            <div class="tpl-renew-modal__block-label">计费周期</div>
            <div class="tpl-renew-modal__periods">
              <div v-for="pd in availablePeriods" :key="pd.id"
                class="tpl-renew-modal__period"
                :class="{ 'is-selected': activePeriod === pd.id, 'is-disable': pd.isDisable }"
                @click="pd.isDisable ? null : selectPeriod(pd.id)">
                {{ pd.label }}
              </div>
            </div>

            <!-- 版本（后选） -->
            <div class="tpl-renew-modal__block-label">版本</div>
            <div class="tpl-renew-modal__plans">
              <div v-for="p in availablePlans" :key="p.id"
                class="tpl-renew-modal__plan"
                :class="{ 'is-selected': activePlan === p.id, 'is-disable': p.isDisable }"
                @click="p.isDisable ? null : selectPlan(p.id)">
                <div class="tpl-renew-modal__plan-name">{{ p.name }}</div>
                <div class="tpl-renew-modal__plan-price">
                  <span class="tpl-renew-modal__plan-currency">¥</span><span class="tpl-renew-modal__plan-num">{{ formatMoney(currentPriceForPeriod(activePeriod, p.id)) }}</span>
                  <span class="tpl-renew-modal__plan-unit">/{{ activePeriod === 'yearly' ? '年' : '月' }}</span>
                </div>
              </div>
            </div>

            <!-- 生效信息 -->
            <div class="tpl-renew-modal__info">
              <div class="tpl-renew-modal__info-row">
                <span class="tpl-renew-modal__info-label">生效开始</span>
                <span class="tpl-renew-modal__info-value">{{ effectiveStartText }}</span>
              </div>
              <div class="tpl-renew-modal__info-row">
                <span class="tpl-renew-modal__info-label">生效结束</span>
                <span class="tpl-renew-modal__info-value">{{ effectiveEndText }}</span>
              </div>
              <div class="tpl-renew-modal__info-row">
                <span class="tpl-renew-modal__info-label">限制（日 / 周 / 月 ）</span>
                <span class="tpl-renew-modal__info-value">{{ currentLimits.r5h }} CPC / {{ currentLimits.r7d }} CPC / {{ currentLimits.monthly }} CPC</span>
              </div>
            </div>
          </div>

          <!-- 下：支付方式 + 订单明细 -->
          <div class="tpl-renew-modal__pay">
            <div class="tpl-renew-modal__section-title">支付方式</div>

            <div class="tpl-renew-modal__detail">
              <div class="tpl-renew-modal__detail-row">
                <span class="tpl-renew-modal__detail-name">{{ summaryLine }}</span>
                <span class="tpl-renew-modal__detail-amount">¥{{ payableText }}</span>
              </div>
              <div class="tpl-renew-modal__detail-row">
                <span class="tpl-renew-modal__detail-name">生效周期</span>
                <span class="tpl-renew-modal__detail-amount">{{ effectiveStartText }} ~ {{ effectiveEndText }}</span>
              </div>
              <div class="tpl-renew-modal__detail-row">
                <span class="tpl-renew-modal__detail-name">应付合计</span>
                <span class="tpl-renew-modal__detail-amount tpl-renew-modal__detail-amount--red">¥{{ payableText }}</span>
              </div>
              <div class="tpl-renew-modal__detail-row">
                <span class="tpl-renew-modal__detail-name">余额抵扣</span>
                <span class="tpl-renew-modal__detail-amount tpl-renew-modal__detail-amount--green">-¥{{ formatMoney(Number(form.balanceAmount).toFixed(2)) }}</span>
              </div>
              <div v-if="serverDeductionAmount > 0" class="tpl-renew-modal__detail-row">
                <span class="tpl-renew-modal__detail-name">
                  余量抵扣
                  <Tooltip transfer placement="top" max-width="240" content="旧套餐的剩余金额会在套餐升级时转换为金额并进行抵扣">
                    <span class="tpl-renew-modal__detail-help">?</span>
                  </Tooltip>
                </span>
                <span class="tpl-renew-modal__detail-amount tpl-renew-modal__detail-amount--green">-¥{{ formatMoney(Number(serverDeductionAmount).toFixed(2)) }}</span>
              </div>
              <div class="tpl-renew-modal__detail-row tpl-renew-modal__detail-row--payable">
                <span class="tpl-renew-modal__detail-name">第三方支付金额</span>
                <span class="tpl-renew-modal__detail-amount tpl-renew-modal__detail-amount--payable">¥{{ payableAfterDeduct }}</span>
              </div>
            </div>

            <div class="tpl-renew-modal__balance">
              <Checkbox v-model="useBalanceChecked" :disabled="availableBalance <= 0" style="margin-top: 2px;"></Checkbox>
              <div class="tpl-renew-modal__balance-text">
                使用账户余额抵扣 (当前账户可用余额
                <span class="tpl-renew-modal__price-red">¥{{ availableBalanceText }}</span>)
              </div>
            </div>

            <div v-if="form.useBalance && balancePayableMax > 0 && useBalanceChecked" class="tpl-renew-modal__balance-input">
              <span class="tpl-renew-modal__balance-label">余额支付:</span>
              <InputNumber v-model="form.balanceAmount"
                :max="Math.min(Math.max(availableBalance, 0), balancePayableMax)" :min="0" :step="0.01"
                size="small" style="width: 120px; margin-left: 8px;" placeholder="请输入金额"
                @on-change="handleBalanceAmountChange" @on-blur="handleBalanceAmountBlur" />
              <span v-if="payableAfterDeduct > 0" class="tpl-renew-modal__balance-tip">还需支付 ¥{{ payableAfterDeduct }}</span>
              <span v-else class="tpl-renew-modal__balance-tip tpl-renew-modal__balance-tip--ok">余额已足额抵扣</span>
            </div>

            <div class="tpl-renew-modal__payfoot">
              <Button type="primary" size="large" long :loading="purchaseLoading" @click="handlePay">提交订单</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 支付确认弹框（余额 / 微信） -->
    <Modal v-model="payModalVisible" :title="payModalTitle" :mask-closable="false" :footer-hide="payMethodIsWechat"
      @on-cancel="handlePayModalCancel">
      <div class="tpb-pay-modal__order">
        <div class="tpb-pay-modal__row">
          <span>套餐</span>
          <strong>{{ selectedPlan.name }} · {{ selectedPeriod.label }}</strong>
        </div>
        <div class="tpb-pay-modal__row">
          <span>应付金额</span>
          <strong class="tpb-pay-modal__amount">¥{{ payableAfterDeduct }}</strong>
        </div>
        <div v-if="payMethodIsBalance" class="tpb-pay-modal__row">
          <span>账户余额</span>
          <span>¥{{ balanceText }}</span>
        </div>
      </div>
      <div v-if="payMethodIsBalance" class="tpb-pay-modal__balance">
        <Form ref="payPwdFormRef" :model="payPwdForm" :rules="payPwdRules" :label-width="100">
          <FormItem label="支付密码" prop="payPassword">
            <Input v-model="payPwdForm.payPassword" type="password" maxlength="6" placeholder="请输入6位支付密码"
              style="width: 220px" autocomplete="new-password" />
          </FormItem>
          <FormItem>
            <a class="tpb-pay-modal__link" @click.prevent="openSetPayPwdModal">未设置支付密码？前往设置</a>
          </FormItem>
        </Form>
      </div>
      <div v-else-if="payMethodIsWechat" class="tpb-pay-modal__wechat">
        <div class="tpb-pay-modal__wechat-tip">还需微信支付：<strong class="tpb-pay-modal__amount">¥{{ payableAfterDeduct }}</strong></div>
        <div class="tpb-pay-modal__qr">
          <canvas v-if="qrCodeUrl" ref="qrCanvas" width="150" height="150" style="margin: 0 auto; display: block;"></canvas>
          <div v-else style="width: 150px; height: 150px; margin: 0 auto; background: #fff; border: 1px solid #dcdee2; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #c5c8ce; font-size: 12px;">二维码加载中...</span>
          </div>
        </div>
        <p class="tpb-pay-modal__qr-hint">请使用微信扫一扫完成支付</p>
      </div>
      <div v-if="payMethodIsBalance" slot="footer">
        <Button @click="handlePayModalCancel">取消</Button>
        <Button type="primary" :loading="payModalLoading" @click="handlePayConfirm">确认支付 ¥{{ payableAfterDeduct }}</Button>
      </div>
    </Modal>

    <!-- 设置支付密码弹框 -->
    <Modal v-model="setPayPwdModalVisible" title="设置支付密码" :mask-closable="false" @on-cancel="handleSetPayPwdCancel">
      <Form ref="setPayPwdFormRef" :model="setPayPwdForm" :rules="setPayPwdRules" :label-width="100">
        <FormItem label="支付密码" prop="newPassword">
          <Input v-model="setPayPwdForm.newPassword" type="password" maxlength="6" placeholder="请输入6位支付密码"
            style="width: 70%" autocomplete="new-password" />
        </FormItem>
        <FormItem label="确认密码" prop="confirmPassword">
          <Input v-model="setPayPwdForm.confirmPassword" type="password" maxlength="6" placeholder="请再次输入密码"
            style="width: 70%" autocomplete="new-password" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleSetPayPwdCancel">取消</Button>
        <Button type="primary" :loading="setPayPwdLoading" @click="handleSetPayPwdOk">确定</Button>
      </div>
    </Modal>

    <!-- 支付成功 / API KEY 弹框 -->
    <Modal v-model="successModalVisible" :closable="false" :mask-closable="false" :footer-hide="true" width="520"
      class-name="tokenplan-success-modal">
      <div class="tokenplan-success">
        <div class="tokenplan-success__icon">
          <div class="tokenplan-success__icon-circle">
            <span class="tokenplan-success__icon-check">✓</span>
          </div>
        </div>
        <div class="tokenplan-success__title">支付成功，套餐已生效</div>
        <div class="tokenplan-success__sub">已为您生成专属 API Key，请妥善保管，勿泄露</div>
        <!-- <div class="tokenplan-success__key">
          <div class="tokenplan-success__key-left">
            <div class="tokenplan-success__key-label">您的 API KEY</div>
            <div class="tokenplan-success__key-value">
              <span v-if="successOrderInfo.apiKeyLoading" style="color: #808695;">生成中...</span>
              <span v-else>{{ successOrderInfo.apiKey }}</span>
            </div>
          </div>
          <Button type="primary" class="tokenplan-success__copy"
            :disabled="successOrderInfo.apiKeyLoading || !successOrderInfo.apiKey" @click="handleCopyApiKey">复制</Button>
        </div> -->
        <div class="tokenplan-success__detail">
          <div class="tokenplan-success__detail-row">
            <span class="tokenplan-success__detail-label">套餐</span>
            <span class="tokenplan-success__detail-value tokenplan-success__detail-value--accent">{{ successOrderInfo.packageName || '-' }}</span>
          </div>
          <div class="tokenplan-success__detail-row">
            <span class="tokenplan-success__detail-label">周期</span>
            <span class="tokenplan-success__detail-value tokenplan-success__detail-value--accent">{{ successOrderInfo.period || '-' }}</span>
          </div>
          <div class="tokenplan-success__detail-row">
            <span class="tokenplan-success__detail-label">到期</span>
            <span class="tokenplan-success__detail-value tokenplan-success__detail-value--accent">{{ successOrderInfo.expireTime || '-' }}</span>
          </div>
        </div>
        <div class="tokenplan-success__actions">
          <Button type="primary" long class="tokenplan-success__btn-primary" @click="handleSuccessOk">我的套餐</Button>
          <Button long class="tokenplan-success__btn-ghost" @click="handleSuccessCancel">查看订单</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-control-token-plan-list',
  data () {
    return {
      hasPlan: false,
      planLoaded: false, // 接口是否已加载完成（用于决定显示 loading 还是空状态）
      loading: false,
      renewLoading: false,

      // 当前套餐
      currentPlan: {
        id: '',
        name: '',
        tag: '',
        period: '',
        status: '',
        startText: '',
        endText: '',
        startTime: '',
        endTime: ''
      },

      // Token 配额与用量
      quota: {
        usedTotalUsd: 0,
        r5hLimit: 0,
        r5hUsed: 0,
        r7dLimit: 0,
        r7dUsed: 0,
        monthlyLimit: 0,
        monthlyUsed: 0
      },

      // 窗口限制用量 - 配置项
      quotaWindows: [
        {
          key: 'r5h',
          label: '日限制',
          icon: 'daily',
          usedKey: 'r5hUsed',
          limitKey: 'r5hLimit'
        },
        {
          key: 'r7d',
          label: '周限制',
          icon: 'weekly',
          usedKey: 'r7dUsed',
          limitKey: 'r7dLimit'
        },
        {
          key: 'monthly',
          label: '月限制',
          icon: 'monthly',
          usedKey: 'monthlyUsed',
          limitKey: 'monthlyLimit'
        }
      ],

      // TokenPlan KEY 列表
      tokenPlanKeys: [],
      keyLoading: false,
      showCreateKeyModal: false,
      showEditKeyModal: false,
      createKeyForm: {
        keyName: ''
      },
      createKeyFormRules: {
        keyName: [
          { required: true, message: 'KEY名称不能为空', trigger: 'blur' }
        ]
      },
      editKeyForm: {
        id: '',
        keyName: ''
      },
      editKeyFormRules: {
        keyName: [
          { required: true, message: 'KEY名称不能为空', trigger: 'blur' }
        ]
      },

      // TokenPlan KEY 最大数量限制
      maxKeyCount: 5,

      // 使用说明弹框 + 调用示例
      showUsageModal: false,
      usageCurlExample: [
        'curl http://api.power.xjit.com/v1/chat/completions \\',
        '  -H "Content-Type: application/json" \\',
        '  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\',
        "  -d '{",
        '    "model": "MiniMax-M3",',
        '    "messages": [{"role": "user", "content": "Hello!"}]',
        "  }'"
      ].join('\n'),

      // 计费周期映射
      billingCycleMap: {
        monthly: '月付',
        quarterly: '季付',
        yearly: '年付'
      },
      // 套餐档位映射
      levelMap: {
        standard: '标准版',
        professional: '专业版',
        ultimate: '旗舰版'
      },

      // ============ 续费/升级弹框（原 token-plan-buy 业务逻辑融合） ============
      showRenewModal: false, // 续费/升级弹框是否展示
      renewInitLoading: false, // 续费弹框初始加载
      tokenplanOrderType: '', // 订单类型：new / renew / upgrade
      activePlan: '', // 当前选中档位（空 = 未选中，由 applyPlanSelection 按优先级兜底）
      activePeriod: '', // 当前选中计费周期（空 = 未选中，由 applyPlanSelection 按优先级兜底）
      groupsRaw: [], // 后端分组原始数据
      currentPlanRaw: null, // getCurrentPlan 返回的原始套餐字段（tokenplanId/Level/BillingCycle），用于弹框选中兜底
      groups: [], // 树形：version → period
      periodLabelMap: { monthly: '月付', quarterly: '季付', yearly: '年付' },
      levelLabelMap: { standard: '标准版', professional: '专业版', ultimate: '旗舰版' },
      balance: 0.00, // 账户余额
      frozenBalance: 0, // 冻结余额
      form: { useBalance: true, balanceAmount: 0, billingType: 'monthly' },
      activePayMethod: 'balance',
      purchaseLoading: false,
      // 支付确认弹框
      payModalVisible: false,
      payModalLoading: false,
      qrCodeUrl: '',
      // 支付成功弹框
      successModalVisible: false,
      successOrderInfo: {
        apiKey: '',
        apiKeyLoading: false,
        packageName: '',
        period: '',
        expireTime: ''
      },
      // 微信支付轮询
      testOrderId: '',
      isPolling: false,
      pollingTimer: null,
      pollingCount: 0,
      maxPollingCount: 200,
      pollingInterval: 3000,
      // 后端 getTokenPlanPrice 返回
      serverPrice: null,
      serverPaidAmount: null,
      serverEffectiveStart: null,
      serverEffectiveEnd: null,
      serverPriceLoading: false,
      serverDeductionAmount: 0,
      // 余额支付密码表单
      payPwdForm: { payPassword: '' },
      payPwdRules: {
        payPassword: [
          { required: true, message: '请输入支付密码', trigger: 'blur' },
          { len: 6, message: '支付密码为 6 位数字', trigger: 'blur' }
        ]
      },
      // 设置支付密码弹框
      setPayPwdModalVisible: false,
      setPayPwdLoading: false,
      setPayPwdForm: { newPassword: '', confirmPassword: '' },
      setPayPwdRules: {
        newPassword: [
          { required: true, message: '请输入支付密码', trigger: 'blur' },
          { len: 6, message: '支付密码为 6 位数字', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入支付密码', trigger: 'blur' },
          {
            validator: (rule, value, cb) => {
              if (value !== this.setPayPwdForm.newPassword) cb(new Error('两次输入的密码不一致'))
              else cb()
            },
            trigger: 'blur'
          }
        ]
      },
      // 兼容 token-plan-buy 内部字段
      orderResult: null,
      finalAmount: 0,
      useWechatPay: false
    }
  },
  computed: {
    statusText () {
      const s = this.currentPlan.status
      if (s === 'active') return '生效中'
      if (s === 'expiring') return '即将到期'
      if (s === 'expired') return '已过期'
      return '未知'
    },
    statusType () {
      const s = this.currentPlan.status
      if (s === 'active') return 'success'
      if (s === 'expiring') return 'warning'
      if (s === 'expired') return 'error'
      return 'default'
    },
    daysLeft () {
      try {
        const end = new Date(this.currentPlan.endTime.replace(/-/g, '/'))
        const now = new Date()
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
        return Math.max(0, diff)
      } catch (e) {
        return 0
      }
    },
    daysLeftText () {
      const diff = this.daysLeft
      if (diff <= 0) return '已到期 0 天'
      return diff + ' 天'
    },
    shortTermAlerts () {
      const alerts = []
      this.quotaWindows.forEach(w => {
        const p = this.windowPercent(w)
        if (p >= 80) {
          alerts.push(w.label + '已使用 ' + p + '%，请注意控制调用节奏。')
        }
      })
      return alerts
    },
    // ============ 续费/升级弹框的计算属性 ============
    availablePlans () {
      const groups = this.groups || []
      return groups.map(v => ({ id: v.id, name: v.name, isDisable: !!v.isDisable }))
    },
    availablePeriods () {
      // 先选计费周期：与 plan 解耦，只展示月付 / 年付（按后端是否有数据决定是否置灰）
      const groups = this.groups || []
      const periodLabelMap = this.periodLabelMap || {}
      const daysMap = { monthly: 30, quarterly: 90, yearly: 365 }
      const order = ['monthly', 'yearly']
      return order.map(pid => {
        // 任一 plan 下存在该 period 即视为可选；只有所有 plan 都缺失该 period 才置灰
        const exists = groups.some(v => v && (v.periods || []).some(p => p.id === pid))
        const raw = []
        groups.forEach(v => {
          (v.periods || []).forEach(p => { if (p.id === pid) raw.push(p.raw) })
        })
        const isDisable = !exists
        return { id: pid, label: periodLabelMap[pid] || pid, days: daysMap[pid] || 30, isDisable, raw }
      })
    },
    selectedPlan () {
      const list = this.availablePlans || []
      return list.find(p => p.id === this.activePlan) || list[0] || { id: '', name: '' }
    },
    selectedPeriod () {
      const list = this.availablePeriods || []
      return list.find(p => p.id === this.activePeriod) || list[0] || { id: 'monthly', label: '月付', days: 30 }
    },
    currentMatrixCell () {
      const levelCN = (this.levelLabelMap && this.levelLabelMap[this.activePlan]) || this.activePlan
      const periodCN = (this.periodLabelMap && this.periodLabelMap[this.activePeriod]) || this.activePeriod
      const groups = this.groupsRaw || []
      const hit = groups.find(g => g && g.tokenplanLevelLabel === levelCN && (g.tokenplanBillingCycleLabel === periodCN))
      if (!hit) return { price: 0, r5h: 0, r7d: 0, monthly: 0 }
      return {
        price: Number(hit.tokenplanPrice || 0),
        r5h: Number(hit.dailyLimitUsd || 0),
        r7d: Number(hit.weeklyLimitUsd || 0),
        monthly: Number(hit.monthlyLimitUsd || 0)
      }
    },
    currentPrice () {
      return this.currentMatrixCell.price || 0
    },
    currentServerTokenplanId () {
      const groups = this.groupsRaw || []
      const hit = groups.find(g =>
        g && g.tokenplanLevel === this.activePlan &&
        g.tokenplanBillingCycle === this.activePeriod
      )
      return hit && hit.id !== undefined ? hit.id : null
    },
    currentLimits () {
      return {
        r5h: this.formatNumber(this.currentMatrixCell.r5h || 0),
        r7d: this.formatNumber(this.currentMatrixCell.r7d || 0),
        monthly: this.formatNumber(this.currentMatrixCell.monthly || 0)
      }
    },
    summaryLine () {
      return (this.selectedPlan.name || '') + ' · ' + (this.selectedPeriod.label || '')
    },
    balanceText () {
      return this.formatMoney(this.balance)
    },
    availableBalance () {
      return parseFloat(this.balance || 0) - parseFloat(this.frozenBalance || 0)
    },
    availableBalanceText () {
      return this.availableBalance.toFixed(2)
    },
    frozenBalanceText () {
      return parseFloat(this.frozenBalance || 0).toFixed(2)
    },
    finalTotalAmount () {
      return parseFloat(this.currentPrice || 0)
    },
    payableAfterDeduct () {
      const balanceDeduct = (this.form.useBalance && this.form.balanceAmount > 0)
        ? parseFloat(this.form.balanceAmount || 0) : 0
      if (this.serverPaidAmount !== null && this.serverPaidAmount !== undefined && !isNaN(Number(this.serverPaidAmount))) {
        const paid = Number(this.serverPaidAmount)
        return Math.max(paid - balanceDeduct, 0).toFixed(2)
      }
      const total = parseFloat(this.finalTotalAmount || 0)
      const deduction = parseFloat(this.serverDeductionAmount || 0) > 0 ? parseFloat(this.serverDeductionAmount || 0) : 0
      return Math.max(total - deduction - balanceDeduct, 0).toFixed(2)
    },
    balancePayableMax () {
      if (this.serverPaidAmount !== null && this.serverPaidAmount !== undefined && !isNaN(Number(this.serverPaidAmount))) {
        return Math.max(0, Number(this.serverPaidAmount))
      }
      const total = parseFloat(this.finalTotalAmount || 0)
      const deduction = parseFloat(this.serverDeductionAmount || 0) > 0 ? parseFloat(this.serverDeductionAmount || 0) : 0
      return Math.max(total - deduction, 0)
    },
    useBalanceChecked: {
      get () { return !!this.form.useBalance },
      set (val) { this.form.useBalance = !!val }
    },
    payableText () {
      const price = this.serverPrice !== null && this.serverPrice !== undefined ? this.serverPrice : this.currentPrice
      return this.formatMoney(price)
    },
    balanceEnough () {
      return Number(this.balance || 0) >= Number(this.currentPrice || 0)
    },
    payBtnText () {
      if (!this.balanceEnough) return '余额不足'
      return '立即支付 ¥' + this.payableText
    },
    payMethodIsBalance () { return this.activePayMethod === 'balance' },
    payMethodIsWechat () { return this.activePayMethod === 'wechat' },
    payModalTitle () { return this.payMethodIsWechat ? '微信支付' : '支付确认' },
    effectiveStart () {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      return d
    },
    effectiveEnd () {
      const d = new Date(this.effectiveStart)
      d.setDate(d.getDate() + (this.selectedPeriod.days || 30))
      return d
    },
    effectiveStartText () {
      return this.serverEffectiveStart || this.formatDate(this.effectiveStart) || ''
    },
    effectiveEndText () {
      return this.serverEffectiveEnd || this.formatDate(this.effectiveEnd) || ''
    }
  },
  watch: {
    activePlan () { this.fetchTokenPlanPriceDebounced() },
    activePeriod () { this.fetchTokenPlanPriceDebounced() },
    'form.useBalance' (newVal) {
      if (newVal) this.autoFillBalanceAmount()
      else this.form.balanceAmount = 0
    },
    'finalTotalAmount' () { this.adjustBalanceAmount() }
  },
  created () {
    // 保存 promise：handleRedirectParams / applyPlanSelection 需等当前套餐信息就绪后再做选中兜底
    this.planInfoReady = this.loadPlanInfo()
  },
  mounted () {
    this.loadTokenPlanKeys()
    // 处理 portal/api 等入口的 query / localStorage 跳转参数：自动打开续费/升级弹框并选中档位/周期
    this.handleRedirectParams()
  },
  beforeDestroy () {
    clearTimeout(this._priceTimer)
    this.stopPaymentPolling && this.stopPaymentPolling()
  },
  methods: {

    // ============ 窗口限制用量 通用 helpers ============
    windowPercent (w) {
      const used = this.windowUsed(w)
      const limit = this.windowLimit(w)
      if (!limit) return 0
      return Math.round(used / limit * 100)
    },
    windowUsed (w) {
      const val = this.quota[w.usedKey]
      return val !== null && val !== undefined ? Number(val) : 0
    },
    windowLimit (w) {
      const val = this.quota[w.limitKey]
      return val !== null && val !== undefined ? Number(val) : 0
    },
    // 图标文字：日 / 周 / 月
    windowIconText (w) {
      const map = { r5h: '日', r7d: '周', monthly: '月' }
      return map[w.key] || '·'
    },
    // 格式化日期显示
    formatDateText (dateStr) {
      if (!dateStr) return ''
      return dateStr.replace(/-/g, '/').substring(0, 10)
    },
    async loadPlanInfo () {
      this.loading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/getCurrentPlan',
          method: 'post',
          data: {}
        })
        if (res.errcode !== 0) {
          this.$Message.error(res.errmsg || '获取套餐信息失败')
          this.hasPlan = false
          return
        }
        const data = res.data
        if (!data || !data.id) {
          this.hasPlan = false
          return
        }
        // 保留原始字段，供弹框默认选中兜底（applyPlanSelection 第 ③ 优先级）
        this.currentPlanRaw = {
          tokenplanId: data.tokenplanId || '',
          tokenplanLevel: data.tokenplanLevel || '',
          tokenplanBillingCycle: data.tokenplanBillingCycle || ''
        }
        // 映射套餐信息
        this.currentPlan = {
          id: data.id || '',
          name: this.levelMap[data.tokenplanLevel] || data.tokenplanLevel || '',
          tag: data.planDesc || '',
          period: this.billingCycleMap[data.tokenplanBillingCycle] || data.tokenplanBillingCycle || '',
          status: data.tokenplanStatus === '0' ? 'active' : (data.status || 'expired'),
          startTime: data.effectiveTime || '',
          endTime: data.expirationTime || '',
          startText: this.formatDateText(data.effectiveTime),
          endText: this.formatDateText(data.expirationTime)
        }
        // 映射配额信息
        if (data.quota) {
          this.quota = {
            usedTotalUsd: data.quota.usedTotalUsd || 0,
            r5hLimit: data.quota.r5hLimit || 0,
            r5hUsed: data.quota.r5hUsed || 0,
            r7dLimit: data.quota.r7dLimit || 0,
            r7dUsed: data.quota.r7dUsed || 0,
            monthlyLimit: data.quota.monthlyLimit || 0,
            monthlyUsed: data.quota.monthlyUsed || 0
          }
        }
        this.hasPlan = true
      } catch (e) {
        console.error('[TokenPlan/getCurrentPlan] 失败:', e)
        this.hasPlan = false
      } finally {
        this.loading = false
        this.planLoaded = true
      }
    },
    progressBarClass (p) {
      if (p >= 90) return 'is-danger'
      if (p >= 70) return 'is-warning'
      return ''
    },
    openRenewModal () {
      // 改为在当前页打开续费/升级弹框（融合原 token-plan-buy 业务）
      this.showRenewModal = true
      // 弹框打开时初始化数据（若已加载过则跳过）
      if (!this.groups || this.groups.length === 0) {
        this.renewInitLoading = true
        Promise.all([this.planInfoReady, this.fetchTokenPlans(), this.fetchBalance()]).finally(() => {
          this.renewInitLoading = false
          // 无 URL 参数入口：按 当前套餐 → 第一个可用组合 兜底选中
          this.applyPlanSelection({})
        })
      } else {
        this.applyPlanSelection({})
      }
    },
    goBuy () {
      // this.$router.push('/shenbeigpuai/control/token-plan-buy')
      this.openRenewModal()
    },
    goOrders () {
      this.$router.replace({ path: '/shenbeigpuai/control/order-list', query: { tab: 'tokenPlan' } })
    },
    formatMoney (n) {
      return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatNumber (n) {
      return Number(n || 0).toLocaleString('en-US')
    },
    // ============ TokenPlan KEY 相关（参考账号管理-账号管理-API密钥） ============
    async loadTokenPlanKeys () {
      this.keyLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userApiKeyPackageService/listPackageUserApiKey',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0) {
          this.tokenPlanKeys = (res.data || []).map(item => ({
            id: item.id,
            keyName: item.key_name || item.keyName,
            userId: item.user_id,
            apiKey: item.api_key || item.apiKey,
            createTime: item.create_time ? String(item.create_time).split(' ')[0] : ''
          }))
        } else if (res.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(res.errmsg || '加载TokenPlan KEY失败')
        }
      } catch (e) {
        console.error('[TokenPlanKey/list] 失败:', e)
        this.$Message.error('加载TokenPlan KEY失败，请稍后重试')
      } finally {
        this.keyLoading = false
      }
    },
    generateRandomString (length) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    },
    openCreateKeyModal () {
      if (this.tokenPlanKeys.length >= this.maxKeyCount) {
        this.$Message.warning(`TokenPlan KEY 数量已达上限 ${this.maxKeyCount} 个，请先删除后再创建`)
        return
      }
      this.createKeyForm.keyName = ''
      this.showCreateKeyModal = true
    },
    handleCreateKey () {
      this.$refs.createKeyFormRef.validate(async (valid) => {
        if (!valid) return
        if (this.tokenPlanKeys.length >= this.maxKeyCount) {
          this.$Message.warning(`TokenPlan KEY 数量已达上限 ${this.maxKeyCount} 个`)
          this.showCreateKeyModal = false
          return
        }
        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/userApiKeyPackageService/createPackageUserApiKey',
            method: 'post',
            data: {
              keyName: this.createKeyForm.keyName,
              apiKey: this.generateRandomString(10)
            }
          })
          if (res.errcode === 0) {
            this.$Message.success('TokenPlan KEY创建成功')
            this.showCreateKeyModal = false
            this.createKeyForm.keyName = ''
            this.loadTokenPlanKeys()
          } else {
            this.$Message.error(res.errmsg || '创建TokenPlan KEY失败')
          }
        } catch (e) {
          console.error('[TokenPlanKey/create] 失败:', e)
          this.$Message.error('创建TokenPlan KEY失败，请稍后重试')
        }
      })
    },
    onEditKey (k) {
      this.editKeyForm.id = k.id
      this.editKeyForm.keyName = k.keyName
      this.showEditKeyModal = true
    },
    handleUpdateKey () {
      this.$refs.editKeyFormRef.validate(async (valid) => {
        if (!valid) return
        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/userApiKeyPackageService/updatePackageUserApiKey',
            method: 'post',
            data: {
              id: this.editKeyForm.id,
              keyName: this.editKeyForm.keyName
            }
          })
          if (res.errcode === 0) {
            this.$Message.success('TokenPlan KEY更新成功')
            this.showEditKeyModal = false
            this.editKeyForm.keyName = ''
            this.loadTokenPlanKeys()
          } else {
            this.$Message.error(res.errmsg || '更新TokenPlan KEY失败')
          }
        } catch (e) {
          console.error('[TokenPlanKey/update] 失败:', e)
          this.$Message.error('更新TokenPlan KEY失败，请稍后重试')
        }
      })
    },
    onDeleteKey (k) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `确定要删除KEY"${k.keyName}"吗？`,
        onOk: async () => {
          try {
            const res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/userApiKeyPackageService/deletePackageUserApiKey',
              method: 'post',
              data: { id: k.id }
            })
            if (res.errcode === 0) {
              this.$Message.success('TokenPlan KEY删除成功')
              this.loadTokenPlanKeys()
            } else {
              this.$Message.error(res.errmsg || '删除TokenPlan KEY失败')
            }
          } catch (e) {
            console.error('[TokenPlanKey/delete] 失败:', e)
            this.$Message.error('删除TokenPlan KEY失败，请稍后重试')
          }
        }
      })
    },
    copyText (text, successTip, failTip) {
      if (!text) return
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$Message && this.$Message.success(successTip)
        }).catch(() => {
          this.$Message && this.$Message.warning(failTip)
        })
      } else {
        const input = document.createElement('textarea')
        input.value = text
        document.body.appendChild(input)
        input.select()
        try {
          document.execCommand('copy')
          this.$Message && this.$Message.success(successTip)
        } catch (err) {
          this.$Message && this.$Message.warning(failTip)
        }
        document.body.removeChild(input)
      }
    },
    copyApiKey (apiKey) {
      this.copyText(apiKey, 'KEY已复制到剪贴板', '复制失败，请手动复制')
    },
    copyUsageExample () {
      this.copyText(this.usageCurlExample, '调用示例已复制到剪贴板', '复制失败，请手动复制')
    },

    // ============ 续费/升级弹框：原 token-plan-buy 业务逻辑（融合） ============
    /**
     * 处理 portal/api 等入口的 query / localStorage 跳转参数
     * - 已登录直接跳转：query.autoOpen === '1' 时自动打开续费弹框
     * - 未登录走 /login 回跳：localStorage.portal_redirect_autoOpen === '1' 时同样自动打开
     * - 选中项由 applyPlanSelection 按优先级解析：planId → level+billingCycle → 当前套餐 → 第一个可用
     */
    async handleRedirectParams () {
      const query = (this.$route && this.$route.query) || {}
      let autoOpen = query.autoOpen || ''
      let planId = query.planId || ''
      let level = query.level || ''
      let billingCycle = query.billingCycle || ''

      try {
        if (!autoOpen) autoOpen = localStorage.getItem('portal_redirect_autoOpen') || ''
        if (!planId) planId = localStorage.getItem('portal_redirect_planId') || ''
        if (!level) level = localStorage.getItem('portal_redirect_level') || ''
        if (!billingCycle) billingCycle = localStorage.getItem('portal_redirect_billingCycle') || ''
      } catch (e) { /* 忽略 localStorage 异常 */ }

      if (autoOpen !== '1') return

      // 等待当前套餐 / 套餐列表 / 账户余额全部就绪，再打开弹框并应用选中项
      if (!this.groups || this.groups.length === 0) {
        this.renewInitLoading = true
        try {
          await Promise.all([this.planInfoReady, this.fetchTokenPlans(), this.fetchBalance()])
        } finally {
          this.renewInitLoading = false
        }
      } else {
        await this.planInfoReady
      }

      // 按优先级应用选中：planId 反查 → level+billingCycle → 当前套餐 → 第一个可用组合
      this.applyPlanSelection({ planId, level, billingCycle })

      // 拉取选中档位 + 周期的价格（去抖，与 watcher 触发合并为一次请求）
      this.fetchTokenPlanPriceDebounced()

      // 打开弹框
      this.showRenewModal = true

      // 清理 localStorage 中的 portal_redirect_* 键，避免下次进入时残留
      try {
        localStorage.removeItem('portal_redirect_autoOpen')
        localStorage.removeItem('portal_redirect_billingCycle')
        localStorage.removeItem('portal_redirect_level')
        localStorage.removeItem('portal_redirect_planId')
      } catch (e) { /* 忽略 */ }
    },
    /**
     * 按优先级解析并应用弹框的档位/周期选中项（handleRedirectParams 与 openRenewModal 共用）：
     * ① URL 参数解析目标组合：planId 反查 groupsRaw 优先，其次 level + billingCycle
     * ② 当前套餐高于目标组合（档位或周期任一更低）→ 显示当前套餐；等于或高于 → 显示所选组合
     *    比较规则与后端一致：standard<professional<ultimate，monthly<quarterly<yearly
     * ③ 无 URL 参数时兜底当前套餐（老用户手动打开弹框的默认选中）
     * ④ 仍无有效选中时回落第一个可用组合
     * 说明：降级拦截由前端显式比较完成，不依赖 myListSub2ApiGroupPage 的 isDisable
     */
    applyPlanSelection ({ planId, level, billingCycle } = {}) {
      const groups = this.groups || []
      const levelOrder = ['standard', 'professional', 'ultimate']
      const periodOrder = ['monthly', 'quarterly', 'yearly']
      const cur = this.currentPlanRaw || {}
      const curLevelIdx = levelOrder.indexOf(cur.tokenplanLevel)
      const curPeriodIdx = periodOrder.indexOf(cur.tokenplanBillingCycle)

      // ① 解析跳转目标组合
      let targetLevel = ''
      let targetPeriod = ''
      if (planId && !this.activePlan) {
        const hit = (this.groupsRaw || []).find(g => g && String(g.id) === String(planId))
        if (hit) {
          targetLevel = hit.tokenplanLevel || ''
          targetPeriod = hit.tokenplanBillingCycle || ''
        }
      }
      if (!targetLevel && level) targetLevel = level
      if (targetLevel && !targetPeriod && billingCycle) targetPeriod = billingCycle

      // ② 当前套餐 > 目标组合（档位或周期任一更低）→ 改为显示当前套餐
      if (targetLevel && (curLevelIdx >= 0 || curPeriodIdx >= 0)) {
        const tLevelIdx = levelOrder.indexOf(targetLevel)
        const tPeriodIdx = periodOrder.indexOf(targetPeriod)
        const targetLower = (tLevelIdx >= 0 && curLevelIdx >= 0 && tLevelIdx < curLevelIdx) ||
          (tPeriodIdx >= 0 && curPeriodIdx >= 0 && tPeriodIdx < curPeriodIdx)
        if (targetLower) {
          targetLevel = cur.tokenplanLevel
          targetPeriod = cur.tokenplanBillingCycle
        }
      }

      // 应用目标组合：命中弹框数据即覆盖（未命中走 ③④ 兜底）
      if (targetLevel) {
        const plan = groups.find(v => v && v.id === targetLevel)
        if (plan) {
          this.activePlan = plan.id
          const period = (plan.periods || []).find(pd => pd && pd.id === targetPeriod)
          if (period) this.activePeriod = period.id
        }
      }
      // ③ 当前套餐兜底：仅当还没有选中档位时使用（避免覆盖用户已选内容）
      if (!this.activePlan && curLevelIdx >= 0) {
        const plan = groups.find(v => v && v.id === cur.tokenplanLevel)
        if (plan) {
          this.activePlan = plan.id
          const period = (plan.periods || []).find(pd => pd && pd.id === cur.tokenplanBillingCycle)
          if (period) this.activePeriod = period.id
        }
      }
      // ④ 档位仍无有效选中时回落第一个可用档位；周期统一交给 syncActivePeriodToAvailable
      const currentPlanNode = groups.find(v => v && v.id === this.activePlan)
      if (!currentPlanNode || currentPlanNode.isDisable) {
        const firstAvailable = groups.find(v => v && !v.isDisable)
        this.activePlan = (firstAvailable && firstAvailable.id) || ''
      }
      this.syncActivePeriodToAvailable()
    },
    selectPlan (id) {
      this.activePlan = id
      // 切 plan 不再重置 period（先选周期、后选版本）
    },
    selectPeriod (id) {
      this.activePeriod = id
    },
    syncActivePeriodToAvailable () {
      const periods = this.availablePeriods || []
      if (!periods.length) return
      const current = periods.find(p => p.id === this.activePeriod)
      if (current && !current.isDisable) return
      const firstAvailable = periods.find(p => !p.isDisable)
      if (firstAvailable) this.activePeriod = firstAvailable.id
    },
    selectPayMethod (id) { this.activePayMethod = id },
    currentPriceForPeriod (periodId, planId) {
      const usePlanId = planId || this.activePlan
      const levelCN = (this.levelLabelMap && this.levelLabelMap[usePlanId]) || usePlanId
      const periodCN = (this.periodLabelMap && this.periodLabelMap[periodId]) || periodId
      const groups = this.groupsRaw || []
      const hit = groups.find(g => g && g.tokenplanLevelLabel === levelCN && (g.tokenplanBillingCycleLabel === periodCN))
      return hit ? Number(hit.tokenplanPrice || 0) : 0
    },
    formatDate (d) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${y}/${m}/${dd}`
    },
    formatDateOnly (val) {
      if (!val) return ''
      if (val instanceof Date) {
        const y = val.getFullYear()
        const m = String(val.getMonth() + 1).padStart(2, '0')
        const dd = String(val.getDate()).padStart(2, '0')
        return `${y}-${m}-${dd}`
      }
      const s = String(val)
      return s.length >= 10 ? s.substring(0, 10) : s
    },
    // 拉取账户余额
    async fetchBalance () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAccountService/getBalance',
          method: 'post',
          data: {}
        })
        if (res && res.errcode === 0 && res.data) {
          this.balance = parseFloat(res.data.balance) || 0
          this.frozenBalance = parseFloat(res.data.frozenBalance) || 0
          this.$nextTick(() => {
            if (this.form.useBalance) {
              const priceReady = this.serverPaidAmount !== null || (this.groupsRaw && this.groupsRaw.length > 0)
              if (priceReady) this.autoFillBalanceAmount()
            }
          })
        }
      } catch (e) {
        console.error('[TokenPlan/getBalance] 失败:', e)
      }
    },
    // 拉取套餐分组
    async fetchTokenPlans () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/myListSub2ApiGroupPage',
          method: 'post'
        })
        const businessData = res && res.data && res.data.data ? res.data.data : (res && res.data)
        const list = (businessData && (businessData.results || businessData.rows || businessData.records || businessData.list || businessData.data)) || []
        if (Array.isArray(list) && list.length) {
          this.groupsRaw = list
          this.groups = this.buildGroupsTree(list)
          this.syncActivePeriodToAvailable()
          this.fetchTokenPlanPriceDebounced()
        }
      } catch (e) {
        console.error('[TokenPlan/listSub2ApiGroupPage] 失败:', e)
      }
    },
    buildGroupsTree (flatList) {
      const list = Array.isArray(flatList) ? flatList : []
      const levelLabelMap = this.levelLabelMap || {}
      const periodLabelMap = this.periodLabelMap || {}
      const daysMap = { monthly: 30, quarterly: 90, yearly: 365 }
      const periodOrder = ['monthly', 'quarterly', 'yearly']
      const cnToLevelId = {}
      Object.keys(levelLabelMap).forEach(k => { cnToLevelId[levelLabelMap[k]] = k })
      const cnToPeriodId = {}
      Object.keys(periodLabelMap).forEach(k => { cnToPeriodId[periodLabelMap[k]] = k })
      const normalizePeriod = (g) => {
        const raw = g.tokenplanBillingCycleLabel || g.tokenplanBillingCycle
        if (!raw) return ''
        if (cnToPeriodId[raw]) return cnToPeriodId[raw]
        if (periodOrder.includes(raw)) return raw
        const m = parseInt(raw, 10)
        if (!isNaN(m)) { if (m === 1) return 'monthly'; if (m === 3) return 'quarterly'; if (m === 12) return 'yearly' }
        return raw
      }
      const normalizeLevel = (g) => {
        const raw = g.tokenplanLevel
        if (!raw) return ''
        if (cnToLevelId[raw]) return cnToLevelId[raw]
        if (['standard', 'professional', 'ultimate'].includes(raw)) return raw
        return raw
      }
      const byLevel = {}
      list.forEach(g => {
        if (!g) return
        const levelId = normalizeLevel(g)
        const periodId = normalizePeriod(g)
        if (!levelId) return
        if (!byLevel[levelId]) byLevel[levelId] = []
        byLevel[levelId].push({ raw: g, periodId: periodId, periodLabel: g.tokenplanBillingCycleLabel || periodLabelMap[periodId] || periodId })
      })
      const order = ['standard', 'professional', 'ultimate']
      const result = []
      order.forEach(id => {
        const arr = byLevel[id] || []
        if (arr.length === 0) return
        const periods = []
        const seenPeriod = new Set()
        periodOrder.forEach(pid => {
          const found = arr.find(x => x.periodId === pid)
          if (found) {
            seenPeriod.add(pid)
            periods.push({ id: pid, label: periodLabelMap[pid] || pid, days: daysMap[pid] || 30, isDisable: !!found.raw.isDisable, raw: found.raw })
          }
        })
        arr.forEach(x => {
          if (seenPeriod.has(x.periodId)) return
          const pid = x.periodId || 'unknown'
          periods.push({ id: pid, label: x.periodLabel || pid, days: 30, isDisable: !!x.raw.isDisable, raw: x.raw })
        })
        const allPeriodsDisabled = periods.length > 0 && periods.every(p => p.isDisable)
        result.push({ id: id, name: levelLabelMap[id] || id, isDisable: allPeriodsDisabled, periods: periods })
      })
      return result
    },
    // 去抖拉取价格：合并同一批次的多次触发（watcher / 套餐列表加载 / 跳转参数应用）
    fetchTokenPlanPriceDebounced () {
      clearTimeout(this._priceTimer)
      this._priceTimer = setTimeout(() => { this.fetchTokenPlanPrice() }, 200)
    },
    // 拉取价格（触发方请统一走 fetchTokenPlanPriceDebounced）
    async fetchTokenPlanPrice () {
      const tokenplanId = this.currentServerTokenplanId
      if (!tokenplanId && tokenplanId !== 0) return
      // 序号守卫：仅有最后一次请求的结果可以写入，避免旧响应覆盖新价格
      const seq = (this._priceSeq = (this._priceSeq || 0) + 1)
      this.serverPriceLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/getTokenPlanPrice',
          method: 'post',
          data: { tokenplan_id: tokenplanId }
        })
        if (seq !== this._priceSeq) return
        if (res && res.errcode === 0 && res.data) {
          const d = res.data
          this.tokenplanOrderType = d.tokenplanOrderType || ''
          const total = (d.totaltAmount !== undefined && d.totaltAmount !== null ? d.totaltAmount
            : (d.totalt_amount !== undefined && d.totalt_amount !== null ? d.totalt_amount
              : (d.totalAmount !== undefined ? d.totalAmount : d.calculatedAmount)))
          this.serverPrice = total !== undefined && total !== null ? Number(total) : 0
          const deduction = d.deductionAmount !== undefined && d.deductionAmount !== null
            ? Number(d.deductionAmount) : (d.deduction_amount !== undefined && d.deduction_amount !== null
              ? Number(d.deduction_amount) : 0)
          this.serverDeductionAmount = isNaN(deduction) ? 0 : Math.max(0, deduction)
          const paidRaw = d.paidAmount !== undefined && d.paidAmount !== null
            ? d.paidAmount : (d.paid_amount !== undefined && d.paid_amount !== null ? d.paid_amount : null)
          this.serverPaidAmount = (paidRaw !== null && paidRaw !== undefined && !isNaN(Number(paidRaw)))
            ? Math.max(0, Number(paidRaw)) : null
          this.serverEffectiveStart = this.formatDateOnly(
            d.tokenplanEffectiveTime || d.tokenplan_effective_time || d.effectiveStart || d.startTime || d.startDate
          )
          this.serverEffectiveEnd = this.formatDateOnly(
            d.tokenplanExpirationTime || d.tokenplan_expiration_time || d.effectiveEnd || d.endTime || d.endDate
          )
          this.autoFillBalanceAmount()
        } else {
          if (seq !== this._priceSeq) return
          this.serverPrice = null
          this.serverPaidAmount = null
          this.serverEffectiveStart = null
          this.serverEffectiveEnd = null
          this.serverDeductionAmount = 0
          if (this.form.useBalance) this.autoFillBalanceAmount()
        }
      } catch (e) {
        if (seq !== this._priceSeq) return
        console.error('[TokenPlan/getTokenPlanPrice] 失败:', e)
        this.serverPrice = null
        this.serverPaidAmount = null
        this.serverEffectiveStart = null
        this.serverEffectiveEnd = null
        this.serverDeductionAmount = 0
        if (this.form.useBalance) this.autoFillBalanceAmount()
      } finally {
        if (seq === this._priceSeq) this.serverPriceLoading = false
      }
    },
    handleBalanceAmountChange (e) {
      // 防御：如果 e 是事件对象，从 DOM 中取真实输入值
      let raw;
      if (e && e.target && typeof e.target.value === 'string') {
        raw = e.target.value;
      } else {
        raw = this.form.balanceAmount;
      }
      if (raw === null || raw === undefined || raw === '') return;
      let s = String(raw);

      // 1. 去掉非数字/小数点字符（防御粘贴、IME 输入、键盘误触等场景）
      s = s.replace(/[^0-9.]/g, '');

      // 2. 仅保留第一个小数点（关键：用户在 InputNumber 中连点会出现 5.8.... 或 1.2.）
      const firstDot = s.indexOf('.');
      if (firstDot !== -1) {
        s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
      }

      // 3. 整数部分最多 5 位（≤ 99999，即不超过十万）
      s = s.replace(/^(\d{0,5})(\..*)?$/, (_, intPart, rest) => intPart + (rest || ''));

      // 4. 限制小数位最多 2 位
      s = s.replace(/^(\d+)(\.\d{0,2}).*$/, '$1$2');

      // 5. 与原值不一致时，同步清洗：
      //    - 直接修改 DOM input.value（即时清除 UI 上的脏值，无闪现）
      //    - 同时把清洗后的值赋给 v-model（保留原 $nextTick 异步，避免 iview InputNumber 精度循环）
      if (s !== String(raw)) {
        if (e && e.target && e.target.tagName === 'INPUT') {
          e.target.value = s;
        }
        this.$nextTick(() => {
          this.form.balanceAmount = s === '' ? '' : Number(s) || s;
        });
      }
      this.adjustBalanceAmount()
    },
    handleBalanceAmountBlur () { this.adjustBalanceAmount() },
    adjustBalanceAmount () {
      const maxByBalance = Math.max(parseFloat(this.availableBalance || 0), 0)
      const maxByPayable = parseFloat(this.balancePayableMax || 0)
      const upper = Math.min(maxByBalance, maxByPayable)
      let v = parseFloat(this.form.balanceAmount) || 0
      if (v < 0) v = 0
      if (v > upper) v = upper
      this.form.balanceAmount = isNaN(v) ? 0 : Math.max(0, v)
    },
    autoFillBalanceAmount () {
      if (!this.form.useBalance) { this.form.balanceAmount = 0; return }
      const maxByBalance = Math.max(parseFloat(this.availableBalance || 0), 0)
      const maxByPayable = parseFloat(this.balancePayableMax || 0)
      const upper = Math.min(maxByBalance, maxByPayable)
      this.form.balanceAmount = isNaN(upper) ? 0 : Math.max(0, upper)
    },
    goToRecharge () {
      this.$router.push('/shenbeigpuai/control/recharge').catch(() => { })
    },
    async handlePay () {
      this.payModalLoading = false
      this.qrCodeUrl = ''
      this.payPwdForm.payPassword = ''
      try {
        const authRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        })
        if (!authRes.data || authRes.data.authStatus !== 'PASSED') {
          this.$Message.error({ content: '需要认证后才能进行购买', duration: 5 })
          this.$router.push('/shenbeigpuai/control/auth-apply')
          return
        }
        if ((this.form.useBalance && this.form.balanceAmount > 0)) {
          if (!authRes.data || !authRes.data.payPassword) {
            this.setPayPwdModalVisible = true
            return
          }
        }
      } catch (e) {
        console.error('查询认证状态失败:', e)
        this.$Message.error('查询认证状态失败')
        return
      }
      if (this.form.useBalance && this.form.balanceAmount > 0 && this.availableBalance <= 0) {
        this.$Modal.confirm({
          title: '余额不足',
          content: `当前账户可用余额 ¥${this.availableBalance.toFixed(2)}，无法使用余额支付，请先充值后再试。`,
          okText: '去充值',
          cancelText: '取消',
          onOk: () => { this.goToRecharge() }
        })
        return
      }
      if (this.form.useBalance && this.form.balanceAmount > 0 && this.availableBalance < this.form.balanceAmount) {
        this.$Modal.confirm({
          title: '余额不足',
          content: `当前账户可用余额 ¥${this.availableBalance.toFixed(2)}，您输入的使用金额 ¥${this.form.balanceAmount.toFixed(2)} 超出余额，请重新输入。`,
          okText: '确定',
          cancelText: '取消'
        })
        return
      }
      if (this.form.useBalance && this.form.balanceAmount > 0) {
        this.showPayPasswordModal()
        return
      }
      this.submitOrder('')
    },
    showPayPasswordModal () {
      this.$Modal.confirm({
        title: '请输入支付密码',
        render: (h) => {
          return h('div', { style: { padding: '20px 0', fontSize: '14px', lineHeight: '1.6' } }, [
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' } }, [
              h('span', { style: { fontSize: '14px', color: '#515a6e', whiteSpace: 'nowrap' } }, '支付密码：'),
              h('Input', {
                props: { type: 'password', placeholder: '请输入6位支付密码', maxlength: 6, autofocus: true, autocomplete: 'off' },
                style: { width: '180px' },
                on: { input: (val) => { this.tempPayPassword = val } }
              })
            ])
          ])
        },
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          if (!this.tempPayPassword || this.tempPayPassword.length !== 6) {
            this.$Message.error('支付密码必须为6位数字')
            return
          }
          this.submitOrder(this.tempPayPassword)
          this.tempPayPassword = ''
        },
        onCancel: () => { this.tempPayPassword = '' }
      })
    },
    handlePayModalCancel () {
      if (this.payModalLoading) return
      this.payModalVisible = false
      this.qrCodeUrl = ''
      // 微信支付取消时同步关闭购买弹框
      if (this.payMethodIsWechat) {
        this.stopPaymentPolling()
        this.showRenewModal = false
      }
    },
    async fetchWechatQrCode (qrCodeUrl) {
      this.qrCodeUrl = qrCodeUrl || ''
      this.activePayMethod = 'wechat'
      this.payModalVisible = true
      this.payModalLoading = false
      this.$nextTick(() => {
        const canvas = this.$refs.qrCanvas
        if (canvas && this.qrCodeUrl) {
          this.$QRCode.toCanvas(canvas, this.qrCodeUrl, {
            width: 150, margin: 1,
            color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'H'
          }, (err) => { if (err) console.error('二维码生成失败：', err) })
        }
      })
      this.payPwdForm.payPassword = ''
    },
    async submitOrder (payPassword) {
      this.payModalLoading = true
      try {
        const tokenplanId = this.currentServerTokenplanId
        if (!tokenplanId && tokenplanId !== 0) {
          this.$Message.error('无法获取套餐信息，请刷新页面后重试')
          return
        }
        const balanceAmount = this.form.useBalance ? Number(this.form.balanceAmount || 0) : 0
        if (balanceAmount > 0 && !payPassword) {
          this.$Message.error('使用余额抵扣需输入支付密码')
          return
        }
        const orderData = { tokenplan_id: tokenplanId, balanceAmount: balanceAmount }
        if (balanceAmount > 0 && payPassword) orderData.payPassWord = this.$aesEncrypt(payPassword)
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/createTokenPlanOrder',
          method: 'post',
          data: orderData
        })
        if (res && res.errcode === 9001) {
          this.$Message.error((res && res.errmsg) || '订单创建失败')
          this.$router.replace({ path: '/shenbeigpuai/control/order-list', query: { tab: 'tokenPlan' } })
          return
        } else if (!res || res.errcode !== 0) {
          this.$Message.error((res && res.errmsg) || '订单创建失败')
          return
        }
        const orderResult = (res.data && res.data.data) || res.data || {}
        this.orderResult = orderResult
        if (this.form.useBalance && balanceAmount > 0) {
          this.frozenBalance = (this.frozenBalance || 0) + balanceAmount
        }
        const orderId = orderResult.tokenplanOrderNo || orderResult.tokenplan_order_no || orderResult.orderId || ''
        const qrCodeUrl = orderResult.qrCode || orderResult.qrCodeUrl || ''
        this.testOrderId = orderId
        if (qrCodeUrl) {
          await this.fetchWechatQrCode(qrCodeUrl)
          this.startPaymentPolling()
        } else {
          this.payModalVisible = false
          this.payPwdForm.payPassword = ''
          if (this.tokenplanOrderType === 'renew') {
            this.$Message.success('续费成功')
            this.showRenewModal = false
            this.loadPlanInfo()
            return
          }
          if (this.tokenplanOrderType === 'upgrade') {
            this.$Message.success('升级成功')
            this.showRenewModal = false
            this.loadPlanInfo()
            return
          }
          this.openSuccessModal()
        }
      } catch (e) {
        console.error('[token-plan] submitOrder 异常:', e)
        this.$Message.error('订单创建失败，请稍后重试')
      } finally {
        this.payModalLoading = false
      }
    },
    startPaymentPolling () {
      this.stopPaymentPolling()
      this.isPolling = true
      this.pollingCount = 0
      this.pollingTimer = setInterval(async () => {
        this.pollingCount++
        if (this.pollingCount > this.maxPollingCount) {
          this.stopPaymentPolling()
          this.$Message.warning('支付超时，请重新发起支付')
          return
        }
        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/tokenPlanService/getTokenPlanOrderInfo',
            method: 'post',
            data: { tokenplanOrderNo: this.testOrderId }
          })
          const orderData = res && res.data
          const payStatus = orderData && (orderData.status || orderData.paymentStatus)
          if (res && res.errcode === 0 && orderData && payStatus === 'paid') {
            this.stopPaymentPolling()
            this.payModalVisible = false
            if (this.tokenplanOrderType === 'renew') {
              this.$Message.success('续费成功')
              this.showRenewModal = false
              this.loadPlanInfo()
              return
            }
            if (this.tokenplanOrderType === 'upgrade') {
              this.$Message.success('升级成功')
              this.showRenewModal = false
              this.loadPlanInfo()
              return
            }
            this.orderResult = orderData
            this.openSuccessModal()
          }
        } catch (e) {
          console.error('[token-plan] 轮询支付状态失败:', e)
        }
      }, this.pollingInterval)
    },
    stopPaymentPolling () {
      if (this.pollingTimer) { clearInterval(this.pollingTimer); this.pollingTimer = null }
      this.isPolling = false
    },
    async openSuccessModal () {
      const info = this.successOrderInfo
      info.packageName = (this.selectedPlan && this.selectedPlan.name) || '专业版'
      info.period = (this.selectedPeriod && this.selectedPeriod.label) || '月付'
      let expireTime = this.serverEffectiveEnd || ''
      if (!expireTime && this.orderResult) {
        const raw = this.orderResult
        expireTime = this.formatDateOnly(
          raw.tokenplanExpirationTime || raw.tokenplan_expiration_time || raw.effectiveEnd || raw.endTime || ''
        )
      }
      info.expireTime = expireTime || '-'
      info.apiKey = ''
      info.apiKeyLoading = true
      this.successModalVisible = true
      const keyName = '默认API密钥'
      try {
        // const createRes = await this.$hdAxios.request({
        //   url: '/api/ac/shenbeigpuai/userApiKeyPackageService/createPackageUserApiKey',
        //   method: 'post',
        //   data: { keyName: keyName, apiKey: this.generateRandomString(10) }
        // })
        // if (createRes && createRes.errcode === 0) {
        //   const listRes = await this.$hdAxios.request({
        //     url: '/api/ac/shenbeigpuai/userApiKeyPackageService/listPackageUserApiKey',
        //     method: 'post',
        //     data: {}
        //   })
        //   if (listRes && listRes.errcode === 0 && Array.isArray(listRes.data)) {
        //     const matched = listRes.data.find(item => (item.key_name || item.keyName) === keyName)
        //     if (matched) info.apiKey = matched.api_key || matched.apiKey || ''
        //   }
        // }
        // if (!info.apiKey) info.apiKey = this.generateRandomString(10)
      } catch (e) {
        console.error('[token-plan] 创建API Key失败:', e)
        info.apiKey = this.generateRandomString(10)
      } finally {
        info.apiKeyLoading = false
      }
    },
    async handleCopyApiKey () {
      const key = this.successOrderInfo.apiKey || ''
      if (!key) return
      try {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(key)
        } else {
          const ta = document.createElement('textarea')
          ta.value = key
          ta.style.position = 'fixed'
          ta.style.left = '-9999px'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        this.$Message.success('已复制 API KEY')
      } catch (e) {
        console.error('[token-plan] 复制 API KEY 失败:', e)
        this.$Message.error('复制失败，请手动复制')
      }
    },
    handleSuccessOk () {
      this.successModalVisible = false
      this.showRenewModal = false
      this.loadPlanInfo()
    },
    handleSuccessCancel () {
      this.successModalVisible = false
      this.$router.replace({ path: '/shenbeigpuai/control/order-list', query: { tab: 'tokenPlan' } })
    },
    handlePayConfirm () {
      if (!this.payMethodIsBalance) return
      this.$refs.payPwdFormRef.validate(async valid => {
        if (!valid) return
        await this.submitOrder(this.payPwdForm.payPassword)
      })
    },
    openSetPayPwdModal () {
      this.setPayPwdModalVisible = true
      this.setPayPwdForm.newPassword = ''
      this.setPayPwdForm.confirmPassword = ''
    },
    handleSetPayPwdCancel () { this.setPayPwdModalVisible = false },
    async handleSetPayPwdOk () {
      this.setPayPwdLoading = true
      const valid = await new Promise((resolve) => {
        this.$refs.setPayPwdFormRef.validate((v) => resolve(v))
      })
      if (!valid) { this.setPayPwdLoading = false; return }
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/updatePayPassword',
          method: 'post',
          data: {
            oldPayPassword: '',
            newPayPassword: this.$aesEncrypt(this.setPayPwdForm.newPassword),
            confirmPayPassword: this.$aesEncrypt(this.setPayPwdForm.confirmPassword)
          }
        })
        if (res.errcode === 0) {
          this.$Message.success('支付密码设置成功')
          this.setPayPwdModalVisible = false
          this.$refs.setPayPwdFormRef.resetFields()
        } else {
          this.$Message.error(res.errmsg || '设置失败')
        }
      } catch (e) {
        console.error('设置支付密码失败:', e)
        this.$Message.error('设置失败，请稍后重试')
      } finally {
        this.setPayPwdLoading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tpl-page {
  padding: 16px 16px 100px 16px;
  background: #f4f6f8;
  min-height: 100vh;

  &__header {
    margin-bottom: 12px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__headline {
    margin-bottom: 16px;
  }

  &__title {
    font-size: 22px;
    font-weight: 800;
    color: #0f1b33;
    margin: 0;
  }
}

// 初始加载占位
.tpl-loading {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  padding: 120px 24px;
  text-align: center;
  color: #6a7891;
  font-size: 14px;

  /deep/ .ivu-spin {
    margin-bottom: 12px;
  }

  &__text {
    font-size: 13px;
    color: #808695;
  }
}

// 主体两栏（左侧配额、右侧套餐）
.tpl-body {
  display: flex;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 16px;

  @media (max-width: 980px) {
    flex-direction: column;
  }
}

// 卡片基础
.tpl-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  padding: 22px 24px;
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #0f1b33;
    font-family: "Alibaba PuHuiTi 2.0";
  }
}

// 窗口限制用量卡（左侧）
.tpl-quota-card {
  flex: 1.5;
  min-width: 0;

  &__title {
    margin-bottom: 22px;
  }
}

.tpl-quota-row {
  margin-bottom: 22px;

  &:last-child {
    margin-bottom: 0;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 12px;
  }

  &__head-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  &__icon {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #234bda;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: #0f1b33;
    flex-shrink: 0;
  }

  &__used-line {
    font-size: 12px;
    color: #616c84;
    margin-left: 8px;
    white-space: nowrap;

    strong {
      color: #0f1b33;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      margin: 0 2px;
    }
  }

  &__divider {
    margin: 0 4px;
    color: #c5c8ce;
  }

  &__percent {
    font-size: 18px;
    font-weight: 700;
    color: #234bda;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  &__percent-suffix {
    font-size: 12px;
    color: #616c84;
    font-weight: 500;
    margin-left: 4px;
  }
}

// 套餐卡（右侧）
.tpl-plan-card {
  flex: 1;
  max-width: 380px;

  @media (max-width: 980px) {
    max-width: none;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    /deep/ .ivu-tag {
      border-radius: 4px;
    }
  }

  &__main {
    background: #f4f6f8;
    border-radius: 8px;
    padding: 18px 20px;
    margin-bottom: 16px;
  }

  &__version {
    font-size: 22px;
    font-weight: 700;
    color: #0f1b33;
    margin-bottom: 14px;
    font-family: "Alibaba PuHuiTi 2.0";
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__meta-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }

  &__meta-label {
    color: #616c84;
  }

  &__meta-value {
    color: #0f1b33;
    font-weight: 500;

    strong {
      color: #234bda;
      font-weight: 700;

      &.is-expired {
        color: #ed3f3f;
      }
    }
  }

  &__ops {
    display: flex;
    gap: 10px;
    margin-top: auto;

    /deep/ .ivu-btn {
      flex: 1;
      height: 38px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
    }

    /deep/ .ivu-btn-primary {
      background: #234bda;
      border-color: #234bda;

      &:hover {
        background: #1a3cb0;
        border-color: #1a3cb0;
      }
    }
  }
}

// 进度条（设计图：扁平、圆角）
.tpl-progress {
  width: 100%;
  height: 8px;
  background: #eef1f7;
  border-radius: 999px;
  overflow: hidden;

  &__bar {
    height: 100%;
    background: #234bda;
    border-radius: 999px;
    transition: width 0.6s ease, background 0.3s ease;

    &.is-warning {
      background: #ff9500;
    }

    &.is-danger {
      background: #ed3f3f;
    }
  }
}

// TokenPlan KEY 卡
.tpl-key-card {
  padding: 20px 24px 24px 24px;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  &__head-right {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  &__usage {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
    color: #234bda;
    cursor: pointer;
    user-select: none;

    i {
      font-size: 14px;
    }

    &:hover {
      opacity: 0.85;
    }
  }

  &__action {
    font-size: 14px;
    font-weight: 600;
    color: #234bda;
    cursor: pointer;
    user-select: none;

    &:hover {
      opacity: 0.85;
    }

    &.is-disabled {
      color: #c5c8ce;
      cursor: not-allowed;

      &:hover {
        opacity: 1;
      }
    }
  }

  &__limit {
    font-size: 12px;
    font-weight: 500;
    color: #c5c8ce;
    margin-left: 4px;
  }
}

.tpl-key-row {
  background: linear-gradient(133.23deg, #fffcfa 0%, #f4f4ff 100%);
  border-radius: 8px;
  padding: 14px 20px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  &__tag {
    font-size: 14px;
    font-weight: 600;
    color: #234bda;
    flex-shrink: 0;
  }

  &__value {
    font-size: 12px;
    color: #0f1b33;
    font-variant-numeric: tabular-nums;
    word-break: break-all;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__copy {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    color: #234bda;
    cursor: pointer;
    flex-shrink: 0;

    i {
      margin-right: 4px;
      font-size: 14px;
    }

    &:hover {
      opacity: 0.7;
    }
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #616c84;
  }

  &__time {
    color: #616c84;
  }

  &__ops {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__divider {
    color: #dcdee2;
  }

  &__op {
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.7;
    }

    &--edit {
      color: #234bda;
    }

    &--del {
      color: #ed3f3f;
    }
  }
}

.tpl-key-empty {
  text-align: center;
  padding: 30px 0;
  color: #808695;
  font-size: 14px;
}

// Token Plan 调用说明弹框
.tpl-usage {
  &__section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #0f1b33;
    margin-bottom: 6px;
  }

  &__value {
    font-size: 13px;
    color: #616c84;
    line-height: 1.7;

    code {
      background: #f1f4f9;
      border-radius: 3px;
      padding: 1px 6px;
      color: #234bda;
      font-family: Consolas, Monaco, monospace;
    }
  }

  &__code-wrap {
    position: relative;
  }

  &__copy {
    position: absolute;
    top: 8px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #9fb4ff;
    cursor: pointer;
    z-index: 1;

    i {
      font-size: 14px;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  &__code {
    margin: 0;
    background: #101a30;
    color: #e8ecf4;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 12px;
    line-height: 1.8;
    font-family: Consolas, Monaco, "Courier New", monospace;
    white-space: pre;
    overflow-x: auto;
  }
}

// 空状态
.tpl-empty {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  padding: 360px 24px;
  text-align: center;

  &__icon {
    color: #c8d1e3;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: #0f1b33;
    margin-bottom: 16px;
  }

  &__desc {
    font-size: 16px;
    color: #6a7891;
    margin-bottom: 18px;
  }

  /deep/ .ivu-btn-primary {
    background: #234bda;
    border-color: #234bda;
    height: 48px;
    width: 200px;
    padding: 0 24px;
    font-size: 14px;
  }
}

// 续费弹框
.tpl-renew {
  &__title {
    font-size: 16px;
    font-weight: 700;
    color: #0f1b33;
    margin-bottom: 4px;
  }

  &__sub {
    font-size: 12px;
    color: #6a7891;
    margin-bottom: 16px;
  }

  &__periods {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  &__period {
    border: 1px solid #e7ebf2;
    border-radius: 8px;
    padding: 14px 12px;
    text-align: center;
    cursor: pointer;
    transition: border-color .15s ease, background .15s ease;
    background: #ffffff;

    &:hover {
      border-color: #b8c4dc;
    }

    &.is-selected {
      border-color: #234bda;
      background: #f1f6ff;
    }
  }

  &__period-label {
    font-size: 13px;
    color: #1a2942;
    font-weight: 600;
    margin-bottom: 6px;
  }

  &__period-price {
    font-size: 18px;
    font-weight: 800;
    color: #0f1b33;
  }

  &__period-save {
    margin-top: 4px;
    font-size: 11px;
    color: #234bda;
    background: #eaf1ff;
    border-radius: 4px;
    padding: 2px 0;
  }

  &__summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f5f7f9;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 13px;
    color: #6a7891;
  }

  &__summary-price {
    font-size: 20px;
    font-weight: 800;
    color: #234bda;
  }
}

/* ============ 续费 / 升级 弹框（按设计图样式） ============ */
.tpl-renew-modal /deep/ .ivu-modal {
  border-radius: 12px;
  overflow: hidden;
}
.tpl-renew-modal /deep/ .ivu-modal-content {
  border-radius: 12px;
}
.tpl-renew-modal /deep/ .ivu-modal-close {
  top: 14px;
  right: 14px;
}
.tpl-renew-modal__inner {
  padding: 0 4px;
}
.tpl-renew-modal__head {
  text-align: left;
  padding: 22px 24px 14px;
  border-bottom: 1px solid #f0f3f8;
}
.tpl-renew-modal__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f1b33;
  margin: 0 0 6px 0;
}
.tpl-renew-modal__sub {
  font-size: 12px;
  color: #6a7891;
  margin: 0;
}
.tpl-renew-modal__body {
  display: block;
  padding: 14px 4px 4px;
}
.tpl-renew-modal__section,
.tpl-renew-modal__pay {
  padding: 0 18px;
}
.tpl-renew-modal__pay {
  margin-top: 18px;
  padding-top: 14px;
  // border-top: 1px dashed #e7ebf2;
}
.tpl-renew-modal__section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f1b33;
  margin-bottom: 12px;
  padding-bottom: 8px;
  // border-bottom: 1px dashed #e7ebf2;
}
.tpl-renew-modal__block-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a2942;
  margin: 10px 0 8px 0;
}
.tpl-renew-modal__periods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.tpl-renew-modal__period {
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  padding: 10px 0;
  text-align: center;
  font-size: 13px;
  color: #1a2942;
  font-weight: 600;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
  background: #fff;

  &:hover { border-color: #b8c4dc; }
  &.is-selected {
    border-color: #234bda;
    background: #f1f6ff;
    color: #234bda;
  }
  &.is-disable {
    background: #f5f7f9;
    border-color: #ebeef3;
    color: #b8c2cf;
    cursor: not-allowed;
  }
}
.tpl-renew-modal__plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.tpl-renew-modal__plan {
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  padding: 12px 6px;
  text-align: center;
  cursor: pointer;
  background: #fff;
  transition: border-color .15s ease, background .15s ease;

  &:hover { border-color: #b8c4dc; }
  &.is-selected {
    border-color: #234bda;
    background: #f1f6ff;
  }
  &.is-disable {
    background: #f5f7f9;
    border-color: #ebeef3;
    color: #a7a7a7;
    cursor: not-allowed;

    .tpl-renew-modal__plan-name { color: #a7a7a7; }
    .tpl-renew-modal__plan-price,
    .tpl-renew-modal__plan-currency,
    .tpl-renew-modal__plan-num,
    .tpl-renew-modal__plan-unit { color: #a7a7a7; }
  }
}
.tpl-renew-modal__plan-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f1b33;
  margin-bottom: 10px;
  text-align: center;
}
.tpl-renew-modal__plan-price {
  font-family: "Microsoft YaHei Bold", "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #ff5900;
  text-align: center;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  max-width: 100%;
}
.tpl-renew-modal__plan-currency {
  font-size: 14px;
  font-weight: 700;
  margin-right: 2px;
  line-height: 1;
}
.tpl-renew-modal__plan-num {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}
.tpl-renew-modal__plan-unit {
  font-size: 13px;
  font-weight: 700;
  color: #000;
  margin-left: 4px;
  line-height: 1;
}
.tpl-renew-modal__info {
  border-top: 1px dashed #e7ebf2;
  padding-top: 10px;
}
.tpl-renew-modal__info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 6px 0;
  color: #6a7891;
}
.tpl-renew-modal__info-label { color: #6a7891; }
.tpl-renew-modal__info-value { color: #0f1b33; font-weight: 500; }

.tpl-renew-modal__detail {
  border-top: 1px dashed #e7ebf2;
  padding: 8px 0 12px;
  margin-bottom: 12px;
}
.tpl-renew-modal__detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
  color: #6a7891;

  &--payable {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f0f3f8;
  }
}
.tpl-renew-modal__detail-name {
  color: #0f1b33;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
.tpl-renew-modal__detail-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 4px;
  border-radius: 50%;
  background: #e6e8eb;
  color: #6a7891;
  font-size: 11px;
  font-weight: 600;
  cursor: help;
  user-select: none;
}
.tpl-renew-modal__detail-amount {
  font-weight: 600;
  color: #0f1b33;

  &--red { color: #ff4d4f; font-size: 14px; }
  &--green { color: #19be6b; }
  &--payable { color: #ff4d4f; font-size: 16px; font-weight: 800; }
}
.tpl-renew-modal__balance {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;

  /deep/ .ivu-checkbox {
    display: flex;
    align-items: center;
  }
}
.tpl-renew-modal__balance-text {
  font-size: 13px;
  color: #515a6e;
  line-height: 22px;
  display: flex;
  align-items: center;
}
.tpl-renew-modal__price-red { color: #ed4014; }
.tpl-renew-modal__balance-input {
  margin-left: 24px;
  margin-top: 6px;
  display: flex;
  align-items: center;
}
.tpl-renew-modal__balance-label {
  font-size: 12px;
  color: #515a6e;
}
.tpl-renew-modal__balance-tip {
  font-size: 12px;
  color: #808695;
  margin-left: 8px;

  &--ok { color: #19be6b; }
}
.tpl-renew-modal__payfoot {
  margin-top: 24px;

  /deep/ .ivu-btn-primary {
    background: #234bda;
    border-color: #234bda;
    height: 42px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
    &:hover { background: #1a3cb0; border-color: #1a3cb0; }
  }
}

@media (max-width: 860px) {
  .tpl-renew-modal__body { padding: 14px 4px 4px; }
}

/* ============ 支付确认弹框样式（移植自 buy） ============ */
.tpb-pay-modal__order {
  background: #f5f7f9;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.tpb-pay-modal__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #6a7891;
  padding: 4px 0;
  strong { color: #0f1b33; font-weight: 600; }
}
.tpb-pay-modal__amount { color: #ff4d4f; font-size: 16px; font-weight: 700; }
.tpb-pay-modal__balance /deep/ .ivu-form-item { margin-bottom: 14px; }
.tpb-pay-modal__link {
  color: #1456e6;
  font-size: 12px;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}
.tpb-pay-modal__wechat {
  background: #f2f5fa;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  margin-top: 8px;
}
.tpb-pay-modal__wechat-tip {
  color: #6a7891;
  font-size: 13px;
  margin-bottom: 12px;
}
.tpb-pay-modal__qr {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px auto;
}
.tpb-pay-modal__qr-hint {
  margin-top: 10px;
  color: #808695;
  font-size: 12px;
}

/* ============ 支付成功 / API KEY 弹框样式（移植自 buy） ============ */
.tokenplan-success {
  text-align: center;
  padding: 24px 32px 8px;

  &__icon { margin-bottom: 16px; }
  &__icon-circle {
    width: 88px;
    height: 88px;
    line-height: 88px;
    margin: 0 auto;
    border-radius: 50%;
    background: #e6f7ec;
    box-shadow: 0 0 0 8px rgba(82, 196, 26, 0.08);
  }
  &__icon-check {
    display: inline-block;
    font-size: 48px;
    color: #2fbb56;
    font-weight: 700;
    line-height: 88px;
    transform: translateY(-2px);
  }
  &__title {
    font-size: 22px;
    font-weight: 700;
    color: #1d2129;
    margin-bottom: 6px;
  }
  &__sub {
    font-size: 13px;
    color: #86909c;
    margin-bottom: 24px;
  }
  &__key {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f5f7f9;
    border: 1px solid #e6e8eb;
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 18px;
    text-align: left;
  }
  &__key-label {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 4px;
  }
  &__key-value {
    font-size: 13px;
    color: #1d2129;
    word-break: break-all;
    font-family: Consolas, Menlo, monospace;
  }
  &__copy { flex-shrink: 0; margin-left: 12px; }
  &__detail {
    background: #fff;
    margin-bottom: 24px;
    text-align: left;
  }
  &__detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 4px;
    font-size: 13px;
    border-bottom: 1px dashed #f0f1f2;
    &:last-child { border-bottom: none; }
  }
  &__detail-label { color: #86909c; }
  &__detail-value { color: #1d2129; }
  &__detail-value--accent { color: #4a7afb; }
  &__actions { margin-top: 8px; }
  &__btn-primary { margin-bottom: 12px; font-size: 14px; height: 40px; }
  &__btn-ghost {
    font-size: 14px;
    height: 40px;
    &:hover { background: #b8bcc4; border-color: #b8bcc4; color: #fff; }
  }
}
</style>