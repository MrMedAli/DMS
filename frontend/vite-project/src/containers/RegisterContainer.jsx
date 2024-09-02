import { useState } from 'react';
import axios from 'axios';
import RegisterComponent from '../components/RegisterComponent';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const RegisterContainerForm = ({ setVisibleForm }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password1: '',
    password2: ''
  });

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.password1 !== formData.password2) {
      alert("Passwords do not match !!.")
      setAlertMessage('Passwords do not match.');
      setAlertType('error');
      return;
    }

    axios.post('http://localhost:8000/api/register/', {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password1: formData.password1,
      password2: formData.password2
    })
    .then(() => {
      alert('Registration successful');
      navigate('/login')
      setAlertType('success');
      setVisibleForm('login');
    })
    .catch(err => {
      setAlertMessage('Registration error: ' + (err.response.data.error || 'Unknown error'));
      setAlertType('error');
    });
  };

  return (
    <div>
      {alertMessage && (
        <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {alertMessage}
        </div>
      )}
      <RegisterComponent
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        setVisibleForm={setVisibleForm}
      />
    </div>
  );
};

RegisterContainerForm.propTypes = {
  setVisibleForm: PropTypes.func,
};
export default RegisterContainerForm;
