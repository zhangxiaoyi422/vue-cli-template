<template>
    <div>
        <form action="" method="post" id="form"></form>
        <Table :columns="columns1" :data="tableData1" :loading="JSON.stringify(this.resData) == '{}'"></Table>
        <Page :total="resData.totalCount" :current="current" :page-size="15" show-total @on-change="getTableDate" show-sizer :page-size-opts="[ 10, 15, 20, 50]" @on-page-size-change="getTableDateBypagesize" v-if="this.resData.totalCount"></Page>
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
            // 导出Excel弹窗-确定
            exportBilling(monthTime){
                this.$http.post('/orgConsumption/exportOrder.action', this.qs.stringify({
                    sysUserToken: this.getQueryString('token') ? this.getQueryString('token'):'111111',
                    monthTime: monthTime
                })).then(response => {
                    console.log(response)
                    if (response.status == 200) { 
                        this.url =  this.basePath + '?sysUserToken=' + '111111' + '&monthTime=' + monthTime
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
                    settlementStatus: '1',
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
                thirdNavigation: '结算完成账单',
                secondName: 'CustodyFinished',
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