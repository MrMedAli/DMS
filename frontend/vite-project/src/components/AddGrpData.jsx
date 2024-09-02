import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './forms.module.css'; // Importing the same CSS module as OrganizationComp

const GrpDataComp = ({ formData, handleChange, handleSubmit, submitError, isUpdateMode }) => {
  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
        <h3 className={styles.formTitle}>
          {isUpdateMode ? 'Update Group of Dataset' : 'Create Group of Dataset'}
        </h3>
        <hr className={styles.formHr} />
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroupForm}>
            <label>Name:</label>
            <input
              type="text"
              className={styles.formControlForm}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroupForm}>
            <label>Description:</label>
            <textarea
              className={styles.formControlForm}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroupForm}>
            <label>Creator:</label>
            <input
              type="text"
              className={styles.formControlForm}
              name="creator"
              value={formData.creator}
              readOnly
            />
          </div>
          <div className={styles.formGroupForm}>
            <label>Creator Email:</label>
            <input
              type="email"
              className={styles.formControlForm}
              name="creator_email"
              value={formData.creator_email}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className={styles.btnPrimaryGdata}>
            {isUpdateMode ? 'Update Group of Dataset' : 'Create Group of Dataset'}
          </Button>
        </form>
        {submitError && <p className={styles.errorMessage}>Error: {submitError}</p>}
      </div>
    </div>
  );
};

GrpDataComp.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    creator_email: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitError: PropTypes.string,
  isUpdateMode: PropTypes.bool.isRequired,
};

export default GrpDataComp;
