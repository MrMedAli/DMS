import PropTypes from 'prop-types';
import styles from './forms.module.css'; // Importing the same CSS module
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const UpdateAccountComp = ({ formData, handleChange, handleSubmit, authRole }) => {
  const navigate = useNavigate(); // Initialize useNavigate

 
 
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.password) {
      alert('Password field is required');
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
        <h3 className={styles.formTitle}>Update Account</h3>
        <h5 className={styles.formSubtitle}>Start updating Accounts here</h5>
        <hr className={styles.formHr} />
        <form onSubmit={handleFormSubmit} autoComplete="off">
          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles.formControlForm}
            />
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className={styles.formControlForm}
            />
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className={styles.formControlForm}
            />
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={styles.formControlForm}
            />
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={styles.formControlForm}
            />
          </div>
          <div className={styles.formGroupForm}>
            {authRole === 'admin' ? (
              <select
                id="groups"
                name="groups"
                value={formData.groups}
                onChange={handleChange}
                className={styles.formControlForm}
              >
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            ) : (
              <input
                type="text"
                id="groups"
                name="groups"
                value={formData.groups}
                onChange={handleChange}  
                readOnly
                className={styles.formControlForm}
              />
            )}
<br />  <br />


<div className={styles.buttonGroup}>
            <button type="submit" className="btn btn-primary">
            Update Account
            </button>
            <button 
            type="button" 
            className={styles.returnB} 
            onClick={() => navigate('/graph')} // Directly use navigate in onClick
          >
            Back
          </button>
          </div>

          </div>
          
        </form>
      </div>
    </div>
  );
};

UpdateAccountComp.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  authRole: PropTypes.string.isRequired,
};

export default UpdateAccountComp;
