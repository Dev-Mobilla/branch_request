import Vue from "vue";
import VueRouter from 'vue-router';

import MainComponent from '../views/Main.vue';
import MenuComponent from '../components/MenuComponent.vue';
import CashAdvanceComponent from '../components/CashAdvanceComponent.vue';
import RevolvingFundComponent from '../components/RevolvingFundComponent.vue';
import CA_successComponent from '../components/CA_successComponent.vue';
import RF_successComponent from '../components/RF_successComponent.vue';
import AlertComponent from '../components/Alert.vue';
import NotifComponent from '../components/Notif.vue';
import CommentComponent from '../components/Comment.vue';
import NotFoundComponent from '../components/NotFound.vue';

Vue.use(VueRouter);

const routes = [
    {
        path:'/',
        // name:'Main',
        component:MainComponent,
        children:[
            {
                path:'/',
                name:'BRANCH REQUEST',
                component: MenuComponent
            },
            {
                path:'cash-advance',
                name:'CASH ADVANCE',
                component: CashAdvanceComponent
            },
            {
                path:'revolving-fund',
                name:'REVOLVING FUND REQUEST',
                component: RevolvingFundComponent
            },
            {
                path:'ca_success',
                name:'CASH ADVANCE REQUEST RESULTS',
                component: CA_successComponent,
                props: true
            },
            {
                path:'rf_success',
                name:'REVOLVING FUND REQUEST RESULTS',
                component: RF_successComponent,
                props: true
            },
        ]  
    },
    {
        path:'/alert/:controlNo',
        name: 'Alert',
        component: AlertComponent,
        beforeEnter:(to, from, next) => {
            if (to.params.controlNo.match('CA-') || to.params.controlNo.match('RF-')) {
                next();
            } else {
                next({name:'Not Found'});
            }
        }
    },
    {
        path:'/response/:controlNo',
        name:'Notif',
        component: NotifComponent,
        beforeEnter:(to, from, next) => {
            if (to.params.controlNo.match('CA-') || to.params.controlNo.match('RF-')) {
                next();
            } else {
                next({name:'Not Found'});
            }
        }
    },
    {
        path:'/alert-comment/:controlNo',
        name:'Comment',
        component: CommentComponent,
        beforeEnter:(to, from, next) => {
            if (to.params.controlNo.match('CA-') || to.params.controlNo.match('RF-')) {
                next();
            } else {
                next({name:'Not Found'});
            }
        }
    },
    {
        path:'*',
        name:'Not Found',
        component: NotFoundComponent
    }
    
];

const router = new VueRouter({
    mode:"history",
    base:process.env.BASE_URL,
    routes
})

export default router