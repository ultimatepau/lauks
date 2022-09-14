import axios from "axios";

const BASE_URL = 'https://stein.efishery.com/v1/storages/5e1edf521073e315924ceab4';

export function requestDataInit(payload) {
  return async (dispatch) => {
    dispatch({ type: 'SET_INITIAL_DATA' });
    axios({ url: '/option_area', baseURL: BASE_URL }).then(({ data: payload }) => {
      dispatch({
        type: 'SET_AREA', payload
      })
    });
    axios({ url: '/option_size', baseURL: BASE_URL }).then(({ data: payload }) => {
      dispatch({
        type: 'SET_SIZE', payload
      })
    });
    dispatch(getData())
  }
}

export function getData() {
  return async (dispatch) => {
    dispatch({ type: 'GET_REQUEST' });
    axios({ url: '/list', baseURL: BASE_URL }).then(({ data: payload }) => {
      dispatch({
        type: 'GET_SUCCESS', payload: payload.reverse()
      })
    });
  }
}

export function postData(payload) {
  return async (dispatch) => {
    dispatch({ type: 'CREATE_REQUEST' });
    axios({ url: '/list', baseURL: BASE_URL, method: 'POST', data: [payload] }).then(({ data: payload }) => {
      dispatch({
        type: 'CREATE_SUCCESS'
      })
    });
  }
}