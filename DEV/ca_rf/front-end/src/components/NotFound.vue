<template>
    <v-container class="mx-auto mt-10">
        <p class="text-center" style="font-size: 80px;font-weight:800;color: #B71C1C;">
            Oops!
        </p>
        <p class="text-center" style="font-size: 30px;font-weight:800;color: #D32F2F">
            404 - Page Not Found
        </p>
        <p class="text-center" style="font-size: 20px;font-weight:500;color:#757575;">
            Looks like the page you're trying to access doesn't exist.
        </p>
        <div style="width:14%" class="mx-auto mt-7">
            <v-btn to="/" color="red darken-3" class="white--text pt-5 pb-5" block style="font-size: 18px;">
                Home
            </v-btn>
        </div>
        <div class="mt-10"> 
            <v-col class="text-center" cols="12">
                <span style="color:#757575;font-family:Verdana, Geneva, Tahoma, sans-serif;">M Lhuillier Technology Group {{ new Date().getFullYear() }}</span>
                <p style="padding-top: 3px;color:#757575;font-family:Verdana, Geneva, Tahoma, sans-serif;">Branch Request</p>
            </v-col>
        </div>
    </v-container>
</template>

<script>
export default {
    name: 'CommentComponent',

}
</script>
<style>
.paragraph-text {
    font-size: 18px;
}
</style>