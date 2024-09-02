import NavbarComponent from './NavbarComponent';
import Footer from './Footer';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CustomerInterfaceComp.css';

const CustomerInterface = () => {
  return (
    <div>
      <NavbarComponent userType="customer" />
      <div className="main-content container mt-4">
        <div className="row mt-4">
          <div className="col-md-3">
            <Sidebar />
          </div>
          <div className="col-md-9 customer-content">
            {/* Add your main content here */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerInterface;
