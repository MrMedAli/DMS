import PropTypes from 'prop-types';
import {  Table,Button, Form, Modal } from 'react-bootstrap';
import {  useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AppContext from './AppContext';
import CustomAlert from './CustomAlertComp';
import styles from './Organization.module.css'; // Import CSS Module



const OrgActionsComp = ({
  organization,
  datasets,
  handleDeleteOrg,
  handleDownloadDB,
  handleDeleteData,
  handleAddData,
  organizationDatasets,
  alertMessage,
  alertType,
  handleCloseCustomAlert,
  showAlert,
  errorMessage,
  selectedDataset,
  selectedOrganizations,
}) => {
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const isCreatorOrAdminOrMaintainer =
    organization.creator_username === user?.username ||
    user.role === 'admin' ||
    organization.maintainer === user?.username ||
    organization.maintainer_username === user?.username;

  useEffect(() => {
    const checkUpdatePermission = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage.');
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/can_update_organization/${organization.id}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setCanUpdate(response.data.can_update);
      } catch (error) {
        console.error('Failed to check update permission', error);
        setCanUpdate(false);
      }
    };

    checkUpdatePermission();
  }, [organization.id]);

  const handleViewDataset = (dataset) => {
    navigate(`/datasets/${dataset.id}`, { state: { dataset } });
  };

  const handleUpdateClick = () => {
    if (canUpdate) {
      navigate(`/organizations/create_organization/`, { state: { organization, isUpdateMode: true } });
    } else {
      alert('You do not have permission to update this organization');
    }
  };

  const filteredDatasets = organizationDatasets.filter((dataset) =>
    dataset.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredModalDatasets = datasets.filter((dataset) =>
    dataset.title.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const handleDatasetSelection = (datasetId) => {
    setSelectedDatasetIds((prevSelected) =>
      prevSelected.includes(datasetId)
        ? prevSelected.filter((id) => id !== datasetId)
        : [...prevSelected, datasetId]
    );
  };

  const handleAddDataClick = () => {
    handleAddData(organization.id, selectedDatasetIds);
    setShowDatasetModal(false);
    setSelectedDatasetIds([]);
  };

  const handleSearchClick = () => {
    setShowSearchResults(true);
  };
  const orgId=organization.id;

  console.log('selectedOrganizations',selectedOrganizations)
  console.log('organization',orgId);

  const handleReturn = () => {
    console.log(`/organizations/org_details/${orgId}`);
    navigate(`/organizations/org_management`);
  };

  


  return (
    <div className={styles.organizationManagementPage}>
           
      <div className={styles.mainContainer}>
        <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>
           <i className="bi bi-tools"></i>&nbsp;  Organization: {organization.name.toUpperCase()}
          </h2>
          <div className={styles.acManagment}>
                {isCreatorOrAdminOrMaintainer ? (
                  <>
                    <Button className={styles.createOrgButton} onClick={handleUpdateClick}>
                      Update Organization &nbsp; <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button className={styles.createOrgButton} onClick={handleDeleteOrg}>
                      Delete Organization &nbsp; <i className="bi bi-trash3-fill"></i>
                    </Button>
                    <Button className={styles.createOrgButton} onClick={() => setShowDatasetModal(true)}>
                      Add Data &nbsp; <i className="bi bi-plus-square" aria-hidden="true"></i>
                    </Button>
                  </>
                ) : (
                  <Button className={styles.createOrgButton} onClick={() => setShowDatasetModal(true)}>
                    Add Data &nbsp; <i className="bi bi-plus-square" aria-hidden="true"></i>
                  </Button>
                )}
              </div>

              <Form onSubmit={(e) => e.preventDefault()} className={styles.searchForm}>    
                  <Form.Control
                    type="search"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.formControlsearch}
                    placeholder="Search datasets"
                    aria-label="Search datasets"
                    aria-describedby="search-addon"
                  /> 
                  <Button type="button" className={styles.btn} onClick={() => setSearchQuery('')} >
                    Search &nbsp; <i className="bi bi-search"></i>
                  </Button>
              </Form>
              <hr />
              <p>{`Found ${filteredDatasets.length} Datasets(s)`}</p>
              <h3 className={styles.searchResultsTitle}>List of data available:</h3>
              {filteredDatasets.length > 0 ? (
               <Table className={`${styles.table} table-light table-hover table-bordered`}>
               <thead className="table-light">
                 <tr>
                      <th>Dataset</th>
                      <th>Creation Date</th>
                      <th>Details</th>

<th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDatasets.map((dataset) => (
                      <tr key={dataset.id}>
                        <td>{dataset.title}</td>
                        <td>{new Date(dataset.creation_date).toLocaleDateString()}</td>

                        <td>
                          <a
                            href="#"
                            onClick={() => handleViewDataset(dataset)}
                            className="detailsLink"
                          >
                            Details
                          </a>
                        </td>
                        <td>
                        <Button className={styles.btnorgdet} onClick={() => handleDownloadDB(dataset.id)}>
                          Download &nbsp; <i className="bi bi-database-fill-down"></i>
                        </Button> &nbsp; &nbsp; 
                        <Button className={styles.btnorgdelete} onClick={() => handleDeleteData(dataset.id, organization.id)}>
                          Delete &nbsp; <i className="bi bi-trash3-fill"></i>
                        </Button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No Data Found</p>
              )}
              <br />

              <button onClick={handleReturn} className={styles.returnButton}>
            Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
               </button>

        </div>
      </div>
                <Modal show={showDatasetModal} onHide={() => setShowDatasetModal(false)} dialogClassName="group-modal">
            <Modal.Header closeButton>
              <Modal.Title>Select Datasets to Add</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form onSubmit={(e) => e.preventDefault()} className="searchForm mb-3">
                  <div className="search-container">
                    <Form.Control
                      type="search"
                      name="modalSearch"
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      placeholder="Search datasets"
                      aria-label="Search datasets"
                      aria-describedby="search-addon"
                      className="modal-search-input"
                    />
                    <Button variant="primary" onClick={handleSearchClick}>
                      Search
                    </Button>
                  </div>
                </Form>

              {showSearchResults && (
                filteredModalDatasets && filteredModalDatasets.length > 0 ? (
                  <ul>
                    {filteredModalDatasets.map((dataset) => (
                      <p key={dataset.id}>
                        <Form.Check
                          type="checkbox"
                          label={dataset.title}
                          checked={selectedDatasetIds.includes(dataset.id)}
                          onChange={() => handleDatasetSelection(dataset.id)}
                        />
                      </p>
                    ))}
                  </ul>
                ) : (
                  <p>No datasets available</p>
                )
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDatasetModal(false)}>
                Close
              </Button>
              <div>
                {alertMessage && (
                  <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {alertMessage}
                  </div>
                )}
                <Button variant="primary" onClick={handleAddDataClick}>
                  Add Selected Data
                </Button>
              </div>
            </Modal.Footer>
          </Modal>


      <Modal show={showAlert} onHide={handleCloseCustomAlert}>
        <Modal.Header closeButton>
          <Modal.Title>{errorMessage && errorMessage.type === 'success' ? 'Operation Successful' : 'Permission Denied'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CustomAlert
            errorMessage={errorMessage}
            selectedDataset={selectedDataset}
            selectedOrganizations={selectedOrganizations}
            handleCloseCustomAlert={handleCloseCustomAlert}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCustomAlert}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

OrgActionsComp.propTypes = {
  organization: PropTypes.object.isRequired,
  datasets: PropTypes.array.isRequired,
  handleDeleteOrg: PropTypes.func.isRequired,
  handleDownloadDB: PropTypes.func.isRequired,
  handleDeleteData: PropTypes.func.isRequired,
  handleAddData: PropTypes.func.isRequired,
  organizationDatasets: PropTypes.array.isRequired,
  alertMessage: PropTypes.string,
  alertType: PropTypes.string,
  handleCloseCustomAlert: PropTypes.func.isRequired,
  showAlert: PropTypes.bool.isRequired,
  errorMessage: PropTypes.object,
  selectedDataset: PropTypes.object,
  selectedOrganizations: PropTypes.array,
};

export default OrgActionsComp;
