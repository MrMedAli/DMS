import {  Button, Modal, Form, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from './AppContext';
import CustomAlert from './CustomAlertComp';
import styles from './Organization.module.css'; // Import CSS Module

const GrpDataDetails = ({
  id,
  handleRemoveDatasetFromGrp,
  // eslint-disable-next-line react/prop-types
  handleUpdateGrpData,handleCloseCustomAlert, showAlert,errorMessage,
  handleDeleteGrpData,
  handleAddDataToGrp,
  datasets,
  grpDataDetails,
  handleDatasetSelection,
  handleDownloadDB,
  // eslint-disable-next-line react/prop-types
  selectedDatasetIds,selectedDataset, selectedOrganizations,
  assignedDatasetIds = [],
}) => {
  
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalFilteredDatasets, setModalFilteredDatasets] = useState([]);
 


  console.log("datasets",datasets)
  const { user } = useContext(AppContext);

  const isCreatorOrAdminOrMaintainer =
    grpDataDetails &&
    (grpDataDetails.creator === user?.username || user.role === 'admin');

  const navigate = useNavigate();

  const handleClose = () => {
    setShowModal(false);
    setModalSearchTerm('');
    setModalFilteredDatasets([]);
  };

  const handleShow = () => setShowModal(true);

  const handleAssignData = () => {
    handleAddDataToGrp(id, selectedDatasetIds);
    handleClose();
  };

  useEffect(() => {
    const results = datasets.filter(dataset =>
      dataset.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDatasets(results);
  }, [searchTerm, datasets]);

  useEffect(() => {
    const results = datasets.filter(dataset =>
      dataset.title.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
    setModalFilteredDatasets(results);
  }, [modalSearchTerm, datasets]);

  useEffect(() => {
    if (datasets && assignedDatasetIds) {
      const filtered = datasets.filter(dataset => assignedDatasetIds.includes(dataset.id));
      setFilteredDatasets(filtered);
    }
  }, [datasets, assignedDatasetIds]);

  const handleViewDataset = (dataset) => {
    navigate(`/datasets/${dataset.id}`);
  };
  const handleReturn = () => {
    navigate(`/grp_data/grp_data_list`);
  };

  const name = grpDataDetails ? grpDataDetails.name : 'N/A';
   console.log(name)
  return (
    <div className={styles.organizationManagementPage}>
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <h2 className={styles.sectionTitle}>
          <i className="fa fa-info-circle" aria-hidden="true"></i> &nbsp; Group Details
        </h2>

        <div className={styles.acManagment}>
          {isCreatorOrAdminOrMaintainer ? (
            <>
              <Button className={styles.createOrgButton} onClick={handleUpdateGrpData}>
                Update Group Data &nbsp; <i className="fa fa-plus-circle" aria-hidden="true"></i>
              </Button>
              <Button className={styles.createOrgButton} onClick={handleDeleteGrpData}>
                Delete Group Data &nbsp; <i className="fa fa-trash" aria-hidden="true"></i>
              </Button>
              <Button className={styles.createOrgButton} onClick={handleShow}>
                Add Data to Group &nbsp; <i className="fa fa-plus" aria-hidden="true"></i>
              </Button>
            </>
          ) : (
            <Button className={styles.createOrgButton} onClick={handleShow}>
              Add Data to Group &nbsp; <i className="fa fa-plus" aria-hidden="true"></i>
            </Button>
          )}
        </div>

        <Form onSubmit={(e) => e.preventDefault()} className={styles.searchForm}>
          <div className="input-group">
            <Form.Control
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.formControlsearch}
              placeholder="Search Datasets"
            />
            <Button type="button" className={styles.btn}>
              Search &nbsp; <i className="fa fa-search" aria-hidden="true"></i>
            </Button>
          </div>
        </Form>

        <hr />
        <h4>List of data available:</h4>
        <Table className={`${styles.table} table-light table-hover table-bordered`}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Details</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDatasets.map((dataset) => (
              <tr key={dataset.id}>
                <td>{dataset.title}</td>
                <td>
                  <a
                    href="#"
                    onClick={() => handleViewDataset(dataset)}
                    className="detailsLink"
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Details
                  </a>
                </td>
                <td>
                  <Button className={styles.btnorgdet} onClick={() => handleDownloadDB(dataset.id)}>
                    Download &nbsp; <i className="fa fa-download" aria-hidden="true"></i>
                  </Button>
                  &nbsp; &nbsp;
                  <Button className={styles.btnorgdelete} onClick={() => handleRemoveDatasetFromGrp(dataset.id, id)}>
                    Delete &nbsp; <i className="fa fa-trash" aria-hidden="true"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <button onClick={handleReturn} className={styles.returnButton}>
            Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
               </button>

        </div>
        </div>


        <Modal show={showModal} onHide={handleClose} dialogClassName="group-modal">
  <Modal.Header closeButton >
    <Modal.Title > Select Datasets to Assign</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={(e) => e.preventDefault()} className="searchForm mb-3">
      <div className="search-container">
        <Form.Control
          type="search"
          value={modalSearchTerm}
          onChange={(e) => setModalSearchTerm(e.target.value)}
          className="modal-search-input"

          placeholder="Search Datasets"
        />
        <Button variant="primary" onClick={() => {/* Handle Search */}}>
          Search
        </Button>
      </div>
    </Form>

    {modalSearchTerm && modalFilteredDatasets.length > 0 && (
      <Form>
        {modalFilteredDatasets.map(dataset => (
          <Form.Check
            key={dataset.id}
            type="checkbox"
            id={`dataset-${dataset.id}`}
            label={dataset.title}
            value={dataset.id}
            checked={selectedDatasetIds.includes(dataset.id)}
            onChange={handleDatasetSelection}
          />
        ))}
      </Form>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
      Close
    </Button>
    <Button variant="primary" onClick={handleAssignData}>
      Assign Data
    </Button>
  </Modal.Footer>
</Modal>

      {/* new modal form the CustomAlert */}

      <Modal show={showAlert} onHide={handleCloseCustomAlert}>
        <Modal.Header closeButton>
        <Modal.Title>{errorMessage.type === 'success' ? 'Operation Successful' : 'Permission Denied'}</Modal.Title>
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

GrpDataDetails.propTypes = {
  id: PropTypes.string.isRequired,
  handleUpdateGrpData: PropTypes.func.isRequired,
  handleCloseCustomAlert:PropTypes.func.isRequired,
  handleDeleteGrpData: PropTypes.func.isRequired,
  handleAddDataToGrp: PropTypes.func.isRequired,
  datasets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  grpDataDetails: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    creation_date: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    creator_email: PropTypes.string.isRequired,
    datasets: PropTypes.array,
  }).isRequired,
  handleDatasetSelection: PropTypes.func.isRequired,
  handleDownloadDB: PropTypes.func.isRequired,
  selectedDatasetIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  assignedDatasetIds: PropTypes.arrayOf(PropTypes.number),
  handleRemoveDatasetFromGrp: PropTypes.func.isRequired,
  errorMessage: PropTypes.shape({
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired
};

export default GrpDataDetails;
