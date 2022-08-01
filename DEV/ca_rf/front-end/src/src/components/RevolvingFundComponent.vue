<template>
    <v-container class="m-auto mb-10 pb-13"
        style="background-color: white;border-radius: 13px; max-width: 65%;margin-top: -150px; ;">
        <v-row justify="space-between" class="header">
            <v-col class="title" cols="8">
                <h4 class="white--text">Revolving Fund Liquidation</h4>
            </v-col>
            <v-col cols="4" class="pl-0 pr-2">
                <v-img src="../assets/logo-ml.png" class="logo" max-width="300"></v-img>
            </v-col>
        </v-row>
        <v-form ref="data" v-model="isFormValid" class="mt-7">
            <v-row class="mx-auto ml-10 mr-5 mb-10">
                <v-col cols="6">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Requestor Type:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-select :items="requestorType" dense outlined v-model="rfFormData.type"
                                        :background-color="rfFormData.type ? inputBackGround : ''"
                                        :rules="[RequiredRules.type]" @blur="getData"></v-select>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Date:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.rfDate]"
                                        v-model="rfFormData.rfDate" type="date"
                                        :background-color="rfFormData.rfDate ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Requestor:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.requestor]"
                                        v-model="rfFormData.requestor"
                                        :background-color="rfFormData.requestor ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Base Branch:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.baseBranch]"
                                        v-model="rfFormData.baseBranch" placeholder="ex. ML LANGIHAN"
                                        :background-color="rfFormData.baseBranch ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Region:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.region]"
                                        v-model="rfFormData.region" placeholder="ex. CEBU NORTH A"
                                        :background-color="rfFormData.region ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Email Address:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.email, InputRules.email]"
                                        v-model="rfFormData.email"
                                        :background-color="rfFormData.rfAllowance ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="6">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Control No:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense readonly v-model="rfFormData.controlNo"
                                        :background-color="rfFormData.controlNo ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Period:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.period]"
                                        v-model="rfFormData.period"
                                        :background-color="rfFormData.period ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">RF Allowance:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense
                                        :rules="[RequiredRules.rfAllowance, RequiredRules.numOnly]"
                                        v-model="rfFormData.rfAllowance"
                                        :background-color="rfFormData.rfAllowance ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Pending RF:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.pendingRf]"
                                        v-model="rfFormData.pendingRf"
                                        :background-color="rfFormData.pendingRf ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Total Expenses:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense
                                        :rules="[RequiredRules.totalExpenses, RequiredRules.numOnly]"
                                        v-model="rfFormData.totalExpenses"
                                        :background-color="rfFormData.totalExpenses ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Cash on hand:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense
                                        :rules="[RequiredRules.cashOnHand, RequiredRules.numOnly]"
                                        v-model="rfFormData.cashOnHand"
                                        :background-color="rfFormData.cashOnHand ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <!-- SECOND ROW -->
            <v-row class="mx-auto ml-10 mr-5">
                <v-col cols="6">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Transportation:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.transpo, RequiredRules.numOnly]"
                                        v-model="rfFormData.transpo"
                                        :background-color="rfFormData.transpo ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Office Supplies:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.supplies, RequiredRules.numOnly]"
                                        v-model="rfFormData.supplies"
                                        :background-color="rfFormData.supplies ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Meals:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.meals, RequiredRules.numOnly]" v-model="rfFormData.meals"
                                        :background-color="rfFormData.meals ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Others:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.others, RequiredRules.numOnly]"
                                        v-model="rfFormData.others"
                                        :background-color="rfFormData.others ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Total Expenses:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.total, RequiredRules.numOnly]" v-model="rfFormData.total"
                                        :background-color="rfFormData.total ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="6">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Purpose:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-textarea outlined dense :rules="[RequiredRules.purpose]"
                                        v-model="rfFormData.purpose"
                                        :background-color="rfFormData.purpose ? inputBackGround : ''"></v-textarea>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-form>
        <v-col>
            <v-row justify="center" class="mt-10">
                <v-dialog v-model="dialog" width="350" persistent>
                    <v-card class="pt-5">
                        <v-card-title  style="justify-content: center;">
                            <p>Do you want to submit?</p>
                        </v-card-title>
                        <v-card-actions class="pb-5" style="justify-content: center;">
                            <!-- <v-spacer></v-spacer> -->
                            <v-btn color="red darken-4" text @click="dialog = false">
                                CLOSE
                            </v-btn>
                            <v-btn color="primary" text @click.prevent="submitForm" :disabled="loading">
                                <div v-if="loading" class="spinner-border spinner-border-sm">
                                </div>
                                <span v-if="loading" class="px-1">Loading...</span>
                                <span v-else>Yes</span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-btn class="white--text" color="red accent-4" width="17%" @click.prevent="dialog = true"
                    :disabled="!isFormValid">Submit</v-btn>
                <!-- <v-btn class="white--text" color="red accent-4" width="17%" @click.prevent="dialog = true">Submit
                </v-btn> -->
            </v-row>
        </v-col>
        <v-snackbar top elevation="0" :timeout="5000" :color="snackbar.color" v-model="snackbar.show" min-height="60"
            class="text-center">
            <span class="white--text font-weight-bold" style="font-size: 15px;"> {{ snackbar.message }} </span>
        </v-snackbar>
    </v-container>
