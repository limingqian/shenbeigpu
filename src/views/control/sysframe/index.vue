<template>
  <div style="height:100%">
    <div
      style="margin: 0 auto;background-color:#fff;height:70px;width:96%;display:flex;justify-content:space-between;align-items:center;">
      <div class="portal-header__brand" @click="goPortalHome">
        <sp-image class="portal-header__brand-icon" scp-type="图片" style="" :src="headerLogo"></sp-image>
        <div class="portal-header__title">{{ headerTitle }}<br>{{ headerSubtitle }}</div>
      </div>
      <i-button type="text" icon="ios-home" size="small" style="margin-left: 50px;background-color: #F6F8F9;"
        @click="goHome">首页</i-button>
      <div style="flex: 1;max-width: 400px;margin: 0 20px 0 auto;">
      </div>
      <div style="display: flex;align-items: center;">
        <div style="display: flex;align-items: center;border-right: 1px solid #e6e6e6;padding-right: 20px;">
          <span type="text" style="margin-right: 16px;cursor: pointer;" @click="goRecharge">充值</span><span type="text"
            style="margin-right: 16px;cursor: pointer;" @click="goWorkorder">工单</span>
        </div>
        <Dropdown style="margin-left: 20px;">
          <div style="display: flex;align-items: center;cursor: pointer;">
            <sp-image v-if="userPhoto" :src="userPhoto"
              style="border-radius:50%;margin-right:8px;height:24px;width:24px;overflow:hidden;"
              alt="avatar"></sp-image>
            <svg v-else style="border-radius:50%;margin-right:8px;height:24px;width:24px;" data-v-39b29ed8=""
              t="1739343491281" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8201"
              width="66" height="66" class="icon">
              <path data-v-39b29ed8=""
                d="M9.67111111 511.73831111c0 277.34471111 224.98417778 502.32888889 502.32888889 502.32888889s502.32888889-224.98417778 502.32888889-502.32888889S789.34471111 9.40942222 512 9.40942222 9.67111111 234.38222222 9.67111111 511.73831111z"
                fill="#D7E3F8" p-id="8202"></path>
              <path data-v-39b29ed8=""
                d="M436.31502222 648.07822222h157.5936v130.11626667H435.79164445l0.52337777-130.11626667zM336.25884445 473.89582222c0 23.1424-13.99466667 41.89297778-31.61884445 41.89297778S273.06666667 497.03822222 273.06666667 473.89582222s13.99466667-41.8816 31.61884444-41.8816 31.61884445 18.75057778 31.61884444 41.8816M757.76 473.31555555c0 23.13102222-14.00604445 41.8816-31.63022222 41.8816S694.4768 496.41244445 694.4768 473.31555555s13.99466667-41.89297778 31.61884445-41.89297777S757.76 450.7648 757.76 473.31555555"
                fill="#FFFFFF" p-id="8203"></path>
              <path data-v-39b29ed8=""
                d="M436.31502222 666.73777778s30.07146667 15.55342222 73.09084445 15.55342222c50.80177778 2.08213333 83.97937778-15.03004445 83.97937778-15.03004445v15.55342223s-55.97866667 30.06008889-80.86186667 30.06008889c-25.40657778 0-76.23111111-35.27111111-76.23111111-35.27111112z"
                fill="#D7E3F8" p-id="8204"></path>
              <path data-v-39b29ed8=""
                d="M878.50097778 854.91484445c-25.3952-20.21831111-70.76977778-77.36888889-118.46542223-100.19271112-77.24373333-37.84248889-166.65031111-26.80604445-166.6503111-26.80604444V730.45333333c-6.22364445 6.74702222-36.80711111 36.80711111-78.27911112 36.80711112-40.96 0-72.05546667-27.98933333-78.79111111-35.27111112l-0.52337777-3.62951111s-98.62257778-11.54844445-176.35555556 26.29404445c-52.87253333 25.92995555-90.58986667 82.56853333-113.40231111 102.26346666a498.34666667 498.34666667 0 0 0 365.44284444 157.67324445c145.15768889-0.52337778 275.78595555-61.69031111 367.02435556-159.67573333z m0 0"
                fill="#739DE6" p-id="8205"></path>
              <path data-v-39b29ed8=""
                d="M720.91875555 439.79662222c0 53.62346667-16.22471111 126.29333333-43.4631111 165.55804445-37.54666667 54.11271111-122.22008889 79.12106667-161.82613334 79.12106666-40.0384 0-116.224-20.40035555-153.81617778-68.26666666-32.03982222-40.81208889-51.47306667-117.72586667-51.47306666-176.35555556 0-127.52213333 91.76177778-231.20782222 205.28924444-231.20782222s205.28924445 103.68568889 205.28924444 231.20782222"
                fill="#FFFFFF" p-id="8206"></path>
              <path data-v-39b29ed8=""
                d="M739.06631111 333.9264S737.28 254.09991111 691.76888889 197.21102222c-31.78951111-39.7312-133.12-68.57386667-205.68746667-62.86222222 0 0-142.14257778 5.68888889-145.1008 100.12444445-25.97546667 15.55342222-52.66773333 42.38222222-55.52355555 87.47235555-5.68888889 90.7264 10.36515555 114.57422222 10.36515555 114.57422222s22.81244445 0 28.52408889 34.2016c0 0 10.36515555 6.23502222 11.37777778 0 1.54737778-10.36515555-9.32977778-60.13155555 12.43591111-105.74506667 2.68515555-5.76853333 5.37031111-10.91128889 7.96444445-15.49653333 71.2704-79.28035555 280.31431111-71.0656 329.29564444 15.62168889a104.35697778 104.35697778 0 0 1 4.33493333 18.5344c4.14151111 29.58222222 9.32977778 85.53813333 9.32977778 85.53813334s7.77102222 5.17688889 12.95928889-7.25902223c5.18826667-12.95928889 4.15288889-25.3952 8.81777778-29.02471111 26.48746667-17.60142222 19.75182222-91.18151111 18.20444444-98.96391111z"
                fill="#9BB9ED" p-id="8207"></path>
            </svg>


            <span style="font-size: 14px;color: #333;">{{ userInfo.loginName ||
              '用户' }}</span>
            <Icon name="ios-arrow-down" style="margin-left: 4px;font-size: 12px;color: #666;">
            </Icon>
          </div>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="goAccountManagement">账号管理</DropdownItem>
            <DropdownItem @click.native="confirmLogout">退出登录</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
    <div style="height: calc(100%); width: 100%; display: flex; border-top: 1px solid #e6e6e6;">
      <div
        style="width: 200px;height: 90vh;background-color: #fff;border-right: 1px solid #e6e6e6;overflow-y: auto;overflow-x: hidden;">
        <Menu theme="light" :active-name="activeMenu" @on-select="handleMenuSelect">
          <MenuGroup style="border-bottom: 1px solid #E8EBF0;;" v-for="group in menuTreeData" :key="group.id"
            :title="group.name">
            <MenuItem v-for="child in group.children" :key="child.id" :name="child.path">

              {{ child.name }}
            </MenuItem>
          </MenuGroup>
        </Menu>
      </div>
      <div style="flex: 1;overflow: scroll;"><router-view></router-view></div>
    </div>
  </div>
