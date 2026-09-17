// control/token-plan-list 我的套餐
export default {
  '/api/ac/shenbeigpuai/tokenPlanService/getCurrentPlan': {
    id: '78ed934a-df2a-428b-86c2-787f414c28ed',
    tokenplanOrderNo: 'TP20950496366571765763MHI73',
    tokenplanId: 'c44a9f79-aaeb-4e4f-b7b2-babf87a38f61',
    tokenplanOrderType: 'upgrade',
    paidAmount: 101.3,
    effectiveTime: '2026-09-02 15:47:55',
    expirationTime: '2026-10-02 15:47:55',
    effectiveDays: 30,
    dailyPrice: 4.63,
    tokenplanStatus: '0',
    remainingDays: 15,
    planName: '专业版—月付',
    planDesc: '',
    tokenplanLevel: 'professional',
    tokenplanBillingCycle: 'monthly',
    tokenplanPrice: 139.0,
    rateMultiplier: 1.0,
    status: 'active',
    quota: {
      activeCount: 1,
      r7dUsed: 299.0,
      monthlyUsed: 299.0,
      r5hUsed: 32.0,
      usedTotalUsd: 299.0,
      r7dLimit: 3200.0,
      monthlyLimit: 12000.0,
      r5hLimit: 1000.0
    }
  },

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

  '/api/ac/shenbeigpuai/userApiKeyPackageService/listPackageUserApiKey': [
    {
      del_flag: '0',
      is_package: '1',
      create_time: '2026-09-11 13:55:32',
      description: '',
      key_name: 'testlmq',
      is_enabled: '1',
      create_by: 'd98174a8045f4491b941d2e2d4741fae',
      update_time: '2026-09-11 13:55:32',
      user_id: 'd98174a8045f4491b941d2e2d4741fae',
      api_key: 'sk-04ab518215990459f6f3946cbf2f42267cb88772c965735e4fc277aaededa924',
      permissions: '',
      company_code: 'LA00002',
      id: '194',
      update_by: 'd98174a8045f4491b941d2e2d4741fae'
    }
  ],

  '/api/ac/shenbeigpuai/userApiKeyPackageService/createPackageUserApiKey': {
    id: 'mock-id',
    accessKey: 'mock-ak'
  },

  '/api/ac/shenbeigpuai/userApiKeyPackageService/updatePackageUserApiKey': { success: true },

  '/api/ac/shenbeigpuai/userApiKeyPackageService/deletePackageUserApiKey': { success: true },

  // '/api/ac/shenbeigpuai/userAccountService/getBalance': {
  //   balance: '0.00'
  // },

  '/api/ac/shenbeigpuai/userAuthService/updatePayPassword': { success: true }
}
