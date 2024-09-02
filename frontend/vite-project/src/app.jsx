import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import RegisterContainerForm from './containers/RegisterContainer';
import LoginContainerForm from './containers/LoginContainer';
import AccountsManagementContainer from './containers/AccountsManagementContainer';
import UpdateAccountContainer from './containers/UpdateAccountContainer';
import { AppProvider } from './components/AppContext';
import CustomerInterface from './components/CustomerInterfaceComp';
import CreateAccountContainer from './containers/CreateAccountCont';
import DatasetDetailsContainer from './containers/DatasetDetailsCont';
import AskPermissionContainer from './containers/AskPermissionContainer';
import ReqManagementCont from './containers/ReqManagementCont';
import UsersGrpCont from './containers/UsersGrpCont';
import KeyValueForm from './components/GenerateJsonFiles';
import GrpDataContainer from './containers/GrpDataCont';
import OrganizationContainer from './containers/OrgCont';
import HomePage from './components/Home';
import CreateDatasetContainer from './containers/CreateDatasetContainer';
import Graphs from './components/Graphs';


// eslint-disable-next-line react/prop-types
const MainLayout = ({ children }) => {
  const location = useLocation();
  const showSidebar = !['/login','/', '/register'].includes(location.pathname);

  return (
    <div className="main-layout">
      {showSidebar && <Sidebar />}
      <div className={`content ${showSidebar ? '' : 'full-width-content'}`}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="app-container">
      <Router>
        <AppProvider>
          <NavbarComponent />
          
          <MainLayout>
            
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/graph" element={<Graphs />} />
              <Route path="/login" element={<LoginContainerForm />} />
              <Route path="/register" element={<RegisterContainerForm />} />
              <Route path="/organizations/*" element={<OrganizationContainer />} />
              <Route path="/generate_json_files" element={<KeyValueForm />} />
              <Route path="/ask_db_permission" element={<AskPermissionContainer />} />
              <Route path="/req_list" element={<ReqManagementCont />} />
              <Route path="/dashboard" element={<CustomerInterface />} />
              <Route path="/accounts_management" element={<AccountsManagementContainer />} />
              <Route path="/update_account" element={<UpdateAccountContainer />} />
              <Route path="/create_account" element={<CreateAccountContainer />} />
              <Route path="/datasets" element={<DatasetDetailsContainer />} />
              <Route path="/users_grp/*" element={<UsersGrpCont />} />
              <Route path="/grp_data/*" element={<GrpDataContainer />} />
              <Route path="/*" element={<CreateDatasetContainer />} />
            </Routes>
          </MainLayout>
          <Footer />
        </AppProvider>
      </Router>
    </div>
  );
};

export default App;
