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
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-select :items="requestorType" dense outlined v-model="rfFormData.type"
                                        :background-color="rfFormData.type ? inputBackGround : ''"
                                        :rules="[RequiredRules.type]"></v-select>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Date:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.rfDate]"
                                        v-model="rfFormData.rfDate" type="date"
                                        :background-color="rfFormData.rfDate ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Requestor:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.requestor]"
                                        v-model="rfFormData.requestor"
                                        :background-color="rfFormData.requestor ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Base Branch:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.baseBranch]"
                                        v-model="rfFormData.baseBranch" placeholder="ex. ML LANGIHAN"
                                        :background-color="rfFormData.baseBranch ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Region:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.region]"
                                        v-model="rfFormData.region" placeholder="ex. CEBU NORTH A"
                                        :background-color="rfFormData.region ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Email Address:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.email, InputRules.email]"
                                        v-model="rfFormData.email"
                                        :background-color="rfFormData.email ? inputBackGround : ''">
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
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense readonly v-model="rfFormData.controlNo"
                                        :background-color="rfFormData.controlNo ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Period:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.period]"
                                        v-model="rfFormData.period"
                                        :background-color="rfFormData.period ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">RF Allowance:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense
                                        :rules="[RequiredRules.rfAllowance, RequiredRules.numOnly]"
                                        v-model="rfFormData.rfAllowance"
                                        :background-color="rfFormData.rfAllowance ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Pending RF:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.pendingRf]"
                                        v-model="rfFormData.pendingRf"
                                        :background-color="rfFormData.pendingRf ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Total Expenses:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense
                                        :rules="[RequiredRules.totalExpenses, RequiredRules.numOnly]"
                                        v-model="rfFormData.totalExpenses"
                                        :background-color="rfFormData.totalExpenses ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Cash on hand:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
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
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.transpo, RequiredRules.numOnly]"
                                        v-model="rfFormData.transpo"
                                        :background-color="rfFormData.transpo ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Office Supplies:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.supplies, RequiredRules.numOnly]"
                                        v-model="rfFormData.supplies"
                                        :background-color="rfFormData.supplies ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Meals:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.meals, RequiredRules.numOnly]" v-model="rfFormData.meals"
                                        :background-color="rfFormData.meals ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Others:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field style="direction:rtl;" outlined dense
                                        :rules="[RequiredRules.others, RequiredRules.numOnly]"
                                        v-model="rfFormData.others"
                                        :background-color="rfFormData.others ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Total Expenses:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
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
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
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
                        <div class="d-flex" style="justify-content: center;">
                            <v-img src="../assets/diamond.png" max-height="90" max-width="90" class="mt-3"></v-img>
                        </div>
                        <v-card-title style="justify-content: center;">
                            <p>Do you want to submit?</p>
                        </v-card-title>
                        <v-card-actions class="pb-5" style="justify-content: center;">
                            <!-- <v-spacer></v-spacer> -->
                            <v-btn color="red darken-4" text @click="dialog = false" :disabled="loading">
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
        <v-overlay :z-index="zIndex" :value="overlay" :opacity="0.47">
            <v-dialog :value="dialog_signin" persistent width="350">
                <v-card max-width="350" height="350">
                    <div class="d-flex" style="justify-content: center;">
                        <v-img src="../assets/diamond.png" max-height="100" max-width="100" class="mt-5"></v-img>
                    </div>
                    <v-card-title style="justify-content: center;" class="mt-n3">
                        <p
                            style="color:#757575;font-family: Verdana, Geneva, Tahoma, sans-serif;font-size: 25px;font-weight: 500;">
                            Cash Request
                        </p>
                    </v-card-title>
                    <v-card-text class="text-center mt-2">
                        <p style="font-size: 15px; color: #616161;">Sign in to complete Cash Request Form</p>
                    </v-card-text>
                    <v-card-actions style="justify-content: center;flex-direction: column;" class="mt-n6">
                        <div>
                            <v-btn color="blue darken-2" class="white--text text-center" tile @click="signin">Sign in
                            </v-btn>
                        </div>
                        <div class="mt-5">
                            <v-btn text style="font-size: 12px;" color="grey darken-2" plain to="/">Back to home</v-btn>
                        </div>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-overlay>
        <v-overlay :value="overlayLogin">
            <v-progress-circular indeterminate color="white" size="95" width="6" style="margin-right:5px">
                <v-img src="../assets/diamond.png" max-height="75" max-width="75"></v-img>
            </v-progress-circular>
        </v-overlay>
    </v-container>
