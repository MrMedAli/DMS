import PropTypes from 'prop-types';
import './Register.css'; // Import the new CSS file
import { Link } from 'react-router-dom';

const RegisterComponent = ({ formData, handleChange, handleSubmit }) => {
  return (
      <div className="signup-page">
        <div className="signup-container">
          <h3>{'Create Your Account'}</h3>
          <h5>{'Start Exploring: Create Your Account Here!'}</h5>
          <hr />
          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password1"
                placeholder="Password"
                value={formData.password1}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password2"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <button type="submit" className="register-btn">
              Register
            </button>

          </form>
          <div className="text-center-register mt-3">
          <h5>Already have an account?</h5>
            <Link to="/login">  Sign In</Link>
          </div>
        </div>
      </div>
  );
};

RegisterComponent.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  setVisibleForm: PropTypes.func.isRequired,
};

export default RegisterComponent;
