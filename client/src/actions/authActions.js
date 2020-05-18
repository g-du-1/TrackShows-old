import axios from "axios";
import { getShows, setInitialLoad } from "./showActions";
import { returnErrors } from "./errorActions";
import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  CLEAR_SHOWS,
  SET_INITIAL_LOAD,
} from "./types";

export const loadUser = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LOADING });
    dispatch({ type: SET_INITIAL_LOAD, payload: true });
    const res = await axios.get("/api/auth/user", tokenConfig(getState));
    dispatch({ type: USER_LOADED, payload: res.data });
    await dispatch(getShows(true));
    return res;
  } catch (err) {
    dispatch(returnErrors(err.response.data, err.response.status));
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

export const register = ({ name, email, password }) => (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ name, email, password });

  axios
    .post("/api/users", body, config)
    .then((res) =>
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      })
    )
    .catch((err) => {
      dispatch(
        returnErrors(err.response.data, err.response.status, "REGISTER_FAIL")
      );
      dispatch({
        type: REGISTER_FAIL,
      });
    });
};

export const login = ({ email, password }) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await axios.post("/api/auth", body, config);
    dispatch({ type: LOGIN_SUCCESS, payload: res.data });
    await dispatch(getShows());
    return res;
  } catch (err) {
    dispatch(
      returnErrors(err.response.data, err.response.status, "LOGIN_FAIL")
    );
    dispatch({ type: LOGIN_FAIL });
  }
};

export const logout = () => (dispatch) => {
  dispatch({ type: CLEAR_SHOWS });
  dispatch({
    type: LOGOUT_SUCCESS,
  });
  dispatch(setInitialLoad(true));
};

export const tokenConfig = (getState) => {
  // Get token from localstorage
  const token = getState().auth.token;

  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  if (token) {
    config.headers["x-auth-token"] = token;
  }

  return config;
};