</template>

<script>
import axios from '../helper/axios';
import router from '@/router/router';

export default {
    name: 'RevolvingFundComponent',
    data() {
        return {
            dialog: false,
            checkbox: false,
            isFormValid: true,
            loading: false,
            inputBackGround: 'grey lighten-2',
            snackbar: {
                message: '',
                show: false,
                color: null,
            },
            requestorType: [
                'Branch Manager',
                'Area Manager',
                'Regional Manager',
                'Regional Area Manager',
                'Asst. to Vpo | Coo',
                'Vpo'
            ],
            RequiredRules: {
                type: v => !!v || "Requestor Type is required",
                rfDate: v => !!v || "Date is required",
                requestor: v => !!v || "Requestor is required",
                baseBranch: v => !!v || "Base Branch is required",
                region: v => !!v || "Region is required",
                email: v => !!v || "Email is required",
                period: v => !!v || "Period is required",
                rfAllowance: v => !!v || "RF Allowance is required",
                pendingRf: v => !!v || "Pending RF is required",
                totalExpenses: v => !!v || "Total Expenses is required",
                cashOnHand: v => !!v || "Cash on hand is required",
                transpo: v => !!v || "Transportation is required",
                supplies: v => !!v || "Office Supplies is required",
                meals: v => !!v || "Meals is required",
                others: v => !!v || "Others is required",
                total: v => !!v || "Total Expenses is required",
                purpose: v => !!v || "Purpose is required",
                numOnly: v => (/^[-+]?[0-9]*\.?[0-9]*$/.test(v)) || "Numbers Only",

            },
            InputRules: {
                email: v => /.+@.+\..+/.test(v) || "Email must be valid",
            },
            rfFormData: {
                type: '',
                rfDate: '',
                requestor: '',
                baseBranch: '',
                region: '',
                email: 'jonalyn.mobilla@gmail.com',
                period: '',
                controlNo: '',
                rfAllowance: '',
                pendingRf: '',
                totalExpenses: '',
                cashOnHand: '',
                transpo: '',
                supplies: '',
                meals: '',
                others: '',
                total: '',
                purpose: '',
            }
        }
    },
    created() {
        this.generateControlNo(),
            this.generateDate()
    },
    methods: {
        getData() {
            console.log(this.rfFormData.type);
        },
        generateDate() {
            let dateInstance = new Date();
            let date = dateInstance.getFullYear().toString() + '-' + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + "-" + ("0" + dateInstance.getDate()).slice(-2).toString();
            return this.rfFormData.rfDate = date
        },
        generateControlNo() {
            axios.get('getRfMaxId', {
                headers: {
                    'Accept': 'application/json'
                }
            }).then((res) => {
                // console.log(res.data.id);
                let dateInstance = new Date();
                let date = (dateInstance.getFullYear().toString()).substr(-2) + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + ("0" + dateInstance.getDate()).slice(-2).toString();
                let maxId = (res.data.id + 1).toString().padStart(6, 0)
                console.log(`${date}-01B-${maxId}`);
                this.rfFormData.controlNo = `RF-${date}-${maxId}`
            }).catch(err => {
                console.log(err);
            })
        },
        submitForm() {
            this.loading = true
            axios.post('/rf_request', { data: this.rfFormData },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            ).then(res => {
                console.log(res);
                if (res.status === 200) {
                    setTimeout(() => {
                        // console.log(this.rfFormData);
                        this.loading = false
                        this.dialog = false
                        this.snackbar.show = true;
                        this.snackbar.color = 'success';
                        this.snackbar.message = res.data.message;
                        // this.snackbar.message = 'Request Submitted Successfully';
                        setTimeout(() => {
                            router.push({ name: 'REVOLVING FUND REQUEST RESULTS', params: { obj: this.rfFormData } })
                        }, 2000);
                    }, 3000)
                }

            }).catch(err => {
                console.log(err);
                setTimeout(() => {
                    this.loading = false
                    this.dialog = false
                    this.snackbar.show = true;
                    this.snackbar.color = 'red darken-2';
                    this.snackbar.message = err.response.data.message;

                }, 3000)
            })

        }
    }
}
</script>
<style>
/* .header {
    margin: auto;
} */
/* .v-text-field.v-text-field--enclosed .v-text-field__details {
    margin-bottom: 0px;
} */
.v-input {
    font-size: 14px;
}

.v-btn.v-size--default {
    font-size: 1rem;
}

.title {
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 40px;
    background-color: #cc0404;
    border-radius: 13px 0px 0px;
}

.title .white--text {
    font-size: 23px;
}

.logo {
    padding-right: 0;
    padding-left: 0px;
    margin-top: -10px;
}

.cash-advance--input {
    width: 98%;
}

.cash-advance--input label,
.advance--info p {
    font-weight: 700;
    font-size: 19px;
}

.cash-advance--input p {
    font-weight: 500;
    margin-left: 20px;
}

.cash-advance {
    /* margin-left: 7px; */
    border-top: none;
    border-left: none;
    border-right: none;
}

.mt-0 label,
.flex-column label {
    font-size: 14px;
}

.mt-0 .col-4 {
    max-width: 30%;
}

hr.horizontal--cash-advance {
    width: 97%;
    margin-top: 35px;
    border-top: 1px solid #3f3f3f67;

}
</style>