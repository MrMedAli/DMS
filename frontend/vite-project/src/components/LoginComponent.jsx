import PropTypes from 'prop-types';
import './LoginComp.css';
import { Link } from 'react-router-dom';

const LoginComponent = ({ formData, handleChange, handleSubmit }) => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          {/* Left side content */}
        </div>
        <div className="login-right">
          <h1>Welcome back! Please<br/> sign in</h1>
          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="User Name"
                value={formData.username}
                onChange={handleChange}
                className="resizable-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="resizable-input"
              />
            </div>
            <button type="submit" className="btn-login">Submit</button>
          </form>
          <div className="text-center mt-3">
          
            <br />
            <h1>Dont have an account?</h1>
            <Link to="/register">    Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};


LoginComponent.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  setVisibleForm: PropTypes.func.isRequired,
};

export default LoginComponent;
