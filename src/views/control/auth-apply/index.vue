<template>
    <div class="auth-apply">
        <!-- 顶部面包屑 -->
        <div class="auth-apply__breadcrumb">
            <Breadcrumb>
                <BreadcrumbItem>账号管理</BreadcrumbItem>
                <BreadcrumbItem>认证申请</BreadcrumbItem>
            </Breadcrumb>
        </div>

        <Card :bordered="false" dis-hover class="auth-card">
            <!-- 认证类型切换 - 个人已认证状态下隐藏 -->
            <div class="auth-type-tabs" v-if="!(currentUserType === 'PERSONAL' && currentAuthStatus === 'PASSED')">
                <RadioGroup v-model="authType" @on-change="handleAuthTypeChange">
                    <Radio label="PERSONAL">
                        <span>个人认证</span>
                    </Radio>
                    <Radio label="ENTERPRISE">
                        <span>企业认证</span>
                    </Radio>
                </RadioGroup>
            </div>

            <Divider v-if="!(currentUserType === 'PERSONAL' && currentAuthStatus === 'PASSED')" />

            <!-- 个人认证表单 -->
            <Form v-if="authType === 'PERSONAL'" :model="personalForm" :rules="personalRules" ref="personalFormRef"
                :label-width="140" class="auth-form">
                <FormItem label="真实姓名" prop="realName">
                    <Input v-model="personalForm.realName" placeholder="请输入真实姓名" style="width: 300px" />
                </FormItem>
                <FormItem label="身份证号" prop="idCard">
                    <Input v-model="personalForm.idCard" placeholder="请输入18位身份证号" style="width: 300px" />
                </FormItem>
                <FormItem label="身份证正面照片" prop="idCardFront">
                    <sp-upload scp-type="上传文件" v-model="personalForm.idCardFront" :format="['jpg', 'jpeg', 'png']"
                        :max-num="1" />
                    <div class="form-tip">请上传清晰的身份证正面照片，支持JPG/PNG格式</div>
                </FormItem>
                <FormItem label="身份证反面照片" prop="idCardBack">
                    <sp-upload scp-type="上传文件" v-model="personalForm.idCardBack" :format="['jpg', 'jpeg', 'png']"
                        :max-num="1" />
                    <div class="form-tip">请上传清晰的身份证反面照片，支持JPG/PNG格式</div>
                </FormItem>

                <FormItem>
                    <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交认证</Button>
                    <Button @click="handleBack" style="margin-left: 12px">返回</Button>
                </FormItem>
            </Form>

            <!-- 企业认证表单 -->
            <Form v-if="authType === 'ENTERPRISE'" :model="enterpriseForm" :rules="enterpriseRules"
                ref="enterpriseFormRef" :label-width="140" class="auth-form">
                <FormItem label="企业类型" prop="enterpriseType">
                    <Select v-model="enterpriseForm.enterpriseType" placeholder="请选择企业类型" style="width: 300px">
                        <Option value="NORMAL">普通企业</Option>
                        <Option value="INDIVIDUAL">个体工商户</Option>
                        <Option value="GOVERNMENT">政府/事业单位</Option>
                    </Select>
                </FormItem>
                <FormItem label="企业名称" prop="companyName">
                    <Input v-model="enterpriseForm.companyName" placeholder="请输入企业名称" style="width: 300px" />
                </FormItem>
                <FormItem label="营业执照照片" prop="businessLicense">
                    <sp-upload scp-type="上传文件" v-model="enterpriseForm.businessLicense" :format="['jpg', 'jpeg', 'png']"
                        :max-num="1" />
                    <div class="form-tip">请上传清晰的营业执照照片，支持JPG/PNG格式</div>
                </FormItem>
                <FormItem label="营业执照编号" prop="licenseNo">
                    <Input v-model="enterpriseForm.licenseNo" placeholder="请输入18位统一社会信用代码" style="width: 300px" />
                </FormItem>
                <FormItem label="法人姓名" prop="legalPerson">
                    <Input v-model="enterpriseForm.legalPerson" placeholder="请输入法人姓名" style="width: 300px" />
                </FormItem>
                <FormItem label="对公账户户名" prop="bankAccountName">
                    <Input v-model="enterpriseForm.bankAccountName" placeholder="请输入对公账户户名" style="width: 300px" />
                </FormItem>
                <FormItem label="对公账号" prop="bankAccountNo">
                    <Input v-model="enterpriseForm.bankAccountNo" placeholder="请输入对公账号" style="width: 300px" />
                </FormItem>
                <FormItem label="开户银行" prop="bankName">
                    <Input v-model="enterpriseForm.bankName" placeholder="请输入开户银行" style="width: 300px" />
                </FormItem>

                <FormItem>
                    <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交认证</Button>
                    <Button @click="handleBack" style="margin-left: 12px">返回</Button>
                </FormItem>
            </Form>
        </Card>
    </div>
