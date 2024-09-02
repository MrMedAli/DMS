import  { useState } from 'react';
import axios from 'axios';
import CreateAccountForm from '../components/CreateAccountComp';
import { useNavigate } from 'react-router-dom';

const CreateAccountContainer = () => {
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'customer', // Default role
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });   
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/users/', formData);
      onAccountCreated(response.data);
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'customer', // Reset role to default
        is_active: true
      });
    } catch (err) {
    alert('Account created successfully!');
    }
            navigate('/graph');

  };


  const onAccountCreated = (data) => {
    console.log('Account created:', data);
    alert('Account created successfully!');
    // navigate('/admin_interface');
        navigate('/graph');

  };

  return (
    <CreateAccountForm
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
};

export default CreateAccountContainer;
