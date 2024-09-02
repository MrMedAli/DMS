import PropTypes from 'prop-types';
import NavbarComponent from './NavbarComponent';
import Footer from './Footer';
import { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table,Button } from 'react-bootstrap';
import styles from './Organization.module.css'; // Import CSS Module

import AppContext from './AppContext'; // Import the combined context
// import './AuthComp.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



// breadcrumbversion 




const AccountsManagement = ({ accounts, loading, setVisibleForm }) => {
  const { setSelectedAccount } = useContext(AppContext); // Use the combined context

    const { user  } = useContext(AppContext);
  const userRole = user.role
  console.log(userRole)

  const navigate = useNavigate();

  const handleUpdateAccount = (account) => {
    console.log("account details ", account);
    setSelectedAccount(account);
    navigate('/update_account');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

const handleDelete = async (accountId) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.delete(`http://localhost:8000/users/${accountId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Account deleted:', response.data);

    alert('Account deleted successfully');

  
      navigate('/graph');
    
  } catch (err) {
    console.error('Error deleting account:', err);
  }
};

const handleReturn = () => {
  window.history.go(-1); // Go back one step in the history
};

  return (
    <div className={styles.datasetManagementPage}>
      <div className={styles.mainContainer}>
      <NavbarComponent userType="customer"   setVisibleForm={setVisibleForm}  />
      <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>   
            <i className="fa fa-users " aria-hidden="true"></i> &nbsp; Account Management
          </h2>
<Table className={`${styles.table} table-light table-hover table-bordered`}>
  <thead className="table-light">
    <tr>
      <th scope="col">User Name</th>
      <th scope="col">First Name</th>
      <th scope="col">Last Name</th>
      <th scope="col">Email</th>
      <th scope="col">Role</th>
      <th scope="col" style={{ textAlign: 'center' }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {accounts.map((account) => (
      <tr key={account.username}>
        <td>{account.username ?? 'N/A'}</td>
        <td>{account.first_name ?? 'N/A'}</td>
        <td>{account.last_name ?? 'N/A'}</td>
        <td>{account.email ?? 'N/A'}</td>
        <td>
  {account.groups ? account.groups.map((group) => (
    <p key={group} className={styles.btnroleuser} >
      {group}
    </p>
  )) : 'No groups'}
</td>

        <td style={{ textAlign: 'center' }}>
         


        <Button className={`${styles.btnuserupdate} ${styles['btnuserupdate-left']}`} onClick={() => handleUpdateAccount(account)}>
        
                            Update &nbsp; <i className="bi bi-database-fill-down"></i>
                          </Button> &nbsp;
                          <Button className={`${styles.btnuserdelete} ${styles['btnuserdelete-left']}`}onClick={() => handleDelete(account.id)}
                          >
                            Delete &nbsp; <i className="bi bi-trash3-fill"></i>
                          </Button>


        </td>
      </tr>
    ))}
  </tbody>
</Table>


              <div className={styles.buttonContainer}>
                {userRole === 'admin' && (
                  <Button className={styles.createOrgButton} onClick={() => navigate('/create_account')}>
                    Add Account &nbsp; <i className="bi bi-plus-square" aria-hidden="true"></i>
                  </Button>
                )}
                
                <Button onClick={handleReturn} className={styles.returnButton}>
                  Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
                </Button>
              </div>

      </div>
      <Footer />
    </div>
    </div>

  );
};

AccountsManagement.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      email: PropTypes.string,
      groups: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  setVisibleForm: PropTypes.func.isRequired,
};

export default AccountsManagement;
