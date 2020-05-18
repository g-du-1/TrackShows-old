import React, { Component } from "react";
import Tracker from "./components/Tracker";
import { Provider } from "react-redux";
import store from "./store";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Tracker />
      </Provider>
    );
  }
}

export default App;
