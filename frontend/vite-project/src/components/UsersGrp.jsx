import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import UserSelectionModal from './UsersModal';
import styles from './forms.module.css'; // Importing the same CSS module

const UsersGrpComponent = ({
  groupName,
  admin,
  members,
  selectedMembers,
  message,
  handleInputChange,
  handleSelectChange,
  handleSubmit,
  isUpdateMode,
}) => {
  
  console.log("selectedMembers", selectedMembers);
  console.log("admin", admin);

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSelectMember = (memberId) => {
    const updatedMembers = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    handleSelectChange(updatedMembers);
  };

  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
        <h3 className={styles.formTitle}>
          {isUpdateMode ? 'Update Group' : 'Create Group'}
        </h3>
        <hr className={styles.formHr} />
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroupForm}>
            <input
              type="text"
              className={styles.formControlForm}
              value={groupName}
              onChange={handleInputChange}
              required
              placeholder='Group Name'
            />
          </div>
          <div className={styles.formGroupForm}>
            <input
              type="text"
              className={styles.formControlForm}
              value={isUpdateMode ? (admin ? admin : '') : (admin ? admin.username : '')}
              readOnly
              placeholder='Admin of Group'
            />
          </div>
          <div className={styles.formGroupForm}>
            <Button onClick={handleOpenModal} className={styles.formControlForm}>
              Select Members
            </Button>
          </div>
          <button type="submit" className={styles.btnPrimary}>
            {isUpdateMode ? 'Update Group' : 'Create Group'}
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
      <UserSelectionModal
        show={showModal}
        handleClose={handleCloseModal}
        members={members}
        selectedMembers={selectedMembers}
        handleSelectMember={handleSelectMember}
        isUpdateMode={isUpdateMode}
      />
    </div>
  );
};

UsersGrpComponent.propTypes = {
  groupName: PropTypes.string.isRequired,
  admin: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
  }),
  members: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedMembers: PropTypes.arrayOf(PropTypes.number).isRequired,
  message: PropTypes.string,
  handleInputChange: PropTypes.func.isRequired,
  handleSelectChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isUpdateMode: PropTypes.bool.isRequired,
};

export default UsersGrpComponent;
