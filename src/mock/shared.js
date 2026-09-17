// ============================================================
// 跨页面共享的 mock 接口（用户信息、字典、登出等）
// 在多个页面 vue 中重复出现，集中维护
//
// 约定：每个 URL 对应的值就是真实接口的 data 字段内容，
//      包装层会自动补成 { errcode: 0, data: ..., errmsg: 'success' }
// ============================================================

const shared = {
  // 用户信息（sysframe / loginpage / my-appointment 等使用）
  '/api/ac/sc/systemUserService/info': {
    company_phone: '',
    company_type: '1',
    bind_seller_sys_area: 'LA',
    company_id: 'c264abd82c4948e3b72d7dbf4037ae40',
    company_grade: '2',
    bind_seller_company_code: 'LA00002',
    mobile: '13022408271',
    desenPhone: '13022408271',
    parent_ids: '0,65c788d15f0f41fdb9ac8a61874e1984,',
    office_childs_code: '',
    phone: '13022408271',
    parent_id: '65c788d15f0f41fdb9ac8a61874e1984',
    company_name: '用户控制台',
    loginName: '13022408271',
    name: '13022408271',
    parent_code: 'LA00001',
    company_code: 'LA00002',
    id: 'd98174a8045f4491b941d2e2d4741fae',
    userType: '0',
    company_sys_area: 'LA',
    desenMobile: '13022408271',
    bind_seller_login_code: '13022408271',
    initPass: 0
  },

  // 退出登录
  '/api/ac/sc/loginService/userLogOut': { success: true },

  // 公共页脚（所有 portal / control 页面通用）
  '/api/ac/shenbeigpuai/portalFooterService/getActiveFooter': {
    id: '615657ebc6e647a7a63951f53ab5e5fd',
    companyCode: 'LA00001',
    helpLinks: '[]',
    companyInfo:
      '某基信息技术以沈阳为战略支点，构建起 “立足沈阳、辐射辽宁、面向全国” 的发展格局，依托自有研发平台和快速响应的实施能力，为发改委、教育、科技、公安、民政、财政、人社、交通、营商、纪检监察等超 70 家委办局机构提供综合解决方案，形成了覆盖数字政务、城市感知、数据治理、行权监督、惠民服务、视频 AI、智慧运维的完备数智城市综合解决方案体系，业务版图已成功覆盖超 20 个地市 / 区县；公司凭借前瞻性战略布局与卓越的执行力实现跨越式转型发展，聚焦业务细分板块，形成专业领域子公司、区域子公司、合资公司三种发展模式，先后成立某基技术研发、某基商用机器、某基运维服务、某基大数据安全、某基鑫坤达建筑工程、某基智算、某基智创等专业子公司和某基（厦门）、某基（吉林）、某基（山东）、某基（大连）等区域子公司，构建起多元子公司协同矩阵；同时，基于现有市场根基，公司积极整合本地服务商资源，通过标准化合作规范与创新利益共享机制，将分散的服务力量凝聚成高效协同的产业集群，实现从单点合作到深度战略绑定的升级。',
    copyrightInfo: '版权所有©某基信息技术集团股份有限公司 Powered by CloudDream  辽ICP备66666号-1',
    companyName: '某基信息技术集团股份有限公司',
    companyNameEn: 'MOUJI INFORMATION TECHNOLOGY',
    companyLogo: 'https://cloudstor.tripln.top/TEST:xinjioss/house/wl/87f0b4993ab9d3f7de54d8a25d5cba8c.png',
    contactPhone: '024-66666',
    contactEmail: 'admin@666.com',
    contactAddress: '辽宁省沈阳市浑南区',
    businessHours: '',
    headerLogo: 'https://cloudstor.tripln.top/TEST:xinjioss/house/wl/87f0b4993ab9d3f7de54d8a25d5cba8c.png',
    headerTitle: '某基云池',
    headerSubtitle: '算力租赁云平台',
    loginLogo: 'https://cloudstor.tripln.top/TEST:xinjioss/house/wl/87f0b4993ab9d3f7de54d8a25d5cba8c.png',
    loginTitle: '某基云池',
    loginSubtitle: '算力租赁云平台',
    loginNameEn: 'XINJIYUNCHISUANLIZULINYUNPINGTAI',
    createTime: '2026-07-02 10:45:02',
    updateTime: '2026-08-06 13:23:09',
    createBy: 'a262143ed32a445f9941bad1d295ed85',
    updateBy: 'a262143ed32a445f9941bad1d295ed85',
    delFlag: '0',
    _user: null
  },

  // 用户认证信息（多个页面用）
  '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth': {
    id: 'c2e07493f8524cb0b05b56ea2ef7f59e',
    companyCode: 'C00002',
    userId: 'd98174a8045f4491b941d2e2d4741fae',
    userType: 'PERSONAL',
    enterpriseType: null,
    authStatus: 'PASSED',
    currentRecordId: '059964cca4834c8cab3b28ca77304c6c',
    realName: null,
    idCard: null,
    idCardFront: null,
    idCardBack: null,
    wxOpenid: null,
    wxUnionid: null,
    wxNickname: null,
    wxAvatar: null,
    wxBindTime: null,
    wxBindStatus: '0',
    expireWarningEnabled: '1',
    balanceWarningEnabled: '1',
    createTime: '2026-07-01 14:24:33.0',
    updateTime: '2026-07-02 09:52:55.0',
    createBy: 'sys',
    updateBy: 'a262143ed32a445f9941bad1d295ed85',
    delFlag: '0',
    accountBalance: '4683.64',
    frozenBalance: '920.43',
    payPassword: '10d4049bcf84716033e1ad946e7d4fb596bfb2b192ad2e37268e4adc',
    payPasswordSet: true,
    mobile: '13022408271',
    photo: '',
    loginName: '13022408271',
    _user: null
  }
}

export default shared
