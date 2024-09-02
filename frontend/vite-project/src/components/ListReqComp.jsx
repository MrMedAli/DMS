import PropTypes from 'prop-types';
import {  useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import styles from './Organization.module.css'; // Import CSS Module

const ListReqComp = ({ requests, handleActionChange, user }) => {
    const navigate = useNavigate();

  
    // Log the type of requests
    const typreq = typeof requests;
    const isArray = Array.isArray(requests);
    console.log("typreq:", typreq, "isArray:", isArray);
    console.log("requests:", requests);

    if (!requests || typeof requests !== 'object') {
        console.error("requests is not a valid object", requests);
        return null; // or some fallback UI
    }

    // Normalize requests to be a single array
    let requestList = [];
    if (isArray) {
        requestList = requests;
    } else {
        for (const key in requests) {
            if (Array.isArray(requests[key])) {
                requestList = requestList.concat(requests[key]);
            }
        }
    }

    console.log("Normalized requestList:", requestList);

    // Extract maintainer, asker, and creator data
    const maintainerdata = requestList.map(request => request.maintainer);
    const creatordata = requestList.map(request => request.creator);

    console.log("Maintainer of data:", maintainerdata);
    console.log("Creator of data:", creatordata);

    // Check conditions for readonly status
    const isCreatorOrAdminOrMaintainer =
        creatordata.includes(user.username) ||
        maintainerdata.includes(user.username) ||
        user.role === 'admin';

    console.log("isCreatorOrAdminOrMaintainer:", isCreatorOrAdminOrMaintainer);

    const handleDeleteRequestResponse = async (requestId) => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.delete(`http://localhost:8000/api/delete-request/${requestId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Delete response:", response.data);
            navigate('/dataset_management');
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

    return (
        <div className="cardreq">
            <div className="card-body">

            <h2 className={styles.sectionTitle}>   
            <i className="fa fa-user-secret" aria-hidden="true"></i> &nbsp; List of Requests
          </h2>
                
                <hr />

                <Table className={`${styles.table} table-light table-hover table-bordered`}>
                    <thead className="table-light">
                        <tr>
                            <th>Requester</th>
                            <th>Users_Grp</th>

                            <th>Organizations/Datasets</th>
                            <th>Creator</th>
                            <th>Permission</th>
                            <th>Action</th>
                            {!isCreatorOrAdminOrMaintainer && <th>Delete</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requestList.map(request => (
                            <tr key={request.id}>
                                <td>{request.user}</td>
                                <td>{request.grp_users}</td>

                                <td>{request.org ? request.org : request.data}</td>
                                <td>{request.creator}</td>
                                <td>{request.permission}</td>
                                <td>
                                <select
                                    value={request.action || "non_action"} 
                                    disabled={!isCreatorOrAdminOrMaintainer}
                                    onChange={(e) => handleActionChange(request.id, e.target.value)}
                                 >
                                    <option value="non_action">No Action</option>
                                    <option value="accept">Accept</option>
                                    <option value="deny">Deny</option>
                                 </select>

                                </td>
                                {!isCreatorOrAdminOrMaintainer && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            onChange={() => handleDeleteRequestResponse(request.id)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                     </tbody>
                     </Table>

                  
            </div>
        </div>
    );
};

ListReqComp.propTypes = {
    requests: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    handleActionChange: PropTypes.func.isRequired,
};

export default ListReqComp;