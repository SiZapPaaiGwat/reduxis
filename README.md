# reduxis
more controllable management, less noisy for redux actions and reducers

## Usage

### Define you actions and reducers

```js
let reduxis = new Reduxis({
  initialState: {
    showModal: false,
    datalist: []
  },
  placeholder: 'user'
})

reduxis.addSyncHandler({
  actionName: 'toggleUserDialog',
  reducer: function (state) {
    return {
      ...state,
      showModal: !state.showModal
    }
  }
})

reduxis.addAsyncHandler({
  actionName: 'insertUser',
  actionCreator: async (dispatch, getState, params) => {
    let res = await post('/user/create', params)
    return res.body
  },
  reducer: function (state, action) {
    return {
      ...state,
      datalist: state.datalist.concat(action.payload.content)
    }
  }
})
```

### Assemble in your store and routes

```js
// routes.js
function mapDispatchToProps (dispatch) {
  let actions = bindActionCreators(Reduxis.assemble().actions, dispatch)
  return {actions}
}

const Root = connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout)

// store.js
export default (initialState) => {
  let finalReducer = combineReducers(Reduxis.assemble().reducers)
  return finalStoreCreator(finalReducer, initialState)
}
```
