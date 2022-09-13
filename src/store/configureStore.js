import thunk from 'redux-thunk';
import { logger } from 'redux-logger';
import { applyMiddleware, compose, createStore } from 'redux';
import reducers from '../reducers';

function configureStore(initialState) {
  let middleware = [
    thunk
  ];
  if(process.env.NODE_ENV !== 'production') middleware.push(logger);
  const store = createStore(
    reducers,
    initialState,
    compose(applyMiddleware(...middleware))
  );
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }
  return store;
}

export default configureStore;