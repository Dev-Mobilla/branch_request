<template>
    <v-row style="margin: 0px;">
        <v-container fluid style="height: 60vh;" class="pb-15 container--back">
            <div class="mt-10 mb-15">
                <v-col>
                    <hr class="horizontal">
                </v-col>
                <v-col class="mt-5 mb-5">
                    <p class="text-center white--text" style="font-size:55px;font-weight: 600;">{{ $route.name }}</p>
                </v-col>
            </div>
        </v-container>
        <router-view></router-view>
    </v-row>
</template>
<script>
export default {
    name: "MainView",
    data() {
        return {

        }
    },
}
</script>

<style>
hr.horizontal {
    width: 75%;
    margin: auto;
    border-top: 2px solid #ebe9e9;
    /* border-top: 2px solid #0000008f; */
}

.container--back {
    /* background-image: url('../assets/ml-building.jpg'); */
    background: linear-gradient(rgba(0, 0, 0, 0.568), rgba(0, 0, 0, 0.616)), url('../assets/ml-building.jpg');
    background-size: cover;
}
</style>