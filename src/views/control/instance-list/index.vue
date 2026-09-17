<template>
  <div class="instance-list">
    <!-- 面包屑/标题 -->
    <div class="instance-list__header">
      <Breadcrumb>
        <BreadcrumbItem>实例</BreadcrumbItem>
        <BreadcrumbItem>实例列表</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 主卡片：工具栏 + 表格 + 分页 -->
    <div class="instance-list__panel">
      <!-- 工具栏 -->
      <div class="instance-list__toolbar">
        <Button style="margin-right: 10px;" icon="md-add" class="instance-list__add-btn"
          @click="handleAddInstance">租用新的实例</Button>
        <div class="instance-list__search">
          <Input v-model="searchKeywords" placeholder="搜索实例名称" class="instance-list__search-input" />
          <!-- @on-enter="handleSearch" -->
          <Select v-model="searchProductName" placeholder="全部产品" class="instance-list__search-select" clearable
            filterable>
            <!-- @on-change="handleSearch" -->
            <Option v-for="item in productNameOptions" :key="item" :value="item">{{ item }}</Option>
          </Select>
          <Select v-model="searchStatus" placeholder="全部状态" class="instance-list__search-select" clearable>
            <!-- @on-change="handleSearch" -->
            <Option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</Option>
          </Select>
          <Button type="primary" icon="md-search" class="instance-list__search-btn" @click="handleSearch">搜索</Button>
          <Button style="margin-left: 0px;font-size: 13px;" icon="md-refresh" @click="handleReset">重置</Button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="instance-list__card">
        <Table :columns="columns" :data="data" :loading="loading" size="small" width="100%">
          <!-- 实例ID/名称 -->
          <template slot-scope="{ row }" slot="instance">
            <div class="instance-list__cell-instance">
              <div class="instance_name">{{ row.instance_name }}</div>
              <div class="id">{{ row.id }}</div>
            </div>
          </template>

          <!-- 状态列 -->
          <template slot-scope="{ row }" slot="status">
            <div :class="['status-cell', {
              'status-processing': row.status === '停止中' || row.status === '开机中' || row.status === '过期中',
              'status-running': row.status === '运行中',
              'status-expired': row.status === '已过期'
            }]">
              {{ row.status }}
              <!-- 开机中 / 停止中 在文字后面追加旋转 loading 图标 -->
              <Icon v-if="row.status === '开机中' || row.status === '停止中'" type="ios-loading" class="status-cell__loading"
                size="14" />
            </div>
          </template>

          <!-- 操作列 -->
          <template slot-scope="{ row }" slot="action">
            <div class="instance-list__actions" v-if="row.status !== '退款中'">
              <div class="action-row">
                <!-- 裸金属(BM) → "终端"；虚拟机(VM) → "控制台" -->
                <a v-if="row.status === '运行中' && isBmInstance(row)" @click="handleAction('bmkvm', row)">终端</a>
                <!-- <a v-if="row.status === '运行中' && !isBmInstance(row)" @click="handleAction('console', row)">控制台</a> -->
                <a @click="handleAction('detail', row)">详情</a>
                <!-- 不好使，暂时隐藏 -->
                <!-- <a @click="handleAction('stop', row)">关机</a> -->
                <!-- 停止按钮：运行中显示可点击，停止中显示置灰，其他状态不显示 -->
                <a v-if="row.status === '运行中'" @click="handleAction('suspend', row)">停止</a>
                <a v-else-if="row.status === '停止中' || row.status === '已过期'" class="disabled-link">停止</a>
                <a v-if="row.status === '已停止' && !isBmInstance(row)"
                  @click="handleAction('resetPassword', row)">重置密码</a>
                <a v-if="row.status == '已停止'" @click="handleAction('start', row)">开机</a>
                <a v-else-if="row.status === '开机中' || row.status === '已过期'" class="disabled-link">开机</a>
                <a v-if="row.billing_type == '包月'" @click="handleAction('renew', row)">续费</a>
                <a v-if="row.billing_type == '包月' && row.status !== '已过期' && row.isRefundable == '1'"
                  :class="['danger', { 'disabled-link': row.status === '运行中' || row.status === '停止中' || row.status === '开机中' }]"
                  @click="row.status === '运行中' || row.status === '停止中' || row.status === '开机中' ? null : handleAction('refund', row)">退款</a>
                <a v-else
                  :class="['danger', { 'disabled-link': row.status === '运行中' || row.status === '停止中' || row.status === '开机中' }]"
                  @click="row.status === '运行中' || row.status === '停止中' || row.status === '开机中' ? null : handleAction('delete', row)">释放</a>
              </div>
            </div>
            <div v-else class="instance-list__actions-disabled">
              <span class="refunding-text">退款处理中</span>
            </div>
          </template>

          <!-- 最近开机时间列 -->
          <template slot-scope="{ row }" slot="lastStartTime">
            <span>{{ row.lastStartTime || '-' }}</span>
          </template>

          <!-- 总运行时间列 -->
          <template slot-scope="{ row }" slot="totalRuntime">
            <!-- 读取 this.nowTick 以让"运行中"实例的实时运行时间每秒刷新 -->
            <span>{{ formatTotalRuntime(row, nowTick) }}</span>
          </template>
        </Table>

        <div class="instance-list__pagination">
          <Page :total="total" :current="pageNo" :page-size="pageSize" :page-size-opts="[10, 20, 50]" show-sizer
            show-total @on-change="changePage" @on-page-size-change="changePageSize"></Page>
        </div>
      </div>
    </div>

    <!-- 实例详情弹框 -->
    <Modal v-model="detailModalVisible" width="1000" :footer-hide="true" class="instance-detail-modal">
      <div slot="header" class="instance-detail-modal__header">
        <Icon type="md-desktop" class="instance-detail-modal__icon" />
        <span>实例详情</span>
      </div>
      <div v-if="loadingDetail" class="detail-loading">
        <Spin size="large"></Spin>
        <p>加载中...</p>
      </div>
      <div v-else-if="instanceDetail" class="detail-content">
        <!-- 1. 基础信息 -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>基础信息</span>
          </div>
          <div class="detail-grid-self">
            <Row>
              <Col span="8">
              <div class="detail-item">
                <span class="label">实例名称</span>
                <span class="value">{{ instanceDetail.instanceName }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">实例状态</span>
                <span class="value">
                  <span class="status-tag" :class="'status-' + instanceDetail.status">
                    {{ instanceDetail.status || '--' }}
                  </span>
                </span>
              </div>
              </Col>
              <Col span="8" v-if="instanceDetail.cloudPlatform === 'VM'">
              <div class="detail-item">
                <span class="label">PVE虚拟机ID</span>
                <span class="value">{{ instanceDetail.vmid || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 10px;">
              <Col span="8">
              <div class="detail-item">
                <span class="label">计费方式</span>
                <span class="value">{{ instanceDetail.billing_type || '--' }}</span>
              </div>
              </Col>
              <Col span="16">
              <div class="detail-item detail-item--full">
                <span class="label">订单编号</span>
                <span class="value">{{ instanceDetail.orderNo || '--' }}</span>
              </div>
              </Col>
            </Row>
            <Row style="margin-top: 10px;">
              <Col span="8">
              <div class="detail-item">
                <span class="label">创建时间</span>
                <span class="value">{{ instanceDetail.createTime || '--' }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">更新时间</span>
                <span class="value">{{ instanceDetail.updateTime || '--' }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">到期时间</span>
                <span class="value">{{ instanceDetail.expireTime || '--' }}</span>
              </div>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 2. 服务器配置（CPU + GPU + 内存） -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>服务器配置</span>
          </div>
          <div class="detail-grid-self">
            <Row style="">
              <Col span="8">
              <div class="detail-item">
                <span class="label">CPU 核心数</span>
                <span class="value">{{ instanceDetail.coreCount || '--' }} 核</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">GPU 数量</span>
                <span class="value">{{ instanceDetail.gpuCount || '--' }} 个</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item detail-item--full">
                <span class="label">内存大小</span>
                <span class="value">{{ instanceDetail.memoryConfig || '--' }}</span>
              </div>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 3. 其他配置（网络 + 数据盘） -->
        <div class="detail-section">
          <div class="section-title">
            <span class="section-title__bar"></span>
            <span>网络配置</span>
          </div>
          <div class="detail-grid-self">
            <Row style="">
              <Col span="8">
              <div class="detail-item">
                <span class="label">专有网络</span>
                <span class="value">{{ instanceDetail.vnetId ? (instanceDetail.vnetName || '默认') : '默认' }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">交换机</span>
                <span class="value">{{ instanceDetail.subnetId ? (instanceDetail.subnetName || '默认') : '默认' }}</span>
              </div>
              </Col>
            </Row>
          </div>

          <div class="section-title" style="margin-top: 20px;">
            <span class="section-title__bar"></span>
            <span>远程连接</span>
          </div>
          <div class="detail-grid-self">
            <Row style="">
              <Col span="8">
              <div class="detail-item">
                <span class="label">ip</span>
                <span class="value">{{ instanceDetail.vnetIp }}</span>
              </div>
              </Col>
              <Col span="8">
              <div class="detail-item">
                <span class="label">连接命令</span>
                <span class="value">ssh root@{{ instanceDetail.vnetIp }}</span>
                <!-- 复制按钮：把 SSH 连接命令写到剪贴板（纯 JS 实现，无第三方依赖） -->
                <Button type="text" size="small" class="instance-list__copy-btn" icon="md-copy" title="复制 SSH 连接命令"
                  style="margin-left: 4px;" @click="copySshCmd">复制</Button>
              </div>
              </Col>
            </Row>
          </div>

          <!-- 数据盘表格 -->
          <div class="detail-subsection">
            <div class="section-title">
              <span class="section-title__bar"></span>
              <span>数据盘</span>
            </div>
            <div v-if="instanceDetail.dataDiskItems && instanceDetail.dataDiskItems.length > 0">
              <Table :columns="dataDiskColumns" :data="instanceDetail.dataDiskItems" size="small" border></Table>
            </div>
            <div v-else class="empty-tip">暂无数据盘</div>
          </div>
          <!-- 账号与密码（只有裸金属服务器有） -->
          <div v-if="instanceDetail.cloudPlatform === 'BM' && instanceDetail.loginUsername">
            <div class="section-title" style="margin-top: 20px;">
              <span class="section-title__bar"></span>
              <span>账号与密码</span>
            </div>
            <div class="detail-grid-self">
              <Row style="">
                <Col span="8">
                <div class="detail-item">
                  <span class="label">登录账号</span>
                  <span class="value">{{ instanceDetail.loginUsername }}</span>
                </div>
                </Col>
                <Col span="8">
                <div class="detail-item">
                  <span class="label">登录密码</span>
                  <!-- 等宽字体 + 固定宽度 + 溢出省略，确保明文/脱敏切换时宽度不变，眼睛图标位置不晃动 -->
                    <!-- font-family: Consolas, 'Courier New', monospace; -->
                  <span v-if="instanceDetail.loginPassword" class="value"
                    style="display: inline-block; width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;">{{ showPassword ? instanceDetail.loginPasswordRaw : instanceDetail.loginPassword }}</span>
                  <!-- 占位 span：固定宽度，撑住眼睛图标 -->
                  <span v-if="instanceDetail.loginPassword" style="display: inline-block; width: 22px; margin-left: 10px; text-align: center; cursor: pointer; vertical-align: middle;"
                    @mousedown="showPassword = true" @mouseup="showPassword = false"
                    @mouseleave="showPassword = false">
                    <Icon type="md-eye" />
                  </span>
                  <span v-else>-</span>
                </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 重置实例登录密码弹框 -->
    <Modal v-model="resetPwdModalVisible" title="重置实例登录密码" :closable="true" :mask-closable="false" width="460"
      @on-visible-change="handleResetPwdModalVisibleChange">
      <div v-if="resetPwdInstance" class="reset-pwd-modal-content">
        <div class="reset-pwd-instance-info">
          <div class="info-row">
            <span class="label">实例名称：</span>
            <span class="value">{{ resetPwdInstance.instance_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">手机号：</span>
            <span class="value">{{ resetPwdForm.phone }}</span>
          </div>
        </div>

        <Form :model="resetPwdForm" :rules="resetPwdRules" ref="resetPwdFormRef" :label-width="80">
          <!-- 短信验证码：必填 -->
          <FormItem label="验证码" prop="verifyCode">
            <div class="reset-pwd-verify-row">
              <Input v-model="resetPwdForm.verifyCode" placeholder="请输入5位短信验证码" :maxlength="6" />
              <Button class="reset-pwd-send-btn" :loading="resetPwdSendingCode"
                :disabled="resetPwdCountdown > 0 || !resetPwdForm.phone" @click="sendResetPwdCode">
                {{ resetPwdCountdown > 0 ? `${resetPwdCountdown} 秒后重发` : '发送验证码' }}
              </Button>
            </div>
          </FormItem>
          <FormItem label="新密码" prop="newPassword">
            <Input v-model="resetPwdForm.newPassword" type="password" placeholder="请输入8-64位新密码（字母+数字）" :maxlength="64"
              :class="{ 'login-pwd--invalid': !!resetPwdError }" autocomplete="new-password" @on-blur="validateResetPwd"
              @on-change="validateResetPwd" />
            <div class="login-form__hint" v-if="!resetPwdError">长度 8-64 位，必须同时包含字母与数字</div>
            <div class="login-form__field-error" v-if="resetPwdError">{{ resetPwdError }}</div>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="handleResetPwdCancel">取消</Button>
        <Button type="primary" :loading="resetPwdLoading" @click="handleResetPwdOk">保存</Button>
      </div>
    </Modal>

    <!-- 续费弹框 -->
    <Modal v-model="renewModalVisible" title="续费实例" :closable="true" :mask-closable="false" width="500"
      @on-visible-change="handleRenewModalVisibleChange">
      <div v-if="renewInstance" class="renew-modal-content">
        <div class="renew-instance-info">
          <div class="info-row">
            <span class="label">实例名称:</span>
            <span class="value">{{ renewInstance.instance_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">当前到期时间:</span>
            <span class="value">{{ renewInstance.expireTime || '已过期' }}</span>
          </div>
        </div>

        <div class="renew-duration-select">
          <div class="select-label"><span style="color: #ff4d4f;">*</span> 续费时长</div>
          <Select v-model="renewDuration" placeholder="请选择续费时长" style="width: 130px;"
            @on-change="handleRenewDurationChange">
            <Option v-for="opt in renewDurationOptions" :key="opt.value" :value="opt.value" :label="opt.label">
              {{ opt.value }}
              <span v-if="opt.discountText"
                style="background: #ff4d4f; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">{{
                  opt.discountText }}</span>
            </Option>
          </Select>
        </div>

        <div class="renew-balance-check">
          <Checkbox v-model="renewForm.useBalance" @on-change="handleRenewBalanceChange">使用账户余额抵扣 (当前账户可用余额: <span
              style="color: #ff4d4f; font-weight: bold;">¥{{ ((balance || 0) - (frozenBalance || 0)).toFixed(2)
              }}</span>)
          </Checkbox>
          <div v-if="renewForm.useBalance && renewPriceInfo.totalAmount > 0" class="balance-input-row">
            <span>余额支付:</span>
            <InputNumber v-model="renewForm.balanceAmount" :min="0" :step="0.01"
              :max="Math.min(balance - frozenBalance, renewPriceInfo.totalAmount)" size="small"
              style="width: 120px; margin-left: 8px;" @on-blur="handleBalanceAmountBlur" placeholder="请输入金额">
            </InputNumber>
            <span v-if="renewPriceInfo.totalAmount > renewForm.balanceAmount" style="margin-left: 8px;">还需支付: ¥{{
              Math.max(0, renewPriceInfo.totalAmount -
                renewForm.balanceAmount).toFixed(2) }}</span>
            <span v-else style="font-size: 12px; color: #19be6b; margin-left: 8px;">余额已足额抵扣</span>
          </div>
        </div>
        <div class="" style="color: red;display: flex;justify-content: flex-end;width: 90%;">当前支付总金额:¥{{
          renewPriceInfo.totalAmount }}</div>

      </div>
      <div slot="footer">
        <Button @click="renewModalVisible = false">取消</Button>
        <Button type="primary" :loading="renewLoading" :disabled="!renewDuration"
          @click="handleRenewSubmit">确认续费</Button>
      </div>
    </Modal>

    <!-- 退款确认弹框 -->
    <Modal v-model="refundModalVisible" title="退款确认" :closable="true" :mask-closable="false" width="720"
      @on-visible-change="handleRefundModalVisibleChange">
      <div v-if="refundInstance" class="refund-modal-content">
        <div class="refund-instance-info">
          <div class="info-row">
            <span class="label">实例名称：</span>
            <span class="value">{{ refundInstance.instance_name }}</span>
          </div>
          <!-- <div class="info-row">
            <span class="label">实例状态：</span>
            <span class="value">{{ refundInstance.status }}</span>
          </div> -->
        </div>

        <Spin fix v-if="refundDetailLoading"></Spin>

        <template v-if="!refundDetailLoading && refundDetail">
          <!-- 汇总信息 -->
          <div class="refund-summary">
            <div class="summary-row">
              <span>实付款合计：</span>
              <span class="summary-value">¥{{ refundDetail.summary.totalFinalAmount }}</span>
            </div>
            <div class="summary-row">
              <span>已使用金额：</span>
              <span class="summary-value">¥{{ refundDetail.summary.totalUsedAmount }}</span>
            </div>
            <div class="summary-row highlight">
              <span>预计可退款金额：</span>
              <span class="summary-value"
                :style="{ color: Number(refundDetail.summary.totalRefundAmount) > 0 ? '#19be6b' : '#ff4d4f' }">
                ¥{{ refundDetail.summary.totalRefundAmount }}
              </span>
            </div>
            <div class="summary-row sub" v-if="Number(refundDetail.summary.totalRefundAmount) > 0">
              <span>其中退余额：¥{{ refundDetail.summary.totalBalanceRefund }}，
                退第三方：¥{{ refundDetail.summary.totalThirdPartyRefund }}</span>
            </div>
          </div>

          <!-- 订单明细列表 -->
          <div class="refund-items-title">退款明细（共 {{ refundDetail.summary.itemCount }} 条订单）</div>
          <div class="refund-items">
            <div v-for="(item, idx) in refundDetail.items" :key="item.orderItemId" class="refund-item">
              <div class="item-header">
                <span class="item-no">#{{ idx + 1 }} {{ item.itemType === 'instance_purchase' ? '新购订单' :
                  item.itemType === 'renew' ? '续费订单' :
                    item.itemType === 'storage_expansion' ? '存储扩容' : item.itemType }}</span>
                <span class="item-order">订单号：{{ item.orderNo }}</span>
              </div>
              <div class="item-content">
                <!-- <div class="item-row">
                  <span class="item-label">商品：</span>
                  <span>{{ item.productName }}</span>
                </div> -->
                <div class="item-row">
                  <span class="item-label">有效期：</span>
                  <span>{{ item.instanceStartTime }} ~ {{ item.instanceEndTime }}</span>
                </div>
                <div class="item-row money">
                  <span class="item-label">金额：</span>
                  <span>原价 ¥{{ item.totalOriginalAmount }}，
                    优惠 ¥{{ calcDiscountAmount(item) }}，
                    实付 ¥{{ item.totalFinalAmount }}<template v-if="calcDiscountRate(item) > 0">，
                      折扣 {{ formatDiscountRate(calcDiscountRate(item)) }}</template></span>
                </div>
                <div class="item-row">
                  <span class="item-label">使用情况：</span>
                  <span>已用 {{ item.usedDays }} / 共 {{ item.totalDays }} 天，
                    剩余 {{ item.remainingDays }} 天</span>
                </div>
                <div class="item-row">
                  <span class="item-label">已使用金额：</span>
                  <span>¥{{ item.usedAmount }}（按原价 ¥{{ item.unitPrice }}/天 × {{ item.usedDays }} 天）</span>
                </div>
                <div class="item-row highlight-row">
                  <span class="item-label">本条可退款：</span>
                  <span :style="{ color: Number(item.refundAmount) > 0 ? '#19be6b' : '#909399' }">
                    ¥{{ item.refundAmount }}
                    <template v-if="Number(item.refundAmount) > 0">
                      <span class="sub-split">（退余额 ¥{{ item.balanceRefundAmount }}，
                        退第三方 ¥{{ item.thirdPartyRefundAmount }}）</span>
                    </template>
                    <span v-else class="refund-reason">（{{ item.refundReason || '本期已消费完' }}）</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 总可退金额为 0 的提示 -->
          <div v-if="Number(refundDetail.summary.totalRefundAmount) <= 0" class="refund-zero-tip">
            <Icon type="ios-information-circle" />
            <span>所有订单明细均已消费完，退款金额为 0，确认退款后实例将被直接释放。</span>
          </div>
        </template>

        <div v-if="!refundDetailLoading && !refundDetail" class="refund-empty">
          <p>暂无订单明细数据</p>
        </div>
      </div>
      <div slot="footer">
        <Button @click="handleRefundCancel">继续使用</Button>
        <Button type="primary" :loading="refundSubmitting" :disabled="!refundDetail || refundDetailLoading"
          @click="confirmRefund">确认退款</Button>
      </div>
    </Modal>

    <!-- 设置支付密码弹框 -->
    <Modal v-model="showSetPayPwdModal" title="设置支付密码" :mask-closable="false" @on-cancel="handleSetPayPwdCancel">
      <Form :model="setPayPwdForm" :rules="setPayPwdRules" ref="setPayPwdFormRef" :label-width="160">
        <FormItem label="支付密码" prop="newPassword">
          <Input v-model="setPayPwdForm.newPassword" style="width: 70%;" type="password" placeholder="请输入6位支付密码"
            maxlength="6" autocomplete="new-password" />
        </FormItem>
        <FormItem label="确认密码" prop="confirmPassword">
          <Input v-model="setPayPwdForm.confirmPassword" style="width: 70%;" type="password" placeholder="请再次输入密码"
            maxlength="6" autocomplete="new-password" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleSetPayPwdCancel">取消</Button>
        <Button type="primary" :loading="setPayPwdLoading" @click="handleSetPayPwdOk">确定</Button>
      </div>
    </Modal>

    <!-- 支付确认弹框 -->
    <Modal v-model="payModalVisible" title="支付确认" :closable="true" :footer-hide="useWechatPay" :mask-closable="false"
      :loading="payModalLoading" @on-cancel="handlePayModalCancel">
      <div style="padding: 16px 0; font-size: 14px; line-height: 1.6;">
        <p>确定要支付该订单吗？</p>
        <p style="margin-top: 8px; color: #515a6e;">订单号：{{ orderResult ? orderResult.orderNo : '' }}</p>
        <p style="margin-top: 8px;">
          <span>支付金额：</span>
          <span style="color: #ff4d4f; font-weight: bold; font-size: 16px;">¥{{ Number(finalAmount).toFixed(2) }}</span>
        </p>
        <p v-if="renewForm.useBalance && renewForm.balanceAmount > 0" style="margin-top: 8px; color: #19be6b;">
          使用余额抵扣：¥{{ renewForm.balanceAmount.toFixed(2) }}
        </p>
        <div v-if="useWechatPay"
          style="margin-top: 16px; padding: 16px; background: #f8f8f9; border-radius: 4px; text-align: center;">
          <p style="color: #ff4d4f; font-weight: bold; margin-bottom: 12px;">
            还需微信支付：¥{{ remainingAmount.toFixed(2) }}
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
      <div v-if="!useWechatPay" slot="footer">
        <Button @click="handlePayModalCancel">取消</Button>
        <Button type="primary" :loading="payModalLoading" @click="handlePayConfirm">
          确认支付
        </Button>
      </div>
    </Modal>

    <!-- VNC 控制台弹框：noVNC RFB 直连 + 后端 WS 代理(token 下沉模式) -->
    <Modal v-model="vncDialog.show" :title="`VNC 控制台 - ${vncDialog.instanceName || vncDialog.instanceId}`" :width="920"
      :mask-closable="false" :footer-hide="true" @on-cancel="closeVncDialog" @on-close="closeVncDialog">
      <div class="vnc-dialog">
        <div class="vnc-dialog__toolbar">
          <span class="vnc-dialog__status" :class="vncDialogStatusClass">● {{ vncDialogStatusText }}</span>
          <Button size="small" type="text" :disabled="vncDialog.status !== 'connected'" @click="toggleVncFullscreen">{{
            vncDialog.fullscreen ? '退出全屏' : '全屏' }}</Button>
          <Button size="small" type="text" :disabled="vncDialog.connecting" @click="reconnectVnc">重连</Button>
        </div>
        <!-- RFB 容器(必须是 div,noVNC 1.6.0 会自己创建 canvas) -->
        <div ref="vncScreen" class="vnc-dialog__screen" tabindex="0"></div>
      </div>
    </Modal>

    <!-- BM 终端不再走平台内嵌,改为点 "终端" 按钮直接 window.open 新窗口跳 BMC 自带 H5 -->
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-control-instance-list',
  data () {
    return {
      // 轮询支付状态相关
      isPolling: false,
      pollingTimer: null,
      pollingCount: 0,
      maxPollingCount: 200, // 最大轮询次数（约5分钟）
      pollingInterval: 3000, // 轮询间隔（3秒）
      isPaySuccess: false, // 支付是否成功
      finalAmount: 0,
      orderResult: null,
      useWechatPay: false, // 是否使用微信支付
      selected: '',
      tempPayPassword: '',  // 临时支付密码（提交订单时验证）
      // 设置支付密码弹框相关
      showSetPayPwdModal: false,
      setPayPwdLoading: false,
      setPayPwdForm: {
        newPassword: '',
        confirmPassword: ''
      },
      setPayPwdRules: {
        newPassword: [
          { required: true, message: '请输入支付密码', trigger: 'blur' },
          { pattern: /^\d{6}$/, message: '支付密码必须是6位数字', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: this.validateSetPayPwdConfirm, trigger: 'blur' }
        ]
      },
      pveUrl: 'https://172.16.2.148:8006/',
      searchKeywords: '',
      searchStatus: '',
      searchProductName: '',
      statusOptions: [
        { value: 'running', label: '运行中' },
        { value: 'expired', label: '已过期' },
        { value: 'stopped', label: '已停止' },
        { value: 'refunding', label: '退款中' }
      ],
      loading: false,
      actionLoading: false,
      payModalLoading: false,
      payModalVisible: false,
      pageNo: 1,
      pageSize: 10,
      total: 0,
      refreshTimer: null, // 列表刷新定时器引用
      runtimeTickTimer: null, // 总运行时间实时刷新定时器
      nowTick: 0, // 用于触发运行中实例的总运行时间实时刷新（每秒+1）
      columns: [
        {
          title: '实例名称/实例ID',
          align: 'center',
          slot: 'instance',
          minWidth: 300,
          // width: 300,
          ellipsis: true
        },
        {
          title: '产品名',
          key: 'productName',
          minWidth: 110,
          width: 130,
          align: 'center',
          ellipsis: true
        },
        {
          title: '付费方式',
          key: 'billing_type',
          width: 100,
          align: 'center'
        },
        {
          title: '状态',
          slot: 'status',
          width: 120,
          align: 'center'
        },
        {
          title: '创建时间',
          key: 'createTime',
          minWidth: 120,
          width: 160,
          align: 'center'
        },
        {
          title: '最近开机时间',
          key: 'lastStartTime',
          minWidth: 120,
          width: 180,
          align: 'center',
          slot: 'lastStartTime'
        },
        {
          title: '总运行时间',
          key: 'totalRuntime',
          minWidth: 100,
          width: 150,
          align: 'center',
          slot: 'totalRuntime'
        },
        {
          title: '到期时间',
          key: 'expireTime',
          minWidth: 120,
          width: 180,
          align: 'center'
        },
        {
          title: 'vmid',
          key: 'vmid',
          minWidth: 100,
          width: 100,
          align: 'center'
        },
        {
          title: '操作',
          slot: 'action',
          // fixed: 'right',
          minWidth: 240,
          width: 280,
          align: 'center'
        }
      ],
      // 数据盘列表列定义
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
        },
        // {
        //   title: '计费方式',
        //   key: 'billingType',
        //   width: 100,
        //   render: (h, params) => {
        //     const billingMap = { 'monthly': '包月', 'hourly': '按量', 'yearly': '包年' }
        //     return h('span', billingMap[params.row.billingType] || params.row.billingType || '--')
        //   }
        // },
        // {
        //   title: '价格',
        //   key: 'finalAmount',
        //   width: 100,
        //   render: (h, params) => {
        //     return h('span', params.row.finalAmount ? '¥' + params.row.finalAmount.toFixed(2) : '--')
        //   }
        // },
        // {
        //   title: '状态',
        //   key: 'status',
        //   render: (h, params) => {
        //     const statusMap = { 'completed': '已完成', 'pending': '待支付', 'processing': '处理中' }
        //     return h('span', statusMap[params.row.status] || params.row.status || '--')
        //   }
        // }
      ],
      data: [],
      allData: [], // 存储所有实例数据用于前端搜索
      productOptions: [], // 产品下拉选项，来源于产品管理接口
      // 实例详情弹框
      detailModalVisible: false,
      loadingDetail: false,
      instanceDetail: null,
      // 详情弹框：密码"按住显示明文"开关
      showPassword: false,
      // 正在停止中的实例ID集合
      stoppingInstances: {},
      // 正在开机中的实例ID集合
      startingInstances: {},
      // 续费弹框相关
      renewModalVisible: false,
      renewLoading: false,
      renewInstance: null,
      renewDuration: '',
      renewDurationOptions: [],
      renewPriceInfo: {
        unitPrice: 0,
        originalPrice: 0,
        totalAmount: 0,
        discountAmount: 0
      },
      renewForm: {
        useBalance: true,
        balanceAmount: 0
      },
      // 退款确认弹框相关
      refundModalVisible: false,
      refundDetailLoading: false,
      refundSubmitting: false,
      refundInstance: null,
      refundDetail: null,  // 后端 getInstanceRefundDetail 返回的数据
      balance: 0,
      frozenBalance: 0,
      // 重置实例登录密码弹框
      resetPwdModalVisible: false,
      resetPwdLoading: false,
      resetPwdInstance: null,
      resetPwdError: '',
      resetPwdSendingCode: false,
      resetPwdCountdown: 0,
      resetPwdTimer: null,
      resetPwdForm: {
        phone: '',
        verifyCode: '',
        newPassword: ''
      },
      resetPwdRules: {
        verifyCode: [
          { required: true, message: '请输入短信验证码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: this.validateResetPwdNew, trigger: 'blur' }
        ]
      },
      // VNC 控制台弹框(RFB 直连 + 后端 WS 代理)
      vncDialog: {
        show: false,
        instanceId: '',
        instanceName: '',
        status: 'idle',     // idle | connecting | connected | disconnected | error
        connecting: false,
        rfb: null,          // noVNC RFB 客户端实例
        fullscreen: false   // 浏览器原生全屏状态
      }
      // BM 终端改为 window.open 跳转 BMC 自带 H5,不再需要内嵌 dialog 状态
    }
  },
  computed: {
    vncDialogStatusText () {
      return { idle: '未连接', connecting: '连接中…', connected: '已连接', disconnected: '已断开', error: '连接失败' }[this.vncDialog.status]
    },
    vncDialogStatusClass () {
      return { idle: 'is-idle', connecting: 'is-connecting', connected: 'is-connected', disconnected: 'is-disconnected', error: 'is-error' }[this.vncDialog.status]
    },
    // BM 终端已改为新窗口跳转,不再有内嵌状态机,故删除 bmKvmDialogStatusText / bmKvmDialogStatusClass
    /**
     * 可用余额
     */
    availableBalance () {
      return parseFloat(this.balance || 0) - parseFloat(this.frozenBalance || 0)
    },
    /**
     * 从 allData 中按 productName 去重得到产品名下拉项
     */
    productNameOptions () {
      // 备用方案：从 allData 中按 productName 去重得到产品名下拉项
      // const set = new Set()
      // this.allData.forEach(item => {
      //   if (item && item.productName) {
      //     set.add(item.productName)
      //   }
      // })
      // return Array.from(set)

      // 当前方案：从产品管理接口返回的产品列表中提取产品名
      if (!Array.isArray(this.productOptions) || this.productOptions.length === 0) {
        return []
      }
      return this.productOptions
        .map(item => item && item.productName)
        .filter(name => !!name)
    }
  },
  mounted () {
    this.loadData()
    this.loadProductOptions()
    // 每10秒刷新一次列表数据（10000毫秒）
    this.refreshTimer = setInterval(() => {
      this.loadData('noloading')
    }, 10000)
    // 每秒刷新一次 nowTick，使"运行中"实例的总运行时间实时递增
    this.runtimeTickTimer = setInterval(() => {
      this.nowTick++
    }, 1000)
    // 监听浏览器原生全屏状态变化(用户按 Esc 退出时同步按钮文案)
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    // 浏览器刷新/关闭页面时,beforeDestroy 不保证触发,需要显式断开 RFB/WS,
    // 否则后端 VNC 会话会残留直到 PVE vncproxy ticket 超时
    window.addEventListener('beforeunload', this._cleanupRfb)
    window.addEventListener('pagehide', this._cleanupRfb)
  },
  beforeDestroy () {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
    if (this.runtimeTickTimer) {
      clearInterval(this.runtimeTickTimer)
      this.runtimeTickTimer = null
    }
    // 移除全屏监听
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    // 移除页面卸载监听
    window.removeEventListener('beforeunload', this._cleanupRfb)
    window.removeEventListener('pagehide', this._cleanupRfb)
    // 关闭 VNC
    this.closeVncDialog()
    // BM 终端改用新窗口 + 后端重定向,本页无需清理(弹窗在新窗口独立加载)
  },
  watch: {
    // 二维码链接就绪后兜底重画：createTestOrderQrCode 响应可能慢于支付弹框打开，
    // 弹框打开时的 nextTick 绘制会因 URL 为空被跳过，此处 URL 到达后再补画
    testOrderQrCodeUrl (val) {
      if (val) this.$nextTick(() => { this.renderPayQrCode() })
    },
    // 兜底：弹框 v-model 由 true → false 时强制清理 RFB/WS，
    // 即使 on-cancel/on-close 事件因为框架版本差异没触发也能保证后端会话断开
    'vncDialog.show': {
      handler (newVal) {
        if (!newVal) {
          // 已经关了弹框 → 走完整清理
          this._cleanupRfb()
          const screen = this.$refs.vncScreen
          if (screen) {
            while (screen.firstChild) screen.removeChild(screen.firstChild)
            screen.style.background = ''
          }
        }
      }
    },
    // bmKvmDialog.show 监听器已删除:BM 终端改用新窗口跳转,本页无内嵌 dialog
    'renewPriceInfo.totalAmount': {
      handler () {
        // 续费总金额变化时，自动把使用金额设置为：min(可用余额, 当前支付总金额)
        // 1) 金额1元，用户余额10元 -> 设置为1
        // 2) 金额2元，用户余额1元 -> 设置为1
        // 仅在勾选使用余额时设置
        if (this.renewForm.useBalance) {
          this.autoFillBalanceAmount()
        }
      }
    },
    'renewForm.useBalance': {
      handler (newVal) {
        if (!newVal) {
          // 取消勾选时重置使用金额为0
          this.renewForm.balanceAmount = 0
        } else {
          // 勾选时自动把使用金额设置为：min(可用余额, 当前支付总金额)
          this.autoFillBalanceAmount()
        }
      }
    }
  },
  methods: {
    /**
     * 加载产品下拉选项
     * 调用产品管理接口，仅返回上架、启用、未删除的产品，供搜索区产品名下拉使用
     */
    async loadProductOptions () {
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productService/listProduct',
          method: 'post',
          data: {}
        })
        res = { data: res }
        if (res.data && res.data.errcode === 0) {
          this.productOptions = Array.isArray(res.data.data) ? res.data.data : []
        }
      } catch (e) {
        // 产品列表加载失败不影响主流程，搜索区产品下拉保持为空即可
        this.productOptions = []
      }
    },
    /**
     * 复制 SSH 连接命令到剪贴板
     * 优先用 navigator.clipboard.writeText（HTTPS / localhost 下可用），
     * 失败时降级为 textarea + document.execCommand('copy')（兼容 HTTP 与老浏览器）。
     * 纯 JS 实现，不引入第三方依赖。
     */
    copySshCmd () {
      if (!this.instanceDetail || !this.instanceDetail.vnetIp) {
        this.$Message.warning('暂无 SSH 连接信息')
        return
      }
      const text = 'ssh root@' + this.instanceDetail.vnetIp
      // 优先走异步 Clipboard API（仅在安全上下文下可用）
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          () => this.$Message.success('已复制: ' + text),
          () => this.legacyCopy(text)
        )
      } else {
        // 非安全上下文或不支持：走降级方案
        this.legacyCopy(text)
      }
    },
    /**
     * 复制降级方案：textarea + execCommand('copy')
     * 适用于 HTTP 部署、内网、不支持 Clipboard API 的浏览器。
     */
    legacyCopy (text) {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        // 移出视口，避免页面抖动
        ta.style.position = 'fixed'
        ta.style.top = '-9999px'
        ta.style.left = '-9999px'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (ok) {
          this.$Message.success('已复制: ' + text)
        } else {
          this.$Message.error('复制失败，请手动复制')
        }
      } catch (e) {
        console.error('[复制失败]', e)
        this.$Message.error('复制失败，请手动复制')
      }
    },
    handleBalanceAmountBlur () {
      if (this.availableBalance <= 0) {
        this.renewForm.balanceAmount = 0
        return
      }
      if (this.renewForm.balanceAmount !== null && this.renewForm.balanceAmount !== undefined) {
        // 格式化为两位小数
        this.renewForm.balanceAmount = parseFloat(this.renewForm.balanceAmount.toFixed(2))
      }
    },
    // 停止轮询支付状态
    stopPaymentPolling () {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
      this.renewLoading = false
      this.submitLoading = false
      this.isPolling = false
      this.payModalVisible = false
      this.renewModalVisible = false
    },
    handlePayConfirm () {
      // 停止轮询
      this.stopPaymentPolling()
      this.payModalLoading = true
      // 直接跳转到实例列表页（实例创建由后端定时任务处理）
      this.$Message.success('订单确认成功！请稍后查看')
      setTimeout(() => {
        this.$router.push('/shenbeigpuai/control/instance-list')
      }, 1000)
    },
    // 处理支付确认弹框取消
    handlePayModalCancel () {
      this.payModalVisible = false
      this.renewModalVisible = false
      this.stopPaymentPolling()
      this.submitLoading = false
      this.renewLoading = false
    },
    async loadData (param) {
      if (param !== 'noloading') {
        this.loading = true
      }
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/listUserInstancePage',
          method: 'post',
          data: {
            pageNo: this.pageNo,
            pageSize: this.pageSize,
            status: this.searchStatus || undefined,
            instanceName: this.searchKeywords || undefined
          }
        })
        res = { data: res }

        if (res.data.errcode === 0) {
          const pageData = res.data.data || {}
          const list = pageData.results || []
          // 直接使用数据库字段,转换为下划线形式
          this.allData = list.map(item => {
            // 如果该实例正在停止中，保持停止中状态
            let status = this.formatStatus(item.pveStatus ? item.pveStatus.status : item.status)
            // (暂时去掉pve实时查询)
            // if (this.stoppingInstances[item.id]) {
            //   status = '停止中'
            // }
            // if (this.startingInstances[item.id]) {
            //   status = '开机中'
            // }
            if (this.stoppingInstances[item.id] && item.status === 'running') {
              status = '停止中'
            } else {
              this.$delete(this.stoppingInstances, item.id)
            }
            if (this.startingInstances[item.id] && item.status === 'stopped') {
              status = '开机中'
            } else {
              this.$delete(this.startingInstances, item.id)
            }

            // 根据pendingTask.taskType设置状态(暂时去掉pve实时查询)
            // if (item.pendingTask && item.pendingTask.taskType) {
            //   if (item.pendingTask.taskType === 'START_VM') {
            //     status = '开机中'
            //   } else if (item.pendingTask.taskType === 'STOP_VM') {
            //     status = '停止中'
            //   } else if (item.pendingTask.taskType === 'SUSPEND_VM') {
            //     status = '挂起中'
            //   }
            // }

            return {
              id: item.id,
              // instance_name: item.pveStatus ? item.pveStatus.name : '--',
              instance_name: item.instanceName,
              productName: item.productName,
              product_config_id: item.productConfigId,
              sku_id: item.skuId,
              createTime: item.createTime,
              isRefundable: item.isRefundable,
              expireTime: item.itemBillingType === 'hourly' ? '--' : item.expireTime,
              billing_type: this.formatBillingType(item.itemBillingType),
              payment_method: this.formatPaymentMethod(item.paymentMethod),
              status: status,
              time_range: this.formatTimeRange(item.createTime, item.updateTime),
              link: '--',
              remark: '--',
              tools: '--',
              node: item.node,
              vmid: item.vmid,
              // 直接使用后端返回的dataDiskIds
              dataDiskIds: item.dataDiskIds || [],
              // 开机时间相关
              lastStartTime: item.lastStartTime || '',
              totalRuntime: item.totalRuntime || 0,
              // 保留原始数据用于操作
              _raw: item
            }
          })

          // 应用前端搜索过滤
          this.applySearchFilter()

          this.total = pageData.totalRecord || 0
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          this.$router.push('/login')
        } else {
          this.$Message.error(res.data.errmsg || '加载实例列表失败')
          this.data = []
          this.allData = []
          this.total = 0
        }
      } catch (e) {
        console.error('加载实例列表异常:', e)
        this.$Message.error('网络异常，请稍后重试')
        this.data = []
        this.allData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    // 应用前端搜索过滤
    applySearchFilter () {
      let result = this.allData
      if (this.searchKeywords && this.searchKeywords.trim() !== '') {
        const keyword = this.searchKeywords.toLowerCase().trim()
        result = result.filter(item =>
          item.instance_name && item.instance_name.toLowerCase().includes(keyword)
        )
      }
      if (this.searchProductName) {
        result = result.filter(item => item.productName === this.searchProductName)
      }
      this.data = result
    },

    // 格式化计费方式
    formatBillingType (billingType) {
      const map = {
        'monthly': '包月',
        'hourly': '按量计费'
      }
      return map[billingType] || billingType || '--'
    },

    // 格式化支付方式
    formatPaymentMethod (paymentMethod) {
      const map = {
        '支付宝': '支付宝',
        '微信': '微信',
        '银行卡': '银行卡',
        '账户余额': '账户余额',
        '其他': '其他'
      }
      return map[paymentMethod] || paymentMethod || '--'
    },

    // 格式化实例状态
    formatStatus (status) {
      const map = {
        'running': '运行中',
        'stopped': '已停止',
        'expired': '已过期',
        'error': '异常',
        'refunding': '退款中',
        '已挂起': '已挂起', // 确保兼容，正常都应该是英文
        '已删除': '已删除'
      }
      return map[status] || status || '--'
    },

    // 登录密码脱敏：前后4位明文，中间用*号替代
    maskPassword (pwd) {
      if (!pwd || typeof pwd !== 'string') return pwd || ''
      if (pwd.length <= 8) return pwd
      const head = pwd.slice(0, 4)
      const tail = pwd.slice(-4)
      const middleLen = pwd.length - 8
      return `${head}${'*'.repeat(middleLen)}${tail}`
    },

    // 格式化时间范围
    formatTimeRange (createTime, updateTime) {
      const start = createTime || '--'
      const end = updateTime || '--'
      return `${start}/${end}`
    },

    // 格式化总运行时间（秒转换为X天X小时X分X秒）
    // - 运行中的实例: 后端 totalRuntime + (now - lastStartTime) 秒，秒级实时刷新
    // - 非运行中实例: 仅显示后端 totalRuntime
    formatTotalRuntime (row) {
      const baseSeconds = Number(row && row.totalRuntime) || 0
      let totalSeconds = baseSeconds
      // 累加实时运行时间的两种状态：
      // 1. "运行中" —— 当前在运行，实时累加
      // 2. "停止中" —— 刚刚点了停止、等待后端真正停止完成的那 1~2 秒切换间隙，仍按实时累加显示，
      //              避免出现"1小时10分 -> 1小时"的回退
      // 其它状态（已停止 / 已过期 / 退款中等）直接用 baseSeconds，即后端已结算后的累计值
      if (row && row.lastStartTime && (row.status === '运行中' || row.status === '停止中')) {
        const startTs = this.parseLastStartTime(row.lastStartTime)
        if (startTs) {
          const liveSeconds = Math.max(0, Math.floor((Date.now() - startTs) / 1000))
          totalSeconds = baseSeconds + liveSeconds
        }
      }
      if (!totalSeconds || totalSeconds <= 0) return '-'
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const secs = totalSeconds % 60
      let result = ''
      if (days > 0) result += `${days}天`
      if (hours > 0) result += `${hours}小时`
      if (minutes > 0) result += `${minutes}分`
      if (secs > 0 || result === '') result += `${secs}秒`
      return result
    },
    // 将后端返回的 lastStartTime 字符串解析为毫秒时间戳
    // 后端格式形如 "yyyy-MM-dd HH:mm:ss" 或 "yyyy-MM-dd HH:mm:ss.0"
    parseLastStartTime (value) {
      if (!value) return 0
      // 去掉末尾的 ".0" / ".000" 之类的毫秒位（后端已经做过一次格式化）
      let str = String(value).trim()
      str = str.replace(/\.\d+$/, '')
      // 兼容空格分隔符与 T 分隔符
      str = str.replace(' ', 'T')
      const ts = Date.parse(str)
      if (!isNaN(ts)) return ts
      // 兜底：尝试按 yyyy-MM-dd HH:mm:ss 手动解析
      const m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
      if (m) {
        return Date.UTC(
          Number(m[1]), Number(m[2]) - 1, Number(m[3]),
          Number(m[4]), Number(m[5]), Number(m[6])
        )
      }
      return 0
    },

    // 搜索功能
    handleSearch () {
      this.pageNo = 1
      // 若已加载过数据，productName 筛选仅前端过滤，避免列表项丢失；
      // 否则触发后端查询以拉取 productName 下拉项来源
      // if (this.allData && this.allData.length > 0) {
      //   this.applySearchFilter()
      // } else {
      this.loadData()
      // }
    },

    // 重置搜索条件并重新查询
    handleReset () {
      this.searchKeywords = ''
      this.searchStatus = ''
      this.searchProductName = ''
      this.pageNo = 1
      this.loadData()
    },

    changePage (page) {
      this.pageNo = page
      this.loadData()
    },

    changePageSize (pageSize) {
      this.pageSize = pageSize
      this.pageNo = 1
      this.loadData()
    },

    async handleAction (type, row) {
      const typeMap = {
        detail: '详情',
        stop: '关机',
        suspend: '停止',
        start: '开机',
        console: '控制台',
        bmkvm: '终端',
        renew: '续费',
        refund: '退款',
        delete: '释放',
        resetPassword: '重置密码',
      }

      if (type === 'renew') {
        // 续费操作，弹出续费弹框
        await this.showRenewModal(row)
      } else if (type === 'detail') {
        // 查看详情
        this.showDetailModal(row)
      } else if (type === 'stop') {
        console.log('关机实例:', row)
        // 关机实例
        // await this.stopInstance(row)
      } else if (type === 'suspend') {
        console.log('停止实例:', row)
        // 停止实例（挂起）
        await this.stopVM(row)
      } else if (type === 'start') {
        console.log('开机实例:', row)
        // 开机实例
        await this.startVM(row)
      } else if (type === 'console') {
        // iframe 嵌入 PVE 自带 noVNC 页面：调后端拿凭据 → 写 PVEAuthCookie → 嵌入 noVNC
        // （PVE 端需允许跨 iframe 嵌入，否则会被 X-Frame-Options 拦截；cookie 需能写到 PVE 域才能鉴权）
        this.openVncConsole(row)
      } else if (type === 'bmkvm') {
        // 裸金属(BM)终端：平台 WS 代理 + ASPEED decode_worker 解码（非 noVNC/VNC）
        this.openBmKvmConsole(row)
      } else if (type === 'refund') {
        // 退款：先展示退款明细弹框，用户确认后再真正调用 deleteInstance
        await this.showRefundModal(row)
      } else if (type === 'delete') {
        // 删除（非退款）走原删除流程
        await this.handleDeleteInstance(row, typeMap[type])
      } else if (type === 'resetPassword') {
        // 重置实例登录密码：弹框输入新密码
        this.showResetPwdModal(row)
      } else {
        this.$Message.info(`执行操作: ${typeMap[type]} - ${row.instance_name}`)
        // TODO: 后续可以根据不同操作调用对应的接口
      }
    },

    // ========== 重置实例登录密码 ==========
    showResetPwdModal (row) {
      this.resetPwdInstance = row
      this.resetPwdForm = { phone: '', verifyCode: '', newPassword: '' }
      this.resetPwdError = ''
      this.resetPwdLoading = false
      this.resetPwdModalVisible = true
      // 从当前登录用户信息里取手机号（与 platform-intro 页面同样的方式）
      try {
        const vuex = sessionStorage.getItem('vuex')
        if (vuex) {
          const userData = JSON.parse(vuex)
          const mobile = userData.user && userData.user.severUserInfo
            && userData.user.severUserInfo.data && userData.user.severUserInfo.data.mobile
          if (mobile) {
            this.resetPwdForm.phone = mobile
          }
        }
      } catch (e) {
        console.error('获取当前用户手机号失败:', e)
      }
    },

    /**
     * 发送短信验证码
     * 接口：shenbeigpuai/smsVerifyCodeService/sendVerifyCode
     * 参数：{ functionCode: 'vm_update_password', phone }
     */
    async sendResetPwdCode () {
      const phone = this.resetPwdForm.phone
      if (!phone) {
        this.$Message.warning('当前账号未绑定手机号，无法发送验证码')
        return
      }
      if (this.resetPwdCountdown > 0 || this.resetPwdSendingCode) return
      this.resetPwdSendingCode = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/smsVerifyCodeService/sendVerifyCode',
          method: 'post',
          data: {
            functionCode: 'vm_update_password',
            phone: phone
          }
        })
        if (res.errcode === 0) {
          this.$Message.success('验证码已发送，请注意查收')
          // 启动 60 秒倒计时，期间按钮置灰
          this.resetPwdCountdown = 60
          this.resetPwdTimer && clearInterval(this.resetPwdTimer)
          this.resetPwdTimer = setInterval(() => {
            if (this.resetPwdCountdown <= 1) {
              this.resetPwdCountdown = 0
              clearInterval(this.resetPwdTimer)
              this.resetPwdTimer = null
            } else {
              this.resetPwdCountdown -= 1
            }
          }, 1000)
        } else {
          this.$Message.error(res.errmsg || '验证码发送失败')
        }
      } catch (err) {
        console.error('发送验证码失败:', err)
        this.$Message.error('验证码发送失败，请稍后重试')
      } finally {
        this.resetPwdSendingCode = false
      }
    },
    /**
     * 新密码格式校验：长度 8-64，必须同时包含字母和数字
     * 规则与后端 resetInstanceLoginPassword 保持一致
     */
    validateResetPwd () {
      const pwd = this.resetPwdForm.newPassword || ''
      if (!pwd) {
        this.resetPwdError = ''
        return
      }
      if (pwd.length < 8 || pwd.length > 64) {
        this.resetPwdError = '新密码长度需为 8-64 位'
        return
      }
      if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
        this.resetPwdError = '新密码必须同时包含字母和数字'
        return
      }
      this.resetPwdError = ''
    },
    // iview FormItem 校验器：newPassword
    validateResetPwdNew (rule, value, callback) {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (value.length < 8 || value.length > 64) {
        callback(new Error('新密码长度需为 8-64 位'))
      } else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
        callback(new Error('新密码必须同时包含字母和数字'))
      } else {
        callback()
      }
    },
    // 提交重置密码
    async handleResetPwdOk () {
      if (!this.resetPwdInstance) return
      // 走 Form 校验（保证后端能直接通过 Bean 拿到合法密码）
      const valid = await new Promise((resolve) => {
        this.$refs.resetPwdFormRef.validate((v) => resolve(v))
      })
      if (!valid) return

      this.resetPwdLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/updateInstanceLoginPassword',
          method: 'post',
          data: {
            id: this.resetPwdInstance.id,
            loginPassword: this.resetPwdForm.newPassword,
            // 短信验证码：手机号不再由前端传递，后端从当前登录用户中获取
            verifyCode: this.resetPwdForm.verifyCode
          }
        })
        if (res.errcode === 0) {
          this.$Message.success('重置密码成功')
          this.resetPwdModalVisible = false
          this.loadData('noloading')
        } else {
          this.$Message.error(res.errmsg || '重置密码失败')
        }
      } catch (e) {
        console.error('重置密码异常:', e)
        const msg = (e && e.response && e.response.data && e.response.data.errmsg) || '重置密码失败，请稍后重试'
        this.$Message.error(msg)
      } finally {
        this.resetPwdLoading = false
      }
    },
    handleResetPwdCancel () {
      this.resetPwdModalVisible = false
    },
    handleResetPwdModalVisibleChange (visible) {
      if (!visible) {
        this.resetPwdForm = { phone: '', verifyCode: '', newPassword: '' }
        this.resetPwdError = ''
        this.resetPwdLoading = false
        this.resetPwdInstance = null
        // 关闭弹框时清掉验证码倒计时，防止内存泄漏
        if (this.resetPwdTimer) {
          clearInterval(this.resetPwdTimer)
          this.resetPwdTimer = null
        }
        this.resetPwdCountdown = 0
        this.resetPwdSendingCode = false
      }
    },

    // 显示续费弹框
    async showRenewModal (row) {
      this.renewInstance = row
      this.renewDuration = ''
      this.renewPriceInfo = {
        unitPrice: 0,
        originalPrice: 0,
        totalAmount: 0,
        discountAmount: 0
      }
      this.renewForm = {
        useBalance: true,
        balanceAmount: 0
      }

      // 先查询续费定价策略
      const hasStrategy = await this.loadRenewPricingStrategies(row)
      if (!hasStrategy) {
        this.$Message.error('当前产品不存在续费定价策略，无法续费')
        return
      }

      // 查询用户余额
      await this.loadUserBalance()

      // 显示弹框
      this.renewModalVisible = true
    },

    // 查询用户余额
    async loadUserBalance () {
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAccountService/getBalance',
          method: 'post',
          data: {}
        })
        res = { data: res }
        if (res.data.errcode === 0 && res.data.data) {
          this.balance = parseFloat(res.data.data.balance || 0)
          this.frozenBalance = parseFloat(res.data.data.frozenBalance) || 0
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.balance = 0
          this.frozenBalance = 0
        }
      } catch (e) {
        console.error('查询余额失败:', e)
        this.balance = 0
      }
    },

    // 查询续费定价策略
    async loadRenewPricingStrategies (row) {
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productSkuService/getSkuPricingStrategy',
          method: 'post',
          data: {
            id: row.product_config_id
          }
        })
        res = { data: res }
        if (res.data.errcode === 0 && res.data.data && res.data.data.length > 0) {
          const strategies = res.data.data
          // 按 sortOrder 排序：有 sortOrder 的按降序排列，没有的按默认顺序
          strategies.sort((a, b) => {
            const sortA = a.sortOrder
            const sortB = b.sortOrder
            if (sortA != null && sortB != null) {
              return sortB - sortA
            }
            if (sortA != null) return -1
            if (sortB != null) return 1
            return (a.sortOrder || 0) - (b.sortOrder || 0)
          })
          this.renewDurationOptions = strategies.map(item => {
            // const coutTypeName = item.coutType === 'month' ? '个月' : (item.coutType === 'year' ? '年' : (item.coutType === 'day' ? '天' : item.coutType))
            const discountRate = parseFloat(item.strategyValue)
            const discountText = !isNaN(discountRate) && discountRate > 0 && discountRate < 1 ? `${discountRate * 10}折` : ''
            // const discountText = !isNaN(discountRate) && discountRate > 0 && discountRate < 1 ? `${discountRate * 10}折` : ''
            return {
              // value: item.id,
              value: item.strategyName,
              label: item.strategyName,
              // label: (item.num || '') + coutTypeName + (discountText ? ' ' + discountText : ''),
              num: item.num,
              pricingStrategyDetailId: item.id,
              unitPrice: parseFloat(item.strategyValue || 0),
              originalPrice: parseFloat(item.strategyValue || 0),
              totalAmount: parseFloat(item.strategyValue || 0),
              discountText: discountText,
              disabled: false
            }
          })

          // 不默认选择续费时长，由用户手动选择
          return true
        } else if (res.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
          return false
        } else {
          this.renewDurationOptions = []
          return false
        }
      } catch (e) {
        console.error('查询定价策略失败:', e)
        this.$Message.error('加载定价策略失败')
        return false
      }
    },

    // 续费时长变更
    async handleRenewDurationChange (value) {
      this.renewForm.balanceAmount = 0
      this.selected = this.renewDurationOptions.find(opt => opt.value === value)
      if (this.selected && this.renewInstance) {
        try {
          let res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/productSkuService/calculatePrice',
            method: 'post',
            data: {
              billingType: 'monthly',
              skuId: this.renewInstance.product_config_id,
              quantity: 1,
              dataDiskIds: this.renewInstance.dataDiskIds || [],
              pricingStrategyDetailId: this.selected.pricingStrategyDetailId
            }
          })
          res = { data: res }
          if (res.data.errcode === 0 && res.data.data) {
            const priceResult = res.data.data
            this.renewPriceInfo = {
              unitPrice: parseFloat(priceResult.unitPrice || 0),
              originalPrice: parseFloat(priceResult.originalUnitPrice || 0),
              totalAmount: parseFloat(priceResult.totalAmount || 0),
              discountAmount: parseFloat(priceResult.savedAmount || 0)
            }
          } else if (res.data.errcode === 1001) {
            // 跳转到登录页
            sessionStorage.clear()
            this.$router.push('/login')
          } else {
            this.renewPriceInfo = {
              unitPrice: 0,
              originalPrice: 0,
              totalAmount: 0,
              discountAmount: 0
            }
          }
        } catch (e) {
          console.error('计算价格失败:', e)
          this.renewPriceInfo = {
            unitPrice: 0,
            originalPrice: 0,
            totalAmount: 0,
            discountAmount: 0
          }
        }
        // 更新使用金额（由 watch renewPriceInfo.totalAmount 触发）
        if (this.renewForm.useBalance) {
          this.autoFillBalanceAmount()
        }
      }
    },

    // 续费弹框显示/隐藏时重置表单
    handleRenewModalVisibleChange (visible) {
      // if (!visible) {
      //   this.renewForm.balanceAmount = 0
      // }
    },

    // 续费余额使用变更
    handleRenewBalanceChange (value) {
      if (value) {
        this.autoFillBalanceAmount()
      } else {
        this.renewForm.balanceAmount = 0
      }
    },

    /**
     * 自动填充续费使用金额
     * 规则：min(可用余额, 当前支付总金额)
     * 1) 金额1元，用户余额10元 -> 设置为1
     * 2) 金额2元，用户余额1元 -> 设置为1
     */
    autoFillBalanceAmount () {
      const total = parseFloat(this.renewPriceInfo.totalAmount || 0)
      if (total > 0) {
        this.renewForm.balanceAmount = parseFloat(
          Math.min(Math.max(this.availableBalance, 0), total).toFixed(2)
        )
      }
    },

    // 提交续费
    async handleRenewSubmit () {
      if (!this.renewDuration) {
        this.$Message.warning('请选择续费时长')
        return
      }

      this.selected = this.renewDurationOptions.find(opt => opt.value === this.renewDuration)
      if (!this.selected) {
        this.$Message.warning('请选择续费时长')
        return
      }
      // 先查询用户认证状态
      try {
        const authRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        });

        if (!authRes.data || authRes.data.authStatus !== 'PASSED') {
          this.submitLoading = false;
          this.$Message.error({
            content: '需要认证后才能进行购买',
            duration: 5
          });
          this.$router.push('/shenbeigpuai/control/auth-apply');
          return;
        }
        // 验证是否设置了支付密码（使用余额时需要）
        if (this.renewForm.useBalance && this.renewForm.balanceAmount > 0) {
          if (!authRes.data || !authRes.data.payPassword) {
            this.renewLoading = false;
            this.showSetPayPwdModal = true;
            return;
          }
        }
      } catch (e) {
        console.error('查询认证状态失败:', e);
        this.submitLoading = false;
        this.$Message.error('查询认证状态失败');
        return;
      }

      this.renewLoading = true

      // 校验余额是否足够（只有当用户输入的使用余额金额超过账户余额时才提示）
      const availableBalance = this.balance - this.frozenBalance
      if (this.renewForm.useBalance && this.renewForm.balanceAmount > 0 && availableBalance <= 0) {
        this.$Modal.confirm({
          title: '余额不足',
          content: `当前账户可用余额 ¥${availableBalance.toFixed(2)}，无法使用余额支付，请先充值后再试。`,
          okText: '去充值',
          cancelText: '取消',
          onOk: () => {
            this.goToRecharge()
          }
        })
        return
      }

      if (this.renewForm.useBalance && this.renewForm.balanceAmount > 0 && availableBalance < this.renewForm.balanceAmount) {
        this.$Modal.confirm({
          title: '余额不足',
          content: `当前账户可用余额 ¥${availableBalance.toFixed(2)}，您输入的使用金额 ¥${this.renewForm.balanceAmount.toFixed(2)} 超出余额，请重新输入。`,
          okText: '确定',
          cancelText: '取消'
        })
        return
      }

      // 如果使用余额大于0，需要先输入支付密码
      if (this.renewForm.useBalance && this.renewForm.balanceAmount > 0) {
        this.showPayPasswordModal()
        return
      }
      // 不需要支付密码，直接提交订单
      this.submitOrder('')
    },
    // 显示支付密码弹框
    showPayPasswordModal () {
      this.$Modal.confirm({
        title: '请输入支付密码',
        render: (h) => {
          return h('div', {
            style: {
              padding: '20px 0',
              fontSize: '14px',
              lineHeight: '1.6'
            }
          }, [
            h('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }
            }, [
              h('span', {
                style: {
                  fontSize: '14px',
                  color: '#515a6e',
                  whiteSpace: 'nowrap'
                }
              }, '支付密码：'),
              h('Input', {
                props: {
                  type: 'password',
                  placeholder: '请输入6位支付密码',
                  maxlength: 6,
                  autofocus: true,
                  autocomplete: 'off'
                },
                style: { width: '180px' },
                on: {
                  input: (val) => {
                    this.tempPayPassword = val
                  }
                }
              })
            ])
          ])
        },
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          if (!this.tempPayPassword || this.tempPayPassword.length !== 6) {
            this.$Message.error('支付密码必须为6位数字')
            this.renewLoading = false
            return
          }
          // 验证通过，执行提交订单逻辑
          this.submitOrder(this.tempPayPassword)
          this.tempPayPassword = ''
        },
        onCancel: () => {
          this.tempPayPassword = ''
          // this.renewModalVisible = false
          this.renewLoading = false
        }
      })
    },
    // 校验设置支付密码确认
    validateSetPayPwdConfirm (rule, value, callback) {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.setPayPwdForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    // 设置支付密码确认
    async handleSetPayPwdOk () {
      this.setPayPwdLoading = true
      const valid = await new Promise((resolve) => {
        this.$refs.setPayPwdFormRef.validate((v) => resolve(v))
      })
      if (!valid) {
        this.setPayPwdLoading = false
        return
      }
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/updatePayPassword',
          method: 'post',
          data: {
            oldPayPassword: '',
            newPayPassword: this.$aesEncrypt(this.setPayPwdForm.newPassword),
            confirmPayPassword: this.$aesEncrypt(this.setPayPwdForm.confirmPassword)
          }
        })
        if (res.errcode === 0) {
          this.$Message.success('支付密码设置成功')
          this.showSetPayPwdModal = false
          this.$refs.setPayPwdFormRef.resetFields()
          this.renewLoading = false
        } else {
          this.$Message.error(res.errmsg || '设置失败')
          this.setPayPwdLoading = false
        }
      } catch (e) {
        console.error('设置支付密码失败:', e)
        this.$Message.error('设置失败，请稍后重试')
        this.setPayPwdLoading = false
      }
    },
    // 设置支付密码取消
    handleSetPayPwdCancel () {
      this.$refs.setPayPwdFormRef.resetFields()
      this.setPayPwdLoading = false
      this.showSetPayPwdModal = false
      this.renewLoading = false
    },
    // 提交订单（payPassword为支付密码，如果不需要验证则为空）
    async submitOrder (payPassword) {
      // 开始提交，设置loading状态
      this.submitLoading = true
      // 生成UUID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }

      // 2. 调用订单创建接口
      try {
        // 构建订单参数，按量付费时不传递购买时长相关参数
        const orderData = {
          id: generateUUID(),
          instanceId: this.renewInstance.id,
          skuId: this.renewInstance.product_config_id,
          pricingStrategyDetailId: this.selected.pricingStrategyDetailId,
          balanceAmount: this.renewForm.useBalance ? this.renewForm.balanceAmount : 0
        }
        // 如果有支付密码，添加到订单数据中
        if (payPassword) {
          orderData.payPassword = this.$aesEncrypt(payPassword)
        }
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/orderService/addRenewOrder',
          method: 'post',
          data: orderData
        })

        if (res.errcode === 0) {
          // 保存订单结果，用于后续确认支付
          let orderResult = res.data

          // 处理价格提示信息
          if (orderResult.priceWarningMessage) {
            this.$Message.warning(orderResult.priceWarningMessage)
          }
          // 如果后端计算的金额与前端不一致，使用后端计算的金额
          let finalAmount = orderResult.totalAmount || this.totalAmount
          // 订单创建成功后，设置支付确认弹框数据并显示
          this.orderResult = orderResult
          this.finalAmount = finalAmount
          this.remainingAmount = Math.max(0, finalAmount - (this.renewForm.useBalance ? this.renewForm.balanceAmount : 0))
          this.useWechatPay = this.remainingAmount > 0 && this.renewForm.billingType !== 'hourly'
          this.isPaySuccess = false
          this.testOrderQrCodeUrl = ''

          // 如果是混合支付，冻结余额增加（本次使用的余额金额）
          if (this.renewForm.useBalance && this.renewForm.balanceAmount > 0 && this.useWechatPay) {
            this.frozenBalance = (this.frozenBalance || 0) + this.renewForm.balanceAmount
          }

          // 如果需要微信支付，获取测试二维码
          if (this.useWechatPay) {
            try {
              const qrRes = await this.$hdAxios.request({
                url: '/api/ac/shenbeigpuai/rechargeOrderService/createTestOrderQrCode',
                method: 'post',
                data: {
                  orderId: orderResult.orderId
                }
              })
              if (qrRes.errcode === 0 && qrRes.data) {
                this.testOrderQrCodeUrl = qrRes.data.qrCodeUrl
                this.testOrderId = orderResult.orderId
                this.submitLoading = false
                // 二维码渲染统一放到支付弹框打开后（renderPayQrCode），此处只保存链接
                // 开始轮询支付状态
                this.startPaymentPolling()
              }
            } catch (e) {
              console.error('获取二维码失败:', e)
              this.submitLoading = false
              this.testOrderQrCodeUrl = ''
            }
          }

          // 判断余额是否足够抵扣支付金额
          if (this.remainingAmount <= 0) {
            // 余额足够，直接跳转实例列表页（后端会在addOrder末尾自动处理实例创建）
            this.$Message.success('实例续费成功！')
            this.renewModalVisible = false
            this.submitLoading = false
            this.renewLoading = false
            setTimeout(() => {
              this.$router.push('/shenbeigpuai/control/instance-list')
            }, 1000)

          } else {
            // 余额不足，显示支付确认弹框
            this.payModalVisible = true
            this.submitLoading = false
            // 弹框打开后再渲染二维码：canvas 在弹框内，弹框未打开前 $refs.qrCanvas 取不到
            this.$nextTick(() => { this.renderPayQrCode() })
          }
        } else {
          this.$Message.error(res.errmsg || '订单创建失败')
          this.submitLoading = false
          this.renewModalVisible = false // 关闭续费弹框
          this.renewLoading = false
        }
      } catch (e) {
        console.error('订单创建异常:', e)
        // 尝试从错误响应中提取后端返回的错误信息
        const errorMsg = e.response.data.errmsg || '订单创建失败，请稍后重试'
        this.$Message.error(errorMsg)
        this.submitLoading = false
        this.renewModalVisible = false // 关闭续费弹框
        this.renewLoading = false
      }
    },

    // 渲染微信支付二维码到支付弹框内的 canvas（必须在弹框打开后调用）
    renderPayQrCode () {
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
          const res = await this.$hdAxios.request({
            url: '/api/ac/shenbeigpuai/orderService/getOrderPaymentStatus',
            method: 'post',
            data: {
              orderId: this.testOrderId
            }
          })

          if (res.errcode === 0 && res.data) {
            const paymentStatus = res.data.status
            // 支付成功
            if (paymentStatus === 'paid') {
              this.stopPaymentPolling()
              this.isPaySuccess = true
              // 混合支付成功，释放冻结余额（从冻结中扣除本次使用的余额金额）
              if (this.renewForm.useBalance && this.renewForm.balanceAmount > 0) {
                this.frozenBalance = Math.max(0, (this.frozenBalance || 0) - this.renewForm.balanceAmount)
              }
              this.$Message.success('扫码支付成功！请稍后查看')
              this.renewModalVisible = false
              this.submitLoading = false
              this.renewLoading = false
              // 直接跳转到实例列表页（后端定时任务会自动创建实例）
              setTimeout(() => {
                this.$router.push('/shenbeigpuai/control/instance-list')
              }, 1000)
            }
          }
        } catch (error) {
          console.error('轮询支付状态失败', error)
        }
      }, this.pollingInterval)
    },

    // 关机实例（异步）
    async stopVM (row) {
      row.status = '停止中'
      this.stoppingInstances[row.id] = true

      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/updateAsyncStopVM',
          method: 'post',
          data: {
            id: row.id
          }
        })
        res = { data: res }
        if (res.data.errcode === 0) {
          this.$Message.success({
            content: '已创建停止任务',
            duration: 0
          })
          // 重新加载列表
          setTimeout(async () => {
            this.$Message.destroy()
            await this.loadData('noloading')
          }, 1000)
        } else {
          this.$Message.destroy()
          this.$Message.error(res.data.errmsg || '创建停止任务失败')
        }
      } catch (e) {
        this.$Message.destroy()
        console.error('创建停止任务异常:', e)
        this.$Message.error('网络异常，请稍后重试')
      } finally {
        this.actionLoading = false
      }
    },

    async startVM (row) {
      row.status = '开机中'
      this.startingInstances[row.id] = true
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/updateAsyncStartVM',
          method: 'post',
          data: {
            id: row.id,
            node: row.node,
            vmid: row.vmid
          }
        })
        res = { data: res }
        if (res.data.errcode === 0) {
          this.$Message.success({
            content: '已创建开机任务',
            duration: 0
          })
          // 重新加载列表
          setTimeout(async () => {
            this.$Message.destroy()
            await this.loadData('noloading')
          }, 1000)
        } else {
          this.$Message.destroy()
          // 9003 余额不足，重置开机中状态
          if (res.data.errcode === 9003) {
            this.startingInstances[row.id] = false
            row.status = '已停止'
            this.$Message.error(res.data.errmsg || '开机失败')
          }
          // 9004 没有空余显卡可以被分配，弹框询问用户是否进行无显卡开机
          if (res.data.errcode === 9004) {
            this.$Modal.confirm({
              title: '显卡资源不足',
              content: '由于按量计费实例不独占显卡，当前服务器已无显卡资源，是否进行无显卡开机？',
              okText: '无显卡开机',
              cancelText: '取消',
              onOk: async () => {
                // 用户确认无显卡开机：重新调用开机接口，多传一个标志位（后端后续识别）
                await this.startVMWithoutGpu(row)
              },
              onCancel: () => {
                this.startingInstances[row.id] = false
                row.status = '已停止'
              }
            })
          }
        }
      } catch (e) {
        this.$Message.destroy()
        console.error('开机实例异常:', e)
        this.$Message.error('网络异常，请稍后重试')
        this.startingInstances[row.id] = false
        row.status = 'stopped'
      } finally {
        this.actionLoading = false
      }
    },

    // 无显卡开机：在 9004 弹框中用户确认后调用，
    // 与普通开机的区别只是多带一个 forceStartWithoutGpu=1 标志，后端后续按此跳过显卡预校验 / 跳过 hostpci 分配。
    async startVMWithoutGpu (row) {
      row.status = '开机中'
      this.startingInstances[row.id] = true
      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/updateAsyncStartVM',
          method: 'post',
          data: {
            id: row.id,
            node: row.node,
            vmid: row.vmid,
            forceStartWithoutGpu: 1
          }
        })
        res = { data: res }
        if (res.data.errcode === 0) {
          this.$Message.success({
            content: '已创建无显卡开机任务',
            duration: 0
          })
          setTimeout(async () => {
            this.$Message.destroy()
            await this.loadData('noloading')
          }, 1000)
        } else {
          this.$Message.destroy()
          this.$Message.error(res.data.errmsg || '无显卡开机失败')
          this.startingInstances[row.id] = false
          row.status = '已停止'
        }
      } catch (e) {
        this.$Message.destroy()
        console.error('无显卡开机实例异常:', e)
        this.$Message.error('网络异常，请稍后重试')
        this.startingInstances[row.id] = false
        row.status = 'stopped'
      } finally {
        this.actionLoading = false
      }
    },

    // 删除/退款实例
    async handleDeleteInstance (row, actionName) {
      this.$Modal.confirm({
        title: `确认${actionName}实例`,
        content: `请确保实例 ${row.instance_name} 内已无重要内容，${actionName}后无法恢复。确定要${actionName}吗？`,
        loading: true,
        onOk: async () => {
          try {
            const res = await this.$hdAxios.request({
              url: '/api/ac/shenbeigpuai/instanceService/deleteInstance',
              method: 'post',
              data: {
                id: row.id
              }
            })
            this.$Modal.remove()
            if (res.errcode === 0) {
              this.$Message.success(`${actionName}成功`)
              this.loadData()
            } else {
              this.$Message.error(res.errmsg || `${actionName}失败`)
            }
          } catch (error) {
            this.$Modal.remove()
            this.$Message.error(error.message || `${actionName}失败`)
          }
        },
        onCancel: () => {
          this.$Message.info('已取消操作')
        }
      })
    },

    // 显示退款确认弹框（先调后端拉退款明细展示）
    async showRefundModal (row) {
      this.refundInstance = row
      this.refundDetail = null
      this.refundDetailLoading = true
      this.refundModalVisible = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/getInstanceRefundDetail',
          method: 'post',
          data: { id: row.id }
        })
        if (res.errcode === 0 && res.data) {
          this.refundDetail = res.data
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.refundDetailLoading = false
          this.$router.push('/login')
        } else {
          this.$Message.error(res.errmsg || '查询退款明细失败')
          this.refundModalVisible = false
        }
      } catch (error) {
        this.$Message.error(error.message || '查询退款明细失败')
        this.refundModalVisible = false
      } finally {
        this.refundDetailLoading = false
      }
    },

    // 用户点击"确认退款"，调真正的 deleteInstance 接口
    async confirmRefund () {
      if (!this.refundInstance) return
      this.refundSubmitting = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/deleteInstance',
          method: 'post',
          data: { id: this.refundInstance.id }
        })
        if (res.errcode === 0) {
          this.$Message.success('退款已提交，实例释放中')
          this.refundModalVisible = false
          this.loadData()
        } else {
          this.$Message.error(res.errmsg || '退款失败')
        }
      } catch (error) {
        this.$Message.error(error.message || '退款失败')
      } finally {
        this.refundSubmitting = false
      }
    },

    // 用户点击"继续使用"
    handleRefundCancel () {
      this.refundModalVisible = false
    },

    // 退款弹框关闭时清理状态
    handleRefundModalVisibleChange (visible) {
      if (!visible) {
        this.refundDetail = null
        this.refundInstance = null
        this.refundSubmitting = false
        this.refundDetailLoading = false
      }
    },

    // 根据金额计算优惠金额：原价 - 实付
    calcDiscountAmount (item) {
      const original = Number(item.totalOriginalAmount || 0)
      const final = Number(item.totalFinalAmount || 0)
      const amount = Math.max(original - final, 0)
      return amount.toFixed(2)
    },
    // 根据金额计算折扣率：(原价 - 实付) / 原价
    calcDiscountRate (item) {
      const original = Number(item.totalOriginalAmount || 0)
      const final = Number(item.totalFinalAmount || 0)
      if (original <= 0) return 0
      const discountAmount = original - final
      if (discountAmount <= 0) return 0
      return discountAmount / original
    },
    // 把折扣率（0.1 = 9 折）格式化成"9 折"显示
    // discountRate 为优惠占原价的比例：0 表示无折扣，0.1 表示 9 折，0.5 表示 5 折
    // 例如 rate=0.0437 (优惠占原价 4.37%) -> 实付比例 = 1 - 0.0437 = 0.9563 -> 9.6 折
    formatDiscountRate (rate) {
      const r = Number(rate || 0)
      if (r <= 0) return ''
      // 实付比例 = 1 - rate，例如 rate=0.1 → 0.9 → 折数 = 0.9 * 10 = 9 折
      const fold = (1 - r) * 10
      // 保留一位小数，例如 9.563 -> "9.6"
      let formatted = (Math.round(fold * 10) / 10).toFixed(1)
      // 去掉末尾的 .0，例如 "9.0" -> "9"
      if (formatted.endsWith('.0')) {
        formatted = formatted.slice(0, -2)
      }
      return formatted + ' 折'
    },

    // 停止实例（异步）
    // async stopInstance(row) {
    //   // 先将前端状态改为"停止中"，按钮置灰
    //   this.$set(row, 'status', '停止中')
    //   this.stoppingInstances[row.id] = true

    //   this.actionLoading = true
    //   this.$Message.loading({
    //     content: '正在创建停止任务...',
    //     duration: 0
    //   })
    //   try {
    //     let res = await this.$hdAxios.request({
    //       url: '/api/ac/shenbeigpuai/instanceService/asyncStopInstance',
    //       method: 'post',
    //       data: {
    //         id: row.id
    //       }
    //     })
    //     res = { data: res }
    //     if (res.data.errcode === 0) {
    //       this.$Message.destroy()
    //       this.$Message.success('停止任务已创建，请稍后刷新查看状态')
    //     } else {
    //       this.$Message.destroy()
    //       this.$Message.error(res.data.errmsg || '创建停止任务失败')
    //       // 失败时恢复状态
    //       this.$delete(this.stoppingInstances, row.id)
    //       row.status = '运行中'
    //     }
    //   } catch (e) {
    //     this.$Message.destroy()
    //     console.error('创建停止任务异常:', e)
    //     this.$Message.error('网络异常，请稍后重试')
    //     // 异常时恢复状态
    //     this.$delete(this.stoppingInstances, row.id)
    //     row.status = '运行中'
    //   } finally {
    //     this.actionLoading = false
    //   }
    // },

    // 租用新的实例
    handleAddInstance () {
      this.$router.push('/shenbeigpuai/control/instance-buy')
    },

    // 显示实例详情弹框
    async showDetailModal (row) {
      this.detailModalVisible = true
      this.loadingDetail = true
      this.instanceDetail = null
      // 打开弹框时复位"按住显示明文"状态
      this.showPassword = false

      try {
        let res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/getInstanceDetail',
          method: 'post',
          data: {
            id: row.id
          }
        })
        res = { data: res }
        if (res.data.errcode === 0) {
          const detail = res.data.data
          // 格式化详情数据，直接使用驼峰式字段名
          console.log('detail:', detail)
          this.instanceDetail = {
            ...detail,
            // 时间字段已经格式化，直接使用
            createTime: detail.createTime,
            updateTime: detail.updateTime,
            expireTime: detail.expireTime,
            // 计费和支付方式
            billing_type: this.formatBillingType(detail.itemBillingType),
            payment_method: this.formatPaymentMethod(detail.paymentMethod),
            // 状态
            status: this.formatStatus(row.status),
            // 测试用（前后4位明文，中间加*号）
            // loginUsername: 'aaa',
            // loginPasswordRaw: '1234567890',
            // loginPassword: this.maskPassword('1234567890'),
            loginUsername: detail.loginUsername || '',
            loginPasswordRaw: detail.loginPassword || '',
            loginPassword: this.maskPassword(detail.loginPassword || ''),
          }
        } else {
          this.$Message.error(res.data.errmsg || '获取实例详情失败')
          this.detailModalVisible = false
        }
      } catch (e) {
        console.error('获取实例详情异常:', e)
        this.$Message.error('网络异常，请稍后重试')
        this.detailModalVisible = false
      } finally {
        this.loadingDetail = false
      }
    },
    // ========== 裸金属(BM) KVM 终端(平台 WS 代理 + ASPEED decode_worker) ==========
    /**
     * 判断一行实例是否为裸金属(BM)：cloudPlatform === 'BM'。
     * （VM 虚拟机走"控制台"noVNC，BM 裸金属走"终端"平台 KVM 代理）
     */
    isBmInstance (row) {
      const raw = row && (row._raw || row)
      return !!(raw && raw.cloudPlatform === 'BM')
    },
    /**
     * 打开裸金属终端:
     *   1) 调后端 bmcKvmProxyService.issueKvmConsoleToken 拿一次性 token + machineId
     *   2) 经后端 bmcKvmAssetService 拉取 ASPEED decode_worker.js（前端不暴露 BMC 地址）
     *   3) new WebSocket(ws/bm-kvm?token=...) → 收到帧喂 decode_worker → canvas 渲染
     *   4) 键鼠监听 → IUSB-HID 指令上行 → 平台 WS → BMC /kvm
     */
    async openBmKvmConsole (row) {
      try {
        const payload = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/getBmcKvmConsoleToken',
          method: 'post',
          data: { id: row.id }
        })
        if (!payload || payload.errcode !== 0 || !payload.data || !payload.data.token) {
          throw new Error((payload && payload.errmsg) || '获取BMC终端访问令牌失败')
        }
        const token = payload.data.token
        // 新窗口打开重定向接口:后端消费 token 并 302 到 BMC 自带 H5 KVM 页面
        window.open(
          `/api/ac/shenbeigpuai/instanceService/redirectToBmcKvm?token=${encodeURIComponent(token)}`,
          '_blank'
        )
      } catch (e) {
        console.error('[BMKVM] 打开失败:', e)
        this.$Message.error(e.message || 'BMC 终端打开失败')
      }
    },
    // ========== VNC 控制台(noVNC RFB 直连 + 后端 WS 代理) ==========
    /**
     * 打开 VNC 控制台:
     *   1) 调后端 vncProxyService.issueVncConsoleToken 拿一次性 token
     *   2) new RFB(div, wsUrl) 连后端 /api/ac/shenbeigpuai/ws/vnc?instanceId=xxx&token=xxx
     *   3) 后端 VncWebSocketServer 凭 token 从 VncTokenStore 拿 node/vmid,代为连 PVE vncwebsocket
     */
    async openVncConsole (row) {
      // 先断开旧 RFB(防止上一个会话 WS 残留),再清引用
      this._cleanupRfb()
      this.vncDialog.show = true
      this.vncDialog.instanceId = row.id
      this.vncDialog.instanceName = row.instance_name || row.name || ''
      this.vncDialog.status = 'connecting'
      this.vncDialog.connecting = true

      // Modal 在 iView 中是隐藏式不会销毁 DOM, 这里手动清空 RFB 容器内的旧 canvas,
      // 避免第二次打开时叠加渲染
      this.$nextTick(() => {
        const screen = this.$refs.vncScreen
        if (screen) {
          while (screen.firstChild) screen.removeChild(screen.firstChild)
          // 还原 noVNC 注入的一些内联样式/尺寸
          screen.style.background = ''
        }
      })

      try {
        const payload = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/vncProxyService/issueVncConsoleToken',
          method: 'post',
          data: { id: row.id }
        })
        if (!payload || payload.errcode !== 0 || !payload.data) {
          throw new Error((payload && payload.errmsg) || '获取VNC凭据失败')
        }
        const { token, password, wsPath } = payload.data
        if (!token || !password) {
          throw new Error('VNC响应缺少 token / password')
        }

        if (!this.$RFB) {
          throw new Error('noVNC RFB 未加载,请联系管理员确认 scpcw-pc-plugin 包含 RFB')
        }

        // 拼 ws URL: 路径固定 /api/ac/shenbeigpuai/ws/vnc,instanceId + token 都走 query 参数
        // (后端用 JSR-356 @ServerEndpoint 模式,参考 WeChatWebSocketServer)
        const proto = location.protocol === 'https:' ? 'wss' : 'ws'
        const wsUrl = `${proto}://${location.host}/api/ac/shenbeigpuai/ws/vnc?instanceId=${encodeURIComponent(this.vncDialog.instanceId)}&token=${encodeURIComponent(token)}`
        console.log('[VNC] wsUrl =', wsUrl)

        // 关键: 第一个参数必须是 div 容器(不是 canvas),noVNC 1.6.0 会自己创建 canvas
        // password 是 PVE vncproxy 返回的 vncticket,RFB VNCAuth 阶段用 DES 加密挑战
        // 参考 Demo 文档第 142 行
        const rfb = new this.$RFB(this.$refs.vncScreen, wsUrl, { credentials: { password } })
        this.vncDialog.rfb = rfb

        rfb.addEventListener('connect', () => {
          console.log('[VNC] rfb connect')
          this.vncDialog.status = 'connected'
          this.vncDialog.connecting = false
        })
        rfb.addEventListener('disconnect', (e) => {
          console.log('[VNC] rfb disconnect', e && e.detail)
          this.vncDialog.connecting = false
          this.vncDialog.status = (e && e.detail && e.detail.clean === false) ? 'error' : 'disconnected'
        })
        rfb.addEventListener('securityfailure', (e) => {
          console.warn('[VNC] securityfailure', e && e.detail)
        })
        rfb.addEventListener('desktopname', (e) => {
          console.log('[VNC] desktopname', e && e.detail && e.detail.name)
        })
        rfb.scaleViewport = true
        rfb.resizeSession = false
      } catch (e) {
        console.error('[VNC] 打开失败:', e)
        this.$Message.error(e.message || 'VNC 打开失败')
        this.closeVncDialog()
      }
    },
    closeVncDialog () {
      // 统一走 _cleanupRfb,逻辑与重连/重开保持一致
      this._cleanupRfb()
      // iView Modal 隐藏时不会销毁内部 DOM,noVNC 注入的 canvas/fb 容器留在里面,
      // 下次打开会出现两个 canvas 叠加. 这里手动清掉容器内的子节点.
      const screen = this.$refs.vncScreen
      if (screen) {
        while (screen.firstChild) screen.removeChild(screen.firstChild)
        screen.style.background = ''
      }
      const d = this.vncDialog
      d.connecting = false
      d.status = 'idle'
      d.show = false
      d.fullscreen = false
      d.instanceId = ''
      d.instanceName = ''
    },
    /**
     * 统一断开 RFB 并清空引用
     * 优先用 noVNC 公开 API (cleanup);老版本无 cleanup 时再用 _sock.readyState guard
     * 多个调用方(closeVncDialog / reconnectVnc / openVncConsole / beforeunload / pagehide)复用此方法
     */
    _cleanupRfb () {
      const rfb = this.vncDialog && this.vncDialog.rfb
      if (!rfb) return
      // 1) 优先走 noVNC 公开 API（cleanup 或 disconnect）
      try {
        if (typeof rfb.cleanup === 'function') {
          rfb.cleanup()
        } else if (typeof rfb.disconnect === 'function') {
          // 无论 readyState 是 0/1/2 都调用 disconnect，避免 CONNECTING 时直接 return
          rfb.disconnect()
        }
      } catch (e) { /* ignore */ }
      // 2) 兜底：直接拿到内部 WebSocket 引用强制 close()
      //    noVNC 在 rfb._sock 或 rfb.getWebSocket() 暴露 ws
      try {
        let ws = null
        if (typeof rfb.getWebSocket === 'function') {
          ws = rfb.getWebSocket()
        } else if (rfb._sock) {
          ws = rfb._sock
        }
        if (ws && typeof ws.close === 'function') {
          // 1000 = Normal Closure，让后端 onClose 能正常触发
          try { ws.close(1000, 'cleanup') } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
      this.vncDialog.rfb = null
    },
    reconnectVnc () {
      if (!this.vncDialog.instanceId) return
      // 不调 closeVncDialog(它会 d.show=false 关弹框),只重置 RFB 和状态
      this._cleanupRfb()
      this.vncDialog.status = 'idle'
      this.vncDialog.connecting = false
      const row = { id: this.vncDialog.instanceId, instance_name: this.vncDialog.instanceName }
      this.openVncConsole(row)
    },
    // 同步浏览器原生全屏状态(用户按 Esc 退出时触发)
    onFullscreenChange () {
      this.vncDialog.fullscreen = !!document.fullscreenElement
    },
    /**
     * 切换浏览器原生全屏
     * 注意: 浏览器要求全屏必须在用户手势中触发,不能程序自动调
     */
    toggleVncFullscreen () {
      const el = document.querySelector('.vnc-dialog__screen')
      if (!el) {
        this.$Message.warning('VNC 画面未就绪')
        return
      }
      if (!document.fullscreenElement) {
        // 进入全屏
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
        if (req) {
          req.call(el).then(() => {
            this.vncDialog.fullscreen = true
          }).catch(err => {
            console.warn('[VNC] requestFullscreen failed:', err)
          })
        }
      } else {
        // 退出全屏
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
        if (exit) {
          exit.call(document).then(() => {
            this.vncDialog.fullscreen = false
          }).catch(err => {
            console.warn('[VNC] exitFullscreen failed:', err)
          })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.instance-list {
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

  // 状态筛选下拉：13px（iView 默认 14px，需穿透到子组件并 !important 覆盖）
  &__search-select {

    /deep/ .ivu-select-placeholder,
    /deep/ .ivu-select-selected-value,
    /deep/ .ivu-select-input,
    /deep/ .ivu-select-selection {
      font-size: 13px !important;
    }
  }

  // 搜索输入框：13px（iView 默认 14px，需穿透到子组件并 !important 覆盖）
  &__search-input {

    /deep/ .ivu-input,
    /deep/ .ivu-input-placeholder {
      font-size: 13px !important;
    }
  }

  &__header {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    // justify-content: space-between;
    margin-bottom: 16px;
  }

  &__add-btn {
    font-size: 13px;
    // background-color: #4079ff;
    // border-color: #4079ff;
    // font-size: 13px;
    // height: 34px;
    // padding: 0 16px;
    // border-radius: 4px;

    // &:hover {
    //   background-color: #5a8dff;
    //   border-color: #5a8dff;
    // }
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__search-input {
    width: 220px;

    /deep/ .ivu-input {
      height: 34px;
      border-radius: 4px;
    }
  }

  &__search-select {
    width: 120px;

    /deep/ .ivu-select-selection {
      height: 34px;
      border-radius: 4px;

      .ivu-select-placeholder,
      /deep/ .ivu-select-selected-value {
        height: 34px;
        line-height: 32px;
      }
    }
  }

  &__search-btn {
    // height: 34px;
    // padding: 0 20px;
    // border-radius: 4px;
    font-size: 13px;
  }

  &__card {
    width: 100%;

    /deep/ .ivu-card,
    /deep/ .ivu-card-body {
      width: 100%;
    }

    /deep/ .ivu-card-body {
      padding: 0;
    }
  }

  &__cell-instance {
    cursor: default;
    -webkit-user-select: none;
    user-select: none;
    caret-color: transparent;

    .instance_name {
      // color: #333;
      color: #000000;
      font-weight: 600;
      caret-color: transparent;
    }

    .id {
      // color: #999;
      color: #000000;
      font-size: 12px;
      caret-color: transparent;
    }
  }

  &__actions {
    display: flex;
    // flex-direction: column;
    // align-items: flex-end;
    justify-content: center;
    gap: 4px;

    .action-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;

      a {
        color: #4079ff;
        font-size: 12px;
        white-space: nowrap;

        &:hover {
          text-decoration: underline;
        }

        &.danger {
          color: red;
        }

        &.disabled-link {
          color: #999;
          cursor: not-allowed;
          text-decoration: none;

          &:hover {
            text-decoration: none;
          }
        }
      }
    }
  }

  &__actions-disabled {
    display: flex;
    align-items: center;
    justify-content: center;

    .refunding-text {
      color: #999;
      font-size: 12px;
    }
  }

  &__pagination {
    margin-top: 20px;
    text-align: right;
    padding-bottom: 20px;
  }

  /deep/ .ivu-table-header th {
    background-color: #f2f5fa;
    // color: #666;
    color: #000000;
    font-weight: bold;
    font-size: 13px;
    // font-size: 12px;
    border-bottom: none;
  }

  /deep/ .ivu-table {
    color: #000000;
  }

  /deep/ .ivu-table-td {
    font-size: 12px;
    color: #333;
  }

  /deep/ .ivu-table-wrapper {
    border: none;
    width: 100%;
  }

  /deep/ .ivu-table {
    width: 100% !important;
    min-width: 100%;
    table-layout: auto;
  }

  /deep/ .ivu-table:before,
  /deep/ .ivu-table:after {
    display: none;
  }

  // 状态单元格样式
  .status-cell {
    display: inline-flex;
    align-items: center;
    color: #000000;

    &__loading {
      margin-left: 6px;
      // 跟随当前状态文字颜色，避免与其他主题色冲突
      color: currentColor;
      // 显式旋转动画：覆盖 iview 内置动画可能被某些样式干扰的情况，
      // 同时确保在表头 / 列表单元格里都能稳定转动
      animation: status-cell-spin 0.9s linear infinite;
      transform-origin: 50% 50%;
    }

    &.status-processing {
      color: #fa8c16; // 橘黄色
      font-weight: 500;
    }

    &.status-running {
      color: #19be6b; // 绿色
      font-weight: 500;
    }

    &.status-expired {
      color: #ed4014; // 红色
      font-weight: 500;
    }
  }

  @keyframes status-cell-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}

.instance-detail-modal {
  &__header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #1f2937;

    .instance-detail-modal__icon {
      font-size: 18px;
      color: #4079ff;
      margin-right: 8px;
    }
  }

  // 让 Modal body 内容更紧凑
  /deep/ .ivu-modal-body {
    padding: 20px 28px 28px;
  }

  .detail-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;

    p {
      margin-top: 16px;
      color: #999;
    }
  }

  .detail-content {
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

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px 24px;
        background: #fafbfc;
        border: 1px solid #eef0f4;
        border-radius: 6px;
        padding: 14px 18px;
      }

      .detail-grid-self {
        // display: grid;
        // grid-template-columns: repeat(2, 1fr);
        // gap: 10px 24px;
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
          grid-column: 1 / -1;
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
          // padding: 1px 10px;
          // border-radius: 10px;
          font-size: 12px;
          line-height: 20px;

          &.status-运行中 {
            // background-color: #e6f7ff;
            color: #1890ff;
          }

          &.status-已停止 {
            // background-color: #fff1f0;
            color: #ff4d4f;
          }

          &.status-已过期 {
            // background-color: #fff1f0;
            color: #ff4d4f;
          }

          &.status-已挂起 {
            // background-color: #fffbe6;
            color: #faad14;
          }

          &.status-已删除 {
            // background-color: #f5f5f5;
            color: #999;
          }

          &.status-退款中 {
            // background-color: #fff1f0;
            color: #ff4d4f;
          }
        }
      }

      .detail-subsection {
        margin-top: 14px;

        .subsection-title {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .empty-tip {
          font-size: 13px;
          color: #9ca3af;
          background: #fafbfc;
          border: 1px dashed #e5e7eb;
          border-radius: 6px;
          padding: 14px;
          text-align: center;
        }
      }
    }
  }
}

.renew-modal-content {
  .renew-instance-info {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 100px;
        color: #666;
        font-size: 14px;
      }

      .value {
        flex: 1;
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .renew-duration-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .select-label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .ivu-radio-wrapper {
      margin-right: 16px;
      margin-bottom: 12px;
    }

    .discount-tag {
      background: #ff4d4f;
      color: #fff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 8px;
    }
  }

  .renew-price-summary {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;

    .price-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #666;
        font-size: 14px;
      }

      .value {
        color: #333;
        font-size: 14px;

        &.original-price {
          text-decoration: line-through;
          color: #999;
        }

        &.price-red {
          color: #ff4d4f;
          font-weight: bold;
          font-size: 16px;
        }
      }

      &.total {
        padding-top: 8px;
        border-top: 1px solid #e8e8e8;
        margin-top: 8px;
      }
    }
  }

  .renew-balance-check {
    .ivu-checkbox-wrapper {
      margin-bottom: 8px;
    }

    .balance-input-row {
      display: flex;
      align-items: center;
      padding-left: 24px;
      font-size: 14px;
      color: #666;
    }
  }
}

