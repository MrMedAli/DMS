// UpdateAccountContainer.js

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UpdateAccountComp from '../components/UpdateAccountComp'; // Updated import name
import AppContext from '../components/AppContext';

const UpdateAccountContainer = () => {
  const navigate = useNavigate();
  const { selectedAccount, setSelectedAccount } = useContext(AppContext);
  console.log("sssssssssss",selectedAccount)

  const [formData, setFormData] = useState({
    id: '',
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    is_active: true,
    groups: ''
  });

  const [authRole, setAuthRole] = useState(null); // State to store auth role

  const fetchAuthRole = async () => { // Define fetchAuthRole outside useEffect
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/users/role/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const role = response.data.role;
      setAuthRole(role);
      console.log('Authentication role:', role);
      return role;
    } catch (err) {
      console.error('Error fetching auth role:', err);
      return null;
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      setFormData({
        id: selectedAccount.id,
        username: selectedAccount.username,
        first_name: selectedAccount.first_name,
        last_name: selectedAccount.last_name,
        email: selectedAccount.email,
        password: '',
        role: selectedAccount.role,
        is_active: selectedAccount.is_active,
        groups: selectedAccount.groups.join(', ')
      });
    }
  }, [selectedAccount]);

  useEffect(() => {
    fetchAuthRole(); // Call fetchAuthRole in useEffect
  }, []);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const accountId = formData.id;
    
    // Create the updated data payload
    const updatedData = {
      ...formData,
      role: formData.groups // Map 'groups' to 'role'
    };

    const response = await axios.put(`http://localhost:8000/users/${accountId}/`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Account updated:', response.data);
    alert('Account updated successfully');
    setSelectedAccount(null);
    navigate('/accounts_management');
  } catch (err) {
    console.error('Error updating account:', err);
    alert('Error updating account');
  }
};

  return (
    <UpdateAccountComp
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      authRole={authRole} // Pass authRole as a prop
    />
  );
};

export default UpdateAccountContainer;