</template>
<script>
export default {
  components: {}, props: {}, name: "scp-shenbeigpuai-control-sysframe", data () {
    return {
      "activeMenu": "", "userPhoto": "",
      // 顶部品牌信息（logo / 大标题 / 小标题），默认取自静态资源，mounted 会从接口覆盖
      "headerLogo": "@/assets/file/shenbeigpuai/image/logox.png",
      "headerTitle": "某基云池",
      "headerSubtitle": "算力租赁云平台",
      // { "path": "", "parent_id": "0", "name": "模型", "permission": "", "path_icon": "", "id": "menu-2", "sort": 2, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, 
      "menuDataSource": [{ "path": "/shenbeigpuai/control/instance-list", "parent_id": "0", "name": "实例", "permission": "", "path_icon": "", "id": "menu-1", "sort": 1, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "/shenbeigpuai/control/instance-list", "parent_id": "menu-1", "name": "实例列表", "permission": "", "path_icon": "", "id": "menu-1-1", "sort": 1, "parent_ids": "0,menu-1,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "/shenbeigpuai/control/instance-buy", "parent_id": "menu-1", "name": "实例购买", "permission": "", "path_icon": "", "id": "menu-1-2", "sort": 2, "parent_ids": "0,menu-1,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "/shenbeigpuai/control/token-plan-list", "parent_id": "0", "name": "模型广场", "permission": "", "path_icon": "", "id": "menu-10", "sort": 1, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "/shenbeigpuai/control/token-plan-list", "parent_id": "menu-10", "name": "我的套餐", "permission": "", "path_icon": "", "id": "menu-10-1", "sort": 1, "parent_ids": "0,menu-10,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      // { "path": "/shenbeigpuai/control/token-plan-buy", "parent_id": "menu-10", "name": "购买", "permission": "", "path_icon": "", "id": "menu-10-2", "sort": 2, "parent_ids": "0,menu-10,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "", "parent_id": "0", "name": "镜像", "permission": "", "path_icon": "", "id": "menu-8", "sort": 1, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/mirror-management", "parent_id": "menu-8", "name": "镜像管理", "permission": "", "path_icon": "", "id": "menu-1-1", "sort": 1, "parent_ids": "0,menu-8,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      // { "path": "/shenbeigpuai/control/api-list", "parent_id": "menu-10", "name": "模型广场", "permission": "", "path_icon": "", "id": "menu-10-3", "sort": 3, "parent_ids": "0,menu-10,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "/shenbeigpuai/control/api-buy", "parent_id": "menu-10", "name": "使用记录", "permission": "", "path_icon": "", "id": "menu-10-4", "sort": 4, "parent_ids": "0,menu-10,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "", "parent_id": "0", "name": "网络", "permission": "", "path_icon": "", "id": "menu-2-5", "sort": 3, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/network", "parent_id": "menu-2-5", "name": "专有网络", "permission": "", "path_icon": "", "id": "menu-2-5-1", "sort": 1, "parent_ids": "0,menu-2-5,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/switch", "parent_id": "menu-2-5", "name": "交换机", "permission": "", "path_icon": "", "id": "menu-2-5-2", "sort": 2, "parent_ids": "0,menu-2-5,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "", "parent_id": "0", "name": "订单管理", "permission": "", "path_icon": "", "id": "menu-3", "sort": 4, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/order-list", "parent_id": "menu-3", "name": "我的订单", "permission": "", "path_icon": "", "id": "menu-3-1", "sort": 1, "parent_ids": "0,menu-3,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/transaction-details", "parent_id": "menu-3", "name": "交易明细", "permission": "", "path_icon": "", "id": "menu-3-3", "sort": 3, "parent_ids": "0,menu-3,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "", "parent_id": "0", "name": "账单", "permission": "", "path_icon": "", "id": "menu-9", "sort": 5, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/bill-overview", "parent_id": "menu-9", "name": "账单概览", "permission": "", "path_icon": "", "id": "menu-9-1", "sort": 1, "parent_ids": "0,menu-9,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/bill-detail", "parent_id": "menu-9", "name": "账单详情", "permission": "", "path_icon": "", "id": "menu-9-2", "sort": 2, "parent_ids": "0,menu-9,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "", "parent_id": "0", "name": "充值中心", "permission": "", "path_icon": "", "id": "menu-4", "sort": 5, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/recharge-center", "parent_id": "menu-4", "name": "充值中心", "permission": "", "path_icon": "", "id": "menu-4-1", "sort": 1, "parent_ids": "0,menu-4,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "", "parent_id": "0", "name": "账号管理", "permission": "", "path_icon": "", "id": "menu-6", "sort": 6, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "/shenbeigpuai/control/account-management", "parent_id": "menu-6", "name": "账号管理", "permission": "", "path_icon": "", "id": "menu-6-1", "sort": 1, "parent_ids": "0,menu-6,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }, { "path": "", "parent_id": "0", "name": "帮助中心", "permission": "", "path_icon": "", "id": "menu-7", "sort": 7, "parent_ids": "0,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "/shenbeigpuai/control/platform-intro", "parent_id": "menu-7", "name": "工单提交", "permission": "", "path_icon": "", "id": "menu-7-1", "sort": 1, "parent_ids": "0,menu-7,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" },
      { "path": "/shenbeigpuai/control/ticket-list", "parent_id": "menu-7", "name": "工单列表", "permission": "", "path_icon": "", "id": "menu-7-2", "sort": 2, "parent_ids": "0,menu-7,", "type": "1", "btn_permission": "", "is_show": "1", "target": "_self" }]
    }
  }, computed: {
    menuTreeData () {
      return this.buildMenuTree(this.menuDataSource);
    }, userInfo () {
      // 依赖 this.vuexStr（data 里的响应式字段），
      // 这样在 mounted 里赋值 this.vuexStr 后能触发 userInfo 重新计算。
      try {
        const vuex = this.vuexStr || sessionStorage.getItem('vuex');
        if (vuex) {
          const userData = JSON.parse(vuex);
          const raw = (userData && userData.user && userData.user.severUserInfo && userData.user.severUserInfo.data) || {};
          // 后端 info 接口返回的用户名字段不固定（loginName / name / userName / nickname / realName / account ...），
          // 依次兜底，匹配到的第一个非空值作为显示名
          const displayName = raw.loginName || raw.name || raw.userName || raw.nickname || raw.realName || raw.account || raw.user_name || '';
          return { ...raw, loginName: displayName };
        }
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
      return {};
    },
  }, watch: {
    '$route' (to) {
      this.activeMenu = to.path
    },
    // 监听 vuexStr 变化，强制重算 userInfo 并刷新视图
    vuexStr (val) {
      console.log('[sysframe] watch vuexStr 变化, len=', val && val.length, 'userInfo=', this.userInfo)
      this.$forceUpdate()
    }
  }, created () {
    // 监听头像更新事件
    this.$root.$on('refreshUserPhoto', this.loadUserInfo);
  }, beforeMount () { },
  async mounted () {
    this.activeMenu = this.$route.path
    // 加载顶部品牌信息（logo / 大小标题），失败时保留 data 中的默认值
    this.fetchActiveHeader()
    // TODO 调用获取菜单接口，未登录跳转到登录页
    // 需要判断是否登录
    let a = window.sessionStorage.getItem('vuex')
    if (sessionStorage.length > 0 && sessionStorage.vuex) {
      console.log('已登录')
      // 把 sessionStorage.vuex 同步到 data 里的 vuexStr，让 userInfo 这个 computed 走响应式
      this.vuexStr = sessionStorage.vuex
      this.loadUserInfo()
    } else {
      // sessionStorage 里没有 vuex（可能是刷新或 cookie 登录态还在），
      // 先用当前 cookie 调一次 systemUserService/info 拿登录信息；
      // 拿到则视为已登录（走 loadUserInfo），拿不到再调退出登录。
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/sc/systemUserService/info',
          method: 'get'
        });
        if (res && (res.errcode === 0 || res.errcode === undefined) && res.data) {
          console.log('cookie 仍有效，已登录')
          // 参考 portal/loginpage/index.vue 的 fetchAndStoreUserInfo：
          // 把用户信息写回 sessionStorage.vuex（与 sp-login-button 的 vuex 结构保持一致，
          // 供其它组件通过 userData.user.severUserInfo.data 读取），同时填充 window.userInfo
          const vuex = {
            user: {
              severUserInfo: res
            }
          }
          if (typeof window !== 'undefined') {
            if (!window.userInfo) {
              window.userInfo = {
                data: {
                  id: '', name: '', phone: '', loginName: '',
                  company_name: '', company_code: '', company_id: '',
                  company_grade: '', parent_id: '', parent_ids: ''
                }
              }
            }
            const data = (res && res.data) || {}
            for (const k in window.userInfo.data) {
              if (data[k] !== undefined && data[k] !== null) {
                window.userInfo.data[k] = data[k]
              }
            }
          }
          let vuexStr = ''
          try {
            vuexStr = JSON.stringify(vuex)
          } catch (e) {
            console.error('[sysframe] 序列化 vuex 失败:', e && e.message)
          }
          if (vuexStr) {
            // 1) 先写响应式 data，触发 computed userInfo 重新计算并同步刷新模板
            this.vuexStr = vuexStr
            // 2) 再写 sessionStorage（即使失败也不影响 UI）
            try {
              sessionStorage.setItem('vuex', vuexStr)
            } catch (e) {
              console.error('[sysframe] sessionStorage.setItem 失败:', e && e.message)
            }
            // 3) nextTick 强制视图刷新，避免某些边界下渲染滞后
            this.$nextTick(() => {
              console.log('[sysframe] nextTick userInfo=', this.userInfo, 'loginName=', (this.userInfo && this.userInfo.loginName) || '')
              this.$forceUpdate()
            })
            // 4) sessionStorage.vuex 已经写好，强制刷新整个页面，
            //    让 mounted 走"已登录"分支（sessionStorage.vuex 已存在），
            //    首屏就能拿到 userInfo.loginName，避免本组件内 computed/渲染缓存导致用户名不更新
            try {
              window.location.reload()
            } catch (e) {
              console.error('[sysframe] window.location.reload 失败:', e && e.message)
            }
          } else {
            console.error('[sysframe] vuexStr 为空，跳过写入 sessionStorage 与 vuexStr')
          }
          this.loadUserInfo()
          return
        }
      } catch (error) {
        console.error('用 cookie 校验登录态失败:', error)
      }
      // 未登录
      this.handleLogout()
    }
  },
  destroyed () {
    // 移除事件监听
    this.$root.$off('refreshUserPhoto', this.loadUserInfo);
  },
  methods: {
    goPortalHome () {
      this.$router.push('/shenbeigpuai/portal/home');
    }, goHome () {
      this.$router.push('/shenbeigpuai/control/home');
    },
    goAccountManagement () {
      this.$router.push('/shenbeigpuai/control/account-management');
    }, goRecharge () {
      this.$router.push('/shenbeigpuai/control/recharge-center');
    }, goWorkorder () {
      this.$router.push('/shenbeigpuai/control/platform-intro');
    }, handleMenuClick (item) {
      if (item.path) {
        this.$router.push(item.path);
      }
    }, handleMenuSelect (path) {
      if (this.activeMenu === path) {
        return
      }
      this.activeMenu = path;
      this.$router.push(path);
    },
    async handleLogout () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/sc/loginService/userLogOut',
          method: 'post'
        });
        if (res.errcode === 0 || res.errcode === 1001) {
          sessionStorage.clear();
          this.$router.push('/login');
        } else {
          this.$Message.warning(res.errmsg || '退出登录失败');
        }
      } catch (error) {
        console.error('退出登录失败:', error);
      }
    },
    // 退出登录二次确认（用户主动操作才走这里，cookie 失效自动退出仍走 handleLogout 直接执行）
    confirmLogout () {
      this.$Modal.confirm({
        title: '退出登录',
        content: '<div style="padding: 8px 0; font-size: 14px; color: #515a6e; line-height: 22px;">确认退出当前登录状态吗？退出后需要重新登录才能继续操作。</div>',
        okText: '确认退出',
        cancelText: '取消',
        width: 420,
        // 主按钮红色警示，强调这是一次不可逆操作
        okButtonProps: { type: 'error', ghost: true },
        // 自定义 class 便于 scoped 样式穿透（避免污染全局 .ivu-modal-confirm）
        className: 'sysframe-logout-confirm',
        onOk: () => {
          this.handleLogout()
        },
        onCancel: () => {
          // 取消时无副作用，弹框会自动销毁
        }
      })
    }, buildMenuTree (menuData, parentId = '0') {
      const result = [];
      const children = menuData.filter(item => item.parent_id === parentId);

      children.forEach(child => {
        const node = {
          ...child
        };
        const childNodes = this.buildMenuTree(menuData, child.id);
        if (childNodes.length > 0) {
          node.children = childNodes;
        }
        result.push(node);
      });

      return result.sort((a, b) => a.sort - b.sort);
    },
    // 加载顶部品牌信息（logo / 大小标题）：取自 portalFooterService.getActiveFooter
    async fetchActiveHeader () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/portalFooterService/getActiveFooter',
          method: 'post',
          data: {}
        })
        const data = res && res.data
        if (data) {
          if (data.headerLogo) this.headerLogo = data.headerLogo
          if (data.headerTitle) this.headerTitle = data.headerTitle
          if (data.headerSubtitle) this.headerSubtitle = data.headerSubtitle
        }
      } catch (e) {
        console.warn('加载顶部品牌信息失败，使用默认值:', e)
      }
    },
    // 加载用户信息（获取头像）
    async loadUserInfo () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post'
        });
        if (res.errcode === 0 && res.data) {
          this.userPhoto = res.data.photo || '';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
  }, config: {}, provideData: {}, canvasConfig: { "scale": "100", "type": "16-9--2" }
}
</script>
<style scoped lang="less">
.ivu-menu {
  border-right: none !important;
}

