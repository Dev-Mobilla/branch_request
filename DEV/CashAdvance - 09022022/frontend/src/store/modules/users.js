import axios from "@/helper/axios";
import CryptoJs from 'crypto-js';


const state = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {},
    token: localStorage.getItem('token') ? localStorage.getItem('token') : 0,
}

const getters = {
    getUser: state => state.user,
    auth: state => state.token,
    errorGetter: () => {
        throw new Error('Error from getter!')
    }
}

const mutations = {
    setToken: (state, token) => (state.token = token),
    setUser: (state, user) => (state.user = user),
}

const actions = {
    async getUser({ commit }, payload) {

        const decData = CryptoJs.enc.Base64.parse(payload.user).toString(CryptoJs.enc.Utf8);

        const bytes = CryptoJs.AES.decrypt(decData, 'SECRET').toString(CryptoJs.enc.Utf8);

        const decryptedUser = JSON.parse(bytes);
        console.log('decrypted', decryptedUser);

        const response = await axios.post('/getUserByEmail', { email: decryptedUser.email }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": 'application/json'
            }
        })

        if (response.data.rows.length == 0) {
            return response
        }
        else{
            commit('setUser', response.data.rows);
            commit('setToken', payload.token)
            localStorage.setItem('token', JSON.stringify(payload.token));
            localStorage.setItem('user',JSON.stringify(response.data.rows))
            return response;
        }


    },
    async userLogout({ commit }, token) {


        const decToken = CryptoJs.enc.Base64.parse(token).toString(CryptoJs.enc.Utf8);

        const bytes = CryptoJs.AES.decrypt(decToken, 'SECRET').toString(CryptoJs.enc.Utf8);

        const decryptedToken = bytes;

        const response = await axios.get(`/logout?token=${decryptedToken}`, {
            headers: {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": 'application/json'
                }
            }
        })

        commit('setToken', null);
        commit('setUser', {});
        localStorage.removeItem('token');
        localStorage.removeItem('user')

        return response;
    },
    // async getAccessToken({commit}){
    //     const response = await axios.get('/getToken', {
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Accept": 'application/json'
    //         }
    //     })
        
    //     return response;
    // }
}

export default {
    state,
    getters,
    mutations,
    actions
}