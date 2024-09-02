import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import OrgDetailsComp from '../components/OrgDetailsComp';
import OrgActionsComp from '../components/OrgActionsComp';
import axios from 'axios';

const OrgDetailsContainer = ({ selectedOrganization }) => {
  const baseURL = 'http://localhost:8000';
  
console.log("selectedOrganizationhhhh",selectedOrganization)
const [grpOfDatasets, setGrpOfDatasets] = useState([]); // New state for the list of datasets

  const [grpOfDatasetsinOrg, setgrpOfDatasetsinOrg] = useState([]); // New state for the list of datasets

  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [organizationDatasets, setOrganizationDatasets] = useState([]);
  const [showOrgActions, setShowOrgActions] = useState(false); // Toggle between OrgDetailsComp and OrgActionsComp
  
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ type: '', message: '' });
  const [selectedDataset, setSelectedDataset] = useState(null); // Manage selected dataset state
  const [selectedOrganizations, setselectedOrganizations] = useState(null); // Manage selected organization state




  // const [alertMessage, setAlertMessage] = useState(null);
  // const [alertType, setAlertType] = useState(''); // 'success' or 'error'

  const datasetId = organizationDatasets.id
  console.log('eee',datasetId)
  console.log('eee',selectedOrganizations)

  useEffect(() => {
    fetchDatasets();
    if (selectedOrganization) {
      fetchOrganizationDatasets(selectedOrganization.id);
    }
  }, [selectedOrganization]);



  const fetchGrpOfDatasets = async (organizationId) => { // New function to fetch group datasets
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${baseURL}/api/org-grpdb/${organizationId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setgrpOfDatasetsinOrg(response.data);
    console.log('Group datasets fetched successfully:', response.data);
  } catch (error) {
    console.error('Error fetching group datasets:', error);
  }
  };
  
 useEffect(() => {
    fetchDatasets();
    if (selectedOrganization) {
      fetchOrganizationDatasets(selectedOrganization.id);
      fetchGrpOfDatasets(selectedOrganization.id);
    }
  }, [selectedOrganization]);

  console.log('grpOfDatasetsinOrg', grpOfDatasetsinOrg);



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

  const fetchOrganizationDatasets = async (organizationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/org-datasets/${organizationId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrganizationDatasets(response.data);
      console.log('Datasets fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching organization datasets:', error);
    }
  };



  
  const assignDatasetsToOrganization = async (organizationId, datasetIds) => {
    console.log('datasetIds');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}/api/organizations/${organizationId}/assign-datasets/`, {
        dataset_ids: datasetIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    if (response.status === 200) {
        // alert(response.data.status);
        setErrorMessage({ type: 'success', message: response.data.status });
        setShowAlert(true);
        // Optionally refresh the datasets or update state
      }
    } catch (error) {
      if (error.response) {
        
         if (error.response.status == 403)
          { console.log('datasetIds forbidden',datasetIds, ' organizationId forbidden',organizationId )
           console.log('selectedOrganization.name',selectedOrganization.name)
            setErrorMessage({ type: 'error', message: error.response.data.error });
            if (error.response.data.is_mine_organization) {
              // If the organization belongs to the user, send only the dataset ID
              setSelectedDataset({ id: datasetIds[0] });
              setselectedOrganizations({ id: "", name: "" }); // Set organization as empty
            } else {
              // If not, send the organization details as well
              setSelectedDataset({ id: '' });
              setselectedOrganizations({ id: organizationId, name: selectedOrganization.name });
            }
      
            setShowAlert(true);

          }
         else 
         {
            setErrorMessage({ type: 'error', message: error.response.data.error });

            setShowAlert(true);
          console.log('status111', error.response.status);
        }
      } else {
         setErrorMessage({ type: 'error', message: 'An unexpected error occurred' });

      }
    }
  };



  const handleAddData = (organizationId, selectedDatasetIds) => {
    assignDatasetsToOrganization(organizationId, selectedDatasetIds);
  };

  const handleManageOrg = () => {
    navigate(`/organizations/org_details/${selectedOrganization.id}/manage_org`, {

    });
    setShowOrgActions(true); 
  };
  // close CustomAlert
  const handleCloseCustomAlert = () => {
    setShowAlert(false);
  };
  useEffect(() => {

    const fetchGrpOfDatasets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/create_grp_of_dataset/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch GrpOfDataset');
        }

        const data = await response.json();
        setGrpOfDatasets(data);
      } catch (error) {
        console.error('Error fetching GrpOfDataset:', error);
      }
    };
    fetchGrpOfDatasets();

  }, []);


  // const handleViewRequest = () => {
  //   // Implement view request functionality
  // };

  
const handleDeleteOrg = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${baseURL}/api/delete_org/${selectedOrganization.id}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        alert('Organization Deleted Successfully');
        navigate('/organizations/org_management');
    } catch (error) {
        console.error('Error deleting organization:', error);
        if (error.response) {
            alert("You do not have permission to delete this organization");
        }
    }
};

  const handleDeleteData = async (datasetId, organizationId) => {
    try {
      console.log('organizationId: ', organizationId, 'datasetId: ',datasetId)
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}/api/datasets/${datasetId}/organizations/${organizationId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Dataset Deleted Successfully');
      navigate('/dataset_management');
    } catch (error) {
      console.error('Error deleting dataset:', error);
      if (error.response) {
        alert("You do not have permission to delete this dataset");
      }
    }
  };   
  

  
const handleDownloadDB = async (datasetId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/api/datasets/${datasetId}/download/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download dataset.');
    }

    let filename = 'dataset';
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    alert('Dataset downloaded successfully.');
    navigate('/dataset_management');
  } catch (error) {
    console.error('Error downloading dataset:', error);
    alert("You do not have permission to download this dataset");
  }
};


  

  const handleSearch = (event) => {
    event.preventDefault();
    // Implement search functionality
  };

  if (!selectedOrganization) {
    return <div>Loading organization details...</div>;
  }


    console.log("grpOfDatasetsinOrg", grpOfDatasetsinOrg);
    console.log("grpOfDatasetsinOrg", grpOfDatasetsinOrg);

  return (
    <>
      {showOrgActions ? (
        <OrgActionsComp
          organization={selectedOrganization}
          datasets={datasets}
          handleAddData={handleAddData}
          handleDeleteOrg={handleDeleteOrg}
          handleDownloadDB={handleDownloadDB}
          handleDeleteData={handleDeleteData}
          grpOfDatasets={grpOfDatasets}
          grpOfDatasetsinOrg={grpOfDatasetsinOrg}
          organizationDatasets={organizationDatasets}
          showAlert={showAlert}
          errorMessage={errorMessage}
          handleCloseCustomAlert = {handleCloseCustomAlert}
          selectedOrganizations={selectedOrganizations}
          selectedDataset={selectedDataset}
          // showAlert={showAlert}
          // errorMessage={errorMessage}
        />
      ) : (
        <OrgDetailsComp
          selectedOrganizations={selectedOrganizations}
          showAlert={showAlert}
          errorMessage={errorMessage}
          handleCloseCustomAlert = {handleCloseCustomAlert}
          selectedDataset={selectedDataset}
          organization={selectedOrganization}
          handleAddData={handleAddData}
          handleManageOrg={handleManageOrg}
          handleSearch={handleSearch}
          datasets={datasets}
          organizationDatasets={organizationDatasets} // Pass the fetched datasets to the component
        />
      )}
    </>
  );
};

OrgDetailsContainer.propTypes = {
  selectedOrganization: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    creator: PropTypes.string,
  }),
};

export default OrgDetailsContainer;
