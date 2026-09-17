// control/recharge-center 充值中心
export default {
  '/api/ac/shenbeigpuai/rechargeOrderService/createRechargeOrder': {
    orderId: 'mock-recharge-id'
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/getPaymentStatus': {
    status: 'PENDING'
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/mockPaymentSuccess': { success: true },

  '/api/ac/shenbeigpuai/userAccountService/getBalance': {
    balance: '0.00'
  }
}