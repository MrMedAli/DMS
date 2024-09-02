import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import styles from './forms.module.css'; // Importing CSS module


const OrganizationComp = ({
  name,
  description,
  setName,
  setDescription,
  handleSubmit,
  creatorEmail,
  setCreatorEmail,
  maintainerEmail,
  setMaintainerEmail,
  maintainer,
  creator,
  users,
  setMaintainer
}) => {
  const location = useLocation();
  const { organization } = location.state || {};
  const isUpdateMode = location.state ? location.state.isUpdateMode : false;
  
console.log(organization)
  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
      <h3 className={styles.formTitle}>
  {isUpdateMode ? 'Update An Organization' : 'Create An Organization'}
</h3>
        <hr className={styles.formHr} />
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className={styles.formGroupForm}>
            <input
              type="text"
              className={styles.formControlForm}
              value={name || ''}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder='Name'
            />
          </div>
          <div className={styles.formGroupForm}>
            <textarea
              className={styles.formControlForm}
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Description'
            />
          </div>
          <div className={styles.formGroupForm}>
            <select
              className={styles.formControlSelectForm}
              value={maintainer || ''}
              onChange={(e) => setMaintainer(e.target.value)}
              required
            >
              <option value="">
                {isUpdateMode ? maintainer : 'Select Maintainer'}
              </option>
              {users.map(user => (
                <option key={user.id} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="email"
              className={styles.formControlForm}
              value={maintainerEmail || ''}
              onChange={(e) => setMaintainerEmail(e.target.value)}
              required
              placeholder='Maintainer Email'
            />
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="text"
              className={styles.formControlForm}
              value={creator || ''}
              readOnly
              placeholder='Creator'
            />
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="email"
              className={styles.formControlForm}
              value={creatorEmail || ''}
              onChange={(e) => setCreatorEmail(e.target.value)}
              required
              placeholder='Creator Email'
            />
          </div>
          <button type="submit" className={styles.btnPrimary}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

OrganizationComp.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  setDescription: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  maintainer: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
  setMaintainer: PropTypes.func.isRequired,
  creatorEmail: PropTypes.string.isRequired,
  maintainerEmail: PropTypes.string.isRequired,
  setCreatorEmail: PropTypes.func.isRequired,
  setMaintainerEmail: PropTypes.func.isRequired,
};

export default OrganizationComp;
