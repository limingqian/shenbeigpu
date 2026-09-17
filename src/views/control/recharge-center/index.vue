<template>
  <div class="recharge-center">
    <!-- 顶部面包屑 -->
    <div class="recharge-center__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>充值中心</BreadcrumbItem>
        <BreadcrumbItem>充值中心</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 我的账户 -->
    <div class="section">
      <div class="section-title">我的账户</div>
      <div class="balance-card">
        <div class="balance-info">
          <div class="label">账户余额</div>
          <div class="amount-wrapper">
            <span class="value">{{ balance || '0.00' }}</span>
            <span class="unit">元</span>
            <span v-if="frozenBalance && parseFloat(frozenBalance) > 0" class="frozen-hint">（其中冻结金额：¥{{ frozenBalance
              }}）</span>
          </div>
        </div>
        <a class="record-link" @click="handleToRecords">充值记录</a>
      </div>
    </div>

    <!-- 充值金额 -->
    <div class="section section--inline" style="align-items: center;">
      <div class="section-title">充值金额</div>
      <div class="amount-options">
        <div v-for="amount in amountOptions" :key="amount" class="amount-item"
          :class="{ active: form.amount === amount }" @click="selectAmount(amount)">
          {{ amount.toFixed(2) }} 元
        </div>
        <div class="custom-input">
          <!-- {{ form.customAmount }}{{ typeof form.customAmount }} -->
          <InputNumber v-model="form.customAmount" :min="0" :max="5000" placeholder="请输入金额" style="width: 200px;height: 36px;"
            @on-focus="handleCustomFocus" @on-change="handleCustomChange" @on-blur="handleCustomBlur">
          <span slot="suffix" class="custom-input__suffix">元</span>
          </InputNumber>
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="section section--inline">
      <div class="section-title">支付方式</div>
      <div class="pay-wrapper">
        <div class="pay-methods">
          <div class="pay-method" :class="{ active: form.payMethod === 'wechat' }" @click="form.payMethod = 'wechat'">
            <!-- <Icon type="logo-wechat" size="20" color="#09bb07" /> -->
            <svg t="1777341915964" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="6261" width="24" height="24">
              <path
                d="M404.511405 600.865957c-4.042059 2.043542-8.602935 3.223415-13.447267 3.223415-11.197016 0-20.934798-6.169513-26.045189-15.278985l-1.959631-4.296863-81.56569-178.973184c-0.880043-1.954515-1.430582-4.14746-1.430582-6.285147 0-8.251941 6.686283-14.944364 14.938224-14.944364 3.351328 0 6.441713 1.108241 8.94165 2.966565l96.242971 68.521606c7.037277 4.609994 15.433504 7.305383 24.464181 7.305383 5.40101 0 10.533914-1.00284 15.328104-2.75167l452.645171-201.459315C811.496653 163.274644 677.866167 100.777241 526.648117 100.777241c-247.448742 0-448.035176 167.158091-448.035176 373.361453 0 112.511493 60.353576 213.775828 154.808832 282.214547 7.582699 5.405103 12.537548 14.292518 12.537548 24.325012 0 3.312442-0.712221 6.358825-1.569752 9.515724-7.544837 28.15013-19.62599 73.202209-20.188808 75.314313-0.940418 3.529383-2.416026 7.220449-2.416026 10.917654 0 8.245801 6.692423 14.933107 14.944364 14.933107 3.251044 0 5.89015-1.202385 8.629541-2.7793l98.085946-56.621579c7.377014-4.266164 15.188934-6.89913 23.790846-6.89913 4.577249 0 9.003048 0.703011 13.174044 1.978051 45.75509 13.159718 95.123474 20.476357 146.239666 20.476357 247.438509 0 448.042339-167.162184 448.042339-373.372709 0-62.451354-18.502399-121-51.033303-173.009356L407.778822 598.977957 404.511405 600.865957z"
                fill="#00C800" p-id="6262"></path>
            </svg>
            <span class="text">微信支付</span>
          </div>
        </div>
        <!-- 温馨提示放在微信支付卡下方，与卡左侧对齐 -->
        <div class="recharge-tips recharge-tips--inline">
          <h4 class="tips-title">* 温馨提示:</h4>
          <ol class="tips-list">
            <li>充值金额为平台预充值费用，所充值金额不可用于提现仅限平台内消费使用。</li>
            <li>请注意您的银行卡充值限制，以免造成不便。</li>
            <li>当前为平台优惠期间，产品价格随时会有不同的变化。</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="section section--inline" style="align-items: center;">
      <div class="section-title">充值金额</div>
      <div class="pay-wrapper">

        <div class="pay-actions">
          <span class="recharge-amount-tip">¥{{ finalAmount.toFixed(2) }}</span>
          <Button type="primary" class="submit-btn" :disabled="finalAmount <= 0" @click="handleRecharge">立即充值</Button>
        </div>
      </div>
    </div>

    <!-- 支付二维码弹窗 -->
    <Modal v-model="showQrModal" title="扫码支付" width="400" :footer-hide="true" :mask-closable="false"
      @on-cancel="handleModalCancel">
      <div class="qr-modal-content">
        <div class="qr-info">
          <p class="amount">充值金额：<span class="amount-value">{{ currentRechargeAmount }} 元</span></p>
          <p class="order-no">订单号：<span class="order-no-value">{{ currentOrderNo }}</span></p>
        </div>
        <div class="qr-code-wrapper">
          <canvas v-if="qrCodeUrl" ref="qrCanvas" width="150" height="150" class="qr-code"></canvas>
          <Spin v-else fix>加载中...</Spin>
        </div>
        <p class="qr-tip">请使用{{ payMethodName }}扫描二维码完成支付</p>
        <div class="polling-status" v-if="isPolling">
          <Icon type="ios-time" />
          <span>正在查询支付状态...</span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'RechargeCenter',
  data () {
    return {
      amountOptions: [100, 300, 500, 1000],
      balance: '-',
      frozenBalance: '',
      form: {
        // amount: 100,
        amount: 0,
        customAmount: null,
        payMethod: 'wechat'
      },
      // 支付弹窗相关
      showQrModal: false,
      qrCodeUrl: '',
      currentRechargeAmount: '0.00',
      currentOrderNo: '',
      isPolling: false,
      pollingTimer: null,
      pollingCount: 0,
      maxPollingCount: 100, // 最大轮询次数（约5分钟）
      pollingInterval: 3000 // 轮询间隔（3秒）
    }
  },
  mounted () {
    this.loadBalance();
  },
  computed: {
    // 最终充值金额
    finalAmount () {
      const amount = this.form.amount || this.form.customAmount || 0
      return Number(amount)
    },
    // 根据支付方式获取支付方式名称
    payMethodName () {
      const methodMap = {
        wechat: '微信',
        alipay: '支付宝'
      };
      return methodMap[this.form.payMethod] || '';
    }
  },
  beforeDestroy () {
    // 组件销毁时清除轮询定时器
    this.stopPolling();
  },
  methods: {
    async loadBalance () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAccountService/getBalance',
          method: 'post',
          data: {}
        });
        if (res.errcode === 0 && res.data) {
          this.balance = res.data.balance || '0.00';
          this.frozenBalance = res.data.frozenBalance || '';
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.warning(res.errmsg || '获取账户余额失败');
        }
      } catch (error) {
        console.error('获取余额失败', error);
        this.$Message.error('获取账户余额失败，请稍后重试');
      }
    },
    selectAmount (amount) {
      this.form.amount = amount;
      this.form.customAmount = null;
    },
    handleCustomFocus () {
      this.form.amount = null;
    },
    handleCustomChange () {
      // const val = this.form.customAmount;
      // if (val === null || val === '') return;
      // let s = String(val);

      // // 1. 去掉非数字/小数点字符（防御粘贴、IME 输入、键盘误触等场景）
      // s = s.replace(/[^0-9.]/g, '');

      // // 2. 仅保留第一个小数点
      // const firstDot = s.indexOf('.');
      // if (firstDot !== -1) {
      //   s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
      // }

      // // 3. 整数部分最多 5 位（≤ 99999，即不超过十万）
      // s = s.replace(/^(\d{0,5})(\..*)?$/, (_, intPart, rest) => intPart + (rest || ''));

      // // 4. 限制小数位最多 2 位
      // s = s.replace(/^(\d+)(\.\d{0,2}).*$/, '$1$2');

      // // 5. 与原值不一致时，强制清洗回输入框
      // if (s !== String(val)) {
      //   this.$nextTick(() => {
      //     this.form.customAmount = s === '' ? '' : Number(s) || s;
      //   });
      // }
       // 防御：如果 e 是事件对象，从 DOM 中取真实输入值
      let raw;
      if (e && e.target && typeof e.target.value === 'string') {
        raw = e.target.value;
      } else {
        raw = this.form.customAmount;
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
          this.form.customAmount = s === '' ? '' : Number(s) || s;
        });
      }
    },
    handleCustomBlur () {
      // 失去焦点时确保值为正整数
      if (this.form.customAmount === null || this.form.customAmount === '') {
        this.form.customAmount = null;
        return;
      }
      const num = parseFloat(this.form.customAmount).toFixed(2);
      if (isNaN(num) || num < 0) {
        this.form.customAmount = null;
      } else {
        this.form.customAmount = parseFloat(num);
      }
    },
    handleRecharge () {
      const amount = this.form.amount || this.form.customAmount;
      if (!amount || isNaN(amount) || amount <= 0) {
        return this.$Message.warning('请输入或选择有效的充值金额');
      }
      this.createRechargeOrder(amount);
    },
    // 创建充值订单
    async createRechargeOrder (amount) {
      // 先查询用户认证状态
      try {
        const authRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        });

        if (authRes.data && authRes.data.authStatus !== 'PASSED') {
          this.$Message.error({
            content: '需要认证后才能进行充值',
            duration: 5
          });
          this.$router.push('/shenbeigpuai/control/auth-apply');
          return;
        }
      } catch (e) {
        console.error('查询认证状态失败:', e);
        this.$Message.error('查询认证状态失败');
        return;
      }

      try {
        this.$Message.loading({
          content: '正在创建订单...',
          duration: 0
        });

        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/rechargeOrderService/createRechargeOrder',
          method: 'post',
          data: {
            amount: amount,
            paymentMethod: this.form.payMethod
          }
        });

        this.$Message.destroy();
        if (res.errcode === 0 && res.data) {
          // 显示支付二维码
          this.currentRechargeAmount = amount;
          this.currentOrderNo = res.data.orderNo;
          // this.qrCodeUrl = res.data.qrCode;
          this.qrCodeUrl = 'for test';
          this.showQrModal = true;
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

          // 开始轮询支付状态
          this.startPolling(res.data.orderNo);
        } else {
          this.$Message.warning(res.errmsg || '创建订单失败');
        }
      } catch (error) {
        this.$Message.destroy();
        console.error('创建订单失败', error);
        this.$Message.error('创建订单失败，请稍后重试');
      }
    },
    // 开始轮询支付状态
    startPolling (orderNo) {
      this.isPolling = true;
      this.pollingCount = 0;

      this.pollingTimer = setInterval(async () => {
        this.pollingCount++;

        // 检查是否超过最大轮询次数
        if (this.pollingCount > this.maxPollingCount) {
          this.stopPolling();
          this.$Message.warning('支付超时，请重新发起充值');
          this.showQrModal = false;
          return;
        }

        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/rechargeOrderService/getPaymentStatus',
            method: 'post',
            data: {
              orderNo: orderNo
            }
          });

          // 处理响应数据
          let orderData = null;
          if (res.errcode === 0 && res.data) {
            orderData = res.data;
          } else if (res.data && typeof res.data === 'object') {
            // 兼容直接返回订单数据的情况
            orderData = res.data;
          }

          if (orderData) {
            const paymentStatus = orderData.paymentStatus;

            // 支付成功
            if (paymentStatus === 'paid') {
              this.stopPolling();
              this.$Message.success('充值成功！');
              this.showQrModal = false;
              // 刷新余额
              this.loadBalance();
            }
            // 支付失败
            else if (paymentStatus === 'failed') {
              this.stopPolling();
              this.$Message.error('支付失败，请重新充值');
              this.showQrModal = false;
            }
            // 订单已取消
            else if (paymentStatus === 'cancelled') {
              this.stopPolling();
              this.$Message.warning('订单已取消');
              this.showQrModal = false;
            }
          }
        } catch (error) {
          console.error('查询支付状态失败', error);
          // 不中断轮询，继续下一次查询
        }
      }, this.pollingInterval);
    },
    // 停止轮询
    stopPolling () {
      this.isPolling = false;
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },
    handleToRecords () {
      this.$router.push({ path: '/shenbeigpuai/control/transaction-details', query: { transactionType: 'recharge' } });
    },
    // 弹框关闭时的处理（临时测试逻辑）
    async handleModalCancel () {
      // 如果正在轮询，先停止轮询
      if (this.isPolling) {
        this.stopPolling();
      }

      // 调用临时模拟支付成功接口
      // try {
      //   await this.$hdAxios.request({
      //     url: '/api/ac/shenbeigpuai/rechargeOrderService/mockPaymentSuccess',
      //     method: 'post',
      //     data: {
      //       amount: this.currentRechargeAmount,
      //       userId: 'user_001'
      //     }
      //   });

      //     this.$Message.success('充值成功！');
      //     // 刷新余额
      //     await this.loadBalance();
      //   } catch (error) {
      //     console.error('模拟支付失败', error);
      //     this.$Message.error('充值失败，请稍后重试');
      //   }
    }
  }
}
</script>

