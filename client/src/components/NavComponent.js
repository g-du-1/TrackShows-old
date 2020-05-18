import React from "react";
import { Navbar, NavbarBrand, Nav, NavItem } from "reactstrap";
import RegisterModal from "./auth/RegisterModal";
import LoginModal from "./auth/LoginModal";
import HelpModal from "./HelpModal";
import Logout from "./auth/Logout";
import Logo from "../images/logo.png";

export default function NavComponent(props) {
  const authLinks = (
    <>
      <NavItem className="d-none d-sm-block">
        <span className="navbar-text px-2">
          <strong>{props.user ? `Welcome ${props.user.name}` : null}</strong>
        </span>
      </NavItem>
      <NavItem>
        <HelpModal />
      </NavItem>
      <NavItem>
        <Logout />
      </NavItem>
    </>
  );

  const guestLinks = (
    <>
      <NavItem>
        <RegisterModal />
      </NavItem>
      <NavItem>
        <LoginModal refreshData={props.refreshData} />
      </NavItem>
    </>
  );

  return (
    <Navbar
      color="dark"
      expand="sm"
      className="secondary-textcolor no-decoration"
    >
      <NavbarBrand href="/" className="secondary-textcolor mr-2">
        <img className="border" src={Logo} alt="Logo" height="35" />
      </NavbarBrand>

      <div className="navbar-text navbar__brand-text">TrackShows</div>

      <Nav className="ml-auto flex-row" navbar>
        {props.isAuthenticated ? authLinks : guestLinks}
      </Nav>
    </Navbar>
  );
}
