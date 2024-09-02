import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const UserSelectionModal = ({ show, handleClose, members, selectedMembers, handleSelectMember }) => {
  console.log('Members:', members);
  console.log('SelectedMembers received:', selectedMembers);

  const handleCheckboxChange = (memberUsername) => {
    handleSelectMember(memberUsername);
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="group-modal" >
      <Modal.Header closeButton>
        <Modal.Title>Select Members</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {members.map((member) => (
          <div key={member.id} className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={member.username}
              checked={selectedMembers.includes(member.username)}
              onChange={() => handleCheckboxChange(member.username)}
              id={`checkbox-${member.id}`}
            />
            <label className="form-check-label" htmlFor={`checkbox-${member.id}`}>
              {member.username}
            </label>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Add
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

UserSelectionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  members: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedMembers: PropTypes.arrayOf(PropTypes.string).isRequired,  // Updated to be an array of usernames
  handleSelectMember: PropTypes.func.isRequired,
};

export default UserSelectionModal;
