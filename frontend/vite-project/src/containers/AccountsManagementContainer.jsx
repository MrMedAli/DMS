// src/containers/AccountsManagementContainer.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import AccountsManagement from '../components/AccountsManagementComp';

const AccountsManagementContainer = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    fetchAccounts();
  }, []);
 const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/accounts_management/', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAccounts(response.data.accounts);
      setLoading(false);
    } catch (err) {
      setError(err);
      console.error('Error fetching accounts:', err);
      setLoading(false);
    }
  };
  const updateAccount = async (accountId) => {
   try {
       const token = localStorage.getItem('token');
      if (!accountId) {
        throw new Error("Account ID is undefined");
      }
     
      const response = await axios.post(`http://localhost:8000/api/update_account/${accountId}/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Account details:', response.data);
    } catch (err) {
      setError(err);
      console.error('Error updating account:', err);
    }
  };

  return (
    <AccountsManagement 
      accounts={accounts} 
      loading={loading} 
      error={error}
      updateAccount={updateAccount}
    
    />
  );
};

export default AccountsManagementContainer;