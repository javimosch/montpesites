import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer, hot, setConfig } from 'react-hot-loader'
import RootContainer from './containers/rootContainer'

setConfig({
  showReactDomPatchNotification: false
})

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  )
}

render(RootContainer)

if (module.hot) {
  module.hot.accept('./containers/rootContainer', () => {
    render(RootContainer)
  })
}
