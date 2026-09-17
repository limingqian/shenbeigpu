// portal/gpu GPU 列表页 mock
// 公共页脚（portalFooterService/getActiveFooter）已移至 shared.js
export default {
  '/api/ac/shenbeigpuai/productSkuService/listGpuPurchaseSku': [],

  '/api/ac/shenbeigpuai/valueAddedProductService/listDataDiskByRegion': [],

  // '/api/ac/shenbeigpuai/vnetService/listVNet': [],

  '/api/ac/shenbeigpuai/vnetSubnetService/listSubnet': [],

  // '/api/ac/shenbeigpuai/mirrorService/listMirrorPage': {
  //   rows: [],
  //   total: 0
  // },

  '/api/ac/shenbeigpuai/productSkuService/calculatePrice': {
    price: '0.00'
  },

  '/api/ac/shenbeigpuai/resourceAllocationService/findAvailablePhysicalMachine': [],

  '/api/ac/shenbeigpuai/orderService/addOrder': {
    orderId: 'mock-order-id'
  },

  '/api/ac/shenbeigpuai/orderService/getOrderPaymentStatus': {
    status: 'PENDING'
  },

  '/api/ac/shenbeigpuai/rechargeOrderService/createTestOrderQrCode': {
    qrCode: '',
    orderId: 'mock-order-id'
  },

  '/api/ac/shenbeigpuai/instanceService/createInstance': {
    instanceId: 'mock-instance-id'
  },

  '/api/ac/shenbeigpuai/userAuthService/updatePayPassword': { success: true },

  '/api/as/sc/dict/getDictInfoList': []
}