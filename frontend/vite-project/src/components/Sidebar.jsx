import { Link, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation(); // Get the current path

  return (
    <div className="sidebar">
      <Link
        to="/graph"
        className={`btn custom-btn m-2 ${location.pathname === '/graph' ? 'selected' : ''}`}
      >
        Dashboard <i className="fa fa-chart-line" aria-hidden="true"></i>
      </Link>
      <Link
        to="/dataset_management"
        className={`btn custom-btn m-2 ${location.pathname === '/dataset_management' ? 'selected' : ''}`}
      >
        Datasets <i className="fa fa-plus-circle" aria-hidden="true"></i>
      </Link>


      <Link
        to="/grp_data/grp_data_list"
        className={`btn custom-btn m-2 ${location.pathname === '/grp_data/grp_data_list' ? 'selected' : ''}`}
      >
        Grp_of_Datasets <i className="fa fa-plus-circle" aria-hidden="true"></i>
      </Link>
      <Link
        to="/organizations/org_management"
        className={`btn custom-btn m-2 ${location.pathname === '/organizations/org_management' ? 'selected' : ''}`}
      >
        Organization <i className="fa fa-plus-circle" aria-hidden="true"></i>
      </Link>
      
      <Link
        to="/generate_json_files"
        className={`btn custom-btn m-2 ${location.pathname === '/generate_json_files' ? 'selected' : ''}`}
      >
        Generate JSON Files <i className="fa fa-plus-circle" aria-hidden="true"></i>
      </Link>
      <Link
        to="/users_grp/listgrp"
        className={`btn custom-btn m-2 ${location.pathname === '/users_grp/listgrp' ? 'selected' : ''}`}
      >
        Users Group <i className="fa fa-plus-circle" aria-hidden="true"></i>
      </Link>

    </div>
  );
};

export default Sidebar;
