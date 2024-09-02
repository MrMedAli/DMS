import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Graphs.css';
import Footer from './Footer';

const Graphs = () => {
  const [orgRequestCount, setOrgRequestCount] = useState(null);
  const [datasetRequestCount, setDatasetRequestCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [fileCount, setFileCount] = useState(null); // State for file count
  const [organizationData, setOrganizationData] = useState([]);
  const [groupDatasetData, setGroupDatasetData] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingGroupData, setLoadingGroupData] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true); // Loading state for file count
  const [requestError, setRequestError] = useState(null);
  const [userError, setUserError] = useState(null);
  const [organizationError, setOrganizationError] = useState(null);
  const [groupDatasetError, setGroupDatasetError] = useState(null);
  const [fileError, setFileError] = useState(null); // Error state for file count

  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/count-requests/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setOrgRequestCount(response.data.org_requests_message);
        setDatasetRequestCount(response.data.dataset_requests_message);
      } catch (err) {
        setRequestError('No requests found');
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequestCount();
  }, []);
  useEffect(() => {
    const fetchFileCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/file-count/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFileCount(response.data.user_files_count); // Adjust based on API response
        console.log('FileCount',fileCount)
      } catch (err) {
        setFileError('Failed to fetch file count');
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFileCount();
  }, []);
  

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get('http://localhost:8000/api/count-auth-users/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserCount(userResponse.data.user_count);
      } catch (err) {
        setUserError('Failed to fetch user count');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUserCount();
  }, []);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const token = localStorage.getItem('token');
        const organizationResponse = await axios.get('http://localhost:8000/api/dataset-count-per-organization/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setOrganizationData(organizationResponse.data);
      } catch (err) {
        setOrganizationError('Failed to fetch organization data');
      } finally {
        setLoadingOrganizations(false);
      }
    };
    fetchOrganizationData();
  }, []);

  useEffect(() => {
    const fetchGroupDatasetData = async () => {
      try {
        const token = localStorage.getItem('token');
        const groupDatasetResponse = await axios.get('http://localhost:8000/api/dataset-count-per-group/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setGroupDatasetData(groupDatasetResponse.data);
      } catch (err) {
        setGroupDatasetError('Failed to fetch group dataset data');
      } finally {
        setLoadingGroupData(false);
      }
    };
    fetchGroupDatasetData();
  }, []);

  const customBarData = {
    labels: groupDatasetData.map(group => group.group_name),
    datasets: [
      {
        data: groupDatasetData.map(group => group.dataset_count),
        backgroundColor: groupDatasetData.map((group, index) => {
          if (index % 3 === 0) return '#ffc107';  // Yellow (Bootstrap warning color)
          if (index % 3 === 1) return '#28a745';  // Green (Bootstrap success color)
          return 'rgba(0, 123, 255, 0.6)';        // Blue with opacity (Bootstrap primary color)
        }),
        borderColor: groupDatasetData.map((group, index) => {
          if (index % 3 === 0) return '#ffc107';  // Yellow (Bootstrap warning color)
          if (index % 3 === 1) return '#28a745';  // Green (Bootstrap success color)
          return '#007bff';                       // Blue (Bootstrap primary color)
        }),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: 'Dataset Count',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Groups', // Optional: Label for x-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend since we removed the dataset label
      },
    },
  };

  const customPieData = {
    labels: organizationData.map(org => org.organization),
    datasets: [
      {
        data: organizationData.map(org => org.dataset_count),
        backgroundColor: [
          'rgba(255, 53, 69, 1)',   // Red
          'rgba(255, 193, 7, 0.6)',   // Yellow
          'rgba(40, 167, 69, 0.6)',   // Green
          'rgba(0, 123, 255, 0.6)',   // Blue
          'rgba(32, 201, 151, 0.6)',  // Teal
          'rgba(255, 193, 7, 0.4)',   // Lighter Yellow
          'rgba(40, 167, 69, 0.4)',   // Lighter Green
          'rgba(0, 123, 255, 0.4)',   // Lighter Blue
        ],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="card-container">
          <div className="card">
            <div className="card-header">Request Number</div>
            <div className="card-body">
              {loadingRequests ? (
                <h3>Loading...</h3>
              ) : requestError ? (
                <h3>{requestError}</h3>
              ) : (
                <>
                  <h3>{orgRequestCount} Request(s) / Organization</h3>
                  <h3>{datasetRequestCount} Request(s) / Dataset</h3>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">Followers</div>
            <div className="card-body">
              {loadingUsers ? (
                <h3>Loading...</h3>
              ) : userError ? (
                <h3>{userError}</h3>
              ) : (
                <h3>{userCount}</h3>
              )}
              <small>Just Updated</small>
            </div>
          </div>

          {/* New Card for Uploaded Files */}
          <div className="card">
          <div className="card-header">Uploaded Files</div>
  <div className="card-body">
    {loadingFiles ? (
      <h3>Loading...</h3>
    ) : fileError ? (
      <h3>{fileError}</h3>
    ) : (
      <h3>{fileCount} Files</h3> // Displaying the total count of files
    )}
  </div>

        </div> 
        </div>

        <div className="chart-container-custom">
          <div className="chart">
            <h3>Dataset per Group</h3>
            {loadingGroupData ? (
              <h3>Loading...</h3>
            ) : groupDatasetError ? (
              <h3>{groupDatasetError}</h3>
            ) : (
              <Bar data={customBarData} options={options} />
            )}
          </div>

          <div className="chart-org">
              <div className="chart-title">
                <h3>Organization per Dataset</h3> 
              </div>
              {loadingOrganizations ? (
                <h3>Loading...</h3>
              ) : organizationError ? (
                <h3>{organizationError}</h3>
              ) : (
                <Pie data={customPieData} />
              )}
            </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Graphs;
