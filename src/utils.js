import _ from 'lodash'

let actionNameList = []
let startSuffix = '$$Start'
let errorSuffix = '$$Error'

export function isValidActionName (name) {
  return _.isString(name) && /^[a-z]+[a-zA-Z$\d]+$/.test(name)
}

export function prepareActionName (name) {
  if (!isValidActionName(name)) {
    throw new Error(`Invalid action name: ${name}, should match /^[a-z]+[a-zA-Z\\d]+$/.`)
  }

  if (actionNameList.indexOf(name) > -1) {
    throw new Error(`Existed action name: ${name}`)
  }

  actionNameList.push(name)
}

export function getStartAction (name) {
  return `${name}${startSuffix}`
}

export function getErrorAction (name) {
  return `${name}${errorSuffix}`
}

export function getStartStateName (name) {
  return `${name}Loading`
}

export function getErrorStateName (name) {
  return `${name}Error`
}

export function getSelectedStateName (name) {
  return `${name}Selected`
}

export function getActionByPlaceholder (name, placeholder) {
  return `${name}$$${placeholder}`
}
