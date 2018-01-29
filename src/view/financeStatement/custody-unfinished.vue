<template>
    <div>
        <form action="" method="post" id="form"></form>
        <div class="fun-tool" style="padding-top:0;">
            <span>发起申请提现的结算订单可前往“结算订单”查看订单详情。</span>
            <div class="fr">
                <Button type="primary" @click="applyAll">批量申请提现</Button>
            </div>
        </div>
        <Table :columns="columns1" :data="tableData1" :loading="JSON.stringify(this.resData) == '{}'"></Table>
        <Page :total="resData.totalCount" :current="current" :page-size="15" show-total @on-change="getTableDate" show-sizer :page-size-opts="[ 10, 15, 20, 50]" @on-page-size-change="getTableDateBypagesize" v-if="this.resData.totalCount"></Page>
        <Modal v-model="settingBillBox" title="提示" @on-cancel="settingBillBox_cancleTop">
            <div class="">
                您还未设置公证处的银行收款账户，请前往<b>“财务管理-银行账户设置”</b>中设置后再申请提现。
            </div>
            <div slot="footer">
                <Button type="primary" @click="settingBillBox_ok">立即设置</Button>
                <Button type="primary" @click="settingBillBox_cancel">稍后设置</Button>
            </div>
        </Modal>
        <Modal v-model="withdrawBox" title="提现申请" @on-cancel="withdrawBox_cancleTop">
            <div class="withdrawBox-ul">
                <ul>
                    <li><label>提现金额：</label>{{resDataPOPBOX.sumPercentMoney}}</li>
                    <li><label>账户名称：</label>{{resDataPOPBOX.accountName}}</li>
                    <li><label>银行账号：</label>{{resDataPOPBOX.bankAccount}}</li>
                    <li><label>所属银行：</label>{{resDataPOPBOX.affiliatedBank}}</li>
                    <li><label>开户银行：</label>{{resDataPOPBOX.bankName}}</li>
                </ul>
                <div class="tip">
                    提交成功后，可在结算订单列表中查看到所申请的订单。
                </div>
            </div>
            <div slot="footer">
                <Button type="primary" @click="withdrawBox_ok">提交申请</Button>
                <Button type="primary" @click="withdrawBox_cancel">取消</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    export default {
        computed: {
            basePath(){
                return this.$store.state.basePath + 'orgConsumption/exportOrder.action'
            },
        },
        data() {
            return {
                withdrawBox:false,
                settingBillBox:false,
                resDataPOPBOX:{},
                url:'',
                pageSize:15,
                // 当前页码
                current: 1,
                resData:{},
                form:{
                    keywords:'',
                },
                // 表格
                columns1: [
                    {
                        title: '序号',
                        key:'seq',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '账单时间',
                        key: 'monthTime',
                        align: 'center',
                    },
                    {
                        title: '结算笔数',
                        key: 'orgPercentCount',
                        align: 'center',
                    },
                    {
                        title: '公证保管实收公证币（币）',
                        key: 'orgPercentToken',
                        align: 'center',
                    },
                    {
                        title: '公证保管费结算金额（元）',
                        key: 'orgPercentMoney',
                        align: 'center',
                    },
                    {
                        title: '结算状态',
                        key: 'settlementStatus',
                        align: 'center',
                        render: (h, params) => {
                            switch (params.row.settlementStatus) {
                            case '-1':
                                return h('span', '审核不通过退回');break
                            case '-2':
                                return h('span', '撤销提现');break
                            case '0':
                                return h('span', '未提现申请');break
                            case '1':
                                return h('span', '申请待受理');break
                            case '2':
                                return h('span', '受理通过待开票');break
                            case '3':
                                return h('span', '已开票邮寄待初审');break
                            case '4':
                                return h('span', '初审通过待复核');break
                            case '5':
                                return h('span', '结算成功');break
                            case '-':
                                return h('span', '-');break
                            }
                        }
                    },
                    {
                        title: '操作',
                        key: 'handle',
                        align: 'center',
                        width : 250,
                        render: (h, params) => {
                            if(params.row.settlementStatus == '-1' || params.row.settlementStatus == '-2' || params.row.settlementStatus == '0'){
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        style: {
                                            marginRight: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                this.apply(params.row.id)
                                            }
                                        }
                                    }, '申请提现'),
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        style: {
                                            marginRight: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                this.$router.push({
                                                    name: 'CustodyUnfinishedDetail',
                                                    params: {
                                                        orgName: params.row.orgName,
                                                        monthTime: params.row.monthTime,
                                                    }
                                                })
                                            }
                                        }
                                    }, '账单明细'),
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.exportBilling(params.row.monthTime)
                                            }
                                        }
                                    }, '导出账单'),
                                ]);
                            }else{
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        style: {
                                            marginRight: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                this.$router.push({
                                                    name: 'CustodyUnfinishedDetail',
                                                    params: {
                                                        monthTime: params.row.monthTime,
                                                    }
                                                })
                                            }
                                        }
                                    }, '账单明细'),
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.exportBilling(params.row.monthTime)
                                            }
                                        }
                                    }, '导出账单'),
                                ]);
                            }
                        }
                    }
                ],
                tableData1: []
            }
        },
        methods: {
            // 修改每页显示条数
            getTableDateBypagesize(pagesize){
                this.pageSize = pagesize
                this.getTableDate(1)
            },
            // 申请提现
            apply(id){
                this.$http.post('/settlementOrg/ajax/application.action', this.qs.stringify({
                    sysUserToken: this.getQueryString('token') ? this.getQueryString('token'):'111111',
                    id: id
                })).then(response => {
                    if (response.data.code == 200) {console.log(123)
                        console.log(response)
                        this.withdrawBox = true
                        this.resDataPOPBOX =  response.data.data
                    }else if(response.data.code == 10002){
                        if(response.data.errorMsg == ' 您还未设置公证处的银行收款账户，请前往“财务管理-银行账户设置”中设置后再申请提现不能为空'){
                            this.settingBillBox = true
                        }
                    }
                }).catch(error => {
                    console.log(error);
                })
            },

            // 提现申请-申请按钮
            withdrawBox_ok(){
                this.$http.post('/settlementOrg/ajax/generatingOrder.action', this.qs.stringify({
                    sysUserToken: this.getQueryString('token') ? this.getQueryString('token'):'111111',
                    summaryId: this.resDataPOPBOX.summaryId,
                    money: this.resDataPOPBOX.sumPercentMoney,
                    accountName: this.resDataPOPBOX.accountName,
                    bankAccount: this.resDataPOPBOX.bankAccount,
                    bankName: this.resDataPOPBOX.bankName
                })).then(response => {
                    if (response.data.code == 200) {
                        console.log(response)
                        if($('.ivu-message-notice-content').length == 0){
                            this.$Message.success({
                                content: "提交成功",
                                duration: 1,
                                onClose: () => {
                                    this.withdrawBox = false
                                    this.getTableDate(1)
                                }
                            })
                        }
                    }
                }).catch(error => {
                    console.log(error);
                })
            },
            // 提现申请-取消按钮
            withdrawBox_cancel(){
                this.withdrawBox = false
            },
            // 提现申请-取消按钮X
            withdrawBox_cancleTop(){
                this.withdrawBox = false
            },

            // 批量申请提现
            applyAll(){
                this.$http.get('/orgMonthSummary/orgQueryNoSettlementOrder.action', {params:{
                    sysUserToken: this.getQueryString('token') ? this.getQueryString('token'):'111111',
                    pageNo: '1',
                    pageSize: this.pageSize,
                }}).then(response => {
                    console.log(response)
                    if (response.data.code == 200) {
                        this.$router.push({
                            name: 'CustodyUnfinishedWithdraw'
                        })
                    }
                }).catch(error => {
                    console.log(error);
                })
            },
            // 设置 发票信息管理-确定按钮
            settingBillBox_ok(){
                this.$router.push({
                    name: 'BillingMan'
                })
            },
            // 设置 发票信息管理-取消按钮
            settingBillBox_cancel(){
                this.settingBillBox = false
            },
            // 设置 发票信息管理-取消按钮X
            settingBillBox_cancleTop(){
                this.settingBillBox = false
            },
            // 导出Excel弹窗-确定
            exportBilling(monthTime){
                this.$http.post('/orgConsumption/exportOrder.action', this.qs.stringify({
                    sysUserToken: this.getQueryString('token') ? this.getQueryString('token'):'111111',
                    monthTime: monthTime
                })).then(response => {
                    console.log(response)
                    if (response.status == 200) { 
                        this.url =  this.basePath + '?sysUserToken=' + (this.getQueryString('token') ? this.getQueryString('token'):'111111') + '&monthTime=' + monthTime
                        $('#form').attr({'action':this.url})
                        $('#form').submit()          
                    }
                }).catch(error => {
                    console.log(error);
                }) 
            },
            // 获取表格数据
            getTableDate(page) {
                this.current = page
                this.$http.get('/orgMonthSummary/orgQueryOrder.action', {params:{
                    sysUserToken: this.getQueryString('token') ? this.getQueryString('token'):'111111',
                    settlementStatus: '0',
                    pageNo: page,
                    pageSize: this.pageSize,
                }}).then(response => {
                    if (response.data.code == 200) {
                        console.log(response)
                        this.resData =  response.data.data
                        this.tableData1 = response.data.data.list
                    }
                }).catch(error => {
                    console.log(error);
                })
            },
        },
        mounted() {
            this.$store.commit('SET_POSITION', {
                primaryNavigation: '财务报表',
                subNavigation: '公证保管账单',
                thirdNavigation: '未结算完结账单',
                secondName: 'CustodyUnfinished',
                second: true,
                third: true,
            });
            // 表格初始化，显示第一页
            this.getTableDate(1)
        },
    }
</script>

<style>
</style>