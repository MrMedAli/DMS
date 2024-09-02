import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DatasetDetailsComponent from '../components/DatasetDetailsComp.jsx';
import PropTypes from 'prop-types';
import CreateDataset_1 from '../components/CreateDataset_1.jsx';
import CreateDataset_2 from '../components/CreateDataset_2.jsx';
import AppContext from '../components/AppContext';

const DatasetDetailsContainer = ({ datasets }) => {
  const baseURL = 'http://localhost:8000';
  const { datasetId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();


  const [canUpdate, setCanUpdate] = useState(false);
  const [assignedGroups, setAssignedGroups] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [grpDatasets, setGrpDatasets] = useState([]);

  const { fromOrganization } = location.state || {};
  console.log('fromOrganization',fromOrganization)


 const { selectedDb, setSelectedDb } = useContext(AppContext);
  const [selectedDataset, setSelectedDataset] = useState(null);

  console.log('selectedDb from context', selectedDb);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (state && state.dataset) {
          setSelectedDb(state.dataset);
          setSelectedDataset(state.dataset);
        } else {
          const datasetToSelect = datasets.find(dataset => dataset.id === parseInt(datasetId));
          if (datasetToSelect) {
            setSelectedDb(datasetToSelect);
            setSelectedDataset(datasetToSelect);
          } else {
            console.error('Dataset not found or you do not have permission.');
          }
        }
      } catch (error) {
        console.error('Error fetching dataset:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchGrpDatasets();
  }, [state, datasetId, datasets, setSelectedDb]);




  const fetchGrpDatasets = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/create_grp_of_dataset/`);
      setGrpDatasets(response.data);
    } catch (error) {
      console.error('Error fetching group datasets:', error);
    }
  };


const fetchAssignedGroups = async (datasetId) => {
    try {
      const response = await axios.get(`${baseURL}/api/dataset_groups/${datasetId}/`);
      setAssignedGroups(response.data);
    } catch (error) {
      console.error('Error fetching assigned groups:', error);
    }
  };

  const handleRedirections = () => {
    if (selectedDataset) {
      navigate(`/create-dataset-1`, { state: { dataset: selectedDataset } });
    } else {
      console.error('Selected dataset is undefined.');
    }
  };

  const handleDeleteData = async () => {
    try {
      const organizationId = 0;
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



  const assignDatasetsToGrp = async (datasetId, groupId) => {
    const dbtitle = selectedDb.title;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage.');
      return;
    }

    const response = await axios.post(`${baseURL}/api/add_dataset_to_group/`, {
      dataset_id: datasetId,
      group_id: groupId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      alert('Dataset added to group successfully.');
      fetchGrpDatasets(); // Refresh the group datasets list
    } else {
      alert(`You don't have permission for dataset ID ${dbtitle}.`);
    }
  } catch (error) {
    console.error('Error adding dataset to group:', error);
    alert(`You don't have permission for dataset ID ${dbtitle}.`);
  }
};

const handleAddData = (groupId) => {
  if (selectedDataset && selectedDataset.id) {
    assignDatasetsToGrp(selectedDataset.id, groupId);
  } else {
    alert('No dataset selected.');
  }
};




const checkUpdatePermission = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage.');
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/check_dataset_permission/${selectedDataset.id}/`,
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



  useEffect(() => {
    if (selectedDataset && selectedDataset.id) {
      checkUpdatePermission();
      fetchAssignedGroups(selectedDataset.id); // Fetch assigned groups when dataset is selected
    }
  }, [selectedDataset]);


  const handleDownloadDB = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/datasets/${datasetId}/download/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 404) {
        alert('File does not exist.');
        return;
      }
  
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
      alert('You do not have permission to download this dataset');
    }
  };
  

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!selectedDataset) {
    return <p>No dataset selected or you do not have permission to view this dataset.</p>;
  }

console.log('assignedGroups',assignedGroups)

  return (
    <>
      <DatasetDetailsComponent
        selectedDataset={selectedDataset}
        handleRedirections={handleRedirections}
        handleDeleteData={handleDeleteData}
        handleDownloadDB={handleDownloadDB}
        baseURL={baseURL}
        grpDatasets={grpDatasets}
        handleAddData={handleAddData}
        canUpdate={canUpdate}
        assignedGroups={assignedGroups}
        fromOrganization={fromOrganization}
      />
      <Routes>
        <Route path="/create-dataset-1" element={<CreateDataset_1 selectedDataset={selectedDataset} />} />
        <Route path="/create-dataset-2" element={<CreateDataset_2 selectedDataset={selectedDataset} />} />
        
      </Routes>
    </>
  );
};

DatasetDetailsContainer.propTypes = {
  datasets: PropTypes.array
};

DatasetDetailsContainer.defaultProps = {
  datasets: [] // Default to an empty array
};

export default DatasetDetailsContainer;