</template>

<script>
export default {
    name: 'AuthApply',
    data() {
        return {
            authType: 'PERSONAL', // PERSONAL-个人认证, ENTERPRISE-企业认证
            currentAuthStatus: '', // 当前认证状态
            currentUserType: '', // 当前用户类型
            submitLoading: false,

            // 个人认证表单
            personalForm: {
                realName: '',
                idCard: '',
                idCardFront: '',
                idCardBack: ''
            },
            personalRules: {
                realName: [
                    { required: true, message: '真实姓名不能为空', trigger: 'blur' },
                    { type: 'string', min: 2, max: 20, message: '真实姓名长度在2-20个字符', trigger: 'blur' }
                ],
                idCard: [
                    { required: true, message: '身份证号不能为空', trigger: 'blur' },
                    { validator: this.validateIdCard, trigger: 'blur' }
                ],
                idCardFront: [
                    { required: true, message: '身份证正面照片不能为空', trigger: 'change' }
                ],
                idCardBack: [
                    { required: true, message: '身份证反面照片不能为空', trigger: 'change' }
                ]
            },

            // 企业认证表单
            enterpriseForm: {
                enterpriseType: '',
                companyName: '',
                businessLicense: '',
                licenseNo: '',
                legalPerson: '',
                bankAccountName: '',
                bankAccountNo: '',
                bankName: ''
            },
            enterpriseRules: {
                enterpriseType: [
                    { required: true, message: '请选择企业类型', trigger: 'change' }
                ],
                companyName: [
                    { required: true, message: '企业名称不能为空', trigger: 'blur' },
                    { type: 'string', min: 2, max: 100, message: '企业名称长度在2-100个字符', trigger: 'blur' }
                ],
                businessLicense: [
                    { required: true, message: '营业执照照片不能为空', trigger: 'change' }
                ],
                licenseNo: [
                    { required: true, message: '营业执照编号不能为空', trigger: 'blur' },
                    { pattern: /^[1-9A-GY]{1}[1-9A-NP-Z]{1}[1-9A-Z]{16}$/, message: '请输入正确的18位统一社会信用代码', trigger: 'blur' }
                ],
                legalPerson: [
                    { required: true, message: '法人姓名不能为空', trigger: 'blur' },
                    { type: 'string', min: 2, max: 20, message: '法人姓名长度在2-20个字符', trigger: 'blur' }
                ],
                bankAccountName: [
                    { required: true, message: '对公账户户名不能为空', trigger: 'blur' }
                ],
                bankAccountNo: [
                    { required: true, message: '对公账号不能为空', trigger: 'blur' },
                    { type: 'string', min: 10, max: 25, message: '对公账号长度在10-25位', trigger: 'blur' },
                    { pattern: /^\d+$/, message: '对公账号只能输入数字', trigger: 'blur' }
                ],
                bankName: [
                    { required: true, message: '开户银行不能为空', trigger: 'blur' }
                ]
            }
        }
    },
    mounted() {
        // 根据用户当前认证状态设置默认认证类型
        this.loadAuthInfo()
    },
    methods: {
        // 完整身份证校验（18位）：格式 + 出生日期合法性（含闰年）+ GB11643-1999 校验位
        validateIdCard(rule, value, callback) {
            if (!value) {
                return callback()
            }
            const id = String(value).trim()
            // 1. 基础格式校验（18位：6位地区 + 4位年 + 2位月 + 2位日 + 3位顺序码 + 1位校验码）
            if (!/^\d{17}[\dXx]$/.test(id)) {
                return callback(new Error('身份证号格式不正确'))
            }
            // 2. 出生日期合法性校验（含闰年、每月天数上限）
            const year = parseInt(id.substr(6, 4), 10)
            const month = parseInt(id.substr(10, 2), 10)
            const day = parseInt(id.substr(12, 2), 10)
            const birthStr = id.substr(6, 8)
            // 闰年判定：能被4整除且不能被100整除，或能被400整除
            const isLeap = (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0)
            // 各月天数上限（2月平年28天、闰年29天）
            const maxDays = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            if (year < 1900 || year > new Date().getFullYear()
                || month < 1 || month > 12
                || day < 1 || day > maxDays[month - 1]
                || !/^\d{8}$/.test(birthStr)) {
                return callback(new Error('身份证出生日期不合法'))
            }
            // 3. 校验位验证（GB11643-1999 加权因子，模11 -> 校验码映射表）
            const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
            const checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
            let sum = 0
            for (let i = 0; i < 17; i++) {
                sum += parseInt(id.charAt(i), 10) * weight[i]
            }
            const expected = checkCodeMap[sum % 11]
            if (expected !== id.charAt(17).toUpperCase()) {
                return callback(new Error('身份证号校验码不正确'))
            }
            callback()
        },
        // 加载用户认证信息，用于判断默认认证类型
        async loadAuthInfo() {
            try {
                let res = await this.$hdAxios.request({
                    url: '/api/ac/shenbeigpuai/userAuthService/getAndgetUserAuth',
                    method: 'post',
                    data: {}
                })
                res = { data: res }
                if (res.data.errcode === 0) {
                    const data = res.data.data || {}
                    this.currentAuthStatus = data.authStatus || ''
                    this.currentUserType = data.userType || ''
                    // 如果用户类型是个人认证通过，只能升级为企业，且隐藏切换框
                    if (this.currentUserType === 'PERSONAL' && this.currentAuthStatus === 'PASSED') {
                        this.authType = 'ENTERPRISE'
                    }
                } else if (res.data.errcode === 1001) {
                    // 跳转到登录页
                    sessionStorage.clear()
                    this.$router.push('/login')
                }
            } catch (e) {
                console.error('加载认证信息失败:', e)
            }
        },

        // 切换认证类型
        handleAuthTypeChange() {
            // 重置表单
            if (this.authType === 'PERSONAL') {
                this.$refs.enterpriseFormRef && this.$refs.enterpriseFormRef.resetFields()
            } else {
                this.$refs.personalFormRef && this.$refs.personalFormRef.resetFields()
            }
        },

        // 提交认证
        handleSubmit() {
            const formRef = this.authType === 'PERSONAL' ? 'personalFormRef' : 'enterpriseFormRef'
            this.$refs[formRef].validate(async (valid) => {
                if (!valid) {
                    return
                }

                this.submitLoading = true
                try {
                    // 构建提交数据
                    const params = {
                        authType: this.authType
                    }

                    if (this.authType === 'PERSONAL') {
                        params.realName = this.personalForm.realName
                        params.idCard = this.personalForm.idCard
                        params.idCardFront = this.personalForm.idCardFront
                        params.idCardBack = this.personalForm.idCardBack
                    } else {
                        params.enterpriseType = this.enterpriseForm.enterpriseType
                        params.companyName = this.enterpriseForm.companyName
                        params.businessLicense = this.enterpriseForm.businessLicense
                        params.licenseNo = this.enterpriseForm.licenseNo
                        params.legalPerson = this.enterpriseForm.legalPerson
                        params.bankAccountName = this.enterpriseForm.bankAccountName
                        params.bankAccountNo = this.enterpriseForm.bankAccountNo
                        params.bankName = this.enterpriseForm.bankName
                    }

                    let res = await this.$hdAxios.request({
                        url: '/api/ac/shenbeigpuai/userAuthService/addAuthApplication',
                        method: 'post',
                        data: params
                    })
                    res = { data: res }
                    if (res.data.errcode === 0) {
                        this.$Message.success('认证申请提交成功')
                        this.handleBack()
                    } else {
                        this.$Message.error(res.data.errmsg || '提交失败')
                    }
                } catch (e) {
                    this.$Message.error('提交失败，请稍后重试')
                } finally {
                    this.submitLoading = false
                }
            })
        },

        // 返回上一页
        handleBack() {
            this.$router.push('/shenbeigpuai/control/account-management')
        }
    }
}
</script>

<style lang="less" scoped>
.auth-apply {
    padding: 16px 24px;
    background: #f8f9fa;
    min-height: 100vh;

    &__breadcrumb {
        margin-bottom: 20px;

        /deep/ .ivu-breadcrumb {
            font-size: 12px;
            color: #999;
        }
    }

    .auth-card {
        border-radius: 4px;
        max-width: 800px;
        margin: 0 auto;
    }

    .auth-type-tabs {
        padding: 16px 0;
    }

    .auth-form {
        padding: 16px 0;
        max-width: 600px;
    }

    .form-tip {
        color: #999;
        font-size: 12px;
        margin-top: 8px;
    }
}
</style>