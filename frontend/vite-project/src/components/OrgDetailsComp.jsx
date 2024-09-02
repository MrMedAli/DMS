import PropTypes from 'prop-types';
import { Card, Button } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
import './OrgComp.css'; // Add your custom styles in this CSS file
import Footer from './Footer';
import { useContext } from 'react';
import AppContext from './AppContext';
import NotificationButton from './NotificationButtonComp';
import { useNavigate } from 'react-router-dom';

const OrgDetailsComp = ({
  organization,
  organizationDatasets,
  handleManageOrg,
}) => {
  const { user } = useContext(AppContext); // Use context to get user information
  const navigate = useNavigate();

  const isCreatorOrAdminOrMaintainer =
    organization.creator_username === user?.username ||
    user.role === 'admin' ||
    organization.maintainer === user?.username ||
    organization.maintainer_username === user?.username;

    const handleClick = () => {
      navigate('/ask_db_permission', {
        state: { organization, selectedDataset: "" }
      });
    };

    const handleClickreturn = () => {
      navigate('/organizations/org_management');
    };

  return (
    <div className="org-details-page">
      <div className="org-main-container">
    
        <div className="org-main-content">
        <h2 className="section-title">
                  <i className="fa fa-user-secret" aria-hidden="true"></i> 
                  &nbsp; About &quot;{organization.name.toUpperCase()}&quot;
                </h2>
          <Card className="mb-4">
            <Card.Body>
              <div className="button-container">
                <Button
                  className="createOrgButton"
                  onClick={() => handleManageOrg(organization.id, organizationDatasets)}
                >
                  Manage Organization &nbsp; <i className="bi bi-tools"></i>
                </Button>
                {isCreatorOrAdminOrMaintainer ? (
                  <NotificationButton orgId={organization.id} selectedOrg={organization} />
                ) : (
                  <Button
                  className="createOrgButton"
                  onClick={handleClick}
                >
                  Ask Permission &nbsp;
                </Button>
                )}
              </div>
              <hr />
            <div className='Card-text'>    
              <Card.Text><strong>Creation Date:</strong> {new Date(organization.created_at).toLocaleDateString()}</Card.Text>
              <Card.Text><strong>Name:</strong> {organization.name}</Card.Text>
              <Card.Text><strong>Creator:</strong> {organization.creator_username || 'Not specified'}</Card.Text>
              <Card.Text><strong>Creator Email:</strong> {organization.creator_email || 'Not specified'}</Card.Text>
              <Card.Text><strong>Maintainer:</strong> {organization.maintainer_username || organization.maintainer || 'Not specified'}</Card.Text>
              <Card.Text><strong>Description:</strong> {organization.description || 'Not specified'}</Card.Text>
              </div>
            </Card.Body>
          </Card>

          <Button                   
          onClick={handleClickreturn}
            className="createOrgButton">
            Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
          </Button>

          
        </div>
      </div>
      <Footer />
    </div>
  );
};

OrgDetailsComp.propTypes = {
  organization: PropTypes.shape({
    id: PropTypes.number.isRequired,
    created_at: PropTypes.string.isRequired,
    creator_username: PropTypes.string,
    maintainer: PropTypes.string,
    maintainer_username: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    creator_email: PropTypes.string.isRequired,
  }).isRequired,
  organizationDatasets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      creator: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleManageOrg: PropTypes.func.isRequired,
};

export default OrgDetailsComp;
