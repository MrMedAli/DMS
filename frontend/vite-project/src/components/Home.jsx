import './Home.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      <div className="left-section"></div> {/* Left section for background image */}
      <div className="right-section">
        <h1>Welcome to the Data Management System (DMS)</h1>

        <p className="home-paragraph">
          Unlock the power of your data with our comprehensive Data Management System, designed to help you 
          efficiently store, manage, and analyze datasets. Whether you're working with large-scale data or 
          handling sensitive information, our DMS offers the tools you need for seamless data management.
        <br /> <br />
          Ready to take control of your data? Start your journey with our DMS and experience the future of data management.
        </p>
        <button className="cta-button" onClick={handleClick}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;
