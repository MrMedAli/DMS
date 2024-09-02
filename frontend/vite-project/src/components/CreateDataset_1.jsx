import PropTypes from 'prop-types';
import styles from './forms.module.css'; // Importing CSS module

const CreateDataset_1 = ({
  formData,
  onChange,
  onSubmit,
  users,
  selectedUser,
  isUpdateMode,
  onUserChange,
}) => {
    console.log('creator_email', formData.creator_email);
    console.log('formData', users);

  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
        <h3>{isUpdateMode ? 'Update Dataset' : 'Create a Dataset'}</h3>
        <h5>Start adding the required details for your DB</h5>
        <hr className={styles.formHr} />
        <form onSubmit={onSubmit} autoComplete="off" encType="multipart/form-data">
          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={onChange}
              className={styles.formControlForm}
              required
            />
          </div>

          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="link"
              placeholder="Link"
              value={formData.link}
              onChange={onChange}
              className={styles.formControlForm}
              readOnly
            />
          </div>

          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="source_of_data"
              placeholder="Source of Data"
              value={formData.source_of_data}
              onChange={onChange}
              className={styles.formControlForm}
              required
            />
          </div>

          <div className={styles.formGroupForm}>
            <label htmlFor="creator" style={{ marginRight: '330px' }}>Creator:</label>
            <input
              type="text"
              name="creator"
              placeholder="Creator"
              value={formData.creatorUsername}
              className={styles.formControlForm}
              readOnly
            />
          </div>

          <div className={styles.formGroupForm}>
            <input
              type="email"
              name="creator_email"
              placeholder="Creator Email"
              value={formData.creator_email}
              onChange={onChange}
              className={styles.formControlForm}
              required
            />
          </div>

          <div className={styles.formGroupForm}>
            <label htmlFor="maintainers" style={{ marginRight: '310px' }}>Maintainer:</label>
            <select
              id="maintainers"
              name="maintainers"
              value={selectedUser}
              onChange={onUserChange}
              className={styles.formControlSelectForm}
            >
              {isUpdateMode ? (
                <option value="">{formData.maintainerUsername}</option>
              ) : (
                <option value="">Select Maintainer</option>
              )}
              {Array.isArray(users) && users.map((user) => (
                <option key={user.id} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroupForm}>
            <input
              type="email"
              name="maintainer_email"
              placeholder="Maintainer Email"
              value={formData.maintainer_email}
              onChange={onChange}
              className={styles.formControlForm}
              required
            />
          </div>

          <button type="submit" className={styles.btnPrimary}>
            Next &nbsp;<i className="fa fa-check-square" aria-hidden="true"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

CreateDataset_1.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string,
    link: PropTypes.string,
    source_of_data: PropTypes.string,
    creatorUsername: PropTypes.string,
    creator_email: PropTypes.string,
    maintainer_email: PropTypes.string,
    maintainerUsername: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired
  })).isRequired,
  selectedUser: PropTypes.string.isRequired,
  onUserChange: PropTypes.func.isRequired,
  isUpdateMode: PropTypes.bool.isRequired
};

export default CreateDataset_1;
