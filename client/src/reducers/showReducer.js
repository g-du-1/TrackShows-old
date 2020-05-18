import {
  GET_SHOWS,
  ADD_SHOW,
  DELETE_SHOW,
  SET_SHOWS_LOADING,
  UPDATE_SHOW,
  SET_INITIAL_LOAD,
  TOGGLE_SHOWS_UPDATING,
  CLEAR_SHOWS,
  MODIFYING_CARDS,
} from "../actions/types";

const initialState = {
  shows: [],
  showsLoading: false,
  updating: false,
  initialLoad: false,
  modifyingCards: false,
  sortState: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_SHOWS:
      return {
        ...state,
        shows: action.payload,
        showsLoading: false,
        initialLoad: action.initialLoad,
        sortState: action.sortState,
      };
    case DELETE_SHOW:
      return {
        ...state,
        shows: state.shows.filter((show) => show._id !== action.payload),
        modifyingCards: false,
      };
    case ADD_SHOW:
      return {
        ...state,
        shows: [action.payload, ...state.shows],
        modifyingCards: false,
      };
    case UPDATE_SHOW:
      return {
        ...state,
        shows: state.shows.map((show) =>
          show._id === action.id ? { ...show, ...action.payload } : show
        ),
      };
    case SET_SHOWS_LOADING:
      return {
        ...state,
        showsLoading: true,
      };
    case TOGGLE_SHOWS_UPDATING:
      return {
        ...state,
        updating: !state.updating,
      };
    case SET_INITIAL_LOAD:
      return {
        ...state,
        initialLoad: action.payload,
      };
    case CLEAR_SHOWS:
      return {
        ...state,
        shows: [],
      };
    case MODIFYING_CARDS:
      return {
        ...state,
        modifyingCards: true,
      };
    default:
      return state;
  }
}
