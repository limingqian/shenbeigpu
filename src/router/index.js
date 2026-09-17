import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'layout',
    component: () => import('../views/control/sysframe/index.vue'),
    children: [
      {
        path: '/shenbeigpuai/control/account-management',
        name: 'account-management',
        component: () => import('../views/control/account-management/index.vue')
      },
      {
        path: '/shenbeigpuai/control/api-buy',
        name: 'api-buy',
        component: () => import('../views/control/api-buy/index.vue')
      },
      {
        path: '/shenbeigpuai/control/api-list',
        name: 'api-list',
        component: () => import('../views/control/api-list/index.vue')
      },
      {
        path: '/shenbeigpuai/control/auth-apply',
        name: 'auth-apply',
        component: () => import('../views/control/auth-apply/index.vue')
      },
      {
        path: '/shenbeigpuai/control/bill-detail',
        name: 'bill-detail',
        component: () => import('../views/control/bill-detail/index.vue')
      },
      {
        path: '/shenbeigpuai/control/bill-overview',
        name: 'bill-overview',
        component: () => import('../views/control/bill-overview/index.vue')
      },
      {
        path: '/shenbeigpuai/control/coupon-management',
        name: 'coupon-management',
        component: () => import('../views/control/coupon-management/index.vue')
      },
      {
        path: '/shenbeigpuai/control/home',
        name: 'home',
        component: () => import('../views/control/home/index.vue')
      },
      {
        path: '/shenbeigpuai/control/instance-buy',
        name: 'instance-buy',
        component: () => import('../views/control/instance-buy/index.vue')
      },
      {
        path: '/shenbeigpuai/control/instance-list',
        name: 'instance-list',
        component: () => import('../views/control/instance-list/index.vue')
      },
      {
        path: '/shenbeigpuai/control/invoice-management',
        name: 'invoice-management',
        component: () => import('../views/control/invoice-management/index.vue')
      },
      {
        path: '/shenbeigpuai/control/message-send-record',
        name: 'message-send-record',
        component: () => import('../views/control/message-send-record/index.vue')
      },
      {
        path: '/shenbeigpuai/control/mirror-management',
        name: 'mirror-management',
        component: () => import('../views/control/mirror-management/index.vue')
      },
      {
        path: '/shenbeigpuai/control/my-appointment',
        name: 'my-appointment',
        component: () => import('../views/control/my-appointment/index.vue')
      },
      {
        path: '/shenbeigpuai/control/network',
        name: 'network',
        component: () => import('../views/control/network/index.vue')
      },
      {
        path: '/shenbeigpuai/control/order-list',
        name: 'order-list',
        component: () => import('../views/control/order-list/index.vue')
      },
      {
        path: '/shenbeigpuai/control/platform-intro',
        name: 'platform-intro',
        component: () => import('../views/control/platform-intro/index.vue')
      },
      {
        path: '/shenbeigpuai/control/recharge-center',
        name: 'recharge-center',
        component: () => import('../views/control/recharge-center/index.vue')
      },
      {
        path: '/shenbeigpuai/control/switch',
        name: 'switch',
        component: () => import('../views/control/switch/index.vue')
      },
      {
        path: '/shenbeigpuai/control/ticket-list',
        name: 'ticket-list',
        component: () => import('../views/control/ticket-list/index.vue')
      },
      {
        path: '/shenbeigpuai/control/token-plan-buy',
        name: 'token-plan-buy',
        component: () => import('../views/control/token-plan-buy/index.vue')
      },
      {
        path: '/shenbeigpuai/control/token-plan-list',
        name: 'token-plan-list',
        component: () => import('../views/control/token-plan-list/index.vue')
      },
      {
        path: '/shenbeigpuai/control/transaction-details',
        name: 'transaction-details',
        component: () => import('../views/control/transaction-details/index.vue')
      }
    ]
  },
  {
    path: '/shenbeigpuai/portal/about',
    name: 'about',
    component: () => import('../views/portal/about/index.vue')
  },
  {
    path: '/shenbeigpuai/portal/api',
    name: 'api',
    component: () => import('../views/portal/api/index.vue')
  },
  {
    path: '/shenbeigpuai/portal/help',
    name: 'help',
    component: () => import('../views/portal/help/index.vue')
  },
  {
    path: '/shenbeigpuai/portal/home',
    name: 'home',
    component: () => import('../views/portal/home/index.vue')
  },
  {
    path: '/shenbeigpuai/portal/reg',
    name: 'reg',
    component: () => import('../views/portal/reg/index.vue')
  },
  {
    path: '/shenbeigpuai/portal/pwd',
    name: 'pwd',
    component: () => import('../views/portal/pwd/index.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/portal/loginpage/index.vue')
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
