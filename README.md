# ShenBei GPU Cloud · shenbeigpu

> A GPU computing rental cloud platform front-end — an integrated project covering both the **Portal** (public-facing marketing & auth pages) and the **Console** (authenticated user control panel).

🌐 **Live Preview (Overseas)**: <https://shenbeigpu.vercel.app/#/shenbeigpuai/control/home>

[中文说明](#中文说明) · [English](#english)

---

## English

### Overview

**ShenBei GPU Cloud** (codename `shenbeigpu`) is the front-end of a GPU computing rental platform. It delivers an end-to-end experience across the customer journey — from browsing public product pages, signing up, logging in, all the way to provisioning GPU instances, managing networks/mirrors/switches, billing, and support — comprising **30+ business pages** organized into a Portal and a Console.

A standout feature: **the project ships with a built-in, full-coverage mock layer**, which intercepts all `this.$hdAxios` calls at runtime and returns local fixtures. The entire front-end can be demoed and explored without any real backend, with **zero changes to business code**.

### Feature Modules

| Module | Description |
| --- | --- |
| Portal | Home, About, API, Help Center, Registration, Login, Password Recovery |
| Console Home | Resource overview, quick actions, announcements |
| Instances | Instance list & lifecycle; **Purchase Wizard** (GPU SKU selection, image, network, data disk, billing) |
| API Metering | API list, API purchase |
| Token Plans | Token plan list & purchase |
| Orders & Billing | Order list, bill overview, bill detail, transaction history |
| Finance | Recharge center, invoice management, coupons |
| Resources | Image management, VPC networks, switches, subnets |
| Account | Account management, identity verification, appointments, message records, support tickets |
| Platform Intro | Platform introduction page |

### Tech Stack

- **Framework**: Vue 2.6 + Vue Router 3 + Vue CLI 4
- **UI Library**: [View UI (iview) 4.x](https://www.iviewui.com/)
- **In-house Components**: `scpcw-pc-plugin` / `scpcw-pc-base` / `scpcw-chart-plugin` (loaded as UMD scripts via `public/index.html`)
- **HTTP**: Axios; business code calls `this.$hdAxios`, intercepted at runtime by `src/mock/`
- **Styling**: Less
- **Build**: Webpack (Vue CLI 4 default)
- **Preview Deployment**: Vercel (hash-mode router, zero config)

### Project Structure

```text
src/
├── api/                 # Backend API wrappers
├── assets/              # Global static assets (images, styles, etc.)
├── components/          # Reusable business components
├── mock/                # Full-coverage runtime mock layer
│   ├── index.js         #   Entry: merges all mock modules
│   ├── shared.js        #   Cross-page shared mocks (user info, dictionaries, region tree, etc.)
│   └── pages/           #   One mock file per page
├── router/              # Router config (hash mode)
├── utils/               # Utility functions
├── views/
│   ├── control/         # Console pages (home, instances, orders, billing, ...)
│   ├── portal/          # Portal pages (home, api, help, login, ...)
│   └── control/sysframe # Console shell layout
├── App.vue
└── main.js
public/
├── index.html           # HTML entry (loads scpcw-* UMD assets)
└── scpcw-*/             # UMD assets, copied to dist root on build
```

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (default: http://localhost:8080)
npm run serve

# Production build (output to dist/)
npm run build

# Lint and fix
npm run lint
```

### Deployment

#### Vercel (Recommended)

Because the router is in **hash mode**, no server-side rewrite rules are required. Deploy `dist/` directly:

```bash
npx vercel deploy --prod dist
```

Or:

1. Copy `dist/` into a temporary git repo and push to GitHub.
2. In the Vercel dashboard → Add New → Project → select the repo.
3. Framework Preset: `Other`. Leave all other fields at defaults.

#### Nginx (Sub-path Deployment)

`vue.config.js` already sets `publicPath: '/shenbeigpu/'`. Drop the `dist/` contents under nginx's web root in a `shenbeigpu/` sub-folder:

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

### About the Mock Layer

The project does not depend on any real backend to demo the full flow. `src/mock/index.js` replaces `this.$hdAxios` with a local implementation that responds based on fixtures in `src/mock/shared.js` and `src/mock/pages/*.js`.

- **Add a new page mock**: create `src/mock/pages/control-<page>.js`. **No entry changes needed** — it is auto-merged.
- **Shared mocks** (user info, dictionaries, region tree, VPCs, ...): centralized in `src/mock/shared.js`.
- **Functional mocks**: branch responses by `cfg.method/data`. See [src/mock/index.js](src/mock/index.js).

### License

Internal project. All rights reserved.

---

## 中文说明

### 项目简介

**某基云池（代号 `shenbeigpu`）** 是面向 GPU 算力租赁业务的云平台前端，覆盖 **门户站**（产品展示、注册、登录、帮助、API 介绍、关于我们等）和 **用户控制台**（控制台首页、实例购买与管理、API 计量、订单/账单、充值、镜像、网络、交换机、工单、消息、优惠券、发票、Token 套餐、算力预约等）共 30+ 个业务页面。

整套前端在不依赖真实后端的情况下即可独立运行 —— 通过 `src/mock/` 内置的全量接口 Mock，运行时拦截 `this.$hdAxios` 调用并返回本地数据，**零代码侵入**即可演示完整业务流程。

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

### 本地开发

```bash
npm install      # 安装依赖
npm run serve    # 启动开发服务器（默认 http://localhost:8080）
npm run build    # 生产构建（产物输出到 dist/）
npm run lint     # 代码检查
```

### 部署

- **Vercel**：`npx vercel deploy --prod dist`
- **Nginx 子路径**：`vue.config.js` 已配置 `publicPath: '/shenbeigpu/'`，把 `dist/` 内容放到 nginx 站点根目录的 `shenbeigpu/` 子目录下即可，配置参见英文版示例。

### Mock 体系说明

项目不依赖后端即可演示完整功能。所有 `this.$hdAxios` 调用会被 `src/mock/index.js` 替换为本地实现，按 URL 返回 `src/mock/shared.js` 与 `src/mock/pages/*.js` 中配置的响应。

- 新增页面 mock：在 `src/mock/pages/` 下新建 `control-<page>.js` 即可，**无需修改任何入口代码**。
- 共享 mock（用户信息、字典、区域树、专有网络等）：统一放在 `src/mock/shared.js`。
- 函数式 mock：根据 `cfg.method/data` 返回不同结果，详见 [src/mock/index.js](src/mock/index.js)。
