import { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import GrpDataComp from '../components/AddGrpData';
import PropTypes from 'prop-types';
import AppContext from '../components/AppContext';
import GrpDataList from '../components/GrpDataList'; // Import the new GrpDataList component
import GrpDataDetailsContainer from './GrpDataDetailsCont'; // Import the new GrpDataDetailsContainer component

const GrpDataContainer = () => {
  const location = useLocation();
  const { isUpdateMode, grpDataDetails } = location.state || {};
  const groupId = grpDataDetails ? grpDataDetails.id : null;

  const navigate = useNavigate();
  const { user } = useContext(AppContext); // Get the current user context
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    creator: '',
    creator_email: '',
  });
  const [grpData, setGrpData] = useState(null);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [grpOfDatasets, setGrpOfDatasets] = useState([]); // New state for the list of datasets


  console.log(grpData,error)
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

  useEffect(() => {
    if (isUpdateMode && grpDataDetails) {
      // Initialize form fields with values from grpDataDetails in update mode
      setFormData({
        name: grpDataDetails.name,
        description: grpDataDetails.description,
        creator: grpDataDetails.creator,
        creator_email: grpDataDetails.creator_email,
      });
    } else {
      // Set creator to current user in create mode
      setFormData((prevData) => ({
        ...prevData,
        creator: user.username, // Set current user's username
      }));
    }
  }, [isUpdateMode, grpDataDetails, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const saveGrpOfDataset = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const method = isUpdateMode ? 'PUT' : 'POST';
      const url = isUpdateMode
        ? `http://localhost:8000/api/create_grp_of_dataset/${groupId}/`
        : 'http://localhost:8000/api/create_grp_of_dataset/';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.error}`);
      }

      const responseData = await response.json();
      setGrpData(responseData);

      alert(isUpdateMode ? 'Group of dataset updated successfully!' : 'Group of dataset created successfully!');
      
      // Use setTimeout to ensure that the alert has finished before navigating
      setTimeout(() => {
        navigate('/grp_data/grp_data_list');
      }, 500);
    } catch (error) {
      setError(error.message);
      console.error('Error saving GrpOfDataset:', error);
    }
  };

  const handleViewGrpDb = (grp) => {
    console.log("grp.id", grp.id);
    navigate(`/grp_data/grp_data_details/${grp.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      await saveGrpOfDataset(formData);
    } catch (error) {
      setSubmitError(error.message);
      console.error('Error submitting form:', error);
    }
  };

  console.log("grpOfDatasets", grpOfDatasets);

  return (
    <Routes>
      <Route
        path="/create_grp_data"
        element={
          <GrpDataComp
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            submitError={submitError}
            isUpdateMode={isUpdateMode}
          />
        }
      />
      <Route
        path="/grp_data_list"
        element={<GrpDataList grpOfDatasets={grpOfDatasets} handleViewGrpDb={handleViewGrpDb} />} // Pass the dataset list to GrpDataList
      />
      <Route
        path="/grp_data_details/:id/*"
        element={<GrpDataDetailsContainer grpOfDatasets={grpOfDatasets} />}
      />
    </Routes>
  );
};

GrpDataContainer.propTypes = {
  isUpdateMode: PropTypes.bool,
  groupId: PropTypes.number,
};

export default GrpDataContainer;
