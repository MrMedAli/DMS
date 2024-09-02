import { useState, useEffect, useContext } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import UsersGrpComponent from '../components/UsersGrp';
import GroupsTable from '../components/ListGrp';
import AppContext from '../components/AppContext';

const UsersGrpCont = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { isUpdateMode, selectedgrp } = location.state || {};

  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [message] = useState('');
  const [admin, setAdmin] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const usersResponse = await axios.get('http://localhost:8000/api/users/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setMembers(usersResponse.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        setMembers([]);
      }
    };

    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/groups/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("eee",response.data)
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
      }
    };

    fetchUsers();
    fetchGroups();
    // setAdmin(user);
     }, [user]);

  
useEffect(() => {
  const fetchGroupDetails = async () => {
    if (isUpdateMode && selectedgrp) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/group_details/${selectedgrp}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const groupData = response.data;
        setGroupName(groupData.name);
        setSelectedMembers(groupData.members);
        setAdmin(groupData.admin_grp);
      } catch (error) {
        console.error('Error fetching group details:', error);
        setGroupName('');
        setSelectedMembers([]);
        setAdmin(user);
      }
    } else {
      setAdmin(user);
    }
  };

  fetchGroupDetails();
}, [isUpdateMode, selectedgrp, user]);

      

      

  const handleInputChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleSelectChange = (members) => {
    setSelectedMembers(members);
  };


  
  const handleDeleteGrp = async (groupId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8000/api/groups/${groupId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setGroups(groups.filter((group) => group.id !== groupId));
      alert('Group deleted');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const payload = {
      name: groupName,
      members: selectedMembers, 
      admin: user,
    };
    console.log("admin", admin, "members", members, "admin", admin)
    
    const response = isUpdateMode && selectedgrp
      ? await axios.put(`http://localhost:8000/api/groups/${selectedgrp}/`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      : await axios.post('http://localhost:8000/api/groups/', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

    alert(isUpdateMode ? 'Group of users updated successfully!' : 'Group of users created successfully!');
    console.log('Group of users:', response.data);
    navigate('/users_grp/listgrp');
  } catch (error) {
    alert('Error processing request.');
    console.error('Error:', error);
  }
};


  console.log('admin', admin);

  return (
    <Routes>
      <Route
        path="create-usersgrp"
        element={
          <UsersGrpComponent
            groupName={groupName}
            admin={admin}
            members={members}
            selectedMembers={selectedMembers}
            message={message}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleSubmit={handleSubmit}
            isUpdateMode={isUpdateMode}
          />
        }
      />
      <Route
        path="listgrp"
        element={
          <GroupsTable
            groups={groups}
            handleDeleteGrp={handleDeleteGrp}
            isAdmin={admin && admin.role === 'admin'}
          />
        }
      />
    </Routes>
  );
};

export default UsersGrpCont;
