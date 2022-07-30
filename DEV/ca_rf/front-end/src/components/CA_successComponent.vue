<template>
    <v-container class="m-auto mb-10 pb-13"
        style="background-color: white;border-radius: 13px; max-width: 65%;margin-top: -150px; ;">
        <v-row justify="space-between" class="header">
            <v-col class="title" cols="8">
                <h4 class="white--text">Cash Advance Request</h4>
            </v-col>
            <v-col cols="4" class="pl-0 pr-2">
                <v-img src="../assets/mlhuillier-logo.jpg" class="logo" max-width="300"></v-img>
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
        <v-form>
            <v-row class="mx-auto ml-10 mr-10">
                <v-col cols="6">
                    <v-row>
                        <v-col style="padding:0px">
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">ID Number:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.idNumber"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Author:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.author"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Job Title:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.jobTitle"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Branch:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.branch"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="4"><label for="">Area:</label></v-col>
                                <v-col cols="7" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.area">
                                    </v-text-field>
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
                                <v-col cols="7" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.email"></v-text-field>
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
                                <v-col cols="6" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.controlNo"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Date:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.date"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Inclusive Date Of Travel:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.travelDate"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Estimated Departure Date:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.departureDate"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Estimated Arrival Date:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 0px; padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.arrivalDate"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row align="baseline" class="mt-0">
                                <v-col cols="6"><label for="">Amount:</label></v-col>
                                <v-col cols="6" style="padding-bottom: 0px;padding-top: 0px;">
                                    <v-text-field dense readonly v-model="data.amount"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-row class="mt-1">
                    <v-col cols="2"><label for="purpose">Purpose:</label></v-col>
                    <v-col style="padding-bottom: 0px; padding-top: 0px;">
                        <v-text-field readonly v-model="data.purpose">
                        </v-text-field>
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
                        <v-col>
                            <label>This is to Authorized M Lhuillier Financial
                                Services -
                                HRMD Payroll Master to deduct from my salary the following amount of unliquidated
                                cash advance 5 days after completion of the purpose of this cash advance.</label>
                        </v-col>
                    </v-row>
                </v-col>
            </v-col>
            <v-col>
                <v-row justify="end" class="mr-5 ml-5">
                    <v-col cols="5">
                        <v-text-field dense readonly v-model="data.author"></v-text-field>
                        <label>Employee Name</label>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field dense readonly v-model="data.idNumber">
                        </v-text-field>
                        <label>ID Number</label>
                    </v-col>
                </v-row>
            </v-col>
        </v-form>
    </v-container>
</template>
<script>
export default {
    name: 'CA_successComponent',
    data() {
        return {
            data: {
                idNumber: '',
                author: '',
                jobTitle: '',
                branch: '',
                area: '',
                region: '',
                email: '',
                controlNo: '',
                date: '',
                travelDate: '',
                departureDate: '',
                arrivalDate: '',
                amount: '',
                purpose: ''
            }
        }
    },
    created() {
        console.log(this.$route.params.obj);
        this.data = {
            idNumber: this.$route.params.obj.idNumber ,
            author: this.$route.params.obj.author,
            jobTitle: this.$route.params.obj.jobTitle,
            branch:  this.$route.params.obj.branch,
            area:  this.$route.params.obj.area,
            region: this.$route.params.obj.region,
            email:  this.$route.params.obj.email,
            controlNo:  this.$route.params.obj.controlNo,
            date:  this.$route.params.obj.date,
            travelDate:  this.$route.params.obj.travelDate,
            departureDate:  this.$route.params.obj.departureDate,
            arrivalDate:  this.$route.params.obj.arrivalDate,
            amount:  this.$route.params.obj.amount,
            purpose:  this.$route.params.obj.purpose
        }
    }
}
</script>
<style>
.mt-1 .col-2{
    max-width: 15%;
}
</style>