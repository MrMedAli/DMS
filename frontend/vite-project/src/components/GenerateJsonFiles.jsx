import { useState } from 'react';
import { Button, Card, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './UsersGrp.css'; // Import the updated CSS file
import styles from './Organization.module.css'; // Import CSS Module

const KeyValueForm = () => {
  const [fields, setFields] = useState([{ key: '', value: '' }]);
  const [downloadLink, setDownloadLink] = useState(null);

  const handleAddField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newFields = fields.map((field, i) => {
      if (i === index) {
        return { ...field, [name]: value };
      }
      return field;
    });
    setFields(newFields);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const keys = fields.map(field => field.key);
    const values = fields.map(field => field.value);
    
    try {
      const response = await axios.post('http://localhost:8000/api/generate-json/', { key: keys, value: values }, {
        responseType: 'blob', // Important for file download
      });
      
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadLink(url);
    } catch (error) {
      console.error('Error generating JSON:', error);
    }
  };

  return (
    <div className="cardJsonFile ">

    <div className="page-container ">
      <Card className="groups-table-pageJson">
      <Card.Body>
        <div className="key-value-form-title">

        <h2 className="sectionTitle">   
            <i className="bi bi-braces-asterisk" aria-hidden="true"></i> &nbsp; Generate JSON File
          </h2>


         
        </div>
        <hr />
          <Form id="key-value-form" onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <Row key={index} className="mb-3">
              <Col>
                <Form.Control
                  className="custom-input-key"
                  type="text"
                  name="key"
                  placeholder="Key"
                  value={field.key}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                />
              </Col>
              <Col>
                <Form.Control
                  className="custom-input-value"
                  type="text"
                  name="value"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                />
              </Col>
              <Col xs="auto">
                <div className="btn-group">
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => handleRemoveField(index)}
                  >
                    -
                  </Button>  &nbsp; &nbsp;
                  <Button
                    variant="primary"
                    type="button"
                    onClick={handleAddField}
                  >
                    +
                  </Button>
                </div>
              </Col>
            </Row>
            
            ))}
            <Button type="submit" className={styles.createOrgButton}>
              Generate
            </Button>
          </Form>
          {downloadLink && (
            <a href={downloadLink} download="data.json" className="btn btn-success mt-3">
              Download JSON
            </a>
          )}
        </Card.Body>
      </Card>
    </div>
    </div>

  );
};

export default KeyValueForm;
