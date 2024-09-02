import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './forms.module.css'; // Importing the same CSS module

const AskPermissionDbComp = ({
  handleSubmit,
  dbId,
  setDbId,
  orgId,
  setOrgId,
  permissionId,
  setPermissionId,
  selectedDataset,
  organization,
  grpUsers,
  selectedGroup, 
  setSelectedGroup 
}) => {
  const [dataTitles, setDataTitles] = useState([]);
  const [permissionNames, setPermissionNames] = useState([]);
  const [dataType, setDataType] = useState(''); // Initially empty

  const haveUsersGrp = grpUsers.length > 0;

  useEffect(() => {
    if (selectedDataset && selectedDataset.id !== '') {
      setDbId(selectedDataset.id.toString()); // Ensure dbId is a string
      setDataType('dataset');
    } else if (organization) {
      setOrgId(organization.id.toString()); // Ensure orgId is a string
      setDataType('organization');
    }
  }, [selectedDataset, organization, setDbId, setOrgId]);

  useEffect(() => {
    if (dataType) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:8000/api/ask_db_permission/', {
            params: { type: dataType },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          setDataTitles(response.data.data_titles);
          setPermissionNames(response.data.permission_names);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [dataType]);

  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
        <h3 className={styles.formTitle}>Ask A Permission Request</h3>
        <hr className={styles.formHr} />
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroupForm}>
            <label>{dataType === 'dataset' ? 'Dataset Title:' : 'Organization Name:'}</label>
            <select
              className={styles.formControlForm}
              value={dataType === 'dataset' ? dbId : orgId}
              onChange={(e) => dataType === 'dataset' ? setDbId(e.target.value) : setOrgId(e.target.value)}
              required
            >
              <option value="">Select {dataType === 'dataset' ? 'Dataset' : 'Organization'}</option>
              {dataTitles.map(data => (
                <option key={data.id} value={data.id}>{data.title}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroupForm}>
            <label>Permission Name:</label>
            <select
              className={styles.formControlForm}
              value={permissionId}
              onChange={(e) => setPermissionId(e.target.value)}
              required
            >
              <option value="">Select Permission</option>
              {permissionNames.map(permission => (
                <option key={permission.id} value={permission.id}>{permission.name}</option>
              ))}
            </select>
          </div>
          {haveUsersGrp && (
            <div className={styles.formGroupForm}>
              <label>Group of Users:</label>
              <select
                className={styles.formControlForm}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select Group</option>
                {grpUsers.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className={styles.btnPrimary}>Ask Permission</button>
        </form>
      </div>
    </div>
  );
};

AskPermissionDbComp.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  dbId: PropTypes.string.isRequired,
  setDbId: PropTypes.func.isRequired,
  orgId: PropTypes.string.isRequired,
  setOrgId: PropTypes.func.isRequired,
  permissionId: PropTypes.string.isRequired,
  setPermissionId: PropTypes.func.isRequired,
  selectedDataset: PropTypes.object,
  organization: PropTypes.object,
  grpUsers: PropTypes.array.isRequired,
  selectedGroup: PropTypes.string,
  setSelectedGroup: PropTypes.func
};

export default AskPermissionDbComp;
