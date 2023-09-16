import rootReducer from './reducers';
import { configureStore } from '@reduxjs/toolkit';
// import { createStore } from 'redux';
// import { applyMiddleware } from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension';
// import thunk from 'redux-thunk';

// const initialState = {};
// const middleware = [thunk];
// const store = createStore(
// 	rootReducer, 
// 	initialState, 
// 	composeWithDevTools(applyMiddleware(...middleware))
// );
const store = configureStore({ reducer: rootReducer })

export default store;