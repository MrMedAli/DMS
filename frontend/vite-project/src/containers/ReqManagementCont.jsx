import { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import ListReqComp from '../components/ListReqComp';
import AppContext from '../components/AppContext';


const ReqManagementCont = () => {
  const { user } = useContext(AppContext);
  const location = useLocation();
  const { selectedDataset, selectedOrg, userRequests  } = location.state || {};
  console.log("tststtst",userRequests)



  const datasetId = selectedDataset?.id;
  const orgId = selectedOrg?.id;

  const [requests, setRequests] = useState(userRequests);

  console.log("req value ", requests)  
  
  useEffect(() => {
    if (datasetId) {
      fetchRequests(datasetId, 'dataset');
    } else if (orgId) {
      fetchRequests(orgId, 'org');
    }
  }, [datasetId, orgId]);

  const fetchRequests = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';

      if (type === 'dataset') {
        endpoint = `http://localhost:8000/api/req_access_controls/dataset/${id}/`;
      } else if (type === 'org') {
        endpoint = `http://localhost:8000/api/req_access_controls/org/${id}/`;
      } else {
        console.error('Invalid type provided:', type);
        return;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setRequests(response.data);
      } else {

        console.error('Failed to fetch requests:', response.data);
      }

    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };
     console.log("reqreq", requests)  






  const handleActionChange = async (requestId, newAction) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8000/api/req_access_controls/${requestId}/`, {
        action: newAction
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
        
      if (response.status === 200) {
        const updatedRequests = requests.map(req => {
          if (req.id === requestId) {
            return { ...req, action: newAction };
          }
          return req;
        });
        setRequests(updatedRequests);
      } else {
        console.error('Failed to update request action on server:', response.data);
        // Optionally, rollback to previous state if update fails
        setRequests(requests);
      }
    } catch (error) {
      console.error('Error updating request action:', error);
      // Optionally, rollback to previous state if update fails
      setRequests(requests);
    }
  };


  return (
    <ListReqComp
      requests={requests}
      fetchRequests={fetchRequests}
      handleActionChange={handleActionChange}
      user={user}

    />
  );
};

export default ReqManagementCont;
