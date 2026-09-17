import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 启用接口 Mock（在 Vue.use(scpcwPcPlugin) 之后调用，覆盖原型上的 $hdAxios）
import { enableMock } from './mock'

// scpcw-pc-plugin 已通过 index.html 中的 script 标签从网络引入
const scpcwPcPlugin = window['scpcw-pc-plugin'] || window.scpcwPcPlugin
// const scpcwChartPlugin = window['scpcw-chart-plugin'] || window.scpcwChartPlugin
// const scpcwPcBase = window['scpcw-pc-base'] || window.scpcwPcBase

// 导入 ViewUI 并确保正确注册
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'

Vue.use(ViewUI)
// 手动注册 i- 前缀格式的组件
// 因为 View Design 4.x 的 Vue.use(ViewUI) 不会自动注册 i- 前缀格式
const componentMap = {
  'i-affix': 'Affix',
  'i-alert': 'Alert',
  'i-anchor': 'Anchor',
  'i-anchor-link': 'AnchorLink',
  'i-auto-complete': 'AutoComplete',
  'i-avatar': 'Avatar',
  'i-back-top': 'BackTop',
  'i-badge': 'Badge',
  'i-breadcrumb': 'Breadcrumb',
  'i-breadcrumb-item': 'BreadcrumbItem',
  'i-button': 'Button',
  'i-button-group': 'ButtonGroup',
  'i-card': 'Card',
  'i-carousel': 'Carousel',
  'i-carousel-item': 'CarouselItem',
  'i-cascader': 'Cascader',
  'i-cell': 'Cell',
  'i-cell-group': 'CellGroup',
  'i-checkbox': 'Checkbox',
  'i-checkbox-group': 'CheckboxGroup',
  'i-circle': 'Circle',
  'i-col': 'Col',
  'i-collapse': 'Collapse',
  'i-color-picker': 'ColorPicker',
  'i-content': 'Content',
  'i-divider': 'Divider',
  'i-date-picker': 'DatePicker',
  'i-drawer': 'Drawer',
  'i-dropdown': 'Dropdown',
  'i-dropdown-item': 'DropdownItem',
  'i-dropdown-menu': 'DropdownMenu',
  'i-footer': 'Footer',
  'i-form': 'Form',
  'i-form-item': 'FormItem',
  'i-header': 'Header',
  'i-icon': 'Icon',
  'i-input': 'Input',
  'i-input-number': 'InputNumber',
  'i-layout': 'Layout',
  'i-list': 'List',
  'i-list-item': 'ListItem',
  'i-list-item-meta': 'ListItemMeta',
  'i-menu': 'Menu',
  'i-menu-group': 'MenuGroup',
  'i-menu-item': 'MenuItem',
  'i-sider': 'Sider',
  'i-submenu': 'Submenu',
  'i-modal': 'Modal',
  'i-option': 'Option',
  'i-option-group': 'OptionGroup',
  'i-page': 'Page',
  'i-panel': 'Panel',
  'i-poptip': 'Poptip',
  'i-progress': 'Progress',
  'i-radio': 'Radio',
  'i-radio-group': 'RadioGroup',
  'i-rate': 'Rate',
  'i-row': 'Row',
  'i-select': 'Select',
  'i-slider': 'Slider',
  'i-spin': 'Spin',
  'i-split': 'Split',
  'i-step': 'Step',
  'i-steps': 'Steps',
  'i-switch': 'Switch',
  'i-table': 'Table',
  'i-tabs': 'Tabs',
  'i-tab-pane': 'TabPane',
  'i-tag': 'Tag',
  'i-time': 'Time',
  'i-timeline': 'Timeline',
  'i-timeline-item': 'TimelineItem',
  'i-time-picker': 'TimePicker',
  'i-tooltip': 'Tooltip',
  'i-transfer': 'Transfer',
  'i-tree': 'Tree',
  'i-upload': 'Upload'
}

// 批量注册所有 i- 前缀组件
Object.keys(componentMap).forEach(kebabName => {
  const componentName = componentMap[kebabName]
  if (ViewUI[componentName]) {
    Vue.component(kebabName, ViewUI[componentName])
  }
})

Vue.use(scpcwPcPlugin.default || scpcwPcPlugin)
// Vue.use(scpcwChartPlugin.default || scpcwChartPlugin)

// 用 mock 实例覆盖 $hdAxios，所有 this.$hdAxios.request(...) 走 mock
enableMock()

// // 在 scpcw-pc-base 初始化前，确保 ViewUI 已注册
// Vue.use(scpcwPcBase.default , {
//   themeConfig: {
//     // 组件主题色
//     componentColor: '',
//     // 主题色
//     majorColor: '',
//     theme: {
//       colorSystem: 2 // 是否用搭配好的配色默认有3种(1,2,3)  (如果colorSystem不存在 默认走下面配置的自定义主题色)
//     }
//   }
// })


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')