// control/order-list 订单列表
export default {
  '/api/ac/shenbeigpuai/orderService/listOrder': {
    rows: [],
    total: 0
  },

  '/api/ac/shenbeigpuai/orderService/getOrderInstanceInit': {},

  '/api/ac/shenbeigpuai/orderService/getOrderInstanceParams': {},

  '/api/ac/shenbeigpuai/orderService/getOrderInstanceDetail': {},

  '/api/ac/shenbeigpuai/orderService/getOrderPaymentStatus': {
    status: 'PENDING'
  },

  '/api/ac/shenbeigpuai/orderService/updateConfirmOrderPayment': { success: true },

  '/api/ac/shenbeigpuai/orderService/deleteOrder': { success: true },

  '/api/ac/shenbeigpuai/orderService/addOrder': {
    orderId: 'mock-order-id'
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/createRechargeOrder': {
    orderId: 'mock-recharge-id'
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/createTestOrderQrCode': {
    qrCode: '',
    orderId: 'mock-order-id'
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/getPaymentStatus': {
    status: 'PENDING'
  },

  '/api/ac/shenbeigpuai/resourceAllocationService/findAvailablePhysicalMachine': [],

  '/api/ac/shenbeigpuai/tokenPlanService/getPayOrderQrCode': {
    qrCode: ''
  },

  '/api/ac/shenbeigpuai/tokenPlanService/getTokenPlanOrderInfo': {},

  '/api/ac/shenbeigpuai/tokenPlanService/createCancelTokenPlanOrder': {
    orderId: 'mock-cancel-id'
  },

  '/api/ac/shenbeigpuai/tokenPlanService/myTokenPlanOrderList': {
    rows: [],
    total: 0
  },

  '/api/ac/shenbeigpuai/instanceService/createInstance': {
    instanceId: 'mock-instance-id'
  },

  '/api/as/sc/dict/getDictInfoList': []
}