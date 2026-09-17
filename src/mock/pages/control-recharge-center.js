// control/recharge-center 充值中心
export default {
  '/api/ac/shenbeigpuai/rechargeOrderService/createRechargeOrder': {
    id: '642c774a5b0d4523bbd061226d68cf38',
    companyCode: 'default',
    userId: null,
    orderNo: 'RE21004667081281290243SRUBR',
    orderType: 'recharge',
    orderSource: 'console',
    amount: 100,
    paymentMethod: 'wechat',
    paymentStatus: 'pending',
    paidAmount: 0,
    qrCode: 'weixin://wxpay/bizpayurl?pr=5QQN6tdBGvdGT81X',
    status: 'pending',
    _user: {
      id: 'd98174a8045f4491b941d2e2d4741fae',
      no: null,
      name: '16602410013',
      loginName: '16602410013',
      userType: '0',
      mobile: '16602410013',
      phone: '16602410013',
      email: null,
      company_id: 'c264abd82c4948e3b72d7dbf4037ae40',
      company_code: 'LA00002',
      company_name: '用户控制台',
      company_type: '1',
      company_grade: '2',
      company_sys_area: 'LA',
      parent_id: '65c788d15f0f41fdb9ac8a61874e1984',
      parent_ids: '0,65c788d15f0f41fdb9ac8a61874e1984,',
      parent_code: 'LA00001',
      bind_seller_login_code: '16602410013',
      bind_seller_sys_area: 'LA',
      bind_seller_company_code: 'LA00002'
    },
    paymentId: 'a351f2291b484f1da521069e8f51c3aa',
    orderId: '',
    transactionId: '',
    transactionNo: '',
    balance: null,
    payType: null,
    usedBalance: null,
    unpaidAmount: null,
    needRepaidAmount: null,
    useBalanceAmount: null,
    useThirdAmount: null
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/getPaymentStatus': {
    status: 'PENDING'
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/mockPaymentSuccess': { success: true }

  // '/api/ac/shenbeigpuai/userAccountService/getBalance': {
  //   balance: '0.00'
  // }
}
