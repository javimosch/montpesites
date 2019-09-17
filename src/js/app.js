import 'core-js/stable'
import 'regenerator-runtime/runtime'

// import Vue from 'vue/dist/vue.js'
// import VueRouter from 'vue-router'
// import Vuex from 'vuex'

import Home from './containers/Home.vue'
import Editor from './containers/Editor.vue'
import Header from './components/Header.vue'
import Profile from './containers/Profile.vue'
import AccountHeader from './components/AccountHeader.vue'

import './styles/main.scss'

// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// Vue.config.productionTip = false
// library.add(faUserSecret)
// Vue.component('font-awesome-icon', FontAwesomeIcon)

import store from './store'

Vue.use(VueRouter)
Vue.use(Vuex)

const routes = [
    { path: '/home', component: Editor, name: 'home' },
    { path: '/profile', component: Profile, name: 'profile' },
    {
        path: '*',
        component: {
            mounted() {
                console.log('ROOT, GOING TO HOME')
                setTimeout(() => {
                    this.$router.push({ name: 'home' })
                }, 2000)
            }
        }
    }
]

const router = new VueRouter({
    routes
})

new Vue({
    el: '.app',
    components: {
        'vue-header': Header,
        'vue-account-header': AccountHeader
    },
    router,
    store
})