.vnc-dialog {
  display: flex;
  flex-direction: column;
}

.vnc-dialog__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-bottom: none;
}

.vnc-dialog__screen {
  width: 100%;
  height: 540px;
  background: #000;
  outline: none;
  border: 1px solid #e8e8e8;
}

.vnc-dialog__iframe {
  width: 100%;
  height: 540px;
  background: #000;
  border: 1px solid #e8e8e8;
  display: block;
}

.vnc-dialog__status {
  font-size: 12px;
}

.vnc-dialog__status.is-idle {
  color: #999;
}

.vnc-dialog__status.is-connecting {
  color: #2d8cf0;
}

.vnc-dialog__status.is-connected {
  color: #19be6b;
}

.vnc-dialog__status.is-disconnected {
  color: #ff9900;
}

.vnc-dialog__status.is-error {
  color: #ed4014;
}

// ====== BM(KVM) 终端弹框 ======
.bmkvm-dialog {
  display: flex;
  flex-direction: column;
}

.bmkvm-dialog__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-bottom: none;
}

.bmkvm-dialog__screen {
  width: 100%;
  height: 540px;
  background: #000;
  outline: none;
  border: 1px solid #e8e8e8;
  position: relative;
  overflow: hidden;
}

.bmkvm-dialog__screen canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.bmkvm-dialog__status {
  font-size: 12px;
}

// BM 状态颜色直接复用 .vnc-dialog__status 的 .is-* 类（computed 返回值一致）

.bmkvm-dialog__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  color: #ddd;
}

.bmkvm-dialog__loading-text {
  font-size: 13px;
  letter-spacing: 1px;
}

// 退款确认弹框样式
.refund-modal-content {
  padding: 0 4px;

  .refund-instance-info {
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 16px;

    .info-row {
      display: flex;
      line-height: 28px;
      font-size: 13px;

      .label {
        color: #909399;
        width: 90px;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
      }
    }
  }

  .refund-summary {
    padding: 14px 16px;
    background: #ecf5ff;
    border-left: 3px solid #2d8cf0;
    border-radius: 4px;
    margin-bottom: 16px;

    .summary-row {
      display: flex;
      justify-content: space-between;
      line-height: 28px;
      font-size: 13px;
      color: #606266;

      &.highlight {
        margin-top: 6px;
        padding-top: 8px;
        border-top: 1px dashed #c0d8f5;
        font-size: 14px;

        .summary-value {
          font-weight: bold;
          font-size: 18px;
        }
      }

      &.sub {
        font-size: 12px;
        color: #909399;
        justify-content: flex-end;
      }
    }
  }

  .refund-items-title {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .refund-items {
    max-height: 360px;
    overflow-y: auto;

    .refund-item {
      border: 1px solid #ebeef5;
      border-radius: 6px;
      margin-bottom: 10px;
      background: #fff;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f5f7fa;
        border-bottom: 1px solid #ebeef5;
        font-size: 13px;

        .item-no {
          font-weight: bold;
          color: #303133;
        }

        .item-order {
          color: #909399;
          font-family: monospace;
          font-size: 12px;
        }
      }

      .item-content {
        padding: 8px 12px;

        .item-row {
          display: flex;
          line-height: 26px;
          font-size: 13px;
          color: #606266;

          .item-label {
            color: #909399;
            width: 96px;
            flex-shrink: 0;
          }

          &.money {
            color: #303133;
          }

          &.highlight-row {
            margin-top: 4px;
            padding-top: 6px;
            border-top: 1px dashed #ebeef5;
            font-weight: bold;

            .sub-split {
              font-weight: normal;
              font-size: 12px;
              color: #909399;
            }

            .refund-reason {
              font-weight: normal;
              font-size: 12px;
              color: #909399;
              margin-left: 4px;
            }
          }
        }
      }
    }
  }

  .refund-zero-tip {
    margin-top: 12px;
    padding: 10px 14px;
    background: #fff7e6;
    border-left: 3px solid #ff9900;
    border-radius: 4px;
    color: #ff9900;
    font-size: 13px;
    display: flex;
    align-items: center;

    i {
      margin-right: 6px;
      font-size: 16px;
    }
  }

  .refund-empty {
    text-align: center;
    color: #909399;
    padding: 30px 0;
    font-size: 13px;
  }
}

