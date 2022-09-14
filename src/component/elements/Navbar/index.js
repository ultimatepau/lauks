import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, NavLink, NavbarText } from 'reactstrap';
import React, { useState} from 'react';
import PropTypes from 'prop-types';

export default function Comp({ toggleModalAdd }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  return (
    <Navbar expand="md">
      <NavbarBrand href="/">Lauks</NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <NavLink onClick={toggleModalAdd} className="nav-button">Tambah</NavLink>
          </NavItem>
        </Nav>
        <NavbarText>
          <a target="_blank" rel="noreferrer" className="github-link" href="https://github.com/ultimatepau/lauks">
            <img alt="github" width="25px" src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" />
          </a>
        </NavbarText>
      </Collapse>
    </Navbar>
  )
}

Comp.defaultProps = {
  toggleModalAdd: () => null
}

Comp.propTypes = {
  toggleModalAdd: PropTypes.func
}