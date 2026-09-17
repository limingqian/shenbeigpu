// ============================================================
// 全量接口 Mock（纯前端展示用）
// 思路：给 Vue.prototype.$hdAxios 注入一个 mock 实现，
//        所有 this.$hdAxios.request({ url, method, data }) 调用
//        都被此实现拦截，按 URL 返回 mocks 中配置的数据。
//        业务代码 0 改动。
//
// 目录结构：
//   src/mock/
//     index.js          <- 入口，自动合并下面所有模块
//     shared.js         <- 跨页面共享接口（用户信息、字典等）
//     pages/            <- 每个页面一个 mock 文件（文件名 = 页面名）
//       control-home.js
//       control-instance-list.js
//       ...
//
// 新增页面 mock：直接在 pages/ 下新建对应文件即可，无需修改本入口。
//
// 调用方式：
//   import { enableMock } from './mock'
//   enableMock()    // 在 Vue.use(scpcwPcPlugin) 之后调用
// ============================================================

import Vue from 'vue'

import shared from './shared'
import controlHome from './pages/control-home'
import sysframe from './pages/sysframe'
import portalHome from './pages/portal-home'
import portalGpu from './pages/portal-gpu'
import portalAbout from './pages/portal-about'
import portalApi from './pages/portal-api'
import portalHelp from './pages/portal-help'
import portalReg from './pages/portal-reg'
import portalPwd from './pages/portal-pwd'
import portalLoginpage from './pages/portal-loginpage'
import controlInstanceList from './pages/control-instance-list'
import controlInstanceBuy from './pages/control-instance-buy'
import controlAccountManagement from './pages/control-account-management'
import controlApiList from './pages/control-api-list'
import controlApiBuy from './pages/control-api-buy'
import controlRechargeCenter from './pages/control-recharge-center'
import controlAuthApply from './pages/control-auth-apply'
import controlMessageSendRecord from './pages/control-message-send-record'
import controlBillOverview from './pages/control-bill-overview'
import controlBillDetail from './pages/control-bill-detail'
import controlTokenPlanList from './pages/control-token-plan-list'
import controlTokenPlanBuy from './pages/control-token-plan-buy'
import controlNetwork from './pages/control-network'
import controlMirrorManagement from './pages/control-mirror-management'
import controlTicketList from './pages/control-ticket-list'
import controlOrderList from './pages/control-order-list'
import controlPlatformIntro from './pages/control-platform-intro'
import controlMyAppointment from './pages/control-my-appointment'
import controlInvoiceManagement from './pages/control-invoice-management'
import controlCouponManagement from './pages/control-coupon-management'
import controlSwitch from './pages/control-switch'
import controlTransactionDetails from './pages/control-transaction-details'

// ---------- 合并所有 mock 模块 ----------
// 后注册的同名 URL 会覆盖前面的，便于个别页面临时调整
// 注意：portalHome 放在最后，避免 control-instance-buy 等后注册的同名接口
// （如 productCategoryService/listTopCategory: []）覆盖掉门户首页需要的数据。
const mocks = Object.assign(
  {},
  shared,
  controlHome,
  sysframe,
  portalGpu,
  portalAbout,
  portalApi,
  portalHelp,
  portalReg,
  portalPwd,
  portalLoginpage,
  controlInstanceList,
  controlInstanceBuy,
  controlAccountManagement,
  controlApiList,
  controlApiBuy,
  controlRechargeCenter,
  controlAuthApply,
  controlMessageSendRecord,
  controlBillOverview,
  controlBillDetail,
  controlTokenPlanList,
  controlTokenPlanBuy,
  controlNetwork,
  controlMirrorManagement,
  controlTicketList,
  controlOrderList,
  controlPlatformIntro,
  controlMyAppointment,
  controlInvoiceManagement,
  controlCouponManagement,
  controlSwitch,
  controlTransactionDetails,
  // 门户首页最后注册，保证其同名接口不会被其它页面覆盖
  portalHome
)

// 兜底：未配置的接口（返回标准 { errcode, data, errmsg } 结构）
const fallback = (url) => ({
  errcode: 0,
  data: null,
  errmsg: 'success',
  _mockUrl: url
})

// 简易延迟（ms），让 loading 状态更真实；0 表示同步
const DEFAULT_DELAY = 0

/**
 * mock 版本的 $hdAxios
 * 兼容调用方式：this.$hdAxios.request({ url, method, data })
 *              this.$hdAxios({ url, method, data })
 *              this.$hdAxios.post(url, data, config)
 *              this.$hdAxios.get(url, config)
 */
function createMockHdAxios () {
  /**
   * 根据 cfg 解析 mock 数据。
   * mocks[url] 可以是：
   *   - 任意值（数组/对象/字符串...）：原样作为 data 返回
   *   - 函数：(cfg) => data：按 cfg.url/method/data 返回不同结果
   *   - 对象且带 _match 字段：高级匹配，详见下方注释
   */
  function resolveByUrl (cfg) {
    const url = cfg.url || ''
    const matched = mocks[url]
    if (matched === undefined && process.env.NODE_ENV !== 'production') {
      console.warn(`[mock] 未配置接口：${url}`)
    }

    let data
    if (typeof matched === 'function') {
      // 函数式 mock：根据 cfg（含 method/data）返回不同结果
      data = matched(cfg)
    } else if (
      matched && typeof matched === 'object' && !Array.isArray(matched) && matched._match
    ) {
      // 高级匹配：{ _match: { field: value | fn }, defaults?: any, [field]: any }
      // 例：{ _match: { tab: 'tokenPlan' }, list: [...], defaults: [] }
      data = matchByParams(matched, cfg)
    } else {
      data = matched !== undefined ? matched : fallback(url).data
    }

    return {
      errcode: 0,
      data,
      errmsg: 'success',
      _mock: true,
      _mockUrl: url
    }
  }

  /**
   * 高级匹配：根据 cfg.data / cfg.params 中的字段值挑选不同结果。
   * 配置示例：
   *   '/api/foo': {
   *     _match: { tab: 'tokenPlan' },   // 命中条件：cfg.data.tab === 'tokenPlan'
   *     data: [/* ... *\/],            // 命中后返回 data 字段（也可直接平铺到顶层）
   *     _else: []                       // 未命中返回 _else，未配置则返回 null
   *   }
   * 或简写：_match 写成函数 (cfg) => boolean
   */
  function matchByParams (matched, cfg) {
    const rule = matched._match
    const data = cfg.data || cfg.params || {}
    let hit = false
    if (typeof rule === 'function') {
      hit = rule(cfg)
    } else if (rule && typeof rule === 'object') {
      hit = Object.keys(rule).every(k => data[k] === rule[k])
    }
    if (hit) {
      return matched.data !== undefined ? matched.data : matched
    }
    if (matched._else !== undefined) return matched._else
    return null
  }

  const executor = (cfg) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(resolveByUrl(cfg || {}))
        } catch (e) {
          reject(e)
        }
      }, DEFAULT_DELAY)
    })
  }

  const inst = executor
  inst.request = executor
  inst.get = (url, config = {}) => executor({ url, method: 'get', ...config })
  inst.post = (url, data, config = {}) => executor({ url, method: 'post', data, ...config })
  inst.put = (url, data, config = {}) => executor({ url, method: 'put', data, ...config })
  inst.delete = (url, config = {}) => executor({ url, method: 'delete', ...config })
  inst.interceptors = { request: { use: () => {} }, response: { use: () => {} } }
  return inst
}

/**
 * 启用 mock：在 Vue.use(scpcwPcPlugin) 之后调用，
 * 覆盖 Vue.prototype.$hdAxios 与 window.$hdAxios，
 * 让所有 this.$hdAxios.request(...) 调用走 mock。
 */
export function enableMock () {
  const mockInstance = createMockHdAxios()
  Vue.prototype.$hdAxios = mockInstance
  if (typeof window !== 'undefined') {
    window.$hdAxios = mockInstance
  }
}

export default mocks