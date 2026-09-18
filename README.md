# 某基云池 · shenbeigpu

> 算力租赁云平台控制台前端 —— 门户站 (Portal) + 用户控制台 (Control) 双端一体化项目。

🌐 **海外预览**：<https://shenbeigpu.vercel.app/#/shenbeigpuai/control/home>

---

## 项目简介

本项目是面向 GPU 算力租赁业务的云平台前端，覆盖 **门户站**（产品展示、注册、登录、帮助、API 介绍、关于我们等）和 **用户控制台**（控制台首页、实例购买与管理、API 计量、订单/账单、充值、镜像、网络、交换机、工单、消息、优惠券、发票、Token 套餐、算力预约等）共 30+ 个业务页面。

整套前端在不依赖真实后端的情况下即可独立运行 —— 通过 `src/mock/` 内置的全量接口 Mock，拦截 `this.$hdAxios` 调用并返回本地数据，**零代码侵入**即可演示完整业务流程。

### 功能模块

| 模块 | 说明 |
| --- | --- |
| 门户 (Portal) | 首页、关于我们、API 介绍、帮助中心、注册、登录、找回密码 |
| 控制台首页 | 资源概览、快捷入口、通知 |
| 实例 | 实例列表、实例购买（GPU 规格选型、镜像、网络、数据盘、计费） |
| API 计量 | API 列表、API 购买 |
| Token 套餐 | 套餐列表、套餐购买 |
| 订单与账单 | 订单列表、账单概览、账单详情、交易流水 |
| 财务 | 充值中心、发票管理、优惠券 |
| 资源 | 镜像管理、专有网络、交换机、子网 |
| 账户 | 账户管理、认证申请、我的预约、消息发送记录、工单 |
| 平台介绍 | 平台简介页 |

### 技术栈

- **框架**：Vue 2.6 + Vue Router 3 + Vue CLI 4
- **UI 库**：[View UI (iview) 4.x](https://www.iviewui.com/)
- **组件库**：`scpcw-pc-plugin` / `scpcw-pc-base` / `scpcw-chart-plugin`（通过 UMD script 标签在 `public/index.html` 引入）
- **HTTP**：Axios，业务通过 `this.$hdAxios` 调用，由 `src/mock/` 在运行时拦截
- **样式**：Less
- **构建**：Webpack（Vue CLI 4 默认）
- **预览部署**：Vercel（hash 路由，零配置）

### 目录结构

```text
src/
├── api/                 # 后端接口封装
├── assets/              # 全局静态资源（图片、样式等）
├── components/          # 通用业务组件
├── mock/                # 全量接口 Mock（运行时拦截 axios）
│   ├── index.js         #   入口，自动合并各页面 mock
│   ├── shared.js        #   跨页面共享 mock（用户信息、字典、区域树等）
│   └── pages/           #   每个页面一个 mock 文件
├── router/              # 路由配置（hash 模式）
├── utils/               # 工具函数
├── views/
│   ├── control/         # 控制台页面（控制台首页、实例、订单、账单…）
│   ├── portal/          # 门户页面（首页、API、帮助、登录…）
│   └── control/sysframe  # 控制台整体布局
├── App.vue
└── main.js
public/
├── index.html           # HTML 入口（含 scpcw-* UMD 资源引用）
└── scpcw-*/             # UMD 静态资源（打包时拷贝到 dist 根目录）
```

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:8080）
npm run serve

# 生产构建（产物输出到 dist/）
npm run build

# 代码检查
npm run lint
```

## 部署

### Vercel（推荐）

将 `dist/` 目录直接上传即可，hash 路由无需任何额外配置：

```bash
npx vercel deploy --prod dist
```

或：

1. 把 `dist/` 里的文件复制到一个临时 git 仓库并 push 到 GitHub。
2. Vercel 控制台 → Add New → Project → 选仓库。
3. Framework Preset 选 `Other`，其余保持默认。

### Nginx 子路径部署

`vue.config.js` 已配置 `publicPath: '/shenbeigpu/'`，把 `dist/` 内容放到 nginx 站点根目录的 `shenbeigpu/` 子目录下即可：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/local/var/www;
    index index.html;

    location /shenbeigpu/ {
        alias /usr/local/var/www/shenbeigpu/;
        try_files $uri $uri/ /shenbeigpu/index.html;
    }
}
```

---

## Mock 说明

项目不依赖后端即可演示完整功能。所有 `this.$hdAxios` 调用会被 `src/mock/index.js` 替换为本地实现，按 URL 返回 `src/mock/shared.js` 与 `src/mock/pages/*.js` 中配置的响应。

- 新增页面 mock：在 `src/mock/pages/` 下新建 `control-<page>.js` 即可，**无需修改任何入口代码**。
- 共享 mock（用户信息、字典、区域树、专有网络等）：统一放在 `src/mock/shared.js`。
- 函数式 mock：根据 `cfg.method/data` 返回不同结果，详见 [src/mock/index.js](src/mock/index.js)。

---

## License

Internal project. All rights reserved.