</template>

<script>
import axios from '../helper/axios';
import router from '@/router/router';

export default {
    name: 'RevolvingFundComponent',
    data() {
        return {
            dialog_signin: true,
            overlay: true,
            overlayLogin: false,
            zIndex: 0,
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
                email: '',
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
            },
            token: this.$route.query.token,
            isLoggedIn: localStorage.getItem('token')
        }
    },
    created() {
        this.generateControlNo(),
            this.closeDialogIfLoggedIn()
        this.generateDate()
        if (this.token) {
            this.encryptedUser()
        }
    },
    methods: {
        // signInGoogle() {
        //     window.location.href = 'http://127.0.0.1:3000/auth/google/signin/revolving-fund'
        // },
        signin(){
            axios.get('/signin/revolving-fund', {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": 'application/json'
                }
            }).then(res => {
                window.location.href = res.data
            }).catch(err => {
                this.snackbar = {
                    show: true,
                    color: 'red darken-2',
                    message: err.message,
                }
            })
        },
        generateDate() {
            let dateInstance = new Date();
            let date = dateInstance.getFullYear().toString() + '-' + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + "-" + ("0" + dateInstance.getDate()).slice(-2).toString();
            return this.rfFormData.rfDate = date
        },
        generateControlNo() {
            axios.get('/getRfMaxId', {
                headers: {
                    'Accept': 'application/json'
                }
            }).then((res) => {
                console.log(res);
                let dateInstance = new Date();
                let date = (dateInstance.getFullYear().toString()).substr(-2) + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + ("0" + dateInstance.getDate()).slice(-2).toString();
                let maxId = (res.data.id + 1).toString().padStart(6, 0)
                console.log(`${date}-01B-${maxId}`);
                return this.rfFormData.controlNo = `RF-${date}-${maxId}`
            }).catch(err => {
                this.snackbar = {
                    show: true,
                    color: 'red darken-2',
                    message: err.response.data.message
                }
            })
        },
        closeDialogIfLoggedIn() {
            if (localStorage.getItem('token')) {
                this.dialog_signin = false
                this.overlay = false
                let storeGetter = this.$store.getters.getUser;
                
                this.rfFormData.baseBranch = storeGetter.branch
                this.rfFormData.region =  storeGetter.region
                this.rfFormData.email = storeGetter.email

            } else {
                this.dialog_signin = true
                this.overlay = true
            }
        },
        async encryptedUser() {
            this.overlayLogin = true
            localStorage.setItem('success', JSON.stringify(false))
            const response = await this.$store.dispatch('getUser', { user: this.$route.query.user, token: this.$route.query.token });

            if (response.data.statusCode == 200) {
                if (response.data.rows.length == 0) {
                    this.snackbar = {
                        show: true,
                        color: 'red darken-2',
                        message: response.data.message,
                    }
                }else{

                    this.dialog_signin = false
                    this.overlay = false
                    if (this.$store.getters.auth) {
                        setTimeout(() => {
                            this.overlayLogin = false
                        }, 2500);
                        setTimeout(() => {
                            this.rfFormData.baseBranch = response.data.rows.branch;
                            this.rfFormData.region = response.data.rows.region;
                            this.rfFormData.email = response.data.rows.email;
    
                        }, 3000);
    
                    }
                }
            } else {
                this.snackbar = {
                    show: true,
                    color: 'red darken-2',
                    message: response.data.message,
                }
            }
            return response
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
                if (res.status === 200) {
                    setTimeout(() => {
                        this.loading = false
                        this.dialog = false
                        this.snackbar.show = true;
                        this.snackbar.color = 'success';
                        this.snackbar.message = res.data.message;
                        setTimeout(() => {
                            localStorage.setItem('success', JSON.stringify(true))
                            router.push({ name: 'REVOLVING FUND REQUEST RESULTS', params: { obj: this.rfFormData } })
                        }, 2000);
                    }, 3000)
                }

            }).catch(err => {
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