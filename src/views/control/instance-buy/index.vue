<template>
  <div class="instance-buy" style="position: relative;min-height: 95vh;">
    <div class="instance-buy__header">
      <Breadcrumb>
        <BreadcrumbItem>实例</BreadcrumbItem>
        <BreadcrumbItem>实例购买</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <Row :gutter="16" class="instance-buy__content">
      <!-- 左侧配置区 -->
      <Col span="18">
      <div class="instance-buy__left">
        <!-- 计费方式 -->
        <Card class="config-section" :bordered="false" dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">计费方式</div>
          </div>
          <div class="config-section__body" style="display: flex;">
            <div class="billing-card" :class="{ 'billing-card--active': form.billingType === 'monthly' }"
              @click="form.billingType = 'monthly'">
              <div class="billing-card__icon">
                <Icon type="md-calendar" size="24" color="#2d8cf0" />
              </div>
              <div class="billing-card__info">
                <div class="name">包月/包年计费</div>
                <div class="desc">适用需求量长期稳定的业务</div>
              </div>
            </div>
            <div class="billing-card" :class="{ 'billing-card--active': form.billingType === 'hourly' }"
              @click="form.billingType = 'hourly'">
              <div class="billing-card__icon">
                <Icon type="md-time" size="24" color="#ff9900" />
              </div>
              <div class="billing-card__info">
                <div class="name">按量计费</div>
                <div class="desc">灵活按需使用，按用量计费</div>
              </div>
            </div>

          </div>
          <div class="billing-tips">
            * 温馨提示：创建成功后的实例不可以转换计费方式。按量计费价格会随市场变动调整，运行中的按量计费实例整点和关机时产生费用。
          </div>
        </Card>

        <!-- 地域 -->
        <Card class="config-section" :bordered="false" dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">地域</div>
          </div>
          <div class="config-section__body">
            <div class="region-grid">
              <div v-for="(region, index) in regionList" :key="region.id || region.value + '-' + index"
                :class="{ 'region-card--active': selectedRegionValue[0] === region.value }" class="region-card"
                @click="handleRegionSelect(region)">
                <span class="region-card__name">{{ region.label }}</span>
              </div>
            </div>
            <div class="region-tips">
              <Icon type="ios-information-circle-outline" />
              <span style="font-weight: bold;">实例创建之后地域将无法更改，不同地域的实例之间内网互不相通；</span>
              <span>距离实例所在地域越近，对实例访问速度越快</span>
            </div>
          </div>
        </Card>

        <!-- 网络 -->
        <Card class="config-section" v-show="productType !== 'cd6f94a7-64c1-43a2-b2a1-49d60d6ef51e'" :bordered="false"
          dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">网络</div>
          </div>
          <div class="config-section__body network-section">
            <div class="network-item">
              <span class="label">专有网络</span>
              <Select v-model="form.vnetId" clearable placeholder="请选择专有网络" style="width: 240px"
                :disabled="!selectedRegionId" :loading="vnetLoading" @on-change="handleVnetChange">
                <Option v-for="vnet in vnetList" :key="vnet.id" :value="vnet.id" :label="vnet.vnetName">
                  {{ vnet.vnetName }}
                </Option>
              </Select>
            </div>
            <div class="network-item">
              <span class="label">交换机</span>
              <Select v-model="form.subnetId" clearable placeholder="请先选择专有网络" style="width: 240px"
                :disabled="!form.vnetId" :loading="subnetLoading">
                <Option v-for="subnet in subnetList" :key="subnet.id" :value="subnet.id" :label="subnet.subnetName">
                  {{ subnet.subnetName }}
                </Option>
              </Select>
              <span v-if="vnetList.length === 0" class="network-hint">当前地域暂无专有网络，请先<router-link
                  to="/shenbeigpuai/control/network" class="network-hint__link">新增</router-link></span>
              <span v-if="form.vnetId && !subnetLoading && subnetList.length === 0" class="network-hint">
                当前专有网络暂无交换机，请先<router-link to="/shenbeigpuai/control/switch" class="network-hint__link">新增</router-link>
              </span>
            </div>
          </div>
        </Card>

        <!-- 基础信息 (规格选择) -->
        <Card class="config-section" :bordered="false" dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">产品列表</div>
          </div>
          <div class="config-section__body">
            <!-- {{ productType }} -->
            <Tabs v-model="productType" :animated="false" class="product-type-tabs">
              <!-- 产品分类 Tab：动态渲染自顶级分类接口，懒加载各分类 SKU -->
              <TabPane v-for="cat in categoryList" :key="cat.id" :label="cat.categoryName" :name="cat.id">
                <div class="spec-filters">
                  <Select v-model="filterMap[cat.id].cpuName" placeholder="CPU型号" style="width: 150px" clearable
                    transfer>
                    <Option value="all">全部CPU型号</Option>
                    <Option v-for="cpu in getCpuNameOptions(cat.id)" :key="cpu" :value="cpu">{{ cpu }}</Option>
                  </Select>
                  <Select v-model="filterMap[cat.id].vcpu" placeholder="CPU核心数" style="width: 150px" clearable transfer>
                    <Option value="all">全部CPU核心数</Option>
                    <Option v-for="cpu in getVcpuOptions(cat.id)" :key="cpu" :value="cpu">{{ cpu }}核</Option>
                  </Select>
                  <Select v-model="filterMap[cat.id].memory" placeholder="选择内存" style="width: 150px" clearable transfer>
                    <Option value="all">全部内存</Option>
                    <Option v-for="mem in getMemoryOptions(cat.id)" :key="mem" :value="mem">{{ mem }} GB</Option>
                  </Select>
                  <Select v-model="filterMap[cat.id].gpuName" placeholder="GPU型号" style="width: 150px" clearable
                    transfer>
                    <Option value="all">全部GPU型号</Option>
                    <Option v-for="gpu in getGpuNameOptions(cat.id)" :key="gpu" :value="gpu">{{ gpu }}</Option>
                  </Select>
                  <Select v-model="filterMap[cat.id].gpu" placeholder="GPU数量" style="width: 150px" clearable transfer>
                    <Option value="all">全部GPU数量</Option>
                    <Option v-for="gpu in getGpuOptions(cat.id)" :key="gpu" :value="gpu">{{ gpu }}个</Option>
                  </Select>
                  <form autocomplete="off" @submit.prevent style="display:inline-block;position:relative;"
                    class="no-autofill-form">
                    <!-- 隐藏诱饵：骗 Chrome 把保存的密码填到这里 -->
                    <input type="text" name="fake_user" tabindex="-1" autocomplete="off"
                      style="position:absolute;left:-9999px;top:-9999px;height:0;width:0;opacity:0;" />
                    <input type="password" name="fake_pwd" tabindex="-1" autocomplete="off"
                      style="position:absolute;left:-9999px;top:-9999px;height:0;width:0;opacity:0;" />
                    <Input v-model="filterMap[cat.id].modelName" search placeholder="搜索产品名" style="width: 260px;"
                      :name="'no-autofill-search-' + cat.id" data-form-type="other" data-lpignore="true"
                      data-1p-ignore="true" autocomplete="new-password" readonly
                      @on-focus="$event.target.removeAttribute('readonly')" />
                  </form>
                </div>
                <!-- {{ selectedSpec }} -->
                <Table :columns="specColumns" :data="getFilteredList(cat.id)" :loading="getLoading(cat.id)"
                  class="spec-table">
                  <template slot-scope="{ row }" slot="selection">
                    <Radio :value="Boolean(selectedSpec && row && selectedSpec.id === row.id)"
                      @click.native.stop="handleSpecChange(row)"></Radio>
                  </template>
                </Table>
              </TabPane>
            </Tabs>
          </div>
        </Card>

        <!-- 镜像类型 -->
        <Card class="config-section" v-show="productType !== 'cd6f94a7-64c1-43a2-b2a1-49d60d6ef51e'" :bordered="false"
          dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">镜像类型</div>
          </div>
          <div class="config-section__body">
            <Tabs v-model="form.imageType" @on-click="handleImageTabChange">
              <TabPane label="预设镜像" name="public">
                <div v-if="publicImageListLoading" class="image-loading">
                  <Icon type="ios-loading" size="24" class="spin-icon-load" />
                  <span>加载中...</span>
                </div>
                <div v-else-if="publicImageList.length === 0" class="image-empty">
                  <Icon type="ios-information-circle-outline" size="24" color="#2d8cf0" />
                  <span>暂无预设镜像</span>
                </div>
                <div v-else class="image-grid">
                  <div v-for="img in publicImageList" :key="img.id" class="image-card"
                    :class="{ 'image-card--active': form.image === img.id }" @click="form.image = img.id">
                    <div class="image-card__name">{{ img.mirrorName }}</div>
                  </div>
                </div>
              </TabPane>
              <TabPane label="自主上传镜像" name="custom">
                <div v-if="customImageListLoading" class="image-loading">
                  <Icon type="ios-loading" size="24" class="spin-icon-load" />
                  <span>加载中...</span>
                </div>
                <div v-else-if="customImageList.length === 0" class="image-empty">
                  <Icon type="ios-information-circle-outline" size="24" color="#2d8cf0" />
                  <span>暂无自主上传镜像，请先<router-link to="/shenbeigpuai/control/mirror-management"
                      class="image-empty__link">上传</router-link></span>
                </div>
                <div v-else class="image-grid">
                  <div v-for="img in customImageList" :key="img.id" class="image-card"
                    :class="{ 'image-card--active': form.image === img.id }" @click="form.image = img.id">
                    <div class="image-card__name">{{ img.mirrorName }}</div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Card>

        <!-- 实例登录账号（必填：创建 VM 时通过 cloud-init 写入用户名/密码） -->
        <Card class="config-section" v-show="productType !== 'cd6f94a7-64c1-43a2-b2a1-49d60d6ef51e'" :bordered="false"
          dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">实例登录账号（必填）</div>
          </div>
          <div class="config-section__body">
            <div class="login-form">
              <div class="login-form__item">
                <span class="label"><span class="required">*</span>用户名</span>
                <Input v-model="form.loginUsername" disabled placeholder="请输入登录用户名（4-32位，支持字母/数字/下划线）" :maxlength="32"
                  clearable style="width: 280px" />
              </div>
              <div class="login-form__item">
                <span class="label"><span class="required">*</span>密码</span>
                <!-- <Input v-model="value1" type="password" autocomplete="new-password" /> -->
                <Input v-model="form.loginPassword" type="password" placeholder="请输入登录密码（8-16位，包含字母与数字）" :maxlength="64"
                  show-password-on="click" style="width: 280px" ref="loginPasswordInput"
                  :class="{ 'login-pwd--invalid': !!loginPasswordError }" autocomplete="off" name="new-password-field"
                  data-form-type="other" @on-blur="validateLoginPassword" @on-change="validateLoginPassword" />
              </div>
              <!-- 表单校验错误提示（仿 iview FormItem error 样式） -->
              <div class="login-form__field-error" v-if="loginPasswordError">
                {{ loginPasswordError }}
              </div>
              <div class="login-form__hint">
                提示：用户名/密码将写入 PVE cloud-init 配置，用于实例首次登录。请妥善保管。
              </div>
            </div>
          </div>
        </Card>

        <!-- 裸金属登录账号 -->
        <Card class="config-section" v-show="productType === 'cd6f94a7-64c1-43a2-b2a1-49d60d6ef51e'" :bordered="false"
          dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">实例登录账号</div>
          </div>
          <div class="config-section__body">
            <div class="login-form">
              <div class="login-form__hint" style="color: red;padding-left: 0px;">
                提示: 裸金属服务器购买并支付成功后，您可前往【实例列表】一“详情”页面查看服务器账号与登录密码。
              </div>
            </div>
          </div>
        </Card>

        <!-- 数据盘 -->
        <Card class="config-section" v-show="productType !== 'cd6f94a7-64c1-43a2-b2a1-49d60d6ef51e'" :bordered="false"
          dis-hover>
          <div class="config-section__header">
            <div class="config-section__title">数据盘</div>
            <Button v-if="selectedRegionId && dataDiskList.length > 0" type="primary" shape="circle" size="small"
              icon="md-add" :disabled="dataDiskList.length === 0" @click="addDataDiskRow" title="添加数据盘" />
          </div>
          <div class="config-section__body">
            <!-- 未选择地域提示 -->
            <div v-if="!selectedRegionId" class="data-disk-empty">
              <Icon type="ios-information-circle-outline" size="24" color="#2d8cf0" />
              <span>请先选择地域</span>
            </div>
            <!-- 无数据盘提示 -->
            <div v-else-if="dataDiskList.length === 0" class="data-disk-empty">
              <Icon type="ios-information-circle-outline" size="24" color="#2d8cf0" />
              <span>当前地域暂无数据盘配置</span>
            </div>
            <!-- 数据盘列表 -->
            <div v-else class="data-disk-dynamic-list">
              <!-- 动态数据盘行 -->
              <div v-for="(item, index) in selectedDataDisks" :key="index" class="data-disk-row">
                <div class="data-disk-row__select">
                  <Select v-model="item.id" placeholder="请选择数据盘" style="width: 300px" size="small">
                    <Option v-for="disk in dataDiskList" :key="disk.id" :value="disk.id" :label="disk.productName">
                      {{ disk.productName }}
                    </Option>
                  </Select>
                </div>
                <!-- 数据盘属性展示在一行 -->
                <template v-if="item.id">
                  <div class="data-disk-row__attr">
                    <Tag :color="getDiskById(item.id).diskType === 'SSD' ? 'blue' : 'cyan'">
                      {{ getDiskById(item.id).diskType }}
                    </Tag>
                  </div>
                  <div class="data-disk-row__attr">
                    <span class="attr-label">容量:</span>
                    <span class="attr-value">{{ getDiskById(item.id).capacityGb }}GB</span>
                  </div>
                  <div class="data-disk-row__attr">
                    <span class="attr-label">IOPS:</span>
                    <span class="attr-value">{{ getDiskById(item.id).iops || '-' }}</span>
                  </div>
                  <div class="data-disk-row__attr">
                    <span class="attr-label">吞吐:</span>
                    <span class="attr-value">{{ getDiskById(item.id).throughputMbps || '-' }}MB/s</span>
                  </div>
                  <div class="data-disk-row__price">
                    ¥{{ (form.billingType === 'monthly' ? (getDiskById(item.id).priceMonthly || 0) *
                      getDiskById(item.id).capacityGb : (getDiskById(item.id).priceHourly || 0) *
                    getDiskById(item.id).capacityGb).toFixed(2) }}
                    <span class="price-unit">/{{ form.billingType === 'monthly' ? '月' : '小时' }}</span>
                  </div>
                </template>
                <div v-else class="data-disk-row__placeholder">请选择数据盘</div>
                <div class="data-disk-row__action">
                  <Button type="error" size="small" icon="md-trash" ghost @click="removeDataDiskRow(index)" />
                </div>
              </div>
              <!-- 无数据盘时提示 -->
              <div v-if="selectedDataDisks.length === 0" class="data-disk-no-selection">
                暂无数据盘，点击上方按钮添加
              </div>
            </div>
          </div>
        </Card>
      </div>
      </Col>

      <!-- 右侧概要区 -->
      <!-- <Col span="6"> -->

      <!-- </Col> -->
    </Row>
    <div class="instance-buy__right" style="position: fixed;top: 125px;right: 2vw;z-index: 10;width: 20vw;">
      <Card :bordered="false" dis-hover class="summary-card">
        <div slot="title" class="summary-card__title">配置概要</div>
        <div class="summary-list">
          <div class="summary-item">
            <span class="label">付费类型</span>
            <span class="value">{{ getBillingTypeName(form.billingType) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">地域</span>
            <span class="value">{{ selectedRegionName || '-' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">网络类型</span>
            <span class="value">{{ selectedVnetName || '专有网络' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">交换机</span>
            <span class="value">{{ selectedSubnetName || '-' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">实例规格</span>
            <div class="value value--multi" v-if="selectedSpec">
              {{ selectedSpec.modelName || '-' }}<br />
              <!-- ({{ selectedSpec.cpu }} ) -->
              <!-- {{ selectedSpec.memoryConfig }} {{ selectedSpec.gpuCount }}) -->
            </div>
            <div class="value value--multi" v-else>
              -
            </div>
          </div>
          <div class="summary-item">
            <span class="label">镜像</span>
            <span class="value link">{{ selectedImageName || '-' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">数据盘</span>
            <span class="value">{{ selectedDataDiskCount > 0 ? selectedDataDiskCount + ' 块' : '-' }}</span>
          </div>
        </div>

        <div class="summary-form">
          <!-- <div class="form-item">
              <span class="label">购买实例数量</span>
              <InputNumber style="width: 120px" :min="1" v-model="form.quantity" @on-blur="handleQuantityBlur">
              </InputNumber>
            </div> -->
          <div class="form-item" v-if="form.billingType !== 'hourly'">
            <span class="label"><span style="color: #ff4d4f; margin-right: 4px;">*</span>购买时长</span>
            <span class="label hint-text" v-if="durationOptions.length === 0">请选择实例规格</span>
            <Select v-else v-model="form.duration" placeholder="请选择" style="width: 120px">
              <Option v-for="opt in durationOptions" :key="opt.value" :value="opt.value" :label="opt.value">
                {{ opt.value }}
                <span v-if="opt.discountText"
                  style="background: #ff4d4f; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">{{
                    opt.discountText }}</span>
              </Option>
            </Select>
          </div>
          <!-- <div class="form-item">
              <Checkbox v-model="form.autoRenew">启用自动续费</Checkbox>
            </div> -->
        </div>

        <!-- <Alert show-icon class="renew-alert">
            自动续费周期为 每月，具体以订单时间为准。设置为自动续费成功后，将于原本到期的9天开始连续扣款，如扣款失败，次日会继续模拟扣款知道扣款成功或到期前1天。
          </Alert> -->

        <div class="balance-check" style="display: flex; align-items: flex-start; gap: 8px;">
          <Checkbox v-model="useBalanceChecked"
            :disabled="form.billingType === 'hourly' || ((balance || 0) - (frozenBalance || 0)).toFixed(2) <= 0"
            style="margin-top: 2px;">
          </Checkbox>
          <div style="flex: 1;margin-left: 0px;">
            <div style="font-size: 14px; color: #515a6e; line-height: 22px;">
              使用账户余额抵扣 (当前账户可用余额 <span class="price-red">¥{{ ((balance || 0) - (frozenBalance || 0)).toFixed(2)
              }}</span>)
              <div style="font-size: 12px; color: #808695; margin-top: 4px;">如果您有正在使用中的后付费产品，请保证有足够余额。</div>
            </div>
            <div v-if="form.useBalance && finalTotalAmount > 0 && form.billingType !== 'hourly' && useBalanceChecked"
              class="balance-input-row" style="margin-top: 8px;">
              <span style="font-size: 12px; color: #515a6e;">余额支付:</span>
              <InputNumber v-model="form.balanceAmount" ref="balanceAmountInput"
                :max="Math.min(Math.max(balance - frozenBalance, 0), finalTotalAmount)" :min="0" :step="0.01"
                size="small" style="width: 120px; margin-left: 8px;" placeholder="请输入金额"
                :disabled="form.billingType === 'hourly'" @on-change="handleBalanceAmountChange"
                @on-blur="handleBalanceAmountBlur" />
              <span v-if="finalTotalAmount > form.balanceAmount"
                style="font-size: 12px; color: #808695; margin-left: 8px;">还需支付 ¥{{ (finalTotalAmount -
                  form.balanceAmount).toFixed(2) }}</span>
              <span v-else style="font-size: 12px; color: #19be6b; margin-left: 8px;">余额已足额抵扣</span>
            </div>
            <div class="total-amount"
              style="margin-top: 10px; font-weight: bold; color: #ff4d4f; display: flex; justify-content: space-between; align-items: center;">
              <span v-if="form.billingType === 'hourly'">合计金额 ¥{{ parseFloat(finalTotalAmount).toFixed(2) }}/时</span>
              <span v-else>当前支付总金额: ¥{{ parseFloat(finalTotalAmount).toFixed(2) }}</span>
              <span v-if="finalTotalAmount > 0"
                style="font-weight: normal; color: #2d8cf0; cursor: pointer; font-size: 12px;"
                @click="priceDetailVisible = true">查看明细</span>
            </div>
          </div>
        </div>

        <div class="price-panel">
          <div class="price-tips" v-if="selectedSpec && (balance - frozenBalance) < finalTotalAmount">当前钱包余额不足，请 <span
              @click="goToRecharge">充值</span> 或选择其他支付方式</div>
          <Button type="primary" size="large" long class="pay-btn" @click="handlePay"
            :disabled="!selectedSpec || (form.billingType !== 'hourly' && !form.duration) || (form.billingType == 'hourly' && ((balance || 0) - (frozenBalance || 0)).toFixed(2) <= 0)"
            :loading="submitLoading">提交订单</Button>
          <!-- <Button @click="postOrderModalVisible = true">测试实例创建动画</Button> -->
        </div>
      </Card>
    </div>
    <!-- 价格明细抽屉 -->
    <Drawer title="价格明细" :closable="true" v-model="priceDetailVisible" width="600">
      <div class="price-detail-content">
        <!-- 列表表头 -->
        <div class="price-detail-header">
          <span class="col-item">计费项</span>
          <span class="col-price">原价</span>
          <span class="col-rate">折扣</span>
          <span class="col-discount">折扣金额</span>
          <span class="col-pay">应付费用</span>
        </div>

        <!-- 实例规格行 -->
        <div class="price-detail-row" v-if="selectedSpec">
          <span class="col-item">
            <div class="item-name">{{ selectedSpec.name || selectedSpec.gpuModel }}</div>
            <div class="item-sub">数量: {{ form.quantity }} 台<span v-if="form.billingType === 'monthly' && form.duration">
                |
                {{ form.duration }}</span></div>
          </span>
          <span class="col-price">¥{{ (priceInfo.instanceOriginalAmount || 0).toFixed(2) }}{{ form.billingType ===
            'hourly'
            ? '/时' : '' }}</span>
          <span class="col-rate">
            <span v-if="priceInfo.discountText" class="discount-tag-red">{{ priceInfo.discountText }}</span>
            <span v-else>-</span>
          </span>
          <span class="col-discount price-green">{{ (priceInfo.instanceOriginalAmount - priceInfo.instanceAmount) > 0 ?
            '-¥'
            + (priceInfo.instanceOriginalAmount - priceInfo.instanceAmount).toFixed(2) : '-' }}</span>
          <span class="col-pay price-red">¥{{ (priceInfo.instanceAmount || 0).toFixed(2) }}{{ form.billingType ===
            'hourly'
            ? '/时' : '' }}</span>
        </div>

        <!-- 数据盘行 -->
        <div v-for="(disk, index) in priceInfo.dataDiskDetails" :key="'disk-' + index" class="price-detail-row">
          <span class="col-item">
            <div class="item-name">{{ disk.diskName }}</div>
            <div class="item-sub">数据盘 ({{ disk.capacityGb }}GB)</div>
          </span>
          <span class="col-price">¥{{ (disk.originalTotalAmount || 0).toFixed(2) }}{{ form.billingType === 'hourly' ?
            '/时' :
            '' }}</span>
          <span class="col-rate">
            <span v-if="priceInfo.discountText" class="discount-tag-red">{{ priceInfo.discountText }}</span>
            <span v-else>-</span>
          </span>
          <span class="col-discount price-green">{{ (disk.originalTotalAmount - disk.actualTotalAmount) > 0 ? '-¥' +
            (disk.originalTotalAmount - disk.actualTotalAmount).toFixed(2) : '-' }}</span>
          <span class="col-pay price-red">¥{{ (disk.actualTotalAmount || 0).toFixed(2) }}{{ form.billingType ===
            'hourly' ?
            '/时' : '' }}</span>
        </div>

        <!-- 其他可能的计费项可以在这里添加 -->

        <!-- 合计行 -->
        <div class="price-detail-footer">
          <span class="col-item">合计</span>
          <span class="col-price">
            ¥{{ (priceInfo.originalTotalAmount || 0).toFixed(2) }}{{ form.billingType === 'hourly' ? '/时' : '' }}
          </span>
          <span class="col-rate">
            <span v-if="priceInfo.discountText" class="discount-tag-red">{{ priceInfo.discountText }}</span>
            <span v-else>-</span>
          </span>
          <span class="col-discount price-green">{{ getTotalSavedAmount() > 0 ? '-¥' + getTotalSavedAmount().toFixed(2)
            :
            '-' }}</span>
          <span class="col-pay price-total">¥{{ (totalAmount || 0).toFixed(2) }}{{ form.billingType === 'hourly' ? '/时'
            : ''
          }}</span>
        </div>
      </div>
    </Drawer>

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
        <p v-if="form.useBalance && form.balanceAmount > 0" style="margin-top: 8px; color: #19be6b;">
          使用余额抵扣：¥{{ form.balanceAmount.toFixed(2) }}
        </p>
        <div v-if="useWechatPay"
          style="margin-top: 16px; padding: 16px; background: #f2f5fa; border-radius: 4px; text-align: center;">
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
        <Button type="primary" :loading="payModalLoading" @click="handlePayConfirm(testOrderId)">
          确认支付
        </Button>
      </div>
    </Modal>

    <!-- 订单确认成功后的提示弹框（不可关闭，10秒后显示跳转按钮） -->
    <Modal v-model="postOrderModalVisible" title="实例创建中..." :closable="false" :mask-closable="false" :footer-hide="true"
      width="80" class-name="instance-buy__post-order-modal">
      <iframe v-if="postOrderIframeSrcdoc && postOrderModalVisible" :key="postOrderModalVisible"
        :srcdoc="postOrderIframeSrcdoc" ref="postOrderIframe" frameborder="0" scrolling="auto"
        :style="{ display: 'block', width: '100%', height: '600px', border: '1px solid #dcdee2', borderRadius: '4px', background: '#fff' }"></iframe>
      <div :style="{ marginTop: '12px', textAlign: 'center' }">
        <Button v-if="instanceCreated" type="primary" @click="goToInstanceList">
          实例创建成功，请前往列表页查看
        </Button>
        <div v-else style="color:#999;font-size:14px;">实例创建中，请稍候...</div>
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
  </div>
</template>

<script>
export default {
  name: 'scp-shenbeigpuai-control-instance-buy',
  data () {
    return {
      durationOptions: [],
      loading: false,
      submitLoading: false,
      tempPayPassword: '',  // 临时支付密码（提交订单时验证）
      userId: 'user_001',
      balance: 0,
      frozenBalance: 0,
      regionList: [],
      selectedRegionValue: [],
      selectedRegionId: null,
      // 数据盘列表
      dataDiskList: [],
      // 选中的数据盘列表（支持多选）
      selectedDataDisks: [],
      // 专有网络列表
      vnetList: [],
      vnetLoading: false,
      // 交换机列表
      subnetList: [],
      subnetLoading: false,
      // 后端计算的总金额
      totalAmount: 0,
      // 价格明细抽屉显示状态
      priceDetailVisible: false,
      // 价格计算相关数据
      priceInfo: {
        originalUnitPrice: 0,
        actualUnitPrice: 0,
        originalTotalAmount: 0,
        savedAmount: 0,
        discountText: '',
        instanceAmount: 0,
        instanceOriginalAmount: 0,
        dataDiskDetails: []
      },
      // 选中的物理机ID
      selectedPhysicalId: '',
      // 测试订单二维码URL
      testOrderQrCodeUrl: '',
      // 测试订单ID（用于轮询支付状态）
      testOrderId: '',
      // 轮询支付状态相关
      isPolling: false,
      pollingTimer: null,
      pollingCount: 0,
      maxPollingCount: 200, // 最大轮询次数（约5分钟）
      pollingInterval: 3000, // 轮询间隔（3秒）
      // 支付确认弹框相关
      payModalVisible: false,
      payModalLoading: false,
      // 订单确认成功后提示弹框（不可关闭，实例创建完成后才显示跳转按钮）
      postOrderModalVisible: false,
      postOrderCountdown: 10,
      postOrderCountdownTimer: null,
      // 弹框内嵌入的网页 HTML（srcdoc 方式内联，避免 .html 资源被当作下载处理）
      postOrderIframeSrcdoc: '',
      // 是否开启下单后弹框动画（由字典 order_post_modal_switch 控制，VALUE=1 开启）
      postOrderModalEnabled: false,
      // 轮询订单实例创建状态：每 2 秒查一次 instance_init，等于 '1' 才显示跳转按钮
      instanceCreated: false,
      pollingOrderId: '',
      // 兜底：连续轮询 N 次后仍未创建成功也显示跳转按钮，避免接口异常时按钮永远不出来
      pollingMaxCount: 60,
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
      isPaySuccess: false, // 支付是否成功
      orderResult: null, // 订单结果
      finalAmount: 0, // 最终支付金额
      remainingAmount: 0, // 剩余需支付金额
      useWechatPay: false, // 是否使用微信支付
      // 镜像列表加载状态
      publicImageListLoading: false,
      customImageListLoading: false,
      // 系统预设镜像列表
      publicImageList: [],
      // 自主上传镜像列表
      customImageList: [],
      // 路由参数
      queryParams: {
        regionId: '',
        skuId: '',
        categoryId: ''
      },
      // 是否有需要处理的路由参数
      hasQueryParams: false,
      form: {
        billingType: 'monthly',
        region: 'shenyang',
        imageType: 'public',
        image: '',
        devEnv: 'Docker',
        diskType: 'ssd',
        diskSize: 0,
        quantity: 1,
        duration: '',
        autoRenew: true,
        useBalance: true,
        balanceAmount: 0,
        instanceSpec: null,
        vnetId: '',
        vnetCode: '',
        subnetId: '',
        cpuConfig: '',
        memoryConfig: '',
        gpuModel: '',
        gpuBrand: '',
        gpuArchitecture: '',
        singlePrecision: '',
        halfPrecision: '',
        // 登录实例所用的用户名和密码（必填；会在创建 VM 后通过 cloud-init 写入）
        loginUsername: 'root',
        loginPassword: ''
      },
      selectedSpec: null,
      // 登录密码表单校验错误提示：空串表示校验通过；非空表示错误文案（仿 FormItem.error）
      loginPasswordError: '',
      // 当前激活的产品分类 Tab：顶级分类 id（顶级分类动态渲染自 categoryList）
      productType: '',
      // 顶级产品分类列表（动态 Tab 数据源）：[{id, categoryName, sortOrder, ...}]
      categoryList: [],
      // 各分类的 SKU 缓存：{ [categoryId]: { list, loading, loaded, filters } }
      skuMap: {},
      // 各分类筛选条件：{ [categoryId]: { cpuName, vcpu, memory, gpuName, gpu, modelName } }
      // 与 skuMap 内嵌 filters 同源；独立声明便于模板 v-model 直接双向绑定（避免 Vue 2 不能检测新增属性）
      filterMap: {},
      // 单套表格列配置（三分类共用一套）
      specColumns: [
        {
          title: ' ',
          slot: 'selection',
          maxWidth: 30,
          align: 'center'
        },
        {
          title: '产品',
          key: 'modelName',
          width: 180,
          align: 'center'
        },
        {
          title: 'GPU型号',
          key: 'gpuName',
          width: 200,
          align: 'center'
        },
        {
          title: 'GPU数量',
          key: 'gpuCount',
          width: 100,
          align: 'center'
        },
        {
          title: 'CPU型号',
          key: 'cpuName',
          width: 200,
          align: 'center'
        },
        {
          title: 'CPU核心数',
          key: 'cpuCount',
          width: 110,
          align: 'center'
        },
        {
          title: '内存(GB)',
          key: 'memoryConfig',
          width: 110,
          align: 'center'
        },
        {
          minWidth: 120,
          title: '参考价格',
          key: 'price',
          align: 'center',
          render: (h, params) => {
            return h('span', {
              style: { color: '#2d8cf0', fontWeight: 'bold' }
            }, params.row.price)
          }
        }
      ],
      poolTypeDict: {} // poolType字典映射
    }
  },
  created () {
    this.fetchRegionList()
    this.fetchPoolTypeDict()
    // 注意：fetchPublicImageList/fetchCustomImageList 会在 fetchRegionList → setDefaultRegion 完成后调用
    // 接收路由参数
    this.queryParams.regionId = this.$route.query.regionId || ''
    this.queryParams.skuId = this.$route.query.skuId || ''
    this.queryParams.categoryId = this.$route.query.categoryId || ''
    // 标记存在外部跳入参数（不再强制切按量计费；计费方式由 setDefaultRegion 按目标 SKU 实际支持的决定）
    if (this.queryParams.regionId || this.queryParams.skuId) {
      this.hasQueryParams = true
    }
  },
  mounted () {
    this.fetchBalance()
    // 拉取字典，判断下单后是否弹框
    this.fetchPostOrderModalSwitch()
    // 准备弹框内的动画 HTML（v-html 不会执行内嵌脚本，后续通过 addPostOrderScript 手动启动）
    this.preparePostOrderIframe()
    // 处理来自 portal 首页跳转携带的 localStorage 参数（portal_redirect_regionId / portal_redirect_skuId）
    // 与路由 query 走同一套 hasQueryParams 逻辑：只要有一个能取到，就默认切到按量计费
    this.applyPortalRedirectParams()
    // 反制 Chrome 自动填充（保险层）：挂载后给敏感 input 节点的原生 DOM 注入只读 + focus 时移除
    this.$nextTick(() => {
      this.applyNoAutofillHooks()
    })
  },
  beforeDestroy () {
    // 组件销毁时清理倒计时定时器，避免内存泄漏
    this.clearPostOrderCountdown()
  },
  computed: {
    // 强制布尔化，避免 view-design Checkbox 报 "Value should be trueValue or falseValue"
    // 当账户可用余额 ≤ 0 时强制返回 false（防止被默认勾选）
    useBalanceChecked: {
      get () {
        const availableBalance = (parseFloat(this.balance) || 0) - (parseFloat(this.frozenBalance) || 0)
        if (availableBalance <= 0) return false
        return !!this.form.useBalance
      },
      set (val) {
        this.form.useBalance = !!val
      }
    },
    filteredSpecs () {
      return this.getFilteredList(this.productType)
    },
    selectedRegionName () {
      if (!this.selectedRegionValue || this.selectedRegionValue.length === 0) {
        return '-'
      }
      return this.selectedRegionValue.join(' / ')
    },
    /**
     * 已选数据盘数量（有有效ID的）
     */
    selectedDataDiskCount () {
      return this.selectedDataDisks.filter(item => item.id).length
    },
    /**
     * 已选数据盘总价
     */
    selectedDataDiskTotalPrice () {
      let total = 0
      this.selectedDataDisks.forEach(item => {
        if (item.id) {
          const disk = this.getDiskById(item.id)
          if (disk && disk.id) {
            const unitPrice = this.form.billingType === 'monthly' ? disk.priceMonthly : disk.priceHourly
            // 价格乘以容量GB数
            total += parseFloat(unitPrice || 0) * (disk.capacityGb || 0)
          }
        }
      })
      return total.toFixed(2)
    },
    /**
     * 最终支付总金额（直接使用后端返回的totalAmount）
     */
    finalTotalAmount () {
      return parseFloat(this.totalAmount || 0).toFixed(2)
    },
    /**
     * 当前选中的镜像名称
     */
    selectedImageName () {
      if (!this.form.image) return ''
      const list = this.form.imageType === 'public' ? this.publicImageList : this.customImageList
      const image = list.find(img => img.id === this.form.image)
      return image ? image.mirrorName : ''
    },
    /**
     * 当前选中的镜像对象
     */
    selectedImage () {
      if (!this.form.image) return null
      const list = this.form.imageType === 'public' ? this.publicImageList : this.customImageList
      return list.find(img => img.id === this.form.image) || null
    },
    /**
     * 当前选中的专有网络名称
     */
    selectedVnetName () {
      if (!this.form.vnetId) return '-'
      const vnet = this.vnetList.find(v => v.id === this.form.vnetId)
      return vnet ? vnet.vnetName : '-'
    },
    /**
     * 当前选中的交换机名称
     */
    selectedSubnetName () {
      if (!this.form.subnetId) return '-'
      const subnet = this.subnetList.find(s => s.id === this.form.subnetId)
      return subnet ? subnet.subnetName : '-'
    },
    /**
     * 可用余额
     */
    availableBalance () {
      return parseFloat(this.balance || 0) - parseFloat(this.frozenBalance || 0)
    },
  },
  watch: {
    // 二维码链接就绪后兜底重画：createTestOrderQrCode 响应可能慢于支付弹框打开，
    // 弹框打开时的 nextTick 绘制会因 URL 为空被跳过，此处 URL 到达后再补画
    testOrderQrCodeUrl (val) {
      if (val) this.$nextTick(() => { this.renderPayQrCode() })
    },
    'form.billingType': {
      handler () {
        // 计费方式改变时，清空选中规格并清空所有分类的 SKU 缓存，重新加载
        this.selectedSpec = null
        this.form.instanceSpec = null
        this.totalAmount = 0
        this.priceInfo = {
          originalUnitPrice: 0,
          actualUnitPrice: 0,
          originalTotalAmount: 0,
          savedAmount: 0,
          discountText: '',
          instanceAmount: 0,
          instanceOriginalAmount: 0,
          dataDiskDetails: []
        }
        this.form.balanceAmount = 0
        // 清空所有分类的 SKU 缓存与筛选器，触发当前 Tab 重新加载
        this.resetSkuMap()
        if (this.productType) {
          this.fetchSkusByCategory(this.productType)
        }
      }
    },
    'form.useBalance': {
      handler (newVal) {
        if (!newVal) {
          // 取消勾选时重置余额使用金额为0
          this.form.balanceAmount = 0
        } else {
          // 勾选时自动填充：min(可用余额, 当前支付总金额)
          // 已有余额足够 → 填满当前总金额；余额不足 → 填满可用余额；总额为 0 → 填 0
          this.autoFillBalanceAmount()
        }
      }
    },
    'finalTotalAmount': {
      handler (newVal) {
        // 总金额变化时，如果已输入的余额超过总金额，则重置为0
        if (this.form.balanceAmount > parseFloat(newVal)) {
          this.form.balanceAmount = 0
        }
      }
    },
    // 监听价格相关字段变化，触发后端价格计算
    'form.quantity': {
      handler () {
        this.calculatePrice()
      }
    },
    'form.duration': {
      async handler () {
        await this.calculatePrice()
        this.autoFillBalanceAmount()
      }
    },
    selectedSpec: {
      handler () {
        this.calculatePrice()
      }
    },
    // 监听数据盘变化，触发价格计算并自动同步余额使用金额
    selectedDataDisks: {
      async handler () {
        await this.calculatePrice()
        this.autoFillBalanceAmount()
      },
      deep: true
    },
    filteredSpecs: {
      handler (newSpecs) {
        // 如果筛选结果中没有当前选中的规格，则清除选中状态
        if (newSpecs && newSpecs.length > 0 && this.selectedSpec && !newSpecs.includes(this.selectedSpec)) {
          this.selectedSpec = null
        }
      }
    },
    // 监听产品分类 Tab 切换：清选中态 + 懒加载该分类的 SKU 列表
    productType: {
      handler (newVal, oldVal) {
        if (!newVal || newVal === oldVal) return
        // 切换分类时清空已选规格（避免选中态跨分类误读）
        this.selectedSpec = null
        this.form.instanceSpec = null
        this.form.duration = ''
        this.durationOptions = []
        // 未加载过且未在加载中才发请求（懒加载）
        const bucket = this.skuMap[newVal]
        if (!bucket) {
          this.$set(this.skuMap, newVal, this.createEmptySkuBucket(newVal))
        }
        // 条件打开会导致切换分类无法默认选中 by lmq 2026-09-06
        // if (!this.skuMap[newVal].loaded && !this.skuMap[newVal].loading) {
          this.fetchSkusByCategory(newVal)
          // this.handleSpecChange(bucket.list[0])
        // }
      }
    }
  },
  methods: {
    handleDurationChange (v) {
      console.log('handleDurationChange', v)
    },
    /**
     * 校验登录账号表单（用户名/密码）
     * 返回 null 表示校验通过；返回 string 时展示为错误提示并阻止下单
     */
    validateLoginInfo () {
      const username = (this.form.loginUsername || '').trim()

      // 用户名：必填，4-32 位，字母/数字/下划线/中划线/点
      // const usernameRegex = /^[A-Za-z0-9_.\-]{4,32}$/
      if (!username) {
        return '请填写实例登录用户名'
      }
      // if (!usernameRegex.test(username)) {
      //   return '登录用户名需为 4-32 位，支持字母/数字/下划线/中划线/点'
      // }

      // 密码：复用 validateLoginPassword，规则单一来源
      this.validateLoginPassword()
      if (this.loginPasswordError) {
        // 空值时 validateLoginPassword 会把错误清空，单独兜底
        if (!this.form.loginPassword) {
          return '请填写实例登录密码'
        }
        return this.loginPasswordError
      }

      return null
    },
    /**
     * 表单风格的登录密码校验：
     * - 绑定 @on-blur / @on-change，失焦或输入时实时反馈
     * - 空值时清空提示；有值时按规则判定，结果写入 loginPasswordError
     * - validateLoginInfo 在提交时复用本规则（规则单一来源）
     */
    validateLoginPassword () {
      const password = this.form.loginPassword || ''
      if (!password) {
        this.loginPasswordError = '请填写实例登录密码'
        return
      }
      if (password.length < 8 || password.length > 16) {
        this.loginPasswordError = '登录密码长度需为 8-16 位'
        return
      }
      if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        this.loginPasswordError = '登录密码必须同时包含字母和数字'
        return
      }
      this.loginPasswordError = ''
    },
    /**
     * 处理余额输入框失去焦点事件
     * 将输入值格式化为两位小数
     */
    handleBalanceAmountBlur () {
      if (this.availableBalance <= 0) {
        this.form.balanceAmount = 0
        return
      }
      if (this.form.balanceAmount !== null && this.form.balanceAmount !== undefined) {
        // 格式化为两位小数
        this.form.balanceAmount = parseFloat(this.form.balanceAmount.toFixed(2))
      }
      // 失去焦点时确保值为正整数
      // if (this.form.customAmount === null || this.form.customAmount === '') {
      //   this.form.customAmount = null;
      //   return;
      // }
      // const num = parseFloat(this.form.customAmount).toFixed(2);
      // if (isNaN(num) || num < 0) {
      //   this.form.customAmount = null;
      // } else {
      //   this.form.customAmount = parseFloat(num);
      // }
    },
    handleBalanceAmountChange (e) {
      // 说明：iview 的 @on-change 回调参数不是原生 Event，而是新值 value。
      // 因此从 v-model 取值最可靠；UI 上的原始字符串（含多个点/多余小数位）通过 ref 拿到原生 input 元素后强制回填。
      const raw = this.form.balanceAmount;
      if (raw === null || raw === undefined || raw === '') return;
      let s = String(raw);

      // 1. 去掉非数字/小数点字符（防御粘贴、IME 输入、键盘误触等场景）
      s = s.replace(/[^0-9.]/g, '');

      // 2. 仅保留第一个小数点（关键：用户在 InputNumber 中连点会出现 1...、5.8...）
      const firstDot = s.indexOf('.');
      if (firstDot !== -1) {
        s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
      }

      // 3. 整数部分最多 5 位（≤ 99999，即不超过十万）
      s = s.replace(/^(\d{0,5})(\..*)?$/, (_, intPart, rest) => intPart + (rest || ''));

      // 4. 小数位最多 2 位，多余直接截断（如 1.234 → 1.23，1.0000 → 1.00）
      const dotIdx = s.indexOf('.');
      if (dotIdx !== -1 && s.length - dotIdx - 1 > 2) {
        s = s.slice(0, dotIdx + 3);
      }

      // 5. 与原值不一致时同步清洗：
      //    - 立刻通过 ref 找到原生 <input>，把 value 改成清洗后的字符串（消除 UI 闪现 1..、1.0000）
      //    - 同时把清洗后的值赋给 v-model（保留 $nextTick 异步，避免触发 iview InputNumber 内部精度循环）
      if (s !== String(raw)) {
        const refInst = this.$refs.balanceAmountInput;
        const inputEl = refInst && refInst.$el ? refInst.$el.querySelector('input') : null;
        if (inputEl) {
          inputEl.value = s;
        }
        this.$nextTick(() => {
          this.form.balanceAmount = s === '' ? '' : Number(s) || s;
        });
      }
    },
    /**
     * 自动把使用金额设置为：min(可用余额, 当前支付总金额)
     * 仅在非按量计费且勾选使用余额时生效
     */
    autoFillBalanceAmount () {
      if (this.form.billingType !== 'hourly' && this.form.useBalance) {
        const total = parseFloat(this.finalTotalAmount || 0)
        if (total > 0) {
          this.form.balanceAmount = parseFloat(Math.min(Math.max(this.availableBalance, 0), total).toFixed(2))
        }
      }
    },
    /**
     * 处理镜像Tab切换
     */
    handleImageTabChange (tabName) {
      this.form.imageType = tabName
      // 切换tab时，默认选中当前tab列表的第一项
      const list = tabName === 'public' ? this.publicImageList : this.customImageList
      if (list && list.length > 0) {
        this.form.image = list[0].id
      } else {
        // 列表为空时清空选中
        this.form.image = ''
      }
      if (tabName === 'custom') {
        this.fetchCustomImageList()
      }
    },
    /**
     * 获取预设镜像列表后默认选中第一个（独立方法，便于fetchCustomImageList回调调用）
     */
    selectFirstImageIfAny (tabName) {
      const list = tabName === 'public' ? this.publicImageList : this.customImageList
      if (list && list.length > 0 && this.form.imageType === tabName) {
        this.form.image = list[0].id
      }
    },
    /**
     * 获取默认镜像图标 - 使用内嵌 base64 SVG
     */
    getDefaultImageIcon (osType) {
      const icons = {
        // CentOS
        centos: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBkPSJNNTkuMDMzIDY0LjE5MmwtMjcuMzA1IDI2LjY2LTI3LjMwMi0yNi42NiAyNy4zMDItMjYuNjUxem0wIDAiIGZpbGw9IiM5MzIyNzkiLz48cGF0aCBkPSJNMzEuNzMxIDM3LjU0MWwyNi42Ni0yNy4zMDUgMjYuNjUxIDI3LjMwNS0yNi42NTEgMjcuMzAyeiIgZmlsbD0iIzljY2QyYSIvPjxwYXRoIGQ9Ik04NS4wNDIgMzcuNTQxbDI3LjMwNSAyNi42NTEtMjcuMzA1IDI2LjY2LTI2LjY1MS0yNi42NnoiIGZpbGw9IiNlZmE3MjQiLz48cGF0aCBkPSJNNTkuMDMzIDkwLjg1MWwyNi42NTEtMjcuMzA1IDI2LjY2IDI3LjMwNS0yNi42NiAyNy4zMDV6IiBmaWxsPSIjMjYyNTc3Ii8+PC9zdmc+',
        // Windows
        windows: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBmaWxsPSIjMDBBREVGIiBkPSJNMTI2IDEuNjM3bC02NyA5LjgzNHY0OS44MzFsNjctLjUzNHpNMS42NDcgNjYuNzA5bC4wMDMgNDIuNDA0IDUwLjc5MSA2Ljk4My0uMDQtNDkuMDU3em01Ni44Mi42OGwuMDk0IDQ5LjQ2NSA2Ny4zNzYgOS41MDkuMDE2LTU4Ljg2M3pNMS42MSAxOS4yOTdsLjA0NyA0Mi4zODMgNTAuNzkxLS4yODktLjAyMy00OS4wMTZ6Ii8+PC9zdmc+',
        // Ubuntu
        ubuntu: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjQgMHYxMjhoODAuNjYyVjBIMjR6bTUzLjIyIDU1LjAyM2M0LjYxMyAwIDguMzUgMy43NjggOC4zNSA4LjQxNiAwIDQuNjQ4LTMuNzM3IDguNDE2LTguMzUgOC40MTYtNC42MSAwLTguMzUtMy43NjgtOC4zNS04LjQxNiAwLTQuNjQ4IDMuNzQtOC40MTYgOC4zNS04LjQxNnptLTExLjQ4Ni44NTRjLjY1My4wMDQgMS4zMDkuMDMzIDEuOTY1LjA4NmExMi4yMTMgMTIuMjEzIDAgMDAtMi41MzMgNi44MjRjLTYuNTczLjEyMi0xMi42NCAzLjM5Mi0xNi4zOTggOC44NDJhMTEuODM0IDExLjgzNCAwIDAwLTMuODE1LTEuNTQ5IDExLjc4NSAxMS43ODUgMCAwMC0yLjUyLS4yNzFjLS4yMSAwLS40MjEuMDAyLS42MzQuMDE1bC0uMDA0LjAwMmM0Ljg3Mi04LjY2MyAxNC4xNDYtMTQuMDA2IDIzLjk0LTEzLjk0OXptMjIuNTk0IDEyLjMyOGEyNy43NzEgMjcuNzcxIDAgMDEzLjkzOCAyMC45NjMgMjcuNjc3IDI3LjY3NyAwIDAxLTUuMzAzIDExLjM0MmwuMDAyLjAwNi0uMDA0LS4wMDQuMDAyLS4wMDJhMTIuMDkyIDEyLjA5MiAwIDAwLTMuOTk2LTYuMjY4IDIwLjY1OCAyMC42NTggMCAwMDIuNTk3LTYuNTIgMjAuNzM2IDIwLjczNiAwIDAwLTEuOTMtMTMuOTc2IDEyLjEgMTIuMSAwIDAwNC42OTQtNS41NHpNNDIuNDQzIDczLjQ4YzQuNjExIDAgOC4zNSAzLjc2OCA4LjM1IDguNDE2IDAgNC42NDgtMy43MzkgOC40MTYtOC4zNSA4LjQxNi00LjYxMiAwLTguMzUtMy43NjgtOC4zNS04LjQxNiAwLTQuNjQ4IDMuNzM4LTguNDE2IDguMzUtOC40MTZ6bTQuOTYzIDE5LjQxN2MyLjgyNiA1LjQ5MiA3Ljg1MyA5LjM2NCAxMy44NyAxMC42NjNsLjAwMS0uMDA0YTIwLjA0OCAyMC4wNDggMCAwMDIuMDUuMzM2IDEyLjEwNyAxMi4xMDcgMCAwMDIuNDQzIDcuMDM3IDI3LjI0IDI3LjI0IDAgMDEtNS45My0uNjE0Yy04LjkwMy0xLjkyNC0xNi4xNTMtOC4wNy0xOS41NzItMTYuNTM1YTExLjkzNCAxMS45MzQgMCAwMDcuMTM4LS44ODN6bTI3LjkzNiAyLjI5MWM0LjYxMiAwIDguMzUgMy43NjkgOC4zNSA4LjQxNyAwIDQuNjQ3LTMuNzM4IDguNDE2LTguMzUgOC40MTYtNC42MTEgMC04LjM1Mi0zLjc2OS04LjM1Mi04LjQxNiAwLTQuNjQ4IDMuNzQtOC40MTYgOC4zNTItOC40MTZ6Ii8+PC9zdmc+',
        // Debian
        debian: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBmaWxsPSIjQTgwMDMwIiBkPSJNNzMuNzc2IDY3LjUzMWMtMi4wNjUuMDI4LjM5MSAxLjA2MyAzLjA4NyAxLjQ3OWEyNy40NTMgMjcuNDUzIDAgMDAyLjAyMy0xLjc0MWMtMS42NzkuNDEtMy4zODcuNDE5LTUuMTEuMjYybTExLjA4Ni0yLjc2M2MxLjIyOS0xLjY5NyAyLjEyNy0zLjU1NiAyLjQ0Mi01LjQ3OC0uMjc2IDEuMzY5LTEuMDE5IDIuNTUzLTEuNzIgMy44MDEtMy44NiAyLjQzMS0uMzYzLTEuNDQzLS4wMDItMi45MTYtNC4xNSA1LjIyNS0uNTcgMy4xMzMtLjcyIDQuNTkzbTQuMDkzLTEwLjY0OGMuMjQ5LTMuNzItLjczMy0yLjU0NC0xLjA2My0xLjEyNS4zODQuMjAxLjY5IDIuNjIyIDEuMDYzIDEuMTI1TTY1Ljk0NCAzLjI4M2MxLjEwMi4xOTggMi4zODEuMzUgMi4yMDIuNjEyIDEuMjA2LS4yNjMgMS40OC0uNTA2LTIuMjAyLS42MTJtMi4yMDIuNjEzbC0uNzc5LjE2MS43MjUtLjA2NC4wNTQtLjA5N20zNC4zNzIgNTEuNjM0Yy4xMjMgMy4zNC0uOTc4IDQuOTYxLTEuOTY5IDcuODI5bC0xLjc4Ni44OTJjLTEuNDYgMi44MzguMTQyIDEuODAyLS45MDMgNC4wNTktMi4yODEgMi4wMjctNi45MjEgNi4zNDUtOC40MDYgNi43MzgtMS4wODQtLjAyMy43MzQtMS4yNzguOTcyLTEuNzcxLTMuMDUyIDIuMDk4LTIuNDQ5IDMuMTQ3LTcuMTE4IDQuNDIybC0uMTM2LS4zMDVjLTExLjUxNiA1LjQxNy0yNy41MS01LjMxOC0yNy4yOTktMTkuOTY2LS4xMjMuOTMxLS4zNDkuNjk3LS42MDUgMS4wNzQtLjU5NC03LjUzNyAzLjQ4MS0xNS4xMDcgMTAuMzUzLTE4LjE5NiA2LjcyMi0zLjMyOSAxNC42MDItMS45NjMgMTkuNDE3IDIuNTI0LTIuNjQ0LTMuNDY1LTcuOTA5LTcuMTM3LTE0LjE0OC02Ljc5My02LjExMS4wOTctMTEuODI4IDMuOTgtMTMuNzM1IDguMTk2LTMuMTMyIDEuOTcyLTMuNDk1IDcuNi00Ljg1OSA4LjYyOC0xLjgzNSAxMy40OTEgMy40NTMgMTkuMzE4IDEyLjM5OCAyNi4xNzUgMS40MDcuOTQ5LjM5NiAxLjA5My41ODcgMS44MTUtMi45NzItMS4zOTItNS42OTQtMy40OTMtNy45MzEtNi4wNjUgMS4xODYgMS43MzkgMi40NjggMy40MjkgNC4xMjUgNC43NTYtMi44MDMtLjk0OS02LjU0Ni02Ljc5LTcuNjQtNy4wMjggNC44MzIgOC42NDkgMTkuNTk5IDE1LjE2OSAyNy4zMzMgMTEuOTM1LTMuNTc5LjEzMS04LjEyNC4wNzMtMTIuMTQ1LTEuNDEzLTEuNjg4LS44NjktMy45ODQtMi42NjktMy41NzQtMy4wMDcgMTAuNTUzIDMuOTQ0IDIxLjQ1NiAyLjk4OCAzMC41ODYtNC4zMzMgMi4zMjMtMS44MSA0Ljg2MS00Ljg4NyA1LjU5NC00LjkzLTEuMTA1IDEuNjYxLjE4OC44LS42NiAyLjI2NiAyLjMxNi0zLjczMy0xLjAwNS0xLjUyMSAyLjM5NC02LjQ0OGwxLjI1NiAxLjcyOWMtLjQ2Ny0zLjA5OCAzLjg0OC02Ljg2MSAzLjQxLTExLjc2Mi45OS0xLjQ5OSAxLjEwNCAxLjYxMi4wNTQgNS4wNjEgMS40NTctMy44MjUuMzg0LTQuNDQuNzU5LTcuNTk3LjQwNCAxLjA2Mi45MzUgMi4xODggMS4yMDggMy4zMDgtLjk1LTMuNjk2Ljk3NS02LjIyNiAxLjQ1LTguMzczLS40NjctLjIwOC0xLjQ2NCAxLjYzNC0xLjY5Mi0yLjczMi4wMzQtMS44OTYuNTI4LS45OTMuNzE4LTEuNDYtLjM3My0uMjE1LTEuMzQ5LTEuNjY4LTEuOTQ0LTQuNDU2LjQzMS0uNjU1IDEuMTUxIDEuNjk4IDEuNzM5IDEuNzk1LS4zNzgtMi4yMTctMS4wMjgtMy45MDctMS4wNTMtNS42MDktMS43MTMtMy41NzktLjYwNi40NzgtMS45OTYtMS41MzYtMS44MjMtNS42ODcgMS41MTMtMS4zMiAxLjczOC0zLjkwMyAyLjc2MyA0LjAwMyA0LjMzOSAxMC4yMDggNS4wNjIgMTIuNzc3LS41NTItMy4xMzMtMS40NDMtNi4xNjgtMi41MzItOS4xMDUuODM5LjM1NC0xLjM1Mi02LjQ0NiAxLjA5MS0xLjk0My0yLjYwOS05LjYtMTEuMTY2LTE4LjU2OS0xOS4wMzgtMjIuNzc4Ljk2Mi44ODEgMi4xNzkgMS45ODkgMS43NDMgMi4xNjItMy45MTUtMi4zMzEtMy4yMjctMi41MTMtMy43ODctMy40OTgtMy4xOS0xLjI5Ny0zLjM5OS4xMDQtNS41MTEuMDAzLTYuMDEyLTMuMTg4LTcuMTcxLTIuODUtMTIuNzAzLTQuODQ4bC4yNTIgMS4xNzdjLTMuOTg0LTEuMzI3LTQuNjQxLjUwMy04Ljk0NS4wMDQtLjI2My0uMjA1IDEuMzc5LS43NCAyLjczLS45MzctMy44NS41MDgtMy42Ny0uNzU5LTcuNDM4LjE0LjkyOS0uNjUxIDEuOTA5LTEuMDgyIDIuOS0xLjYzNy0zLjEzOS4xOTEtNy40OTUgMS44MjgtNi4xNTEuMzM5LTUuMTIxIDIuMjg2LTE0LjIxOCA1LjQ5My0xOS4zMjIgMTAuMjhsLS4xNjEtMS4wNzNjLTIuMzM5IDIuODA5LTEwLjIgOC4zODctMTAuODI2IDEyLjAyMmwtLjYyNS4xNDZjLTEuMjE4IDIuMDYtMi4wMDQgNC4zOTYtMi45NyA2LjUxNy0xLjU5MiAyLjcxMy0yLjMzNCAxLjA0NC0yLjEwNyAxLjQ2OS0zLjEzMiA2LjM0OS00LjY4NyAxMS42ODMtNi4wMyAxNi4wNTcuOTU4IDEuNDMyLjAyMiA4LjYxNC4zODUgMTQuMzY0LTEuNTcyIDI4LjM5NCAxOS45MjggNTUuOTYyIDQzLjQzIDYyLjMyOSAzLjQ0NSAxLjIzIDguNTY3IDEuMTg0IDEyLjkyNCAxLjMxMS01LjE0MS0xLjQ3MS01LjgwNi0uNzc4LTEwLjgxMy0yLjUyNS0zLjYxNC0xLjcwMS00LjQwNS0zLjY0NC02Ljk2NC01Ljg2NGwxLjAxNCAxLjc5Yy01LjAxOS0xLjc3NS0yLjkxOC0yLjE5OC03LjAwMi0zLjQ5MWwxLjA4My0xLjQxMmMtMS42MjctLjEyMy00LjMwOS0yLjc0LTUuMDQyLTQuMTkxbC0xLjc3OS4wN2MtMi4xMzgtMi42MzgtMy4yNzctNC41MzgtMy4xOTQtNi4wMTFsLS41NzUgMS4wMjRjLS42NTItMS4xMTktNy44NjUtOS44OTMtNC4xMjMtNy44NS0uNjk2LS42MzctMS42Mi0xLjAzNS0yLjYyMi0yLjg1NmwuNzYyLS44NzFjLTEuODAyLTIuMzE2LTMuMzE1LTUuMjg3LTMuMi02LjI3Ni45NiAxLjI5OCAxLjYyNyAxLjU0IDIuMjg3IDEuNzYzLTQuNTQ4LTExLjI4NS00LjgwMy0uNjIyLTguMjQ4LTExLjQ4N2wuNzI5LS4wNTljLS41NTktLjg0Mi0uODk4LTEuNzU2LTEuMzQ3LTIuNjUybC4zMTYtMy4xNjFjLTMuMjc0LTMuNzg2LS45MTYtMTYuMDk4LS40NDMtMjIuODUxLjMyOC0yLjc0NiAyLjczMy01LjY2OSA0LjU2My0xMC4yNTJsLTEuMTE0LS4xOTJjMi4xMzEtMy43MTcgMTIuMTY3LTE0LjkyOCAxNi44MTUtMTQuMzUxIDIuMjUxLTIuODI5LS40NDYtLjAxMS0uODg2LS43MjMgNC45NDUtNS4xMTkgNi41LTMuNjE3IDkuODM4LTQuNTM3IDMuNi0yLjEzNy0zLjA4OS44MzMtMS4zODMtLjgxNSA2LjIyMy0xLjU4OSA0LjQxLTMuNjEzIDEyLjUyOC00LjQyLjg1Ny40ODctMS45ODcuNzUyLTIuNzAxIDEuMzg1IDUuMTg1LTIuNTM2IDE2LjQwOC0xLjk1OSAyMy42OTcgMS40MDggOC40NTggMy45NTIgMTcuOTYxIDE1LjYzOCAxOC4zMzYgMjYuNjMxbC40MjcuMTE0Yy0uMjE2IDQuMzcuNjY5IDkuNDI0LS44NjUgMTQuMDY2bDEuMDQzLTIuMjAxIi8+PC9zdmc+',
        // Fedora
        fedora: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBkPSJNMTI3LjgyIDY0LjAwNEMxMjcuODIgMjguNzU0IDk5LjI0Ni4xOCA2NCAuMThDMjguNzY2LjE4LjIwMyAyOC43My4xOCA2My45NTd2NDkuMzljLjAyIDcuOTk3IDYuNTA0IDE0LjQ3MyAxNC41MDggMTQuNDczaDQ5LjMzNWMzNS4yMzktLjAxNSA2My43OTctMjguNTc4IDYzLjc5Ny02My44MTYiIGZpbGw9IiMyOTQxNzIiLz48cGF0aCBkPSJNMzYuOTczIDY4LjEySDU5LjkxVjkxLjA2YzAgMTIuNjYtMTAuMjczIDIyLjkzNy0yMi45MzcgMjIuOTM3LTEyLjY2IDAtMjIuOTM0LTEwLjI3Ny0yMi45MzQtMjIuOTM3IDAtMTIuNjYgMTAuMjc0LTIyLjkzOCAyMi45MzQtMjIuOTM4em0wIDAiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMTQiIHN0cm9rZT0iIzNjNmViNCIvPjxwYXRoIGQ9Ik04Mi43MzggNjguMTY0SDU5LjgwMVY0NS4yMzFjMC0xMi42NiAxMC4yNzctMjIuOTM4IDIyLjkzNy0yMi45MzggMTIuNjYgMCAyMi45MzggMTAuMjc0IDIyLjkzOCAyMi45MzggMCAxMi42Ni0xMC4yNzggMjIuOTMzLTIyLjkzOCAyMi45MzN6bTAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxNCIgc3Ryb2tlPSIjM2M2ZWI0Ii8+PHBhdGggZD0iTTY2LjkyNiA2MS4xMzd2MjkuODljMCAxNi41NC0xMy40MSAyOS45NTMtMjkuOTUgMjkuOTUzLTIuNTExIDAtNC4yOTYtLjI4NS02LjYxNy0uODktMy4zOS0uODg3LTYuMTU2LTMuNjY0LTYuMTYtNi44OTUgMC0zLjkwNiAyLjgzNi02Ljc0NiA3LjA3NC02Ljc0NiAyLjAxNiAwIDIuNzQ3LjM4NyA1LjcwNC4zODcgOC43MTggMCAxNS43OTMtNy4wNjMgMTUuODA4LTE1Ljc4NVY3Ny4zMTJjMC0xLjIzLTEtMi4yMy0yLjIzNC0yLjIyNmwtMTAuMzg3LS4wMDRjLTMuODY3IDAtNi45OTYtMy4wODYtNi45OTYtNi45NjUgMC0zLjkwNiAzLjE2LTYuOTggNy4wNy02Ljk4IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTUyLjc4NSA3NS4xNDhWNDUuMjYyYzAtMTYuNTQzIDEzLjQxLTI5Ljk1MyAyOS45NTMtMjkuOTUzIDIuNTA4IDAgNC4yOTMuMjggNi42MTcuODkgMy4zODcuODg3IDYuMTU3IDMuNjY0IDYuMTU3IDYuODk1IDAgMy45MDYtMi44MzYgNi43NDYtNy4wNyA2Ljc0Ni0yLjAyIDAtMi43NS0uMzg3LTUuNzA0LS4zODctOC43MjIgMC0xNS43OTcgNy4wNjMtMTUuODEyIDE1Ljc4MXYxMy43NDNhMi4yMzUgMi4yMzUgMCAwMDIuMjM0IDIuMjI2bDEwLjM4Ny4wMDRjMy44NzEgMCA2Ljk5NiAzLjA4NiA2Ljk5NiA2Ljk2NS4wMDQgMy45MDYtMy4xNiA2Ljk4LTcuMDcgNi45OCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
        // RedHat
        redhat: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTE2LjQgOTcuOWMtMi40LS41LTUtLjktNy41LS45LTQuNCAwLTguNC44LTExLjQgMi0uMy4yLS42LjUtLjYuOSAwIC4xIDAgLjMuMS40LjMgMS0uMiAyLjEtMy4xIDIuNy00LjMuOS02LjkgNS4zLTguNSA2LjgtMS44IDEuNy02LjkgMi44LTYuMSAxLjcuNi0uOCAyLjktMy4zIDQuMy02IDEuMy0yLjQgMi40LTMuMSAzLjktNS40LjUtLjcgMi4yLTMgMi43LTQuOS42LTEuOC40LTQuMS42LTUuMS4zLTEuNCAxLjYtNC4zIDEuNy02IC4xLS45LTMuOSAxLjQtNS44IDEuNHMtMy43LTEuMS01LjQtMS4yYy0yLjEtLjEtMy40IDEuNi01LjMgMS4zLTEuMS0uMi0yLTEuMS0zLjktMS4yLTIuNy0uMS02IDEuNS0xMi4yIDEuMy02LjEtLjItMTEuNy03LjctMTIuNS04LjktLjktMS40LTItMS40LTMuMi0uMy0xLjIgMS4xLTIuNy4yLTMuMS0uNS0uOC0xLjQtMi45LTUuNS02LjItNi4zLTQuNi0xLjItNi45IDIuNS02LjYgNS41LjMgMyAyLjIgMy44IDMuMSA1LjQuOSAxLjYgMS40IDIuNiAzIDMuMyAxLjIuNSAxLjYgMS4yIDEuMyAyLjItLjMuOS0xLjYgMS4xLTIuNCAxLjEtMS43LjEtMy0uNC0zLjgtMS0xLS43LTEuOS0xLjYtMi44LTMuMS0xLTEuNy0yLjctMi41LTQuNi0yLjUtLjkgMC0xLjguMi0yLjUuNi0zIDEuNi02LjYgMi41LTEwLjQgMi41SDQuOWM4LjMgMjQuNyAzMS43IDQyLjQgNTkuMiA0Mi40IDIxLjkuMyA0MS4yLTExIDUyLjMtMjguMiIvPjxwYXRoIGQ9Ik0xMTYuNCA5Ny45Yy0yLjQtLjYtNS0uOS03LjUtLjktNC40IDAtOC40LjgtMTEuNCAyLS4zLjItLjYuNS0uNi45IDAgLjEgMCAuMy4xLjQuMyAxLS4yIDIuMS0zLjEgMi44LTQuMy45LTYuOSA1LjMtOC41IDYuOC0xLjggMS43LTYuOSAyLjgtNi4xIDEuNy42LS44IDIuOS0zLjMgNC4zLTYgMS4zLTIuNCAyLjQtMy4xIDMuOS01LjQuNS0uNyAyLjItMyAyLjctNC45LjYtMS44LjQtNC4xLjYtNS4xLjMtMS40IDEuNi00LjMgMS43LTYgLjEtLjktMy45IDEuMy01LjggMS4zcy0zLjctMS4xLTUuNC0xLjJjLTIuMS0uMS0zLjQgMS42LTUuMyAxLjMtMS4xLS4yLTItMS4xLTMuOS0xLjItMi43LS4xLTYgMS41LTEyLjIgMS4zLTYuMS0uMi0xMS43LTcuNy0xMi41LTguOS0uOS0xLjQtMi0xLjQtMy4yLS4zLTEuMiAxLjEtMi43LjItMy4xLS41LS44LTEuNC0yLjktNS41LTYuMi02LjMtNC42LTEuMi02LjkgMi41LTYuNiA1LjUuMyAzIDIuMiAzLjggMy4xIDUuNC45IDEuNiAxLjQgMi42IDMgMy4zIDEuMi41IDEuNiAxLjIgMS4zIDIuMi0uMy45LTEuNiAxLjEtMi40IDEuMS0xLjcuMS0zLS40LTMuOC0xLTEtLjctMS45LTEuNi0yLjgtMy4xLTEtMS43LTIuNy0yLjUtNC42LTIuNS0uOSAwLTEuOC4yLTIuNS42LTMgMS42LTYuNiAyLjUtMTAuNCAyLjVINC44QzIuNyA3Ny43IDEuNiA3MSAxLjYgNjQgMS42IDI5LjUgMjkuNSAxLjYgNjQgMS42czYyLjQgMjcuOSA2Mi40IDYyLjRjMCAxMi41LTMuNyAyNC4xLTEwIDMzLjkiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNNTkuMSAzMS4zYy03LjIuNS04IDEuMy05LjMgMi43LTEuOSAyLTQuNC0yLjYtNC40LTIuNi0xLjUtLjMtMy4zLTIuNy0yLjMtNSAxLTIuMiAyLjgtMS42IDMuMy0uOS43LjggMi4xIDIuMiA0IDIuMiAxLjktLjEgNC4xLS40IDcuMS0uNCAzLjEgMCA1LjIgMS4xIDUuMyAyLjEuMS45LS4yIDEuNy0zLjcgMS45bTcuNi0xMS45Yy0uMSAwLS4yLS4xLS4yLS4yczAtLjEuMS0uMmMxLjQtLjcgMy41LTEuMyA1LjktMS42LjctLjEgMS40LS4xIDIuMS0uMWguNGM0IC4xIDcuMiAxLjcgNy4yIDMuNi0uMSAxLjktMy4zIDMuMy03LjMgMy4yLTEuMyAwLTIuNS0uMi0zLjYtLjUtLjEgMC0uMi0uMS0uMi0uM3MuMS0uMi4yLS4zYzIuNS0uNiA0LjItMS41IDQuMS0yLjQtLjItMS4yLTMuNC0xLjgtNy4zLTEuNC0uNi4xLTEgLjItMS40LjJtMzIuNSAyOGMtLjYgMi4xLTEuNSA0LjctNS40IDYuNy0uNi4zLS44LS4yLS41LS42IDEuNS0yLjUgMS43LTMuMSAyLjItNC4xLjYtMS40LjktMy41LS4zLTcuOC0yLjMtOC40LTcuMi0xOS43LTEwLjgtMjMuNC0zLjQtMy41LTkuNy00LjUtMTUuMy0zLjEtMi4xLjUtNi4xIDIuNi0xMy42LjktMTMtMi45LTE0LjkgMy42LTE1LjcgNi40LS44IDIuOC0yLjUgMTAuOS0yLjUgMTAuOS0uNiAzLjMtMS40IDkgMTguOCAxMi44IDkuNCAxLjggOS45IDQuMiAxMC4zIDYgLjcgMy4xIDEuOSA0LjkgMy4zIDUuOCAxLjMuOSAwIDEuNi0xLjUgMS44LTQgLjQtMTguOC0zLjgtMjcuNi04LjgtNy4yLTQuNC03LjMtOC4zLTUuNi0xMS43LTEwLjgtMS4yLTE5IDEtMjAuNCA2LjEtMi42IDkgMTkuMiAyNCA0NC4xIDMxLjUgMjYuMSA3LjkgNTMgMi40IDU2LTE0IDEuNC03LjUtNC45LTEzLTE1LjUtMTUuNCIgZmlsbD0iI0U5MzQ0MiIvPjwvc3ZnPg==',
        // SUSE
        suse: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9IiM3M2JhMjUiIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBkPSJNNTguNzc3IDMyLjU3NWMtOS42MjQuMDQ1LTIxLjk1IDEuNTk0LTM3LjA1OCAxMC43ODlsLS41OTQuMzY4Yy05LjQ3OCA1Ljg1NC0xNi4wMTggMTMuMDY3LTE5LjQ0IDIxLjQ1NEMuNjEzIDY3LjgyLS44MyA3My43NzYuNTk5IDc5LjM3NmMuNjE3IDIuNDQ5IDEuNzY3IDQuOTExIDMuMzE1IDcuMTEzIDMuNDk2IDQuOTc4IDkuMzcyIDguMjggMTUuNjk0IDguODM4IDguOTI5Ljc5IDE1LjY4Ni0zLjE4IDE4LjA5LTEwLjYxMyAxLjY1MS01LjEyOSAwLTEyLjY1NC02LjMzNi0xNi40OTMtNS4xNTctMy4xMjQtMTAuNjk4LTIuNDEzLTEzLjkxNS0uMzEtMi43ODYgMS44MzItNC4zNjYgNC42NzctNC4zNCA3LjgwNC4wNjIgNS41NDMgNC44ODYgOC40ODggOC4zNTYgOC40OTcgMS4wMDggMCAyLjAxOS0uMTcyIDMuMTYtLjU0MS40MDgtLjEyNC43OS0uMjc2IDEuMjEtLjUzMmwuMTMtLjA3Ni4wNTctLjA0YTIuODE3IDIuODE3IDAgMCAwIDEuMjY1LTIuMzMgMi43NDkgMi43NDkgMCAwIDAtLjExMS0uNzcxYy0uNDA4LTEuNDAzLTEuODExLTIuMjUtMy4yNjItMS45ODhsLS4xOTUuMDQ0LS4yNjYuMDgtLjM4Ni4xMzNhNy42MjEgNy42MjEgMCAwIDEtMS41MjIuMjEzYy0uNDA4LS4wMjctMi40LS42MTYtMi40LTIuNzgydi0uMDI3YzAtLjc5OC4zMTgtMS4zNTQuNDk2LTEuNjYuNjItLjk2NCAyLjMyMi0xLjkwNiA0LjYyLTEuNzEyIDMuMDEyLjI1OCA1LjE4NiAxLjc5IDYuNjI5IDQuNjc3IDEuMzM2IDIuNjg1Ljk4NSA1Ljk4Ni0uOTAxIDguNDA0LTEuODc3IDIuMzk3LTUuMjE0IDMuNDE3LTkuNjUgMi45NDItNC40NzktLjQ4OS04LjI2My0zLjA0LTEwLjM4LTcuMDA3LTIuMDc2LTMuODgyLTIuMTg3LTguNDg0LS4yOTItMTIuMDE1IDQuNTMtOC40NzEgMTMuMDg1LTguMzgzIDE3Ljc4LTcuNTggNi45NDMgMS4xOTQgMTQuODQyIDcuNTM2IDE3LjY0NiAxNC44NTcuNDUyIDEuMTY2LjY4MyAyLjA5NC44ODMgMi45NDFsLjMwMiAxLjI2NSA3Ljg0NSAzLjc5Yy4xNjguMDgzLjIyNy4xMS4yOTMuMDYxLjA4NC0uMDYyLjAzNS0uMjI2LjAzNS0uMjI2LS4wNDktLjE3My0uMTY0LS4zMzMtLjM0Mi0yLjUwNy0uMTUtMS45My0uNDUzLTcuMjEgMi4yMzItOS44MjQgMS4wNDMtMS4wMjQgMi42MzItMS45MzkgMy44ODctMi4yMjcgNS4xMzgtMS4yNDcgMTEuMTY4LS4zODYgMTYuODcgNi4xNDUgMi45NSAzLjM3MyA0LjM4OSA0LjkxMiA1LjExMiA1LjYgMCAwIC4xNjQuMTU1LjI1My4yMjYuMDkzLjA4LjE1NS4xNDMuMjk3LjIyMi4yMzUuMTMgOS44MDIgNC40OSA5LjgwMiA0LjQ5cy4xMTEuMDUzLjE5NS0uMDQ4LjAwNC0uMjA0LjAwNC0uMjA0Yy0uMDYyLS4wNzItNi4wNi03Ljc0Ny00Ljk5Ni0xNC4wNy44NDMtNS4wMzMgNC44OS00LjU4IDEwLjQ5LTMuOTU0IDEuODI3LjIxMiAzLjkwOC40NDggNi4wNi40OTcgNi4wMTcuMDQgMTIuNDk3LTEuMDYgMTYuNDktMi43OTEgMi41ODItMS4xMDkgNC4yMjgtMS44NSA1LjI2Mi0yLjc4Mi4zNzItLjMwMS41NjMtLjguNzYzLTEuMzMxbC4xNDItLjM1MWMuMTY4LS40My40MTItMS4zNDIuNTItMS44NDEuMDQzLS4yMTkuMDk3LS40MzQtLjA5LS41NzMtLjE2NC0uMTI4LS41NS4xMDItLjU1LjEwMi0xLjc1MyAxLjA0My02LjEzNyAzLjAyMS0xMC4yMzYgMy4xMDYtNS4wODYuMTAyLTE1LjM5Ny01LjA5OS0xNi40NjItNS42NDhsLTIuMTU3LTUuMDVjNy4zNzUgNC44MSAxMy40OTQgNy40NjggMTguMTc1IDcuODggNS4yMTQuNDU4IDkuMjc4LTIuMzU2IDExLjA0LTMuNTI3LjIzLS4xNTYuNDYtLjMyMy42NzQtLjQ4OC4wNC0uMDI2LjEyOS0uMTA3LjExNS0uMTc4LS4yOTMtMS44MS0zLjAxMi0xMC41ODMtNS4wNzYtMTIuNjktLjU2OC0uNTc3LTEuMDItMS4xNC0xLjkzOS0xLjY3Ny03LjQ1NC00LjMtMjUuMTQtNi44OTUtMjUuOTY2LTcuMDEgMCAwLS4wODQtLjAxOS0uMTQyLjAzNS0uMDQ2LjA0NC0uMDU0LjEyOC0uMDU0LjEyOGwtLjA4IDQuMDM0Yy0xLjgwNS0uNjAyLTE0LjkzNi00LjgwMS0yNy4yMzktNS4yMjMtMi42MS0uMDktNS41MTgtLjI0NC04LjcyNS0uMjI4em01Ni4wMTIgOC42NjNjNC4xNjcuMTQ3IDcuNDQyIDMuNjMgNy4zIDcuNzUyYTcuNDQgNy40NCAwIDAgMS0yLjM5NyA1LjIxNCA3LjU1MiA3LjU1MiAwIDAgMS01LjQzNSAyLjAxNGMtNC4xNjItLjE1LTcuNDMzLTMuNjMtNy4yOTUtNy43NTZhNy40NSA3LjQ1IDAgMCAxIDIuMzk2LTUuMjE4IDcuNjEgNy42MSAwIDAgMSA1LjQzMS0yLjAwNnptLS4wNjYgMi4yMDZhNS4yNDIgNS4yNDIgMCAwIDAtMy43OCAxLjM5NyA1LjE0NiA1LjE0NiAwIDAgMC0xLjY3IDMuNjM0Yy0uMDk3IDIuODg1IDIuMTg1IDUuMzExIDUuMDkgNS40MThhNS4zMTYgNS4zMTYgMCAwIDAgMy43OS0xLjQwNyA1LjE0NiA1LjE0NiAwIDAgMCAxLjY2NC0zLjYzNGMuMTAyLTIuODg0LTIuMTgtNS4zMDYtNS4wOTQtNS40MDh6bS44NjUgMi42MjJjMS4yOTUgMCAyLjM0My42ODcgMi4zNDMgMS41NDggMCAuODQ4LTEuMDUxIDEuNTQ1LTIuMzQzIDEuNTQ1LTEuMjk1IDAtMi4zNDMtLjY5Ny0yLjM0My0xLjU0NSAwLS44NiAxLjA0OC0xLjU0OCAyLjM0My0xLjU0OHptLTIwLjExIDM3LjA5YTEuNjQ3IDEuNjQ3IDAgMCAwLTEuNjU0IDEuNjUgMS42NDcgMS42NDcgMCAwIDAgMS42NTUgMS42NiAxLjY1NSAxLjY1NSAwIDAgMCAuMDA0LTMuMzF6bTAgLjI1OGguMDA1Yy43NCAwIDEuMzM1LjYyNSAxLjMzNSAxLjQwMiAwIC43NzctLjU5NSAxLjQwMi0xLjMzNSAxLjM5My0uNzQgMC0xLjM0LS42MTYtMS4zNC0xLjQwMiAwLS43NzEuNi0xLjM5MyAxLjMzNS0xLjM5M3ptLS4wODQuNDdjLS4yMjEgMC0uMzY5LjAyMi0uNTI4LjA0NHYxLjg0MmguMjk4di0uNzk0aC4yMDhjLjI0IDAgLjM1Ni4wODguNDA0LjMyMy4wMzYuMjQ0LjA4LjQxNC4xMjQuNDdoLjMxYy0uMDMxLS4wNTctLjA3LS4xNjgtLjExOS0uNDU2LS4wMzUtLjI3Mi0uMTQ3LS40MTctLjMxLS40NDh2LS4wMTRjLjItLjA1Ny4zNjMtLjIxLjM2My0uNDQ4IDAtLjE3Ny0uMDYxLS4zMDItLjE3My0uMzgxLS4xMTEtLjA4LS4yOTMtLjEzOC0uNTc3LS4xMzh6bS0uMDEzLjIyNmMuMzMzIDAgLjQ1My4xNi40NTMuMzI0IDAgLjIyNy0uMjA5LjMxNS0uNDUzLjMxNWgtLjIxN3YtLjYyNWMuMDUzLS4wMS4xMi0uMDE0LjIxNy0uMDE0eiIvPjwvc3ZnPg==',
        // Linux (default)
        linux: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBmaWxsPSIjMzMzIiBkPSJNNjQgMEMyOC43IDAgMCAzNS4yIDAgNzguOGMwIDMyLjMgMTguMyA2MC41IDQ1LjUgNzQuNWwzLjMgNi41YzEuMiAyLjQgMy42IDQuMyA2LjQgNC43IDIuOC40IDUuNi0uNyA3LjQtMi44IDEuOC0yLjEgMi42LTQuOSAxLjktNy43bC0xLjItNC44Yy41LjEuOS4yIDEuNC4zIDIuNS41IDUuMS43IDcuNy43IDIuNiAwIDUuMi0uMiA3LjctLjcuNS0uMS45LS4yIDEuNC0uM2wtMS4yIDQuOGMtLjcgMi44LjEgNS42IDEuOSA3LjcgMS44IDIuMSA0LjYgMy4yIDcuNCAyLjggMi44LS40IDUuMi0yLjMgNi40LTQuN2wzLjMtNi41QzEwOS43IDEzOS4zIDEyOCAxMTEuMSAxMjggNzguOCAxMjggMzUuMiA5OS4zIDAgNjQgMHptMCAxNWMzMi45IDAgNTkuNiAzMC4xIDU5LjYgNjcuMiAwIDI3LjMtMTMuNyA1MS4zLTM0LjMgNjMuMmwtLjctNC43Yy0uNS0zLjQtMy4xLTYuMS02LjUtNi44LTMuNC0uNy02LjkuNS04LjkgMy4ybC0yLjIgMy4xYy0yLjMgMy4zLTYuMSA1LjMtMTAuMiA1LjMtNC4xIDAtNy45LTItMTAuMi01LjNsLTIuMi0zLjFjLTItMi43LTUuNS0zLjktOC45LTMuMi0zLjQuNy02LjEgMy40LTYuNSA2LjhsLS43IDQuN0ExNC41IDE0LjUgMCAwIDEgNC40IDgyLjJDNC40IDQ1LjEgMzEuMSAxNSA2NCAxNXoiLz48cGF0aCBmaWxsPSIjZmNjIiBkPSJNNDguNSA2MGMtMS40IDAtMi43LjgtMy40IDIuMS0uNyAxLjMtLjUgMi45LjUgNCAxIDEuMSAyLjYgMS41IDQuMSAxIC4zLS4xLjYtLjMuOS0uNSAxLjItMSAyLTEuNSAyLjYtMiAuNS0uNSAxLTEuMSAxLjQtMiAuNC0uOS41LTEuOS4yLTIuOC0uMy0uOS0uOS0xLjctMS43LTIuMi0uOC0uNS0xLjgtLjctMi44LS42em0zMSAwYy0xIDAtMiAuMi0yLjguNy0uOC41LTEuNCAxLjMtMS43IDIuMi0uMy45LS4yIDEuOS4yIDIuOC40LjkgMSAxLjUgMS40IDIgLjYuNSAxLjQgMSAyLjYgMiAuMy4yLjYuNC45LjUgMS41LjUgMy4xLjEgNC4xLTEgMS0xLjEgMS4yLTIuNy41LTQtLjctMS4zLTItMi4xLTMuNC0yLjF6Ii8+PC9zdmc+'
      }
      if (!osType) return icons.linux
      const lowerType = osType.toLowerCase()
      if (lowerType.includes('centos')) {
        return icons.centos
      } else if (lowerType.includes('windows')) {
        return icons.windows
      } else if (lowerType.includes('ubuntu')) {
        return icons.ubuntu
      } else if (lowerType.includes('debian')) {
        return icons.debian
      } else if (lowerType.includes('fedora')) {
        return icons.fedora
      } else if (lowerType.includes('redhat') || lowerType.includes('rhel')) {
        return icons.redhat
      } else if (lowerType.includes('suse')) {
        return icons.suse
      } else {
        return icons.linux
      }
    },
    /**
     * 获取系统预设镜像列表
     */
    async fetchPublicImageList () {
      this.publicImageListLoading = true
      try {
        const poolId = this.getFirstPoolIdOfSelectedRegion()
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/mirrorService/listMirrorPage',
          method: 'post',
          data: {
            mirrorType: 'public',
            poolId: poolId
          }
        })
        if (res.errcode === 0) {
          this.publicImageList = res.data || []
          // 默认选中第一个镜像
          if (this.publicImageList.length > 0 && !this.form.image) {
            this.form.image = this.publicImageList[0].id
          }
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.publicImageList = []
          console.error('获取预设镜像列表失败:', res.errmsg)
        }
      } catch (e) {
        console.error('获取预设镜像列表失败:', e)
        this.publicImageList = []
      } finally {
        this.publicImageListLoading = false
      }
    },
    /**
     * 获取自主上传镜像列表
     */
    async fetchCustomImageList () {
      // 如果已经加载过，不再重复加载
      if (this.customImageList.length > 0) return
      this.customImageListLoading = true
      try {
        const poolId = this.getFirstPoolIdOfSelectedRegion()
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/mirrorService/listMirrorPage',
          method: 'post',
          data: {
            mirrorType: 'custom',
            poolId: poolId
          }
        })
        if (res.errcode === 0) {
          this.customImageList = res.data || []
          // custom tab 加载完成后如果还在该 tab，自动默认选中第一个
          if (this.form.imageType === 'custom' && this.customImageList.length > 0) {
            this.form.image = this.customImageList[0].id
          }
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.customImageList = []
          console.error('获取自主上传镜像列表失败:', res.errmsg)
        }
      } catch (e) {
        console.error('获取自主上传镜像列表失败:', e)
        this.customImageList = []
      } finally {
        this.customImageListLoading = false
      }
    },
    /**
     * 调用后端接口计算价格
     */
    async calculatePrice () {
      // 校验必要参数
      if (!this.selectedSpec) {
        this.totalAmount = 0
        return
      }

      const billingType = this.form.billingType

      // 按量计费只需要SKU和价格
      if (billingType === 'hourly') {
        const originalPriceHourly = this.selectedSpec.originalData && this.selectedSpec.originalData.priceHourly
        if (!this.selectedSpec.priceHourly && !originalPriceHourly) {
          this.totalAmount = 0
          return
        }
      }
      // 包月计费需要选择时长
      else if (billingType === 'monthly') {
        if (!this.form.duration) {
          this.totalAmount = 0
          return
        }
      }

      // 获取当前选中的时长选项
      const durationItem = this.durationOptions.find(item => item.label === this.form.duration)

      // 构建数据盘参数（有有效ID的数据盘）
      const dataDiskIds = this.selectedDataDisks
        .filter(item => item.id)
        .map(item => item.id)

      // 构建请求参数
      const params = {
        billingType: billingType,
        skuId: this.selectedSpec.id,
        quantity: this.form.quantity || 1,
        dataDiskIds: dataDiskIds
      }

      // 按量计费参数（可选，不传则后端查询）
      if (billingType === 'hourly') {
        params.priceHourly = (this.selectedSpec.originalData && this.selectedSpec.originalData.priceHourly) || this.selectedSpec.priceHourly
      }
      // 包月计费参数（价格从后端查询，通过pricingStrategyDetailId获取折扣）
      else if (billingType === 'monthly' && durationItem) {
        params.pricingStrategyDetailId = durationItem.id
      }

      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productSkuService/calculatePrice',
          method: 'post',
          data: params
        })

        if (res.errcode === 0 && res.data) {
          const result = res.data
          this.totalAmount = result.totalAmount || 0
          // 前端根据原价/实价比例计算折扣文本，避免后端返回错误（如0.95显示为10折）
          const instanceOriginalAmount = result.instanceOriginalAmount || 0
          const instanceAmount = result.instanceAmount || 0
          const localDiscountText = this.formatDiscountText(instanceOriginalAmount, instanceAmount)
          this.priceInfo = {
            originalUnitPrice: result.originalUnitPrice || 0,
            actualUnitPrice: result.actualUnitPrice || 0,
            originalTotalAmount: result.originalTotalAmount || 0,
            priceUnit: result.priceUnit || '',
            savedAmount: result.savedAmount || 0,
            discountText: localDiscountText || (result.discountText || ''),
            instanceAmount: instanceAmount,
            instanceOriginalAmount: instanceOriginalAmount,
            dataDiskDetails: result.dataDiskDetails || []
          }
        } else if (res.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          console.error('计算价格失败:', res.errmsg)
          // 失败后使用前端计算作为兜底
          this.calculatePriceFallback()
        }
      } catch (e) {
        console.error('调用价格计算接口失败:', e)
        // 失败后使用前端计算作为兜底
        this.calculatePriceFallback()
      }
    },
    /**
     * 前端计算价格的兜底方案（当后端接口失败时使用）
     */
    calculatePriceFallback () {
      if (!this.selectedSpec || this.form.duration === '') {
        this.totalAmount = 0
        return
      }

      const billingType = this.form.billingType
      const quantity = this.form.quantity || 1
      let instanceAmount = 0

      // 按量计费：单价 × 数量
      if (billingType === 'hourly') {
        const unitPrice = this.selectedSpec.priceValue || 0
        instanceAmount = unitPrice * quantity
      }
      // 包月计费
      else if (billingType === 'monthly') {
        const durationItem = this.durationOptions.find(item => item.label === this.form.duration)
        if (durationItem) {
          const priceMonthly = (this.selectedSpec.originalData && this.selectedSpec.originalData.priceMonthly) || this.selectedSpec.priceValue || 0
          let unitPrice = 0
          let period = durationItem.num || 1

          if (durationItem.coutType === 'day') {
            // 天价格
            unitPrice = priceMonthly / 30 * parseFloat(durationItem.discount || 1)
          } else {
            // 月价格
            unitPrice = priceMonthly * parseFloat(durationItem.discount || 1)
          }
          instanceAmount = unitPrice * quantity * period
        }
      }

      // 兜底方案：实例价格 + 数据盘价格（前端计算）
      const dataDiskTotal = parseFloat(this.selectedDataDiskTotalPrice || 0)
      this.totalAmount = parseFloat((instanceAmount + dataDiskTotal).toFixed(2))

      // 更新 priceInfo（简化版）
      this.priceInfo = {
        originalUnitPrice: 0,
        actualUnitPrice: 0,
        originalTotalAmount: this.totalAmount,
        priceUnit: billingType === 'hourly' ? '/小时' : '/月',
        savedAmount: 0,
        discountText: '',
        instanceAmount: parseFloat(instanceAmount.toFixed(2)),
        instanceOriginalAmount: parseFloat(instanceAmount.toFixed(2)),
        dataDiskDetails: []
      }
    },
    /**
     * 根据原价和实价计算"X折"文本
     * 0.95 -> 9.5折；无折扣时返回空字符串
     */
    formatDiscountText (originalAmount, actualAmount) {
      const original = parseFloat(originalAmount)
      const actual = parseFloat(actualAmount)
      if (!original || original <= 0) return ''
      const rate = actual / original
      if (rate >= 1) return ''
      // 保留一位小数，去掉末尾的 0
      const discount = Math.round(rate * 10 * 10) / 10
      return `${discount}折`
    },
    /**
     * 计算总的折扣金额（实例折扣 + 数据盘折扣）
     */
    getTotalSavedAmount () {
      if (!this.priceInfo) return 0
      // 实例折扣金额
      const instanceSaved = (this.priceInfo.instanceOriginalAmount || 0) - (this.priceInfo.instanceAmount || 0)
      // 数据盘折扣金额
      let diskSaved = 0
      if (this.priceInfo.dataDiskDetails && this.priceInfo.dataDiskDetails.length > 0) {
        diskSaved = this.priceInfo.dataDiskDetails.reduce((sum, disk) => {
          return sum + ((disk.originalTotalAmount || 0) - (disk.actualTotalAmount || 0))
        }, 0)
      }
      return instanceSaved + diskSaved
    },
    /**
     * 获取当前选中地域资源池列表的第一个资源池ID
     */
    getFirstPoolIdOfSelectedRegion () {
      if (!this.selectedRegionId) {
        return null
      }
      const region = this.regionList.find(item => item.id === this.selectedRegionId)
      if (region && region.resourcePools && region.resourcePools.length > 0) {
        return region.resourcePools[0].id
      }
      return null
    },
    async fetchGpuConfigs () {
      // 兼容旧调用入口：若已加载顶级分类则重新触发当前 Tab 加载；否则 fallback 到通用懒加载
      if (this.categoryList && this.categoryList.length > 0) {
        this.resetSkuMap()
        if (this.productType) {
          this.fetchSkusByCategory(this.productType)
        }
        return
      }
      // 兜底：未拉到顶级分类时，使用旧的 GPU 接口调用逻辑，避免空白页
      this.fetchSkusByCategory(this.productType || '')
    },
    /**
     * 获取当前计费方式对应的价格字段和单位
     */
    getPriceField () {
      const billingType = this.form.billingType
      if (billingType === 'monthly') {
        return { priceField: 'priceMonthly', priceUnit: '/月' }
      } else if (billingType === 'hourly') {
        return { priceField: 'priceHourly', priceUnit: '/小时' }
      }
      return { priceField: 'price', priceUnit: '/月' }
    },
    /**
     * 拉取顶级产品分类（用于动态渲染产品 Tab）
     */
    async fetchTopCategories () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productCategoryService/listTopCategory',
          method: 'post',
          data: {}
        })
        if (res.errcode === 0) {
          this.categoryList = Array.isArray(res.data) ? res.data : []
          if (this.categoryList.length > 0) {
            // 预创建 filterMap/skuMap 条目（确保模板渲染时已存在）
            this.categoryList.forEach(cat => {
              if (!this.skuMap[cat.id]) {
                this.$set(this.skuMap, cat.id, this.createEmptySkuBucket(cat.id))
              }
            })
            if (!this.productType) {
              // 外部跳转带 categoryId 时优先定位到对应分类 Tab，否则默认激活第一个 Tab
              const targetCat = this.queryParams.categoryId &&
                this.categoryList.find(c => c.id === this.queryParams.categoryId)
              this.productType = targetCat ? targetCat.id : this.categoryList[0].id
            }
          }
        } else if (res.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.categoryList = []
          console.error('获取顶级产品分类失败:', res.errmsg)
        }
      } catch (e) {
        console.error('获取顶级产品分类失败:', e)
        this.categoryList = []
      }
    },
    /**
     * 创建分类下的空 SKU 桶（含筛选条件）
     * 同时在 filterMap 创建对应条目，便于模板 v-model 直接双向绑定（Vue2 不能响应式检测新增属性）
     */
    createEmptySkuBucket (categoryId) {
      const filters = {
        vcpu: null,
        memory: null,
        gpu: null,
        modelName: '',
        cpuName: null,
        gpuName: null
      }
      // 同步写入 filterMap，保证模板渲染时已存在
      if (!this.filterMap[categoryId]) {
        this.$set(this.filterMap, categoryId, filters)
      }
      return {
        list: [],
        loading: false,
        loaded: false,
        filters: filters
      }
    },
    /**
     * 重置（清空）所有分类的 SKU 缓存与筛选条件（计费方式切换时调用）
     */
    resetSkuMap () {
      this.selectedSpec = null
      this.form.instanceSpec = null
      this.form.duration = ''
      this.durationOptions = []
      this.skuMap = {}
      this.filterMap = {}
      if (this.categoryList && this.categoryList.length > 0) {
        this.categoryList.forEach(cat => {
          this.$set(this.skuMap, cat.id, this.createEmptySkuBucket(cat.id))
        })
      }
    },
    /**
     * 按分类加载 SKU 列表（懒加载核心）
     */
    async fetchSkusByCategory (categoryId) {
      if (!categoryId) return
      if (!this.selectedRegionId) {
        console.log('未选择地域，不获取SKU')
        return
      }
      const bucket = this.skuMap[categoryId] || this.createEmptySkuBucket(categoryId)
      if (!this.skuMap[categoryId]) {
        this.$set(this.skuMap, categoryId, bucket)
      }
      bucket.loading = true
      bucket.loaded = false
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productSkuService/listGpuPurchaseSku',
          method: 'post',
          data: {
            billingTypeParam: this.form.billingType,
            regionId: this.selectedRegionId,
            categoryId: categoryId
          }
        })
        if (res.errcode === 0) {
          const data = Array.isArray(res.data) ? res.data : []
          const { priceField, priceUnit } = this.getPriceField()
          bucket.list = data.map(item => this.mapSkuToRow(item, priceField, priceUnit))
          bucket.loaded = true
          // 加载完成后，如果该 Tab 是当前激活 Tab 且还没选中规格，则默认选第一项
          if (this.productType === categoryId && !this.selectedSpec && bucket.list.length > 0) {
            setTimeout(() => {
              this.handleSpecChange(bucket.list[0])
            }, 0)
          }
        } else if (res.errcode === 1001) {
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          bucket.list = []
          this.$Message && this.$Message.error(res.errmsg || '获取产品SKU失败')
        }
      } catch (e) {
        console.error('获取产品SKU失败:', e)
        bucket.list = []
        this.$Message && this.$Message.error('网络异常，获取产品SKU失败')
      } finally {
        bucket.loading = false
      }
    },
    /**
     * 通用：根据分类 id 返回过滤后的 SKU 列表（供模板 :data 使用）
     * 筛选条件从 filterMap 读取（模板 v-model 直接双向绑定 filterMap）
     */
    getFilteredList (categoryId) {
      if (!categoryId) return []
      const bucket = this.skuMap[categoryId]
      if (!bucket) return []
      let specs = bucket.list || []
      const f = this.filterMap[categoryId] || bucket.filters || {}
      if (f.modelName) {
        const keyword = f.modelName.toLowerCase()
        specs = specs.filter(s => (s.modelName || '').toLowerCase().includes(keyword))
      }
      if (f.vcpu && f.vcpu !== 'all') {
        const v = parseInt(f.vcpu)
        specs = specs.filter(s => s.cpuCount === v)
      }
      if (f.memory && f.memory !== 'all') {
        specs = specs.filter(s => s.memoryConfig === f.memory)
      }
      if (f.gpu && f.gpu !== 'all') {
        const v = parseInt(f.gpu)
        specs = specs.filter(s => s.gpuCount === v)
      }
      if (f.cpuName && f.cpuName !== 'all') {
        specs = specs.filter(s => s.cpuName === f.cpuName)
      }
      if (f.gpuName && f.gpuName !== 'all') {
        specs = specs.filter(s => s.gpuName === f.gpuName)
      }
      return specs
    },
    getLoading (categoryId) {
      return !!(this.skuMap[categoryId] && this.skuMap[categoryId].loading)
    },
    getVcpuOptions (categoryId) {
      const list = (this.skuMap[categoryId] && this.skuMap[categoryId].list) || []
      return Array.from(new Set(list.map(s => s.cpuCount).filter(n => n))).sort((a, b) => a - b)
    },
    getMemoryOptions (categoryId) {
      const list = (this.skuMap[categoryId] && this.skuMap[categoryId].list) || []
      return Array.from(new Set(list.map(s => s.memoryConfig).filter(n => n))).sort((a, b) => a - b)
    },
    getGpuOptions (categoryId) {
      const list = (this.skuMap[categoryId] && this.skuMap[categoryId].list) || []
      return Array.from(new Set(list.map(s => s.gpuCount).filter(n => n))).sort((a, b) => a - b)
    },
    getCpuNameOptions (categoryId) {
      const list = (this.skuMap[categoryId] && this.skuMap[categoryId].list) || []
      return Array.from(new Set(list.map(s => s.cpuName).filter(n => n))).sort()
    },
    getGpuNameOptions (categoryId) {
      const list = (this.skuMap[categoryId] && this.skuMap[categoryId].list) || []
      return Array.from(new Set(list.map(s => s.gpuName).filter(n => n))).sort()
    },
    /**
     * 将接口返回的 SKU 原始数据转换为列表展示行对象（GPU/CPU/裸金属 三类型当前共用同一组字段）
     */
    mapSkuToRow (item, priceField, priceUnit) {
      const cpuCount = item.cpuCoreCount || this.parseCpuCountFromModelName(item.modelName) || 4
      const gpuCount = item.gpuCount | 0
      const priceValue = item[priceField] || 0
      return {
        _checked: false,
        _id: item.id,
        // family: 'GPU 计算型',
        poolType: this.poolTypeDict[item.poolType] || '',
        poolType1: item.poolType,
        gpuName: item.gpuName,
        cpuName: item.cpuName,
        cpuCount: cpuCount,
        cpu: `${cpuCount}核`,
        memoryConfig: item.memoryConfig || '',
        gpuCount: gpuCount,
        gpuModel: item.gpuModel || '',
        price: `¥${priceValue.toFixed(2)}${priceUnit}`,
        priceValue: priceValue,
        priceUnit: priceUnit,
        // 数据库字段映射
        id: item.id,
        modelName: item.modelName,
        billingType: item.billingType || 'prepaid',
        cpuConfig: item.cpuConfig || '',
        gpuBrand: item.gpuBrand || '',
        gpuArchitecture: item.gpuArchitecture || '',
        singlePrecision: item.singlePrecision || '',
        halfPrecision: item.halfPrecision || '',
        // 购买时长选项
        pricingStrategyDetails: item.pricingStrategyDetails || [],
        originalData: item
      }
    },
    /**
     * 获取当前计费方式对应的价格字段和单位
     */
    getPriceField () {
      const billingType = this.form.billingType
      if (billingType === 'monthly') {
        return { priceField: 'priceMonthly', priceUnit: '/月' }
      } else if (billingType === 'hourly') {
        return { priceField: 'priceHourly', priceUnit: '/小时' }
      }
      return { priceField: 'price', priceUnit: '/月' }
    },
    /**
     * CPU 类型产品数据拉取（已废弃：CPU Tab 由 fetchTopCategories + 懒加载 fetchSkusByCategory 统一处理）
     * @deprecated
     */
    async fetchCpuConfigs () {
      if (!this.selectedRegionId || !this.productType) return
      this.fetchSkusByCategory(this.productType)
    },
    /**
     * 裸金属 类型产品数据拉取（已废弃：裸金属 Tab 由 fetchTopCategories + 懒加载 fetchSkusByCategory 统一处理）
     * @deprecated
     */
    async fetchBareConfigs () {
      if (!this.selectedRegionId || !this.productType) return
      this.fetchSkusByCategory(this.productType)
    },
    async fetchDataDiskList () {
      // 如果没有选择区域，不获取数据盘列表
      if (!this.selectedRegionId) {
        this.dataDiskList = []
        this.selectedDataDisks = []
        return
      }
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/valueAddedProductService/listDataDiskByRegion',
          method: 'post',
          data: {
            regionId: this.selectedRegionId
          }
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          this.dataDiskList = Array.isArray(resp.data.data) ? resp.data.data : []
          // 清空之前选中的数据盘（地域变化后重新选择）
          this.selectedDataDisks = []
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.dataDiskList = []
          this.selectedDataDisks = []
          console.error('获取数据盘列表失败:', resp.data.errmsg)
        }
      } catch (e) {
        console.error('获取数据盘列表失败:', e)
        this.dataDiskList = []
        this.selectedDataDisks = []
        this.$Message && this.$Message.error('获取数据盘列表失败')
      }
    },
    /**
     * 获取专有网络列表
     */
    async fetchVnetList () {
      // 如果没有选择区域，不获取网络列表
      if (!this.selectedRegionId) {
        this.vnetList = []
        this.form.vnetId = ''
        this.form.subnetId = ''
        this.subnetList = []
        return
      }
      this.vnetLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/vnetService/listVNet',
          method: 'post',
          data: {
            regionId: this.selectedRegionId
          }
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          this.vnetList = Array.isArray(resp.data.data) ? resp.data.data : []
          // 清空之前选中的网络和交换机（地域变化后重新选择）
          this.form.vnetId = ''
          this.form.subnetId = ''
          this.subnetList = []
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.vnetList = []
          this.form.vnetId = ''
          this.form.subnetId = ''
          this.subnetList = []
          console.error('获取专有网络列表失败:', resp.data.errmsg)
        }
      } catch (e) {
        console.error('获取专有网络列表失败:', e)
        this.vnetList = []
        this.form.vnetId = ''
        this.form.subnetId = ''
        this.subnetList = []
        this.$Message && this.$Message.error('获取专有网络列表失败')
      } finally {
        this.vnetLoading = false
      }
    },
    /**
     * 获取交换机列表
     */
    async fetchSubnetList () {
      // 如果没有选择专有网络，不获取交换机列表
      if (!this.form.vnetId) {
        console.log('未选择专有网络，不获取交换机列表')
        this.subnetList = []
        this.form.subnetId = ''
        return
      }
      this.subnetLoading = true
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/vnetSubnetService/listSubnet',
          method: 'post',
          data: {
            vnetId: this.form.vnetId
          }
        })
        const resp = { data: res }
        if (resp.data.errcode === 0) {
          this.subnetList = Array.isArray(resp.data.data) ? resp.data.data : []
          // 清空之前选中的交换机（网络变化后重新选择）
          this.form.subnetId = ''
          console.log('获取交换机列表成功:', this.subnetList)
        } else if (resp.data.errcode === 1001) {
          // 跳转到登录页
          sessionStorage.clear()
          this.$router.push('/login')
        } else {
          this.subnetList = []
          this.form.subnetId = ''
          console.error('获取交换机列表失败:', resp.data.errmsg)
        }
      } catch (e) {
        console.error('获取交换机列表失败:', e)
        this.subnetList = []
        this.form.subnetId = ''
        this.$Message && this.$Message.error('获取交换机列表失败')
      } finally {
        this.subnetLoading = false
      }
    },
    /**
     * 专有网络选择变化
     */
    handleVnetChange (vnetId) {
      this.form.subnetId = ''
      this.subnetList = []
      if (vnetId) {
        // 根据vnetId查找对应的vnet对象以获取vnetCode
        const selectedVnet = this.vnetList.find(v => v.id === vnetId)
        if (selectedVnet) {
          this.form.vnetCode = selectedVnet.vnetCode
        }
        this.fetchSubnetList()
      } else {
        this.form.vnetCode = ''
      }
    },
    /**
     * 根据ID获取数据盘详情
     */
    getDiskById (diskId) {
      return this.dataDiskList.find(disk => disk.id === diskId) || {}
    },
    /**
     * 添加数据盘行
     */
    addDataDiskRow () {
      if (this.dataDiskList.length === 0) return
      // 默认选择第一个数据盘
      this.selectedDataDisks.push({
        id: this.dataDiskList[0].id
      })
    },
    /**
     * 移除数据盘行
     */
    removeDataDiskRow (index) {
      this.selectedDataDisks.splice(index, 1)
    },
    parseCpuCountFromModelName (modelName) {
      if (!modelName) return null
      const match = modelName.match(/(\d+)C\d+G/i)
      return match ? parseInt(match[1]) : null
    },
    // parseMemoryGB(memoryConfig) {
    //   if (!memoryConfig) return null
    //   const match = memoryConfig.match(/(\d+)\s*GB/i)
    //   return match ? parseInt(match[1]) : null
    // },
    parseGpuCount (modelName) {
      if (!modelName) return 1
      const match = modelName.match(/x(\d+)/i)
      return match ? parseInt(match[1]) : 1
    },
    parseProcessor (cpuConfig) {
      if (!cpuConfig) return 'intel'
      const lower = cpuConfig.toLowerCase()
      if (lower.includes('xeon') || lower.includes('intel')) return 'intel'
      if (lower.includes('epyc') || lower.includes('amd')) return 'amd'
      return 'intel'
    },
    /**
     * 空实现占位：旧 GPU Tab 的 updateFilterOptions 已废弃，筛选下拉改为按分类动态计算（getVcpuOptions 等）
     */
    updateFilterOptions () {
      // 保留以避免破坏历史调用方
    },
    getDurationOptions () {
      if (this.selectedSpec && this.selectedSpec.pricingStrategyDetails && this.selectedSpec.pricingStrategyDetails.length > 0) {
        const options = this.selectedSpec.pricingStrategyDetails
          .map(item => {
            // 将折扣率转换为"X折"显示（如0.8 -> 8折），10折不显示
            const discountRate = parseFloat(item.strategyValue)
            const discountText = !isNaN(discountRate) && discountRate > 0 && discountRate < 1 ? `${discountRate * 10}折` : ''
            return {
              id: item.id,
              label: item.strategyName,
              value: item.strategyName,
              discount: item.strategyValue,
              coutType: item.coutType,
              num: item.num,
              discountText: discountText,
              sortOrder: item.sortOrder || 0
            }
          })
          .sort((a, b) => b.sortOrder - a.sortOrder)
        return options
      }
      return []
    },
    handleSpecChange (row) {
      // 更新选中的规格
      this.selectedSpec = row
      // console.log('_____选中的规格:____', row)

      this.form.duration = ''
      // 从选中SKU的pricingStrategyDetails中获取购买时长选项
      this.durationOptions = this.getDurationOptions()

      // 更新表单配置
      this.form.instanceSpec = row
      if (row) {
        // if (row.billingType) {
        //   this.form.billingType = row.billingType
        // }
        if (row.cpuConfig) {
          this.form.cpuConfig = row.cpuConfig
        }
        if (row.memoryConfig) {
          this.form.memoryConfig = row.memoryConfig
        }
        if (row.gpuModel) {
          this.form.gpuModel = row.gpuModel
        }
        if (row.gpuBrand) {
          this.form.gpuBrand = row.gpuBrand
        }
        if (row.gpuArchitecture) {
          this.form.gpuArchitecture = row.gpuArchitecture
        }
        if (row.singlePrecision) {
          this.form.singlePrecision = row.singlePrecision
        }
        if (row.halfPrecision) {
          this.form.halfPrecision = row.halfPrecision
        }
      }
    },
    clearFormSpecFields () {
      // 清空规格相关的表单字段
      this.form.cpuConfig = ''
      this.form.memoryConfig = ''
      this.form.gpuModel = ''
      this.form.gpuBrand = ''
      this.form.gpuArchitecture = ''
      this.form.singlePrecision = ''
      this.form.halfPrecision = ''
    },
    async instanceInit () {
      if (!this.selectedSpec) {
        this.$Message.warning('请先选择实例规格')
        return null
      }

      // 从规格中提取CPU和内存信息
      const cpuCount = this.selectedSpec.cpuCount || 8
      const memoryConfig = this.selectedSpec.memoryConfig
      const quantity = this.form.quantity || 1

      // 获取选中镜像的image_path
      const imagePath = this.selectedImage ? this.selectedImage.imagePath : ''

      // 镜像免安装相关参数（从 selectedImage 透传给后端）
      const isInstallFree = this.selectedImage ? (this.selectedImage.isInstallFree || '0') : '0'
      const mirrorNode = this.selectedImage ? (this.selectedImage.mirrorNode || '') : ''
      const mirrorVmid = this.selectedImage && this.selectedImage.mirrorVmid != null
        ? this.selectedImage.mirrorVmid
        : null

      // 构建数据盘数组（有效的选中数据盘）
      const disk = this.selectedDataDisks
        .filter(item => item.id)
        .map(item => {
          const diskInfo = this.getDiskById(item.id)
          return {
            id: item.id,
            capacityGb: diskInfo.capacityGb || 0,
            diskType: diskInfo.diskType || ''
          }
        })
      let param = {
        "node": "guanzl",
        "name": "vm",
        memory: memoryConfig,
        cores: cpuCount,
        disk: disk,
        iso: imagePath,
        quantity: quantity,
        vnetId: this.form.vnetId,
        subnetId: this.form.subnetId,
        vnetCode: this.form.vnetCode,
        subnetCidr: (this.subnetList.find(s => s.id === this.form.subnetId) || {}).cidr || '',
      }
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/instanceService/createInstance',
          method: 'post',
          data: param
        })
        const resp = res
        if (resp.data && resp.data.vmidList && resp.data.vmidList.length > 0) {
          console.log('创建实例返回:', resp.data)
          this.$Message.success(`创建实例成功，共创建 ${resp.data.quantity} 个实例`)
          return { vmidList: resp.data.vmidList, ipList: resp.data.ipList || [] } // 返回 vmid 和 ip 列表
        } else {
          console.error('创建实例失败:', resp.data)
          this.$Message.error(resp.data.errmsg || '创建实例失败')
          return null
        }
      } catch (err) {
        console.error('创建实例失败:', err)
        this.$Message.error('创建实例失败: ' + (err.errmsg || err.message || '未知错误'))
        return null
      }
    },
    async handlePay () {
      if (!this.form.instanceSpec) {
        this.$Message.warning('请选择实例规格')
        return
      }

      // 只有包年包月需要选择购买时长
      if (this.form.billingType !== 'hourly' && !this.form.duration) {
        this.$Message.warning('请选择购买时长')
        return
      }

      // 校验登录账号（VM 必填：用户名/密码/确认密码；裸金属 productType=cd6f94a7... 不校验登录账号）
      if (this.productType !== 'cd6f94a7-64c1-43a2-b2a1-49d60d6ef51e') {
        const loginError = this.validateLoginInfo()
        if (loginError) {
          this.$Message.warning(loginError)
          return
        }
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
        // 验证是否设置了支付密码（使用余额或按量计费时需要）
        if ((this.form.useBalance && this.form.balanceAmount > 0) || this.form.billingType === 'hourly') {
          if (!authRes.data || !authRes.data.payPassword) {
            this.submitLoading = false;
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

      // 校验余额是否足够（只有当用户输入的使用余额金额超过账户余额时才提示）
      // this.availableBalance = this.balance - this.frozenBalance
      if (this.form.useBalance && this.form.balanceAmount > 0 && this.availableBalance <= 0) {
        this.$Modal.confirm({
          title: '余额不足',
          content: `当前账户可用余额 ¥${this.availableBalance.toFixed(2)}，无法使用余额支付，请先充值后再试。`,
          okText: '去充值',
          cancelText: '取消',
          onOk: () => {
            this.goToRecharge()
          }
        })
        return
      }

      if (this.form.useBalance && this.form.balanceAmount > 0 && this.availableBalance < this.form.balanceAmount) {
        this.$Modal.confirm({
          title: '余额不足',
          content: `当前账户可用余额 ¥${this.availableBalance.toFixed(2)}，您输入的使用金额 ¥${this.form.balanceAmount.toFixed(2)} 超出余额，请重新输入。`,
          okText: '确定',
          cancelText: '取消'
        })
        return
      }

      // 如果使用余额大于0或按量付费，需要先输入支付密码
      if (this.form.useBalance && this.form.balanceAmount > 0) {
        this.showPayPasswordModal()
        return
      }
      // 按量付费也需要校验密码
      if (this.form.billingType === 'hourly') {
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
            return
          }
          // 验证通过，执行提交订单逻辑
          this.submitOrder(this.tempPayPassword)
          this.tempPayPassword = ''
        },
        onCancel: () => {
          this.tempPayPassword = ''
        }
      })
    },

    // 提交订单（payPassword为支付密码，如果不需要验证则为空）
    async submitOrder (payPassword) {
      // 先查询用户认证状态
      try {
        const authRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
          method: 'post',
          data: {}
        });

        if (!authRes.data || authRes.data.authStatus !== 'PASSED') {
          this.submitLoading = false;
          this.$Message.error('需要认证后才能进行购买', 5);
          this.$router.push('/shenbeigpuai/control/auth-apply');
          return;
        }
        // 验证是否设置了支付密码（使用余额或按量计费时需要）
        if ((this.form.useBalance && this.form.balanceAmount > 0) || this.form.billingType === 'hourly') {
          if (!authRes.data || !authRes.data.payPassword) {
            this.submitLoading = false;
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

      // 开始提交，设置loading状态
      this.submitLoading = true
      // 1. 先调用接口检查是否有可用物理机（传入购买数量）
      this.selectedPhysicalId = ''
      const quantity = this.form.quantity || 1
      try {
        const physicalRes = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/resourceAllocationService/findAvailablePhysicalMachine',
          method: 'post',
          data: {
            skuId: this.selectedSpec.id || '',
            quantity: quantity
          }
        })
        if (physicalRes.errcode === 0 && physicalRes.data) {
          this.selectedPhysicalId = physicalRes.data.physicalId || ''
          if (!this.selectedPhysicalId) {
            this.submitLoading = false
            this.$Message.error(physicalRes.data.message || '暂无可用物理机，资源不足')
            return
          }
          // 检查返回的可创建数量是否满足需求
          const availableQuantity = physicalRes.data.availableQuantity || 1
          if (availableQuantity < quantity) {
            this.submitLoading = false
            this.$Message.error(`资源不足，当前物理机只能创建 ${availableQuantity} 个实例，您需要创建 ${quantity} 个`)
            return
          }
        } else {
          this.submitLoading = false
          this.$Message.error(physicalRes.message || '查询可用物理机失败')
          return
        }
      } catch (physicalError) {
        this.submitLoading = false
        this.$Message.error('查询可用物理机失败：' + (physicalError.message || '未知错误'))
        return
      }

      // 生成UUID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }
      // 镜像免安装相关参数（从 selectedImage 透传给后端）
      const isInstallFree = this.selectedImage ? (this.selectedImage.isInstallFree || '0') : '0'
      const mirrorNode = this.selectedImage ? (this.selectedImage.node || '') : ''
      const mirrorVmid = this.selectedImage && this.selectedImage.vmid != null
        ? this.selectedImage.vmid
        : null
      const mirrorId = this.selectedImage ? (this.selectedImage.id || '') : ''
      const durationItem = this.durationOptions.find(item => item.label === this.form.duration)
      // 构造数据盘ID列表
      const dataDiskIds = this.selectedDataDisks
        .filter(item => item.id)
        .map(item => item.id)
      let orderResult = null
      // 获取选中镜像的image_path
      const imagePath = this.selectedImage ? this.selectedImage.imagePath : ''
      const cpuCount = this.selectedSpec.cpuCount || 8
      const gpuCount = this.selectedSpec.gpuCount || 1
      const memoryConfig = this.selectedSpec.memoryConfig
      // 构建数据盘数组（有效的选中数据盘）
      const disk = this.selectedDataDisks
        .filter(item => item.id)
        .map(item => {
          const diskInfo = this.getDiskById(item.id)
          return {
            id: item.id,
            capacityGb: diskInfo.capacityGb || 0,
            diskType: diskInfo.diskType || ''
          }
        })
      // 2. 调用订单创建接口
      try {
        // 构建订单参数，按量付费时不传递购买时长相关参数
        const orderData = {
          id: generateUUID(),
          balanceAmount: this.form.billingType === 'hourly' ? null : this.form.balanceAmount,
          orderType: 'instance_purchase',
          totalAmount: parseFloat(this.finalTotalAmount),
          orderSource: 'console',
          channel: 'console',
          productConfigId: this.form.instanceSpec.id || '',
          skuId: this.selectedSpec.id || '',
          quantity: this.form.quantity || 1,
          billingType: this.form.billingType === 'monthly' ? 'monthly' : 'hourly',
          regionId: this.selectedRegionId || '', // 地域ID，根据实际选择的地域动态设置
          physicalId: this.selectedPhysicalId, // 可用物理机ID
          dataDiskIds: dataDiskIds, // 数据盘ID列表
          remark: `${this.form.instanceSpec.modelName || '-'} (${this.form.instanceSpec.cpu} ${this.form.instanceSpec.memoryConfig} ${this.form.instanceSpec.gpuCount})`,
          vnetId: this.form.vnetId,
          subnetId: this.form.subnetId,
          subnetCidr: (this.subnetList.find(s => s.id === this.form.subnetId) || {}).cidr || '',
          iso: imagePath,
          memory: memoryConfig,
          cores: cpuCount,
          gpuCount: gpuCount,
          disk: disk,
          vnetCode: this.form.vnetCode,
          // GPU / PCIe 直通：临时写死单卡 Tesla T4，后续按规格动态设置
          hostpcis: [
            // '0000:b1:00.0,pcie=1'
            // '0000:b1:00.0'
            '0000:db:00.0'
          ],
          // vga: 'none',
          // 镜像免安装相关参数（透传给后端，让调度器知道走 createVMPortable 分支）
          isInstallFree: isInstallFree,
          mirrorNode: mirrorNode,
          mirrorVmid: mirrorVmid,
          mirrorId,
          // 实例登录用户名/密码（可选；后端会写入 PVE cloud-init）
          loginUsername: this.form.loginUsername || '',
          loginPassword: this.form.loginPassword || ''
        }
        // 如果有支付密码，添加到订单数据中
        if (payPassword) {
          orderData.payPassword = this.$aesEncrypt(payPassword)
        }

        // 只有包年包月才传递购买时长相关参数
        if (this.form.billingType === 'monthly' && durationItem) {
          orderData.pricingStrategyDetailId = durationItem.id || ''
          orderData.period = durationItem.num
          orderData.coutType = durationItem.coutType || 'month'
        }
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/orderService/addOrder',
          method: 'post',
          data: orderData
        })

        const resp = { data: res }
        if (resp.data.errcode === 0) {
          // 保存订单结果，用于后续确认支付
          orderResult = resp.data.data

          // 按量付费订单直接成功，无需支付流程
          if (this.form.billingType === 'hourly') {
            // this.$Message.success('订单创建成功！实例创建中，请稍后查看')
            this.submitLoading = false
            // 根据字典开关决定弹框还是直接跳转
            if (this.postOrderModalEnabled) {
              // 传 orderId 给弹框用于轮询实例创建状态
              this.showPostOrderSuccessModal(orderResult && orderResult.orderId)
            } else {
              this.goToInstanceList()
            }
            return
          }
          // 更新用户账户余额（如果使用了余额支付）
          if (orderResult.balance !== undefined && orderResult.balance !== null) {
            this.balance = parseFloat(orderResult.balance) || 0
            // 支付成功后，扣减对应的冻结金额，计算新的可用余额
            if (this.form.useBalance && this.form.balanceAmount > 0) {
              this.frozenBalance += this.form.balanceAmount
            }
          }
          // 混合支付下单时，冻结余额增加（本次使用的余额金额）
          // if (this.form.useBalance && this.form.balanceAmount > 0 && this.useWechatPay) {
          //   this.frozenBalance = (this.frozenBalance || 0) + this.form.balanceAmount
          // }
          // 处理价格提示信息
          if (orderResult.priceWarningMessage) {
            this.$Message.warning(orderResult.priceWarningMessage)
          }
          // 如果后端计算的金额与前端不一致，使用后端计算的金额
          const finalAmount = orderResult.calculatedAmount || this.totalAmount

          // 订单创建成功后，设置支付确认弹框数据并显示
          this.orderResult = orderResult
          this.finalAmount = finalAmount
          this.remainingAmount = Math.max(0, finalAmount - (this.form.useBalance ? this.form.balanceAmount : 0))
          this.useWechatPay = this.remainingAmount > 0 && this.form.billingType !== 'hourly'
          this.isPaySuccess = false
          this.testOrderQrCodeUrl = ''

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
            // 余额足够，订单创建成功（后端会在addOrder末尾自动处理实例创建）
            // this.$Message.success('订单创建成功！实例创建中，请稍后查看')
            this.payModalVisible = false
            this.submitLoading = false
            // 根据字典开关决定弹框还是直接跳转
            if (this.postOrderModalEnabled) {
              this.showPostOrderSuccessModal(orderResult && orderResult.orderId)
            } else {
              this.goToInstanceList()
            }
          } else {
            // 余额不足，显示支付确认弹框
            this.payModalVisible = true
            this.submitLoading = false
            // 弹框打开后再渲染二维码：canvas 在弹框内，弹框未打开前 $refs.qrCanvas 取不到
            this.$nextTick(() => { this.renderPayQrCode() })
          }
        } else {
          this.$Message.error(resp.data.errmsg || '订单创建失败')
          this.submitLoading = false
        }
      } catch (e) {
        console.error('订单创建异常:', e)
        this.$Message.error('订单创建失败，请稍后重试')
        this.submitLoading = false
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
    handleQuantityBlur () {
      // 失去焦点时，如果数量为空或无效，默认设为1
      if (!this.form.quantity || this.form.quantity < 1) {
        this.form.quantity = 1
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
              if (this.form.useBalance && this.form.balanceAmount > 0) {
                this.frozenBalance = Math.max(0, (this.frozenBalance || 0) - this.form.balanceAmount)
              }
              this.$Message.success('扫码支付成功！实例创建中，请稍后查看')
              // 根据字典开关决定弹框还是直接跳转
              if (this.postOrderModalEnabled) {
                this.showPostOrderSuccessModal(this.testOrderId)
              } else {
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
        const resp = { data: res }
        if (res.errcode === 0) {
          this.$Message.success('支付密码设置成功')
          this.showSetPayPwdModal = false
          this.$refs.setPayPwdFormRef.resetFields()
          this.submitLoading = false
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
      this.submitLoading = false
    },
    // 处理支付确认弹框取消
    handlePayModalCancel () {
      this.payModalVisible = false
      this.stopPaymentPolling()
      this.submitLoading = false
      // duration: 3 — 显示 3 秒后自动消失；与下方跳转前的 3 秒倒计时对齐，避免提示被页面重载中断
      this.$Message.warning({
        content: '请前往我的订单页面继续完成支付',
        duration: 3
      })
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    },
    // 处理支付确认（新流程中已由后端自动处理，前端只需弹出提示并跳转）
    handlePayConfirm () {
      // 停止轮询
      this.stopPaymentPolling()
      this.payModalLoading = true
      this.$Message.success('订单确认成功！实例创建中，请稍后查看')
      // 关闭支付确认弹框
      this.payModalVisible = false
      this.payModalLoading = false
      // 根据字典开关决定是否弹新的提示页面（默认关闭，避免接口异常时误弹）
      if (this.postOrderModalEnabled) {
        this.showPostOrderSuccessModal()
      } else {
        this.goToInstanceList()
      }
    },
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
        console.error('获取下单后弹框开关失败:', e)
        this.postOrderModalEnabled = false
      }
    },
    // 准备弹框内的动画 HTML（使用 iframe srcdoc 内联，避免直接请求 .html 被下载）
    // 反制 Chrome 自动填充：给敏感 input 的原生 DOM 节点设置 readonly + focus 时移除，
    // 配合模板上的 autocomplete="off" / data-form-type / name 来阻断 Chrome 的自动填充启发式。
    applyPortalRedirectParams () {
      try {
        const storedRegionId = localStorage.getItem('portal_redirect_regionId') || ''
        const storedSkuId = localStorage.getItem('portal_redirect_skuId') || ''
        const storedCategoryId = localStorage.getItem('portal_redirect_categoryId') || ''
        // 已被路由 query 命中则不重复处理
        if (this.queryParams.regionId || this.queryParams.skuId) {
          return
        }
        if (!storedRegionId && !storedSkuId) {
          return
        }
        this.queryParams.regionId = storedRegionId
        this.queryParams.skuId = storedSkuId
        this.queryParams.categoryId = storedCategoryId
        this.hasQueryParams = true
        // 不再强制切按量计费；计费方式由 setDefaultRegion 按目标 SKU 实际支持的决定
        // 用完即清，避免污染下次直接打开购买页的场景
        localStorage.removeItem('portal_redirect_regionId')
        localStorage.removeItem('portal_redirect_skuId')
        localStorage.removeItem('portal_redirect_categoryId')
      } catch (e) {
        // localStorage 不可用时静默失败
      }
    },

    applyNoAutofillHooks () {
      try {
        // 1) 搜索产品名 input
        // 通过 attribute selector 精确定位 input（外层 iview Input 组件渲染后会生成原生 input）
        // 搜索框的 v-model 锚点：name="no-autofill-search"
        // 该字段不是登录字段，浏览器仍可能记录历史搜索词。
        // 同样注入 readonly + autocomplete="new-password" 以屏蔽 Chrome 历史提示。
        document.querySelectorAll('input[name="no-autofill-search"]').forEach((el) => {
          if (!el.hasAttribute('data-noautofill-initialized')) {
            el.setAttribute('readonly', 'readonly')
            el.setAttribute('autocomplete', 'new-password')
            el.setAttribute('data-form-type', 'other')
            el.addEventListener('focus', function onFocus () {
              if (el.hasAttribute('readonly')) {
                el.removeAttribute('readonly')
                el.removeAttribute('data-form-type')
              }
              el.removeEventListener('focus', onFocus)
            })
            el.setAttribute('data-noautofill-initialized', '1')
          }
        })
        // 2) 实例登录密码 input
        document.querySelectorAll('input[name="login-password-no-autofill"]').forEach((el) => {
          if (!el.hasAttribute('data-noautofill-initialized')) {
            el.setAttribute('readonly', 'readonly')
            el.setAttribute('autocomplete', 'new-password')
            el.setAttribute('data-form-type', 'other')
            el.addEventListener('focus', function onFocus () {
              if (el.hasAttribute('readonly')) {
                el.removeAttribute('readonly')
                el.removeAttribute('data-form-type')
              }
              el.removeEventListener('focus', onFocus)
            })
            el.setAttribute('data-noautofill-initialized', '1')
          }
        })
      } catch (e) {
        console.warn('[instance-buy] applyNoAutofillHooks 失败:', e && e.message)
      }
    },
    // 准备弹框内的动画 HTML（使用 iframe srcdoc 内联，避免 .html 资源被当作下载处理）
    async preparePostOrderIframe () {
      try {
        // 与当前页面同源，使用 fetch 读取
        const res = await fetch('./file/shenbeigpuai/html/buyAnimation.html', { credentials: 'same-origin' })
        if (res.ok) {
          const html = await res.text()
          this.postOrderIframeSrcdoc = html
        } else {
          console.error('读取 buyAnimation.html 失败:', res.status)
        }
      } catch (e) {
        console.error('读取 buyAnimation.html 异常:', e)
      }
    },
    // 默认用户名：尝试从 sessionStorage.vuex.user.severUserInfo.data 中读取当前登录用户名（fallback 为 'root'）。
    // 注意：如果用户已经在表单里手动改过用户名（loginUsername !== 'root'），就不再覆盖，避免抢用户的输入。
    applyDefaultLoginUsername () {
      try {
        if (this.form.loginUsername && this.form.loginUsername !== 'root') {
          return
        }
        const raw = sessionStorage.getItem('vuex')
        if (!raw) return
        const vuex = JSON.parse(raw)
        const data = vuex && vuex.user && vuex.user.severUserInfo && vuex.user.severUserInfo.data
        if (!data) return
        const candidate = data.loginName || data.name || data.userName || data.username || data.account
        if (candidate && typeof candidate === 'string' && candidate.trim()) {
          this.form.loginUsername = candidate.trim()
        }
      } catch (e) {
        // 解析失败不影响默认 'root'
        console.warn('[instance-buy] applyDefaultLoginUsername 失败:', e && e.message)
      }
    },
    // 显示订单成功提示弹框：不可关闭，instance_init==1 后才显示跳转按钮
    showPostOrderSuccessModal (orderId) {
      // 每次重新打开弹框时，先把 srcdoc 置空、关闭 v-if，
      // 下一帧再设回 postOrderModalVisible=true，让 iframe 节点被销毁并重建，
      // 这样嵌入的 CSS 动画 / JS 动画每次都从 0 开始播放（否则 srcdoc 不变时 Vue 不会重建 iframe，动画会播完）。
      this.postOrderModalVisible = false
      // 重置轮询状态
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
        // 启动轮询：每 2 秒查一次订单的 instance_init，等于 '1' 才显示跳转按钮
        if (this.pollingOrderId) {
          this.startPollingInstanceInit()
        }
      })
    },
    // 启动轮询：每 2 秒查询一次订单的 instance_init
    startPollingInstanceInit () {
      // 先清掉旧的
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
          console.error('[instance-buy] 轮询 instance_init 异常:', e)
        }
        // 兜底：超过最大次数后强制显示按钮，避免接口异常时按钮永远不出来
        if (count >= this.pollingMaxCount) {
          console.warn('[instance-buy] 轮询 instance_init 超过最大次数，强制显示跳转按钮')
          this.instanceCreated = true
          this.stopPollingInstanceInit()
          return
        }
        // 继续下一轮
        this.pollingTimer = setTimeout(tick, 2000)
      }
      // 立即查一次，然后每 2 秒一次
      this.pollingTimer = setTimeout(tick, 0)
    },
    // 停止轮询
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
    // 跳转到实例列表页（弹框按钮回调）
    goToInstanceList () {
      this.clearPostOrderCountdown()
      this.stopPollingInstanceInit()
      this.postOrderModalVisible = false
      this.$router.push('/shenbeigpuai/control/instance-list')
    },
    goToRecharge () {
      this.$router.push('/shenbeigpuai/control/recharge-center')
    },
    async fetchBalance () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/userAccountService/getBalance',
          method: 'post',
          data: {}
        })
        const resp = { data: res }
        if (resp.data.errcode === 0 && resp.data.data) {
          // this.balance = parseFloat(resp.data.data.balance) || 0
          // 测试用
          this.balance = parseFloat(resp.data.data.balance)
          this.frozenBalance = parseFloat(resp.data.data.frozenBalance) || 0
        } else {
          this.balance = 0
          this.frozenBalance = 0
        }
        // 账户可用余额为 0 时，自动取消「使用账户余额抵扣」勾选，避免无效选项被默认选中
        // 仅对非按量计费（包月/年付）生效，按量计费本身也走余额逻辑但不影响该勾选框语义
        const availableBalance = (parseFloat(this.balance) || 0) - (parseFloat(this.frozenBalance) || 0)
        if (availableBalance <= 0 && this.form && this.form.billingType !== 'hourly') {
          this.form.useBalance = false
        }
      } catch (e) {
        console.error('获取账户余额失败:', e)
        this.balance = 0
      }
    },
    async fetchRegionList () {
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/regionService/listRegionTree',
          method: 'post',
          data: {}
        })
        const resp = { data: res }
        if (resp.data.errcode === 0 && resp.data.data) {
          // 转换为Cascader组件需要的格式：value使用regionName，label使用regionName
          this.regionList = this.convertToCascaderData(resp.data.data)
          // 默认选中第一个可选择区域（第一个节点的第一个叶子节点）
          this.setDefaultRegion()
        } else {
          this.regionList = []
        }
      } catch (e) {
        console.error('获取地域列表失败:', e)
        this.regionList = []
        this.$Message && this.$Message.error('获取地域列表失败')
      }
    },
    convertToCascaderData (tree) {
      if (!tree || !Array.isArray(tree) || tree.length === 0) {
        return []
      }
      // 遍历树形结构，将所有节点平铺到同一层级
      const result = []
      const flatten = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return
        for (const node of nodes) {
          result.push({
            value: node.regionName,
            label: node.regionName,
            id: node.id,
            ids: node.ids,
            regionCode: node.regionCode,
            regionLevel: node.regionLevel,
            parentId: node.parentId,
            resourcePools: node.resourcePools || []
          })
          // 递归处理子节点
          if (node.children && node.children.length > 0) {
            flatten(node.children)
          }
        }
      }
      flatten(tree)
      return result
    },
    findRegionByValue (tree, value) {
      if (!tree || !Array.isArray(tree) || tree.length === 0) {
        return null
      }
      for (const item of tree) {
        if (item.value === value) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const found = this.findRegionByValue(item.children, value)
          if (found) {
            return found
          }
        }
      }
      return null
    },
    handleRegionSelect (region) {
      // 平铺方式选择地域
      this.selectedRegionValue = [region.value]
      this.selectedRegionId = region.id
      // 区域选择变化后：清空所有分类的 SKU 缓存，重新拉取顶级分类并懒加载当前 Tab
      this.resetSkuMap()
      this.fetchTopCategories().then(() => {
        if (this.productType) {
          this.fetchSkusByCategory(this.productType)
        }
      })
      // 区域选择变化后重新获取数据盘列表
      this.fetchDataDiskList()
      // 区域选择变化后重新获取专有网络列表
      this.fetchVnetList()
      // 区域选择变化后清空预设镜像并重新获取（自主上传镜像在切到对应tab时再加载）
      this.publicImageList = []
      this.form.image = null
      this.fetchPublicImageList()
    },
    handleRegionChange (value, selectedData) {
      // 地域选择变化时的回调（级联选择使用，现已废弃）
      console.log('选中的地域:', value, selectedData)
    },
    async fetchPoolTypeDict () {
      // 获取poolType字典转换
      try {
        const res = await this.$hdAxios.request({
          url: '/api/as/sc/dict/getDictInfoList',
          method: 'post',
          data: { type: 'product_type' }
        })
        const resp = { data: res }
        if (resp.data.errcode === 0 && resp.data.data) {
          // 转换为字典映射对象 { code: name }
          const dict = {}
          resp.data.data.forEach(item => {
            dict[item.value] = item.label
          })
          this.poolTypeDict = dict
          // 已加载的分类 SKU 桶统一回填字典转换后的 poolType
          Object.values(this.skuMap || {}).forEach(bucket => {
            (bucket.list || []).forEach(item => {
              item.poolType = this.poolTypeDict[item.poolType1]
            })
          })
        }
      } catch (e) {
        console.error('获取poolType字典失败:', e)
      }
    },
    getBillingTypeName (type) {
      const map = {
        'monthly': '包月计费',
        'hourly': '按量计费'
      }
      return map[type] || type
    },
    setDefaultRegion () {
      if (!this.regionList || this.regionList.length === 0) {
        return
      }
      // 选中地域并刷新所有依赖资源的统一入口
      const applyRegion = (region) => {
        if (!region) return
        this.selectedRegionValue = [region.value]
        this.selectedRegionId = region.id
        console.log('选中地域:', region.label, 'ID:', this.selectedRegionId)
        // 跳入带 skuId 时：先按目标 SKU 实际支持的计费方式设置 billingType，再加载分类 SKU
        const prepareBilling = this.queryParams.skuId ? this.applyBillingTypeBySku() : Promise.resolve()
        prepareBilling.then(() => {
          // 清空所有分类 SKU 缓存 → 拉顶级分类 → 懒加载当前 Tab
          this.resetSkuMap()
          this.fetchTopCategories().then(() => {
            if (this.productType) {
              this.fetchSkusByCategory(this.productType)
            }
          })
          this.fetchDataDiskList()
          this.fetchVnetList()
          this.fetchPublicImageList()
          // 如果带路由参数 skuId，触发自动选中（fetchSkusByCategory 完成后内部匹配）
          if (this.queryParams.skuId) {
            this.doAutoSelectSku()
          }
        })
      }
      // 如果有路由参数传入的regionId，尝试匹配
      if (this.queryParams.regionId) {
        const findRegion = (list) => {
          for (const item of list) {
            if (item.id === this.queryParams.regionId) {
              return item
            }
            if (item.children && item.children.length > 0) {
              const found = findRegion(item.children)
              if (found) return found
            }
          }
          return null
        }
        const matchedRegion = findRegion(this.regionList)
        if (matchedRegion) {
          applyRegion(matchedRegion)
          return
        }
      }
      // 获取第一个地域节点（第一层）
      const firstRegion = this.regionList[0]
      applyRegion(firstRegion)
    },
    handleRegionChange (value, selectedData) {
      // 地域选择变化时的回调（级联选择使用，现已废弃）
      console.log('选中的地域:', value, selectedData)
    },
    /**
     * 跳入购买页时：查询目标 SKU 支持的计费方式，据此设置 form.billingType
     * 规则：有按时价→hourly；否则有包月价→monthly；都没有→保持默认 monthly
     * 解决「跳入后被强制切到 SKU 不支持的计费方式导致查不到」的问题（如仅有包月价的裸金属）
     */
    async applyBillingTypeBySku () {
      if (!this.queryParams.skuId) return
      try {
        const res = await this.$hdAxios.request({
          url: '/api/ac/shenbeigpuai/productSkuService/getSkuBillingCapability',
          method: 'post',
          data: { id: this.queryParams.skuId }
        })
        if (res.errcode === 0 && res.data) {
          const hourly = Number(res.data.priceHourly || 0)
          const monthly = Number(res.data.priceMonthly || 0)
          if (hourly > 0) {
            this.form.billingType = 'hourly'
          } else if (monthly > 0) {
            this.form.billingType = 'monthly'
          }
        }
      } catch (e) {
        // 查询失败时保持默认计费方式，不阻断后续加载
        console.error('查询SKU计费能力失败:', e)
      }
    },
    doAutoSelectSku () {
      if (!this.queryParams.skuId) {
        return
      }
      // 等待当前激活分类的 SKU 数据加载完成
      const trySelect = () => {
        const bucket = this.skuMap[this.productType]
        if (!bucket || !bucket.loaded) {
          setTimeout(trySelect, 100)
          return
        }
        // 从当前分类已加载的列表中查找
        const list = bucket.list || []
        const matchedSku = list.find(item =>
          item.id === this.queryParams.skuId ||
          item._id === this.queryParams.skuId ||
          (item.originalData && item.originalData.id === this.queryParams.skuId)
        )
        if (matchedSku) {
          this.handleSpecChange(matchedSku)
          console.log('通过路由参数自动选中规格:', matchedSku.modelName)
          this.hasQueryParams = false
        } else {
          // 兜底：目标分类下未找到该 SKU（地域无资源 / 当前计费类型价格缺失被 SQL 过滤），
          // 回退选当前分类第一项，避免规格区空白
          console.log('未找到匹配的SKU，回退默认选中当前分类第一项')
          if (!this.selectedSpec && list.length > 0) {
            this.handleSpecChange(list[0])
          }
          this.hasQueryParams = false
        }
      }
      trySelect()
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .ivu-table {
  color: #000000;
}

.instance-buy {
  padding: 16px 16px 100px 16px;
  background: #f5f7f9;

  &__header {
    margin-bottom: 20px;

    /deep/ .ivu-breadcrumb {
      font-size: 12px;
      color: #999;
    }
  }

  &__content {
    margin-top: 16px;
    display: flex;
    align-items: flex-start;
  }

  .config-section {
    margin-bottom: 16px;

    &__header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e8eaec;
    }

    &__title {
      font-size: 14px;
      font-weight: bold;
    }

    .billing-tips {
      margin-top: 12px;
      font-size: 12px;
      color: #2d8cf0;
    }

    &__body {
      // display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .billing-card {
        width: 240px;
        padding: 16px;
        border: 1px solid #dcdee2;
        border-radius: 4px;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #2d8cf0;
        }

        &--active {
          border-color: #2d8cf0;
          background: #f0faff;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            right: 0;
            bottom: 0;
            border: 10px solid transparent;
            border-right-color: #2d8cf0;
            border-bottom-color: #2d8cf0;
          }
        }

        &__icon {
          margin-right: 12px;
        }

        &__info {
          .name {
            font-weight: bold;
            font-size: 14px;
          }

          .desc {
            font-size: 12px;
            color: #808695;
          }
        }
      }

      .region-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .region-card {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 24px;
        border: 1px solid #dcdee2;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        background-color: #fff;
        min-width: 140px;

        &:hover {
          border-color: #2d8cf0;
        }

        &--active {
          border-color: #2d8cf0;
          background-color: #f0faff;
          position: relative;
        }

        &__name {
          font-size: 14px;
        }

        &__check {
          color: #2d8cf0;
          font-size: 16px;
        }
      }

      .region-tips {
        margin-top: 16px;
        padding: 12px 16px;
        background-color: #f0faff;
        border: 1px solid #abdcff;
        border-radius: 4px;
        font-size: 12px;
        color: #515a6e;
        display: flex;
        align-items: flex-start;
        gap: 8px;

        i {
          color: #2d8cf0;
          font-size: 14px;
          margin-top: 1px;
        }
      }

      .spec-filters {
        margin: 16px 0;
        display: flex;
        gap: 12px;

        // 5 个筛选下拉：13px（iView 默认 14px）
        /deep/ .ivu-select-placeholder,
        /deep/ .ivu-select-selected-value,
        /deep/ .ivu-select-input,
        /deep/ .ivu-select-selection {
          font-size: 13px !important;
        }

        // 搜索输入框：13px（含 placeholder，iView 默认 14px）
        /deep/ .ivu-input,
        /deep/ .ivu-input-placeholder {
          font-size: 13px !important;
        }
      }

      // 产品类型 Tabs：去掉 bar 的 margin，紧贴下方筛选栏
      .product-type-tabs {
        /deep/ .ivu-tabs-bar {
          margin-bottom: 0;
        }
      }

      .image-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 12px 0;
      }

      .image-card {
        width: auto;
        min-width: 120px;
        max-width: 300px;
        height: 40px;
        border: 1px solid #dcdee2;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        padding: 0 16px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #2d8cf0;
        }

        &--active {
          border-color: #2d8cf0;
          background: #f0faff;
          box-shadow: 0 0 0 1px #2d8cf0;
        }

        &__icon {
          width: 40px;
          height: 40px;
          margin-right: 8px;
        }

        &__name {
          font-size: 12px;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 240px;
        }

        &__os {
          font-size: 12px;
          color: #808695;
          margin-top: 4px;
        }
      }

      .image-loading,
      .image-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 32px;
        color: #808695;

        &__link {
          color: #2d8cf0;
          text-decoration: none;
          margin: 0 2px;

          &:hover {
            text-decoration: underline;
          }
        }

        .spin-icon-load {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      }

      .disk-config {
        display: flex;
        align-items: center;
        gap: 24px;

        .disk-size {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      // 登录账号表单样式（与 image-card 风格一致：圆角 + 浅边框 + 灰底色 label）
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 4px 0;

        &__item {
          display: flex;
          align-items: center;
          gap: 16px;

          .label {
            width: 80px;
            flex-shrink: 0;
            color: #515a6e;
            font-size: 13px;
            text-align: right;

            .required {
              color: #ed3f14;
              margin-right: 2px;
              font-weight: 600;
            }
          }
        }

        &__hint {
          padding-left: 96px;
          color: #808695;
          font-size: 12px;
          line-height: 1.5;
        }

        // 表单校验错误：仿 iview FormItem 的 error 样式（红字 + 与 label 同缩进）
        &__field-error {
          padding-left: 96px;
          color: #ed3f14;
          font-size: 12px;
          line-height: 1.5;
        }
      }

      // 密码输入框校验态：红色边框
      .login-pwd--invalid {

        :deep(.ivu-input),
        :deep(.ivu-input-wrapper) .ivu-input {
          border-color: #ed3f14 !important;
        }
      }
    }
  }

  &__right {
    align-self: flex-start;
    height: auto;

    .summary-card {
      &__title {
        font-weight: bold;
      }

      .summary-list {
        .summary-item {
          display: flex;
          margin-bottom: 12px;
          font-size: 12px;
          position: relative;
          padding-left: 12px;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 6px;
            width: 4px;
            height: 4px;
            background: #2d8cf0;
            border-radius: 50%;
          }

          .label {
            color: #808695;
            width: 80px;
            flex-shrink: 0;
          }

          .value {
            color: #515a6e;

            &.link {
              // color: #2d8cf0;
              // cursor: pointer;
            }

            &--multi {
              line-height: 1.6;
            }
          }
        }
      }

      .summary-form {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e8eaec;

        .form-item {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .label {
            font-size: 12px;
            color: #515a6e;
          }
        }
      }

      .renew-alert {
        font-size: 12px;
        background-color: #fffbe6;
        border: 1px solid #ffe58f;
        margin-bottom: 16px;
      }

      .balance-check {
        font-size: 12px;
        margin-bottom: 24px;

        .price-red {
          color: #ed4014;
        }

        &__tip {
          display: inline-block;
          text-indent: 2em;
          line-height: 1.6;
        }
      }

      .price-panel {
        .price-main {
          color: #2d8cf0;
          display: flex;
          align-items: baseline;

          .currency {
            font-size: 14px;
            font-weight: bold;
          }

          .amount {
            font-size: 32px;
            font-weight: bold;
            margin: 0 4px;
          }

          .unit {
            font-size: 14px;
          }
        }

        .price-origin {
          font-size: 12px;
          color: #808695;
          text-decoration: line-through;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;

          .discount-badge {
            padding: 2px 6px;
            background-color: #ed4014;
            color: #fff;
            font-size: 11px;
            border-radius: 3px;
            line-height: 1;
            text-decoration: none;
          }
        }

        .price-saved {
          font-size: 12px;
          color: #19be6b;
          margin-bottom: 8px;
        }

        .price-tips {
          font-size: 12px;
          color: #808695;
          margin-bottom: 16px;

          span {
            color: #2d8cf0;
            cursor: pointer;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .pay-btn {
          height: 48px;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
  }
}

// 覆写 iView 样式
/deep/ .ivu-card-body {
  min-height: auto !important;
}

/deep/ .ivu-tabs-bar {
  margin-bottom: 0;
  border-bottom: none;
}

// Tabs 标签：13px（iView 默认 14px）。必须放在 /deep/ 顶层，不能再嵌一层 /deep/
/deep/ .ivu-tabs-tab {
  font-size: 13px !important;
}

/deep/ .ivu-table-wrapper {
  border: none;
}

/deep/ .ivu-table:before {
  display: none;
}

/deep/ .ivu-table-header th {
  background-color: #f2f5fa;
  // font-size: 12px;
  font-size: 13px;
  font-weight: bold;
  // color: #666;
  color: #000000;
  border-bottom: none;
}

/deep/ .ivu-table-td {
  font-size: 12px;
  color: #333;
}

/deep/ .ivu-table-cell {
  text-align: center;
}

/deep/ .ivu-table-cell>span {
  display: inline-block;
}

/deep/ .discount-tag {
  padding: 2px 6px;
  background-color: #ed4014;
  color: #fff;
  font-size: 12px;
  border-radius: 3px;
  line-height: 1;
  margin-left: auto;
}

.hint-text {
  text-align: right;
  flex: 1;
}

/deep/ .duration-radio-group {
  width: 120px;
}

/deep/ .duration-radio-item {
  display: flex !important;
  align-items: center;
  width: 100%;
}

/deep/ .duration-radio-item .ivu-radio {
  margin-top: 0;
}

// 数据盘样式
.data-disk-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #808695;
  font-size: 14px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px dashed #dcdee2;

  i {
    margin-right: 8px;
  }
}

// 动态列表样式
.data-disk-dynamic-list {

  // 顶部添加按钮
  .data-disk-count {
    font-size: 12px;
    color: #808695;
    margin-bottom: 12px;
  }

  // 数据盘行
  .data-disk-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #fafafa;
    border: 1px solid #e8eaec;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      border-color: #2d8cf0;
      background: #f0faff;
    }

    &__select {
      flex-shrink: 0;
    }

    &__attr {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;

      .attr-label {
        color: #808695;
      }

      .attr-value {
        color: #515a6e;
        font-weight: 500;
      }
    }

    &__price {
      font-size: 14px;
      color: #ed4014;
      font-weight: 500;

      .price-unit {
        font-size: 12px;
        color: #808695;
        font-weight: normal;
      }
    }

    &__placeholder {
      flex: 1;
      color: #c5c8ce;
      font-size: 12px;
    }

    &__action {
      margin-left: auto;
      flex-shrink: 0;
    }
  }

  // 无选择提示
  .data-disk-no-selection {
    padding: 20px;
    text-align: center;
    color: #c5c8ce;
    font-size: 12px;
    background: #f8f9fa;
    border-radius: 4px;
  }
}

