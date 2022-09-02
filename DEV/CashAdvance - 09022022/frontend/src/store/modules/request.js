import axios from "@/helper/axios";

// const state = {
//     user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {},
//     token: localStorage.getItem('auth') ? localStorage.getItem('auth') : 0
// }

// const getters = {
//     // getUser: state => state.user,
//     // auth: state => state.token
// }

// const mutations = {
//     setToken: (state, token) => (state.token = token),
//     setUser: (state, user) => (state.user = user)
// }

const actions = {
    
    getMaxId() {
        const response = axios.get('/getMaxId', {
            headers: {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": 'application/json'
                }
            }
        })

        return response;
    }
}

export default {
    // state,
    // getters,
    // mutations,
    actions
}