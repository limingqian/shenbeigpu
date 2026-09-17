// control/switch 交换机列表
export default {
  // '/api/ac/shenbeigpuai/vnetService/listVNet': {
  //   rows: [],
  //   total: 0
  // },

  '/api/ac/shenbeigpuai/vnetSubnetService/listSubnet': [
    {
      _user: null,
      id: '1f3b3f2ac2334e7eb5b8e3fcf81584e5',
      companyCode: 'test',
      vnetId: '19923fb1755b428090ac5294d3b7a59e',
      subnetName: '交换机1',
      subnetCode: 'SUBNET-01DF8267',
      cidr: '192.168.12.0/24',
      gateway: '192.168.12.1',
      dnsPrimary: null,
      dnsSecondary: null,
      totalIps: 256,
      usedIps: 0,
      availableIps: 254,
      vlanId: null,
      status: 'active',
      description: '',
      isEnabled: '1',
      isDefault: '0',
      sortOrder: 0,
      createTime: '2026-07-23 10:39:32',
      updateTime: '2026-07-23 10:39:32',
      createBy: 'd98174a8045f4491b941d2e2d4741fae',
      updateBy: 'd98174a8045f4491b941d2e2d4741fae',
      delFlag: '0'
    }
  ],

  '/api/ac/shenbeigpuai/vnetSubnetService/listCidrByVnetId': [],

  '/api/ac/shenbeigpuai/vnetSubnetService/deleteSubnet': { success: true },

  '/api/ac/shenbeigpuai/switchService/configPorts': { success: true }
}
