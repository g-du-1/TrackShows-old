import axios from "axios";
import {
  GET_SHOWS,
  ADD_SHOW,
  DELETE_SHOW,
  SET_SHOWS_LOADING,
  UPDATE_SHOW,
  SET_INITIAL_LOAD,
  TOGGLE_SHOWS_UPDATING,
  MODIFYING_CARDS,
} from "./types";
import { tokenConfig } from "./authActions";
import { returnErrors } from "./errorActions";

export const getShows = (
  initialLoad = false,
  sortBy = "dateAdded",
  sortOrder = -1
) => async (dispatch, getState) => {
  try {
    dispatch(setShowsLoading());

    const res = await axios.get(
      `/api/shows/?sortBy=${sortBy}&sortOrder=${sortOrder}`,
      tokenConfig(getState)
    );

    dispatch({
      type: GET_SHOWS,
      payload: res.data,
      initialLoad: initialLoad,
      sortState: [sortBy, sortOrder],
    });

    return res;
  } catch (err) {
    dispatch(returnErrors(err.response.data, err.response.status));
  }
};

export const addShow = (show) => (dispatch, getState) => {
  dispatch({ type: MODIFYING_CARDS });

  axios
    .post("/api/shows", show, tokenConfig(getState))
    .then((res) =>
      dispatch({
        type: ADD_SHOW,
        payload: res.data,
      })
    )
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

export const deleteShow = (id) => (dispatch, getState) => {
  dispatch({ type: MODIFYING_CARDS });

  axios
    .delete(`/api/shows/${id}`, tokenConfig(getState))
    .then((res) =>
      dispatch({
        type: DELETE_SHOW,
        payload: id,
      })
    )
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

export const updateShow = (id, newData) => (dispatch, getState) => {
  axios
    .put(`/api/shows/${id}`, newData, tokenConfig(getState))
    .then(
      dispatch({
        type: UPDATE_SHOW,
        id: id,
        payload: newData,
      })
    )
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

export const setShowsLoading = () => {
  return {
    type: SET_SHOWS_LOADING,
  };
};

export const toggleShowsUpdating = () => {
  return {
    type: TOGGLE_SHOWS_UPDATING,
  };
};

export const setInitialLoad = (initialLoad) => {
  return {
    type: SET_INITIAL_LOAD,
    payload: initialLoad,
  };
};
