<template>
    <v-container>
        <v-card width="55%" class="mx-auto pb-3 mt-10" style="border-left: 13px solid red;border-radius:6px 6px 0px 0px">
            <div class="ml-5 mb-3 pt-5">
                <p style="font-size: 30px;font-weight: 500;">
                    You've already responded
                </p>
                <p style="color: #616161;">
                    You can only respond once.
                </p>
                <p style="color: #616161;">Please contact Admin if you think this is wrong.</p>
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
    name: 'AlertComponent',
    data() {
        return {
            year: new Date().getFullYear(),
        }
    }
}
</script>