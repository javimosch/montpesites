import api from '../../api'
// initial state
// shape: [{ id, quantity }]
const state = {
    project: {
        isSelected: false,
        folderName: '',
        pages: []
    }
}
var _defaultState = Object.assign({}, state)
var defaultState = () => Object.assign(_defaultState, state)

// getters
const getters = {
    isSelected(state, getters, nothing = {}) {
        return state.project.isSelected
    },
    getSelected: (state, getters, rootState) => {
        return state.project
    }
}

// actions
const actions = {
    async setSelectedByProjectFolderName({ commit, state }, name) {
        let project = await api('getProjectByFolderName', name)
        commit('setSelected', project)
    },
    async unselectProject({ commit, state }, nothing = {}) {
        commit('unselectProject')
    }
}

// mutations
const mutations = {
    setSelected(state, project) {
        state.project = {
            ...state.project,
            ...project,
            isSelected: true
        }
    },
    unselectProject(state, nothing = {}) {
        state.project = {
            ...state.project,
            isSelected: false
        }
    }
}

export default {
    namespaced: false,
    state,
    getters,
    actions,
    mutations
}