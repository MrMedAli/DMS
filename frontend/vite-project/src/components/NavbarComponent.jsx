import { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NavbarComponent.css';
import AppContext from './AppContext';

const NavbarComponent = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSignOutClick = () => {
    console.log('Sign out clicked');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const firstName = capitalizeFirstLetter(user?.first_name || '');
  const lastName = capitalizeFirstLetter(user?.last_name || '');

  return (
    <BootstrapNavbar expand="lg" className={`custom-navbar ${isVisible ? 'visible' : 'hidden'}`}>
      <Container fluid>
        <BootstrapNavbar.Brand href="/graph" className="brand-with-image">DMS
        <span className="small-text">Telnet Smart</span>
          </BootstrapNavbar.Brand>  
      

        <BootstrapNavbar.Toggle aria-controls="navbarScroll" />
        <BootstrapNavbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            {/* {user && (
              <Nav.Link as={Link} to="/graph" className="text-link">Home</Nav.Link>

            )} */}
          </Nav>
          <Nav className="ml-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/accounts_management" className="text-link">
                  {firstName} {lastName} &nbsp; <i className="bi bi-gear"></i>
                </Nav.Link>
                <Nav.Link onClick={handleSignOutClick} className="text-link">Sign out</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-link">Sign in</Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-link">Sign up</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

NavbarComponent.propTypes = {
  setVisibleForm: PropTypes.func,
};

export default NavbarComponent;
