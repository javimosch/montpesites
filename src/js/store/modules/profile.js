// initial state
// shape: [{ id, quantity }]
const state = {
    username: '',
    repoUrl: ''
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
    }
}

// mutations
const mutations = {
    assign(state, newState) {
        Object.assign(state, newState)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}