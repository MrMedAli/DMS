import { useContext, useEffect, useState } from 'react';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import AppContext from './AppContext';
import NotificationButton from './NotificationButtonComp';
import './DatasetDetails.css';
import styles from './Organization.module.css'; // Import CSS Module

const DatasetDetailsComponent = ({
  selectedDataset,
  handleDeleteData,
  grpDatasets,
  canUpdate,
  handleDownloadDB,
  assignedGroups,
  handleAddData
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const { user } = useContext(AppContext);

  useEffect(() => {
    if (selectedDataset && selectedDataset.id) {
      console.log('Selected Dataset ID:', selectedDataset);
    }
  }, [selectedDataset]);

  if (!selectedDataset.id) {
    return <div>No dataset selected.</div>;
  }

  const isCreatorOrAdminOrMaintainer =
    selectedDataset.creator_username === user?.username ||
    user.role === 'admin' ||
    selectedDataset.maintainer === user?.username;

  const handleUpdateClick = () => {
    if (!canUpdate) {
      alert("You do not have permission to update this dataset.");
    } else {
      navigate(`/create-dataset-1/`, { state: { selectedDataset, isUpdateMode: true } });
    }
  };

  const handleAddToGroupClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddToGroup = () => {
    handleAddData(selectedGroup);
    setShowModal(false);
  };
  const handleReturn = () => {
    navigate(`/graph`);

};


  return (
    <div className="dataset-details-page">
      <div className="main-container">
      <h2 className={styles.sectionTitle}>
            <i className="bi bi-database-fill-gear" aria-hidden="true"></i> &nbsp;   Dataset Details
          </h2>

        <Card className="custom-card">
          <Card.Body>
            <Card.Title>
              <blockquote className="card-headerdb">
                <strong> {selectedDataset.title.toUpperCase()}</strong>
              </blockquote>
            </Card.Title>
            <hr />
            <Card.Text><strong>Creation Date:</strong> {new Date(selectedDataset.creation_date).toLocaleDateString()}</Card.Text>
            <Card.Text><strong>Title:</strong> {selectedDataset.title}</Card.Text>
            <Card.Text><strong>Creator:</strong> {selectedDataset.creator_username || 'Not specified'}</Card.Text>
            <Card.Text><strong>Maintainer:</strong> {selectedDataset.maintainer || 'Not specified'}</Card.Text>
            <Card.Text><strong>Source of Data:</strong> {selectedDataset.source_of_data || 'Not specified'}</Card.Text>
            <Card.Text><strong>Version:</strong> {selectedDataset.version || 'Not specified'}</Card.Text>

            <hr />                
                {/* // className="fa fa-users"  */}

            <div className="assigned-groups-section">
            <blockquote className="card-headerdb">
                <strong> Assigned Groups</strong>
              </blockquote>
   
  {assignedGroups.length > 0 ? (
    <table className="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Group Name</th>
        </tr>
      </thead>
      <tbody>
        {assignedGroups.map(group => (
          <tr key={group.id}>
            <td>{group.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No groups assigned to this dataset.</p>
  )}
</div>

<br />

            <div className="card-buttons">
              <Button onClick={handleAddToGroupClick} className="action-button">
                Add to Group &nbsp; <i className="fa fa-plus" aria-hidden="true"></i>
              </Button>
              <Button onClick={handleUpdateClick} 
              className={styles.btnuserupdate}
              >
                Update DB &nbsp; <i className="fa fa-plus-circle" aria-hidden="true"></i>
              </Button>
              <Button onClick={handleDeleteData} className={styles.deletedata}>
                Delete Data  &nbsp; <i className="fa fa-trash" aria-hidden="true"></i>
              </Button>  
              {selectedDataset.file && (
                <Button onClick={handleDownloadDB} className={styles.btndatadet}>
                  Download DB &nbsp; <i className="fa fa-download" aria-hidden="true"></i>
                </Button>
              )}

              {isCreatorOrAdminOrMaintainer ? (
                <NotificationButton datasetId={selectedDataset.id} selectedDataset={selectedDataset} />
              ) : (
                <Link 
                  to="/ask_db_permission" 
                  state={{ selectedDataset, organization: { id: "", name: "" }}} 
                  className="btn btn-primary notification-button">
                  Ask Permission &nbsp; 
                </Link>
              )}

          <Button                   
            onClick={handleReturn}
            className="createOrgButton">
            Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
          </Button>

            </div>
          </Card.Body>
        </Card>
      </div>
      <Footer />
                  <Modal show={showModal} onHide={handleCloseModal} dialogClassName="group-modal">
              <Modal.Header closeButton>
                <Modal.Title>Add Dataset to Group</Modal.Title>
              </Modal.Header>
              <Modal.Body>
              <Form onSubmit={(e) => e.preventDefault()} className="searchForm mb-3">
                  <div className="search-container">
                    <Form.Control
                      as="select"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="modal-search-input" /* Use the same class as search input */
                    >
                      <option value="">Select a group</option>
                      {grpDatasets.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </Form.Control>
                    <Button variant="primary" onClick={handleAddToGroup}>
                      Select a Group 
                    </Button>
                  </div>
                </Form>

                  </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" className="action-button" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" className="action-button" onClick={handleAddToGroup}>
                  Add to Group
                </Button>
              </Modal.Footer>
            </Modal>

    </div>
  );
};

DatasetDetailsComponent.propTypes = {
  selectedDataset: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string.isRequired,
    creator_username: PropTypes.string,
    creation_date: PropTypes.string.isRequired,
    maintainer: PropTypes.string,
    source_of_data: PropTypes.string,
    version: PropTypes.string,
    file: PropTypes.string,
    description: PropTypes.string
  }),
  handleDeleteData: PropTypes.func.isRequired,
  handleDownloadDB: PropTypes.func.isRequired,
  grpDatasets: PropTypes.array.isRequired,
  assignedGroups: PropTypes.array.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  handleAddData: PropTypes.func.isRequired
};

export default DatasetDetailsComponent;
