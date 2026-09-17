// control/token-plan-list 我的套餐
export default {
  '/api/ac/shenbeigpuai/tokenPlanService/getCurrentPlan': {},

  '/api/ac/shenbeigpuai/tokenPlanService/getTokenPlanPrice': {
    price: '0.00'
  },

  '/api/ac/shenbeigpuai/tokenPlanService/myListSub2ApiGroupPage': {
    rows: [],
    total: 0
  },

  '/api/ac/shenbeigpuai/tokenPlanService/getTokenPlanOrderInfo': {},

  '/api/ac/shenbeigpuai/tokenPlanService/createTokenPlanOrder': {
    orderId: 'mock-plan-order'
  },

  '/api/ac/shenbeigpuai/userApiKeyPackageService/listPackageUserApiKey': {
    rows: [],
    total: 0
  },

  '/api/ac/shenbeigpuai/userApiKeyPackageService/createPackageUserApiKey': {
    id: 'mock-id',
    accessKey: 'mock-ak'
  },

  '/api/ac/shenbeigpuai/userApiKeyPackageService/updatePackageUserApiKey': { success: true },

  '/api/ac/shenbeigpuai/userApiKeyPackageService/deletePackageUserApiKey': { success: true },

  '/api/ac/shenbeigpuai/userAccountService/getBalance': {
    balance: '0.00'
  },

  '/api/ac/shenbeigpuai/userAuthService/updatePayPassword': { success: true }
}