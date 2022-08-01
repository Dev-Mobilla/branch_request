<template>
    <v-container class="m-auto mb-10 pb-13"
        style="background-color: white;border-radius: 13px; max-width: 65%;margin-top: -130px; ;">
        <v-row justify="space-between" class="header">
            <v-col class="title" cols="8">
                <h4 class="white--text">Revolving Fund Liquidation</h4>
            </v-col>
            <v-col cols="4" class="pl-0 pr-2">
                <v-img src="../assets/logo-ml.png" class="logo" max-width="300"></v-img>
            </v-col>
        </v-row>
        <v-form>
            <v-row class="mx-auto ml-10 mr-10 mb-10">
                <v-col cols="7">
                    <v-row>
                        <v-col style="padding:0px">
                        <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Requestor Type:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.type"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Date:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.rfDate"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Requestor:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.requestor"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Base Branch:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.baseBranch"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Region:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.region"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Email Address:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.email">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="5">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="5"><label for="">Control No:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.controlNo"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="5"><label for="">Period:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.period">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="5"><label for="">RF Allowance:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.rfAllowance"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="5"><label for="">Pending RF:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.pendingRf"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="5"><label for="">Total Expenses:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.totalExpenses"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="5"><label for="">Cash on hand:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.cashOnHand"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row class="mx-auto ml-10 mr-7">
                <v-col cols="7">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Transportation:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field readonly dense v-model="data.transpo"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Office Supplies:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field readonly dense v-model="data.supplies"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Meals:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field readonly dense v-model="data.meals"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Others:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field readonly dense v-model="data.others"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Total Expenses:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field readonly dense v-model="data.total"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="5">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="5"><label for="">Purpose:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field readonly dense v-model="data.purpose"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>
<script>
export default {
    name: 'RF_successComponent',
    data() {
        return {
            data: {
                baseBranch: '',
                cashOnHand: '',
                controlNo: '',
                email:'',
                meals: '',
                others: '',
                pendingRf: '',
                period: '',
                purpose: '',
                region: '',
                requestor: '',
                rfAllowance: '',
                rfDate: '',
                supplies: '',
                total: '',
                type:'',
                totalExpenses: '',
                transpo: '',
            }
        }
    },
    created() {
        // console.log(this.$route.params.obj);
        this.data = {
            baseBranch: this.$route.params.obj.baseBranch,
            cashOnHand: this.$route.params.obj.cashOnHand,
            controlNo: this.$route.params.obj.controlNo,
            email: this.$route.params.obj.email,
            meals: this.$route.params.obj.meals,
            others: this.$route.params.obj.others,
            pendingRf: this.$route.params.obj.pendingRf,
            period: this.$route.params.obj.period,
            purpose: this.$route.params.obj.purpose,
            region: this.$route.params.obj.region,
            requestor: this.$route.params.obj.requestor,
            rfAllowance: this.$route.params.obj.rfAllowance,
            rfDate: this.$route.params.obj.rfDate,
            supplies: this.$route.params.obj.supplies,
            total: this.$route.params.obj.total,
            type:this.$route.params.obj.type,
            totalExpenses: this.$route.params.obj.totalExpenses,
            transpo: this.$route.params.obj.transpo,
        }
    }
}
</script>