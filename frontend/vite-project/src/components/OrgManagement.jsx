import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import NotificationButton from './NotificationButtonComp';
import AppContext from './AppContext';
import styles from './Organization.module.css'; // Import CSS Module

const OrganizationManagement = ({ organizations, handleViewOrg }) => {
  const { user } = useContext(AppContext);
  const userId = user.userid;
  const userRole = user.role;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrganizations, setFilteredOrganizations] = useState(organizations);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/search_org/?search=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setFilteredOrganizations(response.data.results);
    } catch (error) {
      console.error('Error searching organizations:', error);
    }
  };

  const handleViewOrganization = (organization) => {
    handleViewOrg(organization);
    navigate(`/organizations/org_details/${organization.id}`);
  };

  const organizationsToDisplay = searchQuery ? filteredOrganizations : organizations;

  return (
    <div className={styles.organizationManagementPage}>
      <div className={styles.mainContainer}>
        <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>
            <i className="fa fa-building" aria-hidden="true"></i> &nbsp; Organizations Management
          </h2>
          <div className={styles.acManagment}>
            <Link to="/organizations/create_organization" className={styles.noUnderline}>
              <Button className={styles.createOrgButton}>
                Create Organization &nbsp; <i className="bi bi-plus-square"></i>
              </Button>
            </Link>
            {userRole !== 'admin' && (
              <NotificationButton className={styles.notifBtn} userRoleOrg={userRole} userIdOrg={userId} />
            )}
          </div>
          <Form onSubmit={handleSearch} className={styles.searchForm}>
            <Form.Control
              type="search"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.formControlsearch}
              placeholder="Search organizations"
              aria-label="Search"
              aria-describedby="search-addon"
            />
            <Button type="submit" className={styles.btn}>
              Search  &nbsp; <i className="bi bi-search"></i>
            </Button>
          </Form>
          <hr />
          <p>{`Found ${organizationsToDisplay.length} organization(s)`}</p>
          <h3 className={styles.searchResultsTitle}>Organizations List :</h3>
          <Table className={`${styles.table} table-light table-hover table-bordered`}>
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Created At</th>
                <th>Creator</th>
                <th>Maintainer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizationsToDisplay.length > 0 ? (
                organizationsToDisplay.map((organization) => (
                  <tr key={organization.id}>
                    <td>{organization.name}</td>
                    <td>{new Date(organization.created_at).toLocaleDateString()}</td>
                    <td>{organization.creator_username}</td>
                    <td>{organization.maintainer}</td>
                    <td>
                      <a
                        href="#"
                        onClick={() => handleViewOrganization(organization)}
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Details
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-results">
                  <td colSpan="5">No organizations found</td>
                </tr>
              )}
            </tbody>
          </Table>
          <br />
          <Link to="/dashboard" className={styles.returnButton}>
            Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

OrganizationManagement.propTypes = {
  organizations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      creator_username: PropTypes.string.isRequired,
      maintainer: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleViewOrg: PropTypes.func.isRequired,
};

export default OrganizationManagement;
