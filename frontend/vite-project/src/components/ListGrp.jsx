import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './UsersGrp.css';
import styles from './Organization.module.css'; // Import CSS Module

const GroupsTable = ({ groups, handleDeleteGrp }) => {
    const navigate = useNavigate();

    const handleUpdateClick = (groupId) => {
        navigate(`/users_grp/create-usersgrp/`, { state: { selectedgrp: groupId, isUpdateMode: true } });
    };
    const handleClickreturn = () => {
        navigate('/dashboard', {
        });
      };
    return (
        <div className="page-container">
            <Container className="groups-table-page">
                <h2 className="title">
                    <i className="fa fa-user-secret" aria-hidden="true"></i> &nbsp; List Of Groups
                </h2>
                <Row className="justify-content-center">
                    <Col md={10}>
                        <div className="group-management text-center mb-4">
                            <Link to="/users_grp/create-usersgrp">
                                <Button className="create-group-button">
                                    Create Users Group <i className="fa fa-plus-circle"></i>
                                </Button>
                            </Link>
                        </div>
                        <Table className={`${styles.table} table-light table-hover table-bordered`}>
                        <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Admin</th>
                                    <th>Members</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                            </thead>
                            <tbody>
                                {groups.length > 0 ? (
                                    groups.map((group) => (
                                        <tr key={group.id}>
                                            <td>{group.name}</td>
                                            <td>{group.admin_grp}</td>
                                            <td>
                                                <select className="form-select">
                                                    <option value="" disabled selected>View Members</option>
                                                    {group.members.map((memberId) => (
                                                        <option key={memberId} value={memberId}>
                                                            {memberId}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    <Button
                                                        className={styles.btnuserupdate}
                                                        onClick={() => handleUpdateClick(group.id)}
                                                    >
                                                        Update &nbsp; <i className="fa fa-pencil" aria-hidden="true"></i>
                                                    </Button> &nbsp; &nbsp;
                                                    <Button
                                                        className={styles.btnuserdelete}
                                                        onClick={() => handleDeleteGrp(group.id)}
                                                    >
                                                        Delete &nbsp; <i className="fa fa-trash" aria-hidden="true"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No groups found</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                        <Button                   
                            onClick={handleClickreturn}
                                className="createOrgButton">
                                Return &nbsp; <i className="fa fa-arrow-left" aria-hidden="true"></i>
                            </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

GroupsTable.propTypes = {
    groups: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            admin_grp: PropTypes.string.isRequired,
            members: PropTypes.arrayOf(PropTypes.number).isRequired,
        })
    ).isRequired,
    handleDeleteGrp: PropTypes.func.isRequired,
};

export default GroupsTable;
