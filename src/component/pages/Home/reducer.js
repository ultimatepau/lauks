const initialState = {
  list: {
    fetching: false,
    data: []
  },
  areas: {
    fetching: false,
    data: []
  },
  sizes: {
    fetching: false,
    data: []
  },
  create: {
    fetching: false,
    data: null
  },
  delete: {
    fetching: false,
    data: null
  },
  update: {
    fetching: false,
    data: null
  },
};
export default function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch(type) {
    case 'UPDATE_REQUEST':
      return {
        ...state,
        update: {
          fetching: true,
          data: null
        },
      }
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        update: {
          fetching: false,
          data: true
        }
      }
    case 'DELETE_REQUEST':
      return {
        ...state,
        delete: {
          fetching: true,
          data: null
        },
      }
    case 'DELETE_SUCCESS':
      return {
        ...state,
        delete: {
          fetching: false,
          data: true
        }
      }
    case 'GET_REQUEST':
      return {
        ...state,
        list: {
          fetching: true,
          data: []
        },
        create: initialState.create,
        delete: initialState.delete,
        update: initialState.update
      }
    case 'GET_SUCCESS':
      return {
        ...state,
        list: {
          fetching: false,
          data: payload
        }
      }
    case 'CREATE_REQUEST':
      return {
        ...state,
        create: {
          fetching: true,
          data: null
        }
      }
    case 'CREATE_SUCCESS':
      return {
        ...state,
        create: {
          fetching: false,
          data: true
        }
      }
    case 'SET_AREA':
      return {
        ...state,
        areas: {
          fetching: false,
          data: payload
        }
      }
    case 'SET_SIZE':
      return {
        ...state,
        sizes: {
          fetching: false,
          data: payload
        }
      }
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        areas: {
          ...state.areas,
          fetching: true
        },
        sizes: {
          ...state.sizes,
          fetching: true
        }
      }
    default:
      return initialState;
  }
}