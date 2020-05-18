import { combineReducers } from "redux";
import showReducer from "./showReducer";
import errorReducer from "./errorReducer";
import authReducer from "./authReducer";

export default combineReducers({
  show: showReducer,
  error: errorReducer,
  auth: authReducer,
});
