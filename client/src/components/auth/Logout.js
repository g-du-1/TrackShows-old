import React, { Component } from "react";
import { connect } from "react-redux";
import { logout } from "../../actions/authActions";
import PropTypes from "prop-types";
import { NavLink } from "reactstrap";

export class Logout extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
  };

  render() {
    return (
      <NavLink
        className="px-2 secondary-textcolor"
        onClick={this.props.logout}
        href="#"
      >
        Logout
      </NavLink>
    );
  }
}

export default connect(null, { logout })(Logout);
