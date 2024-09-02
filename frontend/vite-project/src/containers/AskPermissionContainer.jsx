import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AskPermissionDb from '../components/AskPermissionDbComp';

const AskPermissionContainer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedDataset, organization, selectedOrganizations } = location.state || {};
    
    // Determine the organization to use, prioritizing `organization` if it exists
    const [org] = useState(
        organization || selectedOrganizations || {}
    );

    const [dbId, setDbId] = useState(selectedDataset ? selectedDataset.id.toString() : '');
    const [orgId, setOrgId] = useState(
        org.id ? org.id.toString() : ''
    );
    const [permissionId, setPermissionId] = useState('');
    const [grpUsers, setGrpUsers] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(''); // Add state for selected group

    console.log('orgId from ask permission', orgId, 'selectedOrganizations: ', selectedOrganizations);
    console.log('selectedDataset from ask permission', selectedDataset);
    console.log('organization from ask permission', org);
    
    console.log("orgId",orgId,"dbId",dbId)
    
    useEffect(() => {
        // Fetch group names
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8000/api/groups/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch group names');
                }

                const data = await response.json();
                setGrpUsers(data);
            } catch (error) {
                console.error('Error fetching group names:', error);
            }
        };

        fetchGroups();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            

            const endpoint = orgId
                ? `http://localhost:8000/api/ask_org_permission/${orgId}/`
                : `http://localhost:8000/api/ask_db_permission/${dbId}/`;

            const response = await axios.post(endpoint, {
                permission_name: permissionId,
                grp_id: selectedGroup // Include the selected group ID
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("Response data:", response.data); // Handle success response
            alert(`Request sent to ${response.data.message}`);
            navigate('/graph');
        } catch (error) {
            console.error('Error asking permission:', error); // Handle error
        }
    };

    console.log("organization", org);

    return (
        <div>
            <AskPermissionDb 
                handleSubmit={handleSubmit} 
                dbId={dbId} 
                setDbId={setDbId}
                orgId={orgId}
                setOrgId={setOrgId}
                permissionId={permissionId}
                setPermissionId={setPermissionId}
                selectedDataset={selectedDataset}
                organization={org} // Pass the combined organization state
                grpUsers={grpUsers}
                selectedGroup={selectedGroup} // Pass selectedGroup as a prop
                setSelectedGroup={setSelectedGroup} // Pass setSelectedGroup as a prop
            />
        </div>
    );
};

export default AskPermissionContainer;
