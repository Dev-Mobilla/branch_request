<template>
    <v-container class="m-auto mb-10 pb-13"
        style="background-color: white;border-radius: 13px; max-width: 65%;margin-top: -150px; ;">
        <v-row justify="space-between" class="header">
            <v-col class="title" cols="8">
                <h4 class="white--text">Cash Advance Request</h4>
            </v-col>
            <v-col cols="4" class="pl-0 pr-2">
                <v-img src="../assets/logo-ml.png" class="logo" max-width="300"></v-img>
            </v-col>
        </v-row>
        <!-- <v-container class="cash-advance--input  ml-3">
            <v-row align="center" class="pt-0 mt-n10">
                <v-col cols="2" class="pr-0">
                    <label for="cash-advance">Cash Advance</label>
                </v-col>
                <v-col cols="6" class="pl-0">
                    <v-text-field dense class="cash-advance"></v-text-field>
                </v-col>
            </v-row>
            <div>
                <p>To be completed by division: Submit to Finance Division for Advance</p>
            </div>
        </v-container> -->
        <v-col class="ml-3 advance--info">
            <p class="font-weight-bold">Advance Information:</p>
        </v-col>
        <v-form ref="data" v-model="isFormValid">
            <v-row class="mx-auto ml-10 mr-10">
                <v-col cols="6">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">ID Number:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense
                                        :rules="[RequiredRules.idNumber, RequiredRules.numOnly]"
                                        v-model="formData.idNumber" readonly
                                        :background-color="formData.idNumber ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Author:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense v-model="formData.author" readonly
                                        :background-color="formData.author ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Job Title:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense v-model="formData.jobTitle" readonly
                                        :background-color="formData.jobTitle ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Branch:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense readonly v-model="formData.branch"
                                        :background-color="formData.branch ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Area:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense readonly v-model="formData.area"
                                        :background-color="formData.area ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Region:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense readonly v-model="formData.region"
                                        :background-color="formData.region ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Email Address:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field outlined dense readonly v-model="formData.email"
                                        :background-color="formData.email ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="6">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Control No:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense readonly v-model="formData.controlNo"
                                        :background-color="formData.controlNo ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Date:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense type="date" :rules="[RequiredRules.date]"
                                        v-model="formData.date" readonly
                                        :background-color="formData.date ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Inclusive Date Of Travel:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense type="date" :rules="[RequiredRules.travelDate]"
                                        v-model="formData.travelDate"
                                        :background-color="formData.travelDate ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Estimated Departure Date:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense type="date" :rules="[RequiredRules.departureDate]"
                                        v-model="formData.departureDate"
                                        :background-color="formData.departureDate ? inputBackGround : ''">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Estimated Arrival Date:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 5px; padding-top: 0px;">
                                    <v-text-field outlined dense type="date" :rules="[RequiredRules.arrivalDate]"
                                        v-model="formData.arrivalDate"
                                        :background-color="formData.arrivalDate ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Amount:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 5px;padding-top: 0px;">
                                    <v-text-field outlined dense :rules="[RequiredRules.amount, RequiredRules.numOnly]"
                                        v-model="formData.amount" type="number"
                                        :background-color="formData.amount ? inputBackGround : ''"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-row class="flex-column mt-1">
                    <v-col id="col-label"><label for="purpose">Purpose:</label></v-col>
                    <v-col style="padding-bottom: 0px; padding-top: 0px;">
                        <v-textarea outlined dense :rules="[RequiredRules.purpose]" v-model="formData.purpose"
                            :background-color="formData.purpose ? inputBackGround : ''">
                        </v-textarea>
                    </v-col>
                </v-row>
            </v-row>
            <v-col>
                <hr class="horizontal--cash-advance">
            </v-col>
            <v-col>
                <v-col>
                    <h3 class="text-center">AUTHORITY TO DEDUCT FROM PAYROLL</h3>
                    <h4 class="text-center">(Unliquidated Cash Advance Full Amount)</h4>
                </v-col>
                <v-col>
                    <v-row class="mr-5 ml-5 mt-2">
                        <v-checkbox id="checkbox" v-model="checkbox"></v-checkbox>
                        <v-col>
                            <label for="checkbox" style="cursor:pointer">This is to Authorized M Lhuillier Financial
                                Services -
                                HRMD Payroll Master to deduct from my salary the following amount of unliquidated
                                cash advance 5 days after completion of the purpose of this cash advance.
                            </label>
                        </v-col>
                    </v-row>
                </v-col>
            </v-col>
            <v-col>
                <v-row justify="end" class="mr-5 ml-5">
                    <v-col cols="5">
                        <v-text-field outlined dense readonly v-model="formData.employeeName"
                            :background-color="formData.employeeName ? inputBackGround : ''"></v-text-field>
                        <label for="">Employee Name</label>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field outlined dense readonly v-model="formData.idNumber"
                            :background-color="formData.idNumber ? inputBackGround : ''">
                        </v-text-field>
                        <label for="">ID Number</label>
                    </v-col>
                </v-row>
            </v-col>
        </v-form>
        <v-col>
            <v-row justify="center" class="mt-8">
                <v-dialog v-model="dialog" width="350" persistent>
                    <v-card class="pt-5">
                        <div class="d-flex" style="justify-content: center;">
                            <v-img src="../assets/diamond.png" max-height="90" max-width="90" class="mt-3"></v-img>
                        </div>
                        <v-card-title style="justify-content: center;">
                            <p style="justify-content: center;">Do you want to submit?</p>
                        </v-card-title>
                        <v-card-actions class="pb-5" style="justify-content: center;">
                            <!-- <v-spacer></v-spacer> -->
                            <v-btn color="red darken-4" text @click="dialog = false" :disabled="loading">
                                CLOSE
                            </v-btn>
                            <v-btn color="primary" text @click="submitForm" :disabled="loading">
                                <div v-if="loading" class="spinner-border spinner-border-sm">
                                </div>
                                <span v-if="loading" class="px-1">Loading...</span>
                                <span v-else>Yes</span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-btn class="white--text" color="red accent-4" width="17%" @click.prevent="dialog = true"
                    :disabled="!isFormValid || !checkbox">Submit</v-btn>
            </v-row>
        </v-col>
        <v-snackbar top elevation="0" :timeout="3500" :color="snackbar.color" v-model="snackbar.show" min-height="60"
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
                            <v-btn color="blue darken-2" class="white--text text-center" tile @click="signin">Sign
                                in
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
import router from '@/router/router';
import axios from '../helper/axios';

export default {
    name: 'CashAdvanceComponent',
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
            RequiredRules: {
                idNumber: v => !!v || "ID Number is required",
                amount: v => !!v || "Amount is required",
                date: v => !!v || "Date is required",
                travelDate: v => !!v || "Inclusive Date Of Travel is required",
                departureDate: v => !!v || "Estimated Departure Date is required",
                arrivalDate: v => !!v || "Estimated Arrival Date is required",
                purpose: v => !!v || "Purpose is required",
                numOnly: v => (/^[-+]?[0-9]*\.?[0-9]*$/.test(v)) || "Numbers Only",
            },
            formData: {
                idNumber: '',
                author: '',
                jobTitle: '',
                branch: '',
                area: '',
                region: '',
                amount: '',
                controlNo: '',
                date: '',
                travelDate: '',
                departureDate: '',
                arrivalDate: '',
                email: '',
                purpose: '',
                employeeName: ''
            },
            token: this.$route.query.token,
            isLoggedIn: localStorage.getItem('token')
        }

    },
    created() {
        this.generateControlNo()
        this.closeDialogIfLoggedIn()
        this.generateDate()
        if (this.token) {
            this.encryptedUser()
        }
    },

    computed: {

    },
    methods: {
        // signInGoogle() {
        //     window.location.href = 'http://10.4.8.168:3000/auth/google/signin/cash-advance'
        // },
        signin() {
            axios.get('/signin/cash-advance', {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": 'application/json'
                }
            }).then(res => {
                console.log(res.data);
                window.location.href = res.data
            }).catch(err => {
                // console.log(err);
                this.snackbar = {
                    show: true,
                    color: 'red darken-2',
                    message: err.message,
                }
            })
        },
        generateControlNo() {
            axios.get('/getMaxId', {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": 'application/json'
                }
            }).then((res) => {
                let dateInstance = new Date();
                let date = (dateInstance.getFullYear().toString()).substr(-2) + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + ("0" + dateInstance.getDate()).slice(-2).toString();
                let maxId = (res.data.id + 1).toString().padStart(6, 0)
                // console.log(this.formData.controlNo);
                return this.formData.controlNo = `CA-${date}-${maxId}`
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
            return this.formData.date = date
        },
        closeDialogIfLoggedIn() {
            if (localStorage.getItem('token')) {
                this.dialog_signin = false
                this.overlay = false
                let storeGetter = this.$store.getters.getUser;

                this.formData.idNumber = storeGetter.resourceId
                this.formData.author = storeGetter.fullname
                this.formData.jobTitle = storeGetter.jobTitle
                this.formData.branch = storeGetter.branch
                this.formData.area = storeGetter.area
                this.formData.region = storeGetter.region
                this.formData.email = storeGetter.email
                this.formData.employeeName = storeGetter.fullname

            } else {
                this.dialog_signin = true
                this.overlay = true
            }
        },
        async encryptedUser() {
            this.overlayLogin = true
            localStorage.setItem('success', JSON.stringify(false))
            const response = await this.$store.dispatch('getUser', { user: this.$route.query.user, token: this.$route.query.token });
          
            if (response.status == 200) {
                if (response.data.rows.length == 0) {
                    this.snackbar = {
                        show: true,
                        color: 'red darken-2',
                        message: response.data.message,
                    }
                } else {
                    this.dialog_signin = false
                    this.overlay = false
                    if (this.$store.getters.auth) {
                        setTimeout(() => {
                            this.overlayLogin = false
                        }, 2500);
                        setTimeout(() => {
                            this.formData.idNumber = response.data.rows.resourceId;
                            this.formData.author = response.data.rows.fullname;
                            this.formData.jobTitle = response.data.rows.jobTitle;
                            this.formData.branch = response.data.rows.branch;
                            this.formData.area = response.data.rows.area;
                            this.formData.region = response.data.rows.region;
                            this.formData.email = response.data.rows.email;
                            this.formData.employeeName = response.data.rows.fullname;

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
            axios.post('/request', { data: this.formData },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": 'application/json'
                    }
                }
            ).then((res) => {
                console.log(res);
                if (res.status == 200) {
                    setTimeout(() => {
                        this.loading = false
                        this.dialog = false
                        this.snackbar.show = true;
                        this.snackbar.color = 'success';
                        this.snackbar.message = res.data.message;
                        setTimeout(() => {
                            localStorage.setItem('success', JSON.stringify(true))
                            router.push({ name: 'CASH ADVANCE REQUEST RESULTS', params: { obj: this.formData } })
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

        },
        // getDataById() {
        //     if (this.formData.idNumber) {
        //         axios.post('/getUserById', { idNumber: this.formData.idNumber }, {
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Accept": 'application/json'
        //             }
        //         }).then((res) => {
        //             if (res.data.rows.length != 0) {
        //                 console.log(res.data.rows);
        //                 this.formData.author = res.data.rows[0].fullname;
        //                 this.formData.jobTitle = res.data.rows[0].jobTitle;
        //                 this.formData.branch = res.data.rows[0].branch;
        //                 this.formData.area = res.data.rows[0].area;
        //                 this.formData.region = res.data.rows[0].region;
        //                 this.formData.email = res.data.rows[0].email;
        //                 this.formData.employeeName = res.data.rows[0].fullname;

        //                 this.inputBackGround = 'grey lighten-2';

        //             } else {
        //                 setTimeout(() => {
        //                     this.snackbar = {
        //                         show: true,
        //                         color: 'red darken-2',
        //                         message: res.data.message,
        //                     }
        //                 }, 300);
        //                 this.formData.author = '';
        //                 this.formData.jobTitle = '';
        //                 this.formData.branch = '';
        //                 this.formData.area = '';
        //                 this.formData.region = '';
        //                 this.formData.email = '';
        //                 this.formData.employeeName = '';

        //             }
        //         }).catch(err => {
        //             this.snackbar.show = true;
        //             this.snackbar.color = 'red darken-2';
        //             this.snackbar.message = err.message;
        //         })
        //     }
        // },
    }
}
</script>
<style>
/* .header {
    margin: auto;
} */
.theme--light.v-input input {
    font-size: 13px;
}

.v-text-field.v-text-field--enclosed .v-text-field__details {
    margin-bottom: 5px;
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

.mt-0 .col-4,
#col-label {
    max-width: 24%;
}

hr.horizontal--cash-advance {
    width: 97%;
    margin-top: 35px;
    border-top: 1px solid #3f3f3f67;

}
</style>