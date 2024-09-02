import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {  Button, Form, Table } from 'react-bootstrap';
import styles from './Organization.module.css'; // Import CSS Module

const GrpDataList = ({ grpOfDatasets, handleViewGrpDb }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter datasets based on search term
  const filteredGrpOfDatasets = grpOfDatasets.filter(grp =>
    grp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.datasetManagementPage} ${styles.organizationManagementPage}`}>
      <div className={styles.mainContainer}>
        <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>
            <i className="fa fa-database" aria-hidden="true"></i> &nbsp; Group of Datasets
          </h2>
          <div className={styles.acManagment}>
        
            <Link to="/grp_data/create_grp_data" className={styles.noUnderline}>
              <Button className={styles.createOrgButton}>
              Create Grp_Dataset &nbsp; <i className="bi bi-plus-square"></i>
              </Button>
            </Link>
            </div>
            <Form className={styles.searchForm}>
             
                <Form.Control
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.formControlsearch}
                  placeholder="Search Group of Datasets"
                />
                
                  <Button type="button" className={styles.btn}>
                    Search  &nbsp; <i className="bi bi-search"></i>
                  </Button>
              
          
            </Form>
          <hr />
          <p>{`Found ${filteredGrpOfDatasets.length} Dataset group(s)`}</p>
          <h3 className={styles.searchResultsTitle}>List of Group of Datasets:</h3>
             
              <Table className={styles.table} striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Creator</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrpOfDatasets.length > 0 ? (
                    filteredGrpOfDatasets.map((grp) => (
                      <tr key={grp.id}>
                        <td>{grp.name}</td>
                        <td>{grp.description}</td>
                        <td>{grp.creator}</td>
                        <td>
                          <a
                            href="#"
                            onClick={() => handleViewGrpDb(grp)}
                            className={styles.detailsLink}
                          >
                            Details
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No datasets found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <br />
            
          
            <Link to="/graph" className={styles.returnButton}>
              Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
            </Link>
          
        </div>
      </div>
    </div>
  );
};

GrpDataList.propTypes = {
  grpOfDatasets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      creator: PropTypes.string,
      creator_email: PropTypes.string,
    })
  ).isRequired,
  handleViewGrpDb: PropTypes.func.isRequired,
};

export default GrpDataList;
