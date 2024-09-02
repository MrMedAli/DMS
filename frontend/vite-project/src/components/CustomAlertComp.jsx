import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap'; // Import Alert from react-bootstrap

const CustomAlert = ({ errorMessage, selectedDataset, selectedOrganizations, handleCloseCustomAlert}) => {
  
  console.log('db from custom alert',selectedDataset)
  console.log('org from custom alert',selectedOrganizations)

  const linkState = {
    state: { selectedDataset, selectedOrganizations }
  };  return (
    <Alert variant={errorMessage && errorMessage.type === 'success' ? 'success' : 'danger'} onClose={handleCloseCustomAlert} dismissible>
      <Alert.Heading>{errorMessage && errorMessage.type === 'success' ? 'Operation Successful' : 'Permission Denied'}</Alert.Heading>
      <p>{errorMessage && errorMessage.message}</p>
      
      {errorMessage && errorMessage.type !== 'success' && (
        <Link to="/ask_db_permission" {...linkState} style={linkStyle}>
          Ask Permission
        </Link>
      )}
    </Alert>
  );
};

const linkStyle = {
  color: 'blue',
  textDecoration: 'underline',
  display: 'block',
  marginTop: '10px',
};

CustomAlert.propTypes = {
  errorMessage: PropTypes.shape({
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
  }),
  selectedDataset: PropTypes.object,
  selectedOrganizations: PropTypes.object,
  handleCloseCustomAlert: PropTypes.func
};

export default CustomAlert;
