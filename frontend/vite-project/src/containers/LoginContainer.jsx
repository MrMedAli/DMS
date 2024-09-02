import { useState, useContext } from 'react';
import axios from 'axios';
import LoginComponent from '../components/LoginComponent';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AppContext from '../components/AppContext';

const LoginContainerForm = ({ onSuccess, setVisibleForm }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(AppContext); // Use context to set user information




  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [alertMessage, setAlertMessage] = useState(null); // State for alert messages
  const [alertType, setAlertType] = useState(''); // State for alert type ('success' or 'error')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchUserDetails = (token) => {
    axios.get('http://localhost:8000/api/users/role/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        console.log("User details: ", res.data);
        const user = res.data;
        setUser(user); 
          navigate('/graph');
        // }
      })
      .catch(error => {
        console.error("Error fetching user details: ", error);
        setAlertMessage('Error fetching user details.'); // Set alert message for error
        setAlertType('error'); // Set alert type to 'error'
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:8000/api/token/', {
      username: formData.username,
      password: formData.password
    })
      .then(res => {
        const token = res.data.access;
        localStorage.setItem('token', token);
        console.log("Token", token);
        setAlertMessage('Login successful!'); // Set alert message for success
        setAlertType('success'); // Set alert type to 'success'
        fetchUserDetails(token);
        if (onSuccess) onSuccess();
        alert(`Generated Token: ${token}`);

      })
      .catch(error => {
        alert('Authentication error ')

        console.error("Authentication error: ", error);
        alert('Authentication error ')
        setAlertMessage('Authentication error. Please check your credentials.'); // Set alert message for error
        setAlertType('error'); // Set alert type to 'error'
      });
  };

  return (
    <div>
      {alertMessage && (
        <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {alertMessage}
        </div>
      )}
      <LoginComponent
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        setVisibleForm={setVisibleForm}
      />
    </div>
  );
};

LoginContainerForm.propTypes = {
  setVisibleForm: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default LoginContainerForm;
