<template>
  <div class="token-plan-buy" style="position: relative;">
    <!-- 顶部面包屑 -->
    <div class="token-plan-buy__header">
      <Breadcrumb>
        <BreadcrumbItem>Token Plan</BreadcrumbItem>
        <BreadcrumbItem>购买</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 页面标题与说明（CHECKOUT · 确认订单并支付） -->
    <div class="token-plan-buy__headline">
      <!-- <div class="token-plan-buy__eyebrow">CHECKOUT</div> -->
      <h2 class="token-plan-buy__title">确认订单并支付</h2>
      <p class="token-plan-buy__sub">未支付前可随时调整套餐与周期，生效周期将根据所选周期自动计算。</p>
    </div>

    <!-- 左右两栏 -->
    <div class="tpb-cols">
      <!-- 左：选择套餐 -->
      <div class="tpb-card">
        <div class="tpb-card__title">选择套餐</div>
        <!-- <div class="tpb-card__desc">在支付前可自由切换版本与周期，右侧金额实时更新。</div> -->

        <!-- 版本 -->
        <div class="tpb-block-label">版本</div>
        <div class="tpb-grid-3">
          <div v-for="p in availablePlans" :key="p.id" class="tpb-plan-card"
            :class="{ 'is-selected': activePlan === p.id, 'is-disable': p.isDisable }"
            @click="p.isDisable ? null : selectPlan(p.id)">
            <div class="tpb-plan-card__name">{{ p.name }}</div>
            <!-- <div class="tpb-plan-card__price">¥{{ formatMoney(currentPriceForPeriod('monthly', p.id)) }} <span
                class="tpb-plan-card__unit">/月</span></div> -->
          </div>
        </div>

        <!-- 计费周期 -->
        <div class="tpb-block-label">计费周期</div>
        <div class="tpb-grid-3">
          <div v-for="pd in availablePeriods" :key="pd.id" class="tpb-period-card"
            :class="{ 'is-selected': activePeriod === pd.id, 'is-disable': pd.isDisable }"
            @click="pd.isDisable ? null : selectPeriod(pd.id)">
            <div class="tpb-period-card__label">{{ pd.label }}</div>
            <div class="tpb-period-card__price">¥{{ formatMoney(currentPriceForPeriod(pd.id)) }}</div>
          </div>
        </div>

        <!-- 生效信息 -->
        <div class="tpb-info">
          <div class="tpb-info__row">
            <span class="tpb-info__label">生效开始</span>
            <span class="tpb-info__value">{{ effectiveStartText }}</span>
          </div>
          <div class="tpb-info__row">
            <span class="tpb-info__label">生效结束</span>
            <span class="tpb-info__value">{{ effectiveEndText }}</span>
          </div>
          <div class="tpb-info__row">
            <span class="tpb-info__label">限制（5小时 / 7天）</span>
            <span class="tpb-info__value">{{ currentLimits.r5h }} 积分 / {{ currentLimits.r7d }} 积分 </span>
          </div>
        </div>
      </div>

      <!-- 右：支付方式 -->
      <div class="tpb-card tpb-card--pay">
        <div class="tpb-card__title">支付方式</div>
        <!-- <div class="tpb-card__desc">当前账户可用余额 <strong class="tpb-balance-strong">¥{{ availableBalanceText }}</strong>
          <span style="color:#9aa6bd;">（已冻结 ¥{{ frozenBalanceText }}）</span></div> -->

        <!-- ===== 订单明细（原"查看明细"弹框内容，现直接展示在支付方式下方） ===== -->
        <div class="tpb-detail">
          <div class="tpb-detail__row">
            <span class="tpb-detail__name">{{ summaryLine }}</span>
            <span class="tpb-detail__amount">¥{{ payableText }}</span>
          </div>
          <div class="tpb-detail__row">
            <span class="tpb-detail__name">生效周期</span>
            <span class="tpb-detail__amount">{{ effectiveStartText }} ~ {{ effectiveEndText }}</span>
          </div>
          <div class="tpb-detail__row">
            <span class="tpb-detail__name">应付合计</span>
            <span class="tpb-detail__amount tpb-detail__amount--red">¥{{ payableText }}</span>
          </div>
          <div class="tpb-detail__row">
            <span class="tpb-detail__name">余额抵扣</span>
            <span class="tpb-detail__amount tpb-detail__amount--green">-¥{{ Number(form.balanceAmount).toFixed(2)
              }}</span>
          </div>
          <div class="tpb-detail__row tpb-detail__row--deduction">
            <span v-if="serverDeductionAmount > 0" class="tpb-detail__name">
              余量抵扣
              <Tooltip transfer placement="top" max-width="240" content="旧套餐的剩余金额会在套餐升级时转换为金额并进行抵扣">
                <span class="tpb-detail__help">?</span>
              </Tooltip>
            </span>
            <span v-if="serverDeductionAmount > 0" class="tpb-detail__amount tpb-detail__amount--green">-¥{{
              Number(serverDeductionAmount).toFixed(2) }}</span>
          </div>
          <div class="tpb-detail__row tpb-detail__row--payable">
            <span class="tpb-detail__name">第三方支付金额</span>
            <span class="tpb-detail__amount tpb-detail__amount--payable">¥{{ payableAfterDeduct }}</span>
          </div>
        </div>

        <!-- ===== 余额抵扣 + 合计金额（移植自 instance-buy 支付逻辑，支持余额/微信混合支付） ===== -->
        <div class="balance-check" style="display: flex; align-items: flex-start; gap: 8px;">
          <Checkbox v-model="useBalanceChecked" :disabled="availableBalance <= 0" style="margin-top: 2px;"></Checkbox>
          <div style="flex: 1;margin-left: 0px;">
            <div style="font-size: 14px; color: #515a6e; line-height: 22px;">
              使用账户余额抵扣 (当前账户可用余额 <span class="price-red">¥{{ availableBalanceText }}</span>)
              <!-- <div style="font-size: 12px; color: #808695; margin-top: 4px;">如果您有正在使用中的后付费产品，请保证有足够余额。</div> -->
            </div>
            <div v-if="form.useBalance && balancePayableMax > 0 && useBalanceChecked" class="balance-input-row"
              style="margin-top: 8px;">
              <span style="font-size: 12px; color: #515a6e;">余额支付:</span>
              <InputNumber v-model="form.balanceAmount"
                :max="Math.min(Math.max(availableBalance, 0), balancePayableMax)" :min="0" :step="0.01" size="small"
                style="width: 120px; margin-left: 8px;" placeholder="请输入金额" @on-change="handleBalanceAmountChange"
                @on-blur="handleBalanceAmountBlur" />
              <span v-if="payableAfterDeduct > 0" style="font-size: 12px; color: #808695; margin-left: 8px;">还需支付 ¥{{
                payableAfterDeduct }}</span>
              <span v-else style="font-size: 12px; color: #19be6b; margin-left: 8px;">余额已足额抵扣</span>
            </div>
            <!-- <div
              class="total-amount"
              style="margin-top: 10px; font-weight: bold; color: #ff4d4f; display: flex; justify-content: space-between; align-items: center;"
            >
              <span>当前支付总金额: ¥{{ parseFloat(finalTotalAmount).toFixed(2) }}</span>
            </div> -->
          </div>
        </div>

        <div class="price-panel">
          <div class="price-tips" v-if="availableBalance < balancePayableMax">当前钱包余额不足，请 <span
              @click="goToRecharge">充值</span> 或选择其他支付方式</div>
          <Button type="primary" size="large" long class="pay-btn" @click="handlePay"
            :loading="purchaseLoading">提交订单</Button>
          <!-- <div class="tpb-pay-foot">支付即视为同意《服务协议》和《计费说明》</div> -->
        </div>
      </div>
    </div>

    <!-- 支付确认弹框 -->
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

      <!-- 余额支付：输入支付密码 -->
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

      <!-- 微信支付：二维码 -->
      <div v-else-if="payMethodIsWechat" class="tpb-pay-modal__wechat">
        <div class="tpb-pay-modal__wechat-tip">
          还需微信支付：<strong class="tpb-pay-modal__amount">¥{{ payableAfterDeduct }}</strong>
        </div>
        <div class="tpb-pay-modal__qr">
          <canvas v-if="qrCodeUrl" ref="qrCanvas" width="150" height="150"
            style="margin: 0 auto; display: block;"></canvas>
          <div v-else
            style="width: 150px; height: 150px; margin: 0 auto; background: #fff; border: 1px solid #dcdee2; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #c5c8ce; font-size: 12px;">二维码加载中...</span>
          </div>
          <!-- <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="微信支付二维码" class="tpb-pay-modal__qr-img" />
          <div v-else class="tpb-pay-modal__qr-loading">
            <Icon type="ios-loading" size="36" class="spin" />
            <span>二维码加载中...</span>
          </div> -->
        </div>
        <p class="tpb-pay-modal__qr-hint">请使用微信扫一扫完成支付</p>
      </div>
      <!-- 余额支付时的 footer -->
      <div v-if="payMethodIsBalance" slot="footer">
        <Button @click="handlePayModalCancel">取消</Button>
        <Button type="primary" :loading="payModalLoading" @click="handlePayConfirm">确认支付 ¥{{ payableAfterDeduct
        }}</Button>
      </div>
    </Modal>

    <!-- 设置支付密码弹框（余额支付时如未设置密码触发） -->
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

    <!-- 支付成功 / API KEY 弹框（支付成功或扫码成功后弹出，不再直接跳转） -->
    <Modal v-model="successModalVisible" :closable="false" :mask-closable="false" :footer-hide="true" width="520"
      class-name="tokenplan-success-modal">
      <div class="tokenplan-success">
        <!-- 顶部绿色对勾圆圈 -->
        <div class="tokenplan-success__icon">
          <div class="tokenplan-success__icon-circle">
            <span class="tokenplan-success__icon-check">✓</span>
          </div>
        </div>
        <div class="tokenplan-success__title">支付成功，套餐已生效</div>
        <div class="tokenplan-success__sub">已为您生成专属 API Key，请妥善保管，勿泄露</div>

        <!-- API KEY 条 -->
        <div class="tokenplan-success__key">
          <div class="tokenplan-success__key-left">
            <div class="tokenplan-success__key-label">您的 API KEY</div>
            <div class="tokenplan-success__key-value">
              <span v-if="successOrderInfo.apiKeyLoading" style="color: #808695;">生成中...</span>
              <span v-else>{{ successOrderInfo.apiKey }}</span>
            </div>
          </div>
          <Button type="primary" class="tokenplan-success__copy"
            :disabled="successOrderInfo.apiKeyLoading || !successOrderInfo.apiKey" @click="handleCopyApiKey">复制</Button>
        </div>

        <!-- 套餐明细 -->
        <div class="tokenplan-success__detail">
          <div class="tokenplan-success__detail-row">
            <span class="tokenplan-success__detail-label">套餐</span>
            <span class="tokenplan-success__detail-value tokenplan-success__detail-value--accent">
              {{ successOrderInfo.packageName || '-' }}
            </span>
          </div>
          <div class="tokenplan-success__detail-row">
            <span class="tokenplan-success__detail-label">周期</span>
            <span class="tokenplan-success__detail-value tokenplan-success__detail-value--accent">
              {{ successOrderInfo.period || '-' }}
            </span>
          </div>
          <div class="tokenplan-success__detail-row">
            <span class="tokenplan-success__detail-label">到期</span>
            <span class="tokenplan-success__detail-value tokenplan-success__detail-value--accent">
              {{ successOrderInfo.expireTime || '-' }}
            </span>
          </div>
        </div>

        <!-- 底部按钮 -->
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
  name: 'scp-shenbeigpuai-control-token-plan-buy',
  data () {
    return {
      tokenplanOrderType: '',
      serverPrice: 0, // 服务器价格
      finalAmount: 0, // 最终支付金额
      orderResult: null, // 订单结果
      useWechatPay: false, // 是否使用微信支付
      // 当前选中的档位 / 周期（由 availablePlans / availablePeriods computed 推导）
      activePlan: 'professional',
      activePeriod: 'monthly',

      // 后端返回的分组/套餐原始列表（listSub2ApiGroupPage 返回的 results 数组）
      // 每条形如 { id, rateMultiplier, dailyLimitUsd, weeklyLimitUsd, monthlyLimitUsd,
      //              tokenplanPrice, tokenplanBillingCycleLabel, tokenplanLevel, isDisable }
      groupsRaw: [],
      // 树形结构：第一层 = 套餐档位（version），第二层 = 计费周期（period），保留原始 raw 记录
      // [{
      //   id: 'professional', name: '专业版', isDisable: false,
      //   periods: [{ id: 'monthly', label: '月付', days: 30, isDisable: true, raw: {...} }, ...]
      // }, ...]
      groups: [],
      // 英文 ↔ 后端字典中文 label 映射
      periodLabelMap: { monthly: '月付', quarterly: '季付', yearly: '年付' },
      levelLabelMap: { standard: '标准版', professional: '专业版', ultimate: '旗舰版' },

      // 余额（占位数据，后续接 /api/ac/.../userService/getBalance）
      balance: 0.00,
      // 冻结余额（占位数据，后续接同一接口返回的 frozenBalance 字段）
      frozenBalance: 0,
      // 移植自 instance-buy 的支付 UI 所需数据
      // token plan 始终为非按量计费，故 billingType 固定 'monthly'（与现有 handlePay 兼容）
      form: {
        useBalance: true,
        balanceAmount: 0,
        billingType: 'monthly'
      },

      // 支付方式（占位数据，后续接字典 / 接口）
      payMethods: [
        { id: 'balance', name: '平台余额', sub: '余额充足（¥1,280.00）', icon: 'wallet', iconChar: '¥' },
        { id: 'wechat', name: '微信支付', sub: '扫码完成支付', icon: 'wechat', iconChar: '微', disabled: false }
      ],
      activePayMethod: 'balance',
      payAgreement: false,
      purchaseLoading: false,

      // ============ 支付确认弹框 ============
      payModalVisible: false, // 是否展示支付确认弹框
      payModalLoading: false, // 提交订单 loading
      qrCodeUrl: '', // 微信支付二维码 base64 / url
      // ============ 支付成功弹框（展示 API KEY） ============
      successModalVisible: false, // 是否展示支付成功 / API KEY 弹框
      successOrderInfo: {
        apiKey: '', // 生成的 API KEY
        apiKeyLoading: false, // API KEY 是否正在生成中
        packageName: '', // 套餐名
        period: '', // 周期（月付 / 季付 / 年付 等）
        expireTime: '' // 期限（到期日 YYYY/MM/DD）
      },
      // 微信支付 - 轮询支付状态
      testOrderId: '', // 微信支付时的订单 ID
      isPolling: false, // 是否正在轮询支付状态
      pollingTimer: null, // 轮询定时器
      pollingCount: 0, // 已轮询次数
      maxPollingCount: 200, // 最大轮询次数（约 10 分钟）
      pollingInterval: 3000, // 轮询间隔（毫秒）
      // ============ 后端 getTokenPlanPrice 接口返回值（接口不可达时为 null，前端兜底） ============
      serverPrice: null, // 应付合计（接口 totalAmount；含余量抵扣但未扣余额）
      serverPaidAmount: null, // 实付金额（接口 paidAmount；已扣余量抵扣、未扣余额）
      serverEffectiveStart: null, // 生效开始日期字符串（YYYY/MM/DD）
      serverEffectiveEnd: null, // 生效结束日期字符串（YYYY/MM/DD）
      serverPriceLoading: false, // 价格加载中
      serverDeductionAmount: 0, // 余量抵扣金额（升级套餐时，旧套餐未用完部分折算的抵扣；<=0 不显示）
      // 余额支付时的支付密码表单
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
              if (value !== this.setPayPwdForm.newPassword) {
                cb(new Error('两次输入的密码不一致'))
              } else {
                cb()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    // 可选档位：直接读取树形结构 groups（version → period）
    // 第一层 isDisable 已由 buildGroupsTree 计算（仅当所有 period 都置灰时，整档位置灰）
    availablePlans () {
      const groups = this.groups || []
      return groups.map(v => ({ id: v.id, name: v.name, isDisable: !!v.isDisable }))
    },
    // 可选周期：根据当前 activePlan 在树形结构里查找对应版本的 periods
    // 第二层 isDisable 直接取后端 group.isDisable（受 activePlan 影响，切 plan 后会重新计算）
    availablePeriods () {
      const groups = this.groups || []
      const current = groups.find(v => v.id === this.activePlan)
      if (current && current.periods && current.periods.length) {
        return current.periods.map(p => ({
          id: p.id, label: p.label, days: p.days, isDisable: !!p.isDisable, raw: p.raw
        }))
      }
      // 兜底：树为空时返回默认周期列表，避免页面空白
      const periodLabelMap = this.periodLabelMap || {}
      const daysMap = { monthly: 30, quarterly: 90, yearly: 365 }
      return ['monthly', 'quarterly', 'yearly'].map(id => ({
        id: id, label: periodLabelMap[id] || id, days: daysMap[id] || 30, isDisable: false
      }))
    },
    selectedPlan () {
      const list = this.availablePlans || []
      return list.find(p => p.id === this.activePlan) || list[0] || { id: '', name: '' }
    },
    selectedPeriod () {
      const list = this.availablePeriods || []
      return list.find(p => p.id === this.activePeriod) || list[0] || { id: 'monthly', label: '月付', days: 30 }
    },
    // 当前激活档位 + 周期的套餐明细（基于接口原始 groupsRaw 计算）
    currentMatrixCell () {
      const levelCN = (this.levelLabelMap && this.levelLabelMap[this.activePlan]) || this.activePlan
      const periodCN = (this.periodLabelMap && this.periodLabelMap[this.activePeriod]) || this.activePeriod
      const groups = this.groupsRaw || []
      const hit = groups.find(g => g && g.tokenplanLevelLabel === levelCN && (g.tokenplanBillingCycleLabel === periodCN))
      if (!hit) return { price: 0, r5h: 0, r7d: 0 }
      return {
        price: Number(hit.tokenplanPrice || 0),
        r5h: Number(hit.dailyLimitUsd || 0),
        r7d: Number(hit.weeklyLimitUsd || 0)
      }
    },
    currentPrice () {
      return this.currentMatrixCell.price || 0
    },
    /**
     * 当前选中档位 × 周期的后端数据库真实主键（shenbeigpuai_sub2api_groups.id）
     * 后端 getTokenPlanPrice 必须用这个 id 作为 tokenplan_id 入参
     * 数据来源：listSub2ApiGroupPage 接口返回的原始 groupsRaw
     */
    currentServerTokenplanId () {
      const groups = this.groupsRaw || []
      const hit = groups.find(g =>
        g && g.tokenplanLevel === this.activePlan &&
        g.tokenplanBillingCycle === this.activePeriod
      )
      return hit && hit.id !== undefined ? hit.id : null
    },
    currentLimits () {
      return { r5h: this.formatNumber(this.currentMatrixCell.r5h || 0), r7d: this.formatNumber(this.currentMatrixCell.r7d || 0) }
    },
    // 兼容老逻辑：周期切换卡上显示的当前套餐对应周期的价格
    // 用法与旧 priceMatrix[plan][period].price 完全一致
    tokenPlanGroups () {
      return this.groupsRaw
    },
    priceText () {
      return this.formatMoney(this.currentPrice)
    },
    summaryLine () {
      return (this.selectedPlan.name || '') + ' · ' + (this.selectedPeriod.label || '')
    },
    balanceText () {
      return this.formatMoney(this.balance)
    },
    // ============ 以下为移植自 instance-buy 支付 UI 的支撑计算 ============
    // 可用余额 = 余额 - 已冻结
    availableBalance () {
      return parseFloat(this.balance || 0) - parseFloat(this.frozenBalance || 0)
    },
    availableBalanceText () {
      return this.availableBalance.toFixed(2)
    },
    frozenBalanceText () {
      return parseFloat(this.frozenBalance || 0).toFixed(2)
    },
    // 当前支付总金额：token plan 不分按量/包月，始终等于所选套餐价格
    finalTotalAmount () {
      return parseFloat(this.currentPrice || 0)
    },
    // 实付金额：优先用后端 paidAmount（已扣余量抵扣），再扣余额抵扣
    // 接口不可达 / 未返回 paidAmount 时 fallback 到 total - deduction - balance
    payableAfterDeduct () {
      const balanceDeduct = (this.form.useBalance && this.form.balanceAmount > 0)
        ? parseFloat(this.form.balanceAmount || 0)
        : 0
      if (this.serverPaidAmount !== null && this.serverPaidAmount !== undefined && !isNaN(Number(this.serverPaidAmount))) {
        const paid = Number(this.serverPaidAmount)
        return Math.max(paid - balanceDeduct, 0).toFixed(2)
      }
      // 兜底：前端本地计算
      const total = parseFloat(this.finalTotalAmount || 0)
      const deduction = parseFloat(this.serverDeductionAmount || 0) > 0
        ? parseFloat(this.serverDeductionAmount || 0)
        : 0
      return Math.max(total - deduction - balanceDeduct, 0).toFixed(2)
    },
    // 余额支付输入框上限：paidAmount（已扣余量抵扣），未拿到时 fallback 到 total - deduction
    balancePayableMax () {
      if (this.serverPaidAmount !== null && this.serverPaidAmount !== undefined && !isNaN(Number(this.serverPaidAmount))) {
        return Math.max(0, Number(this.serverPaidAmount))
      }
      const total = parseFloat(this.finalTotalAmount || 0)
      const deduction = parseFloat(this.serverDeductionAmount || 0) > 0
        ? parseFloat(this.serverDeductionAmount || 0)
        : 0
      return Math.max(total - deduction, 0)
    },
    // 强制布尔化，避免 iview Checkbox 报 "Value should be trueValue or falseValue"
    useBalanceChecked: {
      get () {
        return !!this.form.useBalance
      },
      set (val) {
        this.form.useBalance = !!val
      }
    },
    payableText () {
      // 优先使用后端 getTokenPlanPrice 返回的价格；接口未通时回退到前端本地计算
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
    // 当前支付方式是否为余额 / 微信
    payMethodIsBalance () {
      return this.activePayMethod === 'balance'
    },
    payMethodIsWechat () {
      return this.activePayMethod === 'wechat'
    },
    // 支付弹框标题（按支付方式切换）
    payModalTitle () {
      return this.payMethodIsWechat ? '微信支付' : '支付确认'
    },
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
    // 套餐 / 周期变化时调后端接口计算价格与生效周期
    activePlan () {
      this.fetchTokenPlanPrice()
    },
    activePeriod () {
      this.fetchTokenPlanPrice()
    },
    'form.useBalance' (newVal) {
      if (newVal) {
        this.autoFillBalanceAmount()
      } else {
        this.form.balanceAmount = 0
      }
    },
    'finalTotalAmount' (newVal) {
      // 总金额变化时，已输入的余额支付金额超过上限则按上限收敛
      this.adjustBalanceAmount()
    }
  },
  created () {
    this.fetchTokenPlans()
    this.fetchBalance()
  },
  mounted () {
    // 测试用
    // this.successModalVisible = true
    // fetchTokenPlanPrice 不在此处调用；改为在 fetchTokenPlans 成功拿到 groups 之后调用，
    // 避免在 created→mounted 同步流程里 groups 仍是 [] 时调用，导致 tokenplanId 为空
  },
  beforeDestroy () {
    // 组件销毁时清理支付状态轮询，避免内存泄漏
    this.stopPaymentPolling && this.stopPaymentPolling()
  },
  methods: {
    // 把扁平的 group 列表按 tokenplanLevel 分组，构建成 version → period 树形结构
    // 第一层 isDisable：仅当该档位下所有 period 都 isDisable=true 时，档位本身才置灰
    // 第二层 isDisable：直接取后端 group.isDisable
    // 周期匹配兼容三种情况：中文 label（"月付"）、英文 id（"monthly"）、或纯字符串（如 "month"/"year"）
    /**
     * 读取重定向参数（query / localStorage），尝试把 activePlan / activePeriod 切到对应档位和周期
     *
     * 参数来源（优先级从高到低）：
     *   1. $route.query.billingCycle / $route.query.level
     *      —— 已登录场景：portal/api 页面直接 $router.push 携带的 query
     *   2. localStorage: portal_redirect_billingCycle / portal_redirect_level
     *      —— 未登录场景：登录前 portal/api 页面写下的备份，登录回调后由本页消费
     *
     * 行为约定：
     *   - 档位参数命中且 groups 中存在且未禁用 → 切到该档位；否则保持当前档位不动
     *   - 周期参数命中且当前档位的 periods 中存在且未禁用 → 切到该周期；否则保持当前周期不动
     *   - 不修改 activePlan / activePeriod 的"默认选中规则"：succeed 时即覆盖；不命中时则交由
     *     后续 syncActivePeriodToAvailable 处理（默认 'monthly' 不可用时切到第一个可用周期）
     *   - 读取后立即清空 localStorage 中的 portal_redirect_* 键，避免下次进入时残留
     */
    applyRedirectParams () {
      // 1. 优先从 $route.query 取（已登录直接跳转场景）
      const query = (this.$route && this.$route.query) || {}
      let level = query.level || ''
      let billingCycle = query.billingCycle || ''

      // 2. 若 query 中没有，再从 localStorage 取（未登录走 /login 回跳场景）
      try {
        if (!level) level = localStorage.getItem('portal_redirect_level') || ''
        if (!billingCycle) billingCycle = localStorage.getItem('portal_redirect_billingCycle') || ''
      } catch (e) {
        // localStorage 在隐私模式下可能抛错，吞掉即可
      }

      // 3. 应用档位参数：groups 中存在且未禁用时才覆盖
      if (level) {
        const targetPlan = (this.groups || []).find(v => v && v.id === level)
        if (targetPlan && !targetPlan.isDisable) {
          this.activePlan = targetPlan.id
        }
      }

      // 4. 应用周期参数：在当前档位的 periods 中存在且未禁用时才覆盖
      if (billingCycle) {
        const plan = (this.groups || []).find(v => v && v.id === this.activePlan)
        const periods = (plan && plan.periods) || []
        const targetPeriod = periods.find(pd => pd && pd.id === billingCycle)
        if (targetPeriod && !targetPeriod.isDisable) {
          this.activePeriod = targetPeriod.id
        }
      }

      // 5. 读取后清理 localStorage 中的 portal_redirect_* 键，避免下次进入时残留
      try {
        localStorage.removeItem('portal_redirect_billingCycle')
        localStorage.removeItem('portal_redirect_level')
        localStorage.removeItem('portal_redirect_planId')
        // 注意：portal_redirect（路径键）由其他跳转/拦截逻辑消费，不在这里清
      } catch (e) { /* 忽略 */ }
    },
    buildGroupsTree (flatList) {
      const list = Array.isArray(flatList) ? flatList : []
      const levelLabelMap = this.levelLabelMap || {}
      const periodLabelMap = this.periodLabelMap || {}
      const daysMap = { monthly: 30, quarterly: 90, yearly: 365 }
      const periodOrder = ['monthly', 'quarterly', 'yearly']

      // 反向：中文 label → 英文 id
      const cnToLevelId = {}
      Object.keys(levelLabelMap).forEach(k => { cnToLevelId[levelLabelMap[k]] = k })
      // 反向：中文 label → 英文 id（period）
      const cnToPeriodId = {}
      Object.keys(periodLabelMap).forEach(k => { cnToPeriodId[periodLabelMap[k]] = k })

      // 把后端 group 里的周期字段统一规整成英文 id（monthly/quarterly/yearly）
      // 兼容三种输入：中文 label / 英文 id / 数字（如 1=monthly, 3=quarterly, 12=yearly）
      const normalizePeriod = (g) => {
        const raw = g.tokenplanBillingCycleLabel || g.tokenplanBillingCycle
        if (!raw) return ''
        if (cnToPeriodId[raw]) return cnToPeriodId[raw]
        if (periodOrder.includes(raw)) return raw
        // 兜底：数字月份
        const m = parseInt(raw, 10)
        if (!isNaN(m)) {
          if (m === 1) return 'monthly'
          if (m === 3) return 'quarterly'
          if (m === 12) return 'yearly'
        }
        return raw
      }
      // 把后端 group 里的档位字段统一规整成英文 id
      const normalizeLevel = (g) => {
        const raw = g.tokenplanLevel
        if (!raw) return ''
        if (cnToLevelId[raw]) return cnToLevelId[raw]
        if (['standard', 'professional', 'ultimate'].includes(raw)) return raw
        return raw
      }

      // 按档位（英文 id）聚合
      const byLevel = {}
      list.forEach(g => {
        if (!g) return
        const levelId = normalizeLevel(g)
        const periodId = normalizePeriod(g)
        if (!levelId) return
        if (!byLevel[levelId]) byLevel[levelId] = []
        byLevel[levelId].push({ raw: g, periodId: periodId, periodLabel: g.tokenplanBillingCycleLabel || periodLabelMap[periodId] || periodId })
      })

      // 按固定顺序输出档位
      const order = ['standard', 'professional', 'ultimate']
      const result = []
      order.forEach(id => {
        const arr = byLevel[id] || []
        if (arr.length === 0) return
        // 收集该档位下的 periods（按固定顺序）
        const periods = []
        const seenPeriod = new Set()
        periodOrder.forEach(pid => {
          const found = arr.find(x => x.periodId === pid)
          if (found) {
            seenPeriod.add(pid)
            periods.push({
              id: pid,
              label: periodLabelMap[pid] || pid,
              days: daysMap[pid] || 30,
              isDisable: !!found.raw.isDisable,
              raw: found.raw
            })
          }
        })
        // 兜底：遍历中可能存在未知周期的 group（既不匹配 monthly/quarterly/yearly 的情况）
        arr.forEach(x => {
          if (seenPeriod.has(x.periodId)) return
          const pid = x.periodId || 'unknown'
          periods.push({
            id: pid,
            label: x.periodLabel || pid,
            days: 30,
            isDisable: !!x.raw.isDisable,
            raw: x.raw
          })
        })
        // 第一层 isDisable：该档位下所有 period 都 isDisable=true 时，档位置灰
        const allPeriodsDisabled = periods.length > 0 && periods.every(p => p.isDisable)
        result.push({
          id: id,
          name: levelLabelMap[id] || id,
          isDisable: allPeriodsDisabled,
          periods: periods
        })
      })
      return result
    },
    // 显示支付密码弹框
    showPayPasswordModal () {
      this.$Modal.confirm({
        title: '请输入支付密码',
        render: (h) => {
          return h('div', {
            style: {
              padding: '20px 0',
              fontSize: '14px',
              lineHeight: '1.6'
            }
          }, [
            h('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }
            }, [
              h('span', {
                style: {
                  fontSize: '14px',
                  color: '#515a6e',
                  whiteSpace: 'nowrap'
                }
              }, '支付密码：'),
              h('Input', {
                props: {
                  type: 'password',
                  placeholder: '请输入6位支付密码',
                  maxlength: 6,
                  autofocus: true,
                  autocomplete: 'off'
                },
                style: { width: '180px' },
                on: {
                  input: (val) => {
                    this.tempPayPassword = val
                  }
                }
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
          // 验证通过，执行提交订单逻辑
          this.submitOrder(this.tempPayPassword)
          this.tempPayPassword = ''
        },
        onCancel: () => {
          this.tempPayPassword = ''
        }
      })
    },
    // 选择一个"可用的计费周期"：当前 activePeriod 可用则保持，否则切到第一个可用；若都不可用则保持现状
    syncActivePeriodToAvailable () {
      const periods = this.availablePeriods || []
      if (!periods.length) return
      const current = periods.find(p => p.id === this.activePeriod)
      if (current && !current.isDisable) return // 当前周期可用 → 不动
      const firstAvailable = periods.find(p => !p.isDisable)
      if (firstAvailable) this.activePeriod = firstAvailable.id
    },
    selectPlan (id) {
      this.activePlan = id
      // 切 plan 后：调整 activePeriod 到该 plan 下的第一个可用 period
      this.syncActivePeriodToAvailable()
    },
    selectPeriod (id) {
      this.activePeriod = id
    },
    selectPayMethod (id) {
      this.activePayMethod = id
    },
    // 查询某档位 × 某周期的价格：未指定 planId 时默认当前 activePlan
    currentPriceForPeriod (periodId, planId) {
      const usePlanId = planId || this.activePlan
      const levelCN = (this.levelLabelMap && this.levelLabelMap[usePlanId]) || usePlanId
      const periodCN = (this.periodLabelMap && this.periodLabelMap[periodId]) || periodId
      const groups = this.groupsRaw || []
      const hit = groups.find(g => g && g.tokenplanLevelLabel === levelCN && (g.tokenplanBillingCycleLabel === periodCN))
      return hit ? Number(hit.tokenplanPrice || 0) : 0
    },
    formatMoney (n) {
      return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatNumber (n) {
      return Number(n || 0).toLocaleString('en-US')
    },
    formatDate (d) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${y}/${m}/${dd}`
    },
    // 拉取账户余额（含已冻结余额），占位实现：后续接入实例购买同款接口
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
          // 余额加载完成后，如果开启了余额抵扣且价格已就绪，重新自动填充余额抵扣金额
          // 解决初始化时 fetchBalance 与 fetchTokenPlanPrice 并行导致 autoFillBalanceAmount
          // 在余额未到时被调用、balanceAmount=0 的竞态问题
          this.$nextTick(() => {
            if (this.form.useBalance) {
              // 价格就绪的标志：serverPaidAmount 已返回（接口成功）或 groupsRaw 已有数据（前端兜底价格可用）
              const priceReady = this.serverPaidAmount !== null || (this.groupsRaw && this.groupsRaw.length > 0)
              if (priceReady) {
                this.autoFillBalanceAmount()
              }
            }
          })
        }
      } catch (e) {
        console.error('[TokenPlan/getBalance] 失败:', e)
      }
    },
    // 拉取上架套餐列表（listSub2ApiGroupPage）写入 groups
    async fetchTokenPlans () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/myListSub2ApiGroupPage',
          method: 'post',
          // data: { pageNumber: 1, pageSize: 20, params: {} }
        })
        // 调试日志：把原始响应打到控制台，便于排查 groups 为空的原因
        // console.log('[TokenPlan/listSub2ApiGroupPage] 原始返回:', JSON.stringify(res))
        // 框架响应可能是 { errcode, data: Page } 或双层包装 { errcode, data: { data: Page } }
        // Page 内部数组字段可能叫 results / rows / records / list / data
        const businessData = res && res.data && res.data.data ? res.data.data : (res && res.data)
        const list = (businessData && (businessData.results || businessData.rows || businessData.records || businessData.list || businessData.data)) || []
        console.log('[TokenPlan/listSub2ApiGroupPage] 原始返回，条数:', list.length, list)
        if (Array.isArray(list) && list.length) {
          // 1. 保存原始扁平列表（供 currentServerTokenplanId / currentMatrixCell 等老逻辑使用）
          this.groupsRaw = list
          // 2. 把扁平列表转成树形结构：第一层=档位（version），第二层=周期（period）
          //    第二层 isDisable 来自后端；第一层 isDisable = 第二层全部 isDisable=true 才置灰
          this.groups = this.buildGroupsTree(list)
          // 3. 读取重定向参数（query / localStorage），尝试选中对应档位和周期；不可用则跳过
          this.applyRedirectParams()
          // 4. 首屏 activePeriod 兜底：默认值 'monthly' 可能被禁用，自动切到第一个可用周期
          this.syncActivePeriodToAvailable()
          // console.log('[TokenPlan/listSub2ApiGroupPage] 已写入 groups，条数:', list.length, list)
          // groups 数据就绪后再调价格接口（避免 fetchTokenPlanPrice 比 fetchTokenPlans 先执行导致 tokenplanId 为空）
          this.fetchTokenPlanPrice()
        } else {
          console.warn('[TokenPlan/listSub2ApiGroupPage] 未拿到分组数据，groups 仍为空。可对照上方原始返回检查字段名。')
        }
      } catch (e) {
        console.error('[TokenPlan/listSub2ApiGroupPage] 失败:', e)
      }
    },
    /**
     * 调后端 tokenPlanService/getTokenPlanPrice 计算应付金额与生效周期
     *
     * 入参约定（参照后端 TokenPlanServiceImpl#getTokenPlanPrice + ToeknPlanDao.xml#getTokenPLanInfoById）：
     *   参数名：tokenplan_id （不是 planId）
     *   参数值：必须是后端 shenbeigpuai_sub2api_groups 表的真实主键 id（即 listSub2ApiGroupPage 返回的 id）
     *   不要传 period：后端 SQL 不读此字段，档位×周期在后端是一对一记录（同一 level+cycle 在表中各自一条）
     *
     * 返回字段（参照 getPrice Map 写入）：
     *   totalt_amount           → 应付金额
     *   paid_amount             → 实付金额（未扣余额）
     *   deduction_amount        → 抵扣金额
     *   tokenplan_effective_time → 生效时间（yyyy-MM-dd HH:mm:ss）
     *   tokenplan_expiration_time → 失效时间（yyyy-MM-dd HH:mm:ss）
     *
     * 接口失败 / 用户有未支付订单（9001） / 后端未实现 → 清空 serverPrice/Start/End，前端本地兜底
     */
    async fetchTokenPlanPrice () {
      const tokenplanId = this.currentServerTokenplanId
      if (!tokenplanId && tokenplanId !== 0) {
        // groups 还没加载完成或没有匹配记录：不清空 serverPrice（避免首屏闪烁）
        return
      }

      this.serverPriceLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/getTokenPlanPrice',
          method: 'post',
          data: {
            tokenplan_id: tokenplanId
          }
        })
        if (res && res.errcode === 0 && res.data) {
          const d = res.data
          this.tokenplanOrderType = d.tokenplanOrderType || ''
          // 应付合计：接口实际返回的字段是 totaltAmount（拼写错误但事实如此），不是 totalAmount
          // 兼容 totalt_amount（下划线版）、calculatedAmount（历史拼写）
          // 调试：浏览器控制台直接看接口返回的所有字段
          // 应付合计：接口实际返回的字段是 totaltAmount（拼写错误但事实如此），不是 totalAmount
          // 兼容 totalt_amount（下划线版）、calculatedAmount（历史拼写）
          const total = (d.totaltAmount !== undefined && d.totaltAmount !== null ? d.totaltAmount
            : (d.totalt_amount !== undefined && d.totalt_amount !== null ? d.totalt_amount
              : (d.totalAmount !== undefined ? d.totalAmount : d.calculatedAmount)))
          this.serverPrice = total !== undefined && total !== null ? Number(total) : 0
          // 余量抵扣金额（旧套餐未用完折算；<=0 不显示明细行）
          // 后端字段为驼峰 deductionAmount；保留旧的 deduction_amount 兼容（早期接口）
          const deduction = d.deductionAmount !== undefined && d.deductionAmount !== null
            ? Number(d.deductionAmount) : (d.deduction_amount !== undefined && d.deduction_amount !== null
              ? Number(d.deduction_amount) : 0)
          this.serverDeductionAmount = isNaN(deduction) ? 0 : Math.max(0, deduction)
          // 实付金额：接口字段驼峰 paidAmount（已扣余量抵扣、未扣余额）；兼容旧 paid_amount
          const paidRaw = d.paidAmount !== undefined && d.paidAmount !== null
            ? d.paidAmount : (d.paid_amount !== undefined && d.paid_amount !== null ? d.paid_amount : null)
          this.serverPaidAmount = (paidRaw !== null && paidRaw !== undefined && !isNaN(Number(paidRaw)))
            ? Math.max(0, Number(paidRaw)) : null
          // 后端时间格式 yyyy-MM-dd HH:mm:ss，UI 仅显示日期部分（兼容驼峰和下划线）
          this.serverEffectiveStart = this.formatDateOnly(
            d.tokenplanEffectiveTime || d.tokenplan_effective_time || d.effectiveStart || d.startTime || d.startDate
          )
          this.serverEffectiveEnd = this.formatDateOnly(
            d.tokenplanExpirationTime || d.tokenplan_expiration_time || d.effectiveEnd || d.endTime || d.endDate
          )
          // 价格就绪后自动填充应付金额（首屏 / 充值回来 / 其它价格变化场景）
          // TODO
          this.autoFillBalanceAmount()
        } else {
          // 接口未通 / 返回错误（包含 9001 有未支付订单、9102 tokenplan 不存在等）：静默降级到前端本地计算
          this.serverPrice = null
          this.serverPaidAmount = null
          this.serverEffectiveStart = null
          this.serverEffectiveEnd = null
          this.serverDeductionAmount = 0
          // 降级到前端计算后，同样触发余额自动填充
          if (this.form.useBalance) {
            this.autoFillBalanceAmount()
          }
        }
      } catch (e) {
        console.error('[TokenPlan/getTokenPlanPrice] 失败:', e)
        this.serverPrice = null
        this.serverPaidAmount = null
        this.serverEffectiveStart = null
        this.serverEffectiveEnd = null
        this.serverDeductionAmount = 0
        // 接口异常降级后，同样触发余额自动填充
        if (this.form.useBalance) {
          this.autoFillBalanceAmount()
        }
      } finally {
        this.serverPriceLoading = false
      }
    },
    /**
     * 仅显示日期部分（截取 yyyy-MM-dd），兼容 'yyyy-MM-dd HH:mm:ss' / 'yyyy-MM-dd' / Date 等
     */
    formatDateOnly (val) {
      if (!val) return ''
      if (val instanceof Date) {
        const y = val.getFullYear()
        const m = String(val.getMonth() + 1).padStart(2, '0')
        const d = String(val.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }
      const s = String(val)
      return s.length >= 10 ? s.substring(0, 10) : s
    },
    // ============ 余额抵扣金额处理（移植自 instance-buy） ============
    // 监听 useBalanceChecked 变化，自动填充余额金额
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
    handleBalanceAmountBlur () {
      this.adjustBalanceAmount()
    },
    // 余额支付金额合法性收敛：不超过可用余额 / 不超过 paidAmount（已扣余量抵扣）
    adjustBalanceAmount () {
      const maxByBalance = Math.max(parseFloat(this.availableBalance || 0), 0)
      const maxByPayable = parseFloat(this.balancePayableMax || 0)
      const upper = Math.min(maxByBalance, maxByPayable)
      let v = parseFloat(this.form.balanceAmount) || 0
      if (v < 0) v = 0
      if (v > upper) v = upper
      this.form.balanceAmount = isNaN(v) ? 0 : Math.max(0, v)
    },
    // 开启余额抵扣时自动按最大可用金额填充
    autoFillBalanceAmount () {
      if (!this.form.useBalance) {
        this.form.balanceAmount = 0
        return
      }
      // 上限 = min(账户可用余额, paidAmount)
      // paidAmount 才是用户实际能抵扣的上限（已扣余量抵扣）；不能用 finalTotalAmount（应付合计），
      // 否则会填到余额完全抵扣、第三方支付=0，与设计不符
      const maxByBalance = Math.max(parseFloat(this.availableBalance || 0), 0)
      const maxByPayable = parseFloat(this.balancePayableMax || 0)
      const upper = Math.min(maxByBalance, maxByPayable)
      this.form.balanceAmount = isNaN(upper) ? 0 : Math.max(0, upper)
    },
    // 跳转到充值页
    goToRecharge () {
      // TODO: 替换为实际充值路由
      this.$router.push('/shenbeigpuai/control/recharge').catch(() => { })
    },
    // 点击"立即支付"：校验通过后打开支付确认弹框
    async handlePay () {
      // 重置弹框状态
      this.payStep = 'pwd'
      this.useWechatPay = false
      this.orderResult = null
      this.testOrderQrCodeUrl = ''
      this.remainingAmount = 0
      this.finalAmount = 0
      this.payModalLoading = false
      this.payPwdForm.payPassword = ''

      // 先查询用户认证状态（粘贴自 instance-buy handlePay，按本页面变量名适配）
      try {
        const authRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        });

        if (!authRes.data || authRes.data.authStatus !== 'PASSED') {
          this.payModalLoading = false;
          this.$Message.error({
            content: '需要认证后才能进行购买',
            duration: 5
          });
          this.$router.push('/shenbeigpuai/control/auth-apply');
          return;
        }
        // 验证是否设置了支付密码（使用余额抵扣时需要）
        if ((this.form.useBalance && this.form.balanceAmount > 0)) {
          if (!authRes.data || !authRes.data.payPassword) {
            this.payModalLoading = false;
            this.setPayPwdModalVisible = true;
            return;
          }
        }
      } catch (e) {
        console.error('查询认证状态失败:', e);
        this.payModalLoading = false;
        this.$Message.error('查询认证状态失败');
        return;
      }

      // 校验余额是否足够（只有当用户输入的使用余额金额超过账户余额时才提示）
      if (this.form.useBalance && this.form.balanceAmount > 0 && this.availableBalance <= 0) {
        this.$Modal.confirm({
          title: '余额不足',
          content: `当前账户可用余额 ¥${this.availableBalance.toFixed(2)}，无法使用余额支付，请先充值后再试。`,
          okText: '去充值',
          cancelText: '取消',
          onOk: () => {
            this.goToRecharge()
          }
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

      // 如果使用余额大于0或按量付费，需要先输入支付密码
      if (this.form.useBalance && this.form.balanceAmount > 0) {
        this.showPayPasswordModal()
        return
      }

      // 不需要支付密码，直接提交订单（纯微信场景）
      // 先打开支付弹框，再下单（submitOrder 内部会切换 useWechatPay 步骤）
      // this.payModalVisible = true
      this.submitOrder('')
    },
    // 关闭支付确认弹框
    handlePayModalCancel () {
      if (this.payModalLoading) return
      this.payModalVisible = false
      this.qrCodeUrl = ''
    },
    // 获取微信支付二维码（qrCodeUrl 来自 createOrder 返回值）
    async fetchWechatQrCode (qrCodeUrl) {
      this.qrCodeUrl = qrCodeUrl || ''
      // 切换支付方式为微信，打开支付弹框显示二维码区
      this.activePayMethod = 'wechat'
      this.payModalVisible = true
      this.payModalLoading = false
      // 测试用
      // setTimeout(() => {
      //   this.payModalVisible = false
      //   this.$Message.success('测试用假数据-扫码支付成功！')
      //   this.$router.replace('/shenbeigpuai/control/order-list')
      // }, 5000)
      // 使用前端 qrcode 包渲染二维码到 canvas
      this.$nextTick(() => {
        const canvas = this.$refs.qrCanvas
        if (canvas && this.qrCodeUrl) {
          this.$QRCode.toCanvas(canvas, this.qrCodeUrl, {
            width: 150,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H'
          }, (err) => {
            if (err) console.error('二维码生成失败：', err)
          })
        }
      })
      this.payPwdForm.payPassword = ''
    },
    /**
     * 调用 tokenPlanService/createTokenPlanOrder 下单
     *
     * 入参约定（参照 TokenPlanServiceImpl#createTokenPlanOrder）：
     *   tokenplan_id   必填，shenbeigpuai_sub2api_groups.id（用 currentServerTokenplanId）
     *   balanceAmount  必填，字符串数字，0 表示不使用余额抵扣；>0 时必须同时传 payPassWord
     *   payPassWord    当 balanceAmount>0 时必填，前端 AES 加密（AesUtils.desEncrypt 解密）
     *   _user          由框架从 token 注入，前端无需传
     *
     * 返回值（后端 return insert_order_map）：
     *   tokenplan_order_no  订单号（轮询时作为 orderId 使用）
     *   tokenplan_id / totalt_amount / paid_amount / deduction_amount
     *   tokenplan_effective_time / tokenplan_expiration_time
     *   QrCode              混合支付场景返回二维码 URL；纯余额成功时为空字符串
     *
     * 后端逻辑：余额扣完 → 直接成功；余额不足 → 冻结余额 + 返回 QrCode 走微信扫码
     */
    async submitOrder (payPassword) {
      this.payModalLoading = true
      try {
        const tokenplanId = this.currentServerTokenplanId
        if (!tokenplanId && tokenplanId !== 0) {
          this.$Message.error('无法获取套餐信息，请刷新页面后重试')
          return
        }

        // 余额抵扣金额（不使用余额抵扣时传 0）
        const balanceAmount = this.form.useBalance ? Number(this.form.balanceAmount || 0) : 0
        if (balanceAmount > 0 && !payPassword) {
          this.$Message.error('使用余额抵扣需输入支付密码')
          return
        }

        const orderData = {
          tokenplan_id: tokenplanId,
          balanceAmount: balanceAmount
        }
        // 仅当使用余额抵扣时才传支付密码（后端 checkPayPassWord 仅在 balanceAmount>0 时触发）
        if (balanceAmount > 0 && payPassword) {
          orderData.payPassWord = this.$aesEncrypt(payPassword)
        }

        // 调用后端 tokenPlanService/createTokenPlanOrder
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
        // 后端直接 return insert_order_map，所以业务数据在 res.data.data（或按框架包装）
        const orderResult = (res.data && res.data.data) || res.data || {}
        // 保存订单结果供后续使用（判断订单类型、获取到期时间等）
        this.orderResult = orderResult
        // 获取订单类型（兼容驼峰和下划线）：new=新购 / renew=续费 / upgrade=升级
        const orderType = orderResult.tokenplanOrderType || orderResult.tokenplan_order_type || ''

        // 1. 同步账户余额（后端不返回最新余额，做乐观更新；后续可调 fetchBalance 校正）
        if (this.form.useBalance && balanceAmount > 0) {
          // 后端先冻结余额 → 余额总额在用户实际支付成功后才减少；这里在 frozenBalance 上记账
          this.frozenBalance = (this.frozenBalance || 0) + balanceAmount
        }

        // 2. 判断返回是否需要微信扫码支付
        const orderId = orderResult.tokenplanOrderNo || orderResult.tokenplan_order_no || orderResult.orderId || ''
        const qrCodeUrl = orderResult.qrCode || orderResult.qrCodeUrl || ''
        this.testOrderId = orderId
        if (qrCodeUrl) {
          // 混合支付：弹出二维码 + 轮询支付状态
          await this.fetchWechatQrCode(qrCodeUrl)
          this.startPaymentPolling()
        } else {
          // 余额足够抵扣全部应付金额：下单成功
          this.payModalVisible = false
          this.payPwdForm.payPassword = ''
          // 续费订单：不弹成功框，直接提示并跳转到套餐列表
          if (this.tokenplanOrderType === 'renew') {
            this.$Message.success('续费成功')
            this.$router.replace('/shenbeigpuai/control/token-plan-list')
            return
          }
          if (this.tokenplanOrderType === 'upgrade') {
            this.$Message.success('升级成功')
            this.$router.replace('/shenbeigpuai/control/token-plan-list')
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
    /**
     * 轮询支付状态：每 3 秒调一次 getOrderPaymentStatus
     * status === 'paid' 视为成功，释放冻结余额并跳转订单列表
     */
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
          // getTokenPlanOrderInfo 返回订单信息，status === 'paid' 表示支付成功（兼容驼峰和下划线）
          const orderData = res && res.data
          const payStatus = orderData && (orderData.status || orderData.paymentStatus)
          if (res && res.errcode === 0 && orderData && payStatus === 'paid') {
            this.stopPaymentPolling()
            // 释放冻结余额
            // if (this.form.useBalance && this.form.balanceAmount > 0) {
            //   this.frozenBalance = Math.max(0, (this.frozenBalance || 0) - parseFloat(this.form.balanceAmount || 0))
            // }
            this.payModalVisible = false
            // 续费订单：不弹成功框，直接提示并跳转到套餐列表
            if (this.tokenplanOrderType === 'renew') {
              this.$Message.success('续费成功')
              this.$router.replace('/shenbeigpuai/control/token-plan-list')
              return
            }
            if (this.tokenplanOrderType === 'upgrade') {
              this.$Message.success('升级成功')
              this.$router.replace('/shenbeigpuai/control/token-plan-list')
              return
            }
            // 将最新订单数据保存到 orderResult，供 openSuccessModal 获取到期时间
            this.orderResult = orderData
            this.openSuccessModal()
          }
        } catch (e) {
          console.error('[token-plan] 轮询支付状态失败:', e)
        }
      }, this.pollingInterval)
    },
    stopPaymentPolling () {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
      this.isPolling = false
    },
    // ============ 支付成功 / API KEY 弹框 ============
    async openSuccessModal () {
      const info = this.successOrderInfo
      // 套餐名：直接使用当前选中的套餐/周期名称
      info.packageName = (this.selectedPlan && this.selectedPlan.name) || '专业版'
      // 周期：按当前选中计费周期展示
      info.period = (this.selectedPeriod && this.selectedPeriod.label) || '月付'
      // 到期日：优先从价格接口取，其次从下单返回结果取（兼容驼峰和下划线）
      let expireTime = this.serverEffectiveEnd || ''
      if (!expireTime && this.orderResult) {
        const raw = this.orderResult
        expireTime = this.formatDateOnly(
          raw.tokenplanExpirationTime || raw.tokenplan_expiration_time || raw.effectiveEnd || raw.endTime || ''
        )
      }
      info.expireTime = expireTime || '-'
      // API Key 先置空，接口创建成功后填充
      info.apiKey = ''
      info.apiKeyLoading = true
      this.successModalVisible = true

      // 调用接口创建 API Key，keyName 为 套餐名+周期（如"专业版-月付"）
      // 创建成功后再查询列表，用 keyName 匹配获取后端生成的真实 api_key（sk- 开头）
      // const keyName = info.packageName + '-' + info.period
      const keyName = '默认API密钥'
      try {
        // 1. 先创建 API Key（apiKey 字段后端会自行生成以 sk- 开头的真实key，此处传随机值占位）
        const createRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userApiKeyPackageService/createPackageUserApiKey',
          method: 'post',
          data: {
            keyName: keyName,
            apiKey: this.generateRandomString(10)
          }
        })
        if (createRes && createRes.errcode === 0) {
          // 2. 创建成功后查询 API Key 列表
          const listRes = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/userApiKeyPackageService/listPackageUserApiKey',
            method: 'post',
            data: {}
          })
          if (listRes && listRes.errcode === 0 && Array.isArray(listRes.data)) {
            // 3. 用 keyName 匹配找到刚创建的那条记录（兼容驼峰 keyName 和下划线 key_name）
            const matched = listRes.data.find(item =>
              (item.key_name || item.keyName) === keyName
            )
            if (matched) {
              info.apiKey = matched.api_key || matched.apiKey || ''
            }
          }
        }
        if (!info.apiKey) {
          console.warn('[token-plan] API Key 创建/查询未获取到key，使用兜底值')
          info.apiKey = this.generateRandomString(10)
        }
      } catch (e) {
        console.error('[token-plan] 创建API Key失败:', e)
        // 接口异常时兜底显示一个随机key，避免弹框中key为空
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
          // 兜底：使用临时 textarea + execCommand
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
    /**
     * 生成指定长度的随机字符串（大小写字母+数字）
     */
    generateRandomString (length) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    },
    handleSuccessOk () {
      // 进入控制台：跳到 token-plan-list（与现有跳转目标对齐）
      this.successModalVisible = false
      this.$router.replace('/shenbeigpuai/control/token-plan-list')
    },
    handleSuccessCancel () {
      // 返回门户：跳转到订单列表，并自动定位到 Token Plan Tab
      this.successModalVisible = false
      this.$router.replace({ path: '/shenbeigpuai/control/order-list', query: { tab: 'tokenPlan' } })
    },

    // 点击"确认支付"（余额支付流程）
    handlePayConfirm () {
      if (!this.payMethodIsBalance) return
      this.$refs.payPwdFormRef.validate(async valid => {
        if (!valid) return
        // 调 submitOrder 完成下单（AES 加密的支付密码在 submitOrder 内统一处理）
        await this.submitOrder(this.payPwdForm.payPassword)
      })
    },
    // ============ 设置支付密码 ============
    openSetPayPwdModal () {
      this.setPayPwdModalVisible = true
      this.setPayPwdForm.newPassword = ''
      this.setPayPwdForm.confirmPassword = ''
    },
    handleSetPayPwdCancel () {
      this.setPayPwdModalVisible = false
    },
    // 设置支付密码确认
    async handleSetPayPwdOk () {
      this.setPayPwdLoading = true
      const valid = await new Promise((resolve) => {
        this.$refs.setPayPwdFormRef.validate((v) => resolve(v))
      })
      if (!valid) {
        this.setPayPwdLoading = false
        return
      }
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
.price-panel {
  margin-top: 40px;
  // 让右侧卡片的"提交订单"按钮区在左高右低时也能贴底（与左卡底部对齐）
  // margin-top: auto;
}

.token-plan-buy {
  min-height: 100vh;
  padding: 16px 16px 100px 16px;
  background: #f5f7f9;

  &__header {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__headline {
    margin-bottom: 18px;

    &__eyebrow {
      // 兼容层叠：避免与 __eyebrow 重名
    }
  }
}

// 顶部小标签 + 标题
.token-plan-buy__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #e23a3a;
  margin-bottom: 6px;
}

.token-plan-buy__title {
  font-size: 24px;
  font-weight: 800;
  color: #0f1b33;
  margin: 0 0 6px 0;
  text-align: center;
}

.token-plan-buy__sub {
  font-size: 13px;
  color: #6a7891;
  margin: 0;
  text-align: center;
}

// 两栏布局
.tpb-cols {
  display: flex;
  gap: 16px;
  // 关键：让两栏卡片拉伸到等高（不再 flex-start）
  align-items: stretch;

  >.tpb-card {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 980px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.tpb-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(16, 27, 51, 0.04), 0 1px 3px rgba(16, 27, 51, 0.03);
  padding: 22px 24px;
  // 左右两栏均分剩余空间（1:1），让卡片尽可能撑满容器
  flex: 2 1 0;
  min-width: 0; // 防止子元素（订单明细、按钮等）撑大 flex 子项
  box-sizing: border-box;

  &--pay {
    // 与左栏等分宽度；移除原 max-width: 450px，避免右侧出现空隙
    flex: 1 1 0;

    @media (max-width: 980px) {
      width: 100%;
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: #0f1b33;
    margin-bottom: 10px;
  }

  &__desc {
    font-size: 12px;
    color: #6a7891;
    margin-bottom: 18px;
  }
}

.tpb-block-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a2942;
  margin: 4px 0 10px 0;
}

.tpb-grid-3 {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;

  >* {
    flex: 1;
    min-width: 0;
  }
}

// 版本卡
.tpb-plan-card {
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  background: #ffffff;

  &__name {
    font-size: 16px;
    color: #0f1b33;
    // margin-bottom: 6px;
    text-align: center;
    font-weight: 600;
  }

  &__price {
    font-size: 16px;
    font-weight: 700;
    color: #0f1b33;
  }

  &__unit {
    font-size: 12px;
    font-weight: 400;
    color: #6a7891;
    margin-left: 2px;
  }

  &:hover {
    border-color: #b8c4dc;
  }

  &.is-selected {
    border-color: #1456e6;
    background: #f1f6ff;
  }

  // 续费场景：低档/短周期置灰（接口 isDisable=true），不允许选中
  &.is-disable {
    background: #f5f7f9;
    border-color: #ebeef3;
    color: #b8c2cf;
    cursor: not-allowed;

    .tpb-plan-card__name,
    .tpb-plan-card__price {
      color: #b8c2cf;
    }

    &:hover {
      border-color: #ebeef3;
    }
  }
}

// 周期卡
.tpb-period-card {
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  background: #ffffff;

  &__label {
    font-size: 12px;
    color: #6a7891;
    margin-bottom: 4px;
  }

  &__price {
    font-size: 16px;
    font-weight: 700;
    color: #0f1b33;
  }

  &:hover {
    border-color: #b8c4dc;
  }

  &.is-selected {
    border-color: #1456e6;
    background: #f1f6ff;
  }

  // 续费场景：低档/短周期置灰（接口 isDisable=true），不允许选中
  &.is-disable {
    background: #f5f7f9;
    border-color: #ebeef3;
    color: #b8c2cf;
    cursor: not-allowed;

    .tpb-period-card__label,
    .tpb-period-card__price {
      color: #b8c2cf;
    }

    &:hover {
      border-color: #ebeef3;
    }
  }
}

// 生效信息行
.tpb-info {
  border-top: 1px dashed #e7ebf2;
  margin-top: 6px;
  padding-top: 12px;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f3f8;
    font-size: 13px;

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    color: #6a7891;
  }

  &__value {
    color: #0f1b33;
    font-weight: 500;
  }
}

// 支付方式
.tpb-pay-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.tpb-pay-method {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  background: #ffffff;

  &.is-selected {
    border-color: #1456e6;
    background: #f1f6ff;
  }

  &.is-disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &__radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #c8d1e3;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
  }

  &__radio-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #1456e6;
  }

  &.is-selected &__radio {
    border-color: #1456e6;
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    flex-shrink: 0;

    &--wallet {
      background: #1456e6;
    }

    &--wechat {
      background: #07c160;
    }
  }

  &__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  &__name {
    font-size: 13.5px;
    color: #0f1b33;
    font-weight: 500;
  }

  &__sub {
    font-size: 12px;
    color: #6a7891;
    margin-top: 2px;
  }

  &__arrow {
    color: #c8d1e3;
    font-size: 18px;
    line-height: 1;
  }
}

// 概要
.tpb-summary {
  border-top: 1px dashed #e7ebf2;
  padding-top: 12px;
  margin-bottom: 14px;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
    color: #0f1b33;

    &--payable {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid #f0f3f8;
    }
  }

  &__name {
    color: #6a7891;
  }

  &__amount {
    font-weight: 600;
  }

  &__label {
    font-size: 14px;
    color: #0f1b33;
    font-weight: 600;
  }
}

.tpb-payable {
  font-size: 24px;
  font-weight: 800;
  color: #1456e6;
}

// 协议
.tpb-pay-agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: #6a7891;
  margin-bottom: 12px;

  &__link {
    color: #1456e6;
    cursor: pointer;
    text-decoration: none;
    margin: 0 2px;
  }

  &__sep {
    margin: 0 2px;
  }

  /deep/ .ivu-checkbox-wrapper {
    margin-right: 4px;
    font-size: 12px;
    color: #6a7891;
  }
}

// 立即支付按钮
.tpb-pay-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 700;
  background: #1456e6;
  border-color: #1456e6;

  &:hover {
    background: #0f48c2;
    border-color: #0f48c2;
  }

  &.is-disabled {
    background: #c8d1e3;
    border-color: #c8d1e3;
    color: #ffffff;
    cursor: not-allowed;
  }
}

.tpb-pay-foot {
  text-align: center;
  font-size: 12px;
  color: #9aa6bd;
  margin-top: 10px;
}

/* ============ 移植自 instance-buy 的余额抵扣 / 提交订单样式 ============ */
.price-tips {
  font-size: 12px;
  color: #808695;
  margin-bottom: 12px;

  span {
    color: #2d8cf0;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.pay-btn {
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  background: #1456e6;
  border-color: #1456e6;

  &:hover {
    background: #0f48c2;
    border-color: #0f48c2;
  }
}

.price-red {
  color: #ed4014;
}

.balance-input-row /deep/ .ivu-input-number {
  vertical-align: middle;
}

/* 订单明细（内联展示在支付方式下方） */
.tpb-detail {
  border-top: 1px dashed #e7ebf2;
  padding: 8px 0 12px 0;
  margin-bottom: 12px;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    font-size: 13px;
    color: #6a7891;

    &--payable {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #f0f3f8;
    }
  }

  &__name {
    color: #0f1b33;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
  }

  // 余量抵扣行：固定占位高度（行始终渲染，仅内部文字条件渲染），
  // 这样 serverDeductionAmount=0 时整张卡片高度也不会变化
  &__row--deduction {
    min-height: 32px;
  }

  &__help {
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
    line-height: 1;
    cursor: help;
    user-select: none;

    &:hover {
      background: #4a7afb;
      color: #fff;
    }
  }

  &__amount {
    font-weight: 600;
    color: #0f1b33;

    &--red {
      color: #ff4d4f;
      font-size: 16px;
    }

    &--green {
      color: #19be6b;
    }

    &--payable {
      color: #ff4d4f;
      font-size: 18px;
      font-weight: 800;
    }
  }
}

.tpb-balance-strong {
  color: #1456e6;
  font-weight: 700;
}

/* ============ 支付确认弹框 ============ */
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

  strong {
    color: #0f1b33;
    font-weight: 600;
  }
}

.tpb-pay-modal__amount {
  color: #ff4d4f;
  font-size: 16px;
  font-weight: 700;
}

.tpb-pay-modal__balance {
  /deep/ .ivu-form-item {
    margin-bottom: 14px;
  }
}

.tpb-pay-modal__link {
  color: #1456e6;
  font-size: 12px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
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

.tpb-pay-modal__qr-img {
  width: 180px;
  height: 180px;
  border: 1px solid #e7ebf2;
  border-radius: 4px;
  background: #fff;
}

.tpb-pay-modal__qr-loading {
  width: 180px;
  height: 180px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #c5c8ce;
  font-size: 12px;

  /deep/ i.spin {
    animation: tpb-rotate 1s linear infinite;
    color: #1456e6;
  }
}

@keyframes tpb-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.tpb-pay-modal__qr-hint {
  margin-top: 10px;
  color: #808695;
  font-size: 12px;
}

/* ============ 设置支付密码弹框 ============ */
.tpb-set-pwd /deep/ .ivu-input[type='password'] {
  letter-spacing: 4px;
}

/* ============ 支付成功 / API KEY 弹框 ============ */
.tokenplan-success {
  text-align: center;
  padding: 24px 32px 8px;

  &__icon {
    margin-bottom: 16px;
  }

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

  &__copy {
    flex-shrink: 0;
    margin-left: 12px;
    // background: #ff6b35;
    // border-color: #ff6b35;
  }

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

    &:last-child {
      border-bottom: none;
    }
  }

  &__detail-label {
    color: #86909c;
  }

  &__detail-value {
    color: #1d2129;
  }

  &__detail-value--accent {
    color: #4a7afb;
  }

  &__actions {
    margin-top: 8px;
  }

  &__btn-primary {
    // background: #ff6b35;
    // border-color: #ff6b35;
    margin-bottom: 12px;
    font-size: 14px;
    height: 40px;
  }

  &__btn-ghost {
    // background: #c9cdd4;
    // border-color: #c9cdd4;
    // color: #fff;
    font-size: 14px;
    height: 40px;

    &:hover {
      background: #b8bcc4;
      border-color: #b8bcc4;
      color: #fff;
    }
  }
}
</style>