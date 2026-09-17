<template>
  <div class="order-list">
    <!-- 顶部面包屑 -->
    <div class="order-list__breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>订单管理</BreadcrumbItem>
        <BreadcrumbItem>我的订单</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <div class="order-list__panel">
      <!-- 业务类型 Tab 切换：实例 / Token Plan / 裸金属 -->
      <!-- 三个 Tab 各自独立表格，共用同一份查询结果（tableData），后续后端逻辑就绪后再按 Tab 切分 -->
      <div class="order-list__tabs">
        <Tabs v-model="activeTab" :animated="false">
          <!-- 实例：原列表（订单号 / 实例名称 / 订单类型 / 计费方式 / 购买时长 / 订单状态 / 订单金额 / 下单时间 / 操作） -->
          <TabPane label="实例" name="instance">
            <!-- 筛选栏 -->
            <div class="order-list__filter">
              <Input v-model="searchFormInstance.orderId" clearable placeholder="订单编号..." style="width: 180px"
                class="filter-item" />
              <!-- <Select v-model="searchFormInstance.orderType" placeholder="订单类型" style="width: 140px" class="filter-item"
              clearable>
              <Option value="instance_purchase">实例购买</Option>
              <Option value="recharge">充值</Option>
            </Select> -->
              <Select v-model="searchFormInstance.billingType" placeholder="计费方式" style="width: 120px"
                class="filter-item" clearable>
                <Option value="monthly">包月</Option>
                <Option value="hourly">按量计费</Option>
              </Select>
              <Select v-model="searchFormInstance.status" placeholder="订单状态" style="width: 120px" class="filter-item"
                clearable>
                <Option value="pending">待支付</Option>
                <Option value="paid">已支付</Option>
                <Option value="refunding">退款中</Option>
                <Option value="refunded">已退款</Option>
              </Select>
              <DatePicker type="daterange" v-model="searchFormInstance.dateRange" placeholder="请选择时间范围"
                style="width: 220px" class="filter-item"></DatePicker>
              <Button type="primary" icon="md-search" class="search-btn1" @click="handleSearch">搜索</Button>
              <Button style="margin-left: 0px;font-size: 13px;" icon="md-refresh" @click="handleReset">重置</Button>
            </div>
            <div class="order-list__content">
              <Table :columns="columns" :data="tableData" :loading="loading" class="custom-table">
                <!-- 订单状态槽 -->
                <template slot-scope="{ row }" slot="status">
                  <span :class="['status-tag', row.status]">{{ row.statusText }}</span>
                </template>

                <!-- 购买时长槽 -->
                <template slot-scope="{ row }" slot="duration">
                  <span v-if="row.billingType === '按量计费'">-</span>
                  <span v-else-if="row.cout_type === 'month'">{{ row.period }}个月</span>
                  <span v-else-if="row.cout_type === 'day'">{{ row.period }}天</span>
                  <span v-else-if="row.period">{{ row.period }}</span>
                  <span v-else>-</span>
                </template>

                <!-- 订单金额槽 -->
                <template slot-scope="{ row }" slot="amount">
                  <span v-if="row.billingType === '按量计费' && row.orderType === '实例购买'">-</span>
                  <span v-else class="amount-text">¥{{ row.totalAmount }}</span>
                </template>

                <!-- 操作槽 -->
                <template slot-scope="{ row }" slot="action">
                  <div class="action-btns">
                    <a class="action-link" @click="handleDetailInstance(row)">详情</a>
                    <a v-if="row.status === 'pending'" class="action-link" @click="handlePay(row)">支付</a>
                    <a v-if="row.status !== 'completed' && row.status !== 'paid' && row.status !== 'refunded'"
                      class="action-link cancel" @click="handleCancel(row)">取消</a>
                  </div>
                </template>
              </Table>

              <!-- 分页 -->
              <div class="order-list__page" v-if="total > 0">
                <Page :total="total" :current="pageNo" :page-size="pageSize" :page-size-opts="[10, 20, 30]" show-sizer
                  show-total @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
              </div>
            </div>
          </TabPane>

          <!-- Token Plan：订单号 / 订单类型 / 计费方式 / 购买时长 / 订单状态 / 金额 / 下单时间（暂用同一份 tableData，字段未对齐时显示 -） -->
          <TabPane label="Token Plan" name="tokenPlan">
            <!-- 筛选栏 -->
            <div class="order-list__filter">
              <Input v-model="searchFormTokenPlan.orderId" clearable placeholder="订单编号..." style="width: 180px"
                class="filter-item" />
              <Select v-model="searchFormTokenPlan.orderType" placeholder="订单类型" style="width: 140px"
                class="filter-item" clearable transfer class-name="tokenplan-filter-dropdown">
                <Option v-for="item in tokenPlanDict.orderType" :key="item.value" :value="item.value">{{ item.label }}
                </Option>
              </Select>
              <Select v-model="searchFormTokenPlan.level" placeholder="套餐档位" style="width: 140px" class="filter-item"
                clearable transfer class-name="tokenplan-filter-dropdown">
                <Option v-for="item in tokenPlanDict.level" :key="item.value" :value="item.value">{{ item.label }}
                </Option>
              </Select>
              <Select v-model="searchFormTokenPlan.billingType" placeholder="计费方式" style="width: 120px"
                class="filter-item" clearable transfer class-name="tokenplan-filter-dropdown">
                <!-- 此处后端返回的是汉字 -->
                <Option v-for="item in tokenPlanDict.billingCycle" :key="item.value" :value="item.value">{{ item.label
                }}
                </Option>
              </Select>
              <Select v-model="searchFormTokenPlan.status" placeholder="订单状态" style="width: 120px" class="filter-item"
                clearable transfer class-name="tokenplan-filter-dropdown">
                <Option v-for="item in tokenPlanStatusList" :key="item.value" :value="item.value">{{ item.label }}
                </Option>
              </Select>
              <!-- <Select v-model="searchFormTokenPlan.tokenplanStatus" placeholder="生效状态" style="width: 120px" class="filter-item"
              clearable transfer class-name="tokenplan-filter-dropdown">
              <Option v-for="item in tokenPlanEffectiveStatusList" :key="item.value" :value="item.value">{{ item.label }}
              </Option>
            </Select> -->
              <DatePicker type="daterange" v-model="searchFormTokenPlan.dateRange" placeholder="请选择下单时间范围"
                style="width: 220px" class="filter-item" transfer></DatePicker>
              <Button type="primary" icon="md-search" class="search-btn1" @click="handleSearch">搜索</Button>
              <Button style="margin-left: 0px;font-size: 13px;" icon="md-refresh" @click="handleReset">重置</Button>
            </div>
            <div class="order-list__content">
              <Table :columns="tokenPlanColumns" :data="tableDataTokenPlan" :loading="loading" class="custom-table">
                <!-- 订单类型槽（字典 label，缺失时用内置映射兜底） -->
                <template slot-scope="{ row }" slot="orderType">
                  <span>{{ getTokenPlanLabel('orderType', row.orderType) }}</span>
                </template>

                <!-- 计费方式槽（字典 label，缺失时用内置映射兜底） -->
                <template slot-scope="{ row }" slot="billingType">
                  <span>{{ getTokenPlanLabel('billingCycle', row.billingType) }}</span>
                </template>

                <!-- 订单状态槽（写死映射 label） -->
                <template slot-scope="{ row }" slot="status">
                  <span :class="['status-tag', row.status]">{{ getTokenPlanStatusLabel(row.status) }}</span>
                </template>

                <!-- 生效状态槽（0=生效，1=失效） -->
                <template slot-scope="{ row }" slot="effectiveStatus">
                  <!-- 待支付订单：强制显示"待生效"，不展示真实生效状态 -->
                  <span v-if="row.status === 'pending'" class="status-tag pending">待生效</span>
                  <span v-else :class="['status-tag', getEffectiveStatusClass(row.tokenplanStatus)]">{{
                    getEffectiveStatusLabel(row.tokenplanStatus) }}</span>
                </template>

                <!-- 套餐/档位槽（字典 label，缺失时用内置映射兜底） -->
                <template slot-scope="{ row }" slot="planLevel">
                  <span>{{ getTokenPlanLabel('level', row.tokenplanLevel) }}</span>
                </template>

                <!-- 有效期槽（生效时间 ~ 过期时间） -->
                <template slot-scope="{ row }" slot="duration">
                  <span>{{ row.effectiveTime || '-' }}</span>
                  <span v-if="row.expirationTime"> ~ {{ row.expirationTime }}</span>
                </template>

                <!-- 操作槽：详情总是可点；仅 pending（待支付）订单展示支付与取消 -->
                <template slot-scope="{ row }" slot="action">
                  <div class="action-btns">
                    <a class="action-link" @click="handleDetailTokenPlan(row)">详情</a>
                    <a v-if="row.status === 'pending'" class="action-link" @click="handlePayTokenPlan(row)">支付</a>
                    <a v-if="row.status === 'pending'" class="action-link cancel"
                      @click="handleCancelTokenPlan(row)">取消</a>
                  </div>
                </template>
              </Table>

              <!-- 分页 -->
              <div class="order-list__page" v-if="total > 0">
                <Page :total="total" :current="pageNo" :page-size="pageSize" :page-size-opts="[10, 20, 30]" show-sizer
                  show-total @on-change="handleTokenPlanPageChange"
                  @on-page-size-change="handleTokenPlanPageSizeChange" />
              </div>
            </div>
          </TabPane>

          <!-- 裸金属：订单号 / 订单类型 / 实例规格 / 地域 / 计费方式 / 购买时长 / 实付金额 / 订单状态（暂用同一份 tableData，字段未对齐时显示 -） -->
          <TabPane label="裸金属" name="bareMetal">
            <!-- 筛选栏 -->
            <div class="order-list__filter">
              <Input v-model="searchFormBareMetal.orderId" placeholder="订单编号..." style="width: 180px"
                class="filter-item" />
              <!-- <Select v-model="searchFormBareMetal.orderType" placeholder="订单类型" style="width: 140px" class="filter-item"
              clearable>
              <Option value="instance_purchase">实例购买</Option>
              <Option value="recharge">充值</Option>
            </Select> -->
              <Select v-model="searchFormBareMetal.billingType" placeholder="计费方式" style="width: 120px"
                class="filter-item" clearable>
                <Option value="monthly">包月</Option>
                <Option value="hourly">按量计费</Option>
              </Select>
              <Select v-model="searchFormBareMetal.status" placeholder="订单状态" style="width: 120px" class="filter-item"
                clearable>
                <Option value="pending">待支付</Option>
                <Option value="paid">已支付</Option>
                <Option value="refunding">退款中</Option>
                <Option value="refunded">已退款</Option>
              </Select>
              <DatePicker type="daterange" v-model="searchFormBareMetal.dateRange" placeholder="请选择时间范围"
                style="width: 220px" class="filter-item"></DatePicker>
              <Button type="primary" icon="md-search" class="search-btn1" @click="handleSearch">搜索</Button>
              <Button style="margin-left: 0px;font-size: 13px;" icon="md-refresh" @click="handleReset">重置</Button>
            </div>
            <div class="order-list__content">
              <Table :columns="bareMetalColumns" :data="tableData" :loading="loading" class="custom-table">
                <!-- 实例规格槽 -->
                <template slot-scope="{ row }" slot="spec">
                  <span>{{ row.specDesc || row.productName || '-' }}</span>
                </template>

                <!-- 地域槽 -->
                <template slot-scope="{ row }" slot="region">
                  <span>{{ row.regionName || '-' }}</span>
                </template>

                <!-- 购买时长槽 -->
                <template slot-scope="{ row }" slot="duration">
                  <span v-if="row.billingType === '按量计费'">-</span>
                  <span v-else-if="row.cout_type === 'month'">{{ row.period }}个月</span>
                  <span v-else-if="row.cout_type === 'day'">{{ row.period }}天</span>
                  <span v-else-if="row.period">{{ row.period }}</span>
                  <span v-else>-</span>
                </template>

                <!-- 实付金额槽 -->
                <template slot-scope="{ row }" slot="amount">
                  <span class="amount-text">¥{{ row.actualAmount || row.totalAmount }}</span>
                </template>

                <!-- 订单状态槽 -->
                <template slot-scope="{ row }" slot="status">
                  <span :class="['status-tag', row.status]">{{ row.statusText }}</span>
                </template>

                <!-- 操作槽：仅"详情"（裸金属不涉及支付/取消） -->
                <template slot-scope="{ row }" slot="action">
                  <!-- <div class="action-btns">
                    <a class="action-link" @click="handleDetailBareMetal(row)">详情</a>
                  </div> -->
                  <div class="action-btns">
                    <a class="action-link" @click="handleDetailInstance(row)">详情</a>
                    <a v-if="row.status === 'pending'" class="action-link" @click="handlePay(row)">支付</a>
                    <a v-if="row.status !== 'completed' && row.status !== 'paid' && row.status !== 'refunded'"
                      class="action-link cancel" @click="handleCancel(row)">取消</a>
                  </div>
                </template>
              </Table>

              <!-- 分页 -->
              <div class="order-list__page" v-if="total > 0">
                <Page :total="total" :current="pageNo" :page-size="pageSize" :page-size-opts="[10, 20, 30]" show-sizer
                  show-total @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>

    <!-- 支付确认弹框 -->
    <Modal v-model="payModalVisible" title="支付确认" :closable="true" :mask-closable="false" :footer-hide="true"
      :loading="payModalLoading" @on-cancel="handlePayModalCancel">
      <div v-if="currentRow" style="padding: 16px 0; font-size: 14px; line-height: 1.6;">
        <p>确定要支付该订单吗？</p>
        <p style="margin-top: 8px; color: #515a6e;">订单号：{{ currentRow.orderNo }}</p>
        <p style="margin-top: 8px;">
          <span>支付金额：</span>
          <span style="color: #ff4d4f; font-weight: bold; font-size: 16px;">¥{{
            Number(currentRow.totalAmount).toFixed(2)
          }}</span>
        </p>
        <p v-if="currentRow.actualAmount > 0 && currentRow.orderType !== '充值'" style="margin-top: 8px; color: #19be6b;">
          余额已抵扣：¥{{ currentRow.actualAmount }}
        </p>
        <div v-if="currentRow.thirdPartyAmount > 0 || currentRow.orderType === '充值'"
          style="margin-top: 16px; padding: 16px; background: #f8f8f9; border-radius: 4px; text-align: center;">
          <p v-if="currentRow.thirdPartyAmount > 0" style="color: #ff4d4f; font-weight: bold; margin-bottom: 12px;">
            还需微信支付：¥{{ Number(currentRow.thirdPartyAmount).toFixed(2) }}
          </p>
          <canvas v-if="testOrderQrCodeUrl" ref="qrCanvas" width="150" height="150"
            style="margin: 0 auto; display: block;"></canvas>
          <div v-else
            style="width: 150px; height: 150px; margin: 0 auto; background: #fff; border: 1px solid #dcdee2; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #c5c8ce; font-size: 12px;">二维码加载中...</span>
          </div>
          <p style="margin-top: 8px; color: #808695; font-size: 12px;">请使用微信扫一扫完成支付</p>
        </div>
      </div>
      <div v-if="currentRow && currentRow.thirdPartyAmount <= 0" slot="footer">
        <Button @click="handlePayModalCancel">取消</Button>
        <Button type="primary" :loading="payModalLoading" @click="handlePayConfirm">确认支付</Button>
      </div>
    </Modal>

    <!-- 订单确认成功后的提示弹框（不可关闭，10s 倒计时 + 轮询 instance_init 后显示跳转按钮） -->
    <Modal v-model="postOrderModalVisible" title="扫码成功，实例创建中..." :closable="false" :mask-closable="false" :footer-hide="true"
      width="80" class-name="order-list__post-order-modal">
      <iframe v-if="postOrderIframeSrcdoc && postOrderModalVisible" :key="postOrderModalVisible"
        :srcdoc="postOrderIframeSrcdoc" ref="postOrderIframe" frameborder="0" scrolling="auto"
        :style="{ display: 'block', width: '100%', height: '600px', border: '1px solid #dcdee2', borderRadius: '4px', background: '#fff' }"></iframe>
      <div :style="{ marginTop: '12px', textAlign: 'center' }">
        <Button v-if="instanceCreated" type="primary" @click="goToInstanceList">
          实例创建成功，请前往列表页查看
        </Button>
        <div v-else style="color:#999;font-size:14px;">
          实例创建中，请稍候<span v-if="postOrderCountdown > 0">（{{ postOrderCountdown }}s）</span>...
        </div>
      </div>
    </Modal>

    <!-- 订单详情弹框 - 实例（独立 Modal，字段后续可独立扩展） -->
    <Modal v-model="detailModalInstance" :closable="true" :mask-closable="false" :footer-hide="true" width="900"
      class="order-detail-modal" @on-cancel="handleDetailInstanceCancel">
      <div slot="header" class="order-detail-modal__header">
        <Icon type="md-document" class="order-detail-modal__icon" />
        <span>订单详情（实例）</span>
      </div>
      <div v-if="detailRowInstance" class="detail-content">
        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>基础信息</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单号</span>
                <span class="value">{{ detailRowInstance.orderNo || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单类型</span>
                <span class="value">{{ detailRowInstance.orderType || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">计费方式</span>
                <span class="value">{{ detailRowInstance.billingType || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">购买时长</span>
                <span class="value">{{
                  detailRowInstance.cout_type === 'month'
                    ? (detailRowInstance.period + '个月')
                    : (detailRowInstance.cout_type === 'day'
                      ? (detailRowInstance.period + '天')
                      : (detailRowInstance.period || '--')) }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单状态</span>
                <span class="value">
                  <span :class="['status-tag', detailRowInstance.status]">{{ detailRowInstance.statusText }}</span>
                </span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">下单时间</span>
                <span class="value">{{ detailRowInstance.createTime || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <!-- <Col span="12">
              <div class="detail-item">
                <span class="label">用户ID</span>
                <span class="value">{{ detailRowInstance.userId || '--' }}</span>
              </div>
              </Col> -->
              <Col span="12">
              <div class="detail-item">
                <span class="label">实例名称</span>
                <span class="value">{{ detailRowInstance.instanceName || '--' }}</span>
              </div>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 金额信息 -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>金额信息</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单金额</span>
                <span class="value">¥{{ detailRowInstance.totalAmount }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">余额已抵扣</span>
                <span class="value">¥{{ detailRowInstance.actualAmount }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">第三方支付</span>
                <span class="value">¥{{ detailRowInstance.thirdPartyAmount }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">已支付金额</span>
                <span class="value">¥{{ detailRowInstance.paidAmount }}</span>
              </div>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 服务器配置（来自 SKU：CPU/GPU/内存） -->
        <div class="detail-section"
          v-if="detailInstanceInfo && (detailInstanceInfo.coreCount || detailInstanceInfo.gpuCount || detailInstanceInfo.memoryConfig)">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>服务器配置</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">规格名称</span>
                <span class="value">{{ detailInstanceInfo.productName || '--' }}</span>
              </div>
              </Col>

              <Col span="12">
              <div class="detail-item">
                <span class="label">内存大小</span>
                <span class="value">{{ detailInstanceInfo.memoryConfig || '--' }} GB</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;" v-if="detailInstanceInfo.productName || detailInstanceInfo.specDesc">
              <Col span="12">
              <div class="detail-item">
                <span class="label">CPU 核心数</span>
                <span class="value">{{ detailInstanceInfo.coreCount || '--' }} 核</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">GPU 数量</span>
                <span class="value">{{ detailInstanceInfo.gpuCount || '--' }} 个</span>
              </div>
              </Col>
              <!-- <Col span="8">
              <div class="detail-item">
                <span class="label">规格描述</span>
                <span class="value">{{ detailInstanceInfo.specDesc || '--' }}</span>
              </div>
              </Col> -->
            </Row>
          </div>
        </div>

        <!-- 网络配置（实例运行时数据，未创建实例时此区块不显示） -->
        <div class="detail-section" v-if="detailInstanceInfo && detailInstanceInfo.instanceId">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>网络配置</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="8">
              <div class="detail-item">
                <span class="label">实例状态</span>
                <span class="value">
                  <span class="status-tag" :class="'status-' + detailInstanceInfo.instanceStatus">
                    {{ detailInstanceInfo.instanceStatus || '--' }}
                  </span>
                </span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">实例名称</span>
                <span class="value">{{ detailInstanceInfo.instanceName || '--' }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">PVE虚拟机ID</span>
                <span class="value">{{ detailInstanceInfo.vmid || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="8">
              <div class="detail-item">
                <span class="label">专有网络</span>
                <span class="value">{{ detailInstanceInfo.vnetId ? (detailInstanceInfo.vnetName || '默认') : '默认'
                }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">交换机</span>
                <span class="value">{{ detailInstanceInfo.subnetId ? (detailInstanceInfo.subnetName || '默认') : '默认'
                }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">地域</span>
                <span class="value">{{ detailInstanceInfo.regionName || detailInstanceInfo.regionId || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="8">
              <div class="detail-item">
                <span class="label">IP</span>
                <span class="value">{{ detailInstanceInfo.vnetIp || '--' }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">创建时间</span>
                <span class="value">{{ detailInstanceInfo.instanceCreateTime || '--' }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">到期时间</span>
                <span class="value">{{ detailInstanceInfo.instanceExpireTime || '--' }}</span>
              </div>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 数据盘（按父订单明细ID查询的数据盘子订单明细） -->
        <div class="detail-section"
          v-if="detailInstanceInfo && detailInstanceInfo.dataDiskItems && detailInstanceInfo.dataDiskItems.length > 0">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>数据盘</span>
          </div>
          <div class="detail-grid-self" style="padding: 12px;">
            <Table :columns="dataDiskColumns" :data="detailInstanceInfo.dataDiskItems" size="small" border></Table>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button @click="handleDetailInstanceCancel">关闭</Button>
      </div>
    </Modal>

    <!-- 订单详情弹框 - 裸金属（独立 Modal，字段后续可独立扩展） -->
    <Modal v-model="detailModalBareMetal" :closable="true" :mask-closable="false" :footer-hide="true" width="900"
      class="order-detail-modal" @on-cancel="handleDetailBareMetalCancel">
      <div slot="header" class="order-detail-modal__header">
        <Icon type="md-cube" class="order-detail-modal__icon" />
        <span>订单详情（裸金属）</span>
      </div>
      <div v-if="detailRowBareMetal" class="detail-content">
        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>基础信息</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单号</span>
                <span class="value">{{ detailRowBareMetal.orderNo || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单类型</span>
                <span class="value">{{ detailRowBareMetal.orderType || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">计费方式</span>
                <span class="value">{{ detailRowBareMetal.billingType || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">购买时长</span>
                <span class="value">{{
                  detailRowBareMetal.cout_type === 'month'
                    ? (detailRowBareMetal.period + '个月')
                    : (detailRowBareMetal.cout_type === 'day'
                      ? (detailRowBareMetal.period + '天')
                      : (detailRowBareMetal.period || '--')) }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单状态</span>
                <span class="value">
                  <span :class="['status-tag', detailRowBareMetal.status]">{{ detailRowBareMetal.statusText }}</span>
                </span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">下单时间</span>
                <span class="value">{{ detailRowBareMetal.createTime || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <!-- <Col span="12">
              <div class="detail-item">
                <span class="label">用户ID</span>
                <span class="value">{{ detailRowBareMetal.userId || '--' }}</span>
              </div>
              </Col> -->
              <Col span="12">
              <div class="detail-item">
                <span class="label">实例规格</span>
                <span class="value">{{
                  detailRowBareMetal.specDesc
                  || detailRowBareMetal.productName
                  || (detailRowBareMetal._rawData &&
                    (detailRowBareMetal._rawData.specDesc || detailRowBareMetal._rawData.spec_desc))
                  || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">地域</span>
                <span class="value">{{
                  (detailRowBareMetal._rawData &&
                    (detailRowBareMetal._rawData.regionName || detailRowBareMetal._rawData.region_name ||
                      detailRowBareMetal._rawData.regionId || detailRowBareMetal._rawData.region_id))
                  || '--' }}</span>
              </div>
              </Col>
            </Row>
            <!-- <Row style="margin-top: 6px;">
              
            </Row> -->
          </div>
        </div>

        <!-- 金额信息 -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>金额信息</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单金额</span>
                <span class="value">¥{{ detailRowBareMetal.totalAmount }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">余额已抵扣</span>
                <span class="value">¥{{ detailRowBareMetal.actualAmount }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">第三方支付</span>
                <span class="value">¥{{ detailRowBareMetal.thirdPartyAmount }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">已支付金额</span>
                <span class="value">¥{{ detailRowBareMetal.paidAmount }}</span>
              </div>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 原始字段（后端返回） -->
        <!-- <div class="detail-section" v-if="detailRowBareMetal._rawData">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>原始字段（后端返回）</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单ID</span>
                <span class="value">{{ detailRowBareMetal._rawData.id || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">渠道</span>
                <span class="value">{{ detailRowBareMetal._rawData.channel || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单来源</span>
                <span class="value">{{ detailRowBareMetal._rawData.orderSource || detailRowBareMetal._rawData.order_source || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">支付方式</span>
                <span class="value">{{ detailRowBareMetal._rawData.paymentStatus || detailRowBareMetal._rawData.payment_status || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">退款状态</span>
                <span class="value">{{ detailRowBareMetal._rawData.refundStatus || detailRowBareMetal._rawData.refund_status || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">支付时间</span>
                <span class="value">{{ detailRowBareMetal._rawData.payTime || detailRowBareMetal._rawData.pay_time || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">完成时间</span>
                <span class="value">{{ detailRowBareMetal._rawData.completeTime || detailRowBareMetal._rawData.complete_time || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">过期时间</span>
                <span class="value">{{ detailRowBareMetal._rawData.expireTime || detailRowBareMetal._rawData.expire_time || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="24">
              <div class="detail-item">
                <span class="label">备注</span>
                <span class="value">{{ detailRowBareMetal._rawData.remark || '--' }}</span>
              </div>
              </Col>
            </Row>
            <div class="detail-item detail-item--full" v-if="detailRowBareMetal._rawData.paramJson || detailRowBareMetal._rawData.param_json" style="margin-top: 6px;">
              <span class="label">参数JSON</span>
              <pre class="order-detail__json">{{ formatJson(detailRowBareMetal._rawData.paramJson || detailRowBareMetal._rawData.param_json) }}</pre>
            </div>
            <div class="detail-item detail-item--full" v-if="detailRowBareMetal._rawData.extJson || detailRowBareMetal._rawData.ext_json" style="margin-top: 6px;">
              <span class="label">扩展JSON</span>
              <pre class="order-detail__json">{{ formatJson(detailRowBareMetal._rawData.extJson || detailRowBareMetal._rawData.ext_json) }}</pre>
            </div>
          </div>
        </div> -->
      </div>
      <div slot="footer">
        <Button @click="handleDetailBareMetalCancel">关闭</Button>
      </div>
    </Modal>

    <!-- 订单详情弹框 - Token Plan（独立 Modal，字段后续可独立扩展） -->
    <Modal v-model="detailModalTokenPlan" :closable="true" :mask-closable="false" :footer-hide="true" width="900"
      class="order-detail-modal" @on-cancel="handleDetailTokenPlanCancel">
      <div slot="header" class="order-detail-modal__header">
        <Icon type="md-card" class="order-detail-modal__icon" />
        <span>订单详情（Token Plan）</span>
      </div>
      <div v-if="detailRowTokenPlan" class="detail-content">
        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>基础信息</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单号</span>
                <span class="value">{{ detailRowTokenPlan.orderNo || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单类型</span>
                <span class="value">{{ getTokenPlanLabel('orderType', detailRowTokenPlan.orderType) || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">套餐档位</span>
                <span class="value">{{ getTokenPlanLabel('level', detailRowTokenPlan.tokenplanLevel) || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">计费方式</span>
                <span class="value">{{ getTokenPlanLabel('billingCycle', detailRowTokenPlan.billingType) || '--'
                }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">订单状态</span>
                <span class="value">
                  <span :class="['status-tag', detailRowTokenPlan.status]">{{
                    getTokenPlanStatusLabel(detailRowTokenPlan.status) }}</span>
                </span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">下单时间</span>
                <span class="value">{{ detailRowTokenPlan.createTime || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">生效时间</span>
                <span class="value">{{ detailRowTokenPlan.effectiveTime || '--' }}</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">过期时间</span>
                <span class="value">{{ detailRowTokenPlan.expirationTime || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 6px;">
              <Col span="12">
              <div class="detail-item">
                <span class="label">剩余天数</span>
                <span class="value">{{
                  (detailRowTokenPlan.remainingDays !== null && detailRowTokenPlan.remainingDays !== undefined)
                    ? detailRowTokenPlan.remainingDays
                    : '--' }} 天</span>
              </div>
              </Col>
              <Col span="12">
              <div class="detail-item">
                <span class="label">有效天数</span>
                <span class="value">{{ detailRowTokenPlan.effectiveDays || '--' }} 天</span>
              </div>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 原始字段（后端返回） -->
        <!-- <div class="detail-section" v-if="detailRowTokenPlan._rawData">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>原始字段（后端返回）</span>
          </div>
          <div class="detail-grid-self">
            <div class="detail-item detail-item--full" v-for="(val, key) in detailRowTokenPlan._rawData" :key="key"
              style="margin-top: 4px;">
              <span class="label">{{ key }}</span>
              <span class="value" style="word-break: break-all;">{{ val === null || val === undefined ? '--' : val }}</span>
            </div>
          </div>
        </div> -->
      </div>
      <div slot="footer">
        <Button @click="handleDetailTokenPlanCancel">关闭</Button>
      </div>
    </Modal>

    <!-- Token Plan 微信支付弹窗 -->
    <Modal v-model="tplPayModalVisible" title="微信支付" :mask-closable="false" width="360"
      @on-cancel="handleTplPayModalCancel">
      <div style="text-align: center;">
        <div v-if="currentPayRow" style="margin-bottom: 12px; font-size: 14px; color: #515a6e;">
          订单号：{{ currentPayRow.orderNo }}
        </div>
        <div v-if="tplThirdPartyAmount !== '' && tplThirdPartyAmount !== null && tplThirdPartyAmount !== undefined"
          style="margin-bottom: 16px;">
          <span style="font-size: 14px; color: #515a6e;">需支付：</span>
          <span style="font-size: 22px; font-weight: bold; color: #ed4014;">¥{{ Number(tplThirdPartyAmount).toFixed(2)
          }}</span>
        </div>
        <div class="tpl-pay-modal__qr">
          <canvas v-if="tplQrCodeUrl" ref="tplQrCanvas" width="200" height="200"
            style="margin: 0 auto; display: block;"></canvas>
          <div v-else
            style="width: 200px; height: 200px; margin: 0 auto; background: #fff; border: 1px solid #dcdee2; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #c5c8ce; font-size: 14px;">二维码加载中...</span>
          </div>
        </div>
        <p style="margin-top: 16px; font-size: 14px; color: #515a6e;">请使用微信扫一扫完成支付</p>
        <!-- 支付倒计时 -->
        <p v-if="tplCountdownText" style="margin-top: 8px; font-size: 13px; color: #808695;">
          订单将在 <span style="color: #ed4014; font-weight: bold;">{{ tplCountdownText }}</span> 后失效
        </p>
      </div>
      <div slot="footer">
        <Button @click="handleTplPayModalCancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'OrderList',
  data () {
    return {
      loading: false,
      paying: false,
      // 当前激活的业务类型 Tab：instance-实例 / tokenPlan-Token Plan / bareMetal-裸金属
      // 当前三个 Tab 共用同一份表格与同一份查询接口，后续后端逻辑就绪后再按 Tab 差异化
      activeTab: 'instance',
      // 各 Tab 独立的筛选表单，避免相互覆盖
      searchFormInstance: {
        orderId: '',
        productName: '',
        status: '',
        billingType: '',
        orderType: '',
        dateRange: []
      },
      searchFormTokenPlan: {
        orderId: '',
        productName: '',
        status: '',
        billingType: '',
        orderType: '',
        level: '',
        tokenplanStatus: '',
        dateRange: []
      },
      searchFormBareMetal: {
        orderId: '',
        productName: '',
        status: '',
        billingType: '',
        orderType: '',
        dateRange: []
      },
      // 支付确认弹框相关（普通订单/裸金属）
      payModalVisible: false,
      payModalLoading: false,
      currentRow: null, // 当前操作的订单
      testOrderQrCodeUrl: '', // 测试订单二维码URL
      testOrderId: '', // 测试订单ID
      testOrderNo: '', // 充值订单号（用于轮询状态）
      isPaySuccess: false, // 支付是否成功
      isPolling: false, // 是否正在轮询
      pollingTimer: null, // 轮询定时器
      pollingCount: 0, // 轮询次数
      maxPollingCount: 100, // 最大轮询次数
      pollingInterval: 3000, // 轮询间隔（3秒）
      columns: [
        // { title: '序号', slot: 'index', width: 80, align: 'center' },
        { title: '订单号', key: 'orderNo', minWidth: 250 },
        { title: '实例名称', key: 'instanceName', width: 200, align: 'center' },
        { title: '订单类型', key: 'orderType', width: 130, align: 'center' },
        { title: '计费方式', key: 'billingType', width: 130, align: 'center' },
        { title: '购买时长', slot: 'duration', width: 130, align: 'center' },
        { title: '订单状态', slot: 'status', width: 130, align: 'center' },
        { title: '订单金额', slot: 'amount', width: 150, align: 'center' },
        { title: '下单时间', key: 'createTime', width: 200, align: 'center' },
        { title: '操作', slot: 'action', width: 160, align: 'center' }
      ],
      // Token Plan Tab 列定义（订单号 / 订单类型 / 套餐档位 / 计费方式 / 有效期 / 订单状态 / 生效状态 / 下单时间 / 操作）
      // 数据来自独立接口 tokenPlanService/myTokenPlanOrderLis
      tokenPlanColumns: [
        { title: '订单号', key: 'orderNo', minWidth: 250 },
        { title: '订单类型', slot: 'orderType', width: 130, align: 'center' },
        { title: '套餐档位', slot: 'planLevel', width: 130, align: 'center' },
        { title: '计费方式', slot: 'billingType', width: 130, align: 'center' },
        { title: '有效期', slot: 'duration', width: 300, align: 'center' },
        { title: '订单状态', slot: 'status', width: 130, align: 'center' },
        { title: '生效状态', slot: 'effectiveStatus', width: 120, align: 'center' },
        { title: '下单时间', key: 'createTime', width: 200, align: 'center' },
        { title: '操作', slot: 'action', width: 160, align: 'center' }
      ],
      // 裸金属 Tab 列定义（订单号 / 订单类型 / 实例规格 / 地域 / 计费方式 / 购买时长 / 实付金额 / 订单状态 / 操作）
      // 字段暂不要求与后端对应，渲染时缺失值显示 '-'
      bareMetalColumns: [
        { title: '订单号', key: 'orderNo', minWidth: 250 },
        { title: '订单类型', key: 'orderType', width: 130, align: 'center' },
        { title: '实例规格', slot: 'spec', width: 180, align: 'center' },
        { title: '地域', slot: 'region', width: 140, align: 'center' },
        { title: '计费方式', key: 'billingType', width: 130, align: 'center' },
        { title: '购买时长', slot: 'duration', width: 130, align: 'center' },
        { title: '实付金额', slot: 'amount', width: 150, align: 'center' },
        { title: '订单状态', slot: 'status', width: 130, align: 'center' },
        { title: '操作', slot: 'action', width: 160, align: 'center' }
      ],
      tableData: [],
      allOrders: [], // 存储所有订单数据
      // Token Plan Tab 独立数据（独立接口 tokenPlanService/myTokenPlanOrderLis）
      tableDataTokenPlan: [],
      allTokenPlanOrders: [], // Token Plan 订单全量数据
      // Token Plan 字典：订单类型 / 计费方式 / 套餐档位（来自 dict/getDictInfoList）
      tokenPlanDict: {
        orderType: [], // tokenplan_order_type
        billingCycle: [], // tokenplan_billing_cycle
        level: [] // tokenplan_level
      },
      // Token Plan 订单状态（默认兜底值，接口返回 order_status 字典后覆盖）
      tokenPlanStatusList: [
        { value: 'pending', label: '待支付' },
        { value: 'paid', label: '已支付' },
        { value: 'cancelled', label: '已取消' },
        { value: 'refunded', label: '已退款' },
        { value: 'refunding', label: '退款中' }
      ],
      // Token Plan 生效状态（默认兜底值，接口返回 tokenplan_effective_status 字典后覆盖）
      tokenPlanEffectiveStatusList: [
        { value: '0', label: '生效中' },
        { value: '1', label: '已失效' }
      ],
      // Token Plan 内置 value -> label 映射（字典缺失时兜底，与后端枚举/字典保持一致）
      tokenPlanLabelMap: {
        orderType: { new: '新购', renew: '续费', upgrade: '升级' },
        billingCycle: { monthly: '月付', yearly: '年付' },
        level: { standard: '标准版', professional: '专业版', ultimate: '旗舰版' }
      },
      total: 0,
      pageNo: 1,
      pageSize: 10,
      selectedPhysicalId: '',
      // 详情弹框相关（实例 / 裸金属 各自独立，后续字段差异由各自 Modal 维护）
      detailModalInstance: false,
      detailRowInstance: null,
      // 订单级实例详情（包含 SKU 规格、实例运行字段、数据盘），由 handleDetailInstance 异步加载
      detailInstanceInfo: null,
      detailInstanceLoading: false,
      detailModalBareMetal: false,
      detailRowBareMetal: null,
      // 详情弹框 - Token Plan
      detailModalTokenPlan: false,
      detailRowTokenPlan: null,
      // 实例订单详情弹框中的数据盘表格列定义
      dataDiskColumns: [
        {
          title: '产品名',
          key: 'productName',
          render: (h, params) => {
            return h('span', params.row.productName ? params.row.productName : '--')
          }
        },
        {
          title: '类型',
          key: 'diskType',
          width: 100,
          render: (h, params) => {
            const typeMap = { 'SSD': 'SSD', 'HDD': 'HDD' }
            return h('span', typeMap[params.row.diskType] || params.row.diskType || '--')
          }
        },
        {
          title: '容量',
          key: 'capacityGb',
          width: 100,
          render: (h, params) => {
            return h('span', params.row.capacityGb ? params.row.capacityGb + 'GB' : '--')
          }
        },
        {
          title: 'IOPS',
          key: 'iops',
          width: 100,
          render: (h, params) => {
            return h('span', params.row.iops || '--')
          }
        },
        {
          title: '吞吐',
          key: 'throughputMbps',
          width: 120,
          render: (h, params) => {
            return h('span', params.row.throughputMbps ? params.row.throughputMbps + 'MB/s' : '--')
          }
        }
      ],
      // ============ Token Plan 支付弹窗（微信扫码） ============
      tplPayModalVisible: false,
      tplPayModalLoading: false,
      tplQrCodeUrl: '',
      tplThirdPartyAmount: '', // 微信支付需扫码金额（来自getPayOrderQrCode接口）
      currentPayRow: null, // 当前待支付的Token Plan订单行
      // Token Plan 支付倒计时（15分钟）
      tplCountdownTimer: null,
      tplRemainingSeconds: 0, // 剩余秒数
      tplCountdownText: '', // 格式化后的倒计时文本，如 "14:59"
      // Token Plan 微信支付 - 轮询支付状态
      tplIsPolling: false,
      tplPollingTimer: null,
      tplPollingCount: 0,
      tplMaxPollingCount: 400, // 400 * 3s = 20分钟，覆盖15分钟支付倒计时+缓冲
      tplPollingInterval: 3000,

      // ============ 下单后弹框动画（参考 instance-buy，按字典开关启用） ============
      // 下单后弹框是否可见
      postOrderModalVisible: false,
      // 弹框内嵌 iframe 的 srcdoc（动画 HTML）
      postOrderIframeSrcdoc: '',
      // 弹框底部倒计时（10s）倒计时到 0 时按钮变为可点击
      postOrderCountdown: 10,
      postOrderCountdownTimer: null,
      // 字典开关：order_post_modal_switch，VALUE=1 视为开启
      postOrderModalEnabled: false,
      // 轮询 instance_init：每 2 秒查一次，等于 '1' 才显示跳转按钮
      instanceCreated: false,
      pollingOrderId: '',
      pollingTimer: null,
      pollingMaxCount: 60 // 60 * 2s = 2分钟兜底，超时强制显示按钮
    }
  },
  // 根据当前激活的 Tab 返回对应的筛选表单对象（避免每个 Tab 的搜索条件相互覆盖）
  computed: {
    currentSearchForm () {
      if (this.activeTab === 'tokenPlan') return this.searchFormTokenPlan
      if (this.activeTab === 'bareMetal') return this.searchFormBareMetal
      return this.searchFormInstance
    }
  },
  mounted () {
    // 支持 ?tab=tokenPlan / tab=bareMetal / tab=instance 直接定位到对应 Tab
    // 注：这里直接修改 activeTab 会触发下方 watch；为了避免重复请求接口，watch 内部用 this._inited 标记首帧跳过
    this._inited = false
    const tab = this.$route && this.$route.query && this.$route.query.tab
    if (tab && ['instance', 'tokenPlan', 'bareMetal'].includes(tab) && tab !== this.activeTab) {
      this.activeTab = tab
    }
    // 初始化只调一次接口（不论 activeTab 是否被改）
    if (this.activeTab === 'tokenPlan') {
      this.fetchTokenPlanDicts().then(() => this.loadTokenPlanOrders())
    } else {
      this.loadData()
    }
    // nextTick 后放开 watch，避免初始化阶段的赋值触发二次请求
    this.$nextTick(() => { this._inited = true })
    // 拉取下单后弹框开关字典，并预加载弹框动画 HTML（与 instance-buy 保持一致）
    this.fetchPostOrderModalSwitch()
    this.preparePostOrderIframe()
  },
  watch: {
    // Tab 切换时，自动用新 Tab 的搜索条件重新加载数据
    activeTab (newVal, oldVal) {
      // 首帧（mounted 阶段）的赋值跳过，避免与 mounted 重复加载
      if (this._inited === false) return
      this.pageNo = 1
      // 同步当前 Tab 到 URL（?tab=...），便于分享 / 刷新保留
      if (this.$route && this.$route.query && this.$route.query.tab !== this.activeTab) {
        this.$router.replace({ path: this.$route.path, query: { ...this.$route.query, tab: this.activeTab } }).catch(() => { })
      }
      if (this.activeTab === 'tokenPlan') {
        this.fetchTokenPlanDicts().then(() => this.loadTokenPlanOrders())
      } else {
        this.loadData()
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    // 同路由内通过 query.tab 切换 Tab
    if (to.query && to.query.tab && ['instance', 'tokenPlan', 'bareMetal'].includes(to.query.tab) && to.query.tab !== this.activeTab) {
      this.activeTab = to.query.tab
    }
    next()
  },
  beforeDestroy () {
    // 组件销毁时清理支付状态轮询和倒计时，避免内存泄漏
    this.stopPaymentPolling()
    this.stopTplPaymentPolling()
    this.stopTplCountdown()
    // 清理下单后弹框的 instance_init 轮询与倒计时
    this.stopPollingInstanceInit()
    this.clearPostOrderCountdown()
  },
  methods: {
    async loadData () {
      this.loading = true;
      try {
        // 处理日期范围
        let startTime, endTime;
        const form = this.currentSearchForm;
        if (form.dateRange && form.dateRange.length === 2) {
          startTime = this.formatDate(form.dateRange[0]);
          endTime = this.formatDate(form.dateRange[1]);
        }
        let cloud_platform = ''
        if (this.activeTab === 'instance') {
          cloud_platform = 'VM'
        } else if (this.activeTab === 'bareMetal') {
          cloud_platform = 'BM'
        }

        // 充值订单没有订单明细，不需要传递计费方式参数
        const isRecharge = form.orderType === 'recharge';
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/orderService/listOrder',
          method: 'post',
          data: {
            orderNo: form.orderId || undefined,
            status: form.status || undefined,
            billingType: isRecharge ? undefined : form.billingType || undefined,
            orderType: form.orderType || undefined,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            cloud_platform
          }
        });

        const resp = { data: res };
        if (resp.data.errcode === 0) {
          let list = Array.isArray(resp.data.data) ? resp.data.data : [];
          // 暂时去掉充值订单，逻辑改变后在这显示不合适
          list = list.filter(item => item.order_type !== 'recharge')
          this.allOrders = list.map(item => {
            // 从 billingTypes/billing_types 字段解析计费方式（兼容驼峰和下划线）
            const billingTypeVal = item.billingTypes || item.billing_types
            let billingTypeDisplay = '-';
            if (billingTypeVal === 'monthly') {
              billingTypeDisplay = '包月';
            } else if (billingTypeVal === 'hourly') {
              billingTypeDisplay = '按量计费';
            } else if (billingTypeVal === 'yearly') {
              // 兼容历史数据，将yearly显示为包月
              billingTypeDisplay = '包月';
            }
            // 兼容驼峰和下划线两种字段命名
            const orderNo = item.orderNo || item.order_no || ''
            const instanceName = item.instanceName || item.instance_name || '-'
            const orderType = item.orderType || item.order_type
            const paramJsonStr = item.paramJson || item.param_json
            const totalAmount = item.totalAmount !== undefined ? item.totalAmount : item.total_amount
            const actualAmount = item.actualAmount !== undefined ? item.actualAmount : item.actual_amount
            const thirdPartyAmount = item.thirdPartyAmount !== undefined ? item.thirdPartyAmount : item.third_party_amount
            const paidAmount = item.paidAmount !== undefined ? item.paidAmount : item.paid_amount
            const createTime = item.createTime || item.create_time || ''
            const userId = item.userId || item.user_id || ''
            const orderPaymentId = item.orderPaymentId || item.order_payment_id || ''
            const coutType = item.coutType || item.cout_type || ''
            const period = item.period || ''
            return {
              id: item.id,
              orderNo: orderNo,
              instanceName: instanceName,
              orderType: this.getOrderTypeText(orderType),
              billingType: billingTypeDisplay,
              status: item.status || '',
              paramJson: paramJsonStr ? JSON.parse(paramJsonStr) : {},
              statusText: this.getStatusText(item.status),
              totalAmount: this.formatAmount(totalAmount),
              actualAmount: this.formatAmount(actualAmount), // 余额已抵扣金额
              thirdPartyAmount: this.formatAmount(thirdPartyAmount), // 第三方支付金额
              paidAmount: this.formatAmount(paidAmount),
              createTime: createTime,
              userId: userId,
              orderPaymentId: orderPaymentId,
              cout_type: coutType,
              period: period,
              _rawData: item
            };
          });
          this.total = this.allOrders.length;
          this.handlePageChange(this.pageNo);
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '获取订单列表失败');
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        this.$Message.error('获取订单列表失败');
      } finally {
        this.loading = false;
      }
    },

    handleSearch () {
      this.pageNo = 1;
      if (this.activeTab === 'tokenPlan') {
        // Token Plan 数据量不大，改为前端过滤
        this.filterTokenPlanOrders();
      } else {
        this.loadData();
      }
    },

    // 重置当前 Tab 的搜索条件并重新查询
    handleReset () {
      if (this.activeTab === 'tokenPlan') {
        // 整体替换对象，保证响应式生效
        this.searchFormTokenPlan = {
          orderId: '',
          productName: '',
          status: '',
          billingType: '',
          orderType: '',
          level: '',
          tokenplanStatus: '',
          dateRange: []
        }
      } else if (this.activeTab === 'bareMetal') {
        this.searchFormBareMetal = {
          orderId: '',
          productName: '',
          status: '',
          billingType: '',
          orderType: '',
          dateRange: []
        }
      } else {
        this.searchFormInstance = {
          orderId: '',
          productName: '',
          status: '',
          billingType: '',
          orderType: '',
          dateRange: []
        }
      }
      this.pageNo = 1;
      this.handleSearch();
    },

    // 组装 Token Plan 列表查询参数（仅搜索条件；后端用 params.xxx 取值，由框架平铺注入 page.params）
    buildTokenPlanQueryParams () {
      const form = this.searchFormTokenPlan || {}
      const params = {
        orderNo: form.orderId || undefined,
        tokenplanOrderType: form.orderType || undefined,
        tokenplanLevel: form.level || undefined,
        tokenplanBillingCycle: form.billingType || undefined,
        status: form.status || undefined,
        tokenplanStatus: form.tokenplanStatus || undefined
      }
      // 下单时间范围
      if (form.dateRange && form.dateRange.length === 2 && form.dateRange[0] && form.dateRange[1]) {
        params.startTime = this.formatDate(form.dateRange[0])
        params.endTime = this.formatDate(form.dateRange[1])
      }
      return params
    },

    // 加载当前用户的 Token Plan 订单列表（分页 + 服务端搜索，接口 tokenPlanService/myTokenPlanOrderList）
    // 返回结构为 Page：{ results: [...], totalRecord: N, ... }
    async loadTokenPlanOrders (pageNo) {
      this.loading = true;
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/myTokenPlanOrderList',
          method: 'post',
          data: {
            pageNumber: pageNo || this.pageNo,
            pageSize: this.pageSize,
            // 搜索条件与分页字段平级（不嵌套 params），框架会将其收进 page.params
            ...this.buildTokenPlanQueryParams()
          }
        });

        const resp = { data: res };
        if (resp.data.errcode === 0) {
          const pageData = resp.data.data || {}
          const list = Array.isArray(pageData.results) ? pageData.results : [];
          // 列表中保留后端原始 value（订单类型/计费方式/套餐档位/状态），渲染时通过字典/状态列表转 label
          // 接口返回字段为驼峰（后端 Bean：TokenPlanOrderBean）
          this.tableDataTokenPlan = list.map(item => ({
            orderNo: item.tokenplanOrderNo || '-',
            orderType: item.tokenplanOrderType || '',
            billingType: item.tokenplanBillingCycle || '',
            tokenplanLevel: item.tokenplanLevel || '',
            effectiveTime: item.tokenplanEffectiveTime || '',
            expirationTime: item.tokenplanExpirationTime || '',
            remainingDays: item.remainingDays,
            effectiveDays: item.tokenplanEffectiveDays,
            status: item.status || '',
            tokenplanStatus: item.tokenplanStatus !== undefined && item.tokenplanStatus !== null ? String(item.tokenplanStatus) : '',
            createTime: item.createTime || '',
            _rawData: item
          }));
          this.total = pageData.totalRecord || 0;
        } else if (resp.data.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.$Message.error(resp.data.errmsg || '获取 Token Plan 订单列表失败');
        }
      } catch (error) {
        console.error('获取 Token Plan 订单列表失败:', error);
        this.$Message.error('获取 Token Plan 订单列表失败');
      } finally {
        this.loading = false;
      }
    },

    // 加载 Token Plan 字典（订单类型 / 计费方式 / 套餐档位）
    async fetchTokenPlanDicts () {
      const tasks = [
        this.fetchOneDict('tokenplan_order_type', 'orderType'),
        this.fetchOneDict('tokenplan_billing_cycle', 'billingCycle'),
        this.fetchOneDict('tokenplan_level', 'level'),
        this.fetchOrderStatusDict(),
        this.fetchEffectiveStatusDict()
      ];
      await Promise.all(tasks);
    },
    // 获取订单状态字典：order_status
    async fetchOrderStatusDict () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/as/sc/dict/getDictInfoList',
          method: 'post',
          data: { type: 'order_status' }
        })
        if (res.errcode === 0 && Array.isArray(res.data)) {
          this.tokenPlanStatusList = res.data
        }
      } catch (e) {
        console.error('获取订单状态字典失败:', e)
      }
    },
    // 获取生效状态字典（如果字典中有就用字典，否则用默认值）
    async fetchEffectiveStatusDict () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/as/sc/dict/getDictInfoList',
          method: 'post',
          data: { type: 'tokenplan_effective_status' }
        })
        if (res.errcode === 0 && Array.isArray(res.data) && res.data.length > 0) {
          this.tokenPlanEffectiveStatusList = res.data
        }
      } catch (e) {
        console.error('获取生效状态字典失败:', e)
      }
    },
    async fetchOneDict (type, key) {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/as/sc/dict/getDictInfoList',
          method: 'post',
          data: { type }
        })
        if (res.errcode === 0 && Array.isArray(res.data)) {
          this.$set(this.tokenPlanDict, key, res.data)
        } else {
          this.$set(this.tokenPlanDict, key, [])
        }
      } catch (e) {
        console.error('获取 Token Plan 字典失败:', type, e)
        this.$set(this.tokenPlanDict, key, [])
      }
    },

    handleTokenPlanPageChange (page) {
      this.pageNo = page;
      this.loadTokenPlanOrders(page);
    },
    handleTokenPlanPageSizeChange (pageSize) {
      this.pageSize = pageSize;
      this.pageNo = 1;
      this.loadTokenPlanOrders(1);
    },

    // Token Plan 搜索：把搜索条件发给后端分页查询（不再前端过滤）
    filterTokenPlanOrders () {
      this.pageNo = 1;
      this.loadTokenPlanOrders(1);
    },

    // Token Plan 状态写死映射：value -> 中文 label
    getTokenPlanStatusLabel (status) {
      if (status === '' || status === null || status === undefined) return '-';
      const item = (this.tokenPlanStatusList || []).find(d => d.value === status);
      return item ? item.label : status;
    },

    // Token Plan 生效状态标签：0=生效，1=失效
    getEffectiveStatusLabel (status) {
      if (status === '' || status === null || status === undefined) return '-';
      const item = (this.tokenPlanEffectiveStatusList || []).find(d => d.value === status);
      return item ? item.label : status;
    },

    // Token Plan 生效状态样式类：生效=绿色，失效=灰色
    getEffectiveStatusClass (status) {
      if (status === '0') return 'effective';
      if (status === '1') return 'expired';
      return '';
    },

    // 优先用字典 label 渲染，字典缺失时回退到内置映射（orderType / billingCycle / level）
    getTokenPlanLabel (key, value) {
      if (value === '' || value === null || value === undefined) return '-';
      // 1. 字典（若已加载且有该项）
      const dictList = this.tokenPlanDict && this.tokenPlanDict[key]
      if (Array.isArray(dictList)) {
        const item = dictList.find(d => d.value === value)
        if (item && item.label !== undefined && item.label !== null) return item.label
      }
      // 2. 内置映射兜底
      const map = this.tokenPlanLabelMap && this.tokenPlanLabelMap[key]
      return (map && map[value]) || value
    },

    // 从字典里取 label，找不到则原样返回 value
    getDictLabel (list, value) {
      if (value === '' || value === null || value === undefined) return '-';
      const item = (list || []).find(d => d.value === value);
      return item ? item.label : value;
    },

    handlePageChange (page) {
      this.pageNo = page;
      // 前端分页
      const start = (page - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.tableData = this.allOrders.slice(start, end);
    },
    handlePageSizeChange (pageSize) {
      this.pageSize = pageSize;
      this.pageNo = 1;
      const start = 0;
      const end = this.pageSize;
      this.tableData = this.allOrders.slice(start, end);
    },

    // 打开订单详情弹框 - 实例 Tab（同时异步加载订单级实例详情用于服务器配置/网络配置/数据盘区块）
    async handleDetailInstance (row) {
      this.detailRowInstance = row
      this.detailInstanceInfo = null
      this.detailInstanceLoading = false
      this.detailModalInstance = true
      // 仅当 row 有订单ID时才请求详情（无订单ID时静默降级，弹框只显示原有基础/金额区块）
      const orderId = row && (row.id || row.orderId)
      if (!orderId) return
      this.detailInstanceLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/orderService/getOrderInstanceDetail',
          method: 'post',
          data: { id: orderId }
        })
        if (res && res.errcode === 0 && res.data) {
          this.detailInstanceInfo = res.data
        }
      } catch (e) {
        console.error('加载订单实例详情失败：', e)
        this.$Message.error(e.errmsg || e.message || '加载订单实例详情失败')
      } finally {
        this.detailInstanceLoading = false
      }
    },

    // 关闭订单详情弹框 - 实例 Tab
    handleDetailInstanceCancel () {
      this.detailModalInstance = false
      this.detailRowInstance = null
      this.detailInstanceInfo = null
      this.detailInstanceLoading = false
    },

    // 打开订单详情弹框 - 裸金属 Tab
    handleDetailBareMetal (row) {
      this.detailRowBareMetal = row
      this.detailModalBareMetal = true
    },

    // 关闭订单详情弹框 - 裸金属 Tab
    handleDetailBareMetalCancel () {
      this.detailModalBareMetal = false
      this.detailRowBareMetal = null
    },

    // 打开订单详情弹框 - Token Plan Tab
    handleDetailTokenPlan (row) {
      this.detailRowTokenPlan = row
      this.detailModalTokenPlan = true
    },

    // 关闭订单详情弹框 - Token Plan Tab
    handleDetailTokenPlanCancel () {
      this.detailModalTokenPlan = false
      this.detailRowTokenPlan = null
    },

    // Token Plan 订单 - 支付（待支付订单弹出微信扫码）
    async handlePayTokenPlan (row) {
      if (!row || row.status !== 'pending') return
      this.currentPayRow = row
      this.tplQrCodeUrl = ''
      this.tplThirdPartyAmount = ''
      this.tplPayModalVisible = true
      this.tplPayModalLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/tokenPlanService/getPayOrderQrCode',
          method: 'post',
          data: {
            tokenplanOrderNo: row.orderNo
          }
        })
        if (res.errcode === 0 && res.data) {
          const qrCodeUrl = res.data.qrCodeUrl || res.data.codeUrl || res.data.qrCode || res.data
          this.tplQrCodeUrl = qrCodeUrl
          // 保存微信需支付金额（兼容驼峰和下划线）
          this.tplThirdPartyAmount = res.data.thirdPartyAmount || res.data.third_party_amount || ''
          this.tplPayModalLoading = false
          // 使用 qrcode 包渲染二维码到 canvas
          this.$nextTick(() => {
            const canvas = this.$refs.tplQrCanvas
            if (canvas && this.tplQrCodeUrl && this.$QRCode) {
              this.$QRCode.toCanvas(canvas, this.tplQrCodeUrl, {
                width: 200,
                margin: 1,
                color: { dark: '#000000', light: '#ffffff' }
              }, (err) => {
                if (err) console.error('二维码生成失败：', err)
              })
            }
          })
          // 开始轮询支付状态
          this.startTplPaymentPolling(row.orderNo)
          // 启动支付倒计时（基于下单时间 15 分钟）
          this.startTplCountdown(row.createTime)
        } else {
          this.tplPayModalLoading = false
          this.$Message.error(res.errmsg || '获取支付二维码失败')
          this.tplPayModalVisible = false
        }
      } catch (error) {
        this.tplPayModalLoading = false
        this.$Message.error(error.message || '获取支付二维码失败')
        this.tplPayModalVisible = false
      }
    },
    // Token Plan 支付弹窗取消
    handleTplPayModalCancel () {
      this.stopTplPaymentPolling()
      this.stopTplCountdown()
      this.tplPayModalVisible = false
      this.tplQrCodeUrl = ''
      this.tplThirdPartyAmount = ''
      this.currentPayRow = null
    },
    /**
     * Token Plan 轮询支付状态：每 3 秒调一次 getOrderPaymentStatus
     * status === 'paid' 视为支付成功
     */
    startTplPaymentPolling (orderNo) {
      this.stopTplPaymentPolling()
      this.tplIsPolling = true
      this.tplPollingCount = 0
      this.tplPollingTimer = setInterval(async () => {
        this.tplPollingCount++
        if (this.tplPollingCount > this.tplMaxPollingCount) {
          this.stopTplPaymentPolling()
          this.stopTplCountdown()
          this.$Message.warning('支付超时，请重新发起支付')
          this.tplPayModalVisible = false
          this.tplQrCodeUrl = ''
          this.tplThirdPartyAmount = ''
          this.currentPayRow = null
          return
        }
        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/tokenPlanService/getTokenPlanOrderInfo',
            method: 'post',
            data: { tokenplanOrderNo: orderNo }
          })
          // getTokenPlanOrderInfo 返回订单信息，status/paymentStatus === 'paid' 表示支付成功（兼容驼峰和下划线）
          const orderData = res && res.data
          const payStatus = orderData && (orderData.status || orderData.paymentStatus)
          if (res && res.errcode === 0 && orderData && payStatus === 'paid') {
            this.stopTplPaymentPolling()
            this.stopTplCountdown()
            this.tplPayModalVisible = false
            this.tplQrCodeUrl = ''
            this.tplThirdPartyAmount = ''
            this.currentPayRow = null
            this.$Message.success('支付成功')
            // 刷新订单列表
            this.loadTokenPlanOrders()
          }
        } catch (e) {
          console.error('[TokenPlan] 轮询支付状态失败:', e)
        }
      }, this.tplPollingInterval)
    },
    stopTplPaymentPolling () {
      if (this.tplPollingTimer) {
        clearInterval(this.tplPollingTimer)
        this.tplPollingTimer = null
      }
      this.tplIsPolling = false
    },
    /**
     * 启动 Token Plan 支付倒计时（基于订单下单时间 + 15分钟）
     * @param {string} createTime 下单时间字符串，如 "2026-08-13 18:19:36"
     */
    startTplCountdown (createTime) {
      this.stopTplCountdown()
      const PAY_TIMEOUT_MINUTES = 15
      const deadline = new Date(createTime.replace(/-/g, '/')).getTime() + PAY_TIMEOUT_MINUTES * 60 * 1000
      const tick = () => {
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((deadline - now) / 1000))
        this.tplRemainingSeconds = remaining
        if (remaining <= 0) {
          this.tplCountdownText = '0分00秒'
          this.stopTplCountdown()
          this.stopTplPaymentPolling()
          this.tplPayModalVisible = false
          this.tplQrCodeUrl = ''
          this.tplThirdPartyAmount = ''
          this.currentPayRow = null
          this.$Message.warning('支付超时，二维码已失效，请重新发起支付')
          this.loadTokenPlanOrders()
          return
        }
        const min = Math.floor(remaining / 60)
        const sec = remaining % 60
        this.tplCountdownText = `${min}分${String(sec).padStart(2, '0')}秒`
      }
      tick()
      this.tplCountdownTimer = setInterval(tick, 1000)
    },
    stopTplCountdown () {
      if (this.tplCountdownTimer) {
        clearInterval(this.tplCountdownTimer)
        this.tplCountdownTimer = null
      }
      this.tplRemainingSeconds = 0
      this.tplCountdownText = ''
    },

    // Token Plan 订单 - 取消（仅 pending 才允许点击）
    async handleCancelTokenPlan (row) {
      if (!row || row.status !== 'pending') return
      this.$Modal.confirm({
        title: '确认取消订单',
        content: `确定要取消订单 ${row.tokenplanOrderNo || row.orderNo} 吗？`,
        loading: true,
        onOk: async () => {
          try {
            const res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/tokenPlanService/createCancelTokenPlanOrder',
              method: 'post',
              data: {
                tokenplanOrderNo: row.orderNo
              }
            })
            if (res.errcode === 0) {
              this.$Modal.remove()
              this.$Message.success('订单取消成功')
              this.loadTokenPlanOrders()
            } else {
              this.$Modal.remove()
              this.$Message.error(res.errmsg || '订单取消失败')
            }
          } catch (error) {
            this.$Modal.remove()
            this.$Message.error(error.message || '订单取消失败')
          }
        },
        onCancel: () => {
          this.$Message.info('已取消操作')
        }
      })
    },

    // 格式化 JSON 字符串以便在详情弹框中展示
    formatJson (jsonStr) {
      if (!jsonStr) return ''
      try {
        if (typeof jsonStr === 'string') {
          return JSON.stringify(JSON.parse(jsonStr), null, 2)
        }
        return JSON.stringify(jsonStr, null, 2)
      } catch (e) {
        return String(jsonStr)
      }
    },

    async handlePay (row) {
      // 先查询用户认证状态
      try {
        const authRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        });

        if (!authRes.data || authRes.data.authStatus !== 'PASSED') {
          this.$Message.error({
            content: '需要认证后才能进行支付',
            duration: 5
          });
          this.$router.push('/shenbeigpuai/control/auth-apply');
          return;
        }
      } catch (e) {
        console.error('查询认证状态失败:', e);
        this.$Message.error('查询认证状态失败');
        return;
      }
      this.currentRow = row
      this.testOrderQrCodeUrl = ''
      this.testOrderId = ''

      // 如果需要微信支付（第三方金额大于0）或者是充值订单，获取测试二维码
      if (row.thirdPartyAmount > 0 || row.orderType === '充值') {
        try {
          let qrUrl = ''
          // 充值订单和实例购买使用不同的二维码接口
          if (row.orderType === '充值') {
            const qrRes = await this.$hdAxios.request({
              // url: '/api/ac/shenbeigpuai/rechargeOrderService/createRechargeOrder',
              // method: 'post',
              // data: {
              //   amount: parseFloat(row.totalAmount),
              //   paymentMethod: 'wechat'
              // }
              url: '/api/ac/shenbeigpuai/rechargeOrderService/createTestOrderQrCode',
              method: 'post',
              data: {
                orderId: row.id
              }
            })
            if (qrRes.errcode === 0 && qrRes.data) {
              // qrUrl = qrRes.data.qrCode
              qrUrl = qrRes.data.qrCodeUrl
            }
          } else {
            const qrRes = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/rechargeOrderService/createTestOrderQrCode',
              method: 'post',
              data: {
                orderId: row.id
              }
            })
            if (qrRes.errcode === 0 && qrRes.data) {
              qrUrl = qrRes.data.qrCodeUrl
            }
          }
          if (qrUrl) {
            this.testOrderQrCodeUrl = qrUrl
            this.testOrderId = row.id
            this.testOrderNo = row.orderNo
            // 使用前端 qrcode 包渲染二维码到 canvas
            this.$nextTick(() => {
              const canvas = this.$refs.qrCanvas
              if (canvas && this.testOrderQrCodeUrl) {
                this.$QRCode.toCanvas(canvas, this.testOrderQrCodeUrl, {
                  width: 150,
                  margin: 1,
                  color: { dark: '#000000', light: '#ffffff' },
                  errorCorrectionLevel: 'H'
                }, (err) => {
                  if (err) console.error('二维码生成失败：', err)
                })
              }
            })
            // 开始轮询支付状态
            this.startPaymentPolling()
          }
        } catch (e) {
          console.error('获取二维码失败:', e)
          this.testOrderQrCodeUrl = ''
        }
      }

      // 显示支付确认弹框
      this.payModalVisible = true
    },

    // 处理支付确认弹框取消
    handlePayModalCancel () {
      this.payModalVisible = false
      this.stopPaymentPolling()
      this.currentRow = null
    },

    // 处理支付确认
    async handlePayConfirm () {
      if (!this.currentRow) return
      this.payModalLoading = true
      await this.confirmPayment(this.currentRow)
      this.payModalLoading = false
    },
    // 开始轮询支付状态
    startPaymentPolling () {
      this.isPolling = true
      this.pollingCount = 0

      this.pollingTimer = setInterval(async () => {
        this.pollingCount++

        // 检查是否超过最大轮询次数
        if (this.pollingCount > this.maxPollingCount) {
          this.stopPaymentPolling()
          this.$Message.warning('支付超时，请重新发起支付')
          return
        }

        try {
          let res
          // 充值订单和实例购买使用不同的轮询接口
          if (this.currentRow && this.currentRow.orderType === '充值') {
            res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/rechargeOrderService/getPaymentStatus',
              method: 'post',
              data: {
                orderNo: this.testOrderNo
              }
            })
          } else {
            res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/orderService/getOrderPaymentStatus',
              method: 'post',
              data: {
                orderId: this.testOrderId
              }
            })
          }
          // 测试用
          // res = {
          //   errcode: 0,
          //   data: {
          //     status: 'paid',
          //     paymentStatus: 'paid'
          //   }
          // }
          if (res.errcode === 0 && res.data) {
            let paymentStatus = res.data.status
            if (this.currentRow && this.currentRow.orderType === '充值') {
              paymentStatus = res.data.paymentStatus
            }

            // 支付成功
            if (paymentStatus === 'paid') {
              this.stopPaymentPolling()
              this.isPaySuccess = true
              // // 充值订单跳转到充值中心，实例购买跳转到实例列表
              // if (this.currentRow && this.currentRow.orderType === '充值') {
              //   this.$Message.success('充值成功！')
              //   setTimeout(() => {
              //     this.$router.push('/shenbeigpuai/control/recharge-center')
              //   }, 1000)
              // } else {
              //   this.$Message.success('扫码支付成功！')
              //   setTimeout(() => {
              //     this.$router.push('/shenbeigpuai/control/instance-list')
              //   }, 1000)
              // }
              
              // 仅"新购订单（有实例名）"展示下单后动画：续费 / 充值 / 字典关闭 都直接跳转
              const isNewPurchaseWithInstance = this.currentRow
                && this.currentRow.orderType !== '充值'
                && this.currentRow.instanceName === '-'
              if (this.postOrderModalEnabled && isNewPurchaseWithInstance) {
                this.showPostOrderSuccessModal(this.testOrderId)
              } else {
                this.$Message.success('扫码支付成功！')
                this.goToInstanceList()
              }
            }
          }
        } catch (error) {
          console.error('轮询支付状态失败', error)
        }
      }, this.pollingInterval)
    },
    // 停止轮询支付状态
    stopPaymentPolling () {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
      this.isPolling = false
      this.payModalVisible = false
    },

    // ============ 下单后弹框（参考 instance-buy，扫码支付成功后展示动画） ============
    // 获取下单后弹框开关字典（order_post_modal_switch，VALUE=1 开启）
    async fetchPostOrderModalSwitch () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/as/sc/dict/getDictInfoList',
          method: 'post',
          data: { type: 'order_post_modal_switch' }
        })
        const resp = { data: res }
        const list = (resp.data && resp.data.data) || []
        // 取 VALUE === '1' 视为开启；未配置则视为关闭
        this.postOrderModalEnabled = list.some(item => String(item.value) === '1')
      } catch (e) {
        console.error('[order-list] 获取下单后弹框开关字典失败:', e)
        this.postOrderModalEnabled = false
      }
    },
    // 准备弹框内的动画 HTML（同源相对路径，与 instance-buy 共用 buyAnimation.html）
    async preparePostOrderIframe () {
      try {
        const res = await fetch('./file/shenbeigpuai/html/buyAnimation.html', { credentials: 'same-origin' })
        if (res.ok) {
          this.postOrderIframeSrcdoc = await res.text()
        } else {
          console.error('[order-list] 读取 buyAnimation.html 失败:', res.status)
        }
      } catch (e) {
        console.error('[order-list] 读取 buyAnimation.html 异常:', e)
      }
    },
    // 显示下单后弹框：不可关闭；10s 倒计时 + 轮询 instance_init，instance_init==1 后才显示跳转按钮
    showPostOrderSuccessModal (orderId) {
      // 每次重新打开弹框时，先关闭 v-if 让 iframe 节点销毁并重建，
      // 这样嵌入的 CSS / JS 动画每次都从 0 开始播放
      this.postOrderModalVisible = false
      this.instanceCreated = false
      this.stopPollingInstanceInit()
      this.pollingOrderId = orderId || ''
      this.$nextTick(() => {
        this.postOrderModalVisible = true
        this.postOrderCountdown = 10
        this.clearPostOrderCountdown()
        this.postOrderCountdownTimer = setInterval(() => {
          if (this.postOrderCountdown <= 1) {
            this.postOrderCountdown = 0
            this.clearPostOrderCountdown()
          } else {
            this.postOrderCountdown -= 1
          }
        }, 1000)
        // 启动轮询 instance_init
        if (this.pollingOrderId) {
          this.startPollingInstanceInit()
        }
      })
    },
    // 启动轮询：每 2 秒查一次订单的 instance_init
    startPollingInstanceInit () {
      this.stopPollingInstanceInit()
      let count = 0
      const tick = async () => {
        count++
        try {
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/orderService/getOrderInstanceInit',
            method: 'get',
            params: { id: this.pollingOrderId }
          })
          const resp = res && res.data !== undefined ? res : (res && res.data)
          const body = (resp && resp.data !== undefined) ? resp : res
          if (body && (body.errcode === 0 || body.errcode === undefined)) {
            const initVal = body.data
            if (initVal !== undefined && initVal !== null && String(initVal) === '1') {
              // 实例已创建完成
              this.instanceCreated = true
              this.stopPollingInstanceInit()
              return
            }
          }
        } catch (e) {
          console.error('[order-list] 轮询 instance_init 异常:', e)
        }
        // 兜底：超过最大次数后强制显示按钮，避免接口异常时按钮永远不出来
        if (count >= this.pollingMaxCount) {
          console.warn('[order-list] 轮询 instance_init 超过最大次数，强制显示跳转按钮')
          this.instanceCreated = true
          this.stopPollingInstanceInit()
          return
        }
        this.pollingTimer = setTimeout(tick, 2000)
      }
      this.pollingTimer = setTimeout(tick, 0)
    },
    // 停止轮询 instance_init
    stopPollingInstanceInit () {
      if (this.pollingTimer) {
        clearTimeout(this.pollingTimer)
        this.pollingTimer = null
      }
    },
    // 清理倒计时定时器
    clearPostOrderCountdown () {
      if (this.postOrderCountdownTimer) {
        clearInterval(this.postOrderCountdownTimer)
        this.postOrderCountdownTimer = null
      }
    },
    // 跳转到实例列表页（弹框按钮回调）：根据 currentRow.orderType 决定跳哪
    goToInstanceList () {
      this.clearPostOrderCountdown()
      this.stopPollingInstanceInit()
      this.postOrderModalVisible = false
      // 充值订单跳充值中心；其它（实例购买/裸金属）跳实例列表
      if (this.currentRow && this.currentRow.orderType === '充值') {
        this.$router.push('/shenbeigpuai/control/recharge-center')
      } else {
        this.$router.push('/shenbeigpuai/control/instance-list')
      }
    },
    // // 开始轮询支付状态
    // startPaymentPolling() {
    //   this.isPolling = true
    //   this.pollingCount = 0

    //   this.pollingTimer = setInterval(async () => {
    //     this.pollingCount++

    //     // 检查是否超过最大轮询次数
    //     if (this.pollingCount > this.maxPollingCount) {
    //       this.stopPaymentPolling()
    //       this.$Message.warning('支付超时，请重新发起支付')
    //       return
    //     }

    //     try {
    //       const res = await this.$hdAxios.request({
    //         url: '/api/ac/shenbeigpuai/orderService/getOrderPaymentStatus',
    //         method: 'post',
    //         data: {
    //           orderId: this.testOrderId
    //         }
    //       })

    //       if (res.errcode === 0 && res.data) {
    //         const paymentStatus = res.data.status
    //         // 支付成功
    //         if (paymentStatus === 'paid') {
    //           this.stopPaymentPolling()
    //           this.$Message.success('扫码支付成功！正在自动确认...')
    //           // 自动执行确认操作
    //           if (this.currentRow) {
    //             await this.confirmPayment(this.currentRow)
    //           }
    //         }
    //       }
    //     } catch (error) {
    //       console.error('轮询支付状态失败', error)
    //     }
    //   }, this.pollingInterval)
    // },

    // // 停止轮询支付状态
    // stopPaymentPolling() {
    //   if (this.pollingTimer) {
    //     clearInterval(this.pollingTimer)
    //     this.pollingTimer = null
    //   }
    //   this.isPolling = false
    // },

    // 确认支付
    async confirmPayment (row) {
      this.paying = true;

      try {
        // 1. 获取订单创建实例所需参数
        const paramsRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/orderService/getOrderInstanceParams',
          method: 'post',
          data: {
            id: row.id
          }
        });

        if (paramsRes.errcode !== 0) {
          this.$Message.error(paramsRes.errmsg || '获取订单参数失败');
          this.paying = false;
          return;
        }

        const params = paramsRes.data;
        // 1. 先调用接口检查是否有可用物理机（传入购买数量）
        this.selectedPhysicalId = ''
        const quantity = row.paramJson.quantity
        try {
          const physicalRes = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/resourceAllocationService/findAvailablePhysicalMachine',
            method: 'post',
            data: {
              skuId: row.paramJson.skuId,
              quantity: quantity
            }
          })
          if (physicalRes.errcode === 0 && physicalRes.data) {
            this.selectedPhysicalId = physicalRes.data.physicalId || ''
            if (!this.selectedPhysicalId) {
              this.paying = false
              this.$Message.error('暂无可用物理机，资源不足')
              return
            }
            // 检查返回的可创建数量是否满足需求
            const availableQuantity = physicalRes.data.availableQuantity || 1
            if (availableQuantity < quantity) {
              this.paying = false
              this.$Message.error(`资源不足，当前物理机只能创建 ${availableQuantity} 个实例，您需要创建 ${quantity} 个`)
              return
            }
          } else {
            this.paying = false
            this.$Message.error(physicalRes.message || '查询可用物理机失败')
            return
          }
        } catch (physicalError) {
          this.paying = false
          this.$Message.error('查询可用物理机失败：' + (physicalError.message || '未知错误'))
          return
        }
        this.$Message.error('需求不确定，流程先暂停')
        return
        // 2. 创建实例
        const createRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/createInstance',
          method: 'post',
          data: {
            orderId: row.id,
            name: this.selectedPhysicalId
          }
        });

        if (!createRes.data.vmidList || createRes.data.vmidList.length === 0) {
          this.$Message.error(createRes.errmsg || '创建实例失败');
          this.paying = false;
          return;
        }

        const vmidList = createRes.data.vmidList;

        // 3. 确认订单支付
        const payRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/orderService/updateConfirmOrderPayment',
          method: 'post',
          data: {
            orderId: row.id,
            orderPaymentId: row.orderPaymentId,
            productConfigId: params.productConfigId || params.skuId,
            vmidList: vmidList,
            physicalId: row.paramJson.physicalId,
            vnetId: row.paramJson.vnetId,
            subnetId: row.paramJson.subnetId
          }
        });

        if (payRes.errcode === 0) {
          this.$Message.success('支付成功');
          // 关闭弹框
          this.payModalVisible = false
          this.currentRow = null
          // 重新加载订单列表
          this.loadData();
        } else {
          this.$Message.error(payRes.errmsg || '支付失败');
        }
      } catch (e) {
        console.error('支付异常:', e);
        this.$Message.error('支付失败，请稍后重试');
      } finally {
        this.paying = false;
      }
    },

    // 解析内存大小（GB）
    parseMemoryGB (memoryConfig) {
      if (!memoryConfig) return null;
      const match = memoryConfig.match(/(\d+)\s*GB/i);
      return match ? parseInt(match[1]) : null;
    },

    async handleCancel (row) {
      this.$Modal.confirm({
        title: '确认取消订单',
        content: `确定要取消订单 ${row.orderNo} 吗？`,
        loading: true,
        onOk: async () => {
          try {
            await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/orderService/deleteOrder',
              method: 'post',
              data: {
                id: row.id
              }
            });
            this.$Modal.remove();
            this.$Message.success('订单取消成功');
            this.loadData();
          } catch (error) {
            this.$Modal.remove();
            this.$Message.error(error.message || '订单取消失败');
          }
        },
        onCancel: () => {
          this.$Message.info('已取消操作');
        }
      });
    },

    getStatusText (status) {
      const statusMap = {
        '待支付': '待支付',
        'pending': '待支付',
        '部分支付': '部分支付',
        '已支付': '已支付',
        'paid': '已支付',
        'completed': '已支付',
        '已完成': '已完成',
        '已取消': '已取消',
        '退款中': '退款中',
        'refunding': '退款中',
        '部分退款': '部分退款',
        'refunded': '已退款',
        '失败': '失败'
      };
      return statusMap[status] || status;
    },

    getOrderTypeText (orderType) {
      const orderTypeMap = {
        'recharge': '充值',
        'instance_purchase': '实例购买',
        'hourly_billing': '关机/整点计费',
        'renew': '实例续费',
        // 'upgrade': '升级',
        // 'downgrade': '降级',
        // '新购': '新购',
        // '续费': '续费',
        // '升级': '升级',
        // '降级': '降级'
      };
      return orderTypeMap[orderType] || orderType || '-';
    },

    formatAmount (amount) {
      if (amount === null || amount === undefined || amount === '') {
        return '0.00';
      }
      // 如果是数字，格式化为两位小数
      const num = parseFloat(amount);
      if (isNaN(num)) {
        return '0.00';
      }
      return num.toFixed(2);
    },

    formatDate (date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
}
</script>

<style lang="less" scoped>
.order-list {
  padding: 16px;
  background: #f5f7f9;
  min-height: 100vh;

  // 主白色卡片：包住工具栏 + 表格 + 分页（与 instance-buy 的 Card 风格保持一致）
  &__panel {
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }

  &__breadcrumb {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__tabs {
    margin-bottom: 16px;

    /deep/ .ivu-tabs-nav-container {
      font-size: 14px;
    }
  }

  &__filter {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 12px;

    .filter-item {
      /deep/ .ivu-input {
        border-radius: 2px;
      }

      // 下拉/输入 13px（iView 默认 14px）
      /deep/ .ivu-select-placeholder,
      /deep/ .ivu-select-selected-value,
      /deep/ .ivu-select-input,
      /deep/ .ivu-select-selection,
      /deep/ .ivu-input {
        font-size: 13px !important;
      }
    }

    .search-btn {
      background: #4a7afb;
      border-color: #4a7afb;
      padding: 0 24px;
      border-radius: 2px;
      font-size: 13px;
    }

    .search-btn1 {
      font-size: 13px;
    }
  }

  &__content {
    .custom-table {
      /deep/ .ivu-table {
        font-size: 12px;
        color: #000000;
      }

      /deep/ .ivu-table-header thead tr th {
        background-color: #f2f5f9;
        // color: #666;
        color: #000000;
        font-weight: bold;
        font-size: 13px;
        // height: 44px;
        border-bottom: none;
        text-align: center;
      }

      /deep/ .ivu-table-td {
        font-size: 12px;
        color: #333;
        text-align: center;
      }

      /deep/ .ivu-table-cell {
        text-align: center;
      }

      /deep/ .ivu-table-cell>span {
        display: inline-block;
      }

      .status-link {
        color: #2d8cf0;
        cursor: default;
      }

      .status-tag {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &.pending,
        &.待支付 {
          background: #fff7e6;
          color: #fa8c16;
        }

        &.部分支付 {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.已支付,
        &.completed,
        &.paid,
        &.已完成 {
          background: #f6ffed;
          color: #52c41a;
        }

        &.已取消,
        &.cancelled {
          background: #f5f5f5;
          color: #999;
        }

        &.已退款,
        &.refunded,
        &.refunding,
        &.部分退款 {
          background: #fff1f0;
          color: #ff4d4f;
        }

        &.已退款 {
          background: #f5f5f5;
          color: #999;
        }

        &.失败 {
          background: #fff1f0;
          color: #ff4d4f;
        }

        &.effective {
          background: #f6ffed;
          color: #52c41a;
        }

        &.expired {
          background: #f5f5f5;
          color: #999;
        }
      }

      .amount-text {
        font-weight: 600;
        color: #333;
      }

      .action-btns {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;

        .action-link {
          color: #2d8cf0;
          font-size: 12px;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }

          &.cancel {
            color: #2d8cf0;
          }

          // 设计图中也是蓝色的
        }
      }
    }
  }

  &__page {
    margin-top: 24px;
    text-align: right;
  }
}

// 下单后弹框（参考 instance-buy）：让 body 居中、内嵌动画 iframe 自适应
.order-list__post-order-modal {
  /deep/ .ivu-modal {
    width: 520px !important;
    top: 50%;
    transform: translateY(-50%);
  }

  /deep/ .ivu-modal-body {
    padding: 16px 20px 20px;
  }
}

// 订单详情弹框（样式参考 instance-list 中实例详情弹框）
// 注：Modal 通过 transfer 渲染到 body，scoped 选择器无法直接命中内部 DOM，
// 这里通过 /deep/ 穿透让样式生效（与 instance-list 实现保持一致）。
.order-detail-modal {
  /deep/ .order-detail-modal__header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #1f2937;

    .order-detail-modal__icon {
      font-size: 18px;
      color: #4079ff;
      margin-right: 8px;
    }
  }

  // 让 Modal body 内容更紧凑
  /deep/ .ivu-modal-body {
    padding: 20px 28px 28px;
  }

  /deep/ .detail-content {
    .detail-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 14px;
        letter-spacing: 0.5px;

        .section-title__bar {
          display: inline-block;
          width: 3px;
          height: 14px;
          background: linear-gradient(180deg, #4079ff 0%, #2b5fd9 100%);
          border-radius: 2px;
          margin-right: 8px;
        }
      }

      .detail-grid-self {
        background: #fafbfc;
        border: 1px solid #eef0f4;
        border-radius: 6px;
        padding: 14px 18px;
      }

      .detail-item {
        display: flex;
        align-items: center;
        font-size: 13px;
        line-height: 28px;
        min-width: 0;

        &--full {
          flex-direction: column;
          align-items: stretch;

          .label {
            margin-bottom: 6px;
          }
        }

        .label {
          color: #6b7280;
          min-width: 88px;
          margin-right: 8px;
          font-weight: 400;
          flex-shrink: 0;
        }

        .value {
          color: #1f2937;
          font-weight: 500;
          word-break: break-all;
        }

        .status-tag {
          display: inline-block;
          // padding: 4px 12px;
          // border-radius: 12px;
          font-size: 12px;
          font-weight: 500;

          &.pending,
          &.待支付 {
            // background: #fff7e6;
            color: #fa8c16;
          }

          &.已支付,
          &.completed,
          &.paid,
          &.已完成 {
            // background: #f6ffed;
            color: #52c41a;
          }

          &.已取消,
          &.cancelled {
            // background: #f5f5f5;
            color: #999;
          }

          &.已退款,
          &.refunded {
            // background: #f5f5f5;
            color: #ff4d4f;
          }

          &.退款中,
          &.refunding,
          &.部分退款 {
            // background: #fff1f0;
            color: #ff4d4f;
          }

          &.失败 {
            // background: #fff1f0;
            color: #ff4d4f;
          }

          &.active {
            // background: #e6f7ff;
            color: #1890ff;
          }

          // 实例运行时状态（详情弹框-网络配置区块中展示实例状态时使用）
          &.status-running,
          &.status-运行中 {
            // background-color: #e6f7ff;
            color: #1890ff;
          }

          &.status-stopped,
          &.status-已停止,
          &.status-expired,
          &.status-已过期 {
            // background-color: #fff1f0;
            color: #ff4d4f;
          }

          &.status-shutdown,
          &.status-已关机 {
            // background-color: #f5f5f5;
            color: #999;
          }

          &.status-creating,
          &.status-创建中 {
            // background-color: #fffbe6;
            color: #faad14;
          }
        }
      }
    }
  }

  // 参数/扩展 JSON 块的样式（保留原 order-detail__json 的外观）
  /deep/ .order-detail__json {
    margin: 0;
    padding: 10px 12px;
    background: #f8f8f9;
    border-radius: 4px;
    font-size: 12px;
    line-height: 18px;
    color: #1d2129;
    font-family: Consolas, Menlo, monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>

<!-- transfer 到 body 后的浮层无法被 scoped 样式覆盖，这里单独写全局样式 -->
<style lang="less">
.tokenplan-filter-dropdown {
  min-width: 160px;
}
</style>
