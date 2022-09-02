<template>
    <v-container class="m-auto d-flex"
        style="background-color: #0000008f;border-radius: 13px; max-width: 65%;margin-top: -150px; height: 60vh;">
        <v-row justify="space-around" align="center" style="margin: 0 auto;">
            <v-card width="40%" height="65%" to="cash-advance"
                style="cursor: pointer;display: flex;align-items:center;justify-content: center;flex-direction: column;">
                <div>
                    <v-img src="../assets/cash-advance.webp" max-width="130"></v-img>
                </div>
                <p style="font-size: 35px;font-weight: 600;">
                    CASH ADVANCE
                </p>
            </v-card>
            <v-card width="40%" height="65%" to="revolving-fund"
                style="cursor: pointer;display: flex;align-items:center;justify-content: center;flex-direction: column;">
                <div>
                    <v-img src="../assets/revolving-fund.webp" max-width="130"></v-img>
                </div>
                <p style="font-size: 35px;font-weight: 600;">
                    REVOLVING FUND
                </p>
            </v-card>
        </v-row>
    </v-container>
</template>
<script>
export default {
    name:'MenuComponent',
    methods:{
        
    }

}
</script>
<style>

</style>