// 重置密码弹框样式
.reset-pwd-modal-content {
  padding: 0 4px;

  // 手机号 + 发送验证码 同行
  .reset-pwd-phone-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .reset-pwd-send-btn {
    flex: 1;
    max-width: 120px;
    margin-left: 20px;
  }

  // 验证码 + 发送按钮：整体宽度与新密码输入框一致（FormItem 的 100%）
  .reset-pwd-verify-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    // 让 Input 占满剩余空间（穿透 iView wrapper）
    /deep/ .ivu-input-wrapper {
      flex: 1;
      min-width: 0;
      width: auto;
    }

    // 发送按钮：固定最小宽度，按钮文字不被挤换行
    // 用更具体的选择器覆盖上面 .reset-pwd-send-btn 的 flex:1; margin-left
    .reset-pwd-send-btn {
      flex-shrink: 0;
      min-width: 120px;
      max-width: 120px;
      margin-left: 0;
    }
  }

  .reset-pwd-instance-info {
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 16px;

    .info-row {
      display: flex;
      line-height: 28px;
      font-size: 13px;

      .label {
        color: #909399;
        width: 90px;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
      }
    }
  }
}

// 密码校验样式：与 instance-buy 保持一致（仿 iview FormItem error）
.login-form__field-error {
  color: #ed4014;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
  padding-left: 0;
}

.login-form__hint {
  color: #999;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}

.login-pwd--invalid /deep/ .ivu-input {
  border-color: #ed4014;
}

.login-pwd--invalid /deep/ .ivu-input:focus {
  box-shadow: 0 0 0 2px rgba(237, 64, 20, 0.2);
}
</style>
