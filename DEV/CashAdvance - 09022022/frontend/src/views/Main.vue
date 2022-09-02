<template>
    <v-row style="margin: 0px;">
        <v-container fluid style="height: 60vh;" class="pb-15 container--back">
            <!-- <v-btn text plain color="white" class="mt-3" to="/" v-if="!$route.name === 'BRANCH REQUEST'">&#8592; return to home page</v-btn> -->
            <div class="d-flex" style="justify-content:space-between ;">
                <v-btn text plain color="white" class="mt-3" to="/" v-if="returnToHome">&#8592; return to home page
                </v-btn>
                <v-btn text plain color="white" class="mt-3" v-if="returnToHome" @click="logout">logout &#8594;</v-btn>
            </div>
            <div class="mt-10 mb-15">
                <v-col>
                    <hr class="horizontal">
                </v-col>
                <v-col class="mt-2 mb-5">
                    <p class="text-center white--text" style="font-size:55px;font-weight: 600;">{{ $route.name }}</p>
                </v-col>
            </div>
        </v-container>
        <v-overlay :value="overlay">
            <v-progress-circular indeterminate color="white" size="95" width="6" style="margin-right:5px">
                <v-img src="../assets/diamond.png" max-height="75" max-width="75"></v-img>
            </v-progress-circular>
        </v-overlay>
        <v-spacer></v-spacer>
        <router-view></router-view>
        <v-snackbar top elevation="0" :timeout="3500" :color="snackbar.color" v-model="snackbar.show" min-height="60"
            class="text-center">
            <span class="white--text font-weight-bold" style="font-size: 15px;"> {{ snackbar.message }} </span>
        </v-snackbar>
    </v-row>
</template>
<script>

export default {
    name: "MainView",
    data() {
        return {
            overlay: false,
            snackbar: {
                message: '',
                show: false,
                color: null,

            },
        }
    },
    created() {
        localStorage.setItem('success', JSON.stringify(false));
        // this.getAccessToken()
    },
    computed: {
        returnToHome() {
            return this.$route.path === '/' ? false : true
        }
    },
    methods: {
        // async getAccessToken(){
        //     const response = await this.$store.dispatch('getAccessToken');

        //     if (response.data.access_token) {
        //         console.log(response.data.access_token);
        //     } else {
        //         console.log(response.data.message);
        //     }
        //     return response
        // },
        async logout() {
            this.overlay = true
            const response = await this.$store.dispatch('userLogout', this.$store.getters.auth);
            console.log(response);
            if (response.status === 200) {
                setTimeout(() => {
                    this.overlay = false
                }, 2500);
                setTimeout(() => {
                    this.snackbar.show = true;
                    this.snackbar.color = 'success';
                    this.snackbar.message = response.data.message;
                    this.$router.push({ path: '/' })
                }, 3000);
            } else {
                setTimeout(() => {
                    this.overlay = false
                }, 2500);
                this.snackbar = {
                    show: true,
                    color: 'red darken-2',
                    message: response.data.message,
                }
                this.$router.push({ path: '/cash-advance' })
            }
        }
    }
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
    /* background: linear-gradient(rgba(0, 0, 0, 0.568), rgba(0, 0, 0, 0.616)), url('../assets/background.png'); */
}
</style>