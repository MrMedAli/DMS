import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GrpDataDetails from '../components/GrpDataDetailsComp';

const baseURL = 'http://127.0.0.1:8000'; // Ensure this matches your API base URL

const GrpDataDetailsContainer = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { grpOfDatasets } = location.state || { grpOfDatasets: [] };

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState([]);
  const [assignedDatasetIds, setAssignedDatasetIds] = useState([]);
  const [grpDataDetails, setGrpDataDetails] = useState(null);
  const [grpOfDataset, setGrpOfDataset] = useState([]);
 
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null); // Manage selected dataset state
  const [selectedOrganizations, setselectedOrganizations] = useState(null); // Manage selected organization state

  useEffect(() => {


    const fetchGrpDataDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/grpofdataset/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setGrpDataDetails(response.data);
      } catch (error) {
        console.error('Error fetching group data details:', error);
      }
    };






    const fetchDatasets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/datasets_list/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setDatasets(response.data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
      }
    };

    const fetchAssignedDatasetIds = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/get_assigned_datasets/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAssignedDatasetIds(response.data.map(dataset => dataset.id)); // Assuming response.data is an array of datasets
      } catch (error) {
        console.error('Error fetching assigned datasets:', error);
      }
    };

    fetchDatasets();
    fetchGrpDataDetails();
    fetchAssignedDatasetIds();
  }, [id]);


const handleUpdateGrpData = () => {
    navigate('/grp_data/create_grp_data', { state: { isUpdateMode: true, grpDataDetails } });
  };
console.log('dataset',grpOfDatasets)

const handleDeleteGrpData = () => {
  axios.delete(`http://localhost:8000/api/create_grp_of_dataset/${id}/`)
    .then(response => {
      console.log('Group of dataset deleted successfully:', response.data);

      alert("Group of dataset deleted successfully");
      navigate('/grp_data/grp_data_list')

      setGrpOfDataset(grpOfDatasets.filter(dataset => dataset.id !== id));

      // Remove the deleted group from the state
    })
    .catch(error => {
      console.error('There was an error deleting the group of dataset:', error.response?.data || error.message);
      alert('Failed to delete group of dataset');
    });
};
  
// const showError = (errorMessage) => {
//   const link = 'http://example.com/ask-permission'; // Replace with your actual link
//   alert(`${errorMessage} Please ask permission from the link: ${link}`);
// };

console.log(selectedDatasetIds,'selectedDatasetIds');
  const assignDatasetsToGrpData = async (id, selectedDatasetIds) => {
    try {
      console.log(selectedDatasetIds,'selectedDatasetIds');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${baseURL}/api/assign_dataset_to_grp/${id}/`,
        { dataset_ids: selectedDatasetIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setErrorMessage({ type: 'success', message: response.data.status });

        setShowAlert(true);
        // Optionally refresh the datasets or update state
        setAssignedDatasetIds(prevIds => [...prevIds, ...selectedDatasetIds]);
      }
    } catch (error) {
      if (error.response) {
        
         if (error.response.status == 403)
          {
              setErrorMessage({ type: 'error', message: error.response.data.error });

            setSelectedDataset({ id: selectedDatasetIds }); // Set the selected dataset for demonstration
            setselectedOrganizations({ id: '' }); // Set the selected organization for demonstration
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

  const handleCloseCustomAlert = () => {
    setShowAlert(false);
  };
  const handleAddDataToGrp = (id, selectedDatasetIds) => {
    assignDatasetsToGrpData(id, selectedDatasetIds);
  };

  const handleDatasetSelection = (event) => {
    const { value, checked } = event.target;
    setSelectedDatasetIds((prevIds) =>
      checked ? [...prevIds, parseInt(value)] : prevIds.filter((id) => id !== parseInt(value))
    );
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


const handleRemoveDatasetFromGrp = async (datasetId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${baseURL}/api/remove_dataset_from_grp/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { 
        grpdata_id: id,
        dataset_id: datasetId
      }
    });

    if (response.status === 200) {
      alert('Dataset removed from group successfully');
      // Update the state to reflect the removal
      setAssignedDatasetIds(prevIds => prevIds.filter(id => id !== datasetId));
    }
  } catch (error) {
    console.error('Error removing dataset from group:', error);
    alert('Failed to remove dataset from group');
  }
};





  
  console.log('grpDataDetails',grpDataDetails)
  return (
    <GrpDataDetails
      id={id}
      showAlert={showAlert}
      errorMessage={errorMessage}
      handleCloseCustomAlert = {handleCloseCustomAlert}
      selectedDataset={selectedDataset}
      selectedOrganizations ={selectedOrganizations}
      handleUpdateGrpData={handleUpdateGrpData}
      handleDeleteGrpData={handleDeleteGrpData}
      handleAddDataToGrp={handleAddDataToGrp}
      datasets={datasets}
      handleDatasetSelection={handleDatasetSelection}
      handleDownloadDB={handleDownloadDB}
      selectedDatasetIds={selectedDatasetIds}
      assignedDatasetIds={assignedDatasetIds} // Ensure this is passed correctly
      grpOfDatasets={grpOfDatasets} // If needed
      grpDataDetails={grpDataDetails}
      grpOfDataset={grpOfDataset}
      handleRemoveDatasetFromGrp={handleRemoveDatasetFromGrp}

    />
  );
};

export default GrpDataDetailsContainer;
