import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import Footer from './Footer';
import PropTypes from 'prop-types';
import NotificationButton from './NotificationButtonComp';
import AppContext from './AppContext';
import styles from './Organization.module.css'; // Import CSS Module

const DatasetManagement = ({ datasets }) => {
  const { user } = useContext(AppContext);
  const userId = user.userid;
  const userRole = user.role;

  const [displayedDatasets, setDisplayedDatasets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setDisplayedDatasets(datasets);
  }, [datasets]);

  const baseURL = 'http://localhost:8000';

  const handleCreateDataset = () => {
    navigate('/create-dataset-1');
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await axios.get(`${baseURL}/api/search_db/`, {
        params: { search: searchQuery },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data.results.length > 0) {
        const datasetsWithDetails = response.data.results.map(dataset => ({
          ...dataset,
          maintainer: dataset.maintainer || "Not specified",
          source_of_data: dataset.source_of_data || "Not specified",
          version: dataset.version || "Not specified"
        }));
        setDisplayedDatasets(datasetsWithDetails);
      } else {
        setDisplayedDatasets([]);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleViewDataset = (dataset) => {
    navigate(`/datasets/${dataset.id}`, { state: { dataset, isUpdateMode: false } });
  };

  return (
    <div className={styles.datasetManagementPage}>
      <div className={styles.mainContainer}>
        <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>   
            <i className="bi bi-database-fill-gear" aria-hidden="true"></i> &nbsp; Datasets Management
          </h2>
          <div className={styles.acManagment}>
            <Button onClick={handleCreateDataset} className={styles.createDbButton}>
              Create Data &nbsp; <i className="bi bi-plus-square"></i>
            </Button>
            {userRole !== 'admin' && <NotificationButton userRole={userRole} userId={userId} />}
          </div>
          <Form onSubmit={handleSearch} className={styles.searchForm}>
            <Form.Control
              type="search"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.formControlsearch}
              placeholder="Search (all db)"
              aria-label="Search"
              aria-describedby="search-addon"
            />
            <Button type="submit" className={styles.btn}>
              Search &nbsp; <i className="bi bi-search"></i>
            </Button>
          </Form>
          <hr />
          <p>{`Found ${displayedDatasets.length} dataset(s)`}</p>
          <h3 className={styles.searchResultsTitle}>Datasets List:</h3>
          <Table className={`${styles.table} table-light table-hover table-bordered`}>
            <thead className="table-light">
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Creation Date</th>
                <th scope="col">Creator</th>
                <th scope="col">Maintainer</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedDatasets.length > 0 ? (
                displayedDatasets.map(dataset => (
                  <tr key={dataset.id}>
                    <td>{dataset.title}</td>
                    <td>{new Date(dataset.creation_date).toLocaleDateString()}</td>
                    <td>{dataset.creator_username}</td>
                    <td>{dataset.maintainer}</td>
                    <td>
                      <a
                        href="#"
                        onClick={() => handleViewDataset(dataset)}
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Details
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-results">
                  <td colSpan="5">No datasets found</td>
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
      <Footer />
    </div>
  );
};

DatasetManagement.propTypes = {
  datasets: PropTypes.array.isRequired,
};

export default DatasetManagement;
