const loadLocalSession = {
    data() {},
    methods: {
        hasValidSession() {
            let p = this.$store.state.profile
            return !!p.username && !!p.repoUrl
        },
        async loadLocalSession() {
            let profile = window.localStorage.getItem('user') || null
            if (profile) {
                profile = JSON.parse(atob(profile))
                await this.$store.dispatch('profile/assignProfile', profile)
                console.log({
                    profile
                })
            }
        }
    },
    async created() {
        await this.loadLocalSession()
    }
}
export default loadLocalSession