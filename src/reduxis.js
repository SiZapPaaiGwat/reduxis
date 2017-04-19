import _ from 'lodash'
import {
  prepareActionName, getStartAction, getErrorAction,
  getStartStateName, getErrorStateName, getSelectedStateName
} from './utils'

let handlers = []
let placeholderInitialState = {}

function rebuildReducer (handlers, initialState) {
  return (state, action) => {
    let defaultState = state || {...initialState}
    // thunk
    if (!action.type) {
      return defaultState
    }

    let handler = _.find(handlers, {actionName: action.type})
    if (!handler) {
      return defaultState
    }

    let updatedState = handler.reducer(defaultState, action)
    if (handler.async) {
      return {
        ...updatedState,
        // auto update state
        [getStartStateName(action.type)]: false,
        [getErrorStateName(action.type)]: null,
        [getSelectedStateName(action.type)]: null
      }
    }

    return updatedState
  }
}

function rebuildActionMap (handlers) {
  let map = {}
  handlers.forEach(item => {
    if (item.async) {
      map[item.actionName] = (params) => {
        return async (dispatch, getState) => {
          try {
            dispatch({
              type: getStartAction(item.actionName),
              meta: {
                params
              }
            })
            let json = await item.actionCreator(dispatch, getState, params)
            dispatch({
              type: item.actionName,
              payload: json,
              meta: {
                params
              }
            })
          } catch (e) {
            dispatch({
              type: getErrorAction(item.actionName),
              error: e,
              meta: {
                params
              }
            })
          }
        }
      }
      return
    }

    // 可以自定义actionCreator
    map[item.actionName] = (payload) => {
      return _.assign({
        type: item.actionName,
        payload
      })
    }
  })
  return map
}

export default class Reduxis {
  static assemble = _.memoize(() => {
    let groups = _.groupBy(handlers, 'placeholder')
    let actions = {}
    let reducers = {}
    _.each(groups, (group, placeholder) => {
      _.assign(actions, rebuildActionMap(group))
      reducers[placeholder] = rebuildReducer(group, placeholderInitialState[placeholder])
    })
    return {actions, reducers}
  })

  constructor ({initialState, placeholder}) {
    if (_.isEmpty(initialState)) {
      throw new Error('Config property initialState should not be empty.')
    }
    if (/^[a-z]+$/i.test(placeholder) === false) {
      throw new Error(`Config property placeholder(${placeholder}) should be a simple word.`)
    }
    if (placeholder in placeholderInitialState) {
      throw new Error(`Config property placeholder(${placeholder}) should be an unique string.`)
    }

    this.placeholder = placeholder
    placeholderInitialState[placeholder] = initialState
  }

  addSyncHandler ({actionName, reducer}) {
    prepareActionName(actionName)

    handlers.push({
      actionName,
      reducer,
      async: false,
      placeholder: this.placeholder
    })
  }

  addAsyncHandler ({actionName, reducer, actionCreator}) {
    prepareActionName(actionName)
    handlers.push({
      actionName,
      reducer,
      actionCreator,
      async: true,
      placeholder: this.placeholder
    })

    let startAction = getStartAction(actionName)
    let errorAction = getErrorAction(actionName)
    let startStateName = getStartStateName(actionName)
    let errorStateName = getErrorStateName(actionName)
    let selectedStateName = getSelectedStateName(actionName)

    prepareActionName(startAction)
    prepareActionName(errorAction)

    handlers.push({
      actionName: startAction,
      reducer: function (state, action) {
        return {
          ...state,
          [startStateName]: true,
          [errorStateName]: false,
          // 业务侧自由根据meta自由处理，传对象或者唯一id均可
          [selectedStateName]: action.meta.params
        }
      },
      placeholder: this.placeholder
    })
    handlers.push({
      actionName: errorAction,
      reducer: function (state, action) {
        return {
          ...state,
          [startStateName]: false,
          [errorStateName]: action.error || new Error('操作出错！'),
          [selectedStateName]: null
        }
      },
      placeholder: this.placeholder
    })

    placeholderInitialState[startStateName] = false
    placeholderInitialState[errorStateName] = null
    placeholderInitialState[selectedStateName] = null
  }
}
