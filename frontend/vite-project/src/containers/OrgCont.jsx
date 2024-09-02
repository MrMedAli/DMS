import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import OrganizationComp from '../components/OrgComp';
import OrganizationManagement from '../components/OrgManagement';
import AppContext from '../components/AppContext';
import OrgDetailsContainer from './OrgDetailsCont';
// import OrgActionsCont from './OrgActionsCont';

const OrganizationContainer = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [users, setUsers] = useState([]);
  const [maintainer, setMaintainer] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [maintainerEmail, setMaintainerEmail] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const { user } = useContext(AppContext);
  const creator = user?.username || '';
  const navigate = useNavigate();
  const location = useLocation();


const { organization, isUpdateMode ,permissions } = location.state || {};

console.log('lllllll',permissions)

  const fetchDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/datasets/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchOrgs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/create-organization/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrganizations(response.data);
  
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  useEffect(() => {
    fetchDatasets();
    fetchUsers();
    fetchOrgs();

    

    if (isUpdateMode && organization) {
      setName(organization.name);
      setDescription(organization.description);
      setMaintainer(organization.maintainer||organization.maintainer_username);
      setCreatorEmail(organization.creator_email);
      setMaintainerEmail(organization.maintainer_email); 
    }
  }, [isUpdateMode, organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      description,
      maintainer_username: maintainer,
      creator_email: creatorEmail,
    maintainer_email: maintainerEmail, // Ensure this value is correct
    };

    try {
      const token = localStorage.getItem('token');
      if (isUpdateMode) {
        await axios.put(`http://127.0.0.1:8000/api/update-organization/${organization.id}/`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        alert('Organization updated successfully');
      } else {
        await axios.post('http://127.0.0.1:8000/api/create-organization/', data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        alert('Organization created successfully');
      }
      navigate('/organizations/org_management');
      fetchOrgs(); 
    } catch (error) {
      console.error('Error submitting organization:', error.response ? error.response.data : error.message);
    }
  };

  console.log("ooooooo", organization)
  
  const handleViewOrg = (organization) => {
    setSelectedOrganization(organization);
    navigate(`/organizations/org_details/${organization.id}`);
  };
  console.log("selectedOrganization",selectedOrganization)
  return (
    <>
      <Routes>
        <Route
          path="create_organization"
          element={
            <OrganizationComp
              name={name}
              description={description}
              datasets={datasets}
              selectedDataset={selectedDataset}
              setName={setName}
              setDescription={setDescription}
              setDataset={setSelectedDataset}
              handleSubmit={handleSubmit}
              maintainer={maintainer}
              creatorEmail={creatorEmail}
              maintainerEmail={maintainerEmail}
              creator={creator}
              users={users}
              setMaintainer={setMaintainer}
              setCreatorEmail={setCreatorEmail}
              setMaintainerEmail={setMaintainerEmail}
            />
          }
        />
        <Route
          path="org_management"
          element={
            <OrganizationManagement 
              organizations={organizations} 
              handleViewOrg={handleViewOrg} 
            />
          }
        />
        <Route
          path="org_details/:id/*"
          element={<OrgDetailsContainer selectedOrganization={selectedOrganization} />}
        />

 {/* <Route
          path="org_actions/:id/*"
          element={<OrgActionsCont organization={selectedOrganization} />}
        />  */}
      </Routes>
    </>
  );
};

export default OrganizationContainer;
