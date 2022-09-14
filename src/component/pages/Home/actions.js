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

export function updateData(payload) {
  return async (dispatch) => {
    dispatch({ type: 'UPDATE_REQUEST' });
    const data = { condition: { uuid: payload.uuid }, set: { ...payload, uuid: undefined } };
    axios({ url: '/list', baseURL: BASE_URL, method: 'PUT', data }).then(() => {
      dispatch({
        type: 'UPDATE_SUCCESS'
      })
    });
  }
}

export function deleteData(payload) {
  return async (dispatch) => {
    dispatch({ type: 'DELETE_REQUEST' });
    const data = { condition: { uuid: payload } };
    axios({ url: '/list', baseURL: BASE_URL, method: 'DELETE', data }).then(() => {
      dispatch({
        type: 'DELETE_SUCCESS'
      })
    });
  }
}

export function postData(payload) {
  return async (dispatch) => {
    dispatch({ type: 'CREATE_REQUEST' });
    axios({ url: '/list', baseURL: BASE_URL, method: 'POST', data: [payload] }).then(() => {
      dispatch({
        type: 'CREATE_SUCCESS'
      })
    });
  }
}