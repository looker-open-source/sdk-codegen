import { applyMiddleware, createStore } from 'redux'
import { registerProjectsSagas as projectsSagaCallbacks } from './sagas'
import { projectsReducer } from './reducer'
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga'

const sagaMiddleware: SagaMiddleware = createSagaMiddleware()

const registerSagas = (callbacks: any[]) => {
  callbacks.forEach((callback) => sagaMiddleware.run(callback))
}

export const configureStore = () => {
  const store: any = createStore(
    projectsReducer,
    applyMiddleware(sagaMiddleware)
  )
  registerSagas([projectsSagaCallbacks])
  return store
}
