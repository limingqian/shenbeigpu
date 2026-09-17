// control/instance-buy 实例购买
export default {
  '/api/ac/shenbeigpuai/orderService/getOrderInstanceInit': {},

  '/api/ac/shenbeigpuai/productCategoryService/listTopCategory': [],

  '/api/ac/shenbeigpuai/productSkuService/listGpuPurchaseSku': [],

  '/api/ac/shenbeigpuai/productSkuService/calculatePrice': {
    price: '0.00'
  },

  '/api/ac/shenbeigpuai/productSkuService/getSkuBillingCapability': {},

  '/api/ac/shenbeigpuai/regionService/listRegionTree': [
    {
      id: '192baf85-0e5b-43d1-904f-51bf8c8a8c4d',
      regionCode: '210100',
      regionName: '沈阳',
      parentId: '',
      regionLevel: 2,
      description: '1',
      sortOrder: 1,
      isEnabled: '1',
      children: null,
      ids: '192baf85-0e5b-43d1-904f-51bf8c8a8c4d',
      resourcePools: [
        {
          id: '1539e648-6fb6-49b3-8d7d-eca609fc0132',
          poolName: '沈阳资源池01'
        },
        {
          id: '2eab67f3-166a-453f-8665-671222550307',
          poolName: '裸金属'
        }
      ]
    }
  ],

  '/api/ac/shenbeigpuai/valueAddedProductService/listDataDiskByRegion': [],

  '/api/ac/shenbeigpuai/vnetService/listVNet': [],

  '/api/ac/shenbeigpuai/vnetSubnetService/listSubnet': [],

  '/api/ac/shenbeigpuai/mirrorService/listMirrorPage': {
    rows: [],
    total: 0
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

  '/api/ac/shenbeigpuai/userAccountService/getBalance': {
    id: 'd9c8c186630147a3bb5e3d3dfc78df01',
    companyCode: 'C00002',
    userId: 'd98174a8045f4491b941d2e2d4741fae',
    balance: '4672.72',
    frozenBalance: '920.43',
    totalRecharge: null,
    totalConsume: null,
    totalRefund: null,
    status: 'normal',
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    delFlag: null,
    paymentAmount: null,
    rollbackAmount: null,
    _user: null
  },

  '/api/ac/shenbeigpuai/userAuthService/updatePayPassword': { success: true },

  // 字典接口：根据请求 data.type 返回不同字典
  '/api/as/sc/dict/getDictInfoList': cfg => {
    const type = (cfg && cfg.data && cfg.data.type) || ''
    // 下单后弹框开关：value=1 开启，未配置视为关闭
    if (type === 'order_post_modal_switch') {
      return [
        {
          label: '开启或关闭',
          type: 'order_post_modal_switch',
          value: '1'
        }
      ]
    }
    // 产品类型字典（poolType 转换用）
    if (type === 'product_type') {
      return [
        {
          label: '计算',
          type: 'product_type',
          value: 'compute'
        },
        {
          label: '存储',
          type: 'product_type',
          value: 'storage'
        },
        {
          label: '网络',
          type: 'product_type',
          value: 'network'
        },
        {
          label: '混合',
          type: 'product_type',
          value: 'mixed'
        }
      ]
    }
    return []
  }
}
