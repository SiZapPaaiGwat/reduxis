import _ from 'lodash'
import Reduxis from './reduxis'
import {getActionByPlaceholder} from './utils'

export default class Component {
  static getAction = (actions = {}, name, placeholder) => {
    let action = actions[getActionByPlaceholder(name, placeholder)]
    if (!action) {
      throw new Error(`Action is not found (name: ${name}, placeholder: ${placeholder})`)
    }

    return action
  }

  /**
   * 每个组件设置一个独特的 redux state name
   */
  constructor ({initialState, placeholders}) {
    if (!_.isArray(placeholders)) {
      throw new Error(`Config property placeholders(${placeholders}) should be an array.`)
    }

    this.$$reduxis = _.map(_.uniq(placeholders), placeholder => {
      return new Reduxis({initialState, placeholder})
    })
  }

  addSyncHandler ({actionName, reducer}) {
    this.$$reduxis.forEach(r => {
      r.addSyncHandler({
        actionName: getActionByPlaceholder(actionName, r.placeholder),
        reducer
      })
    })
  }

  addAsyncHandler ({actionName, reducer, actionCreator}) {
    this.$$reduxis.forEach(r => {
      r.addAsyncHandler({
        actionName: getActionByPlaceholder(actionName, r.placeholder),
        reducer,
        actionCreator
      })
    })
  }
}
