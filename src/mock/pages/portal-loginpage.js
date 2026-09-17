// portal/loginpage 登录
// 公共页脚（portalFooterService/getActiveFooter）已移至 shared.js
export default {
  '/api/ac/shenbeigpuai/portalBrandService/getBrandInfo': {
    logoUrl: '',
    title: '',
    subtitle: ''
  },

  '/api/ac/shenbeigpuai/smsVerifyCodeService/sendVerifyCode': { success: true },

  '/api/uc/sc/loginService/userLogin_encrypt': {
    token: 'mock-token',
    userInfo: {}
  },

  '/api/uc/sc/passwordLoginService/userLogin_password': {
    token: 'mock-token',
    userInfo: {}
  },

  '/api/uc/sc/smsLoginService/userLogin_sms': {
    errcode: 0,
    errmsg: '登录成功！',
    logincount: 3,
    key: '308de971adca4dccaa70688255373855'
  }
}
