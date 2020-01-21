import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Home from './containers/Home.vue'
import TopHeader from './components/Header.vue'
/* import Editor from './containers/Editor.vue'
import Project from './containers/Project.vue'

import Profile from './containers/Profile.vue'
import AccountHeader from './components/AccountHeader.vue'
*/
import './styles/main.scss'
import store from './store'

Vue.use(VueRouter)
Vue.use(Vuex)

const routes = [
    { path: '/home', component: Home, name: 'home' }
    /*
            { path: '/editor', component: Editor, name: 'editor' },
            { path: '/project/:name', component: Project, name: 'project' },
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
            } */
]

const router = new VueRouter({
    routes
})

new Vue({
    el: '.app',
    components: {
        TopHeader
    },
    router,
    store: new Vuex.Store(store),
    async created() {}
})