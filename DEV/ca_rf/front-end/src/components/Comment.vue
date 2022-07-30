<template>
    <v-container>
        <v-card width="60%" class="mx-auto pb-3 mt-10" style="border-left: 13px solid red;border-radius:6px 6px 0px 0px">
            <div class="ml-5 pt-5 mb-3 mr-5">
                <p style="font-size: 26px;font-weight: 500;">
                    Your response has not been recorded.
                </p>
                <p style="color: #616161;font-size: 17px;">
                    We need your feedback for <span style="font-weight: 500;color:#B71C1C">Disapproving</span> the Request.
                </p>
                <p style="color: #616161;font-size: 17px;">
                    Please provide a comment for the Request with Control No. 
                    <span style="font-weight: 600;color:#B71C1C">{{controlNo}}</span>
                    that has been emailed to you.
                </p>
                <p style="color: #616161;font-size: 17px;">Thank you.</p>
            </div>
        </v-card>
        <div class="mx-auto text-center mt-8">
            <p style="color:#757575;">M Lhuillier Technology Group &copy; {{ year }}</p>
            <p style="color:#757575;">Branch Request</p>
        </div>
    </v-container>
</template>

<script>
export default {
    name: 'CommentComponent',
    data() {
        return {
            year: new Date().getFullYear(),
            controlNo:'',
        }
    },
    created(){
        this.controlNo = this.$route.params.controlNo;
    }
}
</script>