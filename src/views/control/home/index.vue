<template>
  <div class="control-home">
    <!-- 装饰模糊光斑 -->
    <div class="control-home__bg-decor">
      <span class="control-home__blur control-home__blur--1"></span>
      <span class="control-home__blur control-home__blur--2"></span>
      <span class="control-home__blur control-home__blur--3"></span>
      <span class="control-home__blur control-home__blur--4"></span>
    </div>

    <Row :gutter="16">
      <!-- 左侧区域：每个卡片占一行 -->
      <Col span="18">
      <!-- 实例 -->
      <div class="control-home__block control-home__block--stats">
        <div class="control-home__block-title-wrap">
          <span class="control-home__title-icon control-home__title-icon--instance"></span>
          <span>实例</span>
        </div>
        <div class="control-home__stat-grid">
          <div v-for="stat in instanceStats" :key="stat.label" class="control-home__stat-cell">
            <div class="control-home__stat-label">{{ stat.label }}</div>
            <div class="control-home__stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </div>

      <!-- 模型 -->
      <div class="control-home__block control-home__block--stats">
        <div class="control-home__block-title-wrap">
          <span class="control-home__title-icon control-home__title-icon--model"></span>
          <span>模型</span>
        </div>
        <div class="control-home__stat-grid">
          <div v-for="stat in cpStats" :key="stat.label" class="control-home__stat-cell">
            <div class="control-home__stat-label">{{ stat.label }}</div>
            <div class="control-home__stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </div>

      <!-- 费用明细 -->
      <div class="control-home__block">
        <div class="control-home__block-title">
          <span class="control-home__title-icon control-home__title-icon--cost"></span>
          <span>费用明细</span>
        </div>
        <div class="control-home__block-body1">
          <div class="control-home__cost-row">
            <div style="display: flex;justify-content: space-between;align-items: center;">
              <div>
                <div class="control-home__cost-label">账户余额</div>
                <div class="control-home__cost-content">
                  <span class="control-home__cost-value">{{ costInfo.balance }}</span>
                  <span class="control-home__cost-unit">元</span>
                </div>
              </div>
              <div>
                <Button type="primary" size="small" class="control-home__cost-btn" @click="handleToRecharge">充值</Button>
              </div>
            </div>
          </div>
          <div class="control-home__cost-row">
            <div class="control-home__cost-label">优惠券</div>
            <div class="control-home__cost-content">
              <span class="control-home__cost-value">{{ costInfo.coupons }}</span>
              <span class="control-home__cost-unit">张</span>
            </div>
          </div>
          <div class="control-home__cost-row">
            <div class="control-home__cost-label">可开发票</div>
            <div class="control-home__cost-content">
              <span class="control-home__cost-value">{{ costInfo.invoiceable }}</span>
              <span class="control-home__cost-unit">元</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统公告 -->
      <div class="control-home__block">
        <div class="control-home__block-title">
          <span>系统公告</span>
        </div>
        <div class="control-home__block-body">
          <div v-if="announcements.length === 0" class="control-home__empty">
            <p>暂无公告</p>
          </div>
          <div v-else class="control-home__announcement-list">
            <div v-for="(item, index) in announcements" :key="index" class="control-home__announcement-item"
              :class="{ 'is-top': item.isTop === '1' }" @click="handleAnnouncementClick(item)">
              <span class="control-home__announcement-text">
                <Icon v-if="item.isTop === '1'" style="color: #4C55F3;" type="md-arrow-up" />
                <div v-else style="width: 10px;padding: 4px;">
                  <div class="dot"></div>
                </div>
                <span style="margin-left: 6px;">{{ item.title }}</span>
                <div v-if="item.isRead !== '1'" class="new-tag">新</div>
                <!-- <Tag v-if="item.isRead !== '1'" color="primary" size="medium" class="new-tag">新</Tag> -->
              </span>
              <span class="control-home__announcement-date">{{ formatDate(item.publishTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      </Col>

      <!-- 右侧区域 -->
      <Col span="6">

      <!-- 常用功能 -->
      <div class="control-home__block">
        <div class="control-home__block-title">
          <span style="font-size: 14px;">常用功能</span>
        </div>
        <div class="control-home__quick-btns">
          <Button icon="md-cart" size="small" @click="handleToInstanceList">实例列表</Button>
          <Button icon="ios-settings" size="small" @click="handleToRecharge">充值中心</Button>
          <Button icon="md-key" size="small" @click="handleUserSettings">用户设置</Button>
        </div>
      </div>

      <!-- 操作日志 -->
      <div class="control-home__block">
        <div class="control-home__block-title">
          <span style="font-size: 14px;">操作日志</span>
        </div>
        <div class="control-home__block-body">
          <div v-if="operationLogs.length === 0" class="control-home__empty">
            <p>暂无数据</p>
          </div>
          <div v-else class="control-home__log-list">
            <div v-for="log in operationLogs" :key="log.id" class="control-home__log-item">
              <div class="control-home__log-header">
                <span class="control-home__log-operation">{{ log.operation }}</span>
                <span :class="['control-home__log-status', log.status]">{{ getStatusText(log.status) }}</span>
              </div>
              <div class="control-home__log-target">实例名称: 实例- {{ log.vmid }}</div>
              <div class="control-home__log-time">{{ log.createTime }}</div>
            </div>
          </div>
        </div>
      </div>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-control-home',
  data () {
    return {
      instanceStats: [
        { label: '容器实例 (台)', value: '-' },
        { label: '运行中 (台)', value: '-' },
        { label: '即将到期 (台)', value: '-' },
        { label: '即将释放 (台)', value: '-' }
      ],
      cpStats: [
        { label: '模型数量 (个)', value: '-' },
        { label: '调用次数 (次)', value: '-' },
        { label: 'Token 消耗量', value: '-' },
        { label: '模型状态', value: '-' }
      ],
      settings: {
        releaseWarning: false,
        balanceWarning: false
      },
      costInfo: {
        balance: '0.00',
        coupons: 0,
        invoiceable: '0.00'
      },
      announcements: [],
      accountInfo: {
        loginName: '',
        id: '',
        wechatBound: false
      },
      operationLogs: []
    }
  },
  mounted () {
    this.loadBalance()
    this.loadCoupons()
    this.loadUserAuth()
    this.loadInstanceStats()
    this.loadOperationLogs()
    this.loadAnnouncements()
    this.loadInvoiceable()
  },
  methods: {
    async loadBalance () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAccountService/getBalance',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0 && res.data) {
          this.costInfo.balance = res.data.balance || '0.00'
        }
      } catch (error) {
        console.error('获取余额失败', error)
        this.$Message.error('获取账户余额失败，请稍后重试')
      }
    },
    async loadCoupons () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/financeCouponService/listCoupon',
          method: 'post'
        })
        if (res.errcode === 0 && res.data) {
          const today = new Date().getTime()
          const availableCoupons = res.data.filter(item => {
            const expireTime = new Date(item.expireTime).getTime()
            return item.status === '待使用' && expireTime > today
          })
          this.costInfo.coupons = availableCoupons.length
        }
      } catch (error) {
        console.error('获取优惠券失败', error)
      }
    },
    async loadInvoiceable () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/financeTransactionService/getPendingInvoiceAmount',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0 && res.data !== undefined && res.data !== null) {
          this.costInfo.invoiceable = parseFloat(res.data).toFixed(2)
        } else {
          this.costInfo.invoiceable = '0.00'
        }
      } catch (error) {
        console.error('获取可开票金额失败', error)
        this.costInfo.invoiceable = '0.00'
      }
    },
    async loadUserAuth () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0 && res.data) {
          this.settings.releaseWarning = res.data.expireWarningEnabled === '1'
          this.settings.balanceWarning = res.data.balanceWarningEnabled === '1'
          if (res.data.accountBalance) {
            this.costInfo.balance = res.data.accountBalance
          }
          this.accountInfo.wechatBound = res.data.wxBindStatus === '1'
          this.accountInfo.loginName = res.data.loginName
        }
      } catch (error) {
        console.error('获取用户认证信息失败', error)
      }
    },
    async loadInstanceStats () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceStatsService/getInstanceStats',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0 && res.data) {
          this.instanceStats = [
            { label: '容器实例 (台)', value: res.data.totalCount || 0 },
            { label: '运行中 (台)', value: res.data.runningCount || 0 },
            { label: '即将到期 (台)', value: res.data.expiringCount || 0 },
            { label: '即将释放 (台)', value: res.data.releasingCount || 0 }
          ]
        }
      } catch (error) {
        console.error('获取实例统计信息失败', error)
      }
    },
    handleToInstanceList () {
      this.$router.push('/shenbeigpuai/control/instance-list')
    },
    handleToRecharge () {
      this.$router.push('/shenbeigpuai/control/recharge-center')
    },
    handleUserSettings () {
      this.$router.push('/shenbeigpuai/control/account-management')
    },
    async handleSwitchAccount () {
      await this.logout()
      this.$router.push('/login')
    },
    async handleLogout () {
      await this.logout()
      this.$router.push('/login')
    },
    async logout () {
      try {
        await this.$hdAxios.request({
          url: '/api/ac/sc/loginService/userLogOut',
          method: 'post'
        })
      } catch (error) {
        console.error('注销登录失败', error)
      }
    },
    async loadOperationLogs () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/operationLogService/getOperationLogs',
          method: 'post',
          data: { limit: 10 }
        })
        if (res.errcode === 0 && res.data) {
          this.operationLogs = res.data || []
        }
      } catch (error) {
        console.error('获取操作日志失败', error)
      }
    },
    getStatusText (status) {
      const statusMap = {
        'PENDING': '待执行',
        'PROCESSING': '执行中',
        'SUCCESS': '成功',
        'FAILED': '失败'
      }
      return statusMap[status] || status
    },
    sortNoticeList (list) {
      return [...list].sort((a, b) => {
        // 1、置顶优先级
        const topA = Number(a.isTop);
        const topB = Number(b.isTop);
        if (topB !== topA) {
          return topB - topA;
        }

        // 2、未读优先
        const readA = Number(a.isRead);
        const readB = Number(b.isRead);
        if (readA !== readB) {
          return readA - readB;
        }

        // 3、相同条件 updateTime 倒序，时间越大越靠前
        const timeA = new Date(a.updateTime).getTime();
        const timeB = new Date(b.updateTime).getTime();
        return timeB - timeA;
      });
    },
    async loadAnnouncements () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/consoleAnnouncementService/listAnnouncements',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0 && res.data) {
          // console.log(res.data, '+++++res.data+++++')
          // 测试用
          // let a = JSON.parse(JSON.stringify(res.data))
          // let a1 = Object.assign({}, a[0], { isTop: '0' })
          // let a2 = Object.assign({}, a[0], { isEnabled: '0' })
          // let a3 = Object.assign({}, a[0], { isRead: '0' })
          // let a4 = Object.assign({}, a[0], { isTop: '1' })
          // let test = [a1, a2, a3, a4]
          // console.log(test, '+++++test+++++')
          this.announcements = this.sortNoticeList(res.data)
          // this.announcements = this.sortNoticeList(test)
          // this.announcements = (res.data || [])
        }
      } catch (error) {
        console.error('获取系统公告失败', error)
      }
    },
    formatDate (dateStr) {
      if (!dateStr) return ''
      return dateStr.split(' ')[0]
    },
    async handleAnnouncementClick (item) {
      if (item.isRead !== '1') {
        try {
          await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/consoleAnnouncementService/addMarkAsRead',
            method: 'post',
            data: { id: item.id }
          })
          item.isRead = '1'
        } catch (error) {
          console.error('标记已读失败', error)
        }
      }
      this.$Modal.info({
        title: item.title,
        content: `<div style="max-height: 400px; overflow-y: auto; line-height: 1.8;">${item.content || '暂无内容'}</div>`,
        width: 600,
        okText: '我知道了'
      })
    }
  }
}
</script>

<style lang="less" scoped>
.dot {
  width: 4px;
  height: 4px;
  background: #4C55F3;
  border-radius: 50%;
}

.control-home {
  position: relative;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(133.72deg, #ddedf9 0%, rgba(224, 234, 239, 0.99) 100%);
  overflow: hidden;

  /* 装饰模糊光斑 */
  &__bg-decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }

  &__blur {
    position: absolute;
    border-radius: 50%;
    filter: blur(50px);

    &--1 {
      width: 598px;
      height: 598px;
      right: -200px;
      top: 100px;
      background: #cb9ff0;
      opacity: 0.09;
    }

    &--2 {
      width: 598px;
      height: 598px;
      left: -250px;
      top: 350px;
      background: #cb9ff0;
      opacity: 0.09;
    }

    &--3 {
      width: 908px;
      height: 908px;
      left: 20%;
      top: -150px;
      background: #5594dd;
      opacity: 0.09;
    }

    &--4 {
      width: 1098px;
      height: 1098px;
      right: -300px;
      top: -450px;
      background: #586eea;
      opacity: 0.14;
    }
  }

  >* {
    position: relative;
    z-index: 1;
  }

  /* 卡片块：每个占一行的独立容器（外层浅蓝、内层白色子块） */
  &__block {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    box-shadow: 0px 8px 15px rgba(0, 52, 255, 0.13);
    padding: 15px;
    margin-bottom: 20px;
  }

  &__block-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 标题前的图标 */
  &__title-icon {
    display: inline-block;
    width: 26px;
    height: 26px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    &--instance {
      background-image: url('~@/assets/file/shenbeigpuai/image/shili.png');
    }

    &--model {
      background-image: url('~@/assets/file/shenbeigpuai/image/moxing.png');
    }

    &--cost {
      background-image: url('~@/assets/file/shenbeigpuai/image/feiyongmingxi.png');
    }
  }

  /* 块体内容（白底子块） */
  &__block-body {
    background: #fff;
    border-radius: 5px;
    padding: 0px 15px 15px 15px;
    overflow: hidden;
    /* 隐藏超出部分，避免外边距合并 */
  }

  /* 实例/模型统计：标题与每个数据项都是独立白框 */
  &__block--stats {
    /* 浅蓝外层容器 */
  }

  &__block-title-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    // background: #fff;
    border-radius: 5px;
    // padding: 10px 16px;
    margin-bottom: 15px;
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
  }

  &__stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  /* 实例/模型统计子项：每个独立白框，内部左右结构 */
  &__stat-cell {
    background: #fff;
    border-radius: 5px;
    padding: 16px 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  &__stat-label {
    color: #000;
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
  }

  &__stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #1f2937;
    line-height: 1.2;
  }

  /* 费用明细三列 */
  &__cost-row {
    display: inline-block;
    width: calc(33.333% - 16px);
    margin-right: 20px;
    vertical-align: top;
    background: #fff;
    border-radius: 5px;
    padding: 15px;

    &:last-child {
      margin-right: 0;
    }
  }

  &__cost-label {
    color: #000;
    font-weight: 400;
    font-size: 12px;
    margin-bottom: 14px;
  }

  &__cost-content {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  &__cost-value {
    font-size: 22px;
    font-weight: bold;
    color: #1f2937;
  }

  &__cost-unit {
    font-size: 13px;
    color: #666;
    margin-right: 16px;
  }

  &__cost-btn {
    margin-left: auto;
    font-size: 12px;
    background-color: #4362FF;
    width: 76px;
    height: 28px;

    &:hover {
      background-color: #3651E0;
      border-color: #3651E0;
      color: #fff;
    }
  }

  /* 公告列表样式 */
  &__announcement-list {
    width: 100%;
  }

  &__announcement-item {
    display: flex;
    justify-content: space-between;
    border-radius: 8px;
    align-items: center;
    padding: 14px;
    background: #f7f8fc;
    margin-top: 15px;
    // border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f5f7fa;
    }

    &.is-top {
      // background: #fff8f0;

      &:hover {
        // background: #fff0e0;
      }
    }

    .top-tag {
      margin-right: 6px;
    }

    .new-tag {
      margin-left: 6px;
      background-color: #4362FF;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 300;
      font-size: 12px;
      color: #fff;
    }
  }

  &__announcement-text {
    font-size: 13px;
    color: #333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 12px;
    display: flex;
    align-items: center;
  }

  &__announcement-date {
    color: #999;
    font-size: 12px;
    flex-shrink: 0;
  }

  /* 账户信息样式 */
  &__info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 14px;
  }

  &__info-label {
    color: #999;
  }

  &__info-value {
    color: #333;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__account-actions {
    display: flex;
    gap: 12px;

    button {
      flex: 1;
      height: 28px;
      font-size: 12px;
      border-radius: 5px;
    }

    /* 退出登录按钮：自定义品牌色 #4362FF */
    .ivu-btn-primary {
      background-color: #4362FF;
      border-color: #4362FF;
      color: #fff;

      &:hover {
        background-color: #3651E0;
        border-color: #3651E0;
        color: #fff;
      }

      &:active,
      &:focus {
        background-color: #2B45CC;
        border-color: #2B45CC;
        color: #fff;
      }
    }
  }

  /* 常用功能样式 */
  &__quick-btns {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    button {
      padding: 6px 4px;
      // width: 120px;
      height: 28px;
      border-radius: 5px;
      text-align: center;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      // border: 1px dashed transparent;
      transition: border-color 0.2s, color 0.2s;

      /deep/ i {
        margin-right: 4px;
        font-size: 14px;
      }

      &:hover {
        border-color: #4362FF;
        color: #4362FF;
      }
    }
  }

  /* 操作日志样式 */
  &__log-list {
    width: 100%;
    max-height: 700px;
    overflow-y: auto;
    padding-right: 4px;

    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &::-webkit-scrollbar {
      width: 4px;
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 2px;
      transition: background 0.2s;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &:hover {
      scrollbar-color: #d9d9d9 transparent;

      &::-webkit-scrollbar-thumb {
        background: #d9d9d9;
      }
    }
  }

  &__log-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  &__log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  &__log-operation {
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }

  &__log-status {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 3px;

    &.PENDING {
      color: #999;
      background: #f5f5f5;
    }

    &.PROCESSING {
      color: #2d8cf0;
      background: #e6f7ff;
    }

    &.SUCCESS {
      color: #19be6b;
      background: #e6fff2;
    }

    &.FAILED {
      color: #ed4014;
      background: #fff2e6;
    }
  }

  &__log-target {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  &__log-time {
    font-size: 11px;
    color: #999;
  }

  /* 空状态样式 */
  &__empty {
    text-align: center;
    padding: 40px 0;

    p {
      color: #ccc;
      font-size: 12px;
    }
  }
}
</style>