import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import CreateDataset_1 from '../components/CreateDataset_1.jsx';
import CreateDataset_2 from '../components/CreateDataset_2.jsx';
import DatasetManagement from '../components/DatasetManagementComp';
import DatasetDetailsContainer from './DatasetDetailsCont';
import AppContext from '../components/AppContext';

const CreateDatasetContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedDataset = location.state?.selectedDataset || {}; // Use optional chaining and default to an empty object
  const isUpdateMode = location.state?.isUpdateMode || false;

  
  const [showModal, setShowModal] = useState(false);
  const { setUser } = useContext(AppContext); // Use context to set user information
  
  const [formDataStep1, setFormDataStep1] = useState({
    title: '',
    link: '',
    creator_email: '',
    maintainer_email: '',
    source_of_data: '',
    creatorUsername: '',
    maintainers: []
  });

  const [formDataStep2, setFormDataStep2] = useState({
    format: '',
    File_name: '',
    description: '',
    file: null,
    version: '',
    creatorId: ''
  });

  const [users, setUsers] = useState([]);
  

  const [selectedUser, setSelectedUser] = useState('');
  const [datasets, setDatasets] = useState([]);

console.log("selecteddbppp",selectedDataset)

  // Function to fetch user details
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/users/role/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUser(response.data);      
      
    if (isUpdateMode && selectedDataset.id) {
      setFormDataStep1(prevState => ({
        ...prevState,
        creatorUsername: selectedDataset.creator_username,
        // maintainerUsername: selectedDataset.maintainer,

      }));
      setFormDataStep2(prevState => ({
        ...prevState,
        creatorId: selectedDataset.creator_id,
      }));
      console.log("creatorUsername", formDataStep1.creatorUsername) 
      console.log("creatorId",formDataStep2.creatorId) 

    } else {
      setFormDataStep1(prevState => ({
        ...prevState,
        creatorUsername: response.data.username,
      }));
  

    setFormDataStep2(prevState => ({
      ...prevState,
      creatorId: response.data.userid
    }));
  }



      
      const usersResponse = await axios.get('http://localhost:8000/api/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setUsers(usersResponse.data.users);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Function to fetch datasets
  const fetchDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.get('http://localhost:8000/api/datasets-by-user/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

   
  // Function to fetch dataset details for update mode
  const fetchDataset = async () => {
    if (isUpdateMode && selectedDataset.id) {
      try {
        const dataset = selectedDataset;
        console.log('dataset',dataset)
        setFormDataStep1({
          title: dataset.title,
          link: dataset.link,
          creator_email: dataset.creator_email,
          maintainer_email: dataset.maintainer_email,
          source_of_data: dataset.source_of_data,
          creatorUsername: dataset.creatorUsername,
          // maintainerUsername: dataset.maintainer,

          maintainers: dataset.maintainer
        });
        setFormDataStep2({
          format: dataset.format,
          File_name: dataset.File_name,
          description: dataset.description,
          file: dataset.file,
          version: dataset.version,
          creatorId: dataset.creatorId
        });
        setSelectedUser(dataset.maintainer);
      } catch (error) {
        console.error('Error fetching dataset details:', error);
      }
    }
  };
console.log('FormDataStep1',formDataStep1)
  // Call the functions inside useEffect
  useEffect(() => {
    fetchUserDetails();
    fetchDatasets();
    fetchDataset();
  }, [isUpdateMode, selectedDataset.id]);

  const slugify = (text) => text.toString().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/__+/g, '_')
    .replace(/^_+/, '')
    .replace(/_+$/, '');

    const isValidURL = (url) => {
      const urlPattern = new RegExp(
        '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // Allow capital letters in the path
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
        'i'
      );
      return !!urlPattern.test(url);
    };
    

  const handleChangeStep1 = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      const slug = slugify(value);
      const urlPrefix = 'https://www.dms.com/';
      handleChangeStep1({
        target: { name: 'link', value: urlPrefix + slug }
      });
    }
    setFormDataStep1(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleChangeStep2 = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const selectedFile = files[0];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      setFormDataStep2(prevState => ({
        ...prevState,
        format: fileExtension,
        [name]: selectedFile
      }));
    } else {
      setFormDataStep2(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    if (!isValidURL(formDataStep1.source_of_data)) {
      alert('The source of data must be a valid URL.');
      setShowModal(true);
      return;
    }
    localStorage.setItem('formDataStep1', JSON.stringify(formDataStep1));
    navigate('/create-dataset-2', { state: { selectedDataset, isUpdateMode: !!selectedDataset.id } });
  };

  const handleSubmitStep2 = async (formDataToSend) => {
    const formDataStep1 = JSON.parse(localStorage.getItem('formDataStep1'));

    Object.keys(formDataStep1).forEach((key) => {
      formDataToSend.append(key, formDataStep1[key]);
    });

    // Append each key-value pair from formDataStep2 to formDataToSend
    Object.keys(formDataStep2).forEach((key) => {
      formDataToSend.append(key, formDataStep2[key]);
    });

    formDataToSend.append('creator', formDataStep2.creatorId);
    formDataToSend.append('maintainer', selectedUser);
try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication token not found.');

    if (isUpdateMode) {
      await axios.put(`http://localhost:8000/api/datasets/${selectedDataset.id}/update/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
    } else {
      await axios.post('http://localhost:8000/api/datasets/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

  }
        alert(`Dataset ${isUpdateMode ? 'updated' : 'created'} successfully!`);

    navigate('/dataset_management');
  } catch (error) {
    console.error('Error creating/updating dataset:', error);
  }
  };
  

  const handleBack = () => {
    navigate('/create-dataset-1');
  };

  const closeModal = () => {
    setShowModal(false);
  };


  return (
    <>
      <Routes>
        <Route
          path="/create-dataset-1"
          element={
            <CreateDataset_1
              formData={formDataStep1}
              onChange={handleChangeStep1}
              onSubmit={handleSubmitStep1}
              users={users}
              selectedUser={selectedUser}
              onUserChange={handleUserChange}
              isUpdateMode={isUpdateMode}
              selectedDataset={selectedDataset}
            />
          }
        />
        <Route
          path="/create-dataset-2"
          element={
            <CreateDataset_2
              formData={formDataStep2}
              onChange={handleChangeStep2}
              onSubmit={handleSubmitStep2}
              onBack={handleBack}
            />
          }
        />
        <Route path="/dataset_management" element={<DatasetManagement datasets={datasets} />} />
        <Route path="/datasets/:datasetId/*" element={<DatasetDetailsContainer datasets={datasets} />} />
      </Routes>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>The source of data must be a valid URL.</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateDatasetContainer;