.ivu-menu-item-group-title {
  padding-left: 20px !important;
}

.ivu-menu-item {
  padding-left: 30px !important;
  font-size: 12px !important;
}

.ivu-menu-vertical {
  width: 200px !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
}

.ivu-menu-item:hover {
  background-color: #f0f0f0 !important;
}

.ivu-menu-item {
  transition: background-color 0.3s;
  cursor: pointer;
}

// 头像样式穿透
sp-image::v-deep img {
  border-radius: 50% !important;
}

.portal-header__brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.portal-header__brand-icon {
  width: 46px;
  height: 32px;
  background: transparent;
  margin-right: 10px;
  flex-shrink: 0;
}

.portal-header__title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  line-height: 18px;
  white-space: normal;
}

/* 退出登录二次确认弹框（穿透 transfer 到 body 的 DOM） */
.sysframe-logout-confirm {
  /deep/ .ivu-modal-confirm-head {
    padding-left: 16px;

    .ivu-modal-confirm-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
    }
  }

  /deep/ .ivu-modal-confirm-body {
    padding: 16px 24px 20px;

    .ivu-modal-confirm-content {
      margin-left: 0;
      padding-left: 0;
      color: #515a6e;
      font-size: 14px;
      line-height: 22px;
    }
  }

  /deep/ .ivu-modal-confirm-footer {
    padding: 12px 24px 20px;

    button+button {
      margin-left: 12px;
    }
  }

  // 强调"危险操作"语义：主按钮红色边框 + 危险色文字
  /deep/ .ivu-btn-error {
    color: #ed4014;
    border-color: #ed4014;

    &:hover {
      color: #fff;
      background-color: #ed4014;
      border-color: #ed4014;
    }
  }
}
</style>