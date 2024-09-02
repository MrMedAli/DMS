import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import styles from './forms.module.css'; // Importing CSS module

const CreateDataset_2 = ({ formData, onChange, onSubmit, onBack }) => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    const formDataStep1 = JSON.parse(localStorage.getItem('formDataStep1'));
    console.log('Form data from Step 1:', formDataStep1);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    onChange(e);

    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      onChange({
        target: {
          name: 'format',
          value: fileExtension,
        },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('format', formData.format);
    formDataToSend.append('File_name', formData.File_name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('version', formData.version);

    if (file) {
      formDataToSend.append('file', file);
    }
    formDataToSend.append('creator', formData.creatorId);

    try {
      await onSubmit(formDataToSend);
      window.location.href = '/dataset_management';
    } catch (error) {
      console.error('Error creating dataset:', error);
    }
  };

  return (
    <div className={styles.pageContainerForm}>
      <div className={styles.formContainerForm}>
        
        <h3>Add Data</h3>
        <h5>Start adding the required details for your DB</h5>
        <hr className={styles.formHr} />
        <form onSubmit={handleSubmit} autoComplete="off" encType="multipart/form-data">
          <div className={styles.formGroupForm}>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              className={styles.formControlForm}
            />
          </div>

          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="format"
              placeholder="Format"
              value={formData.format}
              onChange={onChange}
              className={styles.formControlForm}
              required
            />
          </div>

          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="File_name"
              placeholder="File Name"
              value={formData.File_name}
              onChange={onChange}
              className={styles.formControlForm}
            />
          </div>

          <div className={styles.formGroupForm}>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={onChange}
              className={styles.formControlForm}
              required
            />
          </div>

          <div className={styles.formGroupForm}>
            <input
              type="text"
              name="version"
              placeholder="Version"
              value={formData.version}
              onChange={onChange}
              className={styles.formControlForm}
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button type="button" className={styles.returnB} onClick={onBack}>
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateDataset_2.propTypes = {
  formData: PropTypes.shape({
    format: PropTypes.string,
    File_name: PropTypes.string,
    description: PropTypes.string,
    version: PropTypes.string,
    creatorId: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

export default CreateDataset_2;
