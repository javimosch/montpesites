// initial state
// shape: [{ id, quantity }]
const state = {
    username: '',
    repoUrl: '',
    project: {
        name: '',
        repoUrl: ''
    }
}

// getters
const getters = {
    username: (state, getters, rootState) => {
        return state.username
    }
}

// actions
const actions = {
    assignProfile({ commit, state }, newState) {
        commit('assign', newState)
    },
    setProject({ commit, state }, pr) {
        commit(`setProject`, pr)
    },
    isProjectDataOK() {
        return state.project.name && state.project.repoUrl
    }
}

// mutations
const mutations = {
    assign(state, newState) {
        Object.assign(state, newState)
    },
    setProject(state, pr) {
        Object.assign(state.project, pr)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}