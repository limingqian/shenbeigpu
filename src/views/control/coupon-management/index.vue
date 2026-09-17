<template>
  <div class="coupon-management">
    <!-- 顶部面包屑 -->
    <div class="coupon-management__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>充值中心</BreadcrumbItem>
        <BreadcrumbItem>优惠券</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 标签页切换 -->
    <Tabs value="pending" :animated="false" class="coupon-tabs" @on-click="handleTabChange">
      <TabPane label="待使用" name="pending">
        <Spin fix v-if="loading"></Spin>
        <div class="coupon-grid" v-if="!loading && pendingCoupons.length > 0">
          <div v-for="(item, index) in pendingCoupons" :key="index" class="coupon-ticket">
            <!-- 左侧装饰圆孔 -->
            <div class="ticket-cutout left"></div>
            <!-- 右侧装饰圆孔 -->
            <div class="ticket-cutout right"></div>

            <div class="ticket-inner">
              <!-- 左侧面值区 -->
              <div class="ticket-left">
                <div class="ticket-title">{{ item.couponName }}</div>
                <div class="ticket-amount">
                  <span class="currency">¥</span>
                  <span class="value">{{ item.amount }}</span>
                  <span class="unit">元</span>
                </div>
                <div class="ticket-min-amount">满 ¥{{ item.minAmount }} 可用</div>
              </div>

              <!-- 分割线 -->
              <div class="ticket-divider"></div>

              <!-- 右侧信息区 -->
              <div class="ticket-right">
                <div class="ticket-expiry">有效期至 {{ formatExpireTime(item.expireTime) }}</div>
                <Button type="primary" size="small" class="ticket-btn" @click="handleActivate(item)">去激活</Button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="!loading && pendingCoupons.length === 0">暂无待使用优惠券</div>
      </TabPane>
      <TabPane label="已使用" name="used">
        <Spin fix v-if="loading"></Spin>
        <div class="coupon-grid" v-if="!loading && usedCoupons.length > 0">
          <div v-for="(item, index) in usedCoupons" :key="index" class="coupon-ticket coupon-ticket--used">
            <div class="ticket-cutout left"></div>
            <div class="ticket-cutout right"></div>

            <div class="ticket-inner">
              <div class="ticket-left">
                <div class="ticket-title">{{ item.couponName }}</div>
                <div class="ticket-amount">
                  <span class="currency">¥</span>
                  <span class="value">{{ item.amount }}</span>
                  <span class="unit">元</span>
                </div>
                <div class="ticket-min-amount">满 ¥{{ item.minAmount }} 可用</div>
              </div>

              <div class="ticket-divider"></div>

              <div class="ticket-right">
                <div class="ticket-expiry">使用时间 {{ formatExpireTime(item.useTime) }}</div>
                <div class="ticket-badge">已使用</div>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="!loading && usedCoupons.length === 0">暂无已使用优惠券</div>
      </TabPane>
      <TabPane label="已过期" name="expired">
        <Spin fix v-if="loading"></Spin>
        <div class="coupon-grid" v-if="!loading && expiredCoupons.length > 0">
          <div v-for="(item, index) in expiredCoupons" :key="index" class="coupon-ticket coupon-ticket--expired">
            <div class="ticket-cutout left"></div>
            <div class="ticket-cutout right"></div>

            <div class="ticket-inner">
              <div class="ticket-left">
                <div class="ticket-title">{{ item.couponName }}</div>
                <div class="ticket-amount">
                  <span class="currency">¥</span>
                  <span class="value">{{ item.amount }}</span>
                  <span class="unit">元</span>
                </div>
                <div class="ticket-min-amount">满 ¥{{ item.minAmount }} 可用</div>
              </div>

              <div class="ticket-divider"></div>

              <div class="ticket-right">
                <div class="ticket-expiry">过期时间 {{ formatExpireTime(item.expireTime) }}</div>
                <div class="ticket-badge">已过期</div>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="!loading && expiredCoupons.length === 0">暂无已过期优惠券</div>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
export default {
  name: 'CouponManagement',
  data() {
    return {
      loading: false,
      activeTab: 'pending',
      allCoupons: [],
      pendingCoupons: [],
      usedCoupons: [],
      expiredCoupons: []
    }
  },
  created() {
    this.fetchCouponList()
  },
  methods: {
    /**
     * 获取优惠券列表
     */
    async fetchCouponList() {
      this.loading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/financeCouponService/listCoupon',
          method: 'post',
          data: {}
        })

        const resp = { data: res }
        if (resp.data.errcode === 0) {
          const couponList = Array.isArray(resp.data.data) ? resp.data.data : []
          this.allCoupons = couponList
          this.filterCouponsByStatus()
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '获取优惠券列表失败')
        }
      } catch (error) {
        console.error('获取优惠券列表失败:', error)
        this.$Message.error('获取优惠券列表失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 根据状态筛选优惠券
     */
    filterCouponsByStatus() {
      const now = new Date()
      this.pendingCoupons = this.allCoupons.filter(coupon => {
        if (coupon.status !== '待使用') return false
        if (!coupon.expireTime) return true
        const expireTime = new Date(coupon.expireTime)
        return expireTime > now
      })

      this.usedCoupons = this.allCoupons.filter(coupon => coupon.status === '已使用')

      this.expiredCoupons = this.allCoupons.filter(coupon => {
        if (coupon.status === '已过期') return true
        if (coupon.status === '待使用' && coupon.expireTime) {
          const expireTime = new Date(coupon.expireTime)
          return expireTime <= now
        }
        return false
      })
    },

    /**
     * 标签页切换
     */
    handleTabChange(name) {
      this.activeTab = name
    },

    /**
     * 格式化过期时间
     */
    formatExpireTime(timeStr) {
      if (!timeStr) return '-'
      try {
        const date = new Date(timeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}年${month}月${day}日 ${hours}:${minutes}`
      } catch (error) {
        return timeStr
      }
    },

    /**
     * 激活优惠券
     */
    handleActivate(item) {
      this.$Message.success(`正在为您激活：${item.couponName}`)
    }
  }
}
</script>

<style lang="less" scoped>
.coupon-management {
  padding: 16px 24px;
  background: #fff;
  min-height: 100vh;

  &__breadcrumb {
    margin-bottom: 20px;
    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  .coupon-tabs {
    /deep/ .ivu-tabs-bar {
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 24px;
    }
    /deep/ .ivu-tabs-nav .ivu-tabs-tab {
      padding: 12px 16px;
      font-size: 14px;
    }
  }

  .coupon-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 10px 4px;
  }

  .coupon-ticket {
    position: relative;
    width: 320px;
    height: 110px;
    background: #fff;
    border: 1.5px solid #adc6ff;
    border-radius: 4px;
    overflow: visible;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 8px rgba(45, 140, 240, 0.15);
      transform: translateY(-2px);
    }

    &--used,
    &--expired {
      border-color: #dcdee2;
      background: #f7f7f7;

      .ticket-amount {
        color: #c5c8ce;
      }

      .ticket-title {
        color: #808695;
      }
    }

    .ticket-cutout {
      position: absolute;
      top: 50%;
      width: 16px;
      height: 16px;
      background: #fff;
      border: 1.5px solid #adc6ff;
      border-radius: 50%;
      transform: translateY(-50%);
      z-index: 2;

      &.left {
        left: -9px;
        clip-path: circle(50% at 100% 50%);
      }
      &.right {
        right: -9px;
        clip-path: circle(50% at 0 50%);
      }
    }

    .ticket-inner {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 20px;
    }

    .ticket-left {
      flex: 1.2;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .ticket-title {
        font-size: 13px;
        color: #17233d;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .ticket-amount {
        color: #2d8cf0;
        display: flex;
        align-items: baseline;
        margin-bottom: 6px;

        .currency { font-size: 14px; margin-right: 4px; font-weight: bold; }
        .value { font-size: 26px; font-weight: bold; }
        .unit { font-size: 12px; margin-left: 4px; color: #515a6e; }
      }

      .ticket-min-amount {
        font-size: 11px;
        color: #808695;
      }
    }

    .ticket-divider {
      height: 60%;
      width: 1px;
      border-left: 1px dashed #adc6ff;
      margin: 0 16px;
    }

    .ticket-right {
      flex: 1.5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .ticket-expiry {
        font-size: 12px;
        color: #808695;
        margin-bottom: 12px;
        white-space: nowrap;
      }

      .ticket-btn {
        width: 100%;
        border-radius: 2px;
        font-size: 12px;
        // padding: 4px 0;
        background: #4a7afb;
        border-color: #4a7afb;
      }

      .ticket-badge {
        font-size: 12px;
        color: #c5c8ce;
        font-weight: 500;
      }
    }
  }

  .empty-state {
    padding: 60px 0;
    text-align: center;
    color: #c5c8ce;
  }
}
</style>
