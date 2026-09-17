// control/account-management 账号管理
export default {
  '/api/ac/sc/systemUserService/updatePwd': { success: true },

  '/api/ac/shenbeigpuai/userAuthService/updateUserPhoto': { success: true },

  '/api/ac/shenbeigpuai/userAuthService/updatePayPassword': { success: true },

  '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/listPayAsYouGoUserApiKey': {
    rows: [],
    total: 0
  },

  '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/createPayAsYouGoUserApiKey': {
    id: 'mock-id',
    accessKey: 'mock-ak'
  },

  '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/updatePayAsYouGoUserApiKey': { success: true },

  '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/deletePayAsYouGoUserApiKey': { success: true },

  '/api/ac/shenbeigpuai/wechatAuthService/getQrCode': {
    qrCode: '',
    ticket: 'mock-ticket'
  },

  '/api/ac/shenbeigpuai/wechatAuthService/getBindStatus': {
    bind: false
  },

  '/api/ac/shenbeigpuai/wechatAuthService/callback': { success: true }
}