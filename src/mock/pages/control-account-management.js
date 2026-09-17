// control/account-management 账号管理
export default {
  '/api/ac/sc/systemUserService/updatePwd': { success: true },

  '/api/ac/shenbeigpuai/userAuthService/updateUserPhoto': { success: true },

  '/api/ac/shenbeigpuai/userAuthService/updatePayPassword': { success: true },

  '/api/ac/shenbeigpuai/userApiKeyPayAsYouGoService/listPayAsYouGoUserApiKey': [
    {
      del_flag: '0',
      is_package: '0',
      create_time: '2026-08-28 12:13:01',
      description: '',
      key_name: '333',
      is_enabled: '1',
      create_by: 'd98174a8045f4491b941d2e2d4741fae',
      update_time: '2026-08-28 12:13:01',
      balance: 4671.16,
      user_id: 'd98174a8045f4491b941d2e2d4741fae',
      api_key: 'sk-ffc676b4c0fce4054e934238829eb83c83ba312cef339be8f12ef16b573bc141',
      permissions: '',
      company_code: 'LA00002',
      id: '162',
      update_by: 'd98174a8045f4491b941d2e2d4741fae'
    }
  ],

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
