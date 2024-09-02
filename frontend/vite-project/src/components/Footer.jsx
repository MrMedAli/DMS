// src/components/Footer.jsx
import  { useEffect, useState } from 'react';
import './Footer.css';
import { BsEnvelope, BsFacebook, BsGithub, BsTwitter } from 'react-icons/bs';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(true);

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

  return (
    <footer className={`footer ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="footer-container">
        <div className="footer-brand">
          <a href="" className="footer-brand-link">
            <img src="https://flowbite.com/docs/images/logo.svg" alt="Flowbite Logo" className="footer-logo" />
            <span>DMS</span>
          </a>
        </div>

          <span className="footer-copyright">&copy; 2024 DMS™. All Rights Reserved.</span>
          <div className="footer-social-icons">
            <a href="#" className="footer-icon"><BsEnvelope /></a>
            <a href="#" className="footer-icon"><BsFacebook /></a>
            <a href="#" className="footer-icon"><BsTwitter /></a>
            <a href="#" className="footer-icon"><BsGithub /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
