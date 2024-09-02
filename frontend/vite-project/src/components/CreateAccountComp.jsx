import PropTypes from 'prop-types';
import styles from './forms.module.css'; // Importing the same CSS module

const CreateAccountForm = ({ formData, handleChange, handleSubmit }) => {
  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
        <h3 className={styles.formTitle}>Create Account</h3>
        <h5 className={styles.formSubtitle}>Start Exploring: Create An Account</h5>
        <hr className={styles.formHr} />
        <form onSubmit={handleSubmit} autoComplete="on">
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
            <select name="role" value={formData.role} onChange={handleChange} className={styles.formControlForm}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className={styles.btnPrimary}>
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

CreateAccountForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default CreateAccountForm;
