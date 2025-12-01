/****************************************************************************************************
 * @file        NavBar.jsx
 * @description Navigation bar with conditional links by auth state.
 ****************************************************************************************************/
import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

const NavBar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Navbar
      expand="lg"
      className="shadow-sm"
      style={{ backgroundColor: "#4B0082", minHeight: "12vh" }}
      variant="dark"
    >
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Hardware Resource Management Portal</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/about" end>About</Nav.Link>
            

            {isLoggedIn ? (
              <>
                <Nav.Link as={NavLink} to="/project" end>Project</Nav.Link>
                <Nav.Link as={NavLink} to="/adduser" end>Add User</Nav.Link>
                <Nav.Link as={NavLink} to="/resource" end>Resource</Nav.Link>
                <Nav.Link as={NavLink} to="/ms4" end>Analysis</Nav.Link>
                <Nav.Link as={NavLink} to="/about" onClick={handleLogout} end>
                  Sign Out
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" end>Sign In</Nav.Link>
                <Nav.Link as={NavLink} to="/signup" end>Sign Up</Nav.Link>
                
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