<style lang="less" scoped>
.recharge-center {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;

  &__breadcrumb {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  .section {
    background: #fff;
    padding: 16px 20px;
    margin-bottom: 12px;
    border-radius: 4px;

    &-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    &--inline {
      display: flex;
      // align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .section-title {
        margin-bottom: 0;
        flex-shrink: 0;
      }

      .amount-options {
        flex: 1;
        min-width: 0;
      }

      .pay-wrapper {
        flex: 1;
        min-width: 0;
      }
    }
  }

  // 余额卡片
  .balance-card {
    background: #f5f8ff;
    padding: 24px 32px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .balance-info {
      .label {
        font-size: 13px;
        color: #808695;
        margin-bottom: 8px;
      }

      .amount-wrapper {
        color: #4a7afb;
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;

        .value {
          font-size: 36px;
          font-weight: bold;
          line-height: 1;
        }

        .unit {
          font-size: 14px;
          margin-left: 12px;
          color: #515a6e;
        }

        .frozen-hint {
          color: #808695;
          font-size: 12px;
          font-weight: normal;
          margin-left: 16px;
        }
      }
    }

    .record-link {
      color: #4a7afb;
      font-size: 13px;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  // 金额选项
  .amount-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .amount-item {
      width: 120px;
      height: 36px;
      line-height: 34px;
      text-align: center;
      border: 1px solid #dcdee2;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: #515a6e;
      transition: all 0.2s;

      &:hover {
        border-color: #4a7afb;
        color: #4a7afb;
      }

      &.active {
        background: #fff;
        border-color: #4a7afb;
        color: #4a7afb;
        box-shadow: 0 0 0 1px #4a7afb;
      }
    }

    // 自定义金额输入框与 .amount-item 等高（36px）
    .custom-input {
      height: 36px;

      /deep/ .ivu-input {
        height: 36px;
        line-height: 34px;
        font-size: 13px;
      }

      /deep/ .ivu-input-wrapper .ivu-input-suffix {
        height: 36px;
        line-height: 36px;
        padding-right: 10px;
      }

      /deep/ .ivu-input-number-handler{
        height: 18px;
      }

      .custom-input__suffix {
        line-height: 34px;
      }
    }
  }

  // 支付方式
  .pay-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .pay-methods {
      display: flex;
      gap: 16px;

      .pay-method {
        width: 180px;
        height: 60px;
        border: 1px solid #dcdee2;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        background: #fff;

        .text {
          margin-left: 8px;
          font-size: 16px;
          color: #515a6e;
        }

        &.active {
          border-color: #4a7afb;
          background: #fff;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            inset: 0;
            border: 1px solid #4a7afb;
            border-radius: 4px;
          }
        }

        &:not(.active) {
          background: #f8f8f9;
        }
      }
    }

    .pay-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .recharge-amount-tip {
        color: #ed4014;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .submit-btn {
      width: 120px;
      height: 34px;
      // background: #4a7afb;
      // border-color: #4a7afb;
      font-size: 15px;
    }
  }

  // 提示信息
  .recharge-tips {
    margin-top: 20px;
    padding: 0 20px;

    .tips-title {
      font-size: 12px;
      color: #4a7afb;
      margin-bottom: 10px;
    }

    .tips-list {
      list-style: decimal;
      padding-left: 20px;

      li {
        font-size: 12px;
        color: #999;
        margin-bottom: 6px;
        line-height: 1.6;
      }
    }

    // 放在支付方式内时：与微信支付卡同宽（180px），左侧对齐
    &--inline {
      margin-top: 12px;
      padding: 0;
      // width: 180px;
      flex-shrink: 0;
    }
  }
}

// 二维码弹窗
.qr-modal-content {
  text-align: center;
  padding: 20px 0;

  .qr-info {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    .amount {
      font-size: 14px;
      color: #515a6e;
      margin-bottom: 8px;

      .amount-value {
        font-size: 24px;
        font-weight: bold;
        color: #4a7afb;
        margin-left: 5px;
      }
    }

    .order-no {
      font-size: 12px;
      color: #808695;

      .order-no-value {
        font-family: monospace;
        font-size: 13px;
        color: #515a6e;
        margin-left: 5px;
      }
    }
  }

  .qr-code-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 220px;
    margin: 20px 0;

    .qr-code {
      width: 200px;
      height: 200px;
      border: 1px solid #eee;
      padding: 10px;
      border-radius: 4px;
    }
  }

  .qr-tip {
    font-size: 13px;
    color: #808695;
    margin-top: 15px;
  }

  .polling-status {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-size: 13px;
    color: #4a7afb;

    i {
      margin-right: 5px;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