// 网络部分样式
.network-section {
  display: flex;
  align-items: flex-start;
  gap: 40px;

  .network-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 14px;
      color: #515a6e;
      font-weight: 500;
      white-space: nowrap;
    }

    .network-hint {
      font-size: 12px;
      color: #808695;

      &__link {
        color: #2d8cf0;
        text-decoration: none;
        margin: 0 2px;

        &:hover {
          text-decoration: underline;
        }
      }

      margin-left: 8px;
      white-space: nowrap;
    }
  }
}

// 价格明细抽屉样式
.price-detail-content {

  // 列表样式
  .price-detail-header,
  .price-detail-row,
  .price-detail-footer {
    display: flex;
    align-items: center;
    padding: 12px 0;
    font-size: 13px;
    border-bottom: 1px solid #e8eaec;

    .col-item {
      flex: 2;
      min-width: 140px;

      .item-name {
        color: #17233d;
        font-weight: 500;
      }

      .item-sub {
        color: #808695;
        font-size: 12px;
        margin-top: 4px;
      }
    }

    .col-price {
      flex: 1;
      text-align: right;
      color: #515a6e;
      min-width: 60px;
    }

    .col-rate {
      flex: 0.8;
      text-align: right;
      color: #515a6e;
      min-width: 50px;
    }

    .col-discount {
      flex: 1;
      text-align: right;
      color: #515a6e;
      min-width: 70px;
    }

    .col-pay {
      flex: 1.2;
      text-align: right;
      min-width: 90px;
      font-weight: 500;
    }

    .price-red {
      color: #ff4d4f;
    }

    .price-green {
      color: #19be6b;
    }

    .discount-tag-red {
      display: inline-block;
      background: #ff4d4f;
      color: #fff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
  }

  // 表头
  .price-detail-header {
    font-weight: bold;
    color: #17233d;
    background: #f2f5fa;
    padding: 12px 8px;
    border-radius: 4px 4px 0 0;
  }

  // 数据行
  .price-detail-row {
    padding: 12px 8px;
    color: #515a6e;

    &:nth-child(even) {
      background: #fafafa;
    }

    &:hover {
      background: #f0faff;
    }
  }

  // 合计行
  .price-detail-footer {
    margin-top: 8px;
    padding: 16px 8px;
    background: #f2f5fa;
    border-radius: 0 0 4px 4px;
    border-bottom: none;
    font-weight: bold;

    .col-item {
      color: #17233d;
    }

    .col-price {
      color: #808695;
      font-weight: normal;
    }

    .price-total {
      color: #ff4d4f;
      font-size: 16px;
    }
  }

  // 订单成功提示弹框（样式已迁移到 template 内联 style，避开 scoped 与 teleport 失效问题）
}

// 把 Modal 撑满到屏幕比例（iView/View Design 的 width 是百分比）
.ivu-modal.instance-buy__post-order-modal {
  top: 3vh;
}

.ivu-modal.instance-buy__post-order-modal .ivu-modal-body {
  padding: 12px 16px;
}
</style>
