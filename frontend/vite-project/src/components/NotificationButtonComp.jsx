import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import './NotificationButton.css';

const NotificationButton = ({ datasetId, selectedDataset, userId, userRole, selectedOrg, orgId ,userIdOrg 
}) => {




const [userRequests, setUserRequests] = useState({
    dataset_requests: [],
    org_requests: []
});
const [requestCount, setRequestCount] = useState(0);

    const navigate = useNavigate();
    
    

    
    useEffect(() => {
        const fetchRequestCount = async () => {
            try {
                const token = localStorage.getItem('token');
                let endpoint = '';

                if (selectedDataset) {
                    endpoint = `http://localhost:8000/api/request_count/dataset/${datasetId}/`;
                } else if (selectedOrg) {
                    endpoint = `http://localhost:8000/api/request_count/org/${orgId}/`;
                } else {
                    return;
                }

                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Response data:", response.data.request_count);
                
                setRequestCount(response.data.request_count);
            } catch (error) {
                console.error('Error fetching request count:', error);
            }
        };

        fetchRequestCount();
        const interval = setInterval(fetchRequestCount, 60000); // Poll every minute
        return () => clearInterval(interval); // Clear interval on component unmount
    }, [datasetId, selectedDataset, orgId, selectedOrg]);


const fetchUserRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            let response;
            let totalRequestCount = 0;

            if (userId) {
                response = await axios.get(`http://localhost:8000/api/user_requests/${userId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserRequests({
                    dataset_requests: response.data.dataset_requests,
                    org_requests: []
                });
                totalRequestCount += response.data.dataset_request_count;
            } else if (userIdOrg) {
                response = await axios.get(`http://localhost:8000/api/user_requests/${userIdOrg}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserRequests({
                    dataset_requests: [],
                    org_requests: response.data.org_requests 
                });
                totalRequestCount += response.data.org_request_count;
            }

            setRequestCount(totalRequestCount);
        } catch (error) {
            console.error('Error fetching user requests:', error);
        }
    };

    // console.log("userRequests", userRequests);

    useEffect(() => {
        if (userId || userIdOrg) {
            fetchUserRequests();
            const interval = setInterval(fetchUserRequests, 60000); // Poll every minute
            return () => clearInterval(interval); // Clear interval on component unmount
        }
    }, [userId, userIdOrg]);




    // console.log("userRequests", userRequests)
    
    const handleFetchUserRequestsClick = async () => {
        await fetchUserRequests();
        setRequestCount(0); // Reset the request count
        navigate('/req_list', { state: { selectedDataset, userRequests, userId, userRole ,selectedOrg} });
    };

    const handleRequestsClick = () => {
        navigate('/req_list', { state: { selectedDataset , selectedOrg  } });
    };

// console.log("bbbb",userRequests.dataset_requests)
// console.log("bbbb",userRequests.org_requests)

return (
    <div className="notification-button-container">
        {userId || userIdOrg ? (
            <button
                onClick={handleFetchUserRequestsClick}
                className="btn btn-primary notification-button"
            >
                Approved Requests  &nbsp;  <i className="bi bi-card-checklist"></i>
                {userRequests.dataset_requests.length > 0 && (
                    <span className="notification-badge">{userRequests.dataset_requests.length}</span>
                )}
                {userRequests.org_requests.length > 0 && (
                    <span className="notification-badge">{userRequests.org_requests.length}</span>
                )}
            </button>
        ) : (
            <button
                onClick={handleRequestsClick}
                className="btn btn-primary notification-button"
            >
                Requests &nbsp; <i className="bi bi-card-list"></i>
                {requestCount > 0 && (
                    <span className="notification-badge">{requestCount}</span>
                )}
            </button>
        )}
    </div>
);
};

NotificationButton.propTypes = {
    datasetId: PropTypes.number.isRequired,
    selectedDataset: PropTypes.object.isRequired,
    userId: PropTypes.object, // userId should be an object containing username and role
    userRole: PropTypes.string,
     userIdOrg: PropTypes.object, // userId should be an object containing username and role
    userRoleOrg: PropTypes.string, // userRole should be a string
    selectedOrg: PropTypes.object.isRequired,
    orgId: PropTypes.number.isRequired,

};

export default NotificationButton